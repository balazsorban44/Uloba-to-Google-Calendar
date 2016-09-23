// ==UserScript==
// @name         Uloba Arbeidsplan to Google Calendar
// @namespace    http://balazsorban.com/
// @version      0.1
// @description  Uloba CSV export
// @author       Balázs Orbán (info@balazsorban.com)
// @match        https://arbeidsplan.uloba.no/Home/PersonIndexPrint*
// @grant        none
// ==/UserScript==



function exportGcal(){
    var workLocation = window.prompt("Location(optional)(DO NOT USE COMMA!)");
    var employer;
    var e = document.querySelectorAll('th, td');
    for (var i = 0; i < e.length; i++) {
        if (e[i].className == "assistantNameHeader" && e[i].innerText.length > 0 ){
              employer = e[i+8].innerText;
            e[i].remove();
        }
    }
    var data = document.querySelectorAll('th,td');
    var dataText = [];
    for (i=0;i<data.length;i++){
        dataText.push(data[i].innerText);
    }
    var days =["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
    for (i = 0; i < dataText.length; i++) {
        for (var j = 0; j < days.length; j++) {
            if (dataText[i].startsWith(days[j]) === true) {
                dataText.splice(i,1,dataText[i].substr(4));
                var dager = dataText[i].substr(0,2);
                var mnd = dataText[i].substr(3,2);
                var aar = dataText[i].substr(6,2);
                dataText[i] = mnd + "/" + dager + "/" + "20" + aar;
            }
        }
        if (dataText[i].substr(6,1) == "-") {
            dataText[i] = dataText[i].substr(0, dataText[i].length - 1);
            dataText[i] = dataText[i].replace(/\./g,":");
        }
    }
    //console.log(dataText);

    function listToMatrix(list, elementsPerSubArray) {
        var matrix = [], i, k;

        for (i = 0, k = -1; i < list.length; i++) {
            if (i % elementsPerSubArray === 0) {
                k++;
                matrix[k] = [];
            }

            matrix[k].push(list[i]);
        }

        return matrix;
    }

    //GET THE DATES WHEN WORKING
    var date = [];
    function selectDate(toArray){
        for (var i = 1; i < dataText.length - 6; i++) {
            if (dataText[i+6].length == 13) {
                toArray[i] = dataText[i-1];
            }
            else {
                toArray[i] = "";
            }
        }
    }
    selectDate(date);

    //GET THE DATES WHEN WORKING
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
    var startTime = time.map((s) => s.substr(0, 5));
    var endTime = time.map((s) => s.substr(8));




    var csv = [[ "Subject","Start Date","Start Time","End Date","End Time","Location"],];
    for (i = 0; i < dataText.length; i++) {
        csv.splice(i+1,0,["Work (" + employer + ")",date[i], startTime[i],date[i],endTime[i],workLocation]);
    }
    var exportIt = [];
    for (i = 0; i < csv.length; i++) {
        if (csv[i][1] !== "" && typeof csv[i][1] !== 'undefined')  {
            exportIt.push(csv[i]);
        }
    }

    console.log(exportIt.join("\n"));
    //console.log(employer);

    var csvContent = "data:text/csv;charset=utf-8,";
    exportIt.forEach(function(infoArray, index){

        dataString = infoArray.join(",");
        csvContent += index < exportIt.length ? dataString+ "\n" : dataString;

    });
    var encodedUri = encodeURI(csvContent);
    button.setAttribute("href", encodedUri);
    button.setAttribute("download", "uloba.csv");
}

document.getElementsByTagName('body')[0].innerHTML += "<a id='gcal' href='#'>Export to Google Calendar</a>";
var button = document.getElementById("gcal");
button.style.position ="fixed";
button.style.right = "50px";
button.style.top = "50px";
button.style.backgroundColor = "darkblue";
button.style.padding = "10px";
button.style.color = "white";
if (button) {
    button.addEventListener ("click", exportGcal , false);
}
