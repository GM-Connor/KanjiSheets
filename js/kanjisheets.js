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
			match.push(xmlDoc[i]);
			console.log(xmlDoc[i].innerHTML);
		}
	}
	console.log(match);
}
