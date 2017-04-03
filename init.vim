if has("syntax")
	syntax on
endif

set nocompatible

filetype off

syntax on

call plug#begin('~/.config/nvim/plugged')
Plug 'itchyny/lightline.vim'
Plug 'benekastah/neomake'
"Plug 'Valloric/YouCompleteMe'
Plug 'Shougo/deoplete.nvim', { 'do': ':UpdateRemotePlugins' }
Plug 'zchee/deoplete-jedi'
Plug 'exu/pgsql.vim'
Plug 'hashivim/vim-terraform'
"Plug 'w0ng/vim-hybrid'
"Plug 'chriskempson/vim-tomorrow-theme'
"Plug 'romainl/Apprentice'
"Plug 'NLKNguyen/papercolor-theme'
Plug 'morhetz/gruvbox'
Plug 'saltstack/salt-vim'
Plug 'junegunn/fzf', { 'dir': '~/.config/nvim/.fzf', 'do': 'yes \| ./install' }
Plug 'ctrlpvim/ctrlp.vim'
Plug 'tpope/vim-surround'
call plug#end()

filetype plugin indent on
set modelines=0

" Follow the leader!
let mapleader = "\<Space>"

" Turns on line numbers "
set number
set laststatus=2
set encoding=utf-8

" Select theme
"colorscheme Tomorrow-Night
"colorscheme alduin
"let g:gruvbox_contrast_dark = 'hard'
colorscheme gruvbox
set background=dark

" Folds
set foldmethod=indent
set foldnestmax=10
set nofoldenable
set foldlevel=1
set foldnestmax=1

" My default indentation settings "
"set tabstop=8
"set shiftwidth=8
"set softtabstop=8
"set noexpandtab
"set cindent
set autoindent
set smartindent

" Turns off F1 as the help key
inoremap <F1> <ESC>
nnoremap <F1> <ESC>
vnoremap <F1> <ESC>

" No annoying sound on errors:
set noerrorbells

" No annoying visual errors either
set novisualbell

" Wraps words that are too long
" Want word wrapping, but only want
" line breaks inserted when you explicitly press the Enter key:
set wrap
set linebreak
set nolist

" Searching
set ignorecase  "case insensitive

" Sets F3 to cancel the highlighting
nnoremap <Leader>h :set hlsearch!<CR>
set hlsearch
set incsearch

" Do smart case matching
set smartcase

" Sets the paste togle button to F2
set pastetoggle=<Leader>a

" Uncomment the following to have Vim jump to the last position when
" reopening a file
if has("autocmd")
	au BufReadPost * if line("'\"") > 1 && line("'\"") <= line("$") | exe "normal! g'\"" | endif
endif

" Automatically remove trailing white space
autocmd BufRead,BufWrite * if ! &bin | silent! %s/\s\+$//ge | endif

" Turn off the start up message
set shortmess+=I

" Turn off recording mode
"nnoremap q <nop>

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
"autocmd Filetype java setlocal ts=4 sts=4 sw=4 noexpandtab

" Set cpp type properties:
autocmd Filetype cpp setlocal ts=8 sts=8 sw=8

" Set python file type properties:
autocmd Filetype python setlocal ts=4 sts=4 sw=4 textwidth=80 colorcolumn=80 smarttab expandtab smartindent cinwords=if,elif,else,for,while,try,except,finally,def,class
" autocmd Filetype python setlocal ts=4 sts=4 sw=4 textwidth=80 smarttab expandtab smartindent cinwords=if,elif,else,for,while,try,except,finally,def,class

" Set c file type properties:
"autocmd Filetype c setlocal ts=8 sts=8 sw=8 textwidth=80 smarttab noexpandtab

" For Makefiles
autocmd FileType make set noexpandtab

" No Swap files:
set noswapfile




" --- Lightline settings ---
let g:lightline = {
			\ 'colorscheme': 'PaperColor',
			\ 'active': {
			\   'right': [ [ 'lineinfo' ], ['percent'], [ 'fileformat', 'fileencoding', 'filetype' ] ]
			\ },
			\ 'component': {
			\   'readonly': '%{&readonly?"⭤":""}',
			\ },
			\ 'component_function': {
			\   'ctrlpmark': 'CtrlPMark',
			\ },
			\ 'component_expand': {
			\   'syntastic': 'SyntasticStatuslineFlag',
			\ },
			\ 'component_type': {
			\   'syntastic': 'error',
			\ }
			\ }

" --- Neomake settings ---
autocmd! BufWritePost * Neomake
let g:neomake_cpp_enable_makers = ['clang']
let g:neomake_cpp_clang_maker = {
	\ 'exe' : 'clang'
	\ }
let g:neomake_python_enable_makers = ['flake8']
let g:neomake_python_flake8_maker = {
	\ 'exe' : 'flake8'
	\ }

let g:neomake_sh_enable_makers = ['shellcheck']
let g:neomake_sh_shellcheck_maker = {
	\ 'exe' : 'shellcheck',
	\ 'args' : ['-fgcc'],
	\ 'errorformat':
            \ '%f:%l:%c: %trror: %m,' .
            \ '%f:%l:%c: %tarning: %m,' .
            \ '%I%f:%l:%c: Note: %m',
	\ }
function! LocationNext()
  try
    lnext
  catch
    try | lfirst | catch | endtry
  endtry
endfunction

" --- YouCompleteMe settings ---

" Stop YCM from opening scratchpad
set completeopt=menu,menuone
" let g:syntastic_error_symbol="✗"
" let g:syntastic_warning_symbol="⚠"
" let g:syntastic_style_warning_symbol="⚑"
" let g:syntastic_style_error_symbol="⚑"

"let g:ycm_global_ycm_extra_conf = '/home/evan/.ycm_extra_conf.py'
"let g:ycm_server_keep_logfiles = 1
"let g:ycm_server_log_level = 'debug'
"let g:ycm_path_to_python_interpreter = '/usr/bin/python2.7'
"let g:ycm_confirm_extra_conf = 0
"let g:ycm_echo_current_diagnostic = 1

" Mouse settings
set mouse=a
map <ScrollWheelUp> <C-Y>
map <ScrollWheelDown> <C-E>

" Function to pull lines from other files
function! s:GetFromFile(...)
	execute 'r! sed -n '. a:1 .','. a:2 .'p '. a:3
endf
command -nargs=+ -complete=file GetFromFile call s:GetFromFile(<f-args>)

let g:loaded_matchparen=0

set lazyredraw
" set ttyfast

" Easier Split Navigation
nnoremap <C-J> <C-W><C-J>
nnoremap <C-K> <C-W><C-K>
nnoremap <C-L> <C-W><C-L>
nnoremap <C-H> <C-W><C-H>
set splitbelow
set splitright

"nnoremap <Leader>o :Locate /home/evan/<CR>
nnoremap <Leader>o :CtrlP ~<CR>
nnoremap <Leader>w :w<CR>
nnoremap <Leader>l :call LocationNext()<cr>
nnoremap <Leader>k :lprevious<CR>
nnoremap <Leader>v :PlugUpdate<CR>

" Copy & paste to & from system clipboard with <Space>y &
" <Space>p (must compile vim with +xclipboard)
vmap <Leader>y "+y
vmap <Leader>d "+d
nmap <Leader>p "+p
nmap <Leader>P "+P
vmap <Leader>p "+p
vmap <Leader>P "+P

" Automatically jump to the end of the text you pasted:
vnoremap <silent> y y`]
vnoremap <silent> p p`]
nnoremap <silent> p p`]

" Go to line number without having to shift+g
nnoremap <CR> G
nnoremap <BS> gg


""" Uses <Leader>u for commenting blocks of code
""" The entire chunk from 291 - 311 does that"
nnoremap <Leader>u :<c-u>.,.+<c-r>=v:count<cr>call <SID>toggleComment()<cr>
nnoremap <Leader>u :<c-u>set opfunc=<SID>commentOp<cr>g@
xnoremap <Leader>u :call <SID>toggleComment()<cr>

function! s:commentOp(...)
  '[,']call s:toggleComment()
endfunction

function! s:toggleComment() range
  let comment = substitute(get(b:, 'commentstring', &commentstring), '\s*\(%s\)\s*', '%s', '')
  let pattern = '\V' . printf(escape(comment, '\'), '\(\s\{-}\)\s\(\S\.\{-}\)\s\=')
  let replace = '\1\2'
  if getline('.') !~ pattern
    let indent = matchstr(getline('.'), '^\s*')
    let pattern = '^' . indent . '\zs\(\s*\)\(\S.*\)'
    let replace = printf(comment, '\1 \2' . (comment =~ '%s$' ? '' : ' '))
  endif
  for lnum in range(a:firstline, a:lastline)
    call setline(lnum, substitute(getline(lnum), pattern, replace, ''))
  endfor
endfunction
"""

" Make the switch from modes have no delay
set ttimeoutlen=0

" Spaces out var=a to var = a:
nnoremap <leader>= :s/\(\w\+\)=\(\w\+\)/\1 = \2/g<CR>

"""""""" fzf.vim stuff """""""
"
"" How to open/split
"let g:fzf_action = {
"      \ 'ctrl-x': 'split',
"      \ 'ctrl-v': 'vsplit'
"      \ }
"
"" A Locate command
"command! -nargs=1 Locate call fzf#run(
"      \ {'source': 'locate <q-args>', 'sink': 'e', 'options': '-me'})
"
"" Default fzf layout
"" " - down / up / left / right
"" " - window (nvim only)
"let g:fzf_layout = { 'down': '~30%' }
"
"" Advanced customization using autoload functions
"autocmd VimEnter * command! Colors
"  \ call fzf#vim#colors({'left': '15%', 'options': '--reverse --margin 30%,0'})

" So that YCM can detect Python
let g:python_host_prog = '/usr/bin/python2.7'

let g:ctrlp_map = '<c-p>'
let g:ctrlp_cmd = 'CtrlP'
let g:ctrlp_cache_dir = $HOME . '/.cache/ctrlp'
let g:ctrlp_show_hidden = 1
let g:ctrlp_clear_cache_on_exit=0
let g:ctrlp_mruf_max=100

set wildignore+=*/tmp/*,*.so,*.swp,*.zip
"let g:ctrlp_custom_ignore = '\v[\/]\.(aptitude|cache|compiled|dbus|fonts|frozenwasteland|gconf|gimp-2.8|gnome|gnupg|gstreamer-0.10|local|lyrics|mozilla|oh-my-zsh|pki|PlayOnLinux|puddletag|qws|ssh|steam|terminfo|thumbnails|wine)$'

let g:ctrlp_custom_ignore = {
  \ 'dir':  '\v[\/]\.(barScripts|devpi|wine)$',
  \ 'file': '\v\.(exe|so|dll)$',
  \ 'link': 'some_bad_symbolic_links',
  \ }

" Removes String Background Color:
highlight String ctermbg=none guibg=none

let g:sql_type_default = 'pgsql'
autocmd BufNewFile,BufRead *.sql setf pgsql

let g:deoplete#enable_at_startup = 1
inoremap <expr><TAB>  pumvisible() ? "\<C-n>" : "\<TAB>"
let g:deoplete#sources#jedi#show_docstring = 1

" For 80 width column:
tnoremap <Esc> <C-\><C-n>

"let $NVIM_TUI_ENABLE_TRUE_COLOR=1

nnoremap <buffer> <F9> :exec '!python' shellescape(@%, 1)<cr>

let g:terraform_fmt_on_save = 1
