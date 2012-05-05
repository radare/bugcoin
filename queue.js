function Queue () {
	this.reset ();
}

Queue.prototype.reset = function (x) {
	this.data = []
}

/* queue */
Queue.prototype.put = function (x) {
	this.data.splice (0, 0, x);
}

Queue.prototype.get = function (x) {
	var v = this.data[0];
	this.data = this.data.slice (1, this.data.length);
	return v;
}

/* stack */
Queue.prototype.push = function (x) {
	this.data[this.data.length] = x;
}

Queue.prototype.pop = function (x) {
	if (this.data.length<1)
		return null;
	var v = this.data[this.data.length-1];
	this.data = this.data.slice (0,this.data.length-1);
	return v;
}

/* helper */
Queue.prototype.show = function () {
	for (var i=0; i<this.data.length; i++)
		console.log ("++ ",i," ",this.data[i]);
}

module.exports = Queue;
