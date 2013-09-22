#!/bin/sh
#
# ~/.xinitrc
#
# Executed by startx (run your window manager from here)

if [ -d /etc/X11/xinit/xinitrc.d ]; then
  for f in /etc/X11/xinit/xinitrc.d/*; do
    [ -x "$f" ] && . "$f"
  done
  unset f
fi

# Set Xresources to be sourced
[[ -f ~/.Xresources ]] && xrdb -merge ~/.Xresources

udiskie &
exec awesome
## ...or the Window Manager of your choice
#gsettings-data-convert &
#xdg-user-dirs-gtk-update &
#/usr/lib/polkit-gnome/polkit-gnome-authentication-agent-1 &
#/usr/lib/gnome-settings-daemon/gnome-settings-daemon &
#/usr/lib/gnome-user-share/gnome-user-share &
#eval $(gnome-keyring-daemon --start --components=pkcs11,secrets,ssh,gpg)
#export GNOME_KEYRING_CONTROL GNOME_KEYRING_PID GPG_AGENT_INFO SSH_AUTH_SOCK
#exec cerbere
#exec dbus-launch gala &
