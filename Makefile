all: node_modules/.done
	node app.js

node_modules/.done:
	mkdir -p node_modules
	npm install ws
	npm install jade
	npm install bitcoin
	npm install express
	touch node_modules/.done
