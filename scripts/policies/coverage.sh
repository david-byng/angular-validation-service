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

if [[ `cat test/karma-coverage/coverage-summary.txt | grep "100%" | wc -l | tr -d " \n"` -lt 4 ]];
then
    echo;
    echo -e "${RED}Test coverage has decreased${NOCOLOR}. Please increase unit test coverage to ${BLUE}100%${NOCOLOR}.";
    echo -e "    To find areas that are not covered, use:"; \
    echo -e "        file://${DIR%/scripts/policies}/test/karma-coverage/index.html";
    echo -e "    If you are trying to push, you can override this in an emergency with '${BLUE}--no-verify${NOCOLOR}'";
    echo -e "    however it is frowned upon, as everyone else will get this message until it is fixed.";
    exit 1;
fi;
