local simple='%{$fg[green]%}%n %{$fg[white]%}in %{$fg_bold[blue]%}%c%{$reset_color%}'

local rvm=''
if which rvm-prompt &> /dev/null; then
        rvm='%{$fg[green]%}‹$(rvm-prompt i v g)›%{$reset_color%}'
else
        if which rbenv &> /dev/null; then
                rvm='%{$fg[green]%}‹$(rbenv version | sed -e "s/ (set.*$//")›%{$reset_color%}'
        fi
fi

local return_code='%(?..%{$fg[red]%}✗ %{$reset_color%})'

PROMPT="${simple} ${return_code}"
