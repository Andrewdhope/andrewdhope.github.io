var xmlpath, xslpath ;

function setPath(setting) {
	if (setting == "work") {
		xmlpath = "xml/career.xml"
		xslpath = "xml/transform.xsl"
	}
	
	if (setting == "life") {
		xmlpath = "xml/leisure.xml"
		xslpath = "xml/transform.xsl"
	}
}