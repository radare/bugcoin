bugcoin: bitcoin powered development bug tracker
================================================

Author
------
pancake <@nopcode.org>


Description
-----------
bugcoin is a simple bug tracker with support for bitcoin.

Each bug is associated to a bitcoin address, people interested on getting a bug fixed can transfer money to it. Once the bug is closed, the developer who posted the fix gets the reward.

A fee is applied on each transfer in order to contribute to the project and get the money re-invested on other bugs to get fixed.

This development model allow parties interested on having a bug fixed or a feature enhacement done can put money to a bucker which is payed to the first guy who provides the solution.

The bugtracker administrator is the responsible to close the bugs and accept the bitcoin transfer. For security reasons, the wallet is not stored on this server.


Security
--------
This software is still beta and there are known vulnerabilities,
please. Use it with responsability and feel free to send patches
fixing the bugs you found!

			 .----------.
		    .->  | frontend |
	.-------. ,'     `----------'
	| agent |<._     .----------.
	`-------'   `->  | bitcoind |
			 `----------'
