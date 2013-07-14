-- Standard awesome library
local gears = require("gears")
local awful = require("awful")
local cairo = require("lgi").cairo
awful.rules = require("awful.rules")
require("awful.autofocus")
local blingbling = require("blingbling")
vicious = require("vicious")
local wibox = require("wibox")
local beautiful = require("beautiful")
local naughty = require("naughty")
local menubar = require("menubar")

-- {{{ Error handling
-- Check if awesome encountered an error during startup and fell back to
-- another config (This code will only ever execute for the fallback config)
if awesome.startup_errors then
    naughty.notify({ preset = naughty.config.presets.critical,
                     title = "Oops, there were errors during startup!",
                     text = awesome.startup_errors })
end

-- Handle runtime errors after startup
do
    local in_error = false
    awesome.connect_signal("debug::error", function (err)
        -- Make sure we don't go into an endless error loop
        if in_error then return end
        in_error = true

        naughty.notify({ preset = naughty.config.presets.critical,
                         title = "Oops, an error happened!",
                         text = err })
        in_error = false
    end)
end
-- }}}

--{{---| Theme | -------------------------------------
config_dir = ("/home/ep/.config/awesome/")
themes_dir = (config_dir .. "/themes")
beautiful.init(themes_dir .. "/powerarrow/theme.lua")

--{{---| Variables |------------------------
--terminal = "urxvt -geometry 79x22+0-0"
terminal = "termite"
editor = os.getenv("EDITOR") or "nano"
editor_cmd = terminal .. " -e " .. editor
browser = "chromium"
modkey = "Mod4"

-- Table of layouts to cover with awful.layout.inc, order matters.
local layouts =
{
    awful.layout.suit.floating,
    awful.layout.suit.tile,
    awful.layout.suit.tile.left,
    awful.layout.suit.tile.bottom,
    awful.layout.suit.tile.top,
}
-- }}}

-- {{{ Wallpaper
if beautiful.wallpaper then
    for s = 1, screen.count() do
        gears.wallpaper.maximized(beautiful.wallpaper, s, true)
    end
end
-- }}}

-- {{{ Tags
-- Define a tag table which hold all screen tags.
tags = {}
for s = 1, screen.count() do
    -- Each screen has its own tag table.
    tags[s] = awful.tag({ 1, 2, 3}, s, layouts[1])
end
-- }}}

-- {{{ Menu
-- Create a laucher widget and a main menu
myawesomemenu = {
   { "manual", terminal .. " -e man awesome" },
   { "edit config", editor_cmd .. " " .. awesome.conffile },
   { "restart", awesome.restart },
   { "quit", awesome.quit }
}

mymainmenu = awful.menu({ items = { { "awesome", myawesomemenu, beautiful.awesome_icon },
                                    { "open terminal", terminal }
                                  }
                        })

mylauncher = awful.widget.launcher({ --image = beautiful.awesome_icon,
                                     menu = mymainmenu })

-- Menubar configuration
menubar.utils.terminal = terminal -- Set the terminal for applications that require it
-- }}}


-- {{{ Wibox
-- Create a textclock widget
--mytextclock = awful.widget.textclock(" %a %b %d, %I:%M %p ")

-- Create a wibox for each screen and add it
mywibox = {}
mypromptbox = {}
mylayoutbox = {}
mytaglist = {}
mytaglist.buttons = awful.util.table.join(
                    awful.button({ }, 1, awful.tag.viewonly),
                    awful.button({ modkey }, 1, awful.client.movetotag),
                    awful.button({ }, 3, awful.tag.viewtoggle),
                    awful.button({ modkey }, 3, awful.client.toggletag),
                    awful.button({ }, 4, function(t) awful.tag.viewnext(awful.tag.getscreen(t)) end),
                    awful.button({ }, 5, function(t) awful.tag.viewprev(awful.tag.getscreen(t)) end)
                    )
mytasklist = {}
mytasklist.buttons = awful.util.table.join(
                     awful.button({ }, 1, function (c)
                                              if c == client.focus then
                                                  c.minimized = true
                                              else
                                                  -- Without this, the following
                                                  -- :isvisible() makes no sense
                                                  c.minimized = false
                                                  if not c:isvisible() then
                                                      awful.tag.viewonly(c:tags()[1])
                                                  end
                                                  -- This will also un-minimize
                                                  -- the client, if needed
                                                  client.focus = c
                                                  c:raise()
                                              end
                                          end),
                     awful.button({ }, 3, function ()
                                              if instance then
                                                 instance:hide()
                                                  instance = nil
                                              else
                                                  instance = awful.menu.clients({ width=250 })
                                              end
                                          end),
                     awful.button({ }, 4, function ()
                                              awful.client.focus.byidx(1)
                                              if client.focus then client.focus:raise() end
                                          end),
                     awful.button({ }, 5, function ()
                                              awful.client.focus.byidx(-1)
                                              if client.focus then client.focus:raise() end
                                          end))


--{{--| Mail widget |---------
mailicon = wibox.widget.imagebox()

vicious.register(mailicon, vicious.widgets.gmail, function(widget, args)
    local newMail = tonumber(args["{count}"])
    if newMail > 0 then
        mailicon:set_image(beautiful.widget_newmail)
    else
        mailicon:set_image(beautiful.widget_mailopen)
    end
end, 15)

-- to make GMail pop up when pressed:
mailicon:buttons(awful.util.table.join(awful.button({ }, 1,
function () awful.util.spawn_with_shell("chromium gmail.com") end)))


--{{--| MEM widget |-----------------
memwidget = wibox.widget.textbox()

--this is for the normal powerarrow
--vicious.register(memwidget, vicious.widgets.mem, '<span background="#777E76" font="monof55 12"> <span font="monof55 12" color="#EEEEEE" background="#777E76">$2MB </span></span>', 20)

--this is for the powerarrow-dark
vicious.register(memwidget, vicious.widgets.mem, '<span background="#313131" font="monof55 10"> <span font="monof55 10" color="#EEEEEE" background="#313131">$2MB </span></span>', 10)
memicon = wibox.widget.imagebox()
memicon = wibox.widget.imagebox()
memicon:set_image(beautiful.widget_mem)

--{{--| Time and Date widget |-------
tdwidget = wibox.widget.textbox()
--this one is for the normal powerarrow
--vicious.register(tdwidget, vicious.widgets.date, '<span font="monof55 12" color="#EEEEEE" background="#777E76"> %b %d %I:%M</span>', 20)

--this one is for the powerarrow-dark
vicious.register(tdwidget, vicious.widgets.date, '<span font="monof55 10" color="#EEEEEE" background="#313131"> %b %d %I:%M</span>', 20)
clockicon = wibox.widget.imagebox()
clockicon:set_image(beautiful.widget_clock)

---{{---| Wifi Signal Widget |-------
neticon = wibox.widget.imagebox()
vicious.register(neticon, vicious.widgets.wifi, function(widget, args)
    local sigstrength = tonumber(args["{link}"])
    if sigstrength > 69 then
        neticon:set_image(beautiful.widget_nethigh)
    elseif sigstrength > 40 and sigstrength < 70 then
        neticon:set_image(beautiful.widget_netmedium)
    else
        neticon:set_image(beautiful.widget_netlow)
    end
end, 120, 'wlp2s0')

----{{---| Net widget | ----------------
netwidget = wibox.widget.textbox()

-- this one is for the normal powerarrow
--vicious.register(netwidget, vicious.widgets.net, function(widget, args)
--    local interface = ""
--    if args["{wlp2s0 carrier}"] == 1 then
--        interface = "wlp2s0"
--    elseif args["{enp0s25 carrier}"] == 1 then
--        interface = "enp0s25"
--    else
--        return ""
--    end
--    return '<span background="#C2C2A4" font="monof55 12"> <span font ="monof55 12" color="#FFFFFF">'..args["{"..interface.." down_kb}"]..'kbps'..'</span></span>' end, 10)

-- this one is for the powerarrow-dark
vicious.register(netwidget, vicious.widgets.net, function(widget, args)
    local interface = ""
    if args["{wlp2s0 carrier}"] == 1 then
        interface = "wlp2s0"
    elseif args["{enp0s25 carrier}"] == 1 then
        interface = "enp0s25"
    else
        return ""
    end
    return '<span background="#3F3F3F" font="monof55 10"> <span font ="monof55 10" color="#FFFFFF">'..args["{"..interface.." down_kb}"]..'kbps'..'</span></span>' end, 10)
netwidget:buttons(awful.util.table.join(
awful.button({ }, 1, function() awful.util.spawn_with_shell('wicd-client -n') end)))


--{{--| Uncomment the section below if you want a 'blingbling'
--style drop down menu for a netstat display |----

--blingbling.popups.netstat(netwidget,
--{ title_color = beautiful.notify_font_color_1,
--established_color = beautiful.notify_font_color_3, listen_color = beautiful.notify_font_color_2})
--
--my_net=blingbling.net.new()
--my_net:set_height(18)
--my_net:set_ippopup()
--my_net:set_show_text(true)
--my_net:set_v_margin(3)

--{{---| CPU / sensors widget |-----------
cpuwidget = wibox.widget.textbox()
--this one is for the normal powerarrow

--vicious.register(cpuwidget, vicious.widgets.cpu,
--'<span background="#4B696D" font="monof55 12"> <span font="monof55 12" color="#DDDDDD">$2%<span color="#888888">·</span>$3% </span></span>', 5)

--this one is the powerarrow dark
vicious.register(cpuwidget, vicious.widgets.cpu,
'<span background="#3F3F3F" font="monof55 10"> <span font="monof55 10" color="#DDDDDD">$2%<span color="#888888"> </span>$3% $4% $5% </span></span>', 5)
cpuicon = wibox.widget.imagebox()
cpuicon:set_image(beautiful.widget_cpu)
--
--{{--| Uncomment the section below if you want a 'blingbling'
--style drop down menu for a htop display |---
--
--blingbling.popups.htop(cpuwidget,
--{ title_color = beautiful.notify_font_color_1,
--user_color = beautiful.notify_font_color_2,
--root_color = beautiful.notify_font_color_3})

----{{--| Volume / volume icon |----------
volume = wibox.widget.textbox()
--this one is for the normal powerarrow
--vicious.register(volume, vicious.widgets.volume,
--'<span background="#4B3B51" font="monof55 12"><span font="monof55 12" color="#EEEEEE"> Vol:$1 </span></span>', 0.3, "Master")

--this one is for the powerarrow-dark
vicious.register(volume, vicious.widgets.volume,
'<span background="#313131" font="monof55 10"><span font="monof55 10" color="#EEEEEE"> Vol:$1 </span></span>', 0.3, "Master")

volumeicon = wibox.widget.imagebox()
vicious.register(volumeicon, vicious.widgets.volume, function(widget, args)
    local paraone = tonumber(args[1])

    if args[2] == "♩" or paraone == 0 then
        volumeicon:set_image(beautiful.widget_redmute)
    elseif paraone >= 67 and paraone <= 100 then
        volumeicon:set_image(beautiful.widget_music)
    elseif paraone >= 33 and paraone <= 66 then
        volumeicon:set_image(beautiful.widget_music)
    else
        volumeicon:set_image(beautiful.widget_music)
    end

end, 0.3, "Master")


--{{---| File Size widget |-----
fswidget = wibox.widget.textbox()

--this one is for normal powerarrow
--vicious.register(fswidget, vicious.widgets.fs,
--'<span background="#D0785D" font="monof55 12"> <span font="monof55 12" color="#EEEEEE">${/home used_p}/${/home avail_p} GB </span></span>', 800)

--this one is for the powerarrow-dark
vicious.register(fswidget, vicious.widgets.fs,
'<span background="#3F3F3F" font="monof55 10"> <span font="monof55 10" color="#EEEEEE">${/home used_p}/${/home avail_p} GB </span></span>', 800)
fsicon = wibox.widget.imagebox()
fsicon:set_image(beautiful.widget_hdd)

----{{---| Battery widget |---------------
baticon = wibox.widget.imagebox()
baticon:set_image(beautiful.widget_battery)
batwidget = wibox.widget.textbox()
--vicious.register( batwidget, vicious.widgets.bat, '<span background="#92B0A0" font="monof55 12"><span font="monof55 12" color="#FFFFFF" background="#92B0A0">$1$2% </span></span>', 30, "BAT0" )

vicious.register( batwidget, vicious.widgets.bat, '<span background="#3F3F3F" font="monof55 10"><span font="monof55 10" color="#FFFFFF" background="#313131">$1$2% </span></span>', 30, "BAT0" )

--{{---| Separators widgets |-------------
spr = wibox.widget.textbox()
spr:set_text(' ')
sprd = wibox.widget.textbox()
sprd:set_markup('<span background ="#313131" font="monof55 12"> </span>')
spr3f = wibox.widget.textbox()
spr3f:set_markup('<span background="#777e76" font="monof55 12"> </span>')
sprdots = wibox.widget.textbox()
sprdots:set_text('⁝')
arr1 = wibox.widget.imagebox()
arr1:set_image("/home/ep/.config/awesome/themes/powerarrow/icons/powerarrow/arr1.png")
arr2 = wibox.widget.imagebox()
arr2:set_image(beautiful.arr2)
arr3 = wibox.widget.imagebox()
arr3:set_image(beautiful.arr3)
arr4 = wibox.widget.imagebox()
arr4:set_image(beautiful.arr4)
arr5 = wibox.widget.imagebox()
arr5:set_image(beautiful.arr5)
arr6 = wibox.widget.imagebox()
arr6:set_image(beautiful.arr6)
arr7 = wibox.widget.imagebox()
arr7:set_image(beautiful.arr7)
arr8 = wibox.widget.imagebox()
arr8:set_image(beautiful.arr8)
arr9 = wibox.widget.imagebox()
arr9:set_image(beautiful.arr9)
arr0 = wibox.widget.imagebox()
arr0:set_image(beautiful.arr0)

--{{--| The "Powerarrow-Dark theme separators begin here |-------

arrl = wibox.widget.imagebox()
arrl:set_image(beautiful.arrl)
arrl_dl = wibox.widget.imagebox()
arrl_dl:set_image(beautiful.arrl_dl)
arrl_ld = wibox.widget.imagebox()
arrl_ld:set_image(beautiful.arrl_ld)
---------------------------------------

for s = 1, screen.count() do
    -- Create a promptbox for each screen
    mypromptbox[s] = awful.widget.prompt()
    -- Create an imagebox widget which will contains an icon indicating which layout we're using.
    -- We need one layoutbox per screen.
    mylayoutbox[s] = awful.widget.layoutbox(s)
    mylayoutbox[s]:buttons(awful.util.table.join(
                           awful.button({ }, 1, function () awful.layout.inc(layouts, 1) end),
                           awful.button({ }, 3, function () awful.layout.inc(layouts, -1) end),
                           awful.button({ }, 4, function () awful.layout.inc(layouts, 1) end),
                           awful.button({ }, 5, function () awful.layout.inc(layouts, -1) end)))
    -- Create a taglist widget
    mytaglist[s] = awful.widget.taglist(s, awful.widget.taglist.filter.all, mytaglist.buttons)

    -- Create a tasklist widget
    mytasklist[s] = awful.widget.tasklist(s, awful.widget.tasklist.filter.currenttags, mytasklist.buttons)

    -- Create the wibox
    mywibox[s] = awful.wibox({ position = "top", screen = s, height = "16" })

    -- Widgets that are aligned to the left
    local left_layout = wibox.layout.fixed.horizontal()
    left_layout:add(mylauncher)
    left_layout:add(mytaglist[s])
    left_layout:add(mypromptbox[s])

    -- Widgets that are aligned to the right
    local right_layout = wibox.layout.fixed.horizontal()
    if s == 1 then right_layout:add(wibox.widget.systray()) end

--{{ Powerarrow ----------------------------
--    right_layout:add(spr)
--    right_layout:add(arr9)
--    right_layout:add(mailicon)
--    right_layout:add(arr8)
--    right_layout:add(memicon)
--    right_layout:add(memwidget)
--    right_layout:add(arr7)
--    right_layout:add(cpuicon)
--    right_layout:add(cpuwidget)
--    right_layout:add(arr6)
--    right_layout:add(volumeicon)
--    right_layout:add(volume)
--    right_layout:add(arr5)
--    right_layout:add(fsicon)
--    right_layout:add(fswidget)
--    right_layout:add(arr4)
--    right_layout:add(baticon)
--    right_layout:add(batwidget)
--    right_layout:add(arr3)
--    right_layout:add(neticon)
--    --right_layout:add(strength)
--    right_layout:add(netwidget)
--    right_layout:add(arr2)
--    right_layout:add(spr3f)
--    right_layout:add(clockicon)
--    right_layout:add(tdwidget)
--    right_layout:add(spr3f)
--    right_layout:add(arr1)
--    right_layout:add(mylayoutbox[s])
-----------------------------------------------

--{{ Powerarrow-Dark------------------------------
        right_layout:add(arrl_ld)
        right_layout:add(mailicon)
        right_layout:add(arrl_dl)
        right_layout:add(memwidget)
        right_layout:add(arrl_ld)
        right_layout:add(cpuwidget)
        right_layout:add(arrl_dl)
        right_layout:add(volumeicon)
        right_layout:add(volume)
        right_layout:add(arrl_ld)
        right_layout:add(fswidget)
        right_layout:add(arrl_dl)
        --right_layout:add(baticon)
        right_layout:add(batwidget)
        right_layout:add(arrl_ld)
        --right_layout:add(neticon)
        right_layout:add(netwidget)
        right_layout:add(arrl_dl)
        --right_layout:add(clockicon)
        right_layout:add(tdwidget)
        right_layout:add(spr)
        right_layout:add(arrl_ld)
        right_layout:add(mylayoutbox[s])
---------------------------------------------------
    -- Now bring it all together (with the tasklist in the middle)
    local layout = wibox.layout.align.horizontal()
    layout:set_left(left_layout)
    layout:set_middle(mytasklist[s])
    layout:set_right(right_layout)

    mywibox[s]:set_widget(layout)
end
-- }}}

-- {{{ Mouse bindings
root.buttons(awful.util.table.join(
    awful.button({ }, 3, function () mymainmenu:toggle() end),
    awful.button({ }, 4, awful.tag.viewnext),
    awful.button({ }, 5, awful.tag.viewprev)
))
-- }}}

-- {{{ Key bindings
globalkeys = awful.util.table.join(
    awful.key({ modkey,           }, "Left",   awful.tag.viewprev       ),
    awful.key({ modkey,           }, "Right",  awful.tag.viewnext       ),
    awful.key({ modkey,           }, "Escape", awful.tag.history.restore),

--**********************************************************************--
--  Instead of cycling through the clients, this allows for finer Vim-like control that does not cycle.  Included up and down direction
    awful.key({ modkey,           }, "l",
        function ()
            awful.client.focus.bydirection("right")
            if client.focus then client.focus:raise() end
        end),
    awful.key({ modkey,           }, "h",
        function ()
            awful.client.focus.bydirection("left")
            if client.focus then client.focus:raise() end
        end),
    awful.key({ modkey,           }, "j",
        function ()
            awful.client.focus.bydirection("down")
            if client.focus then client.focus:raise() end
        end),
    awful.key({ modkey,           }, "k",
        function ()
            awful.client.focus.bydirection("up")
            if client.focus then client.focus:raise() end
        end),

        --
        awful.key({modkey, }, "s",
                function()
                        awful.prompt.run( {prompt = "Web Search: "},
                        mypromptbox[mouse.screen].widget,
                        function (...) awful.util.spawn(terminal .. " -e "  .. "awesomesearch " .. ...) end,
                                awful.completion.shell,
                                -- Allows user to cycle through history using up arrows
                                awful.util.getdir("cache") .. "/history")
                        end),

    awful.key({ modkey,           }, "w", function () mymainmenu:show() end),

    -- System summons:

    -- Opens Chromium
    awful.key( { "Control", "Shift"}, "c", function() awful.util.spawn(browser) end),

    -- Shutdowns Computer
    awful.key({ "Control",          }, "Escape", function() awful.util.spawn("systemctl poweroff") end),

    -- Spawns skype
    awful.key( { "Control", "Shift"}, "s", function() awful.util.spawn("skype") end),

    awful.key({ }, "XF86AudioRaiseVolume", function ()
       awful.util.spawn("amixer set Master 5%+", false) end),
    awful.key({ }, "XF86AudioLowerVolume", function ()
       awful.util.spawn("amixer set Master 5%-", false) end),
    awful.key({ }, "XF86AudioMute", function ()
       awful.util.spawn("amixer sset Master toggle", false) end),

    awful.key({ }, "XF86Launch1", function()
        awful.util.spawn_with_shell("skype") end),

    -- Layout manipulation
    awful.key({ modkey, "Shift"   }, "j", function () awful.client.swap.byidx(  1)    end),
    awful.key({ modkey, "Shift"   }, "k", function () awful.client.swap.byidx( -1)    end),
    awful.key({ modkey, "Control" }, "j", function () awful.screen.focus_relative( 1) end),
    awful.key({ modkey, "Control" }, "k", function () awful.screen.focus_relative(-1) end),

    awful.key({ modkey,           }, "u", awful.client.urgent.jumpto),
    awful.key({ modkey,           }, "Tab",
        function ()
            awful.client.focus.history.previous()
            if client.focus then
                client.focus:raise()
            end
        end),

    -- Standard program
    awful.key({ modkey,           }, "Return", function () awful.util.spawn(terminal) end),
    awful.key({ modkey, "Control" }, "r", awesome.restart),
    awful.key({ modkey, "Shift"   }, "q", awesome.quit),

    awful.key({ modkey,           }, "i",     function () awful.tag.incmwfact( 0.05)    end),
    awful.key({ modkey,           }, "u",     function () awful.tag.incmwfact(-0.05)    end),
    awful.key({ modkey, "Shift"   }, "h",     function () awful.tag.incnmaster( 1)      end),
    awful.key({ modkey, "Shift"   }, "l",     function () awful.tag.incnmaster(-1)      end),
    awful.key({ modkey, "Control" }, "h",     function () awful.tag.incncol( 1)         end),
    awful.key({ modkey, "Control" }, "l",     function () awful.tag.incncol(-1)         end),
    awful.key({ modkey,           }, "space", function () awful.layout.inc(layouts,  1) end),
    awful.key({ modkey, "Shift"   }, "space", function () awful.layout.inc(layouts, -1) end),

    awful.key({ modkey, "Control" }, "n", awful.client.restore),

    -- Prompt
    awful.key({ modkey },            "r",     function () mypromptbox[mouse.screen]:run() end),

    awful.key({ modkey }, "x",
              function ()
                  awful.prompt.run({ prompt = "Run Lua code: " },
                  mypromptbox[mouse.screen].widget,
                  awful.util.eval, nil,
                  awful.util.getdir("cache") .. "/history_eval")
              end),
    -- Menubar
    awful.key({ modkey }, "p", function() menubar.show() end)
)

clientkeys = awful.util.table.join(
    awful.key({ modkey,           }, "f",      function (c) c.fullscreen = not c.fullscreen  end),
    awful.key({ modkey,           }, "q",      function (c) c:kill()                         end),
    awful.key({ modkey, "Control" }, "space",  awful.client.floating.toggle                     ),
    awful.key({ modkey, "Control" }, "Return", function (c) c:swap(awful.client.getmaster()) end),
    awful.key({ modkey,           }, "o",      awful.client.movetoscreen                        ),
    awful.key({ modkey,           }, "t",      function (c) c.ontop = not c.ontop            end),
    awful.key({ modkey,           }, "n",
        function (c)
            -- The client currently has the input focus, so it cannot be
            -- minimized, since minimized clients can't have the focus.
            c.minimized = true
        end),
    awful.key({ modkey,           }, "m",
        function (c)
            c.maximized_horizontal = not c.maximized_horizontal
            c.maximized_vertical   = not c.maximized_vertical
        end)
)

-- Compute the maximum number of digit we need, limited to 9
keynumber = 0
for s = 1, screen.count() do
   keynumber = math.min(9, math.max(#tags[s], keynumber))
end

-- Bind all key numbers to tags.
-- Be careful: we use keycodes to make it works on any keyboard layout.
-- This should map on the top row of your keyboard, usually 1 to 9.
for i = 1, keynumber do
    globalkeys = awful.util.table.join(globalkeys,
        awful.key({ modkey }, "#" .. i + 9,
                  function ()
                        local screen = mouse.screen
                        if tags[screen][i] then
                            awful.tag.viewonly(tags[screen][i])
                        end
                  end),
        awful.key({ modkey, "Control" }, "#" .. i + 9,
                  function ()
                      local screen = mouse.screen
                      if tags[screen][i] then
                          awful.tag.viewtoggle(tags[screen][i])
                      end
                  end),
        awful.key({ modkey, "Shift" }, "#" .. i + 9,
                  function ()
                      if client.focus and tags[client.focus.screen][i] then
                          awful.client.movetotag(tags[client.focus.screen][i])
                      end
                  end),
        awful.key({ modkey, "Control", "Shift" }, "#" .. i + 9,
                  function ()
                      if client.focus and tags[client.focus.screen][i] then
                          awful.client.toggletag(tags[client.focus.screen][i])
                      end
                  end))
end

clientbuttons = awful.util.table.join(
    awful.button({ }, 1, function (c) client.focus = c; c:raise() end),
    awful.button({ modkey }, 1, awful.mouse.client.move),
    awful.button({ modkey }, 3, awful.mouse.client.resize))

-- Set keys
root.keys(globalkeys)
-- }}}

-- {{{ Rules
awful.rules.rules = {
    -- All clients will match this rule.
    { rule = { },
      properties = { border_width = beautiful.border_width,
                     border_color = beautiful.border_normal,
                     focus = awful.client.focus.filter,
                     keys = clientkeys,
                     buttons = clientbuttons } },
    { rule = { class = "MPlayer" },
      properties = { floating = true } },
    { rule = { class = "pinentry" },
      properties = { floating = true } },
    { rule = { class = "gimp" },
      properties = { floating = true } },
    --{ rule = { class = "urxvt" },
    --  properties = { size_hints_honor = false } },
    -- Set Firefox to always map on tags number 2 of screen 1.
    -- { rule = { class = "Firefox" },
    --   properties = { tag = tags[1][2] } },
}
-- }}}

-- {{{ Signals
-- Signal function to execute when a new client appears.
client.connect_signal("manage", function (c, startup)
    -- Enable sloppy focus
    c:connect_signal("mouse::enter", function(c)
        if awful.layout.get(c.screen) ~= awful.layout.suit.magnifier
            and awful.client.focus.filter(c) then
            client.focus = c
        end
    end)

    if not startup then
        -- Set the windows at the slave,
        -- i.e. put it at the end of others instead of setting it master.
        -- awful.client.setslave(c)

        -- Put windows in a smart way, only if they does not set an initial position.
        if not c.size_hints.user_position and not c.size_hints.program_position then
            awful.placement.no_overlap(c)
            awful.placement.no_offscreen(c)
        end
    end

    local titlebars_enabled = false
    if titlebars_enabled and (c.type == "normal" or c.type == "dialog") then
        -- Widgets that are aligned to the left
        local left_layout = wibox.layout.fixed.horizontal()
        left_layout:add(awful.titlebar.widget.iconwidget(c))

        -- Widgets that are aligned to the right
        local right_layout = wibox.layout.fixed.horizontal()
        right_layout:add(awful.titlebar.widget.floatingbutton(c))
        right_layout:add(awful.titlebar.widget.maximizedbutton(c))
        right_layout:add(awful.titlebar.widget.stickybutton(c))
        right_layout:add(awful.titlebar.widget.ontopbutton(c))
        right_layout:add(awful.titlebar.widget.closebutton(c))

        -- The title goes in the middle
        local title = awful.titlebar.widget.titlewidget(c)
        title:buttons(awful.util.table.join(
                awful.button({ }, 1, function()
                    client.focus = c
                    c:raise()
                    awful.mouse.client.move(c)
                end),
                awful.button({ }, 3, function()
                    client.focus = c
                    c:raise()
                    awful.mouse.client.resize(c)
                end)
                ))

        -- Now bring it all together
        local layout = wibox.layout.align.horizontal()
        layout:set_left(left_layout)
        layout:set_right(right_layout)
        layout:set_middle(title)

        awful.titlebar(c):set_widget(layout)
    end
end)

-- Function to ensure that WICD only has one instance when I
-- restart awesome
function run_once(cmd)
  findme = cmd
  firstspace = cmd:find(" ")
  if firstspace then
    findme = cmd:sub(0, firstspace-1)
  end
  awful.util.spawn_with_shell("pgrep -u $USER -x " .. findme .. " > /dev/null || (" .. cmd .. ")")
end

-- ensures that these applications only run once
run_once("redshift -l 49.26:-123.23")

-- turns off caps lock keys and makes it function like an escape
awful.util.spawn_with_shell("xmodmap ~/.speedswapper")

-- turns off terminal bell, holy fuck it's annoying.
awful.util.spawn_with_shell("/usr/bin/xset b off")

client.connect_signal("focus", function(c) c.border_color = beautiful.border_focus end)
client.connect_signal("unfocus", function(c) c.border_color = beautiful.border_normal end)
-- }}}
