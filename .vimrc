if has("syntax")
        syntax on
endif

set nocompatible
filetype off

set rtp+=~/.vim/bundle/Vundle.vim/
call vundle#begin()
filetype plugin indent on
syntax on

Plugin 'gmarik/Vundle.vim'
""""""""""""""""""""""""""""""""
Plugin 'scrooloose/syntastic'
Plugin 'majutsushi/tagbar'
Plugin 'Yggdroot/indentLine'
Plugin 'itchyny/lightline.vim'
Plugin 'xolox/vim-misc'
Plugin 'xolox/vim-easytags'
Plugin 'Valloric/YouCompleteMe'
Plugin 'chriskempson/base16-vim'
""""""""""""""""""""""""""""""""

call vundle#end()
filetype plugin indent on

set modelines=0

" Tell my terminal to go into 256 color mode
set t_Co=256

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
set noexpandtab
set cindent
set autoindent
set smartindent

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

"  --- Powerline is temporarily scrapped in favor of
"  lightline ---
"let g:Powerline_symbols = 'fancy'
"let g:airline_theme='base16'
"let g:airline_powerline_fonts=1
"
" --- Lightline settings ---
let g:lightline = {
      \ 'colorscheme': 'wombat',
      \ 'active': {
      \   'right': [ [ 'syntastic', 'lineinfo' ], ['percent'], [ 'fileformat', 'fileencoding', 'filetype' ] ]
      \ },
      \ 'component': {
      \   'readonly': '%{&readonly?"⭤":""}',
      \ },
      \ 'component_expand': {
      \   'syntastic': 'SyntasticStatuslineFlag',
      \ },
      \ 'component_type': {
      \   'syntastic': 'error',
      \ }
      \ }

augroup AutoSyntastic
  autocmd!
  autocmd BufWritePost * call s:syntastic()
augroup END
function! s:syntastic()
  SyntasticCheck
  call lightline#update()
endfunction

" Turn off the start up message
set shortmess+=I

" Turn off recording mode
nnoremap q <nop>

" Hide the default mode text before the statusline
set noshowmode

" Change the : into ; so you don't have to press shift
nnoremap ; :

" Allows me to do :Q! as well as :q
command -bang Q quit<bang>

" Change the backspace so it acts as it should
set backspace=eol,start,indent
set ft=c
set fo+=c
set tw=60

" Set Java file type properties:
autocmd Filetype java setlocal ts=4 sts=4 sw=4 noexpandtab
" Set CPP file type properties:
autocmd Filetype cpp setlocal ts=8 sts=8 sw=8

autocmd Filetype python setlocal ts=4 sts=4 sw=4 textwidth=80 smarttab expandtab smartindent cinwords=if,elif,else,for,while,try,except,finally,def,class

autocmd Filetype c setlocal ts=8 sts=8 sw=8 textwidth=80 smarttab noexpandtab

" No Swap files
set noswapfile

" For easytags
let g:easytags_updatetime_min=4

" For tagbar toggle
nmap <F8> :TagbarToggle<CR>

" For YouCompleteMe
let g:ycm_server_keep_logfiles = 1
let g:ycm_server_log_level = 'debug'
let g:ycm_path_to_python_interpreter = '/usr/bin/python2.7'

set mouse=a
map <ScrollWheelUp> <C-Y>
map <ScrollWheelDown> <C-E>

function! s:GetFromFile(...)
        execute 'r! sed -n '. a:1 .','. a:2 .'p '. a:3
endf
command -nargs=+ -complete=file GetFromFile call s:GetFromFile(<f-args>)

let g:loaded_matchparen=0

set lazyredraw
set ttyfast
