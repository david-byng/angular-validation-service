SHELL=/bin/bash -o pipefail

RED=\033[0;31m
YELLOW=\033[1;33m
GREEN=\033[0;32m
BLUE=\033[0;34m
PURPLE=\033[0;35m
CYAN=\033[0;36m
BGRED=\033[0;41m
BGYELLOW=\033[1;33m
BGGREEN=\033[0;42m
BGBLUE=\033[0;44m
BGPURPLE=\033[0;45m
BGCYAN=\033[0;46m
NOCOLOR=\033[0m

all: install test

install: npm-install bower-install .git/hooks/pre-push

watch: install
	echo; \
	echo -e "Now handing over to ${BLUE}gulp watch${NOCOLOR}."; \
	echo -e ; \
	node_modules/gulp/bin/gulp.js watch;

.git/hooks/pre-push:
	echo -en "Installing pre-push git hook..."; \
	if echo -e "make test" > .git/hooks/pre-push; \
	then \
		echo -e "${GREEN}OK${NOCOLOR}"; \
	else \
		echo -e "${YELLOW}WARN${NOCOLOR}"; \
		echo -e "    Could not create .git/hooks/pre-push"; \
		echo -e "    Tests will not run on push."; \
		echo -e "    Please run them manually."; \
		sleep 5; \
	fi; \
	if ! [[ -x .git/hooks/pre-push ]]; \
	then \
		echo -en "    Making executable..."; \
		if chmod u+x .git/hooks/pre-push; \
		then \
			echo -e "${GREEN}OK${NOCOLOR}"; \
		else \
			echo -e "${YELLOW}WARN${NOCOLOR}"; \
			echo -e "    Could not make .git/hooks/pre-push executable"; \
			echo -e "    Tests will not run on push."; \
			echo -e "    Please run them manually."; \
			sleep 5; \
		fi; \
	fi;

require-npm:
	echo -en "Checking for NPM..."; \
	if hash npm 2>/dev/null; \
	then \
		echo -e "${GREEN}OK${NOCOLOR}"; \
	else \
		echo -e "${RED}ERR${NOCOLOR}"; \
		echo -e "    NPM is required to install node packages."; \
		echo -e "    NPM is packaged with NodeJS."; \
		echo -e "    Please install node first."; \
		exit 1; \
	fi;

require-node:
	echo -en "Checking for node..."; \
	if hash node 2>/dev/null; \
	then \
		echo -e "${GREEN}OK${NOCOLOR}"; \
	else \
		echo -e "${RED}ERR${NOCOLOR}"; \
		echo -e "    node is required to run node packages."; \
		echo -e "    Please install node first."; \
		exit 1; \
	fi;

npm-install: require-npm
	echo -en "Checking for missing node packages..."; \
	MISSING_PACKAGES=0; \
	if [ ! -f node_modules/json/lib/json.js ]; \
	then \
		echo; \
		echo -e "    Missing json"; \
		MISSING_PACKAGES=1; \
	else \
		while read line; \
		do \
			if [ ! -d node_modules/$$line ]; \
			then \
				if [[ $$MISSING_PACKAGES -eq 0 ]]; \
				then \
					echo; \
				fi; \
				MISSING_PACKAGES=$$((MISSING_PACKAGES+1)); \
				echo -e "    Missing $$line"; \
			fi; \
		done < <( \
			cat package.json | \
			node_modules/json/lib/json.js "devDependencies" "dependencies" | \
			node_modules/json/lib/json.js --merge -Ma "key" \
		); \
	fi; \
	if [[ $$MISSING_PACKAGES -gt 0 ]]; \
	then \
		echo -e "    Triggering install..."; \
		if npm install 2>&1 | sed "s/^/        /"; \
		then \
			echo -e "    Triggering install...${GREEN}OK${NOCOLOR}"; \
			echo -e "Checking for missing node packages...${GREEN}OK${NOCOLOR}"; \
		else \
			echo -e "    Triggering install...${RED}ERR${NOCOLOR}"; \
			echo -e "        Could not install. Try 'npm install' to debug."; \
			exit 1; \
		fi; \
	else \
		echo -e "${GREEN}OK${NOCOLOR}"; \
	fi;

bower-install: npm-install require-node
	echo -en "Checking for missing bower packages..."; \
	MISSING_PACKAGES=0; \
	while read line; \
	do \
		if [ ! -d bower_components/$$line ]; \
		then \
			if [[ $$MISSING_PACKAGES -eq 0 ]]; \
			then \
				echo; \
			fi; \
			MISSING_PACKAGES=$$((MISSING_PACKAGES+1)); \
			echo -e "    Missing $$line"; \
		fi; \
	done < <( \
		cat bower.json | \
		node_modules/json/lib/json.js "devDependencies" "dependencies" | \
		node_modules/json/lib/json.js --merge -Ma "key" \
	); \
	if [[ $$MISSING_PACKAGES -gt 0 ]]; \
	then \
		echo -e "    Triggering install..."; \
		if bower install 2>&1 | sed "s/^/        /"; \
		then \
			echo -e "    Triggering install...${GREEN}OK${NOCOLOR}"; \
			echo -e "Checking for missing bower packages...${GREEN}OK${NOCOLOR}"; \
		else \
			echo -e "    Triggering install...${RED}ERR${NOCOLOR}"; \
			echo -e "        Could not install. Try 'bower install' to debug."; \
			exit 1; \
		fi; \
	else \
		echo -e "${GREEN}OK${NOCOLOR}"; \
	fi;

test: test-jshint test-karma test-policies

test-policies:
	echo -e "Testing with policies..."; \
	while read policyscript; \
	do \
		echo -en "    Checking $$policyscript..."; \
		if ./scripts/policies/$$policyscript 2>&1 | sed "s/^/        /"; \
		then \
			echo -e "${GREEN}OK${NOCOLOR}"; \
		else \
			echo -e "    Checking $$policyscript...${RED}ERR${NOCOLOR}"; \
			echo -e "        $$policyscript failed."; \
			echo -e "        debug with './scripts/policies/$$policyscript'"; \
			exit 1; \
		fi; \
	done < <(ls scripts/policies 2>/dev/null); \
	echo -e "Testing with policies...${GREEN}OK${NOCOLOR}"; \

test-karma: install require-node
	echo -e "Testing with karma..."; \
	if node_modules/gulp/bin/gulp.js karma-unit-bare 2>&1 | sed "s/^/    /"; \
	then \
		echo -e "Testing with karma...${GREEN}OK${NOCOLOR}"; \
	else \
		echo -e "Testing with karma...${RED}ERR${NOCOLOR}"; \
		echo -e "    Karma failed."; \
		echo -e "    debug with 'gulp karma-unit'"; \
		exit 1; \
	fi;

test-jshint: npm-install require-node
	echo -e "Testing with jshint..."; \
	if node_modules/gulp/bin/gulp.js jshint | sed "s/^/    /"; \
	then \
		echo -e "Testing with jshint...${GREEN}OK${NOCOLOR}"; \
	else \
		echo -e "Testing with jshint...${RED}ERR${NOCOLOR}"; \
		echo -e "    jshint failed."; \
		echo -e "    debug with 'gulp jshint'"; \
		exit 1; \
	fi;

.SILENT:
