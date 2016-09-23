/*
 * Kanji Search
 */

/*Triggered on site load*/
//Gets the xml file with kanji descriptors
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
    	readXML(this);
    }
};
xhttp.open("GET", "../kanjidic2.xml", true);
xhttp.send();
function readXML(xml) {
	//Global var
    xmlDoc = xml.responseXML.getElementsByTagName("c");
}
function textChange(input) {
	/*Triggered by onkeyup attr for #characters*/
	//Converts input to lowercase to avoid disqualified results due to case mismatch
	value = input.target.value.toLowerCase();
	//Requires text input of atleast two characters to avoid needlessly large search results
	if (value.length > 1) {
		//Expands results area to expose spinning gif until overwritten with results
		$('#search-results').collapse('show');
		determineHeight();
		search(value);
	}
}
function determineHeight() {
	/*Triggered by textChange()*/
	var characters = document.getElementById('characters');
	//Starting y position of #characters
	var c = characters.getBoundingClientRect().top;
	//Starting y position of #extra
	var e = document.getElementById('extra').getBoundingClientRect().top;
	var h = e - c;
	//Ensures height of #characters stops where #extra begins
	characters.style.maxHeight = h.toString() + "px";
}
function search(text) {
	/*Triggered by textChange()*/
	//Empty results array
	var match = [];
	//Loops through xmlDoc and pushes to match each entry than contains the input text. Entry is the innerHTML exploded by the ~ delimiter.
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
	/*Triggered by search()*/
	//Sorts the array of arrays by the stroke order ([1]) ascending
	match = match.sort(function(a, b) {
		if (parseInt(a[1]) < parseInt(b[1])) return -1;
		if (parseInt(a[1]) > parseInt(b[1])) return 1;
		return 0;
	});
	output(match);
}
function output(match) {
	/*Triggered by arrange()*/
	//Keeps track of markers used. "Markers" are the stroke order entries on the results.
	var markers_used = [];
	var characters = document.getElementById("characters");
	//Clears #characters to remove previous results/spinning gif
	characters.innerHTML = "";
	//Appends to #character.innerHTML each marker and kanji result. Marker only appended if kanji results count more than 24 (no need to divide kanji by stroke order when there is less than 24)
	for (var i=0; i < match.length; i++) {
		if ((markers_used.indexOf(match[i][1]) == -1) && (match.length > 24)) {
			markers_used.push(match[i][1]);
			characters.innerHTML += character_format(match[i][1], true);
		}
		characters.innerHTML += character_format(match[i][0], false);
	}
}
function character_format(character, marker) {
	/*Triggered by output()*/
	//Returns html format for marker entry if is marker
	if (marker === true)
		marker = " marker";
	//Otherwise just a kanji entry
	else
		marker = "";
	//HTML format for a single result. Marker gets "marker" css class
	result = '<div class="col-md-3"><div class="character' + marker + '"><div class="vtable"><div class="vtable-cell">' + character + '</div></div></div></div>'
	return result;
}





/*
 * Adding kanji to selected grid (from search results to grid. or directly to grid)
 */

function kanjiadd(kanji) {
	var grid = document.getElementById("selectedkanji");
}