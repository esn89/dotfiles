emulate sh -c 'source /etc/profile'

export XDG_CONFIG_HOME="/home/ep/.config"
export BSPWM_SOCKET="/tmp/bspwm-socket"
export PANEL_FIFO="/tmp/panel-fifo"
export PATH=$PATH:~/Desktop/somedir/


[[ -z $DISPLAY && $XDG_VTNR -eq 1 ]] && exec startx
