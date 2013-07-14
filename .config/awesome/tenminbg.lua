-- Standard awesome library
local gears = require("gears")
local awful = require("awful")
local cairo = require("lgi").cairo
awful.rules = require("awful.rules")
require("awful.autofocus")
require("volume")
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
awesome.font = "TerminusMedium 12"
--{{---| Variables |------------------------
terminal = "urxvt"
editor = os.getenv("EDITOR") or "nano"
editor_cmd = terminal .. " -e " .. editor
browser = "firefox"
modkey = "Mod4"
iptraf = "urxvt -t 'ip monitoring' -g 180x54-20+34 -e sudo iptraf-ng -i all"
-- {{{      <10-minute wallpaper scroller/>      }}} --

--bg_index = 1
--bg_timeout = 10
--bg_path = "/home/ep/.config/awesome/wallpapers/"
---- bg_path is a collection of wallpapers
---- collection is ordered from 0, 1, 2, 3, 4, 5, 6.....  n
--bg_files = { "blackhardwood.jpg", "bluespace.jpg", "brightearth.jpg", "brokenwindmill.jpg", "circlewater.jpg", "darkearth.jpg", "spacemountains.jpg" }
--
---- setup the timer
--bg_timer = timer { timeout = bg_timeout }
--bg_timer:connect_signal("timeout", function()
--
--        --sets wallpaper to current index
--        gears.wallpaper.maximized( bg_path .. bg_files[bg_index] , s, true)
--
--        --stop the timer
--        bg_timer:stop()
--
--        -- get index based on time
--        b = tonumber(os.date("%M"))
--        if b <= 00 and  b < 10 then
--                --gears.wallpaper.maximized( bg_path .. bg_files[7] , s, true)
--                bg_index = 1
--        elseif b <= 10 and b < 20 then
--                --gears.wallpaper.maximized( bg_path .. bg_files[1] , s, true)
--                bg_index = 1
--        elseif b <= 20 and b < 30 then
--                --gears.wallpaper.maximized( bg_path .. bg_files[2] , s, true)
--                bg_index = 2
--        elseif b <= 30 and b < 40 then
--                --gears.wallpaper.maximized( bg_path .. bg_files[3] , s, true)
--                bg_index = 3
--        elseif b <= 40 and b < 50 then
--                --gears.wallpaper.maximized( bg_path .. bg_files[4] , s, true)
--                bg_index = 4
--        elseif b <= 50 and b <= 59 then
--                --gears.wallpaper.maximized( bg_path .. bg_files[5] , s, true)
--                bg_index = 5
--        end
--
--        --restart the timer
--        bg_timer.timeout = bg_timeout
--        bg_timer:start()
--end)
--
--        --initial timer when rc.lua is first run
--        bg_timer:start()


---- {{{ Variable definitions
---- Themes define colours, icons, and wallpapers
--beautiful.init("/usr/share/awesome/themes/zenburn-custom/theme.lua")


-- Table of layouts to cover with awful.layout.inc, order matters.
local layouts =
{
    awful.layout.suit.floating,
    awful.layout.suit.tile,
    awful.layout.suit.tile.left,
    awful.layout.suit.tile.bottom,
    awful.layout.suit.tile.top,
    awful.layout.suit.fair,
    awful.layout.suit.fair.horizontal,
    awful.layout.suit.spiral,
    awful.layout.suit.spiral.dwindle,
    awful.layout.suit.max,
    awful.layout.suit.max.fullscreen,
    awful.layout.suit.magnifier
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

mylauncher = awful.widget.launcher({ image = beautiful.awesome_icon,
                                     menu = mymainmenu })

-- Menubar configuration
menubar.utils.terminal = terminal -- Set the terminal for applications that require it
-- }}}


-- {{{ Wibox
-- Create a textclock widget
mytextclock = awful.widget.textclock(" %a %b %d, %I:%M %p ")

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


--{{---| Binary Clock |-------
 local binClock = wibox.widget.base.make_widget()
 binClock.radius = 1.5
 binClock.shift = 1.8
 binClock.farShift = 2
 binClock.border = 1
 binClock.lineWidth = 1
 binClock.colorActive = beautiful.binclock_fga

 binClock.fit = function(binClock, width, height)
 	local size = math.min(width, height)
 	return 6 * 2 * binClock.radius + 5 * binClock.shift + 2 * binClock.farShift + 2 * binClock.border + 2 * binClock.border, size
 end

 binClock.draw = function(binClock, wibox, cr, width, height)
 	local curTime = os.date("*t")

 	local column = {}
 	table.insert(column, string.format("%04d", binClock:dec_bin(string.sub(string.format("%02d", curTime.hour), 1, 1))))
 	table.insert(column, string.format("%04d", binClock:dec_bin(string.sub(string.format("%02d", curTime.hour), 2, 2))))
 	table.insert(column, string.format("%04d", binClock:dec_bin(string.sub(string.format("%02d", curTime.min), 1, 1))))
 	table.insert(column, string.format("%04d", binClock:dec_bin(string.sub(string.format("%02d", curTime.min), 2, 2))))
 	table.insert(column, string.format("%04d", binClock:dec_bin(string.sub(string.format("%02d", curTime.sec), 1, 1))))
 	table.insert(column, string.format("%04d", binClock:dec_bin(string.sub(string.format("%02d", curTime.sec), 2, 2))))

 	local bigColumn = 0
 	for i = 0, 5 do
 		if math.floor(i / 2) > bigColumn then
 			bigColumn = bigColumn + 1
 		end
 		for j = 0, 3 do
 			if string.sub(column[i + 1], j + 1, j + 1) == "0" then
 				active = false
 			else
 				active = true
 			end
 			binClock:draw_point(cr, bigColumn, i, j, active)
 		end
 	end
 end

 binClock.dec_bin = function(binClock, inNum)
 	inNum = tonumber(inNum)
 	local base, enum, outNum, rem = 2, "01", "", 0
 	while inNum > (base - 1) do
 		inNum, rem = math.floor(inNum / base), math.fmod(inNum, base)
 		outNum = string.sub(enum, rem + 1, rem + 1) .. outNum
 	end
 	outNum = inNum .. outNum
 	return outNum
 end

 binClock.draw_point = function(binClock, cr, bigColumn, column, row, active)
 	cr:arc(binClock.border + column * (2 * binClock.radius + binClock.shift) + bigColumn * binClock.farShift + binClock.radius,
 		 binClock.border + row * (2 * binClock.radius + binClock.shift) + binClock.radius, 2, 0, 2 * math.pi)
 	if active then
 		--cr:set_source_rgba(0, 0.5, 0, 1)
 		cr:set_source_rgba(204, 204, 204, 1)
 	else
 		cr:set_source_rgba(0.5, 0.5, 0.5, 1)
 	end
 	cr:fill()
 end

 binClocktimer = timer { timeout = 1 }
 binClocktimer:connect_signal("timeout", function() binClock:emit_signal("widget::updated") end)
 binClocktimer:start()

-- Create a textclock widget
mytextclock = awful.widget.textclock(" %a %b %d, %I:%M %p ")

--{{---| Net widget | ----------------
netwidget = wibox.widget.textbox()
vicious.register(netwidget,
vicious.widgets.net,
'<span background="#C2C2A4" font="UbuntuMono 12"> <span font="UbuntuMono 12" color="#FFFFFF">"%a"</span> </span>', 3)
neticon = wibox.widget.imagebox()
neticon:set_image(widget_net)
netwidget:buttons(awful.util.table.join(awful.button({}, 1,
function () awful.util.spawn_with_shell(iptraf) end)))

--{{---| CPU / sensors widget |-----------
cpuwidget = wibox.widget.textbox()
vicious.register(cpuwidget, vicious.widgets.cpu,
'<span background="#4B696D" font="Terminus 12"> <span font="Terminus 9" color="#DDDDDD">$2% <span color="#888888">·</span> $3% </span></span>', 3)
cpuicon = wibox.widget.imagebox()
cpuicon:set_image(beautiful.widget_cpu)
--sensors = wibox.widget.textbox()
--vicious.register(sensors, vicious.widgets.sensors)
tempicon = wibox.widget.imagebox()
tempicon:set_image(beautiful.widget_temp)
blingbling.popups.htop(cpuwidget,
{ title_color = beautiful.notify_font_color_1,
user_color = beautiful.notify_font_color_2,
root_color = beautiful.notify_font_color_3,
terminal = "terminal --geometry=130x56-10+26"})



--{{---| FS's widget / udisks-glue menu |-----
fswidget = wibox.widget.textbox()
vicious.register(fswidget, vicious.widgets.fs,
'<span background="#D0785D" font="Terminus 12"> <span font="Terminus 9" color="#EEEEEE">test </span></span>', 8)
--udisks_glue = blingbling.udisks_glue.new(beautiful.widget_hdd)
udisks_glue=blingbling.udisks_glue.new({ menu_icon = themes_dir .. "/test/titlebar/maximized_focus_active.png"})
udisks_glue:set_mount_icon(beautiful.accept)
udisks_glue:set_umount_icon(beautiful.cancel)
udisks_glue:set_detach_icon(beautiful.cancel)
udisks_glue:set_Usb_icon(beautiful.usb)
udisks_glue:set_Cdrom_icon(beautiful.cdrom)
--awful.widget.layout.margins[udisks_glue.widget] = { top = 0}
--udisks_glue.widget.resize = false

--{{---| Battery widget |---------------
baticon = wibox.widget.imagebox()
baticon:set_image(beautiful.widget_battery)
batwidget = wibox.widget.textbox()
vicious.register( batwidget, vicious.widgets.bat, '<span background="#92B0A0" font="UbuntuMono 12"><span font="UbuntuMono 12" color="#FFFFFF" background="#92B0A0">$1$2% </span></span>', 1, "BAT0" )

--{{---| Separators widgets |-------------
spr = wibox.widget.textbox()
spr:set_text(' ')
sprd = wibox.widget.textbox()
sprd:set_markup('<span background ="#313131" font="TerminusMedium 12"> </span>')
spr3f = wibox.widget.textbox()
spr3f:set_markup('<span background="#777e76" font="TerminusMedium 12"> </span>')
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
    --adds the volume between the network and before the TIME
    --right_layout:add(alsawidget.bar)
    right_layout:add(volume_widget)

    right_layout:add(mytextclock)
    right_layout:add(tempicon)
    right_layout:add(arr5)
    right_layout:add(udisks_glue)
    right_layout:add(fswidget)
    right_layout:add(arr4)
    right_layout:add(baticon)
    right_layout:add(batwidget)
    right_layout:add(arr3)
    right_layout:add(netwidget)
    right_layout:add(arr2)
    right_layout:add(spr3f)
    right_layout:add(binClock)
    right_layout:add(spr3f)
    right_layout:add(arr1)
    right_layout:add(mylayoutbox[s])

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

    -- Opens Firefox
    awful.key( { "Control", "Shift"}, "f", function() awful.util.spawn(browser) end),

    -- Shutdowns Computer
    awful.key({ "Control",          }, "Escape", function() awful.util.spawn("systemctl poweroff") end),

    -- Spawns sublime text 2
    awful.key( { "Control", "Shift"}, "b", function() awful.util.spawn("subl") end),

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

    --awful.key({ modkey,           }, "u", awful.client.urgent.jumpto),
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
    { rule = { class = "urxvt" },
      properties = { size_hints_honor = false } },
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

-- ensures that the network applet on the menu shows up once.
run_once("wicd-client -t")
awful.util.spawn_with_shell("redshift -l 49.26:-123.23")

-- turns off caps lock keys and makes it function like an escape
awful.util.spawn_with_shell("xmodmap /usr/bin/speedswapper")

-- turns off terminal bell, holy fuck it's annoying.
awful.util.spawn_with_shell("/usr/bin/xset b off")

client.connect_signal("focus", function(c) c.border_color = beautiful.border_focus end)
client.connect_signal("unfocus", function(c) c.border_color = beautiful.border_normal end)
-- }}}
