NWD=~/prg/bugcoin

all: node_modules/.done
	node ./src/app.js

bit:
	@echo Running the bitcoind
	mkdir -p wallet
	bitcoind -rpcuser=pancake -rpcpassword=123 -datadir=${PWD}/wallet

node_modules/.done:
	mkdir -p node_modules
	npm install ws
	npm install jade
	npm install bitcoin
	npm install express
	touch node_modules/.done

sync:
	if [ -f .nodester.appconfig ]; \
		cp -f ${NWD}/Makefile Makefile
		cp -rf ${NWD}/src/* src/
	else
		cp -f Makefile ${NWD}/Makefile
		cp -rf src/* ${NWD}/src
	fi
