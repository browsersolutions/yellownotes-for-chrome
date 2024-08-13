


const browser_id = chrome.runtime.id;


const table_name ="subscriptionsTable";

// check if the user is authenticated
checkSessionJWTValidity()
  .then(isValid => {
      console.debug('JWT is valid:', isValid);
if (isValid){
    console.debug("JWT is valid - show menu accordingly");
    fetchAndDisplayStaticContent("../fragments/en_US/my_subscriptions_header_authenticated.html", "my_subscriptions_page_main_text", {}).then(() => {});
    fetchAndDisplayStaticContent("../fragments/en_US/my_subscriptions_new_subscription.html", "add_subscription_form", {}).then(() => {});


    const uuid = localStorage.getItem("creatorid");
    const replacements = {creatorid: uuid};
    fetchAndDisplayStaticContent("../fragments/en_US/sidebar_fragment_authenticated.html", "sidebar", replacements).then(() => {
        //page_display_login_status();
            // login_logout_action();
        });
        fetchAndDisplayStaticContent("../fragments/en_US/my_subscriptions_new_subscription.html", "add_subscription_form", {}).then(() => {});

    
      page_display_login_status();
}else{
    console.debug("JWT is not valid - show menu accordingly");
    fetchAndDisplayStaticContent("../fragments/en_US/my_subscriptions_header_unauthenticated.html", "my_subscriptions_page_main_text", {}).then(() => {});

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

// hide the form to add more subscriptions (unhide when the user requests it)
document.getElementById("add_subscription_form").style.display = "none";


  const table_columns_to_not_display_keyname = table_name+"_hide_columns";

  
// store in local the sorting and columns that the user has selected to sort on
const table_columns_sort_array_keyname = table_name + "_sort_columns";

// store in local the filters and columns that the user has selected to filter on
const table_columns_filter_array_keyname = table_name + "_filer_columns";

const column_list =  ["name", "description",  "subscribedate", "creatordisplayname", "active", "postcount", "status", "actions" ];


// attach event listeners to the column toggle checkboxes
  // which columns to display
  // The users can decide which columns to display by ticking and unticking the checkboxes on a list of column names
addEventColumnToggleListeners(column_list, table_name);



// setup table items for sorting and filtering
setupTableFilteringAndSorting(table_name);


  // set table visibility defaults
  // make this sensitive to the size screen the user is using
  
  var not_show_by_default_columns = [];
  
  // check if not_show_by_default_columns has been set 
  const pagewidth = window.innerWidth;
  console.log("window.innerWidth: " + pagewidth);


  if (pagewidth < 200) { 
    not_show_by_default_columns = ["name", "description",  "subscribedate", "creatordisplayname", "active", "postcount", "status", "actions" ];
  }else if (pagewidth < 300) { 
    not_show_by_default_columns = ["name", "description", "subscribedate", "creatordisplayname", "active", "postcount", "status", "actions" ];
  }else if (pagewidth < 600) {
    not_show_by_default_columns = ["name", "description",  "subscribedate", "creatordisplayname", "active", "postcount", "status", "actions" ];

  }else if (pagewidth < 1000) {
    not_show_by_default_columns = ["name", "description", "subscribedate", "creatordisplayname", "active", "postcount", "status", "actions" ];
  } else if (pagewidth < 1200) {
      not_show_by_default_columns = [];
  }
  
  
  
  // check if the columns suppression has been set in memory, if not set it to the default, otherwise use the stored value
  getNotShowByDefaultColumns_asynch(table_columns_to_not_display_keyname, not_show_by_default_columns).then(columns => {
      not_show_by_default_columns = columns;
      console.log(not_show_by_default_columns);
  }).catch(error => {
      console.error('Error:', error);
  });
  
  

//const url = window.location.href.trim();
//console.log(url);
//console.log(url.replace(/.*add_feedid=/, ""));
// accept the submitted value for the distribution list id
// the API has security mechanism in place the screen the value for undesirable content
try {
    if (getQueryStringParameter("add_feedid")) {
        console.debug("add_feedid parameter found ");

        addSubscriptionByUUIDinBackground(getQueryStringParameter("add_feedid")).then(function (data) {

            // it a post action URL has been prescribed using the querystring parameter "redirecturi", then redirect to that URL now
            uri = getQueryStringParameter("redirecturi");
            console.debug("redirect to ", uri);
            if (uri) {
                // Redirect to a new URL - do not present a page
                window.location.href = uri;
            } else {
                // no redirect URL has been prescribed, so present the page
                render_page(table_name);
            }
        }).catch(function (error) {
            console.error(error);
        }
        );
    }else{
        uri = getQueryStringParameter("redirecturi");
        console.debug("redirect to ", uri);
        if (uri) {
            // Redirect to a new URL - do not present a page
            window.location.href = uri;
        } else {
            // no redirect URL has been prescribed, so present the page
            render_page(table_name);
        }
    }
} catch (e) {
    console.error(e);
}



// call to database to get notes and place them in a table
//console.debug("calling fetchData");
//fetchData(not_show_by_default_columns)
//.then(function (d) {
//    console.log("toggle columns off by default");
//    console.log(not_show_by_default_columns);
//    not_show_by_default_columns.forEach(column => {
//        toggleColumn(column, false, "distributionsTable" , table_columns_to_not_display_keyname);
//        document.getElementById(`toggle-${column}`).checked = false;
//    });

//    });



// Function to use "fetch" to delete a data row
async function deleteDataRowByDistributionlistId(distributionlistid) {
    console.debug("deleteDataRowByDistributionlistId");
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const userid = "";
        const message_body = JSON.stringify({
                distributionlistid: distributionlistid,
            }, );
        console.debug(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_delete_distribution_list, {
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

        // Parse JSON data
        const data = await response.json();
    } catch (error) {
        console.error(error);
    }
}

// Function to use "fetch" to delete a data row
async function updateDataRowByUUID(distributionlistid) {
    console.debug("updateDataRowByUUID (" + distributionlistid + ")");
    try {

        const row = document.querySelector('tr[distributionlistid="' + distributionlistid + '"]');
        console.debug(row);
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const userid = "";

        const message_body = {
            distributionlistid: distributionlistid,
            name: row.querySelector('[name="name"').textContent,
            description: row.querySelector('[name="description"').textContent,
            visibility: row.querySelector('[name="visibility"]').querySelector("select").value

        };

        console.debug(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_update_own_distributionlist, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
                    [plugin_session_header_name]: session[plugin_session_header_name],
                },
                body: JSON.stringify(message_body), // example IDs, replace as necessary
            });
        //console.debug(response);
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

// Function to use "fetch" to suspend a subscription
async function deleteSubscriptionBySubscriptionid(subscriptionid) {
    console.debug("deleteSubscriptionByUUID (" + subscriptionid + ")");
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const userid = "";
        const message_body = JSON.stringify({
                subscriptionid: subscriptionid
            });
        //console.debug(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_delete_subscription, {
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

// Function to use "fetch" to suspend a data agreement
async function viewDistributionlist(distributionlistid) {
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const userid = "";
        const message_body = JSON.stringify({
                distributionlistid: distributionlistid
            });
        //console.debug(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_get_distribution_list, {
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

        console.debug(data);
        console.debug(data[0]);

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
        cell1_2.textContent = data[0].name;
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
        //console.debug(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const subscribersresponse = await fetch(
                server_url + "/api/v1.0/plugin_user_get_distribution_list_subscribers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
                    [plugin_session_header_name]: session[plugin_session_header_name],
                },
                body: message_body2, // example IDs, replace as necessary
            });
        //console.debug(response);
        // Check for errors
        if (!subscribersresponse.ok) {
            throw new Error(`HTTP error! status: ${subscribersresponse.status}`);
        }
        // update the row in the table
        // Parse JSON data
        const subscribersdata = await subscribersresponse.json();

        console.debug(subscribersdata);

        // Append the table to the container
        container.appendChild(table);

        const sub_table = document.createElement("table");

        subscribersdata.forEach((row) => {
            console.debug(row);
            // Create new row
            const newRow = sub_table.insertRow();
            // Create cells and populate them with data
            const cell1 = newRow.insertCell(0);
            const cell2 = newRow.insertCell(1);
            const cell3 = newRow.insertCell(2);
            const cell4 = newRow.insertCell(3);
            cell1.textContent = row.subscriptionid;
            cell2.textContent = row.userid;
            cell3.textContent = row.subscribedate;

            // originator: how or by whom the user was added to the distribution list
            cell4.textContent = row.originatorid;

            // Add delete button
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "unsubscribe";
            deleteButton.classList.add("deleteBtn");
            deleteButton.onclick = function () {
                // Remove the row from the table
                newRow.remove();
                // call to API to delete row from data base
                deleteSubscriptionBySubscriptionid(row.subscriptionid);
            };

            const cell5 = newRow.insertCell(4);
            cell5.appendChild(deleteButton);

        });

        console.debug(sub_table);
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
async function activateByUUID(distributionlistid) {
    console.debug("activateByUUID " + distributionlistid);

    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const userid = "";
        const message_body = JSON.stringify({
                distributionlistid: distributionlistid,
                active: 1,
            });
        //console.debug(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_set_distributionlist_active_status, {
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

// Function to use "fetch" to re-activate a data agreement
async function deactivateByUUID(distributionlistid) {
    console.debug("deactivateByUUID" + distributionlistid);
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const userid = "";
        const message_body = JSON.stringify({
                distributionlistid: distributionlistid,
                active: 0,
            });
        //console.debug(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_set_distributionlist_active_status, {
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




// Function to use "fetch" to re-activate a data agreement
async function setAnonymousByUUID(distributionlistid, anonymous_allowed) {
    console.debug("setAnonymousByUUID" + distributionlistid, " anonymous_allowed: " + anonymous_allowed);
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
       
        const message_body = JSON.stringify({
                distributionlistid: distributionlistid,
                anonymous_allowed: anonymous_allowed,
            });
        //console.debug(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_set_distributionlist_anonymous_allowed_status, {
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




// Function to use "fetch" to suspend a data agreement
async function addSubscriptionByUUID(distributionlistid, feed_data) {
    console.debug("addSubscriptionByUUID.start");
    console.debug(distributionlistid);
    console.debug(feed_data);
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const userid = "";
        const message_body = JSON.stringify({
                distributionlistid: distributionlistid
            });
        //console.log(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_add_subscription_v10, {
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
        // update the row in the table of current subscriptions
        // Parse JSON data
        const data = await response.json();
        console.log(data);
        // Get table body element
        const tableBody = document
            .getElementById("dataTable")
            .getElementsByTagName("tbody")[0];

        console.log(tableBody);
        // add new row to table in the GUI to make the update appear immediate to the user
        // Create new row
        console.log("addSubscriptionTableRow");
        console.log(tableBody);
        console.log(feed_data);
        console.log(data);
        // copy a value that generated at the server and returned in the response to the API call that create the subscription
        feed_data.subscriptionid = data.subscriptionid;
        feed_data.subscribedate = data.subscribedate;
        // update the table of subscriptions
        addSubscriptionTableRow(tableBody, feed_data)

        // Start process to update all open tabs with new subscription
        //
        try {
            var message = {
                action: "activeateSubscriptionOnAllTabs",
                subscription_details: feed_data,
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

    } catch (error) {
        console.error(error);
    }
}



// Function to use "fetch" to re-activate a data agreement
async function setAutomaticByUUID(distributionlistid, automatic_enrolment) {
    console.debug("setAutomaticByUUID" + distributionlistid, " automatic_enrolment: " + automatic_enrolment);
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
       
        const message_body = JSON.stringify({
                distributionlistid: distributionlistid,
                automatic_enrolment: automatic_enrolment,
            });
        //console.debug(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_set_distributionlist_automatic_enrolment_status, {
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

// Function to suspend all data agreements (not already suspended)
async function suspendAll() {
    console.debug("suspendAll");
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
    console.debug("activateAll");
    try {}
    catch (e) {
        console.error(e);
    }
}


function render_page(table_name) {
    // Fetch data on current subscriptions on page-load
    fetchData(not_show_by_default_columns).then(function (d) {
       console.debug("read notes complete");
       console.debug(not_show_by_default_columns);
   
       // update the list of colmes and check/uncheck according to the list of columns to not display
   not_show_by_default_columns.forEach(column => {
       toggleColumn(column, false,table_name, table_columns_to_not_display_keyname);
       document.getElementById(`toggle-${column}`).checked = false;
   });
    });
   
          // attach event listeners to the buttons     
    try {
        document
        .getElementById("subscriptionsActivateAllButton")
        .addEventListener("click", async function () {
            activateAllSubscriptions();
        });
    } catch (e) {
        console.error(e);
    }
   
    try {
        document
        .getElementById("subscriptionsSuspendAllButton")
        .addEventListener("click", function () {
            deactivateAllSubscriptions();
        });
    } catch (e) {
        console.error(e);
    }
   
    try {
        document
        .getElementById("subscriptionsAddButton")
        .addEventListener("click", function () {
            add_subscription();
        });
    } catch (e) {
        console.error(e);
    }
   }
   
   

function fetchData(not_show_by_default_columns) {
    console.log("fetchData");
try {
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
            return fetch(server_url + URI_plugin_user_get_my_subscriptions, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    [plugin_uuid_header_name]: ynInstallationUniqueId,
                    [plugin_session_header_name]: xYellownotesSession,
                },
            });
        }).then(response => {
            if (!response.ok) {
                console.log(response);

                // if an invalid session token was sent, it should be removed from the local storage
                if (response.status == 401) {
                    // compare the response body with the string "Invalid session token" to determine if the session token is invalid
                    if(response.headers.get("session") == "DELETE_COOKIE"){
                            console.log("Session token is invalid, remove it from local storage.");
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
            console.debug(data);
           


            // Get table body element
            const tableBody = document.querySelector('table[name="'+table_name+'"]').getElementsByTagName('tbody')[0];
            // Loop through data and populate the table
            data.forEach(row => {
                console.log(row);
               
                // Create new row
                const newRow = tableBody.insertRow();
                newRow.setAttribute('subscriptionid', row.subscriptionid);
                newRow.setAttribute('subscriberuuid', row.subscriberuuid);
                newRow.setAttribute('distributionlistid', row.distributionlistid);
                newRow.setAttribute('creatorid', row.creatorid);
                newRow.setAttribute('selectablecol', "true");
                
                // Create cells and populate them with data
       
                const cell_name = newRow.insertCell(0);
                const cell_description = newRow.insertCell(1);
              
                const cell_active = newRow.insertCell(2);
                const cell_subscribedate = newRow.insertCell(3);
                const cell_creatordisplayname = newRow.insertCell(4);
                const cell_postcount = newRow.insertCell(5);
                const cell_active_status = newRow.insertCell(6);
                const cell_actions = newRow.insertCell(7);
               
                // key column - not to be displayed
                // create timestamp - not to be dsiplayed either
                try {
                     // name of subscription
                //contenteditable="true"
                //cell_name.textContent = row.name;
                
                cell_name.setAttribute('data-label', 'name');
                cell_name.setAttribute('name', 'name');
                cell_name.setAttribute('class', 'displayname');

                cell_name.innerHTML = '<a href="/pages/view_distributionlist.html?distributionlistid=' + row.distributionlistid + '">' + row.name + '</a>';


                } catch (e) {
                    console.log(e);
                }
                try {
                    console.log(row.subscribedate);
                    console.log(/2024/.test(row.subscribedate));
                    if (/2024/.test(row.subscribedate)) {
                        console.log("subscribedate is timestamp: " + row.subscribedate);
                        cell_subscribedate.textContent = timestampstring2timestamp(row.subscribedate);
                        cell_subscribedate.setAttribute('class', 'datetime');
                    } else {
                        console.log("subscribedate is integer: " + row.subscribedate)
                        cell_subscribedate.textContent = integerstring2timestamp(row.subscribedate);
                        cell_subscribedate.setAttribute('class', 'datetime');
                    }
                } catch (e) {
                    console.log(e);
                }

                try {
                    cell_creatordisplayname.textContent = row.creatordisplayname;
                    cell_creatordisplayname.setAttribute('name', 'creatordisplayname');
                } catch (e) {
                    console.log(e);
                }

                // render a check box to enable/disable the note
                const suspendActButton = document.createElement("span");
                if (row.active_status == 1) {
                    // active
                    suspendActButton.innerHTML =
                        '<label><input type="checkbox" class="checkbox" placeholder="Enter text" checked/><span></span></label>';
                } else {
                    // deactivated
                    suspendActButton.innerHTML =
                        '<label><input type="checkbox" class="checkbox" placeholder="Enter text" /><span></span></label>';
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
                cell_active.setAttribute('name', 'active');
                // where note is attached
                //contenteditable="true"
                cell_postcount.textContent = row.postcount;
                cell_postcount.setAttribute('data-label', 'postcount');
                cell_postcount.setAttribute('name', 'postcount');
                cell_postcount.setAttribute('class', 'url');

                cell_active_status.textContent = row.active_status;
                cell_active_status.setAttribute('data-label', 'text');
                cell_active_status.setAttribute('name', 'status');
                cell_active_status.setAttribute('class', 'compact');

                cell_description.textContent = row.description;
                cell_description.setAttribute('data-label', 'text');
                cell_description.setAttribute('name', 'description');
                cell_description.setAttribute('class', 'text');

                // create small table to contain the action buttons

                // Add button container
                const actionButtonContainer = document.createElement('div');
                actionButtonContainer.setAttribute('class', 'button-container');

                // Add delete button
                const deleteButtonContainer = document.createElement('div');
                deleteButtonContainer.setAttribute('class', 'table_row_actions_button');
                const deleteButton = document.createElement('img');
                deleteButton.src = "../icons/trash-can.transparent.40x40.png";
                deleteButton.alt = 'delete';
                deleteButton.setAttribute('class', 'table_row_actions_button');
                deleteButton.onclick = function () {
                    // Remove the row from the table
                    newRow.remove();
                    // call to API to delete subscription from data base
                    deleteSubscriptionBySubscriptionid(row.subscriptionid);
                };
                deleteButtonContainer.appendChild(deleteButton);
                actionButtonContainer.appendChild(deleteButtonContainer);

                // Add view button


     const viewButtonContainer = document.createElement('div');
     viewButtonContainer.setAttribute('class', 'view_button');
     const viewButton = document.createElement('img');
     viewButton.src = "../icons/magnifying-glass.40.png";
     viewButton.alt = 'view';
     viewButton.setAttribute('class', 'table_row_actions_button');
     viewButton.onclick = function (event) {

         console.debug(event.target.parentNode);
         console.debug(event.target.parentNode.parentNode);
         console.debug(event.target.parentNode.parentNode.firstChild.textContent);

         // call to API to save changes to data base
         saveChanges(row.noteid, event);
     };
     viewButtonContainer.appendChild(viewButton);
     actionButtonContainer.appendChild(viewButtonContainer);
              

                

                

                // add enable/disable button (redundant with the checkbox above)
                const ableButton = document.createElement('button');

                if (row.active == "1" || row.active == 1) {
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
               


                // Adding data-label for mobile responsive
                cell_name.setAttribute('data-label', 'createtime');
                //cell_createtime.setAttribute('class', 'timestamp');
                cell_subscribedate.setAttribute('data-label', 'lastmodfiedtime');
                //cell_lastmodified.setAttribute('class', 'timestamp');

            });
            resolve('Data saved OK');
        });
    });
}catch (error) {
    console.error(error);
}
}


// Function to use "fetch" to re-activate a data agreement
async function setSubscriptionActiveStatusByUUID(subscriptionid, status) {
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        
        const message_body = JSON.stringify({
                subscriptionid: subscriptionid,
                active_status: status,
            });
        //console.log(message_body);
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


function DELETE2fetchData(not_show_by_default_columns) {
    console.debug("fetchData.start");
    console.debug(not_show_by_default_columns);
    return new Promise(
        function (resolve, reject) {
        var ynInstallationUniqueId = "";
        var xYellownotesSession = "";
        var distributionlists;
        var data;
        //const installationUniqueId = (await chrome.storage.local.get([plugin_uuid_header_name]))[plugin_uuid_header_name];
        console.debug("request: get_my_distribution_lists");
        // if update is to disable the note, remove it from the in-memory store
        const cacheKey = URI_plugin_user_get_my_distribution_lists.replace(/\//g, "_");
        //const cacheKey = "cacheKey0002";

        console.debug("Cache key: " + cacheKey);
        const currentTime = Date.now();

        console.debug("currentTime: " + currentTime);
        const cachetimeout = 60;
        const endpoint = server_url + URI_plugin_user_get_my_distribution_lists;
        const protocol = "GET";

        // Accept data from cache if it is less than 60 seconds old
        // Make changes to this timeout when there is a procedure to empty the cache if the value has been updated.
        console.debug("calling cachableCall2API_GET" );
        cachableCall2API_GET(cacheKey, cachetimeout, protocol, endpoint)
        .then(function (data) {
           
            console.log(data);

            var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
            console.log(utc);
            console.log(Date.now());
            var now = new Date;
            var utc_timestamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
                    now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
            console.log(utc_timestamp);
            console.log(new Date().toISOString());
            console.debug(data);
            // Get table body element
            const tableBody = document
                .querySelector('table[name="distributionsTable"]')
                .getElementsByTagName("tbody")[0];
    
            console.debug(tableBody);
            // loop through the existing table and delete all rowsnewTableRow2
            console.debug(tableBody.rows);
            console.debug(tableBody.rows.length);
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
            data.forEach(rowData => {
                // Create new row
                console.debug(rowData);
                const newRow = tableBody.insertRow();
                newRow.setAttribute("distributionlistid", rowData.distributionlistid);
                newRow.setAttribute('selectablecol', "true");
                // Create cells and populate them with data
                const cell_name = newRow.insertCell(0);
                const cell_desc = newRow.insertCell(1);
                const cell_visibility = newRow.insertCell(2);
                const cell_restrictions = newRow.insertCell(3);
                const cell_postcount = newRow.insertCell(4);
                const cell_subscribercount = newRow.insertCell(5);
                const cell_createtime = newRow.insertCell(6);
                const cell_status = newRow.insertCell(7);
                const cell_anonymous = newRow.insertCell(8);
                const cell_automatic = newRow.insertCell(9);
                const cell_actions = newRow.insertCell(10);
            
            // name
                cell_name.textContent = rowData.name;
                cell_name.setAttribute("name", "name");
                cell_name.setAttribute("class", "displayname");
                cell_name.setAttribute("contenteditable", "true");
                if (not_show_by_default_columns.includes("name")) {
                    cell_visibility.classList.add('hidden');

                }

            // description
                cell_desc.textContent = rowData.description;
                cell_desc.setAttribute("name", "description");
                cell_desc.setAttribute("contenteditable", "true");
                cell_desc.setAttribute("class", "displayname");
                if (not_show_by_default_columns.includes("description")) {
                    cell_visibility.classList.add('hidden');

                }
            
                // Create a dropdown for the visibility
                const visibilityDropdown = document.createElement('select');
                const options = ['PUBLIC', 'PRIVATE', 'INCOGNITO'];
            
                options.forEach(optionValue => {
                    const option = document.createElement('option');
                    option.value = optionValue;
                    option.textContent = optionValue;
                    visibilityDropdown.appendChild(option);
                });
            
                // Set the selected value
                visibilityDropdown.value = rowData.visibility || 'PUBLIC';
            

                // Add dropdown to the table cell
                //const visibilityCell = newRow.insertCell(5);
                cell_visibility.appendChild(visibilityDropdown);
                cell_visibility.setAttribute("name", "visibility");
                cell_visibility.setAttribute("class", "compact");
                if (not_show_by_default_columns.includes("visibility")) {
                    cell_visibility.classList.add('hidden');

                }

            // restrictions
                cell_restrictions.textContent = rowData.restrictions;
                cell_postcount.setAttribute("class", "text");
            
                if (not_show_by_default_columns.includes("restrictions")) {
                    cell_subscribercount.classList.add('hidden');
            
                }

                // post count
                cell_postcount.textContent = rowData.postcount;
                cell_postcount.setAttribute("class", "compact");
                if (not_show_by_default_columns.includes("postcount")) {
                    cell_subscribercount.classList.add('hidden');
            
                }
            // subscriber count
                cell_subscribercount.textContent = rowData.subscriberscount;
                cell_subscribercount.setAttribute("class", "compact");

                if (not_show_by_default_columns.includes("subscriberscount")) {
                    cell_subscribercount.classList.add('hidden');
            
                }

                // time of creation
                cell_createtime.setAttribute("value", "createdtime");
                cell_createtime.setAttribute("class", "datetime");
                console.debug(rowData.createdtime);
                cell_createtime.textContent = reformatTimestamp(rowData.createdtime);
                if (not_show_by_default_columns.includes("created")) {
                    cell_createtime.classList.add('hidden');
            
                }

    //Suspend/Active check switch
    const suspendActButton = document.createElement("span");
    if (rowData.active == 1) {
        // active
        suspendActButton.innerHTML =
            '<label><input type="checkbox" placeholder="active" checked/><span></span></label>';
    } else {
        // deactivated
        suspendActButton.innerHTML =
            '<label><input type="checkbox" placeholder="active" /><span></span></label>';
    }

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
    suspendActButton.addEventListener("change", async (e) => {
        if (e.target.checked) {
            await activateByUUID(rowData.distributionlistid);
        } else {
            await deactivateByUUID(rowData.distributionlistid);
        }
    });
    cell_status.appendChild(suspendActButton);
    cell_status.setAttribute("class", "checkbox");
    if (not_show_by_default_columns.includes("active")) {
        cell_status.classList.add('hidden');

    }


 //anonymous enrolment check switch
 const anonActButton = document.createElement("span");
 if (rowData.anonymous_allowed == 1) {
     // active
     anonActButton.innerHTML =
         '<label><input type="checkbox" placeholder="active" checked/><span></span></label>';
 } else {
     // deactivated
     anonActButton.innerHTML =
         '<label><input type="checkbox" placeholder="active" /><span></span></label>';
 }

 const anonInputElement = anonActButton.querySelector("input");
 if (anonInputElement) {
    anonInputElement.classList.add("input-class");
 }

 const anonLabelElement = anonActButton.querySelector("label");
 if (anonLabelElement) {
    anonLabelElement.classList.add("switch");
 }
 const anonSpanElement = anonActButton.querySelector("span");
 if (anonSpanElement) {
    anonSpanElement.classList.add("slider");
 }
 anonActButton.addEventListener("change", async (e) => {
     if (e.target.checked) {
         await setAnonymousByUUID(rowData.distributionlistid, 1);
     } else {
         await setAnonymousByUUID(rowData.distributionlistid, 0);
     }
 });
 cell_anonymous.appendChild(anonActButton);
 cell_anonymous.setAttribute("class", "checkbox");

//

 //automatic enrolment check switch
 const autoActButton = document.createElement("span");
 if (rowData.automatic_allowed == 1) {
     // active
     autoActButton.innerHTML =
         '<label><input type="checkbox" placeholder="active" checked/><span></span></label>';
 } else {
     // deactivated
     autoActButton.innerHTML =
         '<label><input type="checkbox" placeholder="active" /><span></span></label>';
 }

 const autoInputElement = autoActButton.querySelector("input");
 if (autoInputElement) {
    autoInputElement.classList.add("input-class");
 }

 const autoLabelElement = autoActButton.querySelector("label");
 if (autoLabelElement) {
    autoLabelElement.classList.add("switch");
 }
 const autoSpanElement = autoActButton.querySelector("span");
 if (autoSpanElement) {
    autoSpanElement.classList.add("slider");
 }
 autoActButton.addEventListener("change", async (e) => {
     if (e.target.checked) {
         await setAutomaticByUUID(rowData.distributionlistid, 1);
     } else {
         await setAutomaticByUUID(rowData.distributionlistid, 0);
     }
 });
 cell_automatic.appendChild(autoActButton);
 cell_automatic.setAttribute("class", "checkbox");



    //
    // action buttons
    //
    // Add delete button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("deleteBtn");
    deleteButton.onclick = function () {
        // Remove the row from the table
        newRow.remove();
        // call to API to delete row from data base
        deleteDataRowByDistributionlistId(rowData.distributionlistid);
    };

    // Add View Notes button
    //const viewNotesButton = document.createElement("button");
    //viewNotesButton.textContent = "View";
    //viewNotesButton.classList.add("viewBtn");
   // viewNotesButton.onclick = function () {
        // call to API to delete row from data base
   //     viewDistributionlist(rowData.distributionlistid);
   // };

    const viewNotesButton = document.createElement("a");
    viewNotesButton.classList.add("viewBtn");
//viewNotesButton.innerHTML =  '<a href="/api/v1.0/plugin_user_get_all_distributionlist_notes?distributionlistid' + rowData.distributionlistid + '"><button>View</button></a>' 

    viewNotesButton.innerHTML =  '<a href="/pages/view_own_distributionlist.html?distributionlistid=' + rowData.distributionlistid + '"><button>Notes</button></a>' 

        // Add View subscribers button
    //const viewNotesButton = document.createElement("button");
    //viewNotesButton.textContent = "View";
    //viewNotesButton.classList.add("viewBtn");
   // viewNotesButton.onclick = function () {
        // call to API to delete row from data base
   //     viewDistributionlist(rowData.distributionlistid);
   // };

   const viewSubscribersButton = document.createElement("a");
   viewSubscribersButton.classList.add("viewBtn");
//viewNotesButton.innerHTML =  '<a href="/api/v1.0/plugin_user_get_all_distributionlist_notes?distributionlistid' + rowData.distributionlistid + '"><button>View</button></a>' 

    viewSubscribersButton.innerHTML =  '<a href="/pages/view_own_subscribers.html?distributionlistid=' + rowData.distributionlistid + '"><button>Subscribers</button></a>' 

    // Add save button
    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.classList.add("deleteBtn");
    saveButton.onclick = function () {
        // call to API to save row to data base
        updateDataRowByUUID(rowData.distributionlistid);
    };

    // Add create invite button
    const createInviteButton = document.createElement("button");

   // title="Click to copy the invitation URL to your clipboard"
    createInviteButton.title = "Click to create an invition to subscribe link, and copy it to the clipboard";
    createInviteButton.textContent = "Invite";
    createInviteButton.classList.add("deleteBtn");
    createInviteButton.onclick = function () {
        // call to API to save row to data base
        createOpenInvitation(rowData.distributionlistid);
    };



    cell_actions.appendChild(viewNotesButton);
    cell_actions.appendChild(viewSubscribersButton);
    cell_actions.appendChild(deleteButton);
    cell_actions.appendChild(saveButton);
    cell_actions.appendChild(createInviteButton);
    cell_actions.setAttribute("class", "action-5");


            });

           
            resolve('Data saved OK');
        });
    });
}

// Function to fetch data and populate the table
async function DELETEfetchData(not_show_by_default_columns) {
    console.debug("fetchData ");
    console.debug(not_show_by_default_columns);
    try {


        
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);

        // Fetch data from web service (replace with your actual API endpoint)

        const headers = {
            "Content-Type": "application/json",
            [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
            [plugin_session_header_name]: session[plugin_session_header_name],
        };
        //const body = JSON.stringify(payload);

        const response = await fetch(
                server_url + URI_plugin_user_get_my_distribution_lists, {
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
        //    console.debug(response);


        var utc = new Date().toJSON().slice(0, 10).replace(/-/g, "/");
        console.debug(utc);
        console.debug(Date.now());
        var now = new Date();
        var utc_timestamp = Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate(),
                now.getUTCHours(),
                now.getUTCMinutes(),
                now.getUTCSeconds(),
                now.getUTCMilliseconds());
        console.debug(utc_timestamp);
        console.debug(new Date().toISOString());

        // Parse JSON data
        const data = await response.json();
        console.debug(data);
        // Get table body element
        const tableBody = document
            .querySelector('table[name="distributionsTable"]')
            .getElementsByTagName("tbody")[0];

        console.debug(tableBody);
        // loop through the existing table and delete all rowsnewTableRow2
        console.debug(tableBody.rows);
        console.debug(tableBody.rows.length);
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
            newTableRow2(tableBody, row);
        });
    } catch (error) {
        console.error(error);
    }
}

function DELETEnewTableRow2(tableBody, rowData) {
    console.debug("newTableRow2.start");
    console.debug(tableBody);
    console.debug(rowData);
    const newRow = tableBody.insertRow();
    newRow.setAttribute("distributionlistid", rowData.distributionlistid);
    // Create cells and populate them with data
    const cell_name = newRow.insertCell(0);
    const cell_desc = newRow.insertCell(1);
    const cell_visibility = newRow.insertCell(2);
    const cell_restrictions = newRow.insertCell(3);
    const cell_postcount = newRow.insertCell(4);
    const cell_subscribercount = newRow.insertCell(5);
    const cell_createtime = newRow.insertCell(6);
    const cell_status = newRow.insertCell(7);
    const cell_anonymous = newRow.insertCell(8);
    const cell_automatic = newRow.insertCell(9);
    const cell_actions = newRow.insertCell(10);


    cell_name.textContent = rowData.name;
    cell_name.setAttribute("name", "name");
    cell_name.setAttribute("class", "displayname");
    cell_name.setAttribute("contenteditable", "true");

    cell_desc.textContent = rowData.description;
    cell_desc.setAttribute("name", "description");
    cell_desc.setAttribute("contenteditable", "true");


    // Create a dropdown for the visibility
    const visibilityDropdown = document.createElement('select');
    const options = ['PUBLIC', 'PRIVATE', 'INCOGNITO'];

    options.forEach(optionValue => {
        const option = document.createElement('option');
        option.value = optionValue;
        option.textContent = optionValue;
        visibilityDropdown.appendChild(option);
    });

    // Set the selected value
    visibilityDropdown.value = rowData.visibility || 'PUBLIC';

    // Add dropdown to the table cell
    //const visibilityCell = newRow.insertCell(5);
    cell_visibility.appendChild(visibilityDropdown);
    cell_visibility.setAttribute("name", "visibility");

    cell_restrictions.textContent = rowData.restrictions;

    cell_postcount.textContent = rowData.postcount;
    cell_postcount.setAttribute("class", "count");


    cell_subscribercount.textContent = rowData.subscriberscount;
    cell_subscribercount.setAttribute("class", "count");
    // set the genuine value of the field in an attribute
    cell_createtime.setAttribute("value", "createdtime");
    cell_createtime.setAttribute("class", "datetime");
    console.debug(rowData.createdtime);
    cell_createtime.textContent = reformatTimestamp(rowData.createdtime);


    //Suspend/Active check switch
    const suspendActButton = document.createElement("span");
    if (rowData.active == 1) {
        // active
        suspendActButton.innerHTML =
            '<label><input type="checkbox" placeholder="active" checked/><span></span></label>';
    } else {
        // deactivated
        suspendActButton.innerHTML =
            '<label><input type="checkbox" placeholder="active" /><span></span></label>';
    }

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
    suspendActButton.addEventListener("change", async (e) => {
        if (e.target.checked) {
            await activateByUUID(rowData.distributionlistid);
        } else {
            await deactivateByUUID(rowData.distributionlistid);
        }
    });
    cell_status.appendChild(suspendActButton);
    cell_status.setAttribute("class", "checkbox");



 //anonymous enrolment check switch
 const anonActButton = document.createElement("span");
 if (rowData.anonymous_allowed == 1) {
     // active
     anonActButton.innerHTML =
         '<label><input type="checkbox" placeholder="active" checked/><span></span></label>';
 } else {
     // deactivated
     anonActButton.innerHTML =
         '<label><input type="checkbox" placeholder="active" /><span></span></label>';
 }

 const anonInputElement = anonActButton.querySelector("input");
 if (anonInputElement) {
    anonInputElement.classList.add("input-class");
 }

 const anonLabelElement = anonActButton.querySelector("label");
 if (anonLabelElement) {
    anonLabelElement.classList.add("switch");
 }
 const anonSpanElement = anonActButton.querySelector("span");
 if (anonSpanElement) {
    anonSpanElement.classList.add("slider");
 }
 anonActButton.addEventListener("change", async (e) => {
     if (e.target.checked) {
         await setAnonymousByUUID(rowData.distributionlistid, 1);
     } else {
         await setAnonymousByUUID(rowData.distributionlistid, 0);
     }
 });
 cell_anonymous.appendChild(anonActButton);
 cell_anonymous.setAttribute("class", "checkbox");

//

 //automatic enrolment check switch
 const autoActButton = document.createElement("span");
 if (rowData.automatic_allowed == 1) {
     // active
     autoActButton.innerHTML =
         '<label><input type="checkbox" placeholder="active" checked/><span></span></label>';
 } else {
     // deactivated
     autoActButton.innerHTML =
         '<label><input type="checkbox" placeholder="active" /><span></span></label>';
 }

 const autoInputElement = autoActButton.querySelector("input");
 if (autoInputElement) {
    autoInputElement.classList.add("input-class");
 }

 const autoLabelElement = autoActButton.querySelector("label");
 if (autoLabelElement) {
    autoLabelElement.classList.add("switch");
 }
 const autoSpanElement = autoActButton.querySelector("span");
 if (autoSpanElement) {
    autoSpanElement.classList.add("slider");
 }
 autoActButton.addEventListener("change", async (e) => {
     if (e.target.checked) {
         await setAutomaticByUUID(rowData.distributionlistid, 1);
     } else {
         await setAutomaticByUUID(rowData.distributionlistid, 0);
     }
 });
 cell_automatic.appendChild(autoActButton);
 cell_automatic.setAttribute("class", "checkbox");



    //
    // action buttons
    //
    // Add delete button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("deleteBtn");
    deleteButton.onclick = function () {
        // Remove the row from the table
        newRow.remove();
        // call to API to delete row from data base
        deleteDataRowByDistributionlistId(rowData.distributionlistid);
    };

    // Add View Notes button
    //const viewNotesButton = document.createElement("button");
    //viewNotesButton.textContent = "View";
    //viewNotesButton.classList.add("viewBtn");
   // viewNotesButton.onclick = function () {
        // call to API to delete row from data base
   //     viewDistributionlist(rowData.distributionlistid);
   // };

    const viewNotesButton = document.createElement("a");
    viewNotesButton.classList.add("viewBtn");
//viewNotesButton.innerHTML =  '<a href="/api/v1.0/plugin_user_get_all_distributionlist_notes?distributionlistid' + rowData.distributionlistid + '"><button>View</button></a>' 

    viewNotesButton.innerHTML =  '<a href="/pages/view_own_distributionlist.html?distributionlistid=' + rowData.distributionlistid + '"><button>Notes</button></a>' 

        // Add View subscribers button
    //const viewNotesButton = document.createElement("button");
    //viewNotesButton.textContent = "View";
    //viewNotesButton.classList.add("viewBtn");
   // viewNotesButton.onclick = function () {
        // call to API to delete row from data base
   //     viewDistributionlist(rowData.distributionlistid);
   // };

   const viewSubscribersButton = document.createElement("a");
   viewSubscribersButton.classList.add("viewBtn");
//viewNotesButton.innerHTML =  '<a href="/api/v1.0/plugin_user_get_all_distributionlist_notes?distributionlistid' + rowData.distributionlistid + '"><button>View</button></a>' 

    viewSubscribersButton.innerHTML =  '<a href="/pages/view_own_subscribers.html?distributionlistid=' + rowData.distributionlistid + '"><button>Subscribers</button></a>' 

    // Add save button
    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.classList.add("deleteBtn");
    saveButton.onclick = function () {
        // call to API to save row to data base
        updateDataRowByUUID(rowData.distributionlistid);
    };

    // Add create invite button
    const createInviteButton = document.createElement("button");

   // title="Click to copy the invitation URL to your clipboard"
    createInviteButton.title = "Click to create an invition to subscribe link, and copy it to the clipboard";
    createInviteButton.textContent = "Invite";
    createInviteButton.classList.add("deleteBtn");
    createInviteButton.onclick = function () {
        // call to API to save row to data base
        createOpenInvitation(rowData.distributionlistid);
    };



    cell_actions.appendChild(viewNotesButton);
    cell_actions.appendChild(viewSubscribersButton);
    cell_actions.appendChild(deleteButton);
    cell_actions.appendChild(saveButton);
    cell_actions.appendChild(createInviteButton);
    cell_actions.setAttribute("class", "action-5");

    console.debug("newTableRow2.end");
    
}


// setup table items for sorting and filtering
setupTableFilteringAndSorting("distributionsTable");



// Sort states for each column
const sortStates = {
    0: "none", // None -> Ascending -> Descending -> None -> ...
    1: "none",
};


// create the URL that when clicked on adds the user to the distribution list
// append a redirecturi that redicts the the page showing the distribution list

function createOpenInvitation(distributionlistid) {
    console.debug("createOpenInvitation ("+distributionlistid+")");
    // create a small window/form to add a new distribution list


}


function prettyFormatTimestamp(timestamp) {
    const date = new Date(timestamp);
    //const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',  timeZoneName: 'short' };
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZoneName: 'short'
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
}


function filterTable_a() {
    //  console.debug("filterTable_a " );

    filterTable(event.target);
}

function filterTable(colheader) {
    const columnIndex = colheader.parentNode.getAttribute("colindex");
    //console.debug(colheader);
    console.debug("filter on col: " + columnIndex);
    //const input = colheader;
    const filter = colheader.value.toUpperCase();
    const table = document.getElementById("dataTable");
    const rows = table
        .getElementsByTagName("tbody")[0]
        .getElementsByTagName("tr");
    //console.debug("filter column:" + columnIndex);
    //console.debug("filter value:" + filter);

    for (let i = 0; i < rows.length; i++) {
        const cell = rows[i].getElementsByTagName("td")[columnIndex];
        //console.debug(cell);
        if (cell) {
            const content = cell.innerText || cell.textContent;
            if (new RegExp(filter, "i").test(content)) {
                //        console.debug("not sho");
                rows[i].style.display = "";
            } else {
                rows[i].style.display = "none";
            }
        }
    }
}

// Fetch data on page load
//fetchData();


document
.getElementById("distributionsActivateAllButton")
.addEventListener("click", async function () {
    activateAllDistributions();
});


document
.getElementById("distributionsSuspendAllButton")
.addEventListener("click", function () {
    deactivateAllDistributions();
});


document
.getElementById("distributionsAddButton")
.addEventListener("click", function () {
    add_distribution();
});


async function add_distribution() {
    console.debug("add_distribution");
    // create a small window/form to add a new distribution list

    var tableHTML = '<table class="formTable" border="1">';

    // Add table headers
    //  tableHTML += '<tr><th>Name</th><th>Age</th><th>City</th></tr>';

    // Add a few rows of sample data
    tableHTML += '<tr><td>Name</td><td class="editabletext" id="createdistributionname" contenteditable="true" style="border: 1px solid black;">Enter a name</td></tr>';
    tableHTML += '<tr><td>Description</td><td class="editabletext" id="createdistributiondescription" contenteditable="true" style="border: 1px solid black;">Enter a description</td></tr>';
    //tableHTML += '<tr><td>Visibility</td><td style="border: 1px solid black;">Enter a description</td></tr>';

    // Add new row with dropdown in the second cell
    tableHTML += '<tr>';
    tableHTML += '<td>Visibility of this feed: \nTo anyone ("PUBLIC") \nonly to subscribers("PRIVATE")</td>'; // First cell
    tableHTML += '<td style="border: 1px solid black;">'; // Start second cell
    tableHTML += '<select id="visibilityDropdown">>';
    tableHTML += '<option value="PUBLIC" selected>PUBLIC</option>';
    tableHTML += '<option value="PRIVATE">PRIVATE</option>';
    //tableHTML += '<option value="OPEN">OPEN</option>';
    tableHTML += '</select>';
    tableHTML += '</td>'; // End second cell
    tableHTML += '</tr>';

    // Close the table tag
    tableHTML += '</table>';

    // Insert the table into the 'form' element
    document.getElementById('form').innerHTML = tableHTML;

    document.getElementById('createdistributionname').addEventListener('click', function () {
        console.debug("click");
        if (this.textContent === 'Enter a name') {
            this.textContent = '';
        }
    });

    document.getElementById('createdistributiondescription').addEventListener('click', function () {
        if (this.textContent === 'Enter a description') {
            this.textContent = '';
        }
    });

    //document.addEventListener('DOMContentLoaded', function() {
    // Find the element where the table will be added
    const container = document.getElementById('form');

    // create button to send data on new distributionlist/feed to API
    const button = document.createElement('button');
    button.id = 'addform_button';
    button.setAttribute("style", "align: middle;");
    button.textContent = 'Submit';
    container.appendChild(button);
    console.debug(container);

    // Find the button and add an event listener
    const createDistributionlistButton = document.getElementById('addform_button');

    createDistributionlistButton.addEventListener('click', function () {
        console.debug("createDistributionlistButton clicked");
        // Extract data from table
        //const table = document.querySelector('#form table');
        console.debug(document.getElementById('form'));
        console.debug(document.getElementById('form').getElementsByTagName('table')[0]);
        const table = document.getElementById('form').getElementsByTagName('table')[0];
        console.debug(table);
        console.debug(table.rows[0]);
        // const id = table.rows[1].cells[1].textContent; // Get text from second cell of the first row
        // const name = table.rows[1].cells[1].textContent; // Get text from second cell of the first row

        //    const description = table.rows[2].cells[1].textContent; // Get text from second cell of the second row
        console.debug(document.getElementById('createdistributionname'));
        const name = document.getElementById('createdistributionname').textContent;

        //      const description = table.rows[2].cells[1].textContent; // Get text from second cell of the second row
        const description = document.getElementById('createdistributiondescription').textContent;

        const visibility = document.getElementById('visibilityDropdown').value; // Get text from second cell of the second row

        console.debug("name: " + name);
        console.debug("description: " + description);

        var ynInstallationUniqueId = "";
        var xYellownotesSession = "";

        if (name != "Enter a name" && description != "Enter a description") {

            chrome.storage.local.get([plugin_uuid_header_name]).then(
                function (result) {
                ynInstallationUniqueId = result[plugin_uuid_header_name];
                console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);
                return chrome.storage.local.get([plugin_session_header_name]);
            }).then(function (result) {
                xYellownotesSession = result[plugin_session_header_name];
                console.debug("xYellownotesSession: " + xYellownotesSession);

                // let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);

                // let session = await chrome.storage.local.get([plugin_session_header_name]);

                // Fetch data from web service (replace with your actual API endpoint)

                const msg = {
                    "name": name,
                    "description": description,
                    "visibility": visibility
                }
                console.debug(msg);
                // Send data using fetch
                return fetch('https://api.yellownotes.cloud/api/v1.0/plugin_user_create_distributionlist', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        [plugin_uuid_header_name]: ynInstallationUniqueId,
                        [plugin_session_header_name]: xYellownotesSession,
                    },
                    body: JSON.stringify(msg)
                });
            })
            .then(response => response.json())
            .then(function (data) {
                console.debug('Success:', data);

                // update the list of distribution lists with the one just created
                // append the new row to the table of existing distributions lists
               // const dataTable = document.querySelector('table[name="dataTable"]');
                const tableBody = document
                .querySelector('table[name="distributionsTable"]')
                .getElementsByTagName("tbody")[0];
data.subscriberscount = 0;
data.postcount = 0;

                newTableRow2(tableBody, data);
 //               const newRow1 = dataTable.insertRow();

   //             var rowHTML = '<tr>';
     //           rowHTML += '<td>' + data.distributionlistid + '</td>';
       
     //rowHTML += '<td>' + data.name + '</td>';
       //         rowHTML += '<td id="distributiondescription" contenteditable="true" style="border: 1px solid black;">' + data.description + '</td>';
         //       rowHTML += '<td>' + data.visibility + '</td>';
         //       rowHTML += '<td>' + data.restrictions + '</td>';
         //       rowHTML += '<td></td>';
         //       rowHTML += '</tr>';
         //       newRow1.innerHTML = rowHTML;

                // Usage: Pass the ID of the parent element to cleanup
                removeAllChildren('form');

            }).catch((error) => console.error('Error:', error));

        } else {
            alert("Please enter a name and a description");
        }
    });

    // create button to cancel distributionlist/feed to API
    const buttoncancel = document.createElement('button');
    buttoncancel.id = 'cancelform_button';
    buttoncancel.setAttribute("style", "align: middle;");
    buttoncancel.textContent = 'Cancel';
    container.appendChild(buttoncancel);
    console.debug(container);

    // Find the button and add an event listener
    const cancelDataButton = document.getElementById('cancelform_button');

    cancelDataButton.addEventListener('click', function () {
        // cancel button clicked
        console.debug("cancel button clicked");
        document.querySelector('table.formTable').remove();
        document.querySelector('#cancelform_button').remove();
        document.querySelector('#addform_button').remove();

    });

}

function reformatTimestamp(originalTimestamp) {
    console.debug("reformatTimestamp");
    console.debug(originalTimestamp);

    let[date, time1, rest] = originalTimestamp.split(/[T\.]/);
    console.debug(date);
    console.debug(time1);
    console.debug(rest);

    return (date + " " + time1);

    // Replace month names with numbers and adjust format
    const months = {
        Jan: '01',
        Feb: '02',
        Mar: '03',
        Apr: '04',
        May: '05',
        Jun: '06',
        Jul: '07',
        Aug: '08',
        Sep: '09',
        Oct: '10',
        Nov: '11',
        Dec: '12'
    };
    let[month, day, year, time] = originalTimestamp.split(/[\s,]+/);
    console.debug(month);
    console.debug(day);
    console.debug(year);
    console.debug(time);

    month = months[month];

    // Adjust for 24-hour time format
    let[hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);

    if (hours === 24) {
        hours = 0;
        // Increment the day, noting that this won't handle month/year boundaries correctly
        day = parseInt(day, 10) + 1;
    }

    // Ensure two-digit format for day and hours
    day = day.toString().padStart(2, '0');
    hours = hours.toString().padStart(2, '0');

    // Combine into new format
    return `${year}-${month}-${day} ${hours}:${minutes.toString().padStart(2, '0')}:00`;
}

async function add_subscriber(distributionlistid) {
    console.debug("add_subscriber to " + distributionlistid);
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
    button.setAttribute('style', 'left: 200px;');
    button.textContent = 'add';
    container.appendChild(button);
    console.debug(container);

    // Find the button and add an event listener
    const sendDataButton = document.getElementById('new-subscriber');

    sendDataButton.addEventListener('click', function () {
        // Extract data from table
        //const table1 = document.querySelector('#table-container table');
        const email = table.rows[0].cells[1].textContent; // Get text from second cell of the first row
        //const description = table.rows[1].cells[1].textContent; // Get text from second cell of the second row

        var ynInstallationUniqueId = "";
        var xYellownotesSession = "";
        const msg = {
            "email": email,
            "distributionlistid": distributionlistid

        }
        console.debug(msg);
        chrome.storage.local.get([plugin_uuid_header_name]).then(
            function (result) {
            ynInstallationUniqueId = result[plugin_uuid_header_name];
            console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);
            return chrome.storage.local.get([plugin_session_header_name]);
        }).then(function (result) {
            xYellownotesSession = result[plugin_session_header_name];
            console.debug("xYellownotesSession: " + xYellownotesSession);

            // let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);

            // let session = await chrome.storage.local.get([plugin_session_header_name]);

            // Fetch data from web service (replace with your actual API endpoint)

            // Send data using fetch
            return fetch('https://api.yellownotes.cloud/api/plugin_user_add_distribution_list_subscriber', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [plugin_uuid_header_name]: ynInstallationUniqueId,
                    [plugin_session_header_name]: xYellownotesSession,
                },
                body: JSON.stringify(msg)
            });
        })
        .then(response => response.json())
        .then(function (data) {
            console.debug('Success:', data);
            // Usage: Pass the ID of the parent element to cleanup
            removeAllChildren('form');

        }).catch((error) => console.error('Error:', error));
    });

}


async function remove_subscriber(subscriptionid, distributionlistid) {
    console.debug("remove_subscriber");
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
    console.debug(container);

    // Find the button and add an event listener
    const sendDataButton = document.getElementById('send-data');

    sendDataButton.addEventListener('click', function () {
        // Extract data from table
        //const table1 = document.querySelector('#table-container table');
        const email = table.rows[0].cells[1].textContent; // Get text from second cell of the first row
        //const description = table.rows[1].cells[1].textContent; // Get text from second cell of the second row

        var ynInstallationUniqueId = "";
        var xYellownotesSession = "";

        chrome.storage.local.get([plugin_uuid_header_name]).then(
            function (result) {
            ynInstallationUniqueId = result[plugin_uuid_header_name];
            console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);
            return chrome.storage.local.get([plugin_session_header_name]);
        }).then(function (result) {
            xYellownotesSession = result[plugin_session_header_name];
            console.debug("xYellownotesSession: " + xYellownotesSession);

            // let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);

            // let session = await chrome.storage.local.get([plugin_session_header_name]);

            // Fetch data from web service (replace with your actual API endpoint)

            // Send data using fetch
            return fetch('https://api.yellownotes.cloud/api/plugin_user_delete_subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [plugin_uuid_header_name]: ynInstallationUniqueId,
                    [plugin_session_header_name]: xYellownotesSession,
                },
                body: JSON.stringify({
                    "subscriptionid": subscriptionid,
                    "distributionlistid": distributionlistid

                })
            });
        })
        .then(response => response.json())
        .then(function (data) {
            console.debug('Success:', data);
            // Usage: Pass the ID of the parent element to cleanup
            removeAllChildren('form');

        }).catch((error) => console.error('Error:', error));
    });
}

function removeAllChildren(parentElementId) {
    console.debug("removeAllChildren");
    // Get the parent element by its ID
    const parent = document.getElementById(parentElementId);

    // Continue removing the first child as long as the parent has a child node
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

async function activateAllDistributions() {
    console.debug("activateAllDistributions");
    try {

         // update the form to show the new state of the subscriptions

         const checkboxes = document.getElementById('dataTable').querySelectorAll('input[type="checkbox"]');
         console.debug(checkboxes);
         // Iterate over the checkboxes and uncheck them
         checkboxes.forEach(checkbox => {
             checkbox.checked = true;
         });
         
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);

        let session = await chrome.storage.local.get([plugin_session_header_name]);

        const headers = {
            "Content-Type": "application/json",
            [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
            [plugin_session_header_name]: session[plugin_session_header_name],
        };
        const body = JSON.stringify({"active":1});

        const response = await fetch(
                server_url + '/api/v1.0/plugin_user_set_all_distributionlist_active_status', {
                method: "POST",
                headers,
                body,
            });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.debug(error);
    }
}

async function deactivateAllDistributions() {
    console.debug("deactivateAllDistributions");
    try {

 // update the form to show the new state of the subscriptions

 const checkboxes = document.getElementById('dataTable').querySelectorAll('input[type="checkbox"]');
 console.debug(checkboxes);
 // Iterate over the checkboxes and uncheck them
 checkboxes.forEach(checkbox => {
     checkbox.checked = false;
 });
 

        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const headers = {
            "Content-Type": "application/json",
            [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
            [plugin_session_header_name]: session[plugin_session_header_name],
        };
        const body = JSON.stringify({"active":0});
        const response = await fetch(
                server_url + '/api/v1.0/plugin_user_set_all_distributionlist_active_status', {
                method: "POST",
                headers,
                body,
            });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.debug(error);
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



async function add_subscription() {
    console.log("add_subscription");
    document.getElementById("add_subscription_form").style.display = "block";

    // create a small window/form to add a new subscription


    /**
     * Users select from a list of available subscrptions
     *
     * This will required much modification in future.
     * For the moment a complete list of all possible distrbiution lists is returned, to select from.
     *
     */


    // get all available distributions lists
    var available_count = 0;
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);

        // Fetch data from web service (replace with your actual API endpoint)

        const headers = {
            "Content-Type": "application/json",
            [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
            [plugin_session_header_name]: session[plugin_session_header_name],
        };
        //const body = JSON.stringify(payload);
        console.debug("fetching available distribution lists");
        console.debug(headers);
        const response = await fetch(
                server_url + "/api/v1.0/plugin_user_get_available_distributionlists", {
                method: "GET",
                headers,
            });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

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
        available_count = data.length;
        // Get table body element
        const tableBody = document
            .getElementById("distributionsTable")
            .getElementsByTagName("tbody")[0];

        console.log(tableBody);
        // loop through the existing table and delete all rows matching
        console.log(tableBody.rows);
        console.log(tableBody.rows.length);
        console.log(tableBody.rows.size);
        //available_count = tableBody.rows.length;
        console.log("available_count: " + available_count);
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
            cell4.textContent = row.creatordisplayname;
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
                console.debug("call addSubscriptionByUUID");
                console.debug(row);
                addSubscriptionByUUID(row.distributionlistid, row);
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

        if (available_count > 0) {
            // create button to send data to API
            const button = document.createElement('button');
            button.id = 'new-subscriber';
            button.textContent = 'add';
            const container = document.getElementById('add_subscription_form');
            container.appendChild(button);
            console.log(container);

            // Find the button and add an event listener
            const sendDataButton = document.getElementById('new-subscriber');

            sendDataButton.addEventListener('click', function () {
                console.log("sendDataButton");
                // Extract data from table
                const email = table.rows[0].cells[1].textContent; // Get text from second cell of the first row
                var ynInstallationUniqueId = "";
                var xYellownotesSession = "";
                const msg = {
                    "email": email,
                    "distributionlistid": distributionlistid
                }
                console.log(msg);
                chrome.storage.local.get([plugin_uuid_header_name]).then(
                    function (result) {
                    ynInstallationUniqueId = result[plugin_uuid_header_name];
                    console.log("ynInstallationUniqueId: " + ynInstallationUniqueId);
                    return chrome.storage.local.get([plugin_session_header_name]);
                }).then(function (result) {
                    xYellownotesSession = result[plugin_session_header_name];
                    console.log("xYellownotesSession: " + xYellownotesSession);
                    return fetch('https://api.yellownotes.cloud/api/v1.0/plugin_user_add_distribution_list_subscriber', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            [plugin_uuid_header_name]: ynInstallationUniqueId,
                            [plugin_session_header_name]: xYellownotesSession,
                        },
                        body: JSON.stringify(msg)
                    });
                })
                .then(response => response.json())
                .then(function (data) {
                    console.log('Success:', data);
                    // Usage: Pass the ID of the parent element to cleanup
                    removeAllChildren('add_subscription_form');

                }).catch((error) => console.error('Error:', error));
            });
        } else {
            console.log("no available distribution lists to can be subscribed to");
            const msg = document.createElement('p');
            msg.textContent = 'no feeds available for subscription';
            msg.setAttribute('class', 'message_to_user');
            const container = document.getElementById('add_subscription_form');
            container.appendChild(msg);
            console.log(container);
        }
    } catch (error) {
        console.error(error);
    }
}


function removeAllChildNodes(parent) {
    console.log("removeAllChildNodes");
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}


async function activateAllSubscriptions() {
    console.debug("activateAllSubscriptions.start");
    try {

        // update the form to show the new state of the subscriptions

        const checkboxes = document.querySelector('table[name="' + table_name + '"]').querySelectorAll('input[type="checkbox"]');
        console.log(checkboxes);
        // Iterate over the checkboxes and uncheck them
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });

        // call the API that activates all supscriptions of the user

        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);

        let session = await chrome.storage.local.get([plugin_session_header_name]);

        const headers = {
            "Content-Type": "application/json",
            [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
            [plugin_session_header_name]: session[plugin_session_header_name],
        };
        const body = '{"active_status":1}';

        const response = await fetch(
                server_url + URI_plugin_user_set_all_subscriptions_active_status, {
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

// deactive all the user's subscriptions
async function deactivateAllSubscriptions() {
    console.debug("deactivateAllSubscriptions.start");
    try {
        // update the form to show the new state of the subscriptions

        const checkboxes = document.querySelector('table[name="' + table_name + '"]').querySelectorAll('input[type="checkbox"]');
        console.log(checkboxes);
        // Iterate over the checkboxes and uncheck them
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        // call the API that suspeds all supscriptions of the user
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const headers = {
            "Content-Type": "application/json",
            [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
            [plugin_session_header_name]: session[plugin_session_header_name],
        };
        const body = '{"active_status":0}';

        const response = await fetch(
                server_url + URI_plugin_user_set_all_subscriptions_active_status, {
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