#
# Executes commands at the start of an interactive session.
#
# Authors:
#   Sorin Ionescu <sorin.ionescu@gmail.com>
#

# Source Prezto.
if [[ -s "${ZDOTDIR:-$HOME}/.zprezto/init.zsh" ]]; then
  source "${ZDOTDIR:-$HOME}/.zprezto/init.zsh"
fi

# Customize to your needs...
autoload -U promptinit
promptinit

unsetopt correct

autoload -Uz compinit
compinit

# "HIST_STAMPS="mm/dd/yyyy"
setopt completeinword
setopt extended_glob

synclient VertTwoFingerScroll=1
synclient HorizTwoFingerScroll=1
synclient PalmDetect=1
synclient PalmMinWidth=8
synclient PalmMinZ=100

# Menu to Super_L
if [[ $TERM == xterm-termite ]]; then
    . /etc/profile.d/vte-2.91.sh
    __vte_osc7
fi

#export PS1="%F{green}%n%f in %F{blue}%1~%f %(?::%F{red}✖ %f)"
export PS1="%F{green}%n%f in %F{blue}%/%f %(?::%F{red}✖ %f)"
export EDITOR="vim"
#export TERM="rxvt-unicode-256color"
export TERM="screen-256color"
export LC_ALL="en_US.UTF-8"
export LANG="en_US.utf-8"
export LANGUAGE="en_US.UTF-8"
export XDG_CONFIG_HOME="/home/evan/.config"
export LS_COLORS="no=00:fi=00;37:di=00;34:ln=01;36:pi=40;33:so=01;35:bd=40;33;01:cd=40;33;01:or=40;31;01:mi=01;05;37;41:ex=00;32:\
*.sh=00;33:*.cpp=00;33:*.py=00;33:*.c=00;33:*.java=00;33:*.h=00;36:\
*.tar=01;35:*.tgz=01;35:*.taz=01;35:*.zip=01;35:*.gz=01;35:*.bz2=01;35:*.deb=01;35:*.rpm=01;35:*.jar=01;35:*.pkg.tar.gz=01;31;35:\
*.jpg=00;32:*.jpeg=00;32:*.gif=00;32:*.bmp=00;32:*.png=00;32:\
*.mp4=01;36:*.mpg=01;36:*.mpeg=01;36:*.wmv=01;36:*.avi=01;36:\
*.mp3=01;36:*.flac=01;36\
*.odt=00;31:*.pdf=00;31"

export PATH=$PATH:~/.barScripts
export PATH=$PATH:/opt/pgadmin
export HISTSIZE=10000
export FZF_DEFAULT_COMMAND='ag --hidden --ignore .git -g ""'
export FZF_CTRL_T_COMMAND="$FZF_DEFAULT_COMMAND"
export FZF_DEFAULT_OPTS="-e --inline-info"

alias ls="ls --color=auto --group-directories-first"
alias dmesg="dmesg --color"
alias rm="rm -iv"
alias hst="history 1 | grep"
alias sshp="ssh -p 2302 loki@192.168.1.73 -t tmux a"
alias sshpo="empty"
alias udg="sudo apt update && sudo apt upgrade"
alias chk="ps aux | grep"
alias dih="dpkg -l | grep"
alias zshrc="nvim ~/.zshrc"
alias vim="nvim"
alias vimrc="nvim ~/.config/nvim/init.vim"
alias agi="sudo apt install"
alias search="apt search"
alias ver="apt policy"
alias remove="sudo apt remove"
alias autoremove="sudo apt autoremove"
alias purge="sudo apt-get purge"
alias xup="xrdb -merge ~/.Xresources"
alias xdef="vim ~/.Xresources"
alias sbox="thunar sftp://loki@192.168.1.73:2302 &"
alias sourcez="source ~/.zshrc"
alias bspwmrc="vim ~/.config/bspwm/bspwmrc"
alias sxhkdrc="vim ~/.config/sxhkd/sxhkdrc"
alias tunnel="ssh -L 5432:db.null:5432 evann@vmx.null"
alias egrep="egrep --color"
alias gc="git clone"
alias tconf="vim ~/.config/termite/config"

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
#zstyle ':completion::complete:cd::' tag-order '! users' -
#zstyle ':completion::complete:-command-::' tag-order '! users' -
#zstyle ':completion:*:corrections' format "- %d - (errors %e})"
#zstyle ':completion:*:default' list-prompt '%S%M matches%s'
#zstyle ':completion:*:descriptions' format "- %d -"
#zstyle ':completion:*:*:*:*:hosts' list-colors '=*=30;41'
#zstyle ':completion:*:kill:*:processes' command "ps x"
#zstyle ':completion:*:manuals' separate-sections true
#zstyle ':completion:*' cache-path ~/.zsh/cache
#zstyle ':completion:*' group-name ''
#zstyle ':completion:*' list-colors ${(s.:.)LS_COLORS}
#zstyle ':completion:*' use-cache on
#zstyle -e ':completion:*:approximate:*' max-errors 'reply=( $(( ($#PREFIX + $#SUFFIX) / 3 )) )'

# Setup fsearch function
# ----------------------
unalias fsearch 2> /dev/null
fsearch() {
	local pkg="$(apt-cache search "$@" | fzf )"
	local final="$(echo $pkg | awk '{print $1}')"
	if [[ $final != '' ]]; then
		sudo apt-get install $final
	fi
}

# Setup fhist function
# ----------------------
unalias fhist 2> /dev/null
fhist() {
	local cmd="$(history | fzf )"
	local strippedcmd="$(echo $cmd | awk '{$1=$2=$3=""; print $0;}')"
	if [[ $strippedcmd != '' ]]; then
		eval ${strippedcmd}
	fi
}

# Setup flocate function
# ----------------------
unalias flocate 2> /dev/null
flocate() {
	local path="$(locate "$@" | fzf)"
	if [[ $path != '' ]]; then
		cd "$path"
	fi
}

[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh


export NVM_DIR="/home/evan/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm

