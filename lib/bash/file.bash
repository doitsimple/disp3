# revert mode of all files and directories in this dir
alias disp-revmod='find . -type d -exec chmod 755 {} \; && find . -type f -exec chmod 644 {} \;'
