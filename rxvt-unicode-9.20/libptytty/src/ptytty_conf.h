/*
 * This file contains a few tunables for libptytty. Normally there should
 * be little reason to change this file. It is provided to suit rare or
 * special cases only.
 */

/*
 * Default mode to restore when releasing the PTS device. It is relaxed to be
 * compatible with most systems, change it to a more secure value if your
 * system supports it (0640 for example).
 */
#ifndef RESTORE_TTY_MODE
# define RESTORE_TTY_MODE 0666
#endif

/*
 * Define if you want to use a separate process for pty/tty handling
 * when running setuid/setgid. You need this when making it setuid/setgid.
 */
#ifndef PTYTTY_HELPER
# define PTYTTY_HELPER 1
#endif

/*
 * Define if you want to use a single helper process from multiple
 * threads OR forked processes. Without it, the user is responsible for
 * serialising all calls to libptytty functions. Having it disabled
 * avoids some syscalls and reduces codesize, but unless you are really
 * short on cpu or memory, it's not worth disabling.
 */
#ifndef PTYTTY_REENTRANT
# define PTYTTY_REENTRANT 1
#endif

/*
 * printf-like functions to be called on fatal conditions
 * (must exit), or warning conditions (only print message)
 */
#ifndef PTYTTY_FATAL
#define PTYTTY_FATAL(msg) do { PTYTTY_WARN (msg); _exit (1); } while (0)
#endif
#ifndef PTYTTY_WARN
#define PTYTTY_WARN(msg) fputs (msg, stderr)
#endif

