/* bugcoins agent -- author: pancake */

/* TODO: check if btcaddr is not owned by agent's wallet. WARN LOUD in case */
var WebSocket = require ("ws");
var bitcoin = require ("bitcoin");
var economy = require ("./economy");
var config = require ("./config").agent;

const uri = "ws://"+config.host+":"+config.port+"/agent";
const JS = JSON.stringify;
const JP = JSON.parse;

const helpmessage =
	"# help         show this message\n"+
	"# quit         quit agent\n"+
	"# autosave [o] get/set autosave feature\n"+
	"# rm [s]       remove given bug\n"+
	"# set [s b]    set 'status' for 'btc addr'\n"+
	"# pay [s d a]  list or make transaction from s to d of a\n";

console.log ("bugcoin agent: ", uri);

process.openStdin ().on ('data', function (s) {
	var str = s.toString ();
	var arg = str.replace ('\n', '').split (' ');
	switch (arg[0]) {
	case 'help':
	case '?':
		console.log (helpmessage);
		break;
	case 'save':
	case 'autosave':
		ws.send (JS ({type:"autosave"}));
		break;
	case 'set':
		if (arg.length==3) {
			var stat = arg[1];
			var bid = arg[2];
			ws.send (JS ({type:"set-status","bid":bid,"state":stat}));
		} else {
			console.log ("Usage: set [status] [bugcoin.address]");
		}
		break;
	case 'rm':
	case 'del':
		if (arg.length==2) {
			var bid = arg[1];
			ws.send (JS ({type:"delete","bid":bid}));
		} else {
			console.log ("Usage: rm [bugcoin.address]");
		}
		break;
	case 'pay':
		if (arg.length==4) {
			var from = arg[1];
			var to = arg[2];
			var amount = arg[3];
			economy.transfer (from, to, amount);
		} else {
			console.log ("Usage: pay [from] [to] [amount]");
		}
		break;
	case 'q':
	case 'quit':
	case 'exit':
		ws.close ();
		process.exit (0);
		break;
	}
	console.log ("--> ",str);
});

var ws = new WebSocket (uri);
ws.on ('open', function () {
	var logged = false;
	console.log ("connected");

	ws.on ('message', function (m) {
		console.log ("-(msg)-> ",m);
		try {
			var msg = JP (m);
			switch (msg.type) {
			case 'login':
				ws.send (JS ({type:"login","auth":"MD5(PASS+HASH)"}));
				break;
			case 'success':
				console.log ("Login successful");
				logged = true;
				break;
			case 'fail':
				console.log ("Login FAIL");
				ws.close ();
				break;
			case "get-balance":
				if (logged) {
					var bid = msg.bid;
					var bal = 0; // bitcon get result
					// btc: account = getaccount <btcaddr>
					// btc: balance = getbalance <account>
					ws.send (JS ({type:msg.typed, bid:bid, balance:bal}));
				}
				break;
			case "new-address":
				if (logged) {
					var bid = msg.bid;
					economy.createBitcoinAddress (bid, function (addr) {
						ws.send (JS ({type:'new-address', bid:bid, address:addr}));
					});
				}
				break;
			}
		} catch (e) {

		}
	});

	ws.on ("close", function() {
		console.log ("closed");
	});
});
