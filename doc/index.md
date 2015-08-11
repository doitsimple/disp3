Disp3 is scratched at April 1, 2015.

The whole process is divide into four steps:
nav: deterimine what folder to check
walk: walk through the folder, render files with "disp", ingore files with "psid", expand folder with "psid.json", otherwise copy files
expand: copy and render files according to "psid.json"
render: parse and replace text
install: install dependencies

Beside "project.json" of Disp2, there are other two files, one for abstract layer, "proto.json" and one for realistic "impl.json".

"prod.json" is used for production purpose;

dsc(database-server-client) is the only architect now;