


const URI_plugin_user_get_own_yellownotes = "/api/v1.0/plugin_user_get_own_yellownotes";
const URI_plugin_user_delete_yellownote = "/api/v1.0/plugin_user_delete_yellownote";
const URI_plugin_user_set_note_active_status = "/api/v1.0/plugin_user_setstatus_yellownote";

const URI_plugin_user_get_abstracts_of_all_yellownotes = "/api/plugin_user_get_abstracts_of_all_yellownotes";

// Function to use "fetch" to delete a data row
async function deleteDataRow(noteid) {
    try {

        const userid = "";
        console.log("deleting: " + noteid);
        const message_body = '{ "noteid":"' + noteid + '" }';
        //console.log(message_body);
        const installationUniqueId = (await chrome.storage.local.get([plugin_uuid_header_name]))[plugin_uuid_header_name];

        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);

        console.log(installationUniqueId);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(server_url + URI_plugin_user_delete_yellownote, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
                    [plugin_session_header_name]: session[plugin_session_header_name],
                },
                body: message_body // example IDs, replace as necessary
            });
        console.log(response);
        // Check for errors
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse JSON data
        const data = await response.json();

    } catch (error) {
        console.error(error);
    }
}

/**
 * Navigate to the page where the note is attached
 * @param {*} url
 */
async function goThere(datarow) {
    try {

        const userid = "";
        console.log("go to url: " + datarow.url);
        
        console.log("go lookup creatorid: " + datarow.creatorid);
const noteid = datarow.noteid;

console.log("go lookup noteid: " + noteid);

console.log(document.querySelector('tr[noteid="' + noteid + '"]'));

const url = document.querySelector('tr[noteid="' + noteid + '"]').querySelector('[name="url"]').textContent.trim(); 
console.log(document.querySelector('tr[noteid="' + noteid + '"]').querySelector('[name="url"]').textContent.trim() );



        // lookup the target url in the table (the user may have changed it !)




        // issue a http redirect to open the URL in another browser tab
        //window.open(url, '_blank').focus();
        // add functionality to scroll to the note in question
        // invoke the background script to scroll to the note in question
        chrome.runtime.sendMessage({
            message: {
                action: "scroll_to_note",
                scroll_to_note_details: {
                    datarow: datarow,
                    url: url

                }
            }
        }, function (response) {
            console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
            // finally, call "close" on the note
            //  try{
            //  	close_note(event);
            //  }catch(g){console.debug(g);}

        });

    } catch (error) {
        console.error(error);
    }
}

/**
 * Open the note for editing
 * @param {*} noteid
 */

async function editNote(noteid) {
    try {

        const userid = "";
        console.log("deleting: " + noteid);
        const message_body = '{ "noteid":"' + noteid + '" }';
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);

        //console.log(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(server_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
                    [plugin_session_header_name]: session[plugin_session_header_name]
                },
                body: message_body // example IDs, replace as necessary
            });
        //console.log(response);
        // Check for errors
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse JSON data
        const data = await response.json();

    } catch (error) {
        console.error(error);
    }
}

// Function to fetch data and populate the table
function fetchData() {
    console.debug("fetchData");
    try {

        return new Promise(
            function (resolve, reject) {

            // const installationUniqueId = (await chrome.storage.local.get([plugin_uuid_header_name]))[plugin_uuid_header_name];

            console.log(installationUniqueId);
            //  let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
            //  let session = await chrome.storage.local.get([plugin_session_header_name]);
            var ynInstallationUniqueId;
            var xYellownotesSession;
            chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name])
            .then(function (ins) {
                console.log(ins);
                ynInstallationUniqueId = ins[plugin_uuid_header_name];
                xYellownotesSession = ins[plugin_session_header_name];
                console.log(ynInstallationUniqueId);
                console.log(xYellownotesSession);
                //ynInstallationUniqueId = "dummy";

                // Fetch data from web service (replace with your actual API endpoint)
                return fetch(server_url + URI_plugin_user_get_own_yellownotes, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        [plugin_uuid_header_name]: ynInstallationUniqueId,
                        [plugin_session_header_name]: xYellownotesSession
                    },
                    body: JSON.stringify({}) // example IDs, replace as necessary
                });
            });
            // Check for errors
            //  if (!response.ok) {
            //      throw new Error(`HTTP error! status: ${response.status}`);
            //  }


            //resolve('Data saved OK');

        });

    } catch (error) {
        console.error(error);
    }
}

// Locate all elements with the class "my-button"
const buttons = document.querySelectorAll('.sortableCol');
len = buttons.length;
for (var i = 0; i < buttons.length; i++) {
    //work with checkboxes[i]
    console.log(buttons[i]);
    // set column index number for each column
    buttons[i].setAttribute("colindex", i);
    buttons[i].addEventListener('click', function (event) {
        sortTa();
    }, false);
}

// Locate all cells that are used for filtering of search results
const f_cells = document.getElementById("dataTable").querySelectorAll("thead tr:nth-child(2) th");
console.log(f_cells);
len = f_cells.length;
for (var i = 0; i < f_cells.length; i++) {
    //work with regexp in cell
    console.log(f_cells[i]);
    // set column index number for each column
    f_cells[i].setAttribute("colindex", i);
    f_cells[i].addEventListener('input', function (event) {
        filterTableAllCols();
    }, false);
}

// Sort states for each column
const sortStates = {
    0: 'none', // None -> Ascending -> Descending -> None -> ...
    1: 'none'
};

function sortTa() {
    console.log("sortTa");
    console.log(event.target);
    sortTable("dataTable", event.target.getAttribute("colindex"));
}

function timestampstring2timestamp(str) {
    console.log("timestampstring2timestamp: " + str);
    try {
        const year = str.substring(0, 4);
        const month = str.substring(5, 7);
        const day = str.substring(8, 10);
        const hour = str.substring(11, 13);
        const minute = str.substring(14, 16);
        const second = str.substring(17, 19);
        //    var timestamp = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second + "";
        var timestamp = year + "-" + month + "-" + day + " " + hour + ":" + minute;
        console.log("timestamp: " + timestamp);

        return timestamp;
    } catch (e) {
        console.log(e);
        return null;
    }
}

function integerstring2timestamp(int) {
    console.log("integerstring2timestamp: " + int);
    try {
        const year = int.substring(0, 4);
        const month = int.substring(5, 6);
        const day = int.substring(8, 9);
        const hour = int.substring(8, 9);
        const minute = int.substring(10, 11);
        const second = int.substring(12, 13);

        var timestamp = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
        console.log("timestamp: " + timestamp);

        return timestamp;
    } catch (e) {
        console.log(e);
        return null;
    }
}

// Function to sort the table
function sortTable(table_id, columnIndex) {
    console.log("sortable: " + columnIndex)
    const table = document.getElementById(table_id);

    let rows = Array.from(table.rows).slice(1); // Ignore the header
    let sortedRows;

    // Toggle sort state for the column
    if (sortStates[columnIndex] === 'none' || sortStates[columnIndex] === 'desc') {
        sortStates[columnIndex] = 'asc';
    } else {
        sortStates[columnIndex] = 'desc';
    }
    console.log(sortStates[columnIndex]);

    // Sort based on the selected column and sort state
    // Consider options for different types of sorting here.
    if (columnIndex === 0) {
        sortedRows = rows.sort((a, b) => {
                return Number(a.cells[columnIndex].innerText) - Number(b.cells[columnIndex].innerText);
            });
    } else {
        sortedRows = rows.sort((a, b) => a.cells[columnIndex].innerText.localeCompare(b.cells[columnIndex].innerText));
    }
    console.log(sortStates[columnIndex]);
    if (sortStates[columnIndex] === 'desc') {
        sortedRows.reverse();
    }

    console.log(sortedRows);
    // Remove existing rows
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // Append sorted rows
    const tbody = table.getElementsByTagName('tbody')[0];
    sortedRows.forEach(row => tbody.appendChild(row));
}

/*
apply all filters simmultaneously

TO DO. add a swith where the user can chose between whilecard and regexp filters (wildcard default)
and chose to have the filters to be caseinsensitive or not (caseinsensitive default) or not (casesensitive default)
 */
function filterTableAllCols() {
    console.log("filterTableAllCols");
    var table = document.getElementById("dataTable");
    var filtersCols = table.querySelectorAll("thead > tr:nth-child(2) > th > input, select");
    var rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");

    //console.debug(filtersCols);

    // Loop through each row of the table
    for (var i = 0; i < rows.length; i++) {
        ///  for (var i = 0; i < 1; i++) {
        var showRow = true;
        // console.debug(rows[i]);
        // check each cell against the corresponding filter for the column, if any
        for (var j = 0; j < filtersCols.length; j++) {
            //console.log(j + " ##########");
            //            console.log(j);
            //console.log(filtersCols[j]);
            //console.log(filtersCols[j].value);
            //console.debug(filtersCols[j].tagName);
            //console.debug(filtersCols[j].tagName == "SELECT");
            //console.debug(filtersCols[j].getAttribute("filtertype") == "checkedmatch");
            //console.debug(filtersCols[j].tagName == "SELECT" && filtersCols[j].getAttribute("filtertype") == "checkedmatch");
            //console.log(j + ": " + filtersCols[j].parentNode.getAttribute("colindex"));

            if (filtersCols[j].tagName == "SELECT" && filtersCols[j].getAttribute("filtertype") == "checkedmatch") {
                // filter on whether or not a checkbox has been checked
                var comparingCol = filtersCols[j].parentNode.getAttribute("colindex");
                //console.log("filter on col: " + comparingCol)
                var cell = rows[i].getElementsByTagName("td")[comparingCol];
                //console.log(cell);
                if (cell) {
                    //console.log(cell.querySelector('input[type="checkbox"]'));
                    var isChecked = cell.querySelector('input[type="checkbox"]').checked;
                    //console.log("isChecked: " + isChecked);
                    var filterValue = filtersCols[j].value;
                    //console.log("filterValue: " + filterValue + " isChecked: " + isChecked);
                    if (filterValue === "active" && !isChecked ||
                        filterValue === "inactive" && isChecked) {
                        showRow = false;
                        break; // Exit the loop if any filter condition fails, there is no need to check the remaining filters for this row
                    }
                }
            } else if (filtersCols[j].value && filtersCols[j].getAttribute("filtertype") == "selectmatch") {
                console.log("selectmatch");
                // filter on whether or not a checkbox has been checked
                var comparingCol = filtersCols[j].parentNode.getAttribute("colindex");
                console.log("filter on col: " + comparingCol)
                var cell = rows[i].getElementsByTagName("td")[comparingCol];
                console.log(cell);
                if (cell) {
                    console.log(cell.getElementsByTagName("select"));

                    var selectElement = cell.getElementsByTagName("select")[0];
                    var selectedText = selectElement.options[selectElement.selectedIndex].text;

                    // Log the selected text to the console or return it from the function
                    console.log('Currently selected text:', selectedText);

                    console.log(cell.getElementsByTagName("select")[0].value);
                    //var isChecked = cell.querySelector('input[type="checkbox"]').checked;
                    //console.log("isChecked: " + isChecked);
                    var filterValue = filtersCols[j].value;
                    console.log("filterValue: " + filterValue + " selectedText: " + selectedText);

                    var regex = new RegExp(escapeRegex(filterValue), "i");
                    //console.log("is cell content " + cell.textContent.trim() + ' matching regex: ' + regex);
                    // Test the regex against the cell content
                    if (!regex.test(selectedText.trim())) {
                        showRow = false;
                        break; // Exit the loop if any filter condition fails, there is no need to check the remaining filters for this row
                    }
                }

            } else {

                try {
                    if (filtersCols[j].value) { // Only process filters with a value
                        var comparingCol = filtersCols[j].parentNode.getAttribute("colindex");
                        //console.log("filter on col: " + comparingCol)
                        var cell = rows[i].getElementsByTagName("td")[comparingCol];
                        if (cell) {
                            var filterValue = filtersCols[j].value;
                            var regex = new RegExp(escapeRegex(filterValue), "i");
                            //console.log("is cell content " + cell.textContent.trim() + ' matching regex: ' + regex);
                            // Test the regex against the cell content
                            if (!regex.test(cell.textContent.trim())) {
                                showRow = false;
                                break; // Exit the loop if any filter condition fails, there is no need to check the remaining filters for this row
                            }
                        }

                    }
                } catch (e) {
                    console.log(e);
                }

            }
        }
        // Show or hide the row based on the filter results
        rows[i].style.display = showRow ? "" : "none";
    }
}

function escapeRegex(text) {
    // Escapes the regular expression special characters in text except for '*' and '?'
    // '*' is converted to '.*' and '?' to '.'
    return text.replace(/[-[\]{}()+.,\\^$|#\s]/g, "\\$&")
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
}

// Fetch data on page load


function render() {
    console.log("render");

    return new Promise(
        function (resolve, reject) {
        var ynInstallationUniqueId = "";
        var xYellownotesSession = "";
        var distributionlists;
        var data;
        //const installationUniqueId = (await chrome.storage.local.get([plugin_uuid_header_name]))[plugin_uuid_header_name];


        chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name]).then(function (result) {
            console.log(result);
            console.log(ynInstallationUniqueId);
            ynInstallationUniqueId = result[plugin_uuid_header_name];
            xYellownotesSession = result[plugin_session_header_name];
            console.log(ynInstallationUniqueId);
            console.log(xYellownotesSession);
            return fetch(server_url + URI_plugin_user_get_own_yellownotes, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [plugin_uuid_header_name]: ynInstallationUniqueId,
                    [plugin_session_header_name]: xYellownotesSession,
                },
                body: JSON.stringify({}) // example IDs, replace as necessary, the body is used to retrieve the notes of other users, default is to retrieve the notes of the authenticated user
            });
        }).then(response => {
            if (!response.ok) {
                reject(new Error('Network response was not ok'));
            }
            return response.json();
        }).then(function (resp) {
            data = resp;

            return fetch(server_url + URI_plugin_user_get_own_distributionlists, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    [plugin_uuid_header_name]: ynInstallationUniqueId,
                    [plugin_session_header_name]: xYellownotesSession,
                },
            });
        }).then(response => {
            if (!response.ok) {
                reject(new Error('Network response was not ok'));
            }
            return response.json();
        }).then(function (dist) {
            distributionListData = dist;

            console.log(distributionListData);

            console.log(data);

            var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
            console.log(utc);
            console.log(Date.now());
            var now = new Date;
            var utc_timestamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
                    now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
            console.log(utc_timestamp);
            console.log(new Date().toISOString());

            // Get table body element
            const tableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];

            // Loop through data and populate the table
            data.forEach(row => {
                console.log(row);
                console.log(JSON.stringify(row));
                console.log(row.noteid);

               

                // Create new row
                const newRow = tableBody.insertRow();
                newRow.setAttribute('noteid', row.noteid);

                // Create cells and populate them with data
                const cell_noteid = newRow.insertCell(0);
                const cell_createtime = newRow.insertCell(1);
                const cell_lastmodified = newRow.insertCell(2);
                const type_cell = newRow.insertCell(3);
                const cell_status = newRow.insertCell(4);
                const cell_url = newRow.insertCell(5);
                const cell_payload = newRow.insertCell(6);
                const cell_actions = newRow.insertCell(7);
                const cell_distributionlist = newRow.insertCell(8);
                const obj = JSON.parse(row.json);
                // key column - not to be displayed
                cell_noteid.textContent = row.noteid;
                // create timestamp - not to be dsiplayed either
                try {
                    console.log(row.createtime);
                    console.log(/2024/.test(row.createtime));
                    if (/2024/.test(row.createtime)) {
                        console.log("createtime is timestamp: " + row.createtime);
                        //console.log("createtime: " + integerstring2timestamp(row.createtime));

                        cell_createtime.textContent = timestampstring2timestamp(row.createtime);
                    } else {

                        console.log("createtime is integer: " + row.createtime)
                        cell_createtime.textContent = integerstring2timestamp(row.createtime);

                    }

                } catch (e) {
                    console.log(e);
                }
                try {
                    console.log(row.lastmodifiedtime);
                    console.log(/2024/.test(row.lastmodifiedtime));
                    if (/2024/.test(row.lastmodifiedtime)) {
                        console.log("lastmodifiedtime is timestamp: " + row.lastmodifiedtime);
                        cell_lastmodified.textContent = timestampstring2timestamp(row.lastmodifiedtime);
                    } else {
                        console.log("lastmodifiedtime is integer: " + row.lastmodifiedtime)
                        cell_lastmodified.textContent = integerstring2timestamp(row.lastmodifiedtime);
                    }
                } catch (e) {
                    console.log(e);
                }

                try {
                    type_cell.textContent = obj.note_type;
                    type_cell.setAttribute('name', 'note_type');
                } catch (e) {
                    console.log(e);
                }

                // render a check box to enable/disable the note
                const suspendActButton = document.createElement("span");
                if (row.status == 1) {
                    // active
                    suspendActButton.innerHTML =
                        '<label><input type="checkbox" placeholder="Enter text" checked/><span></span></label>';
                } else {
                    // deactivated
                    suspendActButton.innerHTML =
                        '<label><input type="checkbox" placeholder="Enter text" /><span></span></label>';
                }

                // Add classes using classList with error handling
                const inputElement = suspendActButton.querySelector("input");
                if (inputElement) {
                    inputElement.classList.add("input-class");
                }

                const labelElement = suspendActButton.querySelector("label");
                if (labelElement) {
                    labelElement.classList.add("switch");
                }
                const spanElement = suspendActButton.querySelector("span");
                if (spanElement) {
                    spanElement.classList.add("slider");
                }
                suspendActButton.addEventListener("change", async(e) => {
                    if (e.target.checked) {
                        //         await disable_note_with_noteid(row.noteid);
                        await setNoteActiveStatusByUUID(row.noteid, 1);
                    } else {
                        await setNoteActiveStatusByUUID(row.noteid, 0);
                        //           await enable_note_with_noteid(row.noteid);
                    }
                });
                cell_status.appendChild(suspendActButton);

                // where note is attached
                //contenteditable="true"
                cell_url.textContent = obj.url;
                cell_url.setAttribute('contenteditable', 'true');
                cell_url.setAttribute('data-label', 'url');
                cell_url.setAttribute('name', 'url');

                // payload
                // contenteditable="true"
                if (obj.note_type == "yellownote") {
                    cell_payload.textContent = b64_to_utf8(obj.message_display_text);
                    cell_payload.setAttribute('name', 'message_display_text');
                } else if (obj.note_type == "webframe") {
                    cell_payload.textContent = (obj.content_url);
                    cell_payload.setAttribute('name', 'content_url');
                } else {
                    // default - will revisit this later (L.R.)
                    cell_payload.textContent = b64_to_utf8(obj.message_display_text);
                    cell_payload.setAttribute('name', 'message_display_text');
                }
                cell_payload.setAttribute('contenteditable', 'true');
                cell_payload.setAttribute('data-label', 'text');
                // create small table to contain the action buttons

                // Add button container
                const actionButtonContainer = document.createElement('div');
                actionButtonContainer.setAttribute('class', 'button-container');

                // Add delete button
                const deleteButtonContainer = document.createElement('div');
                deleteButtonContainer.setAttribute('class', 'delete_button');
                const deleteButton = document.createElement('img');
                deleteButton.src = "../icons/trash-can.transparent.40x40.png";
                deleteButton.alt = 'delete';
                deleteButton.setAttribute('class', 'delete_button');
                deleteButton.onclick = function () {
                    // Remove the row from the table
                    newRow.remove();
                    // call to API to delete row from data base
                    deleteDataRow(row.noteid);
                };
                deleteButtonContainer.appendChild(deleteButton);
                actionButtonContainer.appendChild(deleteButtonContainer);

                // Add save/edit button


                // Add save button
                const saveButtonContainer = document.createElement('div');
                saveButtonContainer.setAttribute('class', 'save_button');
                const saveButton = document.createElement('img');
                saveButton.src = "../icons/floppy-disk.svg";
                saveButton.alt = 'save';
                saveButton.setAttribute('class', 'save_button');
                saveButton.onclick = function (event) {

                    console.debug(event.target.parentNode);
                    console.debug(event.target.parentNode.parentNode);
                    console.debug(event.target.parentNode.parentNode.firstChild.textContent);

                    // call to API to save changes to data base
                    saveChanges(row.noteid, event);
                };
                saveButtonContainer.appendChild(saveButton);
                actionButtonContainer.appendChild(saveButtonContainer);

                // Add location "go there" button
                const goThereButtonContainer = document.createElement('div');
                goThereButtonContainer.setAttribute('class', 'go_to_location_button');
                const goThereButton = document.createElement('img');
                goThereButton.src = "../icons/goto.icon.transparent.40x40.png";
                goThereButton.alt = 'go there';
                goThereButton.setAttribute('class', 'go_to_location_button');
                goThereButton.onclick = function () {
                    // call to API to delete row from data base
                    goThere(row);
                };
                goThereButtonContainer.appendChild(goThereButton);
                actionButtonContainer.appendChild(goThereButtonContainer);

                // add enable/disable button
                const ableButton = document.createElement('button');

                if (row.status == "1" || row.status == 1) {
                    ableButton.setAttribute('name', 'disable');
                    ableButton.textContent = 'disable';
                    ableButton.onclick = function () {
                        // call to API to delete row from data base
                        disable_note_with_noteid(obj.noteid);
                    };
                } else {
                    ableButton.setAttribute('name', 'enable');
                    ableButton.textContent = 'enable';
                    ableButton.onclick = function () {
                        // call to API to delete row from data base
                        enable_note_with_noteid(obj.noteid);
                    };
                }

                cell_actions.appendChild(actionButtonContainer);
                cell_actions.setAttribute('data-label', 'text');
                // create drop-down of feeds
                // Add location "go there" button
                const selectionList = document.createElement('select');
                //  selectionContainer.setAttribute('class', 'go_to_location_button');
                const option0 = document.createElement('option');
                option0.value = "";
                option0.textContent = "";
                selectionList.appendChild(option0);

                const option = document.createElement('option');
                option.value = row.distributionlistid;
                option.textContent = row.distributionlistname;
                selectionList.appendChild(option);

                // Create the dropdown list
                const dropdown = createDropdown(distributionListData, row.distributionlistid);
                console.log(dropdown);
                cell_distributionlist.appendChild(dropdown);

                // cell7.textContent = 'yellownote=%7B%22url%22%3A%22file%3A%2F%2F%2FC%3A%2Ftemp%2F2.html%22%2C%22uuid%22%3A%22%22%2C%22message_display_text%22%3A%22something%22%2C%22selection_text%22%3A%22b71-4b02-87ee%22%2C%22posx%22%3A%22%22%2C%22posy%22%3A%22%22%2C%22box_width%22%3A%22250%22%2C%22box_height%22%3A%22250%22%7D=yellownote';
                //cell7.setAttribute('style', 'height: 250px; width: 350px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;');

                // Adding data-label for mobile responsive
                cell_createtime.setAttribute('data-label', 'createtime');
                cell_createtime.setAttribute('class', 'timestamp');
                cell_lastmodified.setAttribute('data-label', 'lastmodfiedtime');
                cell_lastmodified.setAttribute('class', 'timestamp');

            });
            resolve('Data saved OK');
        });
    });
}

function createDropdown(optionsArray, selectedDistributionListId) {
    // Create a select element
    const selectElement = document.createElement('select');

    // Add a blank option as the first option
    const blankOption = document.createElement('option');
    blankOption.value = '';
    selectElement.appendChild(blankOption);

    // Loop through the array and create an option for each object
    optionsArray.forEach(item => {
        const option = document.createElement('option');
        option.textContent = item.name; // Set the display text
        option.value = item.distributionlistid; // Set the option value
        selectElement.appendChild(option);
    });

    // Set the selected option based on distributionListId argument
    selectElement.value = selectedDistributionListId && optionsArray.some(item => item.distributionlistid === selectedDistributionListId)
         ? selectedDistributionListId
         : '';

    // Add an event listener for the 'change' event
    selectElement.addEventListener('change', (event) => {
        const selectedId = event.target.value;
        console.debug(event.target.parentNode);
        console.debug(event.target.parentNode.parentNode);
        console.debug(event.target.parentNode.parentNode.firstChild.textContent);
        noteid = event.target.parentNode.parentNode.firstChild.textContent;

        // Only trigger fetch call if the selected value is not empty
        if (selectedId) {
            console.debug("update the note with this distrubtionlistid: " + selectedId);

            setNoteDistributionlistId(noteid, selectedId);

        }
    });

    return selectElement;
}

var valid_noteid_regexp = /^[a-zA-Z0-9\-\.\_]{20,100}$/;

// Function to use "fetch" to re-activate a data agreement
async function setNoteActiveStatusByUUID(noteid, status) {
    console.debug("setNoteActiveStatusByUUID: " + noteid + " status: " + status);
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const userid = "";
        const message_body = JSON.stringify({
                noteid: noteid,
                status: status,
            });
        //console.log(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_set_note_active_status, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
                    [plugin_session_header_name]: session[plugin_session_header_name],
                },
                body: message_body, // example IDs, replace as necessary
            });
        //console.log(response);
        // Check for errors
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // update the row in the table

        // Parse JSON data
        const data = await response.json();
    } catch (error) {
        console.error(error);
    }
}

/**
 * save changes to the notes attachment url and content text ( or URL incase of webframe)
 * @param {
 * } noteid
 */
async function saveChanges(noteid, event) {
    console.debug("saveChanges: " + noteid);
   
    console.debug(event.target.parentNode.parentNode.parentNode.parentNode);

   
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        var message_display_text;
        var content_url
        try {
            message_display_text = utf8_to_b64(event.target.parentNode.parentNode.parentNode.parentNode.querySelector('[name="message_display_text"]').textContent);
        } catch (e) {
            console.debug(e);
        }
        try {
            content_url = event.target.parentNode.parentNode.parentNode.parentNode.querySelector('[name="content_url"]').textContent;
        } catch (e) {
            console.debug(e);
        }
        const url = event.target.parentNode.parentNode.parentNode.parentNode.querySelector('[name="url"]').textContent;
        const note_type = event.target.parentNode.parentNode.parentNode.parentNode.querySelector('[name="note_type"]').textContent;

        var message_body;
        if (note_type == "webframe") {
            console.debug("webframe");
            message_body = JSON.stringify({
                    noteid: noteid,
                    note_type: note_type,
                    url: url,
                    content_url: content_url,
                });
        } else {
            message_body = JSON.stringify({
                    noteid: noteid,
                    note_type: note_type,
                    url: url,
                    message_display_text: message_display_text,
                });
        }

        //console.log(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_savechanges_yellownote, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
                    [plugin_session_header_name]: session[plugin_session_header_name],
                },
                body: message_body, // example IDs, replace as necessary
            });
        //console.log(response);
        // Check for errors
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // update the row in the table

        // Parse JSON data
        const data = await response.json();
    } catch (error) {
        console.error(error);
    }
}

async function setNoteDistributionlistId(noteid, distributionlistid) {
    console.debug("setNoteDistributionlistId: " + noteid + " distributionlistid: " + distributionlistid);
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const userid = "";
        const message_body = JSON.stringify({
                noteid: noteid,
                distributionlistid: distributionlistid,
            });
        //console.log(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_setdistributionlist_yellownote, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
                    [plugin_session_header_name]: session[plugin_session_header_name],
                },
                body: message_body, // example IDs, replace as necessary
            });
        //console.log(response);
        // Check for errors
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // update the row in the table

        // Parse JSON data
        const data = await response.json();
    } catch (error) {
        console.error(error);
    }
}

function disable_note_with_noteid(noteid) {
    console.debug("disable_note_with_noteid: " + noteid);

    console.debug(valid_noteid_regexp.test(noteid));
    if (valid_noteid_regexp.test(noteid)) {
        // send save request back to background
        chrome.runtime.sendMessage({
            message: {
                "action": "single_note_disable",
                "disable_details": {
                    "noteid": noteid,
                    "enabled": false
                }
            }
        }, function (response) {
            console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
            // finally, call "close" on the note
            //  try{
            //  	close_note(event);
            //  }catch(g){console.debug(g);}

        });

    }
}

function enable_note_with_noteid(noteid) {
    console.debug("enable_note_with_noteid: " + noteid);

    console.debug(valid_noteid_regexp.test(noteid));
    if (valid_noteid_regexp.test(noteid)) {
        // send save request back to background
        chrome.runtime.sendMessage({
            message: {
                "action": "single_note_enable",
                "enable_details": {
                    "noteid": noteid
                }
            }
        }, function (response) {
            console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
            // finally, call "close" on the note
            //  try{
            //  	close_note(event);
            //  }catch(g){console.debug(g);}

        });

    }
}

/*
 * recursively go down the DOM tree below the specified node
 *
 */
function replaceLink(node, note_template) {
    try {
        //  console.debug("# replaceLink");
        //console.debug(node);

        if (node) {

            // recursively call to analyse child nodes

            for (var i = 0; i < node.childNodes.length; i++) {
                //console.debug("call childnodes");
                try {
                    replaceLink(node.childNodes[i], note_template);
                } catch (f) {}
            }

            /*
             * Node.ELEMENT_NODE 	1 	An Element node like <p> or <div>.
            Node.ATTRIBUTE_NODE 	2 	An Attribute of an Element.
            Node.TEXT_NODE 	3 	The actual Text inside an Element or Attr.
            Node.CDATA_SECTION_NODE 	4 	A CDATASection, such as <!CDATA[[ … ]]>.
            Node.PROCESSING_INSTRUCTION_NODE 	7 	A ProcessingInstruction of an XML document, such as <?xml-stylesheet … ?>.
            Node.COMMENT_NODE 	8 	A Comment node, such as <!-- … -->.
            Node.DOCUMENT_NODE 	9 	A Document node.
            Node.DOCUMENT_TYPE_NODE 	10 	A DocumentType node, such as <!DOCTYPE html>.
            Node.DOCUMENT_FRAGMENT_NODE 	11 	A DocumentFragment node.
             *
             */

            if (node.nodeType == Node.ELEMENT_NODE || node.nodeType == Node.DOCUMENT_NODE) {
                // console.debug("1.0.1");

                // exclude elements with invisible text nodes
                //  if (ignore(node)) {
                //      return
                //  }
            }

            // if this node is a textnode, look for the
            if (node.nodeType === Node.TEXT_NODE) {
                // check for visibility


                // apply regexp identifying yellownote

                // exclude elements with invisible text nodes

                // ignore any textnode that is not at least xx characters long
                if (node.textContent.length >= 150) {

                    //console.debug("look for sticky note in (" + node.nodeType + "): " + node.textContent);
                    // regexp to match begining and end of a stickynote serialization. The regex pattern is such that multiple note objects may be matched.
                    var yellownote_regexp = new RegExp(/yellownote=.*=yellownote/);

                    if (yellownote_regexp.test(node.textContent)) {
                        console.debug("HIT");
                        // carry out yellow sticky note presentation on this textnode

                        showStickyNote(node, note_template);

                    }

                }
            }
        }
    } catch (e) {
        console.debug(e);
    }

}

render().then(function (d) {
    console.debug("render notes");
    console.debug(d);
    // kick of the process of rendering the yellow sticky notes in the graphic form


    var doc = window.document;

    var root_node = doc.documentElement;
    console.debug(root_node);

    // start analyzing the DOM (the page/document)

    var note_template = null;
    // collect the template, for later use
    fetch(chrome.runtime.getURL('./templates/default_yellownote_template.html')).
    then((response) => response.text())
    .then((html) => {
        //console.debug(html);
        //note_template_html = html;
        //const note_template = document.createElement('div');
        // container.innerHTML = html;
        note_template = safeParseInnerHTML(html, 'div');
        console.log("browsersolutions " + note_template);
        console.debug(note_template);

        replaceLink(root_node, note_template);

    });

    console.debug(note_template);

});

//traverse_text(document.documentElement);
console.debug("################################################");
//console.debug(all_page_text);
//console.debug(textnode_map);


var doc = window.document;

var root_node = doc.documentElement;
console.debug(root_node);

// start analyzing the DOM (the page/document)

var note_template = null;
// collect the template, for later use
fetch(chrome.runtime.getURL('./templates/default_yellownote_template.html')).
then((response) => response.text())
.then((html) => {
    //console.debug(html);
    //note_template_html = html;
    //const note_template = document.createElement('div');
    // container.innerHTML = html;
    note_template = safeParseInnerHTML(html, 'div');
    console.log("browsersolutions " + note_template);
    console.debug(note_template);

    //console.debug("browsersolutions url: " + url);
    replaceLink(root_node, note_template);

});
