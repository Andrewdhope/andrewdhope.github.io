// scripts to load html result documents from xml documents and xsl stylesheets

//next steps: finish books (qa comp, dates), put music under dev (future api work), commit

// jsonLoad
// generalized fetch and return json response
function jsonLoad(request) {
	// fetch returns a promise, .then defines an anonymous function to execute upon fulfillment
	//	"the first argument of .then is a function that runs when the promise is resolved and receives the result"
	//	...in this case the (anonymous) first function's first parameter is going to be the promise result
	//  ...if we were to list a second function, its first parameter would use the promise error
	//  ...note that fetch doesn't error due to HTTP status codes, so you check those in the result function
	// fetch is just a promise specialized to HTTP requests, that typically returns a response object
	fetch(request)
		.then(response => {
    		if (!response.ok) {
      			throw new Error(`HTTP error. Status: ${response.status}`);
    		}
			const jsonResponse = response.json();
			jsonResponse.then(r => { 
				console.log(r); 
			});
  		});
}

async function fetchMenu() {
	const menuRequest = new Request('./json/menu.json');
	const response = await fetch(menuRequest);
	const menuJson = await response.json();
	let returnMenu = "<ul>";
	for (let obj in menuJson) {
		console.log(`${obj}: ${menuJson[obj].section}`); // debug
		console.log(`${obj}: ${menuJson[obj].properties[0]}`); // debug
		// from here just build the html structure
		returnMenu += "<li class=\"menulist\">";
			returnMenu += "<a href=\"#\" onclick=\"buildJsonContent('" 
			returnMenu += `${menuJson[obj].section}` 
			returnMenu += "','" + `${menuJson[obj].properties[0]}` 
			returnMenu += "','" + `${menuJson[obj].properties[1]}`
			returnMenu += "','" + `${menuJson[obj].properties[2]}`
			returnMenu += "','" + `${menuJson[obj].baseurl}` + "');";
			returnMenu += "selectedMenu('" + `${menuJson[obj].section}` + "');\">";
			returnMenu += `${menuJson[obj].section}`;
			returnMenu += "</a>";
		returnMenu += "</li>";
	}
	returnMenu += "</ul>";
	
	console.log(returnMenu) // debug
	
	$("#content").slideUp("slow", function() { // slide the content side up before re-loading the navigation menu
		$("#content").html(""); // clear content
		$("#menu").slideUp("slow", function() {
			// start showing the border after one of the menu options is first clicked
			if (!document.getElementById("menu").classList.contains("border")) {
				$("#menu").addClass("border")
			}
			$("#menu").html(""); // clear menu
			$("#menu").append(returnMenu).slideDown(); // append
			}); 
		}
	);
	// take the array and build the menu (new function)
	// will need to re-create the format of the resultDocument
	return;
}

// buildJsonContent
// next step: continue building out html, using existing 'work' formatting for now
async function buildJsonContent(file, primary, secondary, queryparams, baseurl) {
	const filepath = './json/' + file + '.json';
	console.log(filepath);
	const fileRequest = new Request(filepath);
	const response = await fetch(fileRequest);
	const jsonResponse = await response.json();
	let returnContent = ""
	console.log(`${jsonResponse[0][primary]}`)
	for (let obj in jsonResponse) {
		returnContent += "<div class=\"bullet\" id=\"" + `${jsonResponse[obj][primary]}` + "\">"
		returnContent += "<h2 class=\"collapsible\">"
		returnContent += "<a href=\"" + baseurl + `${jsonResponse[obj][queryparams]}` + "\" target=\"_blank\">"
		returnContent += `${jsonResponse[obj][primary]}`
		returnContent += "</a>"
		returnContent += "</h2>"
		returnContent += "<div>"
		returnContent += `${jsonResponse[obj][secondary]}`
		returnContent += "</div>"
		// returnContent += "<p>"
		// returnContent += `${jsonResponse[obj][description]}`
		// returnContent += "</p>"
		returnContent += "</div>"
	}
	// 'slide up, clear, and append'
	$("#content").slideUp("slow", function() {
		// start showing the border after one of the menu options is first clicked
		if (!document.getElementById("content").classList.contains("border")) {
			$("#content").addClass("border")
		}
		if (!document.getElementById("content").classList.contains("life-list")) {
			$("#content").addClass("life-list")
		}
		$("#content").html(""); // clear content
		$("#content").html(returnContent).slideDown(); 
		}
	); 
	return;
}

// ajaxLoad
// standard ajax call using the XMLHttpRequest object
// this function is used to retrieve both xml documents and xsl stylesheets,
//  by calling the ajaxLoad function a second time when a stylesheet is needed
function ajaxLoad(path, callback, stylesheetPath, args) { 
	var request, xmlDoc ;
	request = new XMLHttpRequest();
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
	var xsltProcessor, resultDocument ;
	xsltProcessor = new XSLTProcessor();
	xsltProcessor.importStylesheet(xslDoc); 
	resultDocument = xsltProcessor.transformToFragment(xmlDoc, document);	
	
	// 'slide up, clear, and append'
	$("#content").slideUp("slow", function() { // slide the content side up before re-loading the navigation menu
		$("#content").html(""); // clear content
		$("#menu").slideUp("slow", function() {
			// start showing the border after one of the menu options is first clicked
			if (!document.getElementById("menu").classList.contains("border")) {
				$("#menu").addClass("border")
			}
			$("#menu").html(""); // clear menu
			$("#menu").append(resultDocument).slideDown(); // append
			}); 
		}
	);
	return;
}

// buildContent
// the callback functions take an xsl stylesheet in the first parameter and the xml document in the second
function buildContent(xslDoc, xmlDoc, sectionVal) {
	var xsltProcessor, resultDocument ;
	xsltProcessor = new XSLTProcessor();
	xsltProcessor.importStylesheet(xslDoc);
	xsltProcessor.setParameter(null,"sectionVal",sectionVal); 		
	resultDocument = xsltProcessor.transformToFragment(xmlDoc, document);

	// 'slide up, clear, and append'
	$("#content").slideUp("slow", function() {
		// start showing the border after one of the menu options is first clicked
		if (!document.getElementById("content").classList.contains("border")) {
			$("#content").addClass("border")
		}
		$("#content").html(""); // clear content
		$("#content").append(resultDocument).slideDown(); // append
		}
	); 
	return;
}
