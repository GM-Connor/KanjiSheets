var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
    	readXML(this);
    }
};
xhttp.open("GET", "../kanjidic2.xml", true);
xhttp.send();

function readXML(xml) {
    var xmlDoc = xml.responseXML;
    console.log(xmlDoc.getElementsByTagName("c")[0]);
}