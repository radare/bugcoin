const JS = JSON.stringify;
const JP = JSON.parse;

function replaceAll( text, busca, reemplaza ){
	while (text.toString().indexOf(busca) != -1)
		text = text.toString().replace(busca,reemplaza);
	return text;
}

function XS(x) {
	if (x === undefined)
		return "";
	var reps = {
		'<': '&lt;',
		'>': '&gt;',
	};
	for (var k in reps)
		x = replaceAll (x, k, reps[k]);
	return x;
}

function isValidBtcAddress(x) {
	/* check length */
	/* check header+footer */
	/* check validity */
	return true;
}

function setSpinner(bool) {
	var a = document.getElementById ("spinner");
	a.style.visibility = bool? "visible": "hidden";
}

function clearCreateForm() {
	$('#title').val ('');
	$('#message').val ('');
	//$('#priority').val('');
	//$('#category').val('');
}

function bugOpen() {
	bugView ($('#bugid').val());
}

function bugSearch() {
	bugList ($('#keyword').val ());
}

function bugCreate() {
	var body = {};
	body.title = $('#title').val();
	$('#yourname').val ($('#yourname2').val ());
	body.name = $('#yourname2').val();
	body.message = $('#message').val();
	body.priority = $('#priority').val();
	body.category = $('#category').val();
	setSpinner (true);
	$.ajax ({
		type: 'POST',
		url: "/create",
		data: JS (body)
	}).done (function (data) {
		var id = data;
		if (id == "") {
			alert ("cannot create new bug");
		} else {
			bugList ();
			bugView (id);
			clearCreateForm ();
		}
		setTimeout (function() {setSpinner (false)}, 300);
	}).error (function (data) {
		alert ("ajax error "+data);
		setTimeout (function() {setSpinner (false)}, 1000);
	});
}

function bugList(kw) {
	function parseBug (id, bug) {
		var o = {};
		o.id = id;
		o.title = bug.title;
		o.status = bug.status;
		o.balance = bug.balance;
		o.priority = bug.priority;
		o.btc = undefined;
		if (!o.id || !o.title || !o.status || !o.priority)
			return null;
		// XXX: filter strings here
		return o;
	}
	kw = kw? '/'+kw: '';
	$.ajax ({
		url: "/list"+kw,
		dataType: "json"
	}).error (function (data) {
		$("#buglist").html ("");
	}).done (function (data) {
		var body = "";
		body = "<table>";
		var bugs = data; //JP(JS(data)); //JP (data);
		for (var bug in bugs) {
			var o = parseBug (bug, bugs[bug]);
			if (!o) continue;
			if (!o.balance) o.balance= "?";
			body += "<tr>";
			body += "<td>"+XS (o.status)+"&nbsp;&nbsp;</td>";
			body += "<td width='100%'><a href='#"+bug+"'";
			body += "  onclick='bugView(\""+XS (o.id)+"\");";
			body += "  return true;'>"+XS(o.title)+"</td>";
			body += "<td>"+o.balance+"&nbsp;&nbsp;</td>";
			body += "<td>"+o.priority+"</td>";
			body += "</tr>";
		}
		body += "</table>";
		$("#buglist").html (body);
	});
}

function bugViewOpen (bool) {
	var a = document.getElementById ("reply");
	a.style.visibility = bool? "visible": "hidden";
	// XXX $('#bug-open').css.visibility = "hidden";
}

var bid = 0;

function bugReply () {
	var body = {};
	$('#yourname2').val ($('#yourname').val ());
	body.name = $('#yourname').val();
	body.address = $('#yourbtc').val();
	body.message = $('#message2').val();
	setSpinner (true);
	$.ajax ({
		type: 'POST',
		url: "/reply/"+bid,
		data: JS (body)
	}).error (function (data) {
		alert ("cannot reply bug:", data);
		setTimeout (function() {setSpinner (false)}, 1000);
	}).done (function (data) {
		if (data === "success") {
			$('#message2').val('');
			bugView (bid);
		}
		setTimeout (function() {setSpinner (false)}, 300);
	});
}

function bugView(id) {
	bid = id;
	setSpinner (true);
	$.ajax ({
		url: "/view/"+id
	}).error (function (data) {
		alert ("cannot find bug#"+id);
		setTimeout (function() {setSpinner (false)}, 300);
	}).done (function (data) {
		if (data == "") {
			alert ("invalid bug id");
			setTimeout (function() {setSpinner (false)}, 300);
			return;
		}
		var bug = data; //JP (data);
		if (bug.replies) {
			var body = "";
			body += "<h2>Replies</h2><br />";
			for (var ts in bug.replies) {
				var r = bug.replies[ts];
				body += "<b>From</b> "+ XS (r.name)+"<br />";
				body += "<b>Timestamp</b> "+XS (ts)+"<br />";
				body += "<b>Bitcoin</b> "+XS (r.btc)+"<br />";
				body += "<textarea readonly style='background-color:white;width:500px'>"+r.message+"</textarea>";
				body += "<br /><br />";
			}
			$('#replies').html (body);
		} else $('#replies').html ("<h2>no replies</h2>");
		if (!bug.balance) bug.balance = 0;
		var body = "";
		body += "<h1>"+XS(bug.title)+"</h1><br />";
		body += "<b>Author:</b> "+XS (bug.name)+"<br/>";
		body += "<b>Category:</b> "+XS (bug.category)+"<br/>";
		body += "<b>Priority:</b> "+XS (bug.priority)+"<br/>";
if (bug.btc !== undefined)
		body += "<b>Reward:</b> "+XS (bug.balance)+" btc (<a href='https://blockexplorer.com/address/"+bug.btc+"'>"+bug.btc+"</a>)<br />";
else
		body += "<b>Reward:</b> "+XS (bug.balance)+" btc</b><br />";

		var ts;
		if (bug.timestamp) {
			ts = new Date (bug.timestamp);
			if (ts) ts = ts.toString ("default");
		} else ts = "unknown";
		
		body += "<b>Created on</b> "+ts+"<br /><br />";
		body += "<textarea readonly style='background-color:white;width:500px;height:150px'>"+bug.message+"</textarea>";
		$('#bugid').val(id);
		$('#bugview').html (body);
		$('a[href=#bug]').tab ('show');
		bugViewOpen (true);
		setTimeout (function() {setSpinner (false)}, 300);
	});
}

$(document).ready(function () {
	bugList ();
});
