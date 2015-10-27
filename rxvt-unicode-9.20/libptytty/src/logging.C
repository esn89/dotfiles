/*----------------------------------------------------------------------*
 * File:	logging.C
 *----------------------------------------------------------------------*
 *
 * All portions of code are copyright by their respective author/s.
 * Copyright (c) 1992      John Bovey <jdb@ukc.ac.uk>
 *				- original version
 * Copyright (c) 1993      lipka
 * Copyright (c) 1993      Brian Stempien <stempien@cs.wmich.edu>
 * Copyright (c) 1995      Raul Garcia Garcia <rgg@tid.es>
 * Copyright (c) 1995      Piet W. Plomp <piet@idefix.icce.rug.nl>
 * Copyright (c) 1997      Raul Garcia Garcia <rgg@tid.es>
 * Copyright (c) 1998-2001 Geoff Wing <gcw@pobox.com>
 * 				- extensive modifications
 * Copyright (c) 1999      D J Hawkey Jr <hawkeyd@visi.com>
 *				- lastlog support
 * Copyright (c) 2004-2006 Marc Lehmann <schmorp@schmorp.de>
 * Copyright (c) 2006      Emanuele Giaquinta <e.giaquinta@glauco.it>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
 *----------------------------------------------------------------------*/

#include "config.h"

#include "ptytty.h"

#if UTMP_SUPPORT

#ifdef HAVE_UTMPX_H
# include <utmpx.h>
#endif
#ifdef HAVE_UTMP_H
# include <utmp.h>
#endif
#ifdef HAVE_LASTLOG_H
# include <lastlog.h>
#endif

#if !defined(UTMP_FILE)
# if defined(_PATH_UTMP)
#  define UTMP_FILE _PATH_UTMP
# elif defined(PT_UTMP_FILE)
#  define UTMP_FILE PT_UTMP_FILE
# endif
#endif
#if !defined(WTMP_FILE)
# if defined(_PATH_WTMP)
#  define WTMP_FILE _PATH_WTMP
# elif defined(PT_WTMP_FILE)
#  define WTMP_FILE PT_WTMP_FILE
# endif
#endif
#if !defined(WTMPX_FILE)
# if defined(_PATH_WTMPX)
#  define WTMPX_FILE _PATH_WTMPX
# elif defined(PT_WTMPX_FILE)
#  define WTMPX_FILE PT_WTMPX_FILE
# endif
#endif
#if !defined(LASTLOG_FILE)
# if defined(_PATH_LASTLOG)
#  define LASTLOG_FILE _PATH_LASTLOG
# elif defined(PT_LASTLOG_FILE)
#  define LASTLOG_FILE PT_LASTLOG_FILE
# endif
#endif
#if !defined(LASTLOGX_FILE)
# if defined(_PATH_LASTLOGX)
#  define LASTLOGX_FILE _PATH_LASTLOGX
# elif defined(PT_LASTLOGX_FILE)
#  define LASTLOGX_FILE PT_LASTLOGX_FILE
# endif
#endif

#include <pwd.h>

#include <stdio.h>
#include <string.h>

#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <time.h>
#include <errno.h>

/*
 * BSD style utmp entry
 *      ut_line, ut_name, ut_host, ut_time
 * SYSV style utmp (and utmpx) entry
 *      ut_user, ut_id, ut_line, ut_pid, ut_type, ut_exit, ut_time
 */

/* ------------------------------------------------------------------------- */
/*
 * Write a BSD style utmp entry
 */
#if defined(HAVE_STRUCT_UTMP) && !defined(HAVE_UTMP_PID)
static void
write_bsd_utmp (int utmp_pos, struct utmp *ut)
{
  int             fd;

  if (utmp_pos <= 0 || (fd = open (UTMP_FILE, O_WRONLY)) == -1)
    return;

  if (lseek (fd, (off_t) (utmp_pos * sizeof (struct utmp)), SEEK_SET) != -1)
    write (fd, ut, sizeof (struct utmp));
  close (fd);
}
#endif

/* ------------------------------------------------------------------------- */
/*
 * Update a BSD style wtmp entry
 */
#if defined(WTMP_SUPPORT) && !defined(HAVE_UPDWTMP) && defined(HAVE_STRUCT_UTMP)
static void
update_wtmp (const char *fname, const struct utmp *ut)
{
  int             fd, gotlock, retry;
  struct flock    lck;	/* fcntl locking scheme */
  struct stat     sbuf;

  if ((fd = open (fname, O_WRONLY | O_APPEND, 0)) < 0)
    return;

  lck.l_whence = SEEK_END;	/* start lock at current eof */
  lck.l_len = 0;		/* end at ``largest possible eof'' */
  lck.l_start = 0;
  lck.l_type = F_WRLCK;	/* we want a write lock */

  /* attempt lock with F_SETLK; F_SETLKW would cause a deadlock! */
  for (retry = 10, gotlock = 0; retry--;)
    if (fcntl (fd, F_SETLK, &lck) != -1)
      {
        gotlock = 1;
        break;
      }
    else if (errno != EAGAIN && errno != EACCES)
      break;

  if (gotlock)
    {
      if (fstat (fd, &sbuf) == 0)
        if (write (fd, ut, sizeof (struct utmp)) != sizeof (struct utmp))
          ftruncate (fd, sbuf.st_size);	/* remove bad writes */

      lck.l_type = F_UNLCK;	/* unlocking the file */
      fcntl (fd, F_SETLK, &lck);
    }

  close (fd);
}
#endif

/* ------------------------------------------------------------------------- */
#ifdef LASTLOG_SUPPORT
static void
update_lastlog (const char *pty, const char *host)
{
# if defined(HAVE_STRUCT_LASTLOGX) && defined(HAVE_UPDLASTLOGX)
  struct lastlogx llx;
# endif
# ifdef HAVE_STRUCT_LASTLOG
  int             fd;
  struct lastlog  ll;
# endif

# if defined(HAVE_STRUCT_LASTLOGX) && defined(HAVE_UPDLASTLOGX)
  memset (&llx, 0, sizeof (llx));
  llx.ll_tv.tv_sec = time (NULL);
  llx.ll_tv.tv_usec = 0;
  strncpy (llx.ll_line, pty, sizeof (llx.ll_line));
  strncpy (llx.ll_host, host, sizeof (llx.ll_host));
  updlastlogx (LASTLOGX_FILE, getuid (), &llx);
# endif

# ifdef HAVE_STRUCT_LASTLOG
  memset (&ll, 0, sizeof (ll));
  ll.ll_time = time (NULL);
  strncpy (ll.ll_line, pty, sizeof (ll.ll_line));
  strncpy (ll.ll_host, host, sizeof (ll.ll_host));
  if ((fd = open (LASTLOG_FILE, O_RDWR)) != -1)
    {
      if (lseek (fd, (off_t) (getuid () * sizeof (ll)),
                 SEEK_SET) != -1)
        write (fd, &ll, sizeof (ll));
      close (fd);
    }
# endif /* HAVE_STRUCT_LASTLOG */
}
#endif /* LASTLOG_SUPPORT */

#if defined(HAVE_UTMP_PID) || defined(HAVE_STRUCT_UTMPX)
static void
fill_id (char *id, const char *line, size_t id_size)
{
  size_t len = strlen (line);

  if (len > id_size)
    line += len - id_size;
  strncpy (id, line, id_size);
}
#endif

#ifdef HAVE_STRUCT_UTMP
static void
fill_utmp (struct utmp *ut, bool login, int pid, const char *line, const char *user, const char *host)
{
  memset (ut, 0, sizeof (struct utmp));

  strncpy (ut->ut_line, line, sizeof (ut->ut_line));
# ifdef HAVE_UTMP_PID
  fill_id (ut->ut_id, line, sizeof (ut->ut_id));
  ut->ut_pid = pid;
  ut->ut_type = login ? USER_PROCESS : DEAD_PROCESS;
# endif
  ut->ut_time = time (NULL);

  if (login)
    {
# ifdef HAVE_UTMP_PID
      strncpy (ut->ut_user, user, sizeof (ut->ut_user));
# else
      strncpy (ut->ut_name, user, sizeof (ut->ut_name));
# endif
# ifdef HAVE_UTMP_HOST
      strncpy (ut->ut_host, host, sizeof (ut->ut_host));
# endif
    }
}
#endif

#ifdef HAVE_STRUCT_UTMPX
static void
fill_utmpx (struct utmpx *utx, bool login, int pid, const char *line, const char *user, const char *host)
{
  memset (utx, 0, sizeof (struct utmpx));

  // posix says that ut_line is not meaningful for DEAD_PROCESS
  // records, but most implementations of last use ut_line to
  // associate records in wtmp file
  strncpy (utx->ut_line, line, sizeof (utx->ut_line));
  fill_id (utx->ut_id, line, sizeof (utx->ut_id));
  utx->ut_pid = pid;
  utx->ut_type = login ? USER_PROCESS : DEAD_PROCESS;
  utx->ut_tv.tv_sec = time (NULL);
  utx->ut_tv.tv_usec = 0;

  // posix says that ut_user is not meaningful for DEAD_PROCESS
  // records, but solaris utmp_update helper requires that the ut_user
  // field of a DEAD_PROCESS entry matches the one of an existing
  // USER_PROCESS entry for the same line, if any
  strncpy (utx->ut_user, user, sizeof (utx->ut_user));

  if (login)
    {
# ifdef HAVE_UTMPX_HOST
      strncpy (utx->ut_host, host, sizeof (utx->ut_host));
# endif
    }
}
#endif

/* ------------------------------------------------------------------------- */

/*
 * make and write utmp and wtmp entries
 */
void
ptytty_unix::login (int cmd_pid, bool login_shell, const char *hostname)
{
  if (!name || !*name)
    return;

  this->cmd_pid     = cmd_pid;
  this->login_shell = login_shell;

  log_session (true, hostname);
}

void
ptytty_unix::log_session (bool login, const char *hostname)
{
  struct passwd *pwent = getpwuid (getuid ());
  const char *user = (pwent && pwent->pw_name) ? pwent->pw_name : "?";

  const char *pty = name;

  if (!strncmp (pty, "/dev/", 5))
    pty += 5;		/* skip /dev/ prefix */

#ifdef HAVE_STRUCT_UTMP
  struct utmp *tmput;
  struct utmp ut;
  fill_utmp (&ut, login, cmd_pid, pty, user, hostname);
#endif

#ifdef HAVE_STRUCT_UTMPX
  struct utmpx *tmputx;
  struct utmpx utx;
  fill_utmpx (&utx, login, cmd_pid, pty, user, hostname);
#endif

#ifdef HAVE_STRUCT_UTMP
# ifdef HAVE_UTMP_PID
  setutent ();
  if (login || ((tmput = getutid (&ut)) && tmput->ut_pid == cmd_pid))
    pututline (&ut);
  endutent ();
# else
  write_bsd_utmp (utmp_pos, &ut);
# endif
#endif

#ifdef HAVE_STRUCT_UTMPX
  setutxent ();
  if (login || ((tmputx = getutxid (&utx)) && tmputx->ut_pid == cmd_pid))
    pututxline (&utx);
  endutxent ();
#endif

#ifdef WTMP_SUPPORT
  if (login_shell)
    {
# ifdef HAVE_STRUCT_UTMP
#  ifdef HAVE_UPDWTMP
      updwtmp (WTMP_FILE, &ut);
#  else
      update_wtmp (WTMP_FILE, &ut);
#  endif
# endif
# if defined(HAVE_STRUCT_UTMPX) && defined(HAVE_UPDWTMPX)
      updwtmpx (WTMPX_FILE, &utx);
# endif
    }
#endif

#ifdef LASTLOG_SUPPORT
  if (login_shell)
    if (login)
      {
        if (pwent)
          update_lastlog (pty, hostname);
        else
          PTYTTY_WARN ("no entry in password file, not updating lastlog.\n");
      }
#endif
}

/* ------------------------------------------------------------------------- */
/*
 * remove utmp and wtmp entries
 */
void
ptytty_unix::logout ()
{
  if (!cmd_pid)
    return;

  log_session (false, 0);

  cmd_pid = 0;
}

#else
void
ptytty_unix::login (int cmd_pid, bool login_shell, const char *hostname)
{
}
#endif

