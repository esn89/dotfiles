ZSH=/usr/share/oh-my-zsh/

autoload -U promptinit
promptinit

autoload -Uz compinit
compinit

# .dir_colors!
if [[ -f ~/.dir_colors ]]; then
	eval $(dircolors -b ~/.dir_colors)
elif [[ -f /etc/DIR_COLORS ]]; then
	eval ~(dircolors -b /etc/DIR_COLORS)
else
	eval $(dircolors)
fi

HIST_STAMPS="mm/dd/yyyy"

setopt completeinword
setopt extended_glob

# opening from current dir (termite feature)
if [[ $TERM == xterm-termite ]]; then
        . /etc/profile.d/vte.sh
        __vte_osc7
fi

export EDITOR="vim"
#export DISPLAY=localhost:0
export GTK2_RC_FILES="/home/fenriz/.gtkrc-2.0"
export INFINALITY_FT_USE_KNOWN_SETTINGS_ON_SELECTED_FONTS="true|false"

# Some aliases
alias ls="ls --color=auto --group-directories-first"
alias grep="grep --color=auto"
alias dmesg="dmesg --color"
alias rm="rm -iv"
alias sshp="ssh pi@192.168.1.73 -p 2302 -t tmux a"
alias sshpo="ssh pi@23.16.171.175 -p 2302 -t tmux a"
alias sshu="ssh -YC s2o7@remote.ugrad.cs.ubc.ca"
alias udg="pacaur -Syyu"
alias gimme="sudo pacman -S"
alias doihave="pacman -Ss"
alias chk="ps aux | grep"
alias hst="history | grep"
alias orphans="pacman -Qtd"
alias bspwmrc="vim ~/.config/bspwm/bspwmrc"
alias sxhkdrc="vim ~/.config/sxhkd/sxhkdrc"
alias zshrc="vim ~/.zshrc"
alias vi="vim"
alias python="/usr/bin/python2.7"
alias vimrc="vim ~/.vimrc"

# History search
[[ -n "${key[PageUp]}" ]] && bindkey "${key[PageUp]}" history-beginning-search-backward
[[ -n "${key[PageDown]}" ]] && bindkey "${key[PageDown]}" history-beginning-search-forward

# Set name of the theme to load.
ZSH_THEME="myown"

# Comment this out to disable bi-weekly auto-update checks
DISABLE_AUTO_UPDATE="true"

# Uncomment following line if you want to disable command autocorrection
DISABLE_CORRECTION="true"

# Custom plugins may be added to ~/.oh-my-zsh/custom/plugins/
plugins=(git)
plugins=(zsh-syntax-highlighting)

# Coloured man pages
man() {
	env LESS_TERMCAP_mb=$'\E[01;31m' \
		LESS_TERMCAP_md=$'\E[01;38;5;74m' \
		LESS_TERMCAP_me=$'\E[0m' \
		LESS_TERMCAP_se=$'\E[0m' \
		LESS_TERMCAP_so=$'\E[31;5;246m' \
		LESS_TERMCAP_ue=$'\E[0m' \
		LESS_TERMCAP_us=$'\E[04;38;5;146m' \
		man "$@"
}
zstyle ':completion:*:default' list-colors ${(s.:.)LS_COLORS}


zstyle ':completion::complete:cd::' tag-order '! users' -
zstyle ':completion::complete:-command-::' tag-order '! users' -
zstyle ':completion:*:corrections' format "- %d - (errors %e})"
zstyle ':completion:*:default' list-prompt '%S%M matches%s'
zstyle ':completion:*:descriptions' format "- %d -"
zstyle ':completion:*:*:*:*:hosts' list-colors '=*=30;41'
zstyle ':completion:*:kill:*:processes' command "ps x"
#zstyle ':completion:*:manuals.(^1*)' insert-sections true
zstyle ':completion:*:manuals' separate-sections true
#zstyle ':completion:*:*:*:*:users' list-colors'=*=$color[green]=$color[red]'
zstyle ':completion:*' cache-path ~/.zsh/cache
zstyle ':completion:*' group-name ''
##zstyle ':completion:*' list-colors 'reply=( "=(#b)(*$VAR)(?)*=00=$color[green]=$color[bg-green]" )'
zstyle ':completion:*' list-colors ${(s.:.)LS_COLORS}
#zstyle ':completion:*' menu select
zstyle ':completion:*' use-cache on
#zstyle ':completion:*' verbose yes
zstyle -e ':completion:*:approximate:*' max-errors 'reply=( $(( ($#PREFIX + $#SUFFIX) / 3 )) )'


#compdef bspc
_bspc() {
	local -a commands settings
	commands=('window' 'desktop' 'monitor' 'query' 'pointer' 'rule' 'restore' 'control' 'config' 'quit')
	settings=('external_rules_command' 'status_prefix' 'focused_border_color' 'active_border_color' 'normal_border_color' 'presel_border_color' 'focused_locked_border_color' 'active_locked_border_color' 'normal_locked_border_color' 'focused_sticky_border_color' 'normal_sticky_border_color' 'focused_private_border_color' 'active_private_border_color' 'normal_private_border_color' 'urgent_border_color' 'border_width' 'window_gap' 'top_padding' 'right_padding' 'bottom_padding' 'left_padding' 'split_ratio' 'borderless_monocle' 'gapless_monocle' 'focus_follows_pointer' 'pointer_follows_focus' 'pointer_follows_monitor' 'apply_floating_atom' 'auto_alternate' 'auto_cancel' 'history_aware_focus' 'focus_by_distance' 'ignore_ewmh_focus' 'remove_disabled_monitors' 'remove_unplugged_monitors' 'merge_overlapping_monitors')
	if (( CURRENT == 2 )) ; then
		_values 'command' "$commands[@]"
	elif (( CURRENT == 3 )) ; then
		case $words[2] in
			config)
				_values 'setting' "$settings[@]"
				;;
			*)
				return 1
				;;
		esac
	else
		return 1
	fi
}

_bspc "$@"

source $ZSH/oh-my-zsh.sh
alias grep="/usr/bin/grep $GREP_OPTIONS"
unset GREP_OPTIONS
