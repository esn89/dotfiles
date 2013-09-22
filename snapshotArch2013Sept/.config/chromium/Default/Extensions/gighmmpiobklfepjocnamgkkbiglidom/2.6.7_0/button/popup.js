var BG = chrome.extension.getBackgroundPage();

BG.crowdfund.done();

// Set menu entries appropriately for the selected tab.
function customize_for_this_tab() {
  $(".menu-entry, .separator").hide();

  BG.getCurrentTabInfo(function(info) {
    var shown = {};
    function show(L) { L.forEach(function(x) { shown[x] = true;  }); }
    function hide(L) { L.forEach(function(x) { shown[x] = false; }); }

    show(["div_options", "separator2"]);
    var paused = BG.adblock_is_paused();
    if (paused) {
      show(["div_status_paused", "separator0", "div_options"]);
    } else if (info.disabled_site) {
      show(["div_status_disabled", "separator0", "div_pause_adblock", 
            "div_options", "div_help_hide_start"]);
    } else if (info.whitelisted) {
      show(["div_status_whitelisted", "div_show_resourcelist", 
            "separator0", "div_pause_adblock", "separator1", 
            "div_options", "div_help_hide_start"]);
    } else {
      show(["div_pause_adblock", "div_blacklist", "div_whitelist", 
            "div_whitelist_page", "div_show_resourcelist", 
            "div_report_an_ad", "separator1", "div_options", 
            "div_help_hide_start", "separator3","block_counts", "div_crowdfund_text"]);
      
      var page_count = info.tab_blocked || "0";
      $("#page_blocked_count").text(page_count);
      $("#total_blocked_count").text(info.total_blocked);
      
      $("#toggle_badge_checkbox").attr("checked", info.display_stats);
      // Show help link until it is clicked.
      $("#block_counts_help").
        toggle(BG.get_settings().show_block_counts_help_link).
        click(function() {
          BG.set_setting("show_block_counts_help_link", false);
          BG.openTab($(this).attr("href"));
          $(this).hide();
        });
    }

    var eligible_for_undo = !paused && (info.disabled_site || !info.whitelisted);
    var url_to_check_for_undo = info.disabled_site ? undefined : info.tab.url;
    if (eligible_for_undo && BG.has_last_custom_filter(url_to_check_for_undo))
      show(["div_undo", "separator0"]);

    if (!BG.get_settings().show_advanced_options)
      hide(["div_show_resourcelist"]);
    
    for (var div in shown)
      if (shown[div]) 
        $('#' + div).show();
  });
}


// Click handlers
$(function() {
  $("#toggle_badge_checkbox").click(function(){
    var checked = $(this).is(":checked");
    BG.getCurrentTabInfo(function(info) {
      BG.updateDisplayStats(checked, info.tab.id);
    });
  });
  
  $("#titletext span").click(function() {
    var url = "https://chrome.google.com/webstore/detail/gighmmpiobklfepjocnamgkkbiglidom";
    BG.openTab(url);
  });

  $("#div_status_whitelisted a").click(function() {
    BG.getCurrentTabInfo(function(info) {
      if (BG.try_to_unwhitelist(info.tab.url)) {
        chrome.tabs.reload();
        window.close();
      } else {
        $("#div_status_whitelisted").
        replaceWith(translate("disabled_by_filter_lists"));
      }
    });
  });

  //CrowdFunding 
  var crowdfund_href = "https://campaign.getadblock.com";
  $("#crowdfund_open").click(function(){
    chrome.tabs.create({'url': crowdfund_href}, function(tab){}); 
  });

  $("#div_status_paused a").click(function() {
    BG.adblock_is_paused(false);
    BG.handlerBehaviorChanged();
    BG.updateButtonUIAndContextMenus();
    window.close();
  });

  $("#div_undo").click(function() {
    BG.getCurrentTabInfo(function(info) {
      BG.remove_last_custom_filter();
      if (!info.disabled_site)
        chrome.tabs.reload();
      window.close();
    });
  });

  $("#div_pause_adblock").click(function() {
    BG.adblock_is_paused(true);
    BG.updateButtonUIAndContextMenus();
    window.close();
  });

  $("#div_blacklist").click(function() {
    BG.getCurrentTabInfo(function(info) {
      BG.emit_page_broadcast(
        {fn:'top_open_blacklist_ui', options: { nothing_clicked: true }},
        { tab: info.tab } // fake sender to determine target page
      );
      window.close();
    });
  });

  $("#div_whitelist_page").click(function() {
    BG.getCurrentTabInfo(function(info) {
      BG.create_page_whitelist_filter(info.tab.url);
      chrome.tabs.reload();
      window.close();
    });
  });

  $("#div_whitelist").click(function() {
    BG.getCurrentTabInfo(function(info) {
      BG.emit_page_broadcast(
        {fn:'top_open_whitelist_ui', options:{}},
        { tab: info.tab } // fake sender to determine target page
      );
      window.close();
    });
  });

  $("#div_show_resourcelist").click(function() {
    BG.getCurrentTabInfo(function(info) {
      BG.launch_resourceblocker("?tabId=" + info.tab.id);
    });
  });


  $("#div_report_an_ad").click(function() {
    BG.getCurrentTabInfo(function(info) {
      var url = "pages/adreport.html?url=" + escape(info.tab.url);
      BG.openTab(url, true);
    });
  });


  $("#div_options").click(function() {
    BG.openTab("options/index.html");
  });


  $("#div_help_hide").click(function() {
    $("#help_hide_explanation").slideDown();
  });
});

// Share open/close click handlers
$(function() {
  var state = "initial";
  var bodysize = { width: $("body").width(), height: $("body").height() };
  var linkHref = "https://chromeadblock.com/share/";
  $("#link_open").click(function() {
    if (state === "initial") {
      $("<iframe>").
        attr("frameBorder", 0).
        attr("src", linkHref).
        width("100%").
        height("100%").
        appendTo("#slideout_wrapper");
    }
    if (state === "open")
      return;
    state = "open";
    $("#link_close").show();
    var slideoutWidth = parseInt($("#div_slideout").data("width"));
    var slideoutHeight = parseInt($("#div_slideout").data("height"));
    $("body").animate({width: slideoutWidth, height: slideoutHeight},
                      {queue:false});
    $("#menu-items").slideUp();
    $("#slideout_wrapper").
      width(0).height(0).show().
      animate({width: slideoutWidth-50, height: slideoutHeight-40}, 
              {queue:false});
  });
  $("#link_close").click(function() {
    if (state != "open")
      return;
    state = "closed";
    $("body").animate(bodysize, {queue:false});
    $("#menu-items").slideDown();
    $("#slideout_wrapper").animate({width: 0, height: 0}, {queue:false});
    $("#link_close").hide();
    $("#slideout_wrapper").slideUp();
  });
});

$(function() {
  customize_for_this_tab();
  localizePage();
});
