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
	cp -rf ~/prg/bugcoin/src/* src/
