


//const browser_id = chrome.runtime.id;


// check if the user is authenticated
checkSessionJWTValidity()
.then(isValid => {
    console.debug('JWT is valid:', isValid);
    if (isValid) {
        console.debug("JWT is valid - show menu accordingly");
        fetchAndDisplayStaticContent("../fragments/en_US/view_own_subscribers_page_main_text.html", "view_own_subscribers_page_main_text").then(() => {});

        fetchAndDisplayStaticContent("../fragments/en_US/view_own_subscribers_page_explanation.html", "view_own_subscribers_page_explanation").then(() => {});

        const uuid = localStorage.getItem("creatorid");
        const replacements = {creatorid: uuid};
        fetchAndDisplayStaticContent("../fragments/en_US/sidebar_fragment_authenticated.html", "sidebar", replacements).then(() => {
            //page_display_login_status();
                // login_logout_action();
            });
    

        page_display_login_status();
    } else {
        console.debug("JWT is not valid - show menu accordingly");

        fetchAndDisplayStaticContent("../fragments/en_US/sidebar_fragment_unauthenticated.html", "sidebar").then(() => {
            //page_display_login_status();
            //login_logout_action();

        });

        page_display_login_status();
    }

})
.catch(error => {
    console.error('Error:', error.message);
});

// name of key to be used in db
const table_name = "subscribersTable";
const filterStorageKey = table_name + "_rowFilters";

const table_columns_to_not_display_keyname = table_name + "_hide_columns";

const column_list = ["name", "email", "distributionlistname", "application_status", "subscribetime", "active_status", "actions"];

// attach event listeners to the column toggle checkboxes
addEventColumnToggleListeners(column_list, table_name);


// which columns to display
// The users can decide which columns to display




// set table visibility defaults
// make this sensitive to the size screen the user is using

var not_show_by_default_columns = [];

const pagewidth = window.innerWidth;
console.debug("window.innerWidth: " + pagewidth);

if (pagewidth < 300) {
    not_show_by_default_columns = [ "status","subscribetime" ,"status","active"];
} else if (pagewidth < 600) {
    not_show_by_default_columns = [ "status" , "active"];

} else if (pagewidth < 1000) {
    not_show_by_default_columns = [];
}


// call to database to get notes and place them in a table
fetchData(getQueryStringParameter('distributionlistid'), not_show_by_default_columns).then(function (d) {
    console.debug("read notes complete");
    console.debug(d);

    // update the list of colmes and check/uncheck according to the list of columns to not display
    not_show_by_default_columns.forEach(column => {
        toggleColumn(column, false, "subscribersTable", table_columns_to_not_display_keyname);
        document.getElementById(`toggle-${column}`).checked = false;
    });

});

    function fetchData(distributionlistid, not_show_by_default_columns) {
        console.debug("fetchData for distributionlistid: \"" + distributionlistid, "\" not_show_by_default_columns: " + not_show_by_default_columns);

        return new Promise(
            function (resolve, reject) {

            var ynInstallationUniqueId = "";
            var xYellownotesSession = "";

            chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name]).then(function (result) {
                console.debug(result);
                console.debug(ynInstallationUniqueId);
                ynInstallationUniqueId = result[plugin_uuid_header_name];
                xYellownotesSession = result[plugin_session_header_name];
                console.debug(ynInstallationUniqueId);
                console.debug(xYellownotesSession);
                var msg = { distributionlistid: distributionlistid};
                if (distributionlistid == null) {
                    msg = {};
                }
                console.debug(msg);
                return fetch(server_url + URI_plugin_user_get_my_feed_subscribers, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        [plugin_uuid_header_name]: ynInstallationUniqueId,
                        [plugin_session_header_name]: xYellownotesSession,
                    },
                    body: JSON.stringify(msg) // example IDs, replace as necessary, the body is used to retrieve the notes of other users, default is to retrieve the notes of the authenticated user
                });
            }).then(response => {
                if (!response.ok) {
                    console.debug(response);

                    // if an invalid session token was sent, it should be removed from the local storage
                    if (response.status == 401) {
                        // compare the response body with the string "Invalid session token" to determine if the session token is invalid
                        if (response.headers.get("session") == "DELETE_COOKIE") {
                            console.debug("Session token is invalid, remove it from local storage.");
                            chrome.storage.local.remove([plugin_session_header_name]);
                            // redirect to the front page returning the user to unauthenticated status.
                            // unauthenticated functionality will be in effect until the user authenticates
                            window.location.href = "/pages/my_account.html";
                            reject('logout');
                        } else {
                            reject('Network response was not ok');
                        }
                    } else {
                        reject('Network response was not ok');
                    }
                } else {
                    return response.json();
                }
            }).then(function (resp) {
                data = resp;
                return fetch(server_url + URI_plugin_user_get_my_distribution_lists, {
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

                console.debug(distributionListData);

                console.debug(data);

                var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
                console.debug(utc);
                console.debug(Date.now());
                var now = new Date;
                var utc_timestamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
                        now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
                console.debug(utc_timestamp);
                console.debug(new Date().toISOString());

                // Get table body element
                const tableBody = document.querySelector('table[name="subscribersTable"]').getElementsByTagName('tbody')[0];
                // Loop through data and populate the table
                data.forEach(row => {
                    console.debug(row);
                    console.debug(JSON.stringify(row));
                    console.debug(row.subscriptionid);

                    // Create new row
                    const newRow = tableBody.insertRow();
                    newRow.setAttribute('subscriptionid', row.subscriptionid);
                    newRow.setAttribute('subscriberuuid', row.subscriberuuid);
                    newRow.setAttribute('distributionlistid', row.distributionlistid);
                    newRow.setAttribute('creatorid', row.creatorid);
                    // Create cells and populate them with data

                    const cell_displayname = newRow.insertCell(0);
                    const cell_email = newRow.insertCell(1);
                    const cell_distributionlistname = newRow.insertCell(2);
                    const cell_active_status = newRow.insertCell(3);
                    const cell_application_status = newRow.insertCell(4);
                    const cell_subscribedate = newRow.insertCell(5);
                    const cell_actions = newRow.insertCell(6);
                    // do not include a option for notes in this release
                    try {
                        cell_email.textContent = row.email;
                        cell_email.setAttribute('name', 'email');
                        cell_email.setAttribute('class', 'email');
                    } catch (e) {
                        console.debug(e);
                    }

                    // name
                    try {
                        cell_subscribedate.textContent = timestampstring2timestamp(row.subscribedate);
                        cell_subscribedate.setAttribute('name', 'subscribedate');
                        cell_subscribedate.setAttribute('class', 'datetime');
                    } catch (e) {
                        console.debug(e);
                    }

                    try {
                        cell_displayname.textContent = row.displayname;
                        cell_displayname.setAttribute('name', 'displayname');
                        cell_displayname.setAttribute('class', 'displayname');
                    } catch (e) {
                        console.debug(e);
                    }

                    try {
                        cell_distributionlistname.textContent = row.distributionlistname;
                        cell_distributionlistname.setAttribute('name', 'distributionlistname');
                        cell_distributionlistname.setAttribute('class', 'displayname');
                    } catch (e) {
                        console.debug(e);
                    }

                    // render a check box to enable/disable the note
                    const suspendActButton = document.createElement("span");
                    if (row.enabled_status == 1) {
                        // active_status
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
                            await setSubscriptionActiveStatusByUUID(row.subscriptionid, 1);
                        } else {
                            await setSubscriptionActiveStatusByUUID(row.subscriptionid, 0);
                            //           await enable_note_with_noteid(row.noteid);
                        }
                    });
                    cell_active_status.appendChild(suspendActButton);
                    cell_active_status.setAttribute('class', 'checkbox');
                    cell_active_status.setAttribute('name', 'active');

                    try {
                        cell_application_status.textContent = row.application_status;
                        cell_application_status.setAttribute('name', 'status');
                        cell_application_status.setAttribute('class', 'status');
                    } catch (e) {
                        console.debug(e);
                    }


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
                    deleteSubscription(row.subscriptionid);
                };
                deleteButtonContainer.appendChild(deleteButton);
                actionButtonContainer.appendChild(deleteButtonContainer);

                // Add approve button if the application status is pending
                if (row.application_status == "PENDING_APPROVAL") {
                
   // Add delete button
   const approveButtonContainer = document.createElement('div');
   approveButtonContainer.setAttribute('class', 'delete_button');
   approveButtonContainer.setAttribute('name', 'approveButtonContainer');
   const approveButton = document.createElement('img');
   approveButton.src = "../icons/approve.225.png";
   approveButton.alt = 'approve';
   approveButton.setAttribute('class', 'delete_button');
   approveButton.onclick = function () {
       // update the row in the table
       //newRow.remove();
console.debug("approveButton clicked");
console.debug( document.querySelector( 'tr[subscriptionid="'+row.subscriptionid+'"]').querySelector( 'td[name="status"]').textContent);
document.querySelector( 'tr[subscriptionid="'+row.subscriptionid+'"]').querySelector( 'td[name="status"]').textContent = "MANUALLY_APPROVED";

// set the active checkbox to checked
document.querySelector( 'tr[subscriptionid="'+row.subscriptionid+'"]').querySelector( 'td[name="active"]').querySelector("input").checked = true;

// remove the approve button
console.debug( document.querySelector( 'tr[subscriptionid="'+row.subscriptionid+'"]').querySelector( '[name="approveButtonContainer"]') );

    document.querySelector( 'tr[subscriptionid="'+row.subscriptionid+'"]').querySelector( '[name="approveButtonContainer"]').remove();

       // call to API to delete row from data base
       approveSubscription(row.subscriptionid);
   };
   approveButtonContainer.appendChild(approveButton);
   actionButtonContainer.appendChild(approveButtonContainer);
                }
             
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
                cell_actions.setAttribute('name', 'actions');
                cell_actions.setAttribute('class', 'action-5');
                
                cell_actions.setAttribute('data-label', 'text');

                });
            });

        });
    }

// Function to use "fetch" to delete a data row
async function deleteSubscription(subscriptionid) {
    console.debug("deleteSubscription: " + subscriptionid);
    try {

        const userid = "";
        console.debug("deleting: " + subscriptionid);
        const message_body = '{ "subscriptionid":"' + subscriptionid + '" }';
        //console.debug(message_body);
        const installationUniqueId = (await chrome.storage.local.get([plugin_uuid_header_name]))[plugin_uuid_header_name];

        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        

        console.debug(installationUniqueId);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(server_url + URI_plugin_user_delete_subscription, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
                    [plugin_session_header_name]: session[plugin_session_header_name],
                },
                body: message_body // example IDs, replace as necessary
            });
        console.debug(response);
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
async function approveSubscription(subscriptionid) {
    console.debug("approveSubscription: " + subscriptionid);
    try {

        const userid = "";
        console.debug("deleting: " + subscriptionid);
        const message_body = '{ "subscriptionid":"' + subscriptionid + '", "application_status": "MANUALLY_APPROVED" }';
        //console.debug(message_body);
        const installationUniqueId = (await chrome.storage.local.get([plugin_uuid_header_name]))[plugin_uuid_header_name];

        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        

        console.debug(installationUniqueId);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(server_url + URI_plugin_user_set_subscription_application_status, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
                    [plugin_session_header_name]: session[plugin_session_header_name],
                },
                body: message_body // example IDs, replace as necessary
            });
        console.debug(response);
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

// seto event handler for sorting and filtering
setupTableFilteringAndSorting("subscribersTable");

/**
 * Navigate to the page where the note is attached
 *
 * Include all note information in the message
 * @param {*} url
 */
async function goThere(noteid, url, distributionlistid, datarow) {
    try {

        console.debug("go to url: " + url);
        console.debug("go lookup noteid: " + noteid);

        // issue a http redirect to open the URL in another browser tab
        //window.open(url, '_blank').focus();
        // add functionality to scroll to the note in question
        // invoke the background script to scroll to the note in question
        chrome.runtime.sendMessage({
            message: {
                action: "scroll_to_note",
                scroll_to_note_details: {
                    noteid: noteid,
                    url: url,
                    datarow: datarow

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



// Sort states for each column
const sortStates = {
    0: 'none', // None -> Ascending -> Descending -> None -> ...
    1: 'none'
};


function filterTable_a() {
    //  console.debug("filterTable_a " );

    filterTable(event.target);
}


// Fetch data on page load


var valid_noteid_regexp = /^[a-zA-Z0-9\-\.\_]{20,100}$/;

// Function to use "fetch" to re-activate a data agreement
async function setSubscriptionActiveStatusByUUID(subscriptionid, activestatus) {
    console.debug("setSubscriptionActiveStatusByUUID: " + subscriptionid + " status: " + activestatus);
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const userid = "";
        const message_body = JSON.stringify({
                subscriptionid: subscriptionid,
                active_status: activestatus,
            });
        //console.debug(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_set_subscription_active_status, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
                    [plugin_session_header_name]: session[plugin_session_header_name],
                },
                body: message_body, // example IDs, replace as necessary
            });
        //console.debug(response);
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


async function DELETEfetchSubscribers(distributionlistid) {
    console.debug("fetchSubscribers for distributionlistid: " + distributionlistid);

    var ynInstallationUniqueId = "";
    var xYellownotesSession = "";

    let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
    let session = await chrome.storage.local.get([plugin_session_header_name]);

    ynInstallationUniqueId = plugin_uuid[plugin_uuid_header_name];
    xYellownotesSession = session[plugin_session_header_name];

    var msg = {
        distributionlistid: distributionlistid
    };
    if (distributionlistid == null) {
        msg = {};
    }
    const response = await fetch(server_url + "/api/v1.0/plugin_user_get_my_feed_subscribers", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [plugin_uuid_header_name]: ynInstallationUniqueId,
                [plugin_session_header_name]: xYellownotesSession,
            },
            body: JSON.stringify(msg)
        });

    if (!response.ok) {
        return (new Error('Network response was not ok'));
    } else {

        const data = await response.json();
        // Parse JSON data

        console.debug(data);

        var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
        console.debug(utc);
        console.debug(Date.now());
        var now = new Date;
        var utc_timestamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
                now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
        console.debug(utc_timestamp);
        console.debug(new Date().toISOString());

        // Get table body element
        const tableBody = document.getElementById('subscribersTable').getElementsByTagName('tbody')[0];

        // Loop through data and populate the table
        data.forEach(row => {
            console.debug(row);
            console.debug(JSON.stringify(row));
            console.debug(row.subscriptionid);

            // Create new row
            const newRow = tableBody.insertRow();
            newRow.setAttribute('subscriptionid', row.subscriptionid);
            newRow.setAttribute('selectablecol', "true");
            // Create cells and populate them with data

            const cell_displayname = newRow.insertCell(0);
            const cell_email = newRow.insertCell(1);
            const cell_subscribedate = newRow.insertCell(2);
            const cell_active = newRow.insertCell(3);
            const cell_status = newRow.insertCell(4);
            const cell_distributionlistname = newRow.insertCell(5);
            const cell_buttons = newRow.insertCell(5);
            // do not include a option for notes in this release

            try {
                cell_email.textContent = row.email;
                cell_email.setAttribute('name', 'email');
                cell_email.setAttribute('class', 'email');
            } catch (e) {
                console.debug(e);
            }

            // name
            try {
                cell_subscribedate.textContent = integerstring2timestamp(row.subscribedate);
                cell_subscribedate.setAttribute('name', 'subscribedate');
                cell_subscribedate.setAttribute('class', 'datetime');
            } catch (e) {
                console.debug(e);
            }

            try {
                cell_displayname.textContent = row.displayname;
                cell_displayname.setAttribute('name', 'displayname');
                cell_displayname.setAttribute('class', 'displayname');
            } catch (e) {
                console.debug(e);
            }

            // render a check box to enable/disable the note
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
                    //         await disable_note_with_noteid(row.noteid);
                    await setSubscriptionActiveStatusByUUID(row.subscriptionid, 1);
                } else {
                    await setSubscriptionActiveStatusByUUID(row.subscriptionid, 0);
                    //           await enable_note_with_noteid(row.noteid);
                }
            });
            cell_active.appendChild(suspendActButton);
            cell_active.setAttribute('class', 'checkbox');

            try {
                cell_status.textContent = row.status;
                cell_status.setAttribute('name', 'status');
                cell_status.setAttribute('class', 'status');
            } catch (e) {
                console.debug(e);
            }

            // buttons
            // Add delete button
            /*
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = function () {
            // Remove the row from the table
            newRow.remove();
            // call to API to delete row from data base
            deleteDataRow(row.uuid);
            };
            cell_buttons.appendChild(deleteButton);
             */
            // Add location "go there" button

            // Add remove button
            const removeButton = document.createElement("button");
            removeButton.textContent = "delete";
            removeButton.classList.add("deleteBtn");
            removeButton.onclick = function () {
                // call to API to save row to data base
                deleteSubscription(row.subscriptionid);
            };

            cell_buttons.appendChild(removeButton);

  // Add approve button
  const approveButton = document.createElement("button");
  approveButton.textContent = "approve";
  approveButton.classList.add("approveBtn");
  approveButton.onclick = function () {
      // call to API to save row to data base
      approveSubscription(row.subscriptionid);
  };

  cell_buttons.appendChild(approveButton);


        });
    }
}

// start populating data tables

//traverse_text(document.documentElement);
console.debug("################################################");
//console.debug(all_page_text);
//console.debug(textnode_map);
