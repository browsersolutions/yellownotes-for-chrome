//
console.debug("running script in edit_note_template_script.js");


try {
    // check if the user is authenticated
    checkSessionJWTValidity()
    .then(isValid => {
        console.debug('JWT is valid:', isValid);
        if (isValid) {
            console.debug("JWT is valid - show menu accordingly");
            fetchAndDisplayStaticContent("../fragments/en_US/my_account_page_header_authenticated.html", "my_account_page_main_text").then(() => {});

            const uuid = localStorage.getItem("creatorid");
            const replacements = {creatorid: uuid};
            fetchAndDisplayStaticContent("../fragments/en_US/sidebar_fragment_authenticated.html", "sidebar", replacements).then(() => {});
            //page_display_login_status();
        } else {
            console.debug("JWT is not valid - show menu accordingly");
            fetchAndDisplayStaticContent("../fragments/en_US/sidebar_fragment_unauthenticated.html", "sidebar").then(() => {});

            //page_display_login_status();
        }

    })
    .catch(error => {
        console.error('Error:', error.message);
    });
} catch (e) {
    console.error(e);
}


const stats_table_name = "stats_table";


// call to database to get notes and place them in a table
if (function_call_debuging) console.debug("calling fetchData");
fetchData(stats_table_name).then(function (d) {
    console.debug("read stastics complete");
    console.debug(d);

   
   

});

try{
document.getElementById('drop_zone').addEventListener('click', function () {
    console.debug("drop_zone clicked");
    document.getElementById('file_input').click();
});
} catch (e) {
    console.error(e);
}

var note_properties = {
    note_color: "#FFFF00",
    box_width: "200px",
    banner_image: "",
    box_height: "200px"

};


document.getElementById('file_input').addEventListener('change', handleFileSelect, false);
document.getElementById('colorPicker').addEventListener('input', changeBannerColor, false);
document.getElementById('saveButton').addEventListener('click', saveData, false);
document.getElementById('drop_zone').addEventListener('dragover', handleDragOver, false);
document.getElementById('drop_zone').addEventListener('drop', handleFileDrop, false);

document.querySelector('.remove-icon').addEventListener('click', function (event) {
    // Prevent the event from bubbling up to parent elements
    event.stopPropagation();
    var ynInstallationUniqueId = "";
    var xYellownotesSession = "";

    // First, retrieve the plugin UUID
    chrome.storage.local.get([plugin_uuid_header_name])
    .then(function (result) {
        ynInstallationUniqueId = result[plugin_uuid_header_name];

        // After successfully retrieving the UUID, retrieve the session
        return chrome.storage.local.get([plugin_session_header_name]);
    })
    .then(function (result) {
        xYellownotesSession = result[plugin_session_header_name];

        // remove the banner image from the page


        const bannerImgElement = document.getElementById('bannerImage');
        console.debug(bannerImgElement);
        if (bannerImgElement) {
            bannerImgElement.remove();
        } else {
            console.debug('Banner image data not found on page');
        }

        console.debug("Installation Unique ID:", ynInstallationUniqueId);
        console.debug("Session:", xYellownotesSession);
    })
    .catch(function (error) {
        console.error("Error fetching data from chrome storage:", error);
    }).then(function (result) {
        // After fetching the values, perform the fetch call
        console.debug("make API call to remove banner");

        // Perform the fetch call in the background
        return fetch(server_url + plugin_remove_banner_uri, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                [plugin_uuid_header_name]: ynInstallationUniqueId,
                [plugin_session_header_name]: xYellownotesSession,
            },

        });
    })
    .then(response => {
        // Check if the response is ok (status 200-299)
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json(); // Parse JSON response
    })
    .then(data => {
        // Log the success data to console
        console.debug('Success:', data);
    })
    .catch(error => {
        // Log any errors to the console
        console.error('Error:', error);
    });
});

function handleFileSelect(evt) {
    console.debug("handleFileSelect()");
    processFile(evt.target.files[0]);
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
}

function handleFileDrop(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    processFile(evt.dataTransfer.files[0]);
}

try {
    fetchAndDisplayStaticContent("/fragments/en_US/editnotetemplate_information.html", "editnotetemplate_information").then(() => {
        console.debug("fetchAndDisplayStaticContent() done");
        page_display_login_status();
        // login_logout_action();

    });
} catch (e) {
    console.error(e);
}

function processFile(file) {
    if (!file.type.match('image/png')) {
        alert('Please select a PNG image.');
        return;
    }

    if (file.size > 30720) { // 30 Kilobytes
        alert('File size must be less than 30KB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const base64Image = e.target.result;
        console.debug('Base64 Encoded Image:', base64Image);

        // send this to the users profile as the banner image of their yellow notes
        // You can add additional actions here, e.g., displaying the image or sending it to a server
        note_properties.banner_image = base64Image;

        // update the banner image on screen

        // delete any image already present
        const exitingBannerImgElement = document.getElementById('bannerImage');
        if (exitingBannerImgElement) {
            exitingBannerImgElement.remove();
        }

        // <img id="bannerImage" style="z-index: 1400; position: relative;" alt="Banner Image"/>
        //        const bannerImgElement = document.getElementById('bannerImage');
        const bannerImgElement = document.createElement('img');
        bannerImgElement.setAttribute("id", "bannerImage");
        bannerImgElement.setAttribute("style", "z-index: 1400; position: relative;");
        bannerImgElement.setAttribute("alt", "Banner Image");
        bannerImgElement.setAttribute("src", base64Image);

        console.debug(bannerImgElement);
        const contElem = document.getElementById('drop_zone');
        try {
            // Insert the new node as the first child of the parent node
            if (contElem.firstChild) {
                // If the parent already has a first child, insert before it
                contElem.insertBefore(bannerImgElement, contElem.firstChild);
            } else {
                // If the parent has no children, simply append the new node
                contElem.appendChild(bannerImgElement);
            }
        } catch (e) {}

        //   if (bannerImgElement) {
        //       bannerImgElement.src = base64Image;
        //   } else {
        //       console.debug('Banner image data not found in response');
        //   }
    };
    reader.readAsDataURL(file);
}

function changeBannerColor(evt) {
    document.getElementById('bannerContainer').style.backgroundColor = evt.target.value;
}

async function saveData() {
    console.debug("saveData()");
    var newdata;
    //console.debug(bannerImgElement);
    //console.debug(bannerImgElement.src);

    const color = document.getElementById('colorPicker').value;
    const banner = document.getElementById('bannerContainer');
    const width = banner.offsetWidth;
    const height = banner.offsetHeight;

    const displayName = document.getElementById('displayName').value;

    const bannerImgElement = document.getElementById('bannerImage');
    if (bannerImgElement) {

        var img = "";

        img = bannerImgElement.src;

        newdata = {
            banner_image: img,
            note_display_name: displayName,
            note_color: color,
            box_width: width + "px",
            box_height: height + "px"
        };
    } else {
        newdata = {
            note_color: color,
            note_display_name: displayName,
            box_width: width + "px",
            box_height: height + "px",
            banner_image: ""

        };

    }

    let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
    let session = await chrome.storage.local.get([plugin_session_header_name]);
    const userid = "";
    const message_body = JSON.stringify(newdata);
    console.debug(message_body);
    // Fetch data from web service (replace with your actual API endpoint)
    const response = await fetch(
            server_url + URI_plugin_user_update_yellownote_creatorlevel_attributes, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
                [plugin_session_header_name]: session[plugin_session_header_name],
            },
            body: message_body,
        });

    // Check for errors
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    // update the row in the table
    // Parse JSON data
    const r_data = await response.json();

    console.debug(r_data);

}





function fetchData(table_name) {
    if(function_call_debuging)  console.debug("fetchData.start");
    try {
        return new Promise(
            function (resolve, reject) {
            var ynInstallationUniqueId = "";
            var xYellownotesSession = "";
            var distributionlists;
            var data;

            chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name]).then(function (result) {
                console.debug(result);
                console.debug(ynInstallationUniqueId);
                ynInstallationUniqueId = result[plugin_uuid_header_name];
                xYellownotesSession = result[plugin_session_header_name];
                console.debug(ynInstallationUniqueId);
                console.debug(xYellownotesSession);
                return fetch(server_url + URI_plugin_user_get_statistics, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        [plugin_uuid_header_name]: ynInstallationUniqueId,
                        [plugin_session_header_name]: xYellownotesSession,
                    },
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
             }).then(function (data) {
               

                console.debug(data);

  
                // Loop through data and populate the table
                data.forEach(row => {
                    console.debug(row);
                    console.debug(row.json);
                 
                  
                    // key column - not to be displayed
                    // create timestamp - not to be dsiplayed either
                    try {
                      
// place values in the table cells

                            // place the notedays data in the html object with the id notedays
                            document.getElementById("notedays").textContent = row.notedays;

                             // place the notedays data in the html object with the id notedays
                             document.getElementById("notecount_max_allowed").textContent = row.notecount_max_allowed;

                              // place the notedays data in the html object with the id notedays
                            document.getElementById("notecount").textContent = row.notecount;

                               // place the notedays data in the html object with the id notedays
                               document.getElementById("currentnotedays").textContent = row.currentnotedays;

                                  // place the notedays data in the html object with the id count
                            document.getElementById("currentnotecount").textContent = row.currentnotecount;
                        
                    } catch (e) {
                        console.debug(e);
                    }
                  
                });
                resolve('');
            });
        });
    } catch (error) {
        console.error(error);
    }
}

// Function to fetch and update banner image
async function fetchAndUpdateBannerImage() {

    let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
    let session = await chrome.storage.local.get([plugin_session_header_name]);
    console.debug(session);
    const sessiontoken = session[plugin_session_header_name];

    const claimNames = ['userid', 'uuid']; // Replace with the claims you want to extract
    const claims = getClaimsFromJwt(sessiontoken, claimNames);
    const uuid = claims.uuid;

    const message_body = JSON.stringify({
            creatorid: uuid
        });

    fetch(server_url + '/api/v1.0/get_creatorlevel_note_properties', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
            [plugin_session_header_name]: session[plugin_session_header_name],
        },
        body: message_body,
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not OK');
        }
        return response.json();
    })
    .then(data => {
        console.debug('Success:');
        console.debug(data);

        var bannerImgElement; // = document.getElementById('bannerImage');
        console.debug(bannerImgElement);
        //console.debug(bannerImgElement);

        if (data.banner_image) {
            // image was returned from the storeprofile
            bannerImgElement = document.createElement("img");
            bannerImgElement.src = data.banner_image;
            bannerImgElement.id = "bannerImage";
            bannerImgElement.setAttribute("style", "z-index: 1400; position: relative;");
            bannerImgElement.setAttribute("alt", "Banner Image");

        } else {
            console.debug('Banner image data not found in response');
        }
        if (data.banner_image !== "" && data.banner_image !== null) {
            console.debug("data.banner_image is not null");
            document.getElementById('bannerContainer').querySelector('#drop_zone').appendChild(bannerImgElement);
            const n = document.getElementById('bannerContainer').querySelector('#drop_zone');
            n.insertBefore(bannerImgElement, n.firstChild);

        }
        const colorElement = document.getElementById('colorPicker');
        if (data.note_color) {
            colorElement.value = data.note_color;
            document.getElementById('bannerContainer').style.backgroundColor = data.note_color;
        } else {
            console.debug('Banner color data not found in response');
        }

        if (data.box_width) {
            document.getElementById('bannerContainer').style.width = data.box_width;
        } else {
            console.debug('Banner width data not found in response');
        }

        if (data.box_height) {
            document.getElementById('bannerContainer').style.height = data.box_height;
        } else {
            console.debug('Banner height data not found in response');
        }

    })
    .catch(error => console.error('Fetch error:', error));
}

// Call the function to update the banner image
try {
    fetchAndUpdateBannerImage();
} catch (e) {

}
