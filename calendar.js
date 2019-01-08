var today = new Date();
var currentMonth = today.getMonth();
var currentYear = today.getFullYear();
var months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
var months2 = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

drawCalendar(currentMonth, currentYear);

/* navigation */
function next() {
	if (currentMonth == 11){
		currentYear++;
		currentMonth = 0;
	} else {
		currentMonth++;
	}
    drawCalendar(currentMonth, currentYear);
}

function prev() {
	if (currentMonth == 0){
		currentYear--;
		currentMonth = 11;
	} else {
		currentMonth--;
	}
    drawCalendar(currentMonth, currentYear);
}

function goToToday() {
    drawCalendar(today.getMonth(), today.getFullYear());
}

function goToDate(date){
	drawCalendar(date.getMonth(), date.getFullYear());
}

function drawCalendar(month, year) {	
	currentMonth = month;
	currentYear = year;
	
	var monthAndYear = document.getElementById("monthAndYear");
	
	let list = localStorage["eventList"] != undefined ? JSON.parse(localStorage["eventList"]) : [];
	
    var firstDay = (new Date(year, month)).getDay();
    var daysInMonth = 32 - new Date(year, month, 32).getDate();

    var tbl = document.getElementById("calendar-table");

    tbl.innerHTML = "";
	
    monthAndYear.innerHTML = months2[month] + " " + year;
	
    var date = 1;
	var lastRow = false;
    for (var i = 0; i < 6; i++) {
		if (lastRow){break;}
        var row = document.createElement("tr");

        for (var j = 0; j < 7; j++) {
			var cell = document.createElement("td");
			
            if (i === 0 && j < firstDay) {
                
                var cellText = document.createTextNode("");
                cell.appendChild(cellText);
                row.appendChild(cell);
            } else if (date > daysInMonth) {
				var cellText = document.createTextNode("");
                cell.appendChild(cellText);
                row.appendChild(cell);
				lastRow = true;
            } else {
                var cell = document.createElement("td");
				let currentDate = new Date(year, month, date);
				let cellTextValue = date;
				
                var cellText = document.createTextNode(cellTextValue);
				let lineEnd = document.createElement("h4");
				cell.dataset["date"] = cellTextValue;
                if (checkIfToday(currentDate)) {
                    cell.className += " today";
					cell.dataset["date"] = date;
                }
				lineEnd.appendChild(cellText);
				cell.appendChild(lineEnd);
				for (let i = 0; i < list.length; i++){					
					if (compareTwoDates(new Date(list[i]["date"]), currentDate)){
						let spanElement = document.createElement("span");
						spanElement.dataset["id"] = list[i]["id"];
						let spanText = document.createTextNode(list[i]["name"] + " (" + list[i]["persons"] + ")");
						spanElement.appendChild(spanText);
						var brElement = document.createElement("br");
						spanElement.appendChild(brElement);
						spanElement.addEventListener("click", displayModal);
						cell.appendChild(spanElement);
						cell.className += " event";
					}					
				}                
				
                row.appendChild(cell);				
				cell.addEventListener("click", displayModal);
                date++;
            }
        }

        tbl.appendChild(row);
    }
}

/* modal window */
var modal = document.getElementById('myModal');
var span = document.getElementsByClassName("close")[0];

span.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

function displayModal(e) {	
	let eventInstance;
	let dateString;
	let id = e.currentTarget.dataset["id"] !== undefined ? parseInt(e.currentTarget.dataset["id"]) : undefined;
	let newEvent = e.currentTarget.dataset["id"] === undefined;
	
	if (!newEvent){
		e.stopPropagation();
		let list = localStorage["eventList"] != undefined ? JSON.parse(localStorage["eventList"]) : [];
		eventInstance = list.find(x => x.id === id);
		let eventDate = new Date(eventInstance["date"]);
		dateString = eventDate.getDate() + " " + months[eventDate.getMonth()] + " " + eventDate.getFullYear();
		document.getElementById("eventDate").dataset["date"] = eventInstance["date"];
	} else {
		let dateValue = e.currentTarget.dataset["date"];
		dateString = dateValue + " " + months[currentMonth] + " " + currentYear;
		document.getElementById("eventDate").dataset["date"] = new Date(currentYear, currentMonth, dateValue);
	}
	
	document.getElementById("eventName").value = newEvent ? "" : eventInstance["name"];
	document.getElementById("eventDescription").value = newEvent ? "" : eventInstance["description"];
	document.getElementById("eventPersons").value = newEvent ? "" : eventInstance["persons"];
		
	let textNode = document.createTextNode(dateString);	
	document.getElementById("dateString").innerHTML = "";
	document.getElementById("dateString").append(textNode);
	
	if (id !== undefined){
		document.getElementById("deleteEvent").dataset["id"] = id;	
		document.getElementById("saveEvent").dataset["id"] = id;
		document.getElementById("deleteEvent").style.display = "inline";
	} else {
		document.getElementById("deleteEvent").style.display = "none";
	}
	
	modal.style.display = "block";
}

document.getElementById("saveEvent").addEventListener("click", function(e){
	let newId;
	let list = localStorage["eventList"] != undefined ? JSON.parse(localStorage["eventList"]) : [];
	let eventDate = new Date(document.getElementById("eventDate").dataset["date"]);
	
	if (e.currentTarget.dataset["id"] !== undefined){
		newId = parseInt(e.currentTarget.dataset["id"]);
		
		list[list.indexOf(list.find(x => parseInt(x["id"]) === newId))] = {
			name: document.getElementById("eventName").value,
			description: document.getElementById("eventDescription").value,
			persons: document.getElementById("eventPersons").value,
			date: document.getElementById("eventDate").dataset["date"],
			id: newId
		};
	} else {
		newId = 0;
		var maxobj;
		

		list.map(function(obj){     
			if (obj.id > newId) maxobj = obj;    
		});
		newId = maxobj !== undefined ? maxobj["id"] + 1 : 1;
		
		let eventElement = {
			name: document.getElementById("eventName").value,
			description: document.getElementById("eventDescription").value,
			persons: document.getElementById("eventPersons").value,
			date: eventDate,
			id: newId
		};
		list.push(eventElement);
	}
	
	localStorage["eventList"] = JSON.stringify(list);
	modal.style.display = "none";
	goToDate(eventDate);
});

document.getElementById("deleteEvent").addEventListener("click", function(e){
	var id = e.currentTarget.dataset["id"];
	let list = JSON.parse(localStorage["eventList"]);
	var filtered = list.filter(function(value, index, arr){
		return parseInt(value["id"]) != id;
	});
	
	localStorage["eventList"] = JSON.stringify(filtered);
	modal.style.display = "none";
	drawCalendar(currentMonth, currentYear);
});

/* autocomplete */
function popupClearAndHide() {
	autocomplete.value = "";
	autocomplete_result.innerHTML = "";
	autocomplete_result.style.display = "none";
}

function updPopup() {
	var db = localStorage["eventList"] != undefined ? JSON.parse(localStorage["eventList"]) : [];

	if(!autocomplete.value) {
		popupClearAndHide();
		return;
	}
	
	let c = false;
	let b = document.createDocumentFragment();

	for(let i = 0; i < db.length; i++) {		
		if(db[i]["name"].toLowerCase().indexOf(autocomplete.value.toLowerCase()) !== -1) {
			c = true;
			let d = document.createElement("div");
			let eventDate = new Date(db[i]["date"]);
			
			let spanElement = document.createElement("span");			
			let textElement = document.createTextNode(db[i]["name"]);			
			let lineEnd = document.createElement("br");
			
			spanElement.appendChild(textElement);
			spanElement.className += " event-name";
			d.appendChild(spanElement);
			d.appendChild(lineEnd);
			
			spanElement = document.createElement("span");
			textElement = document.createTextNode(formatDate(eventDate));
						
			spanElement.appendChild(textElement);		
			d.appendChild(spanElement);
			d.dataset["id"] = db[i]["id"];

			d.addEventListener("click", function(e){
				popupClearAndHide();
				goToDate(eventDate);
				displayModal(e);
			});
			b.appendChild(d);
		}
	}
	
	if(c == true) {
		autocomplete_result.innerHTML = "";
		autocomplete_result.style.display = "block";
		autocomplete_result.appendChild(b);
		return;
	}
	
	if (autocomplete.value.length == 0){
		popupClearAndHide();
	}
}

autocomplete.addEventListener("keyup", updPopup);

/* helpers */
function formatDate(date) {
  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();
  return day + ' ' + months[monthIndex] + ' ' + year;
}

function compareTwoDates(d, td) {
    return td.getDate() == d.getDate() && td.getMonth() == d.getMonth() && td.getFullYear() == d.getFullYear();
}

function checkIfToday(td) {
    var d = new Date();
    return compareTwoDates(d, td);
}