var config = require ('./config'),
      zlib = require ('zlib'),
        db = require ('./db'),
        fs = require ('fs');

const database = config.database;
const JS = JSON.stringify;
const JP = JSON.parse;

/* initial database */
var store = {
	nextid: 1,
	bugs: {
		'1':{
			'title':'food is bar',
			'name':'pancake',
			'timestamp':'125',
			'btc':'125',
			'balance':'0.03',
			'status':'open',
			'priority':'critical',
			'message':"hello world",
			replies: {
				1234:{'message':"this is a reply test"},
				1236:{'message':"this is a secondary reply test"}
			}
		},
		'2':{
			'name':'pancake',
			'title':'cambas is lulzy',
			'balance':'0',
			'btc': undefined,
			'timestamp':'123',
			'status':'open',
			'priority':'bug',
			"message":"fuck yeah"
		}
	}
};

exports.getNextTask = function() {
	for (var x in store.bugs) {
		if (x.btc === undefined)
			return {type: 'new-address', bid: x};
	}
	for (var x in store.bugs) {
		if (store.bugs[x].balance === undefined)
			return {type: 'get-balance', bid: x};
	}
	return undefined;
}

exports.getNewBugId = function () {
	do store.nextid++;
	while ( store.bugs[store.nextid] );
	return store.nextid;
}

exports.del = function (b) {
	store.bugs[b] = undefined;
}

exports.set_status = function (b, s) {
	if (store.bugs[b]) {
console.log ("set new status " +s);
		store.bugs[b].status = s;
	}
}

exports.setBitcoinBalance = function (o, n) {
	if (store.bugs[b])
		store.bugs[b].balance = s;
}

exports.setBitcoinAddress = function (o, n) {
	var b = store.bugs[o];
	if (b) {
		store.bugs[o].btc = n;
		return true;
	}
	return false;
}

function findInBug(a,x,y) {
	if (x.title.search (y)!=-1) return true;
	if (x.message.search (y)!=-1) return true;
	if (a.search (y)!=-1) return true;
	return false;
}

exports.list = function(f) {
	var bugs = {};
	/* update balances */
	for (var x in store.bugs) {
		if (!f || f=="" || findInBug (x, store.bugs[x], f))
			bugs[x] = store.bugs[x];
		//bugs[x].balance = db.getBalance (x);
	}
	return bugs;
}

exports.set = function (k,v) {
	console.log ("set db ("+k+") = ("+JS (v)+")");
	v.status = "open";
	store.bugs[k] = v;
}

exports.set_reply = function (k,v) {
	var now = new Date().getTime ();
	console.log ("set db ("+k+") = ("+JS (v)+")");
	var obj = {};
	obj.message = v.message;
	obj.name = v.name;
	obj.btc = v.address;
	if (store.bugs[k]) {
		if (store.bugs[k].replies == undefined)
			store.bugs[k].replies = {};
		store.bugs[k].replies[now] = obj;
		return true;
	}
	return false;
}

exports.get = function (id) {
	return store.bugs[id];
}

exports.create = function (bid, title, priority, status, body) {
	if (store.bugs[bid])
		return false;
	var o = {};
	o.title = title;
	o.priority = priority;
	o.status = status;
	o.body = body;
	store.bugs[bid] = o;
	return true;
}

exports.drop = function () {
	fs.unlink (database);
}

function autosave() {
	console.log ("autosave");
	exports.sync(function (x) {
		setTimeout (autosave, config.autosave);
	});
}

exports.load = function () {
	setTimeout (autosave, config.autosave);
	fs.readFile (database+".gz", function (err, data) {
		zlib.gunzip (data, function (err, str) {
			try {
				store = JP (str);
			} catch (e) {
			}
		});
	});
}

exports.sync = function (cb) {
	var str = JS (store);
	if (!cb) cb = function() {}
	
	zlib.gzip (str, function (err, buffer) {
		if (!err) {
			fs.writeFile (database+".tmp", buffer, function (err) {
				if (err) cb ('cannot write to temporary file');
				else
				fs.rename (database+".tmp", database+".gz", function (err) {
					cb (err? 'cannot write on file': null);
				});
			});
		} else cb ('cannot compress database');
	});
}

exports.load();
