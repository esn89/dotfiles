#!/bin/sh
#
# ~/.xinitrc
#
# Executed by startx (run your window manager from here)

xset +fp /usr/share/fonts/local
xset +fp /usr/share/fonts/misc
xset fp rehash
hsetroot -tile /home/ep/Desktop/wallpapers/wallpaper2.jpg &
xsetroot -cursor_name left_ptr &
xmodmap -e ~/.speedswapper &
if [ -d /etc/X11/xinit/xinitrc.d ]; then
  for f in /etc/X11/xinit/xinitrc.d/*; do
    [ -x "$f" ] && . "$f"
  done
  unset f
fi

compton &

# Set Xresources to be sourced
#[[ -f ~/.Xresources ]] && xrdb -merge ~/.Xresources

#exec awesome
sxhkd &
#exec bspwm

[ -e "$PANEL_FIFO" ] && rm "$PANEL_FIFO"
mkfifo "$PANEL_FIFO"
exec bspwm -s "$PANEL_FIFO" -p W
