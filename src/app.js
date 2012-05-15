/* TODO: use node-daemon and chroot */

var jade = require ('jade'),
 express = require ('express'),
  config = require ('./config'),
    http = require ('http'),
      ws = require ('ws'),
      qs = require ('querystring'),
      db = require ('./db');
var WebSocketServer = ws.Server;

var env = {
	title: config.projname+' bugtracker',
	name: config.projname,
	bitcoin: config.bitcoin,
	categories: [
		'general',
		'bitcoin',
		'question',
		'development'
	],
	priorities: [
		'bug',
		'build',
		'crash',
		'critical',
		'vulnerability'
	]
}

console.log ("starting btcdev on port", config.port);

var app = express.createServer ();
const JS = JSON.stringify;
const JP = JSON.parse;
const JSHDR = {'Content-type': 'application/json'};

function notSet () {
	for (var i=0; i<arguments.length; i++) {
		var arg = arguments[i];
		if (!arg || arg == "")
			return true;
	}
	return false;
}

function sendNextTask (c) {
	var obj = db.getNextTask ();
	if (obj !== undefined)
		c.send (JS (obj));
	setTimeout (function () {
		sendNextTask (c);
	}, 1000); // one task per second
}

var wss = new WebSocketServer({server: app, path: '/agent'});
wss.on ('connection', function (c) {
	var logged = false;
	console.log ("connected");
	c.send (JS ({type:'login', seed:'SEED'}));
	c.on ('message', function (m) {
		var msg = JP (m);
		console.log (m);
		switch (msg.type) {
		case 'login':
			logged = true;
			c.send (JS ({type:logged?'success':'fail'}));
			if (logged) {
				(function (c) {
					sendNextTask (c);
				}) (c);
				/* send all tasks in queue */
			}
			break;
		case 'new-address':
			console.log ("NEW ADDRESS FUN\n");
			if (logged) {
				db.setBitcoinAddress (msg.bid, msg.address);
			}
			break;
		case 'get-balance':
			if (logged) {
				db.setBitcoinBalance (msg.bid, msg.balance);
			}
			break;
		case 'set-status':
			// open, closed, fixed, payed, cancel, dup, wontfix
			db.set_status (msg.bid, msg.state);
			break;
		case 'set-priority':
			// TODO
			break;
		case 'autosave':
			db.sync ();
			console.log ("db synced");
			break;
		case 'delete':
			db.del (msg.bid);
			break;
		case 'purge':
		case 'archive':
			break;
		}
	});
});

wss.on ('close', function (c) {
	console.log ("closed");
});

function finalize() {
	db.sync (function (err) {
		if (err) console.log (err);
		process.exit (0);
	});
}

process.on ('SIGINT', finalize);
process.on ('SIGTERM', finalize);

app.configure(function(){
	app.set ('views', __dirname + '/v');
	app.set ('view engine', 'jade');
	app.use (express.bodyParser ());
	app.use (express.methodOverride ());
	//app.use(require('stylus').middleware({ src: __dirname + '/public' }));
	app.use (app.router);
	app.use (express.static (__dirname + '/p'));
});

app.get ('/', function (req, res) {
	res.render ("list", env);
});

app.get ('/search', function (req, res) {
	// TODO: parse arguments and pass it to list()
	var str = req.keyword;
console.log ("Search for ", str);
	var bugs = db.list ();
	res.send (JS (bugs));
});

app.get ('/list/:keyword', function (req, res) {
	// TODO: parse arguments and pass it to list()
	var kw = req.params.keyword;
	var bugs = kw? db.list (kw): db.list ();
	console.log ("/kw/", kw);
	res.send (JS (bugs), JSHDR);
});

app.get ('/list', function (req, res) {
	console.log ("/list");
	var bugs = db.list ();
	res.send (JS (bugs), JSHDR);
});
 
app.get ('/view/:id', function (req, res) {
	console.log ("/view ", req.params.id);
	// TODO: parse arguments and pass it to list()
	var bugs = db.get (req.params.id);
	if (bugs) res.send (JSON.stringify (bugs), JSHDR);
	else res.send (404);
});

app.post ('/reply/:id', function (req, res) {
//	var bugs = db.get (req.params.id);
	var body = "";
	for (var k in req.body) {
		body = k;
		break;
	}
	try {
		var obj = JP (body);
		if (notSet (obj.name, obj.address, obj.message)) {
			res.send ("fail");
		} else {
			db.set_reply (req.params.id, obj);
			res.send ("success");
		}
	} catch (e) {
		console.log ("/reply/:id  json parse error: ", e);
		res.send ("fail");
	}
});

function newBugFromMessage(b) {
	var obj = {};
	var now = new Date ().getTime ();
	obj.title = b.title;
	obj.name = b.name
	obj.message = b.message;
	if (b.category in env.categories)
		obj.category = b.category;
	else obj.category = env.categories[0];
	if (b.priority in env.priorities)
		obj.priority = b.priority;
	else obj.priority = env.priorities[0];
	obj.balance = undefined;
	obj.timestamp = now;
	if (notSet (obj.title, obj.name, obj.message))
		return undefined;
	return obj;
}

app.post ('/create', function (req, res) {
	var body = "";
	for (var k in req.body) {
		body = k;
		break;
	}
	console.log ("/create ", body);
	try {
		var b = JP (body);
		var bid = db.getNewBugId ();
		var obj = newBugFromMessage (b);
		if (obj) {
			db.set (bid, obj);
			// WTF: res.send(int) = error code, res.send(str) = body
			res.send (""+bid);
console.log ("saved as "+bid);
		} else {
			console.log ("Invalid bug data");
			res.send ("");
		}
	} catch (e) {
		console.log (e, "json parse error: ");
	}
});

//app.use (express.static ('/path/to/root'));

app.listen (config.port);
