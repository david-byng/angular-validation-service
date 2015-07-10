#!/bin/bash

RED="\033[0;31m"
YELLOW="\033[1;33m"
GREEN="\033[0;32m"
BLUE="\033[0;34m"
PURPLE="\033[0;35m"
CYAN="\033[0;36m"
BGRED="\033[0;41m"
BGYELLOW="\033[1;33m"
BGGREEN="\033[0;42m"
BGBLUE="\033[0;44m"
BGPURPLE="\033[0;45m"
BGCYAN="\033[0;46m"
NOCOLOR="\033[0m"

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd );

if grep -Rn "^[[:space:]]*\*\*\/" --exclude-dir={node_modules,platforms,lib,karma-coverage,bower_components} --silent .;
then
    echo;
    echo -e "${RED}Docblock end tag is incorrect${NOCOLOR}.";
    echo -e "    Docblocks should end '${BLUE} */${NOCOLOR}' not '${BLUE}**/${NOCOLOR}'";
    echo -e "    To find bad dockblock end tags, use:";
    echo -e "        grep -Rn "^[[:space:]]*\\*\\*\\/" --exclude-dir={node_modules,platforms,lib,karma-coverage,bower_components} .";
    echo -e "    These files were found:";
    grep -Rn "^[[:space:]]*\*\*\/" --exclude-dir={node_modules,platforms,lib,karma-coverage,bower_components} . | sed "s/^/        /";
    exit 1;
fi;
