var bitcoin = require ("bitcoin");
var cfg = require ("./config").bitcoin;

function initializeResult (fn) {
	var res = {};
	res.balance = 0;
	cli.getDifficulty (function (e, d) {
		if (e) return fn (e, null);
		res.difficulty = d;
/*
		cli.dumpPrivKey ('1NdACP7cZw3nB73dX8vMKHNuns9TxHsBPz', function (e,d) {
			console.log ("PRIV KEY IZ ", d);
		});
*/
		/* go fun */
		fn (null, res);
	});
}

var cli = new bitcoin.Client ("localhost", 8332,
	cfg.username, cfg.password);

console.log ("connected");
function listAccounts(res, fn) {
	cli.listAccounts (function (e, d) {
		var counter = 0;
		for (var name in d) {
			counter++;
			(function() {
				var balance = d[name];
				var _name = name;
				res.balance += balance;
				cli.getAddressesByAccount (name, function (e, d) {
					for (var i in d) {
						var addr = d[i]; // TODO foreach here
						console.log (addr, _name, "  \t", balance);
					}
					/* continuation */
					if (--counter == 0)
						fn (res);
			}); })();
			//cli.getBalance (name, function (e, d) { console.log ("balance:", e, d); });
		}
	});
}

initializeResult (function (e, res) {
	listAccounts (res, function (res) {
		console.log (res);
		cli.listTransactions ("radare", 9999, function (e, d) {
			if (e) {
				console.log ("Error found in transaction list");
			} else {
				console.log ("Transaction count:", d.length);
				//console.log (e, d);
			}
		});
	});
});

function createNewAddressForBug(bn) {
	cli.getNewAddress ('bug#'+bn, function (e, d) {
		console.log ("New Address has been done", d);
	});
}

cli.listAccounts (function (e,d) {
	console.log ("ACCOUNTS ARE ",e,d);
});
/*
cli.getInfo('', function (e,d) {
	console.log ("Error is", e);
	console.log ("Data is ", d);
});
*/
//createNewAddressForBug(823);
