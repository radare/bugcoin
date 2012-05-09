const donothing = false;

var bitcoin = require ("bitcoin");
var cfg = require ("./config").bitcoin;

var cli = new bitcoin.Client (cfg.host, cfg.port,
	cfg.username, cfg.password);

module.exports.getBalance = function (bid, cb) {
	if (donothing)
		return;
	var name = "bug#"+bid;
	cli.getBalance (name, function (e, d) {
		// if address is not owned by the agent's wallet MUST WARN
		// TODO: use nextTick ()
		cb (e?0:d);
	});
}

module.exports.createBitcoinAddress = function (bn, cb) {
	if (donothing)
		return;
	cli.getNewAddress ('bug#'+bn, function (e, d) {
		console.log ("New Address has been done", d);
		if (cb) Process.nextTick (cb (d));
	});
}

module.exports.transfer = function (from, to, amount, cb) {
	if (donothing)
		return;
	// sendfrom <fromaccount> <tobitcoinaddress> <amount> 
	// [minconf=1] [comment] [comment-to]
	cli.sendFrom (from, to, amount, function (x) {
		if (cb) Process.nextTick (cb);
	});
}
