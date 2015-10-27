AC_DEFUN([PT_FIND_FILE],
[AC_CACHE_CHECK(for a fallback location of $1, pt_cv_path_$1, [
if test "$cross_compiling" != yes; then
  for file in $3; do
    if test -f "$file"; then
      pt_cv_path_$1=$file
      break
    fi
  done
fi])
if test x$pt_cv_path_$1 != x; then
  AC_DEFINE_UNQUOTED($2, "$pt_cv_path_$1", Define to a fallback location of $1)
elif test "$cross_compiling" = yes; then
  AC_MSG_WARN(Define $2 in config.h manually)
fi])

AC_DEFUN([PTY_CHECK],
[
AC_CHECK_HEADERS( \
  pty.h \
  util.h \
  libutil.h \
  sys/ioctl.h \
  stropts.h \
)

AC_CHECK_FUNCS( \
  revoke \
  _getpty \
  getpt \
  posix_openpt \
  isastream \
  setuid \
  seteuid \
  setreuid \
  setresuid \
)

AC_MSG_CHECKING(for UNIX98 ptys)
AC_LINK_IFELSE(
  [AC_LANG_PROGRAM(
     [[#include <stdlib.h>]],
     [[grantpt(0);unlockpt(0);ptsname(0);]])],
  [unix98_pty=yes
   AC_DEFINE(UNIX98_PTY, 1, "")
   AC_MSG_RESULT(yes)],
  [AC_MSG_RESULT(no)])

if test -z "$unix98_pty"; then
  AC_SEARCH_LIBS(openpty, util, AC_DEFINE(HAVE_OPENPTY, 1, ""))
fi
])

AC_DEFUN([UTMP_CHECK],
[
support_utmp=yes
support_wtmp=yes
support_lastlog=yes

AC_ARG_ENABLE(utmp,
  [AS_HELP_STRING([--enable-utmp],[enable utmp (utmpx) support])],
  [if test x$enableval = xyes -o x$enableval = xno; then
    support_utmp=$enableval
  fi])

AC_ARG_ENABLE(wtmp,
  [AS_HELP_STRING([--enable-wtmp],[enable wtmp (wtmpx) support (requires --enable-utmp)])],
  [if test x$enableval = xyes -o x$enableval = xno; then
    support_wtmp=$enableval
  fi])

AC_ARG_ENABLE(lastlog,
  [AS_HELP_STRING([--enable-lastlog],[enable lastlog support (requires --enable-utmp)])],
  [if test x$enableval = xyes -o x$enableval = xno; then
    support_lastlog=$enableval
  fi])

if test x$support_utmp = xyes; then
  AC_DEFINE(UTMP_SUPPORT, 1, Define if you want to have utmp/utmpx support)
fi
if test x$support_wtmp = xyes; then
  AC_DEFINE(WTMP_SUPPORT, 1, Define if you want to have wtmp support when utmp/utmpx is enabled)
fi
if test x$support_lastlog = xyes; then
  AC_DEFINE(LASTLOG_SUPPORT, 1, Define if you want to have lastlog support when utmp/utmpx is enabled)
fi

AC_CHECK_FUNCS( \
	updwtmp \
	updwtmpx \
	updlastlogx \
)

AC_CHECK_HEADERS(lastlog.h)

case $host in
   *-*-solaris*)
      AC_DEFINE(__EXTENSIONS__, 1, Enable declarations in utmp.h on Solaris when the XPG4v2 namespace is active)
      ;;
esac

dnl# --------------------------------------------------------------------------
dnl# DO ALL UTMP AND WTMP CHECKING
dnl# --------------------------------------------------------------------------
dnl# check for host field in utmp structure

dnl# --------------------------------------------
AC_CHECK_HEADERS(utmp.h,
AC_CHECK_TYPES([struct utmp], [], [], [
#include <sys/types.h>
#include <utmp.h>
])

AC_CHECK_MEMBER([struct utmp.ut_host],
[AC_DEFINE(HAVE_UTMP_HOST, 1, Define if struct utmp contains ut_host)], [], [
#include <sys/types.h>
#include <utmp.h>
])

AC_CHECK_MEMBER([struct utmp.ut_pid],
[AC_DEFINE(HAVE_UTMP_PID, 1, Define if struct utmp contains ut_pid)], [], [
#include <sys/types.h>
#include <utmp.h>
])
) dnl# AC_CHECK_HEADERS(utmp.h

dnl# --------------------------------------------

AC_CHECK_HEADERS(utmpx.h,
AC_CHECK_TYPES([struct utmpx], [], [], [
#include <sys/types.h>
#include <utmpx.h>
])

AC_CHECK_MEMBER([struct utmpx.ut_host],
[AC_DEFINE(HAVE_UTMPX_HOST, 1, Define if struct utmpx contains ut_host)], [], [
#include <sys/types.h>
#include <utmpx.h>
])
) dnl# AC_CHECK_HEADERS(utmpx.h

dnl# --------------------------------------------------------------------------
dnl# check for struct lastlog
AC_CHECK_TYPES([struct lastlog], [], [], [
#include <sys/types.h>
#include <utmp.h>
#ifdef HAVE_LASTLOG_H
#include <lastlog.h>
#endif
])

dnl# check for struct lastlogx
AC_CHECK_TYPES([struct lastlogx], [], [], [
#include <sys/types.h>
#include <utmpx.h>
#ifdef HAVE_LASTLOG_H
#include <lastlog.h>
#endif
])

dnl# --------------------------------------------------------------------------
dnl# FIND FILES
dnl# --------------------------------------------------------------------------

dnl# find utmp
PT_FIND_FILE([utmp], [PT_UTMP_FILE],
["/var/run/utmp" "/var/adm/utmp" "/etc/utmp" "/usr/etc/utmp" "/usr/adm/utmp"])

dnl# --------------------------------------------------------------------------

dnl# find wtmp
PT_FIND_FILE([wtmp], [PT_WTMP_FILE],
["/var/log/wtmp" "/var/adm/wtmp" "/etc/wtmp" "/usr/etc/wtmp" "/usr/adm/wtmp"])
dnl# --------------------------------------------------------------------------

dnl# find wtmpx
PT_FIND_FILE([wtmpx], [PT_WTMPX_FILE],
["/var/log/wtmpx" "/var/adm/wtmpx"])
dnl# --------------------------------------------------------------------------

dnl# find lastlog
PT_FIND_FILE([lastlog], [PT_LASTLOG_FILE],
["/var/log/lastlog" "/var/adm/lastlog"])
dnl# --------------------------------------------------------------------------

dnl# find lastlogx
PT_FIND_FILE([lastlogx], [PT_LASTLOGX_FILE],
["/var/log/lastlogx" "/var/adm/lastlogx"])
])

AC_DEFUN([SCM_RIGHTS_CHECK],
[
case $host in
   *-*-solaris*)
      AC_DEFINE(_XOPEN_SOURCE, 500, Enable declarations of msg_control and msg_controllen on Solaris)
      AC_SEARCH_LIBS(sendmsg, socket)
      ;;
esac

AC_CACHE_CHECK(for unix-compliant filehandle passing ability, pt_cv_can_pass_fds,
[AC_LINK_IFELSE([AC_LANG_PROGRAM([[
#include <stddef.h> // broken bsds (is that redundant?) need this
#include <sys/types.h>
#include <sys/socket.h>
#include <sys/uio.h>
]], [[
{
  msghdr msg;
  iovec iov;
  char buf [100];
  char data = 0;

  iov.iov_base = &data;
  iov.iov_len  = 1;

  msg.msg_iov        = &iov;
  msg.msg_iovlen     = 1;
  msg.msg_control    = buf;
  msg.msg_controllen = sizeof buf;

  cmsghdr *cmsg = CMSG_FIRSTHDR (&msg);
  cmsg->cmsg_level = SOL_SOCKET;
  cmsg->cmsg_type  = SCM_RIGHTS;
  cmsg->cmsg_len   = 100;

  *(int *)CMSG_DATA (cmsg) = 5;

  return sendmsg (3, &msg, 0);
}
]])],[pt_cv_can_pass_fds=yes],[pt_cv_can_pass_fds=no])])
if test x$pt_cv_can_pass_fds = xyes; then
   AC_DEFINE(HAVE_UNIX_FDPASS, 1, Define if sys/socket.h defines the necessary macros/functions for file handle passing)
else
   AC_MSG_ERROR([libptytty requires unix-compliant filehandle passing ability])
fi
])

AC_DEFUN([TTY_GROUP_CHECK],
[
AC_CACHE_CHECK([for tty group], pt_cv_tty_group,
[AC_RUN_IFELSE([AC_LANG_SOURCE([[
#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>
#include <grp.h>

int main()
{
  struct stat st;
  struct group *gr;
  char *tty;
  gr = getgrnam("tty");
  tty = ttyname(0);
  if (gr != 0
      && tty != 0
      && (stat(tty, &st)) == 0
      && st.st_gid == gr->gr_gid)
    return 0;
  else
    return 1;
}]])],[pt_cv_tty_group=yes],[pt_cv_tty_group=no],[pt_cv_tty_group=no])])
if test x$pt_cv_tty_group = xyes; then
  AC_DEFINE(TTY_GID_SUPPORT, 1, "")
fi])

