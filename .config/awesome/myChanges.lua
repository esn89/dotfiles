--  Original Author:  Evan Ng, 2013
--
--  Some of the code in this file originally came from my rc.lua.  But because I
--  like to keep things simple so my rc.lua doesn't look
--  long and cluttered, I deleted a lot of my original comments.
--
--  This will go into detail if you wish to make minor
--  tweaks to adjust what your powerarrow theme displays.
--
--  This is the code that works with the Awesome 3.5, the
--  part that differs from the original author's.  You will
--  find that there are a lot of improvements have been implemented
--  such as gmail integration, moving volume icon, a wifi
--  signal that corresponds to your signal strength, a
--  click-able text box that displays the wicd client.
--
--  I am looking to add a battery icon that corresponds to
--  battery level in the near future................


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
mailmutt = "urxvt -T 'Mutt' -g 90x25-20+34 -e mutt"

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


--{{--| Mail--widget--|--------------------------------------

-- Initializes mailicon image
mailicon = wibox.widget.imagebox()

vicious.register(mailicon, vicious.widgets.gmail, function(widget, args)
    -- newMail is the number of unread messages gmail.lua
    -- returns
    local newMail = tonumber(args["{count}"])
    if newMail > 0 then
        -- you have mail! icon is sealed envelope
        mailicon:set_image(beautiful.widget_mail)
    else
        -- no new mail, icon is opened mailed
        mailicon:set_image(beautiful.widget_mailopen)
    end
end, 10)

-- to make mutt pop up when pressed:
-- comment this out if you don't use mutt and wish to access
-- your mail from the browser
mailicon:buttons(awful.util.table.join(awful.button({ }, 1,
function () awful.util.spawn_with_shell(mailmutt) end)))


--{{--| MEM widget--|-----------------------------------------

-- Initializes memwidget as a text container
memwidget = wibox.widget.textbox()

-- $n is the nth argument returned by mem.lua out of a total
-- of 9.
-- $1 = memory usage in percent
-- $2 = memory usage in Mb
-- $3 = total system memory
-- $4 = free memory
-- $5 = swap usage in %
-- $6 = swap usage in Mb
-- %7 = total system swap
-- %8 = as free swap
-- %9 = memory usage with buffers and cache
vicious.register(memwidget, vicious.widgets.mem, '<span background="#777E76" font="UbuntuMono 12"> <span font="UbuntuMono 12" color="#EEEEEE" background="#777E76">$2MB </span></span>', 13)

-- Initializes memory icon
memicon = wibox.widget.imagebox()
memicon:set_image(beautiful.widget_mem)


--{{--| Time and Date widget--|-------------------------------

-- Initializes tdwidget as text container
tdwidget = wibox.widget.textbox()

-- %b %d %I:%M will yield something like: Apr 23 08:21

vicious.register(tdwidget, vicious.widgets.date, '<span font="UbuntuMono 12" color="#EEEEEE" background="#777E76"> %b %d %I:%M</span>', 20)

-- initializes clock icon image
clockicon = wibox.widget.imagebox()
clockicon:set_image(beautiful.widget_clock)


---{{---| Wifi Signal Widget--|--------------------------------

-- Initializes neticon as an image
neticon = wibox.widget.imagebox()

vicious.register(neticon, vicious.widgets.wifi, function(widget, args)
    -- {link} is signal strength returned by wifi.lua function
    -- sigstrength is integer form of {link}
    local sigstrength = tonumber(args["{link}"])
    if sigstrength > 69 then
        neticon:set_image(beautiful.widget_nethigh)
    elseif sigstrength > 40 and sigstrength < 70 then
        neticon:set_image(beautiful.widget_netmedium)
    else
        neticon:set_image(beautiful.widget_netlow)
    end
end, 110, 'wlp2s0')
-- 'wlp2s0' is the name of my wireless network interface, to
-- find out what yours is enter this into your terminal:
-- "iwconfig"


----{{---| Net widget--|---------------------------------------

-- Initializes netwidget as a text container, this is where
-- we will display our download speed, and total data
-- transferred.

netwidget = wibox.widget.textbox()

vicious.register(netwidget, vicious.widgets.net, function(widget, args)
    local interface = ""
    -- determines if user is using wireless or ethernet
    -- connection
    if args["{wlp2s0 carrier}"] == 1 then
        interface = "wlp2s0"
    elseif args["{enp0s25 carrier}"] == 1 then
        interface = "enp0s25"
    else
        return ""
    end
    -- args["{"..interface.." down_kb}" is download speed in kbps,
    -- args["{"..interface.." rx_mb}" is data transffered in
    -- mb
    return '<span background="#C2C2A4" font="UbuntuMono 12"> <span font ="UbuntuMono 12" color="#FFFFFF">'..args["{"..interface.." down_kb}"]..'kbps|'..args["{"..interface.." rx_mb}"].."Mb "..'</span></span>' end, 11)

-- Gives the netwidget text-area button capability to invoke WICD interface

netwidget:buttons(awful.util.table.join(
awful.button({ }, 1, function() awful.util.spawn_with_shell('wicd-client -n') end)))


-- {{--| Uncomment the section below if you want a 'blingbling'
-- style drop down menu for a netstat display |----

-- blingbling.popups.netstat(netwidget,
-- { title_color = beautiful.notify_font_color_1,
-- established_color = beautiful.notify_font_color_3, listen_color = beautiful.notify_font_color_2})
--
-- my_net=blingbling.net.new()
-- my_net:set_height(18)
-- my_net:set_ippopup()
-- my_net:set_show_text(true)
-- my_net:set_v_margin(3)


--{{---| CPU  widget--|---------------------------------------

-- Initializes cpuwidget as a text container
cpuwidget = wibox.widget.textbox()

-- cpu.lua widet can return:
-- $1 usage of all CPU/CORES
-- $2 first CPU core
-- $3 second CPU core
-- $4 third CPU core
-- $5 fourth CPU core
vicious.register(cpuwidget, vicious.widgets.cpu,
'<span background="#4B696D" font="UbuntuMono 12"> <span font="UbuntuMono 12" color="#DDDDDD">$2%<span color="#888888">·</span>$3% </span></span>', 3)

-- Initializes cpuicon as the CPU icon
cpuicon = wibox.widget.imagebox()
cpuicon:set_image(beautiful.widget_cpu)

-- {{--| Uncomment the section below if you want a 'blingbling'
-- style drop down menu for a htop display |---

-- blingbling.popups.htop(cpuwidget,
-- { title_color = beautiful.notify_font_color_1,
-- user_color = beautiful.notify_font_color_2,
-- root_color = beautiful.notify_font_color_3})


----{{--| Volume / volume icon |-------------------------

-- Initializes volume is a text container
volume = wibox.widget.textbox()

-- $1 is the volume level of channel
-- $2 is the mute state of the channel
-- "Master" is my channel, to find out your ALSA channel,
-- enter "alsamixer" in your terminal
vicious.register(volume, vicious.widgets.volume,
'<span background="#4B3B51" font="UbuntuMono 12"><span font="UbuntuMono 12" color="#EEEEEE"> Vol:$1 </span></span>', 0.3, "Master")

-- Initializes volumeicon as an image icon
volumeicon = wibox.widget.imagebox()

-- This function is responsible for making the volume icon
-- corespond to the channel volume level
vicious.register(volumeicon, vicious.widgets.volume, function(widget, args)
    -- volume.lua will return:
    -- args[1] as volume level as a string
    -- args[2] as boolean, but in our case we use a special
    -- unicode music character to denote that it is mute
    local paraone = tonumber(args[1])

    if args[2] == "♩" or paraone == 0 then
        --  this is the mute state
        volumeicon:set_image(beautiful.widget_volmute)
    elseif paraone >= 67 and paraone <= 100 then
        -- volume is high
        volumeicon:set_image(beautiful.widget_volhi)
    elseif paraone >= 33 and paraone <= 66 then
        -- volume is medium
        volumeicon:set_image(beautiful.widget_volmed)
    else
        -- volume is low
        volumeicon:set_image(beautiful.widget_vollow)
    end

end, 0.3, "Master")
-- (I highly suggest keeping the 0.3 check-interval at 0.3,
-- otherwise you will notice a delay with the icon as you
-- press the volume buttons on your computer


--{{---| File Size widget |--------------------------------

--  Initializes fswidget to be a text container
fswidget = wibox.widget.textbox()

-- takes a mount point as a parameter:
-- e.g.:  ${/ size_mb} will give you your root partition in
-- Mb.    ${xxx size_mb}  xxx is your path
-- I chose to find the size of my home partition that's
-- being used compared to what's available.
vicious.register(fswidget, vicious.widgets.fs,
'<span background="#D0785D" font="UbuntuMono 12"> <span font="UbuntuMono 12" color="#EEEEEE">${/home used_p}/${/home avail_p} GB </span></span>', 300)

-- Initializes fsicon as a file system icon
fsicon = wibox.widget.imagebox()
fsicon:set_image(beautiful.widget_hdd)


----{{---| Battery widget |--------------------------------

-- Initializes bation as an image
baticon = wibox.widget.imagebox()
baticon:set_image(beautiful.widget_battery)

-- Initializes batwidet as a text container
batwidget = wibox.widget.textbox()

-- "BAT0" will always be your battery arugment (I have never
-- seen a laptop with two batteries)
-- bat.lua can return:
-- $1 = requested state of battery, charging/discharging
-- $2 = charge level in $
-- $3 = remaining time
vicious.register( batwidget, vicious.widgets.bat, '<span background="#92B0A0" font="UbuntuMono 12"><span font="UbuntuMono 12" color="#FFFFFF" background="#92B0A0">$1$2% </span></span>', 1, "BAT0" )


--{{---| Separators widgets |-------------

-- This contains the initializes of the themes .pngs that
-- acts as separators and the images that give rise to the
-- "arrow" in this theme.
--
spr = wibox.widget.textbox()
spr:set_text(' ')
sprd = wibox.widget.textbox()
sprd:set_markup('<span background ="#313131" font="UbuntuMono 12"> </span>')
spr3f = wibox.widget.textbox()
spr3f:set_markup('<span background="#777e76" font="UbuntuMono 12"> </span>')
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
    -- Powerarrow:  the LEFTMOST icon, starting with mail as
    -- seen in the screenshots start at the top, the
    -- RIGHTMOST are at the bottom of this stack
    right_layout:add(spr)
    right_layout:add(arr9)
    right_layout:add(mailicon)
    right_layout:add(arr8)
    right_layout:add(memicon)
    right_layout:add(memwidget)
    right_layout:add(arr7)
    right_layout:add(cpuicon)
    right_layout:add(cpuwidget)
    right_layout:add(arr6)
    right_layout:add(volumeicon)
    right_layout:add(volume)
    right_layout:add(arr5)
    right_layout:add(fsicon)
    right_layout:add(fswidget)
    right_layout:add(arr4)
    right_layout:add(baticon)
    right_layout:add(batwidget)
    right_layout:add(arr3)
    right_layout:add(neticon)
    right_layout:add(netwidget)
    right_layout:add(arr2)
    right_layout:add(spr3f)
    right_layout:add(clockicon)
    right_layout:add(tdwidget)
    right_layout:add(spr3f)
    right_layout:add(arr1)
    right_layout:add(mylayoutbox[s])


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

        -- My implementation of the searchPrompt:
        -- github.com/esn89/searchPrompt
        awful.key({modkey, }, "s",
                function()
                        -- displays textbox prompting user
                        -- to enter search terms
                        awful.prompt.run( {prompt = "Web Search: "},
                        mypromptbox[mouse.screen].widget,
                        -- spawns new firefox tab with
                        -- terminal passing arguments to the
                        -- "awesomesearch" bash script
                        function (...) awful.util.spawn(terminal .. " -e "  .. "awesomesearch " .. ...) end,
                                awful.completion.shell,
                                -- Allows user to cycle through history using up arrows
                                awful.util.getdir("cache") .. "/history")
                        end),


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
