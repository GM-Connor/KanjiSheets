var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
    	readXML(this);
    }
};
xhttp.open("GET", "../kanjidic2.xml", true);
xhttp.send();

function readXML(xml) {
    xmlDoc = xml.responseXML.getElementsByTagName("c");
}

function textChange(input) {
	value = input.target.value.toLowerCase();
	console.log(value);
	if (value.length > 1)
		$('#search-results').collapse('show');
		//Have spinning gif thing in initial panel
		search(value);
}


function search(text) {
	var match = [];
	for (var i=0; i < xmlDoc.length; i++) {
		var entry = xmlDoc[i].innerHTML;
		var entry_length = entry.length;
		entry = entry.replace(text,"");
		var reduction = entry_length - entry.length;
		if (reduction == text.length) {
			match.push(xmlDoc[i].innerHTML.split("~"));
		}
	}
	arrange(match);
}

function arrange(match) {
	match = match.sort(function(a, b) {
		if (parseInt(a[1]) < parseInt(b[1])) return -1;
		if (parseInt(a[1]) > parseInt(b[1])) return 1;
		return 0;
	});
	output(match);
}

function output(match) {
	var markers_used = [];
	var characters = document.getElementById("characters");
	characters.innerHTML = "";
	for (var i=0; i < match.length; i++) {
		if (markers_used.indexOf(match[i][1]) == -1) {
			markers_used.push(match[i][1]);
			characters.innerHTML += character_format(match[i][1], true);
		}
		characters.innerHTML += character_format(match[i][0], false);
	}
}

function character_format(character, marker) {
	if (marker === true)
		marker = " marker";
	else
		marker = "";
	result = '<div class="col-md-3"><div class="character' + marker + '"><div class="vtable"><div class="vtable-cell">' + character + '</div></div></div></div>'
	return result;
}