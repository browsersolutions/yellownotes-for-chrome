const server_url = "http://api.yellownotes.xyz";

const URI_plugin_user_get_all_agreements = "/api/plugin_user_get_all_data_agreements";
const URI_plugin_user_delete_data_agreement = "/api/plugin_user_delete_distribution_list";
const URI_plugin_user_get_data_agreement = "/api/plugin_user_get_data_agreement";
const URI_plugin_user_get_distribution_list = "/api/plugin_user_get_distribution_list";
const URI_plugin_user_delete_subscription = "/api/plugin_user_delete_subscription";
const URI_plugin_user_add_subscription = "/api/plugin_user_add_subscription";
const URI_plugin_user_set_agreement_active_status = "/api/plugin_user_set_subscription_active_status";
const URI_plugin_user_deactivate_agreements = "/api/plugin_user_deactivate_distribution_list";
const URI_plugin_user_activate_agreements = "/api/plugin_user_activate_distribution_list";

const URI_plugin_user_get_my_distribution_lists = "/api/plugin_user_get_my_subscriptions";

const plugin_uuid_header_name = "ynInstallationUniqueId";
const plugin_session_header_name = "yellownotes_session";

const browser_id = chrome.runtime.id;

// Function to use "fetch" to delete a data row
async function deleteDataRow(distributionlistid) {
    try {
        let plugin_uuid = await chrome.storage.local.get(["ynInstallationUniqueId"]);
        let session = await chrome.storage.local.get(["yellownotes_session"]);
        const userid = "";
        console.log("deleting agreement: " + id);
        const message_body = JSON.stringify([{
                        distributionlistid: distributionlistid,
                    },
                ]);
        console.log(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_delete_data_agreement, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [plugin_uuid_header_name]: plugin_uuid.ynInstallationUniqueId,
                    [plugin_session_header_name]: session.yellownotes_session,
                },
                body: message_body, // example IDs, replace as necessary
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

// Function to use "fetch" to delete a data row
async function deleteDataRowByUUID(subscriptionid) {
    console.log("deleteDataRowByUUID");
    try {
        let plugin_uuid = await chrome.storage.local.get(["ynInstallationUniqueId"]);
        let session = await chrome.storage.local.get(["yellownotes_session"]);
        const userid = "";
        const message_body = JSON.stringify({
            subscriptionid: subscriptionid,
            }, );
        console.log(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_delete_subscription, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [plugin_uuid_header_name]: plugin_uuid.ynInstallationUniqueId,
                    [plugin_session_header_name]: session.yellownotes_session,
                },
                body: message_body, // example IDs, replace as necessary
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

// Function to use "fetch" to suspend a data agreement
async function addSubscriptionByUUID(subscriptionid) {
    console.debug("addSubscriptionByUUID");
    try {
        let plugin_uuid = await chrome.storage.local.get(["ynInstallationUniqueId"]);
        let session = await chrome.storage.local.get(["yellownotes_session"]);
        const userid = "";
        const message_body = JSON.stringify({
            distributionlistid: subscriptionid
            });
        //console.log(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_add_subscription, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [plugin_uuid_header_name]: plugin_uuid.ynInstallationUniqueId,
                    [plugin_session_header_name]: session.yellownotes_session,
                },
                body: message_body, // example IDs, replace as necessary
            });
        //console.log(response);
        // Check for errors
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // update the row in the table of current subscriptions
        // Parse JSON data
        const data = await response.json();
        console.log(data);
        // Get table body element
        const tableBody = document
            .getElementById("dataTable")
            .getElementsByTagName("tbody")[0];

        console.log(tableBody);
        // add new row to table
        // Create new row
        const newRow = tableBody.insertRow();
        // Create cells and populate them with data
        const cell1 = newRow.insertCell(0);
        const cell2 = newRow.insertCell(1);
        const cell3 = newRow.insertCell(2);
        const cell4 = newRow.insertCell(3);
        cell1.textContent = data.subscriptionid;

        cell2.textContent = data.distributionlist_name;
        cell3.textContent = data.distributionlist_description;
        cell4.textContent = data.subscribedate;


          // Add delete button
          const deleteButton = document.createElement("button");
          deleteButton.textContent = "Delete";
          deleteButton.classList.add("deleteBtn");
          deleteButton.onclick = function () {
              // Remove the row from the table
              newRow.remove();
              // call to API to delete row from data base
              deleteDataRowByUUID(row.subscriptionid);
          };

          // Add View button
          const viewButton = document.createElement("button");
          viewButton.textContent = "View";
          viewButton.classList.add("viewBtn");

          viewButton.onclick = function () {

              // call to API to delete row from data base
              viewDistributionlist(row.subscriptionid);
          };

          //Suspend/Active button
          const suspendActButton = document.createElement("span");
              // new subscrption is active by default
              suspendActButton.innerHTML =
                  '<label><input type="checkbox" placeholder="Enter text" checked/><span></span></label>';
          
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
                  await setActiveByUUID(row.subscriptionid, 1);
              } else {
                  await setActiveByUUID(row.subscriptionid, 0);
              }
          });

          // action buttons
          const cell7 = newRow.insertCell(4);
          cell7.appendChild(suspendActButton);
        
          const cell8 = newRow.insertCell(5);
          cell8.appendChild(deleteButton);
        
    } catch (error) {
        console.error(error);
    }
}

// Function to use "fetch" to suspend a data agreement
async function viewDistributionlist(distributionlistid) {
    try {
        let plugin_uuid = await chrome.storage.local.get(["ynInstallationUniqueId"]);
        let session = await chrome.storage.local.get(["yellownotes_session"]);
        const userid = "";
        const message_body = JSON.stringify({
                distributionlistid: distributionlistid
            });
        //console.log(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_get_distribution_list, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [plugin_uuid_header_name]: plugin_uuid.ynInstallationUniqueId,
                    [plugin_session_header_name]: session.yellownotes_session,
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

        console.log(data);
        console.log(data[0]);

        //document.addEventListener('DOMContentLoaded', function() {
        // Find the element where the table will be added
        const container = document.getElementById('form');

        // Create the table
        const table = document.createElement('table');
        table.style.border = '1px solid black'; // Optional: style the table

        // Add rows and cells
        const row1 = table.insertRow();
        const cell1_1 = row1.insertCell(0);
        const cell1_2 = row1.insertCell(1);

        const row2 = table.insertRow();
        const cell2_1 = row2.insertCell(0);
        const cell2_2 = row2.insertCell(1);

        // Set non-editable cells
        cell1_1.textContent = 'Name';
        cell1_2.textContent = data[0].Name;
        cell2_1.textContent = 'Description';
        cell2_2.textContent = data[0].description;

        // create teable for all members of this distribution list
        const row3 = table.insertRow();
        const cell3_1 = row3.insertCell();

        const member_table = document.createElement('table');
        member_table.style.border = '1px solid black'; // Optional: style the table

        const message_body2 = JSON.stringify({
                distributionlistid: distributionlistid
            });
        //console.log(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const subscribersresponse = await fetch(
                server_url + "/api/plugin_user_get_distribution_list_subscribers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [plugin_uuid_header_name]: plugin_uuid.ynInstallationUniqueId,
                    [plugin_session_header_name]: session.yellownotes_session,
                },
                body: message_body2, // example IDs, replace as necessary
            });
        //console.log(response);
        // Check for errors
        if (!subscribersresponse.ok) {
            throw new Error(`HTTP error! status: ${subscribersresponse.status}`);
        }
        // update the row in the table
        // Parse JSON data
        const subscribersdata = await subscribersresponse.json();

        console.log(subscribersdata);

        // Append the table to the container
        container.appendChild(table);

        const sub_table = document.createElement("table");

        subscribersdata.forEach((row) => {
            // Create new row
            const newRow = sub_table.insertRow();
            // Create cells and populate them with data
            const cell1 = newRow.insertCell(0);
            const cell2 = newRow.insertCell(1);
            const cell3 = newRow.insertCell(2);
            //const cell4 = newRow.insertCell(3);
            cell2.textContent = row.UserID;
            //cell3.textContent = row.description;


            // Add delete button
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.classList.add("deleteBtn");
            deleteButton.onclick = function () {
                // Remove the row from the table
                newRow.remove();
                // call to API to delete row from data base
                deleteSubscriptionByUUID(row.SubscriptionID);
            };

            cell3.appendChild(deleteButton);

        });

        console.log(sub_table);
        // Append the table to the container
        container.appendChild(sub_table);
        // add button to add a new subscriber
        // Add delete button
        const addSubscriberButton = document.createElement("button");
        addSubscriberButton.textContent = "add subscriber";
        addSubscriberButton.classList.add("addBtn");
        addSubscriberButton.onclick = function () {
            // call to API to delete row from data base
            add_subscriber(distributionlistid);

        };
        container.appendChild(addSubscriberButton);

    } catch (error) {
        console.error(error);
    }
}

// Function to use "fetch" to re-activate a data agreement
async function setActiveByUUID(subscriptionid, status) {
    try {
        let plugin_uuid = await chrome.storage.local.get(["ynInstallationUniqueId"]);
        let session = await chrome.storage.local.get(["yellownotes_session"]);
        const userid = "";
        const message_body = JSON.stringify({
            subscriptionid: subscriptionid,
                activestatus: status,
            });
        //console.log(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_set_agreement_active_status, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [plugin_uuid_header_name]: plugin_uuid.ynInstallationUniqueId,
                    [plugin_session_header_name]: session.yellownotes_session,
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

// Function to suspend all data agreements (not already suspended)
async function suspendAll() {
    console.log("suspendAll");
    try {
        var message = {
            type: "suspendAllDataAgreements",
            agreement_details: {},
        };

        console.debug(message);
        // send save request back to background
        chrome.runtime.sendMessage(message, function (response) {
            console.debug(
                "message sent to backgroup.js with response: " +
                JSON.stringify(response));
            // finally, call "close" on the note
        });
    } catch (e) {
        console.error(e);
    }
}

// Function to activate all data agreements (not already active)
function activateAll() {
    console.log("activateAll");
    try {}
    catch (e) {
        console.error(e);
    }
}

// Function to fetch data and populate the table
async function fetchData() {
    console.log("fetchData");
    try {
        let plugin_uuid = await chrome.storage.local.get(["ynInstallationUniqueId"]);
        let session = await chrome.storage.local.get(["yellownotes_session"]);

        // Fetch data from web service (replace with your actual API endpoint)

        const headers = {
            "Content-Type": "application/json",
            [plugin_uuid_header_name]: plugin_uuid.ynInstallationUniqueId,
            [plugin_session_header_name]: session.yellownotes_session,
        };
        //const body = JSON.stringify(payload);

        const response = await fetch(
                server_url + "/api/plugin_user_get_my_subscriptions", {
                method: "GET",
                headers,
            });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse JSON data
        // const data = await response.json();


        // send save request back to background
        //chrome.runtime.sendMessage({
        //    request: "getDistributionLists"
        //}).then(function (response) {
        //    console.log(response);


        var utc = new Date().toJSON().slice(0, 10).replace(/-/g, "/");
        console.log(utc);
        console.log(Date.now());
        var now = new Date();
        var utc_timestamp = Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate(),
                now.getUTCHours(),
                now.getUTCMinutes(),
                now.getUTCSeconds(),
                now.getUTCMilliseconds());
        console.log(utc_timestamp);
        console.log(new Date().toISOString());

        // Parse JSON data
        const data = await response.json();
        console.log(data);
        // Get table body element
        const tableBody = document
            .getElementById("dataTable")
            .getElementsByTagName("tbody")[0];

        console.log(tableBody);
        // loop through the existing table and delete all rows
        console.log(tableBody.rows);
        console.log(tableBody.rows.length);
        var list = tableBody.rows;
        try {
            if (tableBody.rows.length) {
                for (var li = list.length - 1; li >= 0; li--) {
                    list[li].remove();
                }
            }
        } catch (e) {
            console.error(e);
        }
        // Loop through data and (re-)populate the table with the results returned from the API
        data.forEach((row) => {
            // Create new row
            const newRow = tableBody.insertRow();
            // Create cells and populate them with data
            const cell1 = newRow.insertCell(0);
            const cell2 = newRow.insertCell(1);
            const cell3 = newRow.insertCell(2);
            const cell4 = newRow.insertCell(3);
            const cell5 = newRow.insertCell(4);
            const cell9 = newRow.insertCell(5);
            //cell1.textContent = row.subscriptionid;
            cell2.textContent = row.name;
            cell3.textContent = row.description;
            cell4.textContent = row.creatorid;
            cell5.textContent = row.postcount;
            cell9.textContent = row.subscribedate;

            // Add delete button
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.classList.add("deleteBtn");
            deleteButton.onclick = function () {
                // Remove the row from the table
                newRow.remove();
                // call to API to delete row from data base
                deleteDataRowByUUID(row.subscriptionid);
            };

            // Add View button
            const viewButton = document.createElement("button");
            viewButton.textContent = "View";
            viewButton.classList.add("viewBtn");

            viewButton.onclick = function () {

                // call to API to delete row from data base
                viewDistributionlist(row.subscriptionid);
            };

            //Suspend/Active button
            const suspendActButton = document.createElement("span");
            if (row.active == 1) {
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
 //                   await suspendByUUID(row.subscriptionid, 1);
                    await setActiveByUUID(row.subscriptionid, 1);
                } else {
                    await setActiveByUUID(row.subscriptionid, 0);
                }
            });

            // action buttons
            const cell7 = newRow.insertCell(6);
            cell7.appendChild(suspendActButton);
            //cell7.appendChild(suspendActButton);

            const cell8 = newRow.insertCell(7);
            //cell8.appendChild(viewButton);
            cell8.appendChild(deleteButton);
            //const cell9 = newRow.insertCell(4);
            //cell9.appendChild(activateButton);

            // Adding data-label for mobile responsive
            //cell1.setAttribute("data-label", "UTC");
            //cell2.setAttribute("data-label", "localtime");
            //cell2.setAttribute("data-label", "url");

            //  });


        });
    } catch (error) {
        console.error(error);
    }
}

// Locate all elements with the class "my-button"
const buttons = document.querySelectorAll(".sortableCol");
//len = buttons.length;
for (var i = 0; i < buttons.length; i++) {
    //work with checkboxes[i]
    console.log(buttons[i]);
    // set column index number for each column
    buttons[i].setAttribute("colindex", i);
    buttons[i].addEventListener(
        "click",
        function (event) {
        sortTa();
    },
        false);
}

// Locate all cells that are used for filtering of search results
const f_cells = document.querySelectorAll(".filterableCol");
console.log(f_cells);
//len = f_cells.length;
for (var i = 0; i < f_cells.length; i++) {
    //work with regexp in cell
    console.log(f_cells[i]);
    // set column index number for each column
    f_cells[i].setAttribute("colindex", i);
    f_cells[i].addEventListener(
        "input",
        function (event) {
        filterTable_a();
    },
        false);
}

// Sort states for each column
const sortStates = {
    0: "none", // None -> Ascending -> Descending -> None -> ...
    1: "none",
};

function sortTa() {
    sortTable(event.target);
}

// Function to sort the table
function sortTable(colheader) {
    const columnIndex = colheader.parentNode.getAttribute("colindex");
    console.log("sortable: " + columnIndex, colheader);

    const table = document.getElementById("dataTable");

    let rows = Array.from(table.rows).slice(1); // Ignore the header
    let sortedRows;

    // Toggle sort state for the column
    if (
        sortStates[columnIndex] === "none" ||
        sortStates[columnIndex] === "desc") {
        sortStates[columnIndex] = "asc";
    } else {
        sortStates[columnIndex] = "desc";
    }

    // Sort based on the selected column and sort state
    // Consider options for different types of sorting here.
    if (columnIndex === 0) {
        sortedRows = rows.sort((a, b) => {
                return (
                    Number(a.cells[columnIndex].innerText) -
                    Number(b.cells[columnIndex].innerText));
            });
    } else {
        sortedRows = rows.sort((a, b) =>
                a.cells[columnIndex].innerText.localeCompare(
                    b.cells[columnIndex].innerText));
    }

    if (sortStates[columnIndex] === "desc") {
        sortedRows.reverse();
    }

    console.log(sortedRows);
    // Remove existing rows
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // Append sorted rows
    const tbody = table.getElementsByTagName("tbody")[0];
    sortedRows.forEach((row) => tbody.appendChild(row));
}

function filterTable_a() {
    //  console.log("filterTable_a " );

    filterTable(event.target);
}

function filterTable(colheader) {
    const columnIndex = colheader.parentNode.getAttribute("colindex");
    //console.log(colheader);
    console.log("filter on col: " + columnIndex);
    //const input = colheader;
    const filter = colheader.value.toUpperCase();
    const table = document.getElementById("dataTable");
    const rows = table
        .getElementsByTagName("tbody")[0]
        .getElementsByTagName("tr");
    //console.log("filter column:" + columnIndex);
    //console.log("filter value:" + filter);

    for (let i = 0; i < rows.length; i++) {
        const cell = rows[i].getElementsByTagName("td")[columnIndex];
        //console.log(cell);
        if (cell) {
            const content = cell.innerText || cell.textContent;
            if (new RegExp(filter, "i").test(content)) {
                //        console.log("not sho");
                rows[i].style.display = "";
            } else {
                rows[i].style.display = "none";
            }
        }
    }
}




// Function to fetch data and populate the table
async function fetchAvailableDistributionlists() {
    console.log("fetchAvailableDistributionlists");
    try {
        let plugin_uuid = await chrome.storage.local.get(["ynInstallationUniqueId"]);
        let session = await chrome.storage.local.get(["yellownotes_session"]);

        // Fetch data from web service (replace with your actual API endpoint)

        const headers = {
            "Content-Type": "application/json",
            [plugin_uuid_header_name]: plugin_uuid.ynInstallationUniqueId,
            [plugin_session_header_name]: session.yellownotes_session,
        };
        //const body = JSON.stringify(payload);

        const response = await fetch(
                server_url + "/api/plugin_user_get_available_distributionlists", {
                method: "GET",
                headers,
            });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse JSON data
        // const data = await response.json();


        // send save request back to background
        //chrome.runtime.sendMessage({
        //    request: "getDistributionLists"
        //}).then(function (response) {
        //    console.log(response);


        var utc = new Date().toJSON().slice(0, 10).replace(/-/g, "/");
        console.log(utc);
        console.log(Date.now());
        var now = new Date();
        var utc_timestamp = Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate(),
                now.getUTCHours(),
                now.getUTCMinutes(),
                now.getUTCSeconds(),
                now.getUTCMilliseconds());
        console.log(utc_timestamp);
        console.log(new Date().toISOString());

        // Parse JSON data
        const data = await response.json();
        console.log(data);
        // Get table body element
        const tableBody = document
            .getElementById("distributionsTable")
            .getElementsByTagName("tbody")[0];

        console.log(tableBody);
        // loop through the existing table and delete all rows
        console.log(tableBody.rows);
        console.log(tableBody.rows.length);
        var list = tableBody.rows;
        try {
            if (tableBody.rows.length) {
                for (var li = list.length - 1; li >= 0; li--) {
                    list[li].remove();
                }
            }
        } catch (e) {
            console.error(e);
        }
        // Loop through data and (re-)populate the table with the results returned from the API
        data.forEach((row) => {
            // Create new row
            const newRow = tableBody.insertRow();
            console.debug(row);
            // Create cells and populate them with data
            const cell1 = newRow.insertCell(0);
            const cell2 = newRow.insertCell(1);
            const cell3 = newRow.insertCell(2);
            const cell4 = newRow.insertCell(3);
            //const cell5 = newRow.insertCell(4);
            //const cell6 = newRow.insertCell(5);
            //cell1.textContent = row.distributionlistid;
            cell2.textContent = row.name;
            cell3.textContent = row.description;
            cell4.textContent = row.restrictions;

            // Add subscribe button
            const subscribeButton = document.createElement("button");
            subscribeButton.textContent = "Subscribe";
            subscribeButton.classList.add("deleteBtn");
            subscribeButton.onclick = function () {
                // Remove the row from the table
                newRow.remove();
                // call to API to add a subscription to distributionlist
                addSubscriptionByUUID(row.distributionlistid);
            };

            // Add View button
            const viewButton = document.createElement("button");
            viewButton.textContent = "View";
            viewButton.classList.add("viewBtn");

            viewButton.onclick = function () {

                // call to API to delete row from data base
                viewDistributionlist(row.distributionlistid);
            };

         


            // action buttons

            const cell7 = newRow.insertCell(4);
            cell7.appendChild(subscribeButton);


        });
    } catch (error) {
        console.error(error);
    }
}



async function DELadd_subscriber(distributionlistid) {
    console.log("add_subscriber to " + distributionlistid);
    // create a small window/form to add a new distribution list

// get all available distributions lists
    //fetchAvailableDistriutions();

    //document.addEventListener('DOMContentLoaded', function() {
    // Find the element where the table will be added
    const container = document.getElementById('form');

    // Create the table
    const table = document.createElement('table');
    table.style.border = '1px solid black'; // Optional: style the table

    // Add rows and cells
    const row1 = table.insertRow();
    const cell1_1 = row1.insertCell();
    const cell1_2 = row1.insertCell();

    // Set non-editable cells
    cell1_1.textContent = 'Name';
    //cell2_1.textContent = 'Description';

    // Set editable cells with placeholder text
    cell1_2.contentEditable = true;
    cell1_2.style.border = '1px solid black'; // Optional: style the cell
    cell1_2.textContent = 'Enter an email address';
    cell1_2.addEventListener('click', function () {
        if (this.textContent === 'Enter an email address') {
            this.textContent = '';
        }
    });

    // Append the table to the container
    container.appendChild(table);

    // create button to send data to API
    const button = document.createElement('button');
    button.id = 'new-subscriber';
    button.textContent = 'add';
    container.appendChild(button);
    console.log(container);

    // Find the button and add an event listener
    const sendDataButton = document.getElementById('new-subscriber');
    //const sendDataButton = container.getElementById('send-data');

    sendDataButton.addEventListener('click', function () {
        // Extract data from table
        //const table1 = document.querySelector('#table-container table');
        const email = table.rows[0].cells[1].textContent; // Get text from second cell of the first row
        //const description = table.rows[1].cells[1].textContent; // Get text from second cell of the second row

        var ynInstallationUniqueId = "";
        var yellownotes_session = "";
        const msg = {
            "email": email,
            "distributionlistid": distributionlistid

        }
        console.log(msg);
        chrome.storage.local.get(["ynInstallationUniqueId"]).then(
            function (result) {
            ynInstallationUniqueId = result.ynInstallationUniqueId;
            console.log("ynInstallationUniqueId: " + ynInstallationUniqueId);
            return chrome.storage.local.get(["yellownotes_session"]);
        }).then(function (result) {
            yellownotes_session = result.yellownotes_session;
            console.log("yellownotes_session: " + yellownotes_session);

            // let plugin_uuid = await chrome.storage.local.get(["ynInstallationUniqueId"]);

            // let session = await chrome.storage.local.get(["yellownotes_session"]);

            // Fetch data from web service (replace with your actual API endpoint)

            // Send data using fetch
            return fetch('http://api.yellownotes.xyz/api/plugin_user_add_distribution_list_subscriber', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [plugin_uuid_header_name]: ynInstallationUniqueId,
                    [plugin_session_header_name]: yellownotes_session,
                },
                body: JSON.stringify(msg)
            });
        })
        .then(response => response.json())
        .then(function (data) {
            console.log('Success:', data);
            // Usage: Pass the ID of the parent element to cleanup
            removeAllChildren('form');

        }).catch((error) => console.error('Error:', error));
    });

}

async function remove_subscriber(subscriptionid, distributionlistid) {
    console.log("remove_subscriber");
    // create a small window/form to add a new distribution list


    //document.addEventListener('DOMContentLoaded', function() {
    // Find the element where the table will be added
    const container = document.getElementById('form');

    // Create the table
    const table = document.createElement('table');
    table.style.border = '1px solid black'; // Optional: style the table

    // Add rows and cells
    const row1 = table.insertRow();
    const cell1_1 = row1.insertCell();
    const cell1_2 = row1.insertCell();

    // Set non-editable cells
    cell1_1.textContent = 'Name';
    //cell2_1.textContent = 'Description';

    // Set editable cells with placeholder text
    cell1_2.contentEditable = true;
    cell1_2.style.border = '1px solid black'; // Optional: style the cell
    cell1_2.textContent = 'Enter a name';
    cell1_2.addEventListener('click', function () {
        if (this.textContent === 'Enter an email address') {
            this.textContent = '';
        }
    });

    // Append the table to the container
    container.appendChild(table);

    // create button to send data to API
    const button = document.createElement('button');
    button.id = 'send-data';
    button.textContent = 'add subscriber';
    container.appendChild(button);
    console.log(container);

    // Find the button and add an event listener
    const sendDataButton = document.getElementById('send-data');
    //const sendDataButton = container.getElementById('send-data');

    sendDataButton.addEventListener('click', function () {
        // Extract data from table
        //const table1 = document.querySelector('#table-container table');
        const email = table.rows[0].cells[1].textContent; // Get text from second cell of the first row
        //const description = table.rows[1].cells[1].textContent; // Get text from second cell of the second row

        var ynInstallationUniqueId = "";
        var yellownotes_session = "";

        chrome.storage.local.get(["ynInstallationUniqueId"]).then(
            function (result) {
            ynInstallationUniqueId = result.ynInstallationUniqueId;
            console.log("ynInstallationUniqueId: " + ynInstallationUniqueId);
            return chrome.storage.local.get(["yellownotes_session"]);
        }).then(function (result) {
            yellownotes_session = result.yellownotes_session;
            console.log("yellownotes_session: " + yellownotes_session);

            // let plugin_uuid = await chrome.storage.local.get(["ynInstallationUniqueId"]);

            // let session = await chrome.storage.local.get(["yellownotes_session"]);

            // Fetch data from web service (replace with your actual API endpoint)

            // Send data using fetch
            return fetch('http://api.yellownotes.xyz/api/plugin_user_delete_subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [plugin_uuid_header_name]: ynInstallationUniqueId,
                    [plugin_session_header_name]: yellownotes_session,
                },
                body: JSON.stringify({
                    "subscriptionid": subscriptionid,
                    "distributionlistid": distributionlistid

                })
            });
        })
        .then(response => response.json())
        .then(function (data) {
            console.log('Success:', data);
            // Usage: Pass the ID of the parent element to cleanup
            removeAllChildren('form');

        }).catch((error) => console.error('Error:', error));
    });

}

function removeAllChildren(parentElementId) {
    console.log("removeAllChildren");
    // Get the parent element by its ID
    const parent = document.getElementById(parentElementId);

    // Continue removing the first child as long as the parent has a child node
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

async function activateAgreements(payload) {
    try {
        let plugin_uuid = await chrome.storage.local.get(["ynInstallationUniqueId"]);

        let session = await chrome.storage.local.get(["yellownotes_session"]);

        const headers = {
            "Content-Type": "application/json",
            [plugin_uuid_header_name]: plugin_uuid.ynInstallationUniqueId,
            [plugin_session_header_name]: session.yellownotes_session,
        };
        const body = JSON.stringify(payload);

        const response = await fetch(
                server_url + URI_plugin_user_activate_agreements, {
                method: "POST",
                headers,
                body,
            });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.log(error);
    }
}

async function deactivateAgreements(payload) {
    try {
        let plugin_uuid = await chrome.storage.local.get(["ynInstallationUniqueId"]);
        let session = await chrome.storage.local.get(["yellownotes_session"]);
        const headers = {
            "Content-Type": "application/json",
            [plugin_uuid_header_name]: plugin_uuid.ynInstallationUniqueId,
            [plugin_session_header_name]: session.yellownotes_session,
        };
        const body = JSON.stringify(payload);

        const response = await fetch(
                server_url + URI_plugin_user_deactivate_agreements, {
                method: "POST",
                headers,
                body,
            });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.log(error);
    }
}

function extractAgreementIds() {
    const table = document.getElementById("dataTable");
    const rows = table.getElementsByTagName("tbody")[0].rows;
    const agreementIds = [];

    for (let i = 0; i < rows.length; i++) {
        const agreementId = rows[i].cells[0].textContent;
        agreementIds.push({
            agreementid: agreementId
        });
    }

    return agreementIds;
}



// Fetch data on current subscriptions on page-load
fetchData();

document
.getElementById("subscriptionsRefreshButton")
.addEventListener("click", fetchData);

document
.getElementById("subscriptionsActivateAllButton")
.addEventListener("click", async function () {
    activateAgreements(extractAgreementIds());
});

document
.getElementById("subscriptionsSuspendAllButton")
.addEventListener("click", function () {
    deactivateAgreements(extractAgreementIds());
});

document
.getElementById("subscriptionsAddButton")
.addEventListener("click", function () {
    add_subscription();
});


async function add_subscription() {
    console.log("add_subscription");
    // create a small window/form to add a new subscription


    /**
     * Users select from a list of available subscrptions
     * 
     * This will required much modification in future. 
     * For the moment a complete list of all possible distrbiution lists is returned, to select from.
     * 
     */




    // create a table to populate with selectable distribution lists


    document
    .getElementById("form").innerHTML = '  available subscriptions'+
    '<div class="tabContent scrollable-table">'+
    '  <div class="tableResponsive">'+
    '    <table id="distributionsTable">'+
    '      <thead>'+
    '        <tr class="fixed-header">'+
    '          <!-- set up column headers here-->'+
    '          <th>ID</th>'+
    '          <!-- <th class="sortableCol">universaltime</th> -->'+
    '          <th class="sortableCol">name</th>'+
    '          <th>description</th>'+
    '          <th>creator</th>'+
    '          <th>post count</th>'+
    '          <th>restrictions</th>'+
    '          <th></th>'+
    '        </tr>'+
    '        </thead>'+
    '        <tbody>'+
    '          <!-- Rows will be added here -->'+
    '        </tbody>'+
    '      </table>'+
    '    </div>'+
    '  </div>';


// get all available distributions lists
try {
    let plugin_uuid = await chrome.storage.local.get(["ynInstallationUniqueId"]);
    let session = await chrome.storage.local.get(["yellownotes_session"]);

    // Fetch data from web service (replace with your actual API endpoint)

    const headers = {
        "Content-Type": "application/json",
        [plugin_uuid_header_name]: plugin_uuid.ynInstallationUniqueId,
        [plugin_session_header_name]: session.yellownotes_session,
    };
    //const body = JSON.stringify(payload);

    const response = await fetch(
            server_url + "/api/plugin_user_get_available_distributionlists", {
            method: "GET",
            headers,
        });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse JSON data
    // const data = await response.json();


    // send save request back to background
    //chrome.runtime.sendMessage({
    //    request: "getDistributionLists"
    //}).then(function (response) {
    //    console.log(response);


    var utc = new Date().toJSON().slice(0, 10).replace(/-/g, "/");
    console.log(utc);
    console.log(Date.now());
    var now = new Date();
    var utc_timestamp = Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            now.getUTCHours(),
            now.getUTCMinutes(),
            now.getUTCSeconds(),
            now.getUTCMilliseconds());
    console.log(utc_timestamp);
    console.log(new Date().toISOString());

    // Parse JSON data when the results are back
    const data = await response.json();
    console.log(data);
    // Get table body element
    const tableBody = document
        .getElementById("distributionsTable")
        .getElementsByTagName("tbody")[0];

    console.log(tableBody);
    // loop through the existing table and delete all rows
    console.log(tableBody.rows);
    console.log(tableBody.rows.length);
    var list = tableBody.rows;
    try {
        if (tableBody.rows.length) {
            for (var li = list.length - 1; li >= 0; li--) {
                list[li].remove();
            }
        }
    } catch (e) {
        console.error(e);
    }
    // Loop through data and (re-)populate the table with the results returned from the API
    data.forEach((row) => {
        // Create new row
        console.debug(row);
        const newRow = tableBody.insertRow();
        // Create cells and populate them with data
        const cell1 = newRow.insertCell(0);
        const cell2 = newRow.insertCell(1);
        const cell3 = newRow.insertCell(2);
        const cell4 = newRow.insertCell(3);
        const cell5 = newRow.insertCell(4);
        const cell6 = newRow.insertCell(5);
        //cell1.textContent = row.distributionlistid;
        cell2.textContent = row.name;
        cell3.textContent = row.description;
        cell4.textContent = row.creatorid;
        cell5.textContent = row.postcount;
        cell6.textContent = row.restrictions;

        // Add subscribe button
        const subscribeButton = document.createElement("button");
        subscribeButton.textContent = "Subscribe";
        subscribeButton.classList.add("deleteBtn");
        subscribeButton.onclick = function () {
            // Remove the row from the table
            newRow.remove();
            // call to API to add a subscription to distributionlist,
            //this function will also update the list of current subscriptions
            addSubscriptionByUUID(row.distributionlistid);
        };

        // Add View button
        const viewButton = document.createElement("button");
        viewButton.textContent = "View";
        viewButton.classList.add("viewBtn");

        viewButton.onclick = function () {

            // call to API to delete row from data base
            viewDistributionlist(row.distributionlistid);
        };

     


        // action buttons
        const cell7 = newRow.insertCell(6);
        cell7.appendChild(subscribeButton);


    });
} catch (error) {
    console.error(error);
}



// create button to send data to API
const button = document.createElement('button');
button.id = 'new-subscriber';
button.textContent = 'add';
const container = document.getElementById('form');
container.appendChild(button);
console.log(container);

// Find the button and add an event listener
const sendDataButton = document.getElementById('new-subscriber');
//const sendDataButton = container.getElementById('send-data');

sendDataButton.addEventListener('click', function () {
    console.log("sendDataButton");
    // Extract data from table
    //const table1 = document.querySelector('#table-container table');
    const email = table.rows[0].cells[1].textContent; // Get text from second cell of the first row
    //const description = table.rows[1].cells[1].textContent; // Get text from second cell of the second row

    var ynInstallationUniqueId = "";
    var yellownotes_session = "";
    const msg = {
        "email": email,
        "distributionlistid": distributionlistid

    }
    console.log(msg);
    chrome.storage.local.get(["ynInstallationUniqueId"]).then(
        function (result) {
        ynInstallationUniqueId = result.ynInstallationUniqueId;
        console.log("ynInstallationUniqueId: " + ynInstallationUniqueId);
        return chrome.storage.local.get(["yellownotes_session"]);
    }).then(function (result) {
        yellownotes_session = result.yellownotes_session;
        console.log("yellownotes_session: " + yellownotes_session);

        // let plugin_uuid = await chrome.storage.local.get(["ynInstallationUniqueId"]);

        // let session = await chrome.storage.local.get(["yellownotes_session"]);

        // Fetch data from web service (replace with your actual API endpoint)

        // Send data using fetch
        return fetch('http://api.yellownotes.xyz/api/plugin_user_add_distribution_list_subscriber', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [plugin_uuid_header_name]: ynInstallationUniqueId,
                [plugin_session_header_name]: yellownotes_session,
            },
            body: JSON.stringify(msg)
        });
    })
    .then(response => response.json())
    .then(function (data) {
        console.log('Success:', data);
        // Usage: Pass the ID of the parent element to cleanup
        removeAllChildren('form');

    }).catch((error) => console.error('Error:', error));
});



}


// Fetch data on available distributions lists on page-load
//fetchAvailableDistriutions();


