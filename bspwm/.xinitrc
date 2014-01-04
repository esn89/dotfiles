#!/bin/sh

xset +fp /usr/share/fonts/local
xset +fp /usr/share/fonts/misc
xset +fp $HOME/.fonts
xset fp rehash

# Save my eyes
redshift -l 49.26:-123.23 &
# Capslock = Escape
if [ -s ~/.xmodmaprc ]; then
    xmodmap ~/.xmodmaprc
fi
# Normal cursor
xsetroot -cursor_name left_ptr &
# Sets my warrpaper
hsetroot -tile /home/fenriz/Pictures/wallpaper.jpg &

# Makes things nice 'n shadowy
compton &

# Auto mounts USB to /media/
udiskie &

# Sets my bspwm rules
rulc -l > /dev/null || ruld &

# Turns off the system bell
/usr/bin/xset b off &

if [ -d /etc/X11/xinit/xinitrc.d ]; then
  for f in /etc/X11/xinit/xinitrc.d/*; do
    [ -x "$f" ] && . "$f"
  done
  unset f
fi

# Set Xresources to be sourced
[[ -f ~/.Xresources ]] && xrdb -merge ~/.Xresources

sxhkd &
[ -e "$PANEL_FIFO" ] && rm "$PANEL_FIFO"
mkfifo "$PANEL_FIFO"
exec bspwm -s "$PANEL_FIFO" -p W
