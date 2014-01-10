import feedparser
from subprocess import call

emailObject = feedparser.parse('/tmp/mail.xml')

# How many emails do we have?
totalEmails = len(emailObject.entries)

# Look through each entry tag to extract subject and the author
for eachEmail in range(0, totalEmails):

    subject = emailObject.entries[eachEmail].title

    # I hate it when people send me emails with no subject line
    if subject == "":
        subject = "No subject"

    author  = emailObject.entries[eachEmail].author

    # Call notify-send, which goes straight to dunst for me
    call(["notify-send", "-u", "low", subject, author])
