# Path to your oh-my-zsh configuration.
ZSH=/usr/share/oh-my-zsh/

autoload -U compinit promptinit
compinit
promptinit

#autocompletion
autoload -U compinit
compinit

# .dir_colors!
if [[ -f ~/.dir_colors ]]; then
        eval $(dircolors -b ~/.dir_colors)
elif [[ -f /etc/DIR_COLORS ]]; then
        eval ~(dircolors -b /etc/DIR_COLORS)
else
        eval $(dircolors)
fi

# opening from current dir (termite feature)

if [[ $TERM == xterm-termite ]]; then
        . /etc/profile.d/vte.sh
        __vte_osc7
fi

export EDITOR="vim"
export XDG_CONFIG_HOME="/home/ep/.config"
export BSPWM_SOCKET="/tmp/bspwm-socket"
export GTK2_RC_FILES="/usr/share/themes/FlatStudioDark/gtk-2.0/gtkrc"
# Some aliases
alias ls="ls --color=auto"
alias dir="dir --color=auto"
alias grep="grep --color=auto"
alias dmesg="dmesg --color"
alias rm="rm -iv"

# History search
[[ -n "${key[PageUp]}" ]] && bindkey "${key[PageUp]}" history-beginning-search-backward
[[ -n "${key[PageDown]}" ]] && bindkey "${key[PageDown]}" history-beginning-search-forward

# Set name of the theme to load.
# Look in ~/.oh-my-zsh/themes/
# Optionally, if you set this to "random", it'll load a random theme each
# time that oh-my-zsh is loaded.
ZSH_THEME="myown"

# Example aliases
# alias zshconfig="mate ~/.zshrc"
# alias ohmyzsh="mate ~/.oh-my-zsh"

# Set to this to use case-sensitive completion
# CASE_SENSITIVE="true"

# Comment this out to disable bi-weekly auto-update checks
DISABLE_AUTO_UPDATE="true"

# Uncomment to change how often before auto-updates occur? (in days)
# export UPDATE_ZSH_DAYS=13

# Uncomment following line if you want to disable colors in ls
# DISABLE_LS_COLORS="true"

# Uncomment following line if you want to disable autosetting terminal title.
# DISABLE_AUTO_TITLE="true"

# Uncomment following line if you want to disable command autocorrection
DISABLE_CORRECTION="true"

# Uncomment following line if you want red dots to be displayed while waiting for completion
# COMPLETION_WAITING_DOTS="true"

# Uncomment following line if you want to disable marking untracked files under
# VCS as dirty. This makes repository status check for large repositories much,
# much faster.
# DISABLE_UNTRACKED_FILES_DIRTY="true"

# Which plugins would you like to load? (plugins can be found in ~/.oh-my-zsh/plugins/*)
# Custom plugins may be added to ~/.oh-my-zsh/custom/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
plugins=(git)
plugins=(zsh-syntax-highlighting)

source $ZSH/oh-my-zsh.sh

# Customize to your needs...
