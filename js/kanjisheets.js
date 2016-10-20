/*
 * Kanji Search
 */
function getKanjidic2(fileLocation, entryTagName) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
	    	window.kanjidic2 = this.responseXML.getElementsByTagName(entryTagName);
	    }
	};
	xhttp.open('GET', fileLocation, true);
	xhttp.send();
	return xhttp;
}

function onInputChange(event, minLength, minToGroup) {
	var input = getSearchInput(event.target);
	if (input.length >= minLength) {
		showResultsBox();
		results = search(input);
		outputDestination = outputResults(results, minToGroup);
		setResultsBoxHeight(outputDestination);
	}
}

function getSearchInput(element) {
	return element.value.toLowerCase();
}

function search(query) {
	var matches = [];
	var kanjidic2 = window.kanjidic2;
	for (var i = 0; i < kanjidic2.length; i++) {
		var entry = kanjidic2[i].childNodes[0].nodeValue;
		if (entry.includes(query)) {
			matches.push(entry.match(/.~[0-9]+/)[0].split('~')); /* pushes [kanji, strokeOrder] array to matches */
		}
	}
	return sortMatches(matches); /* sorts array of arrays by second value (stroke order) ascending */
}

function sortMatches(matches) {
	return matches.sort(function(a, b) {
		if (parseInt(a[1]) < parseInt(b[1])) return -1;
		if (parseInt(a[1]) > parseInt(b[1])) return 1;
		return 0;
	});
}

function outputResults(results, minToGroup) {
	var strokeOrderMarkers = [];
	var outputDestination = document.getElementById('characters');
	outputDestination.innerHTML = null;
	for (var i = 0; i < results.length; i++) {
		var entry = results[i];
		if ((results.length >= minToGroup) && (strokeOrderMarkers.indexOf(entry[1]) == -1)) {
			outputDestination.appendChild(entryFormat(entry[1], true));
			strokeOrderMarkers.push(entry[1]);
		}
		outputDestination.appendChild(entryFormat(entry[0], false));
	}
	return outputDestination;
}

function entryFormat(string, isMarker) {
	var marker = isMarker ? ' marker' : '';

	var outer = document.createElement('div');
	var character = document.createElement('div');
	var vtable = document.createElement('div');
	var vtableCell = document.createElement('div');

	outer.setAttribute('class', 'col-xs-4 col-sm-4 col-md-4 col-lg-3');
	character.setAttribute('class', 'character' + marker);
	vtable.setAttribute('class', 'vtable');
	vtableCell.setAttribute('class', 'vtable-cell');

	vtableCell.innerHTML = string;
	vtable.appendChild(vtableCell);
	character.appendChild(vtable);
	outer.appendChild(character);

	return outer;
}

function showResultsBox() {
	var resultsBox = $('#search-results');
	resultsBox.collapse('show');
	return resultsBox;
}

function setResultsBoxHeight(output) {
	var outputTop = output.getBoundingClientRect().top;
	var extra = document.getElementById('extra')
	var extraTop = extra.getBoundingClientRect().top;
	var maxOutputHeight = extraTop - outputTop;
	output.style.maxHeight = maxOutputHeight.toString() + 'px'; /* Ensures height of output box stops where #extra begins */
	return output;
}


/* To rewrite */



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
	svgData.svg = $('.svg')[0];
	svgData.prefix = '<svg width="' + svgData.width + '" height="' + svgData.height + '" viewBox="' + svgData.viewBox + '">';
	svgData.suffix = '</svg>';
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
function createRect() {
	var secX = svgData.current_column;
	var secY = svgData.current_row
	var posX = (svgData.sectorSize * secX) - secX;
	var posY = (svgData.sectorSize * secY) - secY;
	var format = '<rect x="' + posX + '" y="' + posY + '" width="' + svgData.sectorSize + '" height="' + svgData.sectorSize + '"></rect>';
	appendSVG(format);
}
function createGrid() {
	var secX = svgData.current_column;
	var secY = svgData.current_row;
	var posX = (svgData.sectorSize * secX) - secX;
	var posY = (svgData.sectorSize * secY) - secY;
	var l1x = Math.floor(((posX*2)+svgData.sectorSize)/2);
	var l1y2 = posY + svgData.sectorSize;
	var l2y = Math.floor(((posY*2)+svgData.sectorSize)/2);
	var l2x2 = posX + svgData.sectorSize;
	var line1 = '<line x1="' + l1x + '" y1="' + posY + '" x2="' + l1x + '" y2="' + l1y2 + '"></line>';
	var line2 = '<line x1="' + posX + '" y1="' + l2y + '" x2="' + l2x2 + '" y2="' + l2y + '"></line>';

	appendSVG(line1 + line2);
}
function createKanji(kanji) {
	var secX = svgData.current_column;
	var secY = svgData.current_row;
	var posX = (svgData.sectorSize * secX) - secX;
	var posY = (svgData.sectorSize * secY) - secY;
	var format = '<text class="kanji　read" x="' + (posX+13) + '" y="' + (posY+56) + '">' + kanji + '</text>';
	appendSVG(format);
}
function createTrace(kanji) {
	var secX = svgData.current_column;
	var secY = svgData.current_row;
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
	svgData.svg.innerHTML = svgData.prefix + svgData.svgContent + svgData.suffix;
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

function adjustSvgPos() {
	var selectedKanji = $('.selected-kanji')[0];
	var main = $('.main')[0];
	var rightBound = selectedKanji.getBoundingClientRect().right;
	console.log(rightBound);
	var leftBound = main.getBoundingClientRect().left;
	var diff = leftBound-rightBound;
	var space = 0;
	if (rightBound > 500) {
		space = 30;
	}
	else if (rightBound > 600) {
		space = 60;
	}
	newPos = rightBound + space;
	main.setAttribute("style","left:" + newPos + "px");
}

function adjustAd() {
	var svgPanel = $('.svg')[0];
	var ad = $('.ad')[0];
	var rightBound = svgPanel.getBoundingClientRect().right + 5;
	var leftBound = ad.getBoundingClientRect().left;
	if (leftBound < rightBound) {
		ad.setAttribute("style","visibility:hidden;opacity:0;");
		return "hidden";
	}
	else {
		ad.setAttribute("style","visibility:show;opacity:1;");
		return "visible";
	}
}

$( window ).resize(function() {
	adjustSvgWidth();
	adjustSvgPos();
	adjustAd();
});
adjustSvgWidth();
adjustSvgPos();
adjustAd();
//Triggering before the close

function dismissAndUpdate(element) {
	$(element).alert('close');
	var grid = document.getElementById("selectedkanji");
	var newBlock = $('#selectedkanji .new');
	newBlock.remove();
	grid.innerHTML += gridFormat("",true);
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





/* Start */

var MINCHARS = 3;     /* Minimum input length to initiate search */
var MINRESULTS = 25;  /* Minimum results to use stroke order grouping (aka markers)*/

getKanjidic2('../kanjidic2.xml', 'c');

document.getElementById("search").addEventListener("keyup", function() {
	onInputChange(event, MINCHARS, MINRESULTS);
});