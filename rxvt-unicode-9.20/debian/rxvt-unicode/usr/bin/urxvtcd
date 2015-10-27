#!/bin/sh

urxvtc "$@"
if [ $? -eq 2 ]; then
    urxvtd -q -f
    exec urxvtc "$@"
fi
