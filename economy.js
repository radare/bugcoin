var bitcoin = require ("bitcoin");
var cfg = require ("./config").bitcoin;

var cli = new bitcoin.Client (cfg.host, cfg.port,
	cfg.username, cfg.password);

module.exports.getBalance = function (bid, cb) {
	var name = "bug#"+bid;
	cli.getBalance (name, function (e, d) {
		// if address is not owned by the agent's wallet MUST WARN
		// TODO: use nextTick ()
		cb (e?0:d);
	});
}

module.exports.createBitcoinAddress = function (bn, cb) {
	if (true) {
		cli.getNewAddress ('bug#'+bn, function (e, d) {
			console.log ("New Address has been done", d);
			if (cb) cb (d);
		});
	} else cb (999);
}

module.exports.transfer = function (from, to, amount) {
	// TODO
}
