// ==UserScript==
// @name         Uloba Arbeidsplan to Google Calendar
// @namespace    http://balazsorban.com/
// @version      0.1
// @description  Uloba CSV export
// @author       Balázs Orbán (info@balazsorban.com)
// @match        https://arbeidsplan.uloba.no/Home/PersonIndexPrint*
// @grant        none
// ==/UserScript==

// --------------------------------------MAIN FUNCTION-------------------------------------- //
function main(){
// ASKS USER FOR THE LOCATION OF THE EVENTS (OPTIONAL, SHOULD NOT CONTAIN "," BECAUSE OF THE PARSING FORMAT (CSV SEPARATES BY COMMAS))
  var workLocation = window.prompt("Location(optional)(DO NOT USE COMMA!)");

//FINDING THE EMPLOYER (ARBEIDSLEDER)
  var employer;
  var e = document.querySelectorAll('th, td');
  for (var i = 0; i < e.length; i++) {
    if (e[i].className == "assistantNameHeader" && e[i].innerText.length > 0 ){
      employer = e[i+8].innerText;
    }
  }
//console.log(employer); // WHO IS THE EMPLOYER?

// GATHERING THE IMPORTANT DATA
  var data = document.querySelectorAll('th,td');
  var dataText = [];
  for (i=0;i<data.length;i++){
    dataText.push(data[i].innerText);
  }

// REFORMATTING DATES AND TIMES
  for (i = 0; i < dataText.length; i++) {
    var days =["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
    for (var j = 0; j < days.length; j++) {
// HANDLING THE WORKING DATES
      if (dataText[i].startsWith(days[j]) === true) {
        dataText.splice(i,1,dataText[i].substr(4)); // SLICING DOWN THE UNIMPORTANT WORDS (DAY SHORTENINGS)
        var dager = dataText[i].substr(0,2); // GETTING THE DAY OF THE MONTH
        var mnd = dataText[i].substr(3,2); // GETTING THE MONTH OF THE YEAR
        var aar = dataText[i].substr(6,2); // GETTING THE YEAR
        dataText[i] = mnd + "/" + dager + "/" + "20" + aar; //NEW DATEFORMAT (FROM dd.MM.yy TO MM/dd/yyyy)
      }
    }

// HANDLING THE WORKING HOURS
    if (dataText[i].substr(6,1) == "-") {
      dataText[i] = dataText[i].substr(0, dataText[i].length - 1); // SLICE DOWN THE LAST CHARACTER ( ⤶ )
      dataText[i] = dataText[i].replace(/\./g,":"); //NEW TIMEFORMAT (FROM HH.mm TO HH:mm )
    }
  }

//console.log(dataText); // CHECK THE THE DATA GATHERED SO FAR

//SEPARATING WORKING DATES
  var date = [];
  function selectDate(toArray){
    for (var i = 0; i < dataText.length - 7; i++) {
      if (dataText[i+7].length == 13) {
        toArray[i] = dataText[i-1];
      }
      else {
        toArray[i] = "";
      }
    }
  }
  selectDate(date);

//SEPARATING WORKING HOURS
  var time = [];
  function selectTime(toArray){
    for (var i = 0; i < dataText.length; i++) {
      if (dataText[i].length == 13) {
        for (var j = 0; j < dataText.length; j++) {
          toArray[i-7] = dataText[i];
        }
      }
      else {
        toArray[i] = "";
      }
    }
  }
  selectTime(time);
    // SEPARATING START FROM END TIME
  var startTime = time.map((s) => s.substr(0, 5));
  var endTime = time.map((s) => s.substr(8));

// GATHERING ALL THE REFORMATTED DATA INTO THE CSV MULTIDIMENSIONAL-ARRAY
  var csv = [[ "Subject","Start Date","Start Time","End Date","End Time","Location"],]; // HEADER FOR THE CSV FILE
  for (i = 0; i < dataText.length; i++) {
    // EVENT EXAMPLE:
      // Event title: Work (Balázs Orbán)
      // Start Date: 2016.07.12
      // Start Time: 08:00
      // End Date: 2016.07.12
      // End Time: 16:00
      // Location: Trondheim 7030
    csv.splice(i+1,0,["Work (" + employer + ")",date[i], startTime[i],date[i],endTime[i],workLocation]);
  }

// REMOVING EMPTY LINES
  var exportIt = [];
  for (i = 0; i < csv.length; i++) {
    if (csv[i][1] !== "" && typeof csv[i][1] !== 'undefined')  {
      exportIt.push(csv[i]);
    }
  }
console.log(exportIt.join("\n")); // LAST CHECK BEFORE EXPORTING

// PARSING INTO CSV FORMAT
  var csvContent = "data:text/csv;charset=utf-8,";
  exportIt.forEach(function(infoArray, index){
    dataString = infoArray.join(",");
    csvContent += index < exportIt.length ? dataString+ "\n" : dataString;
  });

// DOWNLOAD AS uloba.csv ON BUTTON CLICK
  var encodedUri = encodeURI(csvContent);
  button.setAttribute("href", encodedUri);
  button.setAttribute("download", "uloba.csv");
} // --------------------------------------END OF MAIN FUNCTION-------------------------------------- //

// --------------------------------------INSERTING A BUTTON TO THE PAGE TO RUN THE MAIN FUNCTION-------------------------------------- //
document.getElementsByTagName('h2')[1].innerHTML += "<a id='gcal' class='btn btn-primary' href='#'>Export as .csv (e.g. Google Calendar)</a>";
var button = document.getElementById("gcal");
button.style.float = "right";
if (button) {
    button.addEventListener ("click", main , false);
}

// THANKS FOR USING MY CODE
console.log("Thank you for running my code. If you have any questions, mail me: info@balazsorban.com ");
