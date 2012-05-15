/* configuration values */
module.exports = {
	'port': 8080,
	'projname': 'radare',
	'database': '__db__.json',
	'autosave':60 * 1000,
	agent: {
		'host': 'bugcoin.nodester.com',
		'port': 80,
		'pass': '123', // agent password
	},
	bitcoin: {
		'fee': 0.05,
		'address': '1NdACP7cZw3nB73dX8vMKHNuns9TxHsBPz',
		'username': 'pancake',
		'password': '123',
		'host': "localhost",
		'port': 8332
	}
};
