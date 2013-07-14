local wibox = require("wibox")
local awful = require("awful")

volume_widget = wibox.widget.textbox()
volume_widget:set_align("right")

function update_volume(widget)
   local fd = io.popen("amixer sget Master")
   local status = fd:read("*all")
   fd:close()

   -- local volume = tonumber(string.match(status, "(%d?%d?%d)%%")) / 100
   local volume = string.match(status, "(%d?%d?%d)%%")
   volume = string.format("% 3d", volume)

   status = string.match(status, "%[(o[^%]]*)%]")

   -- -- -- starting colour
   --  local sr, sg, sb = 0x3F, 0x3F, 0x3F
   -- -- ending colour
   --  local er, eg, eb = 0xDC, 0xDC, 0xCC

   --  local ir = volume * (er - sr) + sr
   --  local ig = volume * (eg - sg) + sg
   --  local ib = volume * (eb - sb) + sb
   -- interpol_colour = string.format("%.2x%.2x%.2x", ir, ig, ib)
   if string.find(status, "on", 1, true) then
       --volume = " <span background='#" .. interpol_colour .. "'>   </span>"
       volume = volume .. "%"
   else
       --volume = " <span color='red' background='#" .. interpol_colour .. "'> M </span>"
       volume = volume .. "M"
       
   end
   widget:set_markup(volume)
end

update_volume(volume_widget)

mytimer = timer({ timeout = 0.2 })
mytimer:connect_signal("timeout", function () update_volume(volume_widget) end)
mytimer:start()
