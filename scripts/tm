#!/bin/bash

tmux new-session -d -s foo 'exec weechat'
tmux split-window -v -p 70
tmux rename-window 'General'
tmux split-window -h -t 2
tmux new-window -n 'Music' 'exec ncmpcpp'
tmux split-window -v
tmux next-window
tmux new-window -d -n 'Ranger' 'exec ranger'
tmux attach-session -t foo
#tmux new-session -d -n 'WindowName'
#tmux split-window -v
#tmux selectp -t 1
#tmux split-window -h
#tmux selectw -t 1
#tmux -2 attach-session -d
