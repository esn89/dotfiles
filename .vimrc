if has("syntax")
  syntax on
endif

"  First, a few lines that I  absolutely must have "

call pathogen#infect()
call pathogen#helptags()
execute pathogen#infect()
filetype off
call pathogen#runtime_append_all_bundles()
filetype plugin indent on
syntax on

" Not compatible with vi
set nocompatible

set modelines=0

" Tell my terminal to go into 256 color mode
set t_Co=256
set term=xterm-256color


" Define which version of molokai
"colorscheme molokai
"let g:molokai_original = 1
"let g:rehash256 = 1

" Sets the colors of my vertical indent lines
let g:indentLine_color_term = 239

" Select theme
let base16colorspace=256
set background=dark
colorscheme base16-default


" My default indentation settings "
set tabstop=8
set shiftwidth=8
set softtabstop=8
set expandtab
set cindent
set autoindent
set smartindent

" Turns of arrow keys and makes the J and K behave correctly "
nnoremap <up> <nop>
nnoremap <down> <nop>
nnoremap <left> <nop>
nnoremap <right> <nop>
inoremap <up> <nop>
inoremap <down> <nop>
inoremap <left> <nop>
inoremap <right> <nop> nnoremap j gj
nnoremap k gk
""TURNS OFF F1 AS HELP KEY"""""
inoremap <F1> <ESC>
nnoremap <F1> <ESC>
vnoremap <F1> <ESC>
"""""""""For indented tabs""""""""""""""""""""""

set list lcs=tab:\|\
hi Conceal ctermfg=white ctermbg=NONE

" No annoying sound on errors:  "
set noerrorbells

" No annoying visual errors either "
set novisualbell

" Turns on line numbers "
set number

" Wraps words that are too long
" Want word wrapping, but only want line breaks inserted when you explicitly press the Enter key:
set wrap
set linebreak
set nolist

" Searching"
set ignorecase  "case insensitive

" Highlighted Search terms:"
set hlsearch!

" Sets F3 to cancel the highlighting "
nnoremap <F3> :set hlsearch!<CR>

" Do smart case matching
set smartcase

" Sets the paste togle button to F2
set pastetoggle=<F2>

" Next tab
nnoremap <silent> <C-l> :tabn<CR>

" Previous tab
nnoremap <silent> <C-h> :tabp<CR>

" New tab
nnoremap <silent> <C-t> :tabnew<CR>

" Uncomment the following to have Vim jump to the last position when
" reopening a file
if has("autocmd")
  au BufReadPost * if line("'\"") > 1 && line("'\"") <= line("$") | exe "normal! g'\"" | endif
endif

" Automatically remove trailing white space
autocmd BufRead,BufWrite * if ! &bin | silent! %s/\s\+$//ge | endif

" Calls the absolute path to Powerline installation directory
set laststatus=2
set encoding=utf-8
"let g:Powerline_symbols = 'fancy'
let g:airline_theme='light'
let g:airline_powerline_fonts=1

" Turn off the start up message
set shortmess+=I

" Turn off recording mode
nnoremap q <nop>

" Hide the default mode text before the statusline
set noshowmode

" Change the : into ; so you don't have to press shift
nnoremap ; :

" Change the backspace so it acts as it should
set backspace=eol,start,indent
set ft=c
set fo+=c
set tw=60

" Set Java file type properties:
autocmd Filetype java setlocal ts=4 sts=4 sw=4 noexpandtab
" Set CPP file type properties:
autocmd Filetype cpp setlocal ts=8 sts=8 sw=8

autocmd Filetype python setlocal ts=4 sts=4 sw=4 textwidth=80 smarttab expandtab

autocmd Filetype c setlocal ts=8 sts=8 sw=8 textwidth=80 smarttab expandtab

" No Swap files
set noswapfile
