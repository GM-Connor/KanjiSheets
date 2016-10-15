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
	//Requires text input of atleast three characters to avoid needlessly large search results
	if (value.length > 2) {
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
	result = '<div class="col-xs-4 col-sm-4 col-md-4 col-lg-3"><div class="character' + marker + '"><div class="vtable"><div class="vtable-cell">' + character + '</div></div></div></div>'
	return result;
}





/*
 * Adding kanji to selected grid (from search results to grid. or directly to grid)
 */

function buttonClick(event) {
	/*Triggered by "plus" button on kanji search form*/
	//Gets what's inside of kanji search input field, removes surrounding white space, and splits into array of charcters
	var val = $('#search-expand input')[0].value.trim().split("");
	//Calls kanjiAdd for each character
	for (var i=0; i < val.length; i++) {
		kanjiAdd(val[i]);
	}
}
function kanjiAdd(kanji) {
	/*Triggered by buttonClick(), addFromNew()*/
	//Max kanji allowed selected
	var limit = 10;
	//Number of current kanji selected
	var amountSelected = $('#selectedkanji > div').length - $('#selectedkanji > div.new').length;
	//Makes sure character is character, and that the number of selected kanji haven't hit max allowed
	if ((kanji != "") && amountSelected < limit) {
		var grid = document.getElementById("selectedkanji");
		var newBlock = $('#selectedkanji .new');
		newBlock.remove();
		//Appends the kanji to grid
		grid.innerHTML += gridFormat(kanji,false);
		//Appends "new" block to grid more kanji are allowed after this one
		if (amountSelected != limit - 1) {
			grid.innerHTML += gridFormat("",true);
		}
	}
	//Starts the SVG generation
	startSVG();
}
function gridFormat(kanji, isNew) {
	/*Triggered by kanjiAdd()*/
	//Returns HTML for entry based on if a kanji or "new" block
	if (isNew) {
		return '<div class="col-xs-10 col-sm-10 alert new"><div class="character-selected"><div class="vtable"><div class="vtable-cell"><input type="text" placeholder="+" onfocusout="addFromNew(this.value);"></div></div></div></div>';
	}
	else {
		return '<div class="col-xs-10 col-sm-10 alert"><div class="character-selected"><div class="vtable"><div class="vtable-cell">' + kanji + '</div><button type="button" class="close" onclick="dismissAndUpdate(this);"><span aria-hidden="true">×</span></button></div></div></div>';
	}
}
$('#selectedkanji').keyup(function(event){
	/*Triggered by ENTER keyup*/
	//Adds kanji to grid (first character of input field)
	if (event.keyCode == 13) {
		addFromNew($('#selectedkanji .new input')[0].value);
	}
});
function addFromNew(text) {
	/*Triggered by onfocusout of "new" block, and/or enter key pressed within grid*/
	//Gets value of "new" block's input, and make sure it isn't blank
	if ( text && text.length > 0) {
		//Gets first character of input. Sends through kanjiAdd();
		var val = text.trim().split("")[0];
		kanjiAdd(val);
	}
}





/*
 * Selected kanji to SVG hookup
 */
svgData = {
	"rows": 22,
	"columns": 15,
	"current_row": 0,
	"current_column": 0,
	"width": "100%",
	"height": "100%",
	"viewBox": "0 0 1141 1674",
	"sectorSize": 77,
	"headerText": "Kanji Practice Sheets",
	"footerText": "Printed from www.KanjiSheets.com",
	"maxKanji": 10,
	"rowPerKanji": 2,
	"rowFormat": [
		"KTTTTTTTGGGGGGG",
		"TGGGGGGGBBBBBBB"
	],
	"kanjiPaths": {},
	"svgContent": ""
}
function startSVG() {
	svgData.entriesAdded = 0;

	svgData.kanjiRows = svgData.rows - 2;
	getSelectedKanji();
	getKanjiTracePaths();
	initSVG();
	for (var row=0; row < svgData.rows; row++) {
		svgData.current_row = row;
		startRow();
	}
	svgFlush();
}
function initSVG() {
	$('.svg')[0].innerHTML = "<svg></svg>";
	svgData.svg = $('.svg svg')[0];
	svgData.svg.setAttribute("width", svgData.width);
	svgData.svg.setAttribute("height", svgData.height);
	svgData.svg.setAttribute("viewBox", svgData.viewBox);
}
function startRow() {
	if (svgData.current_row == 0) {
		header();
	}
	else if (svgData.current_row == (svgData.rows - 1)) {
		footer();
	}
	else {
		var currentKanji = svgData.formatedKanji[svgData.entriesAdded];
		var currentFormatIndex = (svgData.current_row - 1) % svgData.rowPerKanji;
		var rowFormat = svgData.rowFormat[currentFormatIndex];

		if (currentFormatIndex == (svgData.rowPerKanji - 1)) {
			svgData.entriesAdded += 1;
		}

		for (var column=0; column < svgData.columns; column++) {
			svgData.current_column = column;
			startSector(currentKanji, rowFormat[column]);
		}
	}
}
function header() {
	var format = '<text class="primary-text" text-anchor="middle" x="571" y="' + ((svgData.sectorSize * svgData.current_row) - svgData.current_row + 50) + '">' + svgData.headerText + '</text>';
	appendSVG(format);
}
function footer() {
	var format = '<text class="secondary-text" text-anchor="middle" x="571" y="' + ((svgData.sectorSize * svgData.current_row) - svgData.current_row + 29) + '">' + svgData.footerText + '</text>';
	appendSVG(format);
}
function startSector(kanji, format) {
	switch(format) {
		case "K":
			createRect();
			createGrid();
			if (kanji) {
				createKanji(kanji);
			}
			break;
		case "T":
			createRect();
			createGrid();
			if (kanji) {
				createTrace(kanji);
			}
			break;
		case "G":
			createRect();
			createGrid();
			break;
		case "B":
			createRect();
			break;
	}
}
function createRect(secX=svgData.current_column, secY=svgData.current_row) {
	var posX = (svgData.sectorSize * secX) - secX;
	var posY = (svgData.sectorSize * secY) - secY;
	var format = '<rect x="' + posX + '" y="' + posY + '" width="' + svgData.sectorSize + '" height="' + svgData.sectorSize + '"/>';
	appendSVG(format);
}
function createGrid(secX=svgData.current_column, secY=svgData.current_row) {
	var posX = (svgData.sectorSize * secX) - secX;
	var posY = (svgData.sectorSize * secY) - secY;
	var l1x = Math.floor(((posX*2)+svgData.sectorSize)/2);
	var l1y2 = posY + svgData.sectorSize;
	var l2y = Math.floor(((posY*2)+svgData.sectorSize)/2);
	var l2x2 = posX + svgData.sectorSize;
	var line1 = '<line x1="' + l1x + '" y1="' + posY + '" x2="' + l1x + '" y2="' + l1y2 + '"/>';
	var line2 = '<line x1="' + posX + '" y1="' + l2y + '" x2="' + l2x2 + '" y2="' + l2y + '"/>';

	appendSVG(line1 + line2);
}
function createKanji(kanji, secX=svgData.current_column, secY=svgData.current_row) {
	var posX = (svgData.sectorSize * secX) - secX;
	var posY = (svgData.sectorSize * secY) - secY;
	var format = '<text class="kanji　read" x="' + (posX+13) + '" y="' + (posY+56) + '">' + kanji + '</text>';
	appendSVG(format);
}
function createTrace(kanji, secX=svgData.current_column, secY=svgData.current_row) {
	var posX = (svgData.sectorSize * secX) - secX;
	var posY = (svgData.sectorSize * secY) - secY;
	var format = '<svg y="' + (posY + 6) + '" x="' + (posX + 4) + '" width="66" height="66" viewBox="0 0 327 327"><g transform="scale(3.0,3.0)">' + svgData.kanjiPaths[kanji] + '</g></svg>';
	appendSVG(format);
}
function appendSVG(insertion) {
	svgData.svgContent += insertion;
}
function getSelectedKanji() {
	var selectedKanji = [];
	var kanji = $('.character-selected .vtable-cell');
	for (var i=0; i < kanji.length; i++) {
		if (kanji[i].innerText.length == 1) {
			selectedKanji.push(kanji[i].innerText);
		}
	}
	var formatedKanji = [];
	var remaining = svgData.maxKanji;
	for (var i=0; i < selectedKanji.length; i++) {
		var allocated = Math.ceil(remaining/(selectedKanji.length-i));
		for (var j=0; j < allocated; j++) {
			formatedKanji.push(selectedKanji[i]);
		}
		remaining -= allocated;
	}
	svgData.selectedKanji = selectedKanji;
	svgData.formatedKanji = formatedKanji;
}
function getKanjiTracePaths() {
	for (var i=0; i < svgData.selectedKanji.length; i++) {
		var kanji = svgData.selectedKanji[i];
		if (!(svgData.kanjiPaths.hasOwnProperty(kanji))) {
			$.ajax({
				url: "../kanji_paths/" + kanji + ".svg",
				async: false,
				complete: function(data) {
					if (data.status == 200) {
						svgData.kanjiPaths[kanji] = data.responseText;
					}
				}
			});
		}
	}
}
function svgFlush() {
	svgData.svg.innerHTML = svgData.svgContent;
	svgData.svgContent = "";
}
startSVG();


/*
 * Other
 */
function adjustSvgWidth() {
	var svgPanel = $('.panel.svg');
	var height = svgPanel.height();
	var width = (height * 1141) / 1674;
	svgPanel.width(width * 1.1);
}
$( window ).resize(function() {
	adjustSvgWidth();
});
adjustSvgWidth();
//Triggering before the close

function dismissAndUpdate(element) {
	$(element).alert('close');
	startSVG();
}

$('#search-results').on("click", ".character", function() {
	var kanji = $(this)[0].innerText;
	kanjiAdd(kanji);
	$('#search').focus();
	$('#search').select();
});

$('.shadow .clear').click(function() {
	document.getElementById("selectedkanji").innerHTML = gridFormat("",true);
	startSVG();
});