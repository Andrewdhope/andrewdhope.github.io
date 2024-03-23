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
		// from here just build the html structure
		returnMenu += "<li class=\"menulist\">";
			returnMenu += "<a href=\"#\" onclick=\"buildJsonContent('" 
			returnMenu += `${menuJson[obj].section}` 
			returnMenu += "','" 
			returnMenu += `${menuJson[obj].baseurl}`
			for (let i in menuJson[obj].properties) {
				returnMenu += "','" + `${menuJson[obj].properties[i]}` 	
			}
			returnMenu += "');";
			returnMenu += "selectedMenu('" + `${menuJson[obj].section}` + "');\">";
			returnMenu += `${menuJson[obj].section}`;
			returnMenu += "</a>";
		returnMenu += "</li>";
	}
	returnMenu += "</ul>";
	
	//console.log(returnMenu) 
	
	$("#content").slideUp("slow", function() { // slide the content side up before re-loading the navigation menu
		ajaxLoad(xmlpath,buildContent,xslpath,['intro']);

		if (mode_change == 1) {
			$("#menu").slideUp("slow", function() {
				// start showing the border after one of the menu options is first clicked
				if (!document.getElementById("menu").classList.contains("border")) {
					$("#menu").addClass("border")
				}
				$("#menu").html(""); // clear menu
				$("#menu").append(returnMenu).slideDown(); // append
				}); 
			}
		}
	);
	// take the array and build the menu (new function)
	// will need to re-create the format of the resultDocument
	return;
}

// buildJsonContent
// all entries in menu.json have a section and baseurl, then a properties array that goes into args here
async function buildJsonContent(file, baseurl,...args) {
	const filepath = './json/' + file + '.json';
	const fileRequest = new Request(filepath);
	const response = await fetch(fileRequest);
	const jsonResponse = await response.json();	

	let sortedObj = sortByDate(jsonResponse, args[3]);
	let resonseObj = {};	
	let returnContent = "";

	for (let i = Object.keys(sortedObj).length - 1; i >= 0; i--) {
		let ikey = Object.keys(sortedObj)[i];
		if (ikey > 0 ) {
			returnContent += "<div class=\"collator\">" + ikey + "</div>"
		}
		for (let j = Object.keys(sortedObj[ikey]["sortedObject"]).length - 1; j >=0; j--) {
			let jkey = Object.keys(sortedObj[ikey]["sortedObject"])[j]
			resonseObj = sortedObj[ikey]["sortedObject"][jkey][1]
			
			returnContent += "<div class=\"bullet\" id=\"" + `${resonseObj[args[0]]}` + "\">"
			returnContent += "<h2 class=\"collapsible\">"
			returnContent += "<a href=\"" + baseurl + `${resonseObj[args[2]]}` + "\" target=\"_blank\">"
			returnContent += `${resonseObj[args[0]]}`
			returnContent += "</a>"
			returnContent += "</h2>"
			returnContent += "<div class=\"line " + args[1] + "\">"
			returnContent += `${resonseObj[args[1]]}`
			returnContent += "</div>"
			returnContent += "</div>"
		}
	}
	// 'slide up, clear, and append'
	$("#content").slideUp(750, function() {
		// start showing the border after one of the menu options is first clicked
		if (!document.getElementById("content").classList.contains("border")) {
			$("#content").addClass("border")
		}
		// currently setting the height to 75vh for all json content, and dynamic for ajax content
		// need to size the overflow dynamically
		if (!document.getElementById("content").classList.contains("overflow-list")) {
			$("#content").addClass("overflow-list")
		}
		$("#content").html(""); // clear content
		$("#content").html(returnContent).slideDown(750); 
	}); 
	return;
}

// sortByDate
// dateProperty is assumed to be dash-delimited date string
function sortByDate(jsonObject, dateProperty) {
	let dateNode = "";
	let yearPiece = "";
	let sortedObj = {};

	for (let i in jsonObject) {
		dateNode = dateProperty;
		if (dateNode != null) {
			yearPiece = jsonObject[i][dateNode].split('-')[0];
		}
		else {
			// if dateProperty doesn't exist, sort by (reverse) index-order of the json object
			dateNode = i
			yearPiece = -1;
			jsonObject[i][dateNode] = i;
		}
		if (sortedObj[yearPiece] != null) {
			sortedObj[yearPiece].sortedObject.push([jsonObject[i][dateNode], jsonObject[i]]);
		}
		else {
			// instantiate sortedObject for this year node
			// sortedObject contains the full date node and the full json object
			sortedObj[yearPiece] = {sortedObject: []};
			sortedObj[yearPiece].sortedObject = [[jsonObject[i][dateNode], jsonObject[i]]];
		}
	}
	
	for (let i in sortedObj) {
		sortedObj[i].sortedObject = sortedObj[i].sortedObject.sort();
	}
	
	return sortedObj;
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
function buildMenu(xslDoc, xmlDoc, mode_click) {
	var xsltProcessor, resultDocument ;
	xsltProcessor = new XSLTProcessor();
	xsltProcessor.importStylesheet(xslDoc); 
	resultDocument = xsltProcessor.transformToFragment(xmlDoc, document);	

	$("#content").slideUp("slow", function() {
		ajaxLoad(xmlpath,buildContent,xslpath,['intro']);

		if (mode_change == 1) {
			$("#menu").slideUp("slow", function() {
				// start showing the border after one of the menu options is first clicked
				if (!document.getElementById("menu").classList.contains("border")) {
					$("#menu").addClass("border")
				}
				/*
				if (document.getElementById("content").classList.contains("overflow-list")) {
					$("#content").removeClass("overflow-list")
				}
				*/
				if (!document.getElementById("content").classList.contains("overflow-list")) {
					$("#content").addClass("overflow-list")
				}
				$("#menu").html(""); // clear menu
				$("#menu").append(resultDocument).slideDown(); // append
			}); 
		}
	});

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
	$("#content").slideUp(750, function() {
		// start showing the border after one of the menu options is first clicked
		if (!document.getElementById("content").classList.contains("border")) {
			$("#content").addClass("border")
		}
		$("#content").html(""); // clear content
		$("#content").append(resultDocument).slideDown(750); // append
		}
	); 
	return;
}
