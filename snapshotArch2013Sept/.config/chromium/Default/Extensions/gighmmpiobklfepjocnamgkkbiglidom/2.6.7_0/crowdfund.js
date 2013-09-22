/*
  the state machine goes from init => notifying => done

  STATES
  ======
  init: initial state, not showing new or blinking badge for 24 hours
  notifying: campaign is running, show new and blink badge every hour, normal updateBadge turned off
  done: campaign has ended because user clicked button, updateBadge now turned on as usual
*/

var crowdfund = {
  blue: '#1449ef',                        //blue badge color
  red: '#cf0016',                         //red badge color
  badgeText: 'New',                       //text for new badge
  showingNew: false,                      //showing new badge or not
  timerBlink: false,                      //handle to timer for blink badge
  timerNotifying: false,                  //handle to timer to begin notifying (campaign running state)
  storageTag: "crowdFundStatus",          //string for storing state machine
  globalNotificationStart: 1377504000000, //Nobody gets notified before Monday, Aug 26, 4AM EDT (Unix timestamp)
  postInstallDelay: (1000 * 60 * 60 * 24),//This user gets 24 hours before notification
  blinkDelay: (1000 * 60 * 60)            //1 hour between blinking
};

//determine if the campaign is running or not
//this can be found by getting crowdfund.storageTag from storage_get
//the value of storage_get(crowdfund.storageTag) is cached in crowdfund.running
crowdfund.runningCampaign = function() {  
  if (crowdfund.hasOwnProperty("running")) {
    return crowdfund.running;
  } else {
    var status = storage_get(crowdfund.storageTag);
    if (status === undefined) {
      crowdfund.running = false;
    } 
    else if (status.status == "notifying"){
      crowdfund.running = true;
    }
    else {
      crowdfund.running = false;
    }
    return crowdfund.running;
  }
};

//initialize the crowdfunding campaign
//wait 24 hours to begin
crowdfund.init = function() {
  var status = storage_get(crowdfund.storageTag);
  if (status === undefined) { //initialize the state machine
    var today = new Date();
    storage_set(crowdfund.storageTag, {
      status: "init",
      installedAt: today.getTime() 
    });
    crowdfund.setNotifyingTimer();
  } 
  else if (status.status == "init"){ //set timer to begin notifying
    crowdfund.setNotifyingTimer();
  }
  else if (status.status == "notifying") { //campaign is running
    crowdfund.notify();
  } 
  else { //campaign has ended or is in invalid state, return updateBadge to normal functionality
    crowdfund.running = false;
    return; 
  }
};

crowdfund.notify = function() {
  crowdfund.running = true;
  crowdfund.showNew();
  crowdfund.scheduleBlink();
};

//sets timer to switch into notifying state
crowdfund.setNotifyingTimer = function() {
  var status = storage_get(crowdfund.storageTag);
  //if in init state, set a timer to begin the campaign
  if (status.status == "init") {
    var installedAt = status.installedAt;
    var now         = new Date().getTime();

    var localStart  = installedAt + crowdfund.postInstallDelay;
    // The later of the two
    var startTime   = Math.max(localStart, crowdfund.globalNotificationStart);

    // 0 milliseconds if start time was in past
    var remainingTime = Math.max(startTime - now, 0);

    crowdfund.timerNotifying = setTimeout(crowdfund.startCampaign, remainingTime);
  }
};

crowdfund.startCampaign = function() {
  var status = storage_get(crowdfund.storageTag);
  status.status = "notifying";
  storage_set(crowdfund.storageTag, status);
  crowdfund.notify();
};

//badge text becomes "New" and badge becomes blue
crowdfund.showNew = function(callback) {
  if (crowdfund.runningCampaign() && !crowdfund.showingNew) {
    crowdfund.eachTab(function(tabID) {
      chrome.browserAction.setBadgeText({text: crowdfund.badgeText, tabId: tabID});
      chrome.browserAction.setBadgeBackgroundColor({color: crowdfund.blue, tabId: tabID});
    });
    chrome.browserAction.setBadgeText({text: crowdfund.badgeText});
    chrome.browserAction.setBadgeBackgroundColor({color: crowdfund.blue});
  }
};

//end the crowdfunding campaign
crowdfund.done = function() {
  var status = storage_get(crowdfund.storageTag);
  crowdfund.running = false;
  status.status = "done";
  storage_set(crowdfund.storageTag, status);
      if (crowdfund.timerBlink) {
    clearTimeout(crowdfund.timerBlink);
  }
  if (crowdfund.timerNotifying) {
    clearTimeout(crowdfund.timerNotifying); 
  }
  chrome.browserAction.setBadgeBackgroundColor({color: "#555"});
  chrome.browserAction.setBadgeText({text: ""});
  var BG = chrome.extension.getBackgroundPage();
  crowdfund.eachTab(function(tabID) {
    chrome.browserAction.setBadgeBackgroundColor({color: "#555", tabId: tabID});
    BG.updateBadge(tabID);
  });
};

crowdfund.scheduleBlink = function() {
  if (!crowdfund.runningCampaign()) { return; }
  var data          = storage_get(crowdfund.storageTag);
  var lastBlinkTime = data.lastBlink;
  if (lastBlinkTime) {
    var now           = new Date().getTime();
    var elapsedTime   = now - lastBlinkTime;
    var remainingTime = crowdfund.blinkDelay - elapsedTime;
    // Must be somewhere between 0 and our time to wait
    remainingTime     = Math.max(remainingTime, 0);
    remainingTime     = Math.min(remainingTime, crowdfund.blinkDelay);
  } else  {
    remainingTime = 0;
  }
  crowdfund.timerBlink = setTimeout(function(){crowdfund.blinkNthTime(1);}, remainingTime);
};

crowdfund.blinkNthTime = function(iteration){
  if (!crowdfund.runningCampaign()) { return; }
  if (iteration == 1) {
    var data = storage_get(crowdfund.storageTag);
    data.lastBlink = new Date().getTime(); // now
    storage_set(crowdfund.storageTag, data);
  }
  var newColor = iteration % 2 === 0 ? crowdfund.blue : crowdfund.red;
  crowdfund.eachTab(function(tabID) {
    chrome.browserAction.setBadgeBackgroundColor({color: newColor, tabId: tabID});
  });
  if (iteration < 6) {
    setTimeout(function(){crowdfund.blinkNthTime(iteration + 1);}, 400);
  } else {
    // Ensure we end on blue
    chrome.browserAction.setBadgeBackgroundColor({color: crowdfund.blue});
    crowdfund.scheduleBlink();
  }
};

crowdfund.eachTab = function(callback) {
  chrome.tabs.query({}, function(tabs){
    for (var i = 0; i < tabs.length; i++) {
      callback.call(crowdfund, tabs[i].id);
    }
  });
};
