ZSH=/home/fenriz/.oh-my-zsh

autoload -U promptinit
promptinit

autoload -Uz compinit
compinit

HIST_STAMPS="mm/dd/yyyy"

setopt completeinword
setopt extended_glob

export EDITOR="vim"
export LC_ALL="en_US.UTF-8"
export GTK2_RC_FILES="/home/fenriz/.gtkrc-2.0"
# This is for compiling your own vte
#export PATH=$PATH:/etc/ld.so.conf.d/vte.conf
export DEXTERNAL_LIBCLANG_PATH="/usr/lib/llvm-3.4/lib/libclang.so"
export XDG_CONFIG_HOME="/home/fenriz/.config"
#export TERM="xterm-termite"
export TERM="screen-256color"
export LS_COLORS="no=00:fi=00;37:di=00;34:ln=01;36:pi=40;33:so=01;35:bd=40;33;01:cd=40;33;01:or=40;31;01:mi=01;05;37;41:ex=00;32:\
*.sh=00;33:*.cpp=00;33:*.py=00;33:*.c=00;33:*.java=00;33:*.h=00;36:\
*.tar=01;35:*.tgz=01;35:*.taz=01;35:*.zip=01;35:*.gz=01;35:*.bz2=01;35:*.deb=01;35:*.rpm=01;35:*.jar=01;35:*.pkg.tar.gz=01;31;35:\
*.jpg=00;32:*.jpeg=00;32:*.gif=00;32:*.bmp=00;32:*.png=00;32:\
*.mp4=01;36:*.mpg=01;36:*.mpeg=01;36:*.wmv=01;36:*.avi=01;36:\
*.mp3=01;36:*.flac=01;36\
*.odt=00;31:*.pdf=00;31"

# Some aliases
alias ls="ls --color=auto --group-directories-first"
alias grep="grep --color=auto"
alias dmesg="dmesg --color"
alias rm="rm -iv"
alias sshp="ssh pi@192.168.1.73 -p 2302 -t tmux a"
alias sshpo="ssh pi@23.16.171.175 -p 2302 -t tmux a"
alias sshu="ssh -YC @remote.schoolnamehere.ca"
alias udg="sudo apt-get update && sudo apt-get upgrade"
alias chk="ps aux | grep"
alias hst="history | grep"
alias orphans="pacman -Qtd"
alias bspwmrc="vim ~/.config/bspwm/bspwmrc"
alias sxhkdrc="vim ~/.config/sxhkd/sxhkdrc"
alias zshrc="vim ~/.zshrc"
alias vi="vim"
alias python="/usr/bin/python2.7"
alias vimrc="vim ~/.vimrc"
alias agi="sudo apt-get install"
alias search="apt-cache search"
alias ver="apt-cache policy"
alias remove="sudo apt-get remove"
alias purge="sudo apt-get purge"

# For two finger vert scroll:
synclient VertTwoFingerScroll=1
# For two finger horiz scroll
synclient HorizTwoFingerScroll=1

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

source $ZSH/oh-my-zsh.sh
