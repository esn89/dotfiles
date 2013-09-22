// Copyright 2013 Google Inc. All Rights Reserved.

function startPaymentFlow(msg, appId, callback, windowCallback) {
  chrome.app.window.create('main.html',
      {'defaultWidth': 480, 'defaultHeight': 420, 'frame': 'none',
       'resizable': false},
      function(win) {
        if (windowCallback) windowCallback(win);
        win.contentWindow.addEventListener('load', function() {
          win.contentWindow.inapp.chrome.startPaymentFlow(msg.jwt,
                                                          msg.parameters,
                                                          appId);
        });
        win.onClosed.addListener(function() {
          var result = win.contentWindow['purchase_result'];
          if (!result) result = {
            'request': {},
            'response': {'errorType': 'PURCHASE_CANCELED'}
          };
          if (!('response' in result)) {
            result['response'] = {'errorType': 'PURCHASE_CANCELED'};
          }
          callback(result);
        });
      });
}

chrome.runtime.onConnectExternal.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    startPaymentFlow(msg, port.sender.id, function(result) {
      port.postMessage(result);
      port.disconnect();
    }, function(win) {
      port.onDisconnect.addListener(function() {
        win.close();
      });
    });
  });
});
