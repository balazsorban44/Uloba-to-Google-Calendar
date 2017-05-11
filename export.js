// ==UserScript==
// @name         Uloba Arbeidsplan to Google Calendar
// @namespace    http://balazsorban.com/
// @version      2.0
// @description  Uloba CSV export
// @author       Balázs Orbán (info@balazsorban.com)
// @match        https://arbeidsplan.uloba.no/Home/PersonIndexPrint*
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @grant        none
// ==/UserScript==

/* jshint ignore:start */
var inline_src = (<><![CDATA[
/* jshint ignore:end */
    /* jshint esnext: false */
    /* jshint esversion: 6 */

// --------------------------------------MAIN FUNCTION-------------------------------------- //

const init = () => {
  // Fetch raw data
  let raw = [];
  document.querySelectorAll('table').forEach((e) => {
      if (e.querySelector("tbody th") !== null){
        raw.push(e);
      }
  });

  // Function to extract events from a week of data.
  const extractWeek = (element) => {
    let weekEvents = {
          "dates":[],
          "from": [],
          "to": []
        };
    const weekDays = element.querySelectorAll("thead th"),
          workingHours = element.querySelectorAll("tbody td");

    for (let i = 0; i < workingHours.length; i++) {
      if (workingHours[i].innerText.includes(".")) {
        const hours = workingHours[i].innerText,
          date = weekDays[i+1].innerText.split(" ")[1],
          year = date.substring(6),
          month = date.substring(3,5),
          day = date.substring(0,2);
        let fromHour = hours.split(" - ")[0],
            toHour = hours.split(" - ")[1];
        fromHour = `${fromHour.substring(0,2)}:${fromHour.substring(3,5)}`;
        toHour = `${toHour.substring(0,2)}:${toHour.substring(3,5)}`;

        weekEvents.dates.push(`${month}/${day}/20${year}`);
        weekEvents.from.push(fromHour);
        weekEvents.to.push(toHour);
      }
    }
    return weekEvents;
  };

  let events = "";
  const eventTitle = window.prompt("Please give a title to the events. (Default: 'Work')", "Work"),
        eventLocation = window.prompt("The location of your workplace. (Default: empty)");

  for (let i = 0; i < raw.length; i++) {
    const week = extractWeek(raw[i]);
    for (let j = 0; j < week.dates.length; j++) {
      events += `"${eventTitle}","${week.dates[j]}","${week.from[j]}","${week.dates[j]}","${week.to[j]}","${eventLocation}"\n`;
    }
  }

  const parseCSV = (data) => {
    let csv = [ `data:text/csv;charset=utf-8,"Subject","Start Date","Start Time","End Date","End Time","Location"`]; // HEADER FOR THE CSV FILE
    csv.push(data); // Merge CSV with events
    csv = csv.join("\n"); // Final formatting of CSV.
    return csv;
  };

  // DOWNLOAD AS uloba.csv ON BUTTON CLICK
  button.setAttribute("href", encodeURI(parseCSV(events)));
  button.setAttribute("download", "uloba.csv");
};

// --------------------------------------INSERTING A BUTTON TO THE PAGE TO RUN THE MAIN FUNCTION-------------------------------------- //
document.getElementsByTagName('h2')[1].innerHTML += "<a id='gcal' class='btn btn-primary' href='' style='float:right'>Export as .csv (e.g. Google Calendar)</a>";
let button = document.getElementById("gcal");
button.addEventListener("click", init , false);


// THANKS FOR USING MY CODE
console.log("If you have any questions, mail me: info@balazsorban.com ");
console.log("http://balazsorban.com");

/* jshint ignore:start */
]]></>).toString();
var c = Babel.transform(inline_src, { presets: [ "es2015", "es2016" ] });
eval(c.code);
/* jshint ignore:end */
