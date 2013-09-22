#!/usr/bin/python2
'''
[cat |] %prog [-g id | -d id | [-i id1 file1 .. -i idN fileN] file1 .. fileN]
'''

__version__ = '0.4'

'''
changes: 0.3
    -i more intuitive (-i ID FILE instead of -i ID FILENUMBER)
    prompt for filename and extension when interactive
    support multiple -g
    support multiple -d
'''

import netrc, os, sys

def auth():
    ''' netrc: machine ix.io login USERNAME password TOKEN '''
    try: 
        creds = netrc.netrc().authenticators('ix.io')
    except:
        return []
    if not creds:
        return []
    return [('login', creds[0]), ('token', creds[2])]

def mkreq(files, data=[], i=0):
    for filename in files:
        if filename is sys.stdin:
            fname, ext = '', ''
            if os.isatty(sys.stdin.fileno()):
                fname = raw_input('filename: ').strip()
                ext = raw_input('extension: ').strip()
                if ext and not ext.startswith('.'):
                    ext = '.%s' % ext
                print '^C to exit, ^D to send'
            try:
                contents = sys.stdin.read()
            except KeyboardInterrupt:
                sys.exit()
            if not contents:
                sys.exit()
        elif os.path.exists(filename):
            contents = open(filename).read()
            filename, ext = os.path.splitext(filename)
            fname = os.path.basename(filename)
        else:
            continue
        i += 1
        data.append(('f:%d' % i, contents))
        data.append(('name:%d' % i, fname))
        data.append(('ext:%d' % i, ext))
    return data

if __name__ == '__main__':
    from optparse import OptionParser
    from urllib import urlencode
    from urllib2 import urlopen
    parser = OptionParser(version=__version__,
                          usage=__doc__,
                          description=auth.__doc__)
    parser.add_option('-g', '--get', action='append',
                      help='get paste identified by ID')
    parser.add_option('-d', '--delete', action='append',
                      help='delete paste identified by ID')
    parser.add_option('-i', '--id', action='append', nargs=2,
                      help='two params: ID, FILE. replace paste ID with FILE' +
                           '. Use - if FILE is STDIN')
    opts, args = parser.parse_args()


    if opts.get:
        for i, get in enumerate(opts.get):
            print urlopen('http://ix.io/%s' % (get)).read().strip()
            if i < len(opts.get)-1:
                print '-' * 79
    else:
        data = auth()
        if opts.id:
            for (idno, filename) in opts.id:
                if filename == '-':
                    args.append(sys.stdin)
                    data.append(('id:%d' % len(args), idno))
                elif os.path.exists(filename):
                    args.append(filename)
                    data.append(('id:%d' % len(args), idno))
        if opts.delete:
            for i in opts.delete:
                data.append(('rm', i))
        elif not args:
            args = [sys.stdin]
        data.extend(mkreq(args))
        print urlopen('http://ix.io', urlencode(data)).read().strip()
