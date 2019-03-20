// scripts to load html result documents from xml documents and xsl stylesheets

// ajaxLoad
// standard ajax call using the XMLHttpRequest object
// this function is used to retrieve both xml documents and xsl stylesheets,
//  by calling the ajaxLoad function a second time when a stylesheet is needed
function ajaxLoad(path, callback, stylesheetPath, args) { 
	var request, xmlDoc ;
	if (window.ActiveXObject !== undefined) // IE Only
		{
			request = new ActiveXObject("Msxml2.XMLHTTP");
		}
	else // better browsers
		{
			request = new XMLHttpRequest();
		}
	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200) {
			xmlDoc = request.responseXML;
			args.unshift(xmlDoc); // the xml document will be the first argument, unless it is unshifted by an xsl stylesheet
			if (stylesheetPath) {
				// this passes the execution to getStylesheet, 
				//  which re-calls ajaxLoad, unshifts the stylesheet,
				// 	and executes the callback (by hitting the else below)
				getStylesheet(stylesheetPath, callback, args); 
			}
			else {
				// called if no stylesheet is defined (or if the stylesheet is already unshifted)
				callback.apply(null,args); // using apply to pass an array of arguments to the callback function
			}
		}
	}
	request.open("GET", path, true); 
	request.send();
}	


// getStylesheet
// call ajaxLoad again to get an xsl doc and unshift it into the args parameter
// the xsl stylesheet path takes the place of the xml document in this call, with the stylesheet parameter null 
// (the original xml document is passed in to this function within the args parameter)
function getStylesheet(stylesheetPath, callback, args) {
	ajaxLoad(stylesheetPath, callback, null, args); 
	return;
}


// buildMenu
// the callback functions take an xsl stylesheet in the first parameter and the xml document in the second
function buildMenu(xslDoc, xmlDoc) {
	
	// IE only
	if (window.ActiveXObject !== undefined) // IE only
	{
		var resultDocumentIE
		resultDocumentIE = xmlDoc.transformNode(xslDoc);
	}
	else // better browsers
	{
		var xsltProcessor, resultDocument ;
		xsltProcessor = new XSLTProcessor();
		xsltProcessor.importStylesheet(xslDoc); 
		resultDocument = xsltProcessor.transformToFragment(xmlDoc, document);
	}
	
	// 'slide up, clear, and append'
	$("#content").slideUp("slow", function() // slide the content side up before re-loading the navigation menu
		{
		$("#content").html(""); // clear content
		$("#menu").slideUp("slow", function() {
			// start showing the border after one of the menu options is first clicked
			if (!document.getElementById("menu").classList.contains("border")) {
				$("#menu").addClass("border")
			}
			$("#menu").html(""); // clear menu
			
			if (window.ActiveXObject !== undefined) // IE only
				{
					$("#menu").append(resultDocumentIE).slideDown(); // append
				}
			else // better browsers
				{
					$("#menu").append(resultDocument).slideDown(); // append
				}
			
			}); 
		}
	);
	
	return;
}


// buildContent
// the callback functions take an xsl stylesheet in the first parameter and the xml document in the second
function buildContent(xslDoc, xmlDoc, sectionVal) {
	
	// IE only
	if (window.ActiveXObject !== undefined) // IE only
	{	
		var xsldocument = new ActiveXObject("Msxml2.FreeThreadedDOMDocument.6.0");
		xsldocument.load(xslDoc);
		
		var xmldocument = new ActiveXObject("Msxml2.FreeThreadedDOMDocument.6.0");
		xmldocument.load(xmlDoc);
		
		var xsltemplate = new ActiveXObject("Msxml2.XSLTemplate.6.0");
		xsltemplate.stylesheet = xsldocument;
		
		var xslprocess = xsltemplate.createProcessor();
		xslprocess.input = xmldocument;
		xslprocess.addParameter('sectionVal', sectionVal);
		xslprocess.transform();
		
		var resultDocumentIE = xslprocess.output;
	}
	else // better browsers
	{
		var xsltProcessor, resultDocument ;
		xsltProcessor = new XSLTProcessor();
		xsltProcessor.importStylesheet(xslDoc);
		xsltProcessor.setParameter(null,"sectionVal",sectionVal); 		
		resultDocument = xsltProcessor.transformToFragment(xmlDoc, document);
	}
	
	// 'slide up, clear, and append'
	$("#content").slideUp("slow", function() {
		// start showing the border after one of the menu options is first clicked
		if (!document.getElementById("content").classList.contains("border")) {
			$("#content").addClass("border")
		}
		$("#content").html(""); // clear content
		
		if (window.ActiveXObject !== undefined) // IE only
			{
				$("#content").append(resultDocumentIE).slideDown(); // i can get here, but need to figure out the document
			}
		else // better browsers
			{
				$("#content").append(resultDocument).slideDown(); // append
			}
		}
	); 
	
	return;
}
