/*  DepressedPress.com DP_Debug

Author: Jim Davis, the Depressed Press of Boston
Date: September 20, 2006
Contact: webmaster@depressedpress.com
Website: www.depressedpress.com

Full documentation can be found at:
http://www.depressedpress.com/Content/Development/JavaScript/Extensions/DP_Debug/Index.cfm

DP_Debug provides extensions to JavaScript to assist with debugging.

	+ The DP_Debug.dump() method allows you to dump an HTML representation of any JavaScript object to the DP_Debug console.  It supports nested objects, recursive references and chained method calls.
	+ The methods DP_Debug.dumpCookies() and DP_Debug.dumpQueryString dump important browser information to the console.
	+ The DP_Debug.log() method creates a log entry in the DP_Debug console.
	+ The methods DP_Debug.logInfo(), DP_Debug.logWarning() and DP_Debug.logError() provide shortcuts for logging specific types of messages.
	+ The DP_Debug.timer() method provides a simple way to time specific blocks of code.
	+ The DP_Debug.dpGetType() method provides a more specific answer as to an object type than the native typeof operator.

Copyright (c) 1996-2006, The Depressed Press of Boston (depressedpress.com)

All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

+) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer. 

+) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution. 

+) Neither the name of the DEPRESSED PRESS OF BOSTON (DEPRESSEDPRESS.COM) nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission. 

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

	// Add a container for utility methods
DP_Debug = new Object();

	// dumpWindow Management
	//
	// Opens the window, if it's not already open
DP_Debug.openDebugWindow = function() {

		// Create the Dump Window
	DPDebugWin = window.open("","dumpWindow","scrollbars=yes,resizable=yes,width=500,height=400");
	var DPW = DPDebugWin.document;

	if ( DPW.getElementById("dpBox") == null ) {

			// Write the HTML
		DPW.write(	"<html><head>",
					"<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">",
					"<html><head>",
					"	<title>dpDebug by the DepressedPress</title>",
					"	<meta http-equiv=\"Content-Type\" content=\"text/html;charset=utf-8\" />",
					"	<script type='text/javascript'>",
								// Begin the DumpInstances Count
					"		dumpInstances = 0;",
								// Create the storage container for the Timers
					"		timers = new Object();",
								// Create the storage container for the Log Entries
					"		dpLgEntries = new Array();",
								// Init the Page
					"		function pageInit() {",
					"			setLayout();",
					"		};",
					"		function toggleObDisplay(ObLabelID, ObValueID) {",
					"			var CurLabel = document.getElementById(ObLabelID);",
					"			var CurValue = document.getElementById(ObValueID);",
					"			if ( CurValue.style.display == 'none' ) {",
					"				CurValue.style.display = 'block';",
					"				CurLabel.style.fontStyle = 'normal';",
					"			} else {",
					"				CurValue.style.display = 'none';",
					"				CurLabel.style.fontStyle = 'italic';",
					"			};",
					"		};",
					"		function setRef() {",
					"			var dpRef = document.getElementById('dpRef').style;",
					"			var dpRefControl = document.getElementById('dpRefControl');",
					"			if ( dpRef.display == 'none' ) {",
					"				dpRef.display = 'block';",
					"				dpRefControl.innerHTML = 'Hide Quick Ref';",
					"			} else {",
					"				dpRef.display = 'none';",
					"				dpRefControl.innerHTML = 'Show Quick Ref';",
					"			};",
					"		};",
					"		window.onresize = function() { setLayout() };",
					"		function setLayout() {",
					"			var dpBoxH = document.getElementById('dpBox').clientHeight;",
					"			var dpPgHdr = document.getElementById('dpPgHdr');",
					"				dpPgHdrH = dpPgHdr.clientHeight;",
					"			var dpDpHdr = document.getElementById('dpDpHdr');",
					"				dpDpHdrH = dpDpHdr.clientHeight;",
					"			var dpLgHdr = document.getElementById('dpLgHdr');",
					"				dpLgHdrH = dpLgHdr.clientHeight;",
					"			var aH = dpBoxH - (dpPgHdrH + dpDpHdrH + dpLgHdrH);",
					"			if ( navigator.appName == 'Microsoft Internet Explorer' ) {",
					"				aH = aH - 2;",
					"			} else {",
					"				aH = aH - 30;",
					"			};",
					"			var NewDpH = parseInt((aH / 3) * 2);",
					"			if ( NewDpH < 1 ) { NewDpH = 1 };",
					"			document.getElementById('dpDpDsp').style.height = NewDpH + 'px';",
					"			if ( navigator.appName == 'Microsoft Internet Explorer' ) {",
					"				document.getElementById('dpDpDsp').style.width = '100%';",
					"			};",
					"			var NewLgH = parseInt(aH / 3);",
					"			if ( NewLgH < 1 ) { NewLgH = 1 };",
					"			document.getElementById('dpLgDsp').style.height = NewLgH + 'px';",
					"			if ( navigator.appName == 'Microsoft Internet Explorer' ) {",
					"				document.getElementById('dpLgDsp').style.width = '100%';",
					"			};",
					"			var dpRef = document.getElementById('dpRef');",
					"			var aH = dpBoxH - (dpPgHdrH + dpDpHdrH + dpLgHdrH);",
					"			if ( navigator.appName == 'Microsoft Internet Explorer' ) {",
					"				dpRef.style.height = (dpBoxH - 33) + 'px';",
					"				dpRef.style.width = '100%';",
					"			} else {",
					"				dpRef.style.height = (dpBoxH - 45) + 'px';",
					"				dpRef.style.width = document.getElementById('dpPgHdr').clientWidth - 30;",
					"			};",
					"			dpRef.style.top = 31;",
					"		};",
								// Write Log Entries to the Console
					"		function writeLog(TypeFilter) {",
					"			if ( typeof TypeFilter != 'string' ) { TypeFilter = 'All' };",
					"			var CurEntries = dpLgEntries;",
					"			var CurEntriesCnt = dpLgEntries.length;",
					"			var CurLgTypes = new Object();",
					"			var ML = '';",
					"			ML = '<table class=\"LogTable\">';",
					"			ML += '	<tr><td class=\"LogHeader\">Type</td><td class=\"LogHeader\">Time</td><td class=\"LogHeader\">Entry</td></tr>';",
					"			for ( var Cnt=0; Cnt < CurEntriesCnt; Cnt++ ) {",
					"				if ( CurEntries[Cnt].Type ) {",
											// Build the Option Types List
					"					if ( !CurLgTypes[CurEntries[Cnt].Type] ) {",
					"						CurLgTypes[CurEntries[Cnt].Type] = new Option(CurEntries[Cnt].Type);",
					"					};",
					"					if ( TypeFilter == 'All' || CurEntries[Cnt].Type == TypeFilter ) {",
												// Format the Time
					"						var CurTime = ('0' + CurEntries[Cnt].Time.getHours()).slice(-2) + ':' + ('0' + CurEntries[Cnt].Time.getMinutes()).slice(-2) + ':' + ('0' + CurEntries[Cnt].Time.getSeconds()).slice(-2) + '.' + ('00' + CurEntries[Cnt].Time.getMilliseconds()).slice(-3);",
												// Determine Color based on Type
					"						var CurColor = '#000000';",
					"						var CurBGColor = '#ffffff';",
					"						switch (CurEntries[Cnt].Type.toLowerCase()) {",
					"							case 'info':",
					"								CurBGColor = '#99ff00';",
					"								break;",
					"							case 'warning':",
					"								CurBGColor = '#ffff00';",
					"								break;",
					"							case 'error':",
					"								CurBGColor = '#ff0000';",
					"								break;",
					"							case 'dump':",
					"								CurBGColor = '#dddddd';",
					"								break;",
					"							case 'timer':",
					"								CurBGColor = '#6699ff';",
					"								break;",
					"						};",
												// Write the Entry
					"						ML += '	<tr><td class=\"LogEntry\" style=\"color: ' + CurColor + '; background-color: ' + CurBGColor + '; font-weight: bold;\">' + CurEntries[Cnt].Type + '</td><td class=\"LogEntry\">' + CurTime + '</td><td class=\"LogEntry\">' + CurEntries[Cnt].Content + '</td></tr>';",
					"					};",
					"				};",
					"			};",
					"			ML += '</table>';",
									// Output the current log
					"			document.getElementById('dpLgDsp').innerHTML = ML;",
									// Set the dpLgFilter
					"			var LgFilter = document.getElementById('dpLgFilter');",
					"			LgFilter.options.length = 0;",
					"			LgFilter.options[0] = new Option('All');",
					"			for ( Opt in CurLgTypes ) {",
					"				LgFilter.options[LgFilter.options.length] = CurLgTypes[Opt];",
					"				if ( Opt == TypeFilter ) {",
					"					CurLgTypes[Opt].selected = true;",
					"				};",
					"			};",
					"		};",
					"	</script>",
					"	<style type='text/css' media='screen'>",
					"		body {",
					"			height: 100%;",
					"			font-family: Verdana, Arial, sans-serif;",
					"			font-size: 11pt;",
					"			background-color: #b8db7c;",
					"			padding: 0px 0px 0px 0px;",
					"			margin: 0px 0px 0px 0px;",
					"			}",
					"		A:LINK {",
					"			color : #3300ff;",
					"			text-decoration : none;",
					"			}",
					"		A:VISITED {",
					"			color : #3300ff;",
					"			text-decoration : none;",
					"			}",
					"		A:HOVER {",
					"			text-decoration : underline;",
					"			}",
					"		.PgHdr {",
					"			height: 16px;",
					"			font-size: 12px;",
					"			text-align: center;",
					"			border: 1px black solid;",
					"			background-color: white;",
					"			color: #28166f;",
					"			font-weight: bold;",
					"			padding: 5px 5px 5px 5px;",
					"			}",
					"		.PgTtl {",
					"			float: left;",
					"			}",
					"		.PgTls {",
					"			float: right;",
					"			}",
					"		.ScHdr {",
					"			height: 15px;",
					"			font-size: 12px;",
					"			font-weight: bold;",
					"			padding: 5px 5px 5px 5px;",
					"			}",
					"		.ScTtl {",
					"			float: left;",
					"			}",
					"		.ScTls {",
					"			float: right;",
					"			}",
					"		.ScDsp {",
					"			padding: 5px 5px 5px 5px;",
					"			border: 2px black solid;",
					"			vertical-align: top;",
					"			overflow: auto;",
					"			background-color: white;",
					"			}",
					"		#dpLgFilter {",
					"			height: 15px;",
					"			font-size: 11px;",
					"			padding: 0px 0px 0px 0px;",
					"			}",
					"		.RefDsp {",
					"			position: absolute;",
					"			border: 1px black solid;",
					"			overflow: auto;",
					"			background-color: white;",
					"			padding: 5px 15px 5px 15px;",
					"			}",
					"		H1.RefHdr {",
					"			font-size: 12pt;",
					"			font-weight: bold;",
					"			}",
					"		H2.RefHdr {",
					"			background-color: #dddddd;",
					"			font-size: 9pt;",
					"			font-weight: bold;",
					"			}",
					"		table.InstTable {",
					"			width: 100%;",
					"			vertical-align: top;",
					"			padding: 0px;",
					"			border: 0px;",
					"			}",
					"		td.InstHeader {",
					"			padding: 1px 4px 1px 4px;",
					"			background-color: blue;",
					"			}",
					"		td.InstLabel {",
					"			font-size: 9pt;",
					"			color: white;",
					"			font-weight: bold;",
					"			text-decoration: underline;",
					"			cursor: pointer;",
					"			}",
					"		td.InstType {",
					"			font-size: 7pt;",
					"			color: white;",
					"			text-align: right;",
					"			}",
					"		td.InstValue {",
					"			}",
					"		table.ObTable {",
					"			width: 100%;",
					"			vertical-align: top;",
					"			padding: 0px;",
					"			border: 2px blue solid;",
					"			}",
					"		td.ObHeader {",
					"			padding: 1px 4px 1px 4px;",
					"			background-color: #eeeeee;",
					"			}",
					"		td.ObLabel {",
					"			font-size: 9pt;",
					"			color: gray;",
					"			font-weight: bold;",
					"			text-decoration: underline;",
					"			cursor: pointer;",
					"			}",
					"		td.ObType {",
					"			font-size: 7pt;",
					"			color: gray;",
					"			text-align: right;",
					"			}",
					"		td.ObValue {",
					"			padding: 4px 4px 4px 30px;",
					"			}",
					"		hr.ObSeparator {",
					"			height: 2px;",
					"			color: #b8db7c;",
					"			background-color: #b8db7c;",
					"			margin: 10px 10% 10px 10%;",
					"			}",
					"		table.LogTable {",
					"			width: 100%;",
					"			vertical-align: top;",
					"			padding: 0px;",
					"			border: 0px;",
					"			}",
					"		td.LogHeader {",
					"			padding: 1px 4px 1px 4px;",
					"			background-color: #dddddd;",
					"			font-size: 9pt;",
					"			font-weight: bold;",
					"			}",
					"		td.LogEntry {",
					"			padding: 1px 4px 1px 4px;",
					"			vertical-align: top;",
					"			font-size: 9pt;",
					"			}",
					"	</style>",
					"</head><body onload='pageInit();'>",
					"	<div id='dpBox' style='height: 100%; width: 100%; position: absolute; z-index: -1;'></div>",
					"	<div id='dpPgHdr' class='PgHdr'>",
					"		<div id='dpPgTtl' class='PgTtl'>DP_Debug by the <a href='http://www.depressedpress.com/' target='_blank'>DepressedPress</a></div>",
					"		<div id='dpPgTls' class='PgTls'><a id='dpRefControl' href='JavaScript: setRef();'>Show Quick Ref</a></div>",
					"	</div>",
					"	<div style='clear: both;' />",
					"	<div id='dpRef' class='RefDsp' style='display: none;'>",
					"		<h1 class='RefHdr'>DP_Debug Quick Reference</h1>",
					"		<p>This is a quick reference guide to the methods available in the dpDebug library.  Full documentation is available <a href='http://www.depressedpress.com/Content/Development/JavaScript/Extensions/DP_Debug/Index.cfm' target='_blank'>here</a>.</p>",
					"		<h2 class='RefHdr'>DP_Debug.dump(Object, [DevLabel], [ShowFunctions], [MaxRecurseLevel])</h2>",
					"			<p>Dumps a visual representation of a JavaScript Object to the dump console.</p>",
					"			<ul><li><em>Object</em>: Object, Required. The object which you'd like to dump.</li>",
					"				<li><em>DevLabel</em>: String, Optional (defaults to empty string). An arbitrary developer label to be displayed with the dump output.</li>",
					"				<li><em>ShowFunctions</em>: Boolean, Optional (defaults to false). If set to true user-defined functions, in addition to object properties, will be displayed.</li>",
					"				<li><em>MaxRecurseLevel</em>: Numeric, Optional (defaults to -1 which indicates no limit). This argument determines how deeply an object should be explored.</li>",
					"			</ul>",
					"		<h2 class='RefHdr'>DP_Debug.dumpCookies()</h2>",
					"			<p>Dumps the currently accessible browser cookies to the dump console.</p>",
					"		<h2 class='RefHdr'>DP_Debug.dumpQueryString()</h2>",
					"			<p>Dumps the currently accessible Query String values to the dump console.</p>",
					"		<h2 class='RefHdr'>DP_Debug.timer(Name)</h2>",
					"			<p>If the specified Name does not exist starts a timer with that name.  If the name does exist ends the timer and outputs the duration to the log console.</p>",
					"			<ul><li><em>Name</em>: String, Optional (defaults to 'timer').  The name of the timer.</li>",
					"			</ul>",
					"		<h2 class='RefHdr'>DP_Debug.logger(Content, Type)</h2>",
					"			<p>Creates an entry in the log console.</p>",
					"			<ul><li><em>Content</em>: String, Required. The message to display.</li>",
					"				<li><em>Type</em>: String, Optional (defaults to 'Info'). The type of message.  'Info', 'Warning', and 'Error' are standard values although any value may be entered.</li>",
					"			</ul>",
					"		<h2 class='RefHdr'>DP_Debug.logInfo(Content)</h2>",
					"			<p>Creates an entry in the log console of type 'Info'.</p>",
					"			<ul><li><em>Content</em>: String, Required. The message to display.</li>",
					"			</ul>",
					"		<h2 class='RefHdr'>DP_Debug.logWarning(Content)</h2>",
					"			<p>Creates an entry in the log console of type 'Warning'.</p>",
					"			<ul><li><em>Content</em>: String, Required. The message to display.</li>",
					"			</ul>",
					"		<h2 class='RefHdr'>DP_Debug.logError(Content)</h2>",
					"			<p>Creates an entry in the log console of type 'Error'.</p>",
					"			<ul><li><em>Content</em>: String, Required. The message to display.</li>",
					"			</ul>",
					"		<h2 class='RefHdr'>DP_Debug.getType(Object)</h2>",
					"			<p>Returns the type of the passed object.</p>",
					"			<ul><li><em>Content</em>: Object, Required. The object to examine.</li>",
					"			</ul>",
					"		<h2 class='RefHdr'>DP_Debug.enable()</h2>",
					"			<p>Sets the 'enabled' flag to true.</p>",
					"		<h2 class='RefHdr'>DP_Debug.disable()</h2>",
					"			<p>Sets the 'enabled' flag to false.</p>",
					"		<h2 class='RefHdr'>DP_Debug.isEnabled()</h2>",
					"			<p>Returns the current value of the 'enabled' flag.</p>",
					"	</div>",
					"	<div id='dpDpHdr' class='ScHdr'>",
					"		<div id='dpDpTtl' class='ScTtl'>dump Output</div>",
					"		<div id='dpDpTls' class='ScTls'><a href='#' onclick='document.getElementById(\"dpDpDsp\").innerHTML = \"\"; return false;'>Clear</a></div>",
					"	</div>",
					"	<div style='clear: both;' />",
					"	<div id='dpDpDsp' class='ScDsp'></div>",
					"	<div id='dpLgHdr' class='ScHdr'>",
					"		<div id='dpLgTtl' class='ScTtl'>log Output</div>",
					"		<div id='dpLgTls' class='ScTls'>",
					"			<span style='padding-right: 15px;'>Show: <select id='dpLgFilter' onchange='writeLog(this.options[this.selectedIndex].text);'></select></span>",
					"			<a href='#' onclick='dpLgEntries = new Array(); writeLog(); return false;'>Clear</a>",
					"		</div>",
					"	</div>",
					"	<div style='clear: both;' />",
					"	<div id='dpLgDsp' class='ScDsp'></div>",
					"</body></html>");
						// Close the stream
					DPW.close();
	};

};

	// Default Enabled status to "false"
DP_Debug.Enabled = false;
	// Methods to indicate enabled/disabled status
DP_Debug.enable = function() {
	DP_Debug.Enabled = true;
};
DP_Debug.disable = function() {
	DP_Debug.Enabled = false;
};
DP_Debug.isEnabled = function() {
	return DP_Debug.Enabled;
};

	// Add convienence methods for common log operations
DP_Debug.logInfo = function(Content) {
	DP_Debug.logger(Content, "Info");
};
DP_Debug.logWarning = function(Content) {
	DP_Debug.logger(Content, "Warning");
};
DP_Debug.logError = function(Content) {
	DP_Debug.logger(Content, "Error");
};
	// "log" method
DP_Debug.logger = function(Content, Type) {

		// Manage input params
	if ( typeof Content != "string" || Content == "" ) {
		var Content = "";
	};
	if ( typeof Type != "string" || Type == "" ) {
		var Type = "Info";
	};

		// Open the dumpWindow (if it's not already open)
	DP_Debug.openDebugWindow()

		// Get the Current Entries
	var CurEntries = DPDebugWin.dpLgEntries;
		// Generate an Entry Object 
	var NewEntry = new Object();
	NewEntry.Content = Content;
	NewEntry.Type = Type;
	NewEntry.Time = new Date();

		// Add the new Entry to the List
	CurEntries[CurEntries.length] = NewEntry;

		// Write the Log Entry
	DPDebugWin.writeLog();

		// Return
	return;

};


	// Extend Object with the "log" method
DP_Debug.timer = function(Name) {

		// Manage input params
	if ( typeof Name != "string" || Name == "" ) {
		var Name = "timer";
	};

		// Open the dumpWindow (if it's not already open)
	DP_Debug.openDebugWindow();

		// Get the Current Entries
	var CurTimers = DPDebugWin.timers;

		// See if this is a new timer
	if ( typeof CurTimers[Name] == "undefined" ) {
			// Set the Timer Start Point
		CurTimers[Name] = new Date();
			// Output the log entry
		DP_Debug.logger("Timer \"" + Name + "\" started.", "Timer");
	} else {	
			// Get the Timer Start Point
		var CurStart = CurTimers[Name];
		var CurEnd = new Date();
			// Reset the Timer
		CurTimers[Name] = undefined;
			// Get the duration
		var CurTime = CurEnd.getTime() - CurStart.getTime()
			// Output the log entry
		DP_Debug.logger("Timer \"" + Name + "\" ended.  Duration " + CurTime + " ms", "Timer");
	};

		// Return
	return;

};


	// Cookie Dumper
DP_Debug.dumpCookies = function() {

	var AllCookies = new Object;
	var Cookies = document.cookie.split(";");

	for ( var Cnt=0; Cnt < Cookies.length; Cnt++ ) {
		var CurCookie = Cookies[Cnt].split("=");
		if ( CurCookie[0] ) {
			if ( CurCookie[1] ) {
				AllCookies[CurCookie[0].replace(/^\s*|\s*$/g,"")] = CurCookie[1];
			} else {
				AllCookies[CurCookie[0].replace(/^\s*|\s*$/g,"")] = "";
			};
		};
	};

	DP_Debug.dump(AllCookies, "Accessible Browser Cookies");

};


	// Query String Dumper
DP_Debug.dumpQueryString = function() {

	var QS, AllElements, CurElement, CurName, CurVal

	QS = new Object();
	QueryString = location.search;

		// Split the query string on the ampersand (the substring removes the question mark)
	AllElements = QueryString.substring(1).split('&');

		// Loop over the elements
	for( var Cnt = 0; Cnt < AllElements.length; Cnt++) {
			// Split the current element on the equals sign
		CurElement = AllElements[Cnt].split('=');
		CurName = unescape(CurElement[0]).replace(/^\s*|\s*$/g,"");
			// Call the get method to obtain the value
		if ( CurName.length > 0 ) {

			if ( !QS[CurName] ) { QS[CurName] = new Array() };
			QS[CurName][QS[CurName].length] = CurElement[1];

		};
	};

		// Dump the object
	DP_Debug.dump(QS, "Accessible Query String Values");

};


	// Extend Object with the "dump" method
DP_Debug.dump = function(Ob, DevLabel, ShowFunctions, MaxRecurseLevel) {

		// Grab the Start time
	var DumpStart = new Date();

		// Open the dumpWindow (if it's not already open)
	DP_Debug.openDebugWindow()

		// Set up the Object Checker
	var ParsedObs = new Array();
		// Define the current Dump InstanceID
	var InstID = DPDebugWin.dumpInstances++;
	var ObID = 0;
	var ObRefID = 0;

		// Manage input params
	if ( typeof DevLabel != "string" || DevLabel == "" ) {
		var DevLabel = "";
	};
		// Only IE can handle local links in popups generated by JavaScript 
	if ( navigator.appName == "Microsoft Internet Explorer" ) {
		LogLabel = "<a href='#Inst_" + InstID + "'>[Dump " + (InstID + 1) + "]</a> " + DevLabel;
	} else {
		LogLabel = "[Dump " + (InstID + 1) + "] " + DevLabel;
	};
		// Set the full Dev Label
	DevLabel = "<a name='Inst_" + InstID + "'>[Dump " + (InstID + 1) + "]</a> " + DevLabel;
		// Set whether or not to show functions
	if ( typeof ShowFunctions != "boolean" ) {
		var ShowFunctions = false;
	};
		// Set the maximum recursive level
	if ( typeof MaxRecurseLevel != "number" ) {
		var MaxRecurseLevel = -1;
	};

		// Set the encoded character dictionary for the conversion to HTML
	var EncodedChars = new Array();
		// Add simple chars (&amp; must come first!)
	EncodedChars["&"] = "&amp;";
	EncodedChars["<"] = "&lt;";
	EncodedChars[">"] = "&gt;";
	EncodedChars["\""] = "&quot;";

		// Output the current dump
	DPDebugWin.document.getElementById("dpDpDsp").innerHTML += parseToHTML(Ob, DevLabel);

		// Grab the End Time
	var DumpEnd = new Date();
		// Determine the total time
	var DumpTime = DumpEnd.getTime() - DumpStart.getTime()
		// Output the log entry
	DP_Debug.logger(LogLabel + " (Completed in " + DumpTime + " ms)", "Dump");

		// Return a reference to the object
	return Ob;

		// Escape characters using the Encoded Chars tables
	function escapeString(CurString) {
		var CurRegEx;
		for ( var CurChar in EncodedChars ) {
			if (typeof EncodedChars[CurChar] != "function") {;
				if ( CurChar != "\\" ) {
					CurRegEx = new RegExp(CurChar, "g");
				} else {
					CurRegEx = /\\/g;
				};
				CurString = CurString.replace(CurRegEx, EncodedChars[CurChar]);
			};
		};
		return CurString;	
	};

		// Has the object been parsed already?
	function checkIfParsedOB(Ob) {
			// Check the parsed array
		for ( var Cnt = 0; Cnt < ParsedObs.length; Cnt++ ) {
			if ( ParsedObs[Cnt] === Ob ) {
				return true;
			};
		};
			// Add the passed object to the parsed array
		ParsedObs[ParsedObs.length] = Ob;
		return false;
	}; 

		// Get the Ref ID
	function getObRefID(Ob) {
			// Check the parsed array
		for ( var Cnt = 0; Cnt < ParsedObs.length; Cnt++ ) {
			if ( ParsedObs[Cnt] === Ob ) {
				return Cnt;
			};
		};
		return "";
	}; 

		// Parse objects to HTML
	function parseToHTML(Ob, ObLabel, RecurseLevel, ForceUnknown) {

			// Manage Arugments
		if ( typeof RecurseLevel != "number" ) {
			RecurseLevel = 0;
		};
		if ( typeof ForceUnknown != "boolean" ) {
			ForceUnknown = false;
		};
		
			// Update the object ID
		ObID = ObID + 1;

			// Initialize results
		var Results = "";

			// Set options based on whether this is the first pass or a recursive pass
		if ( RecurseLevel == 0 ) {
			var StylePrefix = "Inst";
			Results += "<table class='InstTable' cellspacing='0'>";
		} else {
			var StylePrefix = "Ob";
		};

			// Get some information about the passed Object and set some display fragments
		if ( ForceUnknown ) {
			var ObType = "unknown";
		} else {
			var ObType = DP_Debug.getType(Ob);
		};
		var ObLabelID = "ObLabel_" + InstID + "_" + ObID;
		var ObValueID = "ObValue_" + InstID + "_" + ObID;
		var ObIDLink = "";
		var ObDisplayed = false;
		switch ( ObType ) {
	        case "object": case "array":
					// Check to see if the object has already been displayed
				if ( checkIfParsedOB(Ob) ) {
					ObDisplayed = true;
				};
				var CurObRefID = getObRefID(Ob);
				if ( ObDisplayed ) {
						// Only IE can handle local links in popups generated by JavaScript 
					if ( navigator.appName == "Microsoft Internet Explorer" ) {
						ObIDLink = " <a href='#Inst_" + InstID + "_" + CurObRefID + "'>(id: " + CurObRefID + ")</a>";
					} else {
						ObIDLink = " (id: " + CurObRefID + ")";
					};
				} else {
					ObIDLink = " <a name='Inst_" + InstID + "_" + CurObRefID + "'>(id: " + CurObRefID + ")</a>";
				};
		};

			// Display Element Header
		Results += "<tr><td onclick='toggleObDisplay(\"" + ObLabelID + "\", \"" + ObValueID + "\");' id='" + ObLabelID + "' class='" + StylePrefix + "Header " + StylePrefix + "Label'>" + ObLabel + "</td><td class='" + StylePrefix + "Header " + StylePrefix + "Type'>" + ObType + ObIDLink + "</td></tr>";
		Results += "<tr><td colspan='2' class='" + StylePrefix + "Value'><div id='" + ObValueID + "'>";

			// Display Element Content
		switch ( ObType ) {
	        case "object": case "array":
				if ( ObDisplayed ) {
					Results += "<tt>( Previously Displayed )</tt>";
				} else if ( RecurseLevel == MaxRecurseLevel ) {
					Results += "<tt>( Maximum Recursion Depth Reached )</tt>";
				} else {
						// Determine if the object is enumerable
					var ObEnumerable = true;
					try { for ( var Prop in Ob ) { break; } } catch (CurError) {	ObEnumerable = false; };
						// Loop over object
					if ( ObEnumerable ) {
						Results += "<table class='ObTable' cellspacing='0'>";
						for ( var Prop in Ob ) {
							PropEnumerable = true;
							try { typeof Ob[Prop]; Ob[Prop]; } catch (CurError) { 
								PropEnumerable = false;
								Results += parseToHTML(null, Prop, RecurseLevel + 1, true);
							};
							if ( PropEnumerable && ( typeof Ob[Prop] != "function" || ShowFunctions ) ) {
								Results += parseToHTML(Ob[Prop], Prop, RecurseLevel + 1);
							};
						};
						Results += "</table>";
					} else {
						Results += "<tt>( Object is not Enumerable )</tt>";
					};
				};
				break;
	        case "function":
				Results += escapeString(Ob.toString());
				break;
	        case "null":
				Results += "<tt>( null )</tt>";
				break;
	        case "date":
				Results += Ob.toString();
				break;
	        case "number":
				Results += Ob.toString();
				break;
	        case "string":
				if ( Ob.length == 0 ) {
					Results += "<tt>( Empty String )</tt>";
				} else {
					Results += escapeString(Ob);
				};
				break;
	        case "boolean":
				Results += Ob.toString();
				break;
	        case "undefined":
				Results += "<tt>( Undefined Entity )</tt>";
				break;
	        case "unknown":
				Results += "<tt>( Entity is not Enumerable )</tt>";
				break;
		};

			// Display Element Footer
		Results += "</div></td></tr>";
		if ( RecurseLevel == 0 ) {
			Results += "</table><hr class='ObSeparator'>"
		};

			// Return Results
		return Results;
		
	};

};


	// Extend Object with the "dpGetType" method
DP_Debug.getType = function(Ob) {

	try {
		switch (typeof Ob) {
	        case "object":
				if ( Ob == null ) {
					return "null";
				} else if ( Ob.constructor == Date ) {
					return "date";
				} else if ( Ob.constructor == Array ) {
					return "array";
				} else if ( Ob.constructor == String ) {
					return "string";
				} else if ( Ob.constructor == Number ) {
					return "number";
				} else if ( Ob.constructor == Boolean ) {
					return "boolean";
				} else if ( Ob == undefined ) {
					return "undefined";
				} else {
					return "object";
				};
	        case "function":
				return "function";
	        case "number":
				return "number";
	        case "string":
				return "string";
	        case "boolean":
				return "boolean";
	        case "undefined":
				return "undefined";
	        default:
				return "unknown";
		};
	} catch (CurError) {
		return "unknown";
	};

};
