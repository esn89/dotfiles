export XDG_CONFIG_HOME="/home/fenriz/.config"
export BSPWM_SOCKET="/tmp/bspwm-socket"
export PANEL_FIFO="/tmp/panel-fifo"
export PATH=$PATH:/home/fenriz/.barShit

[[ -z $DISPLAY && $XDG_VTNR -eq 1 ]] && exec startx
