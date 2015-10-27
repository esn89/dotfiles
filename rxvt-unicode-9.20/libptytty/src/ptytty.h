#ifndef PTYTTY_H
#define PTYTTY_H

#include "libptytty.h"
#include "ptytty_conf.h"

#if defined(HAVE__GETPTY) || defined(HAVE_OPENPTY) || defined(UNIX98_PTY)
# define NO_SETOWNER_TTYDEV 1
#endif

#if UTMP_SUPPORT
# if defined(__GLIBC__)
#  undef HAVE_STRUCT_UTMPX
# endif

# if ! defined(HAVE_STRUCT_UTMPX) && ! defined(HAVE_STRUCT_UTMP)
#  error cannot build with utmp support - no utmp or utmpx struct found
# endif

#endif

struct ptytty_unix : ptytty
{
  char *name;

  void log_session (bool login, const char *hostname);

public:

  ptytty_unix ();
  ~ptytty_unix ();

  bool get ();
  void put ();

  void login (int cmd_pid, bool login_shell, const char *hostname);

#if UTMP_SUPPORT
  int utmp_pos;
  int cmd_pid;
  bool login_shell;

  void logout ();
#endif
};

#endif

