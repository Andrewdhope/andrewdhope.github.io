var xmlpath, xslpath ;

function setPath(setting) {
	if (setting == "work") {
		xmlpath = "xml/career.xml"
		xslpath = "xml/transform-work.xsl"
	}
	
	if (setting == "life") {
		xmlpath = "xml/leisure.xml"
		xslpath = "xml/transform-life.xsl"
	}
}