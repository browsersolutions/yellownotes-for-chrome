const default_box_width = 250;
const default_box_height = 250;

const plugin_session_header_name = "xyellownotessession_jwt";

var mouseX, mouseY;
// Attach the event listener to the document to make the mouse coordinates available to the extension
// in order to correctly place notes
document.addEventListener('mousemove', (event) => {
    // console.log("mousemove detected");
    // console.log(event);
    //  console.log(event.target);

    // Extract the x and y coordinates of the mouse cursor
    mouseX = event.clientX + window.scrollX;
    mouseY = event.clientY + window.scrollY

        //console.log(mouseX, mouseY ); // For demonstration purposes

});

document.addEventListener('contextmenu ', (event) => {
    console.log("contextmenu detected at " + mouseX + " " + mouseY);
    // keep the current cursor postion

});

document.addEventListener('oncontextmenu ', (event) => {
    console.log("oncontextmenu detected at " + mouseX + " " + mouseY);
    // keep the current cursor postion

});

var clickX, clickY;
function logPosition(event) {
    console.log("click detected: " + event.button);
    if (event.button === 2) {
        console.log("right click detected");
        clickX = event.clientX + window.scrollX;
        clickY = event.clientY + window.scrollY;
        const cursorPosition = {
            x: event.clientX + window.scrollX,
            y: event.clientY + window.scrollY
        };
        console.log(cursorPosition);
    } else {
        console.log("not a right click");

    }
}

document.addEventListener('click', logPosition);

document.addEventListener('touchstart', (event) => {
    console.log("touch detected: " + event.touches[0].clientX + " " + event.touches[0].clientY);
    if (event.touches.length > 0) {
        logPosition(event.touches[0]);
    }
});

document.addEventListener('touchend', (event) => {
    if (event.touches.length > 0) {
        logPosition(event.touches[0]);
    }
});

function listener(request, sender, sendResponse) {

    try {
        console.debug("browsersolutions request: ");
        console.debug(request);
        console.debug(request.info);
        console.debug(request.tab);

        if (!(isUndefined(request.sharedsecret)) && !(isUndefined(request.action))) {

            console.debug("browsersolutions request action: " + request.action);
            // chose which function to proceed with
            try {
                console.debug("selection text: " + request.action.info.selectionText);
            } catch (e) {
                console.error(e);
            }
            if (request.action == "createnode") {
                // call to create a yellow note

                create_newstickynote_node(request.info, request.note_type, request.note_template, request.session);

                sendResponse({
                    success: true,
                    data: "value"
                });
                return true;

            } else if (request.action == "update_notes_on_page") {

                // chose which function to proceed with
                var shared_secret_to_identify_background_js_to_content_script_NoteSelectedHTML = "Glbx_marker6";
                console.debug("request0: " + request.action);

                if (request.action == "update_notes_on_page") {

                    console.log("update_notes_on_page, position: " + request.position);

                    page_update(request, sender, sendResponse).then(function (res) {

                        sendResponse({
                            success: true,
                            data: "value"
                        });
                    });

                } else {
                    sendResponse({
                        success: false,
                        data: "value"
                    });

                }

                return true;
            } else if (request.action == "update_single_note_on_page") {
                console.log("update note with noteid: " + request.noteid);
                // not implemented yet
            } else if (request.action == "disable_single_note") {

                console.log("disable note with noteid: " + request.noteid);
                // not implemented yet

                // remove the note from the page
                remove_noteid(request.noteid);
                sendResponse({
                    success: false,
                    data: "value"
                });
                return true;

            } else if (request.action == "scroll_to_note") {
                const noteid = request.noteid;
                console.log("scroll to note with noteid: " + noteid);
                // Find the element by its ID
                const note_root = document.querySelectorAll('[type="yellownote"][noteid="' + noteid + '"]')[0];
                const element = note_root.querySelector('table[name="whole_note_table"]')
                    // Check if the element exists
                    if (element) {
                        // Scroll the element into view
                        element.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    } else {
                        console.log('Element not found: ' + elementId);
                    }
            } else if (request.action == "remove_single_note") {
                console.log("remove note with noteid: " + request.noteid);
                console.debug("browsersolutions calling: remove_noteid");
                remove_noteid(request.noteid);
                sendResponse({
                    success: false,
                    data: "value"
                });
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    } catch (e) {
        console.error(e);
    }
}

chrome.runtime.onMessage.addListener(listener);

/* creates DOM object of the stick note */
function create_newstickynote_node(info, note_type, html, session) {

    console.debug("# create_newstickynote_node start");

    const isOwner = true;
    const newNote = true;
    // create the note object data with suitable initial values for some fields
    var note_object_data = {}
    console.log("note_object_data: " + JSON.stringify(note_object_data));

    var userid = "";
    console.debug("session: " + JSON.stringify(session));
    console.debug("selection text: " + info.selectionText);

    try {

        // https://www.geeksforgeeks.org/how-to-call-promise-inside-another-promise-in-javascript/

        note_object_data.url = window.location.href;

        if (typeof note_object_data.enabled != undefined) {
            note_object_data.enabled = "true"
        } else {
            // default value if undefined, is enabled(=true)
            note_object_data.enabled = "true"
        }
    } catch (e) {
        console.error(e);
    }

    // render template into a complete note object (with values)

    var node_root = document.createElement('container');

    // var fullURLToCSS = chrome.runtime.getURL("css/yellownote.css");

    var note_template = safeParseInnerHTML(html, 'div');
    // note_template = JSON.parse(html);
    console.log(note_template);

    node_root.setAttribute("class", "yellownotecontainer");
    node_root.setAttribute("note_type", note_type);
    node_root.setAttribute("button_arrangment", 'new');

    const note_table = note_template.querySelector('[name="whole_note_table"]');
    //console.debug(note_table);
    // read size parameters from the note template
    //const box_width = processBoxParameterInput(note_table.getAttribute("box_width"), 250, 50, 500);
    var box_width = note_table.getAttribute("box_width");
    if (isUndefined(box_width) || box_width == null || box_width == '' || box_width == 'undefined') {
        box_width = "250px";
    }

    node_root.setAttribute("box_width", box_width);
    //            const box_height = processBoxParameterInput(note_table.getAttribute("box_height"), 250, 50, 500);
    var box_height = note_table.getAttribute("box_height");
    if (isUndefined(box_height) || box_height == null || box_height == '' || box_height == 'undefined') {
        box_height = "250px";
    }

    node_root.setAttribute("box_height", box_height);

    /* where on the page is the note going to be placed ?

    If the not contains coordinates, use them. If not, use the cursor position


     */

    console.debug("mouseX: " + mouseX);
    console.debug("mouseY: " + mouseY);

    var selection_text = info.selectionText;
    // place the note there the cursor is placed
    node_root.setAttribute("posx", mouseX + "px");
    node_root.setAttribute("posy", mouseY + "px");

    console.debug("selection_text: " + selection_text);
    console.debug(selection_text);
    console.debug((!isUndefined(selection_text)));
    console.debug(selection_text != null);
    console.debug(selection_text != '');

    if (!isUndefined(selection_text) && selection_text != null && selection_text != '') {
        // Usage: Call this function with the text you want to highlight
        console.debug("selection_text: " + selection_text);
        console.debug(selection_text);
        const highlightUniqueId = highlightTextOccurrences(selection_text);
        console.log("Highlights added with ID:", highlightUniqueId);

        // only include the highlight id with the note object if it is not null
        if (!isUndefined(highlightUniqueId) && highlightUniqueId != null && highlightUniqueId != '') {

            note_object_data.highlightUniqueId = highlightUniqueId;
        }

    }
    // include the highlight id with the note object

    note_object_data.selection_text = selection_text;
    note_object_data.message_display_text = selection_text;

    console.log("note_object_data: " + JSON.stringify(note_object_data));

    //  node_root.setAttribute("style", 'width: 100px; height: 100px; background-color: yellow; position: absolute; z-index: 103;');

    //cont1.appendChild(create_note_table(note_object_data,note_template));
    node_root.appendChild(note_template);
    try {
        // itterate trhoug hthe data container object in the not and populate them with values from the note_object_data

        node_root.querySelector('input[type="hidden"][name="selection_text"]').replaceChildren(document.createTextNode(note_object_data.selection_text));

        //node_root.querySelector('input[type="hidden"][name="createtime"]').replaceChildren(document.createTextNode(note_object_data.createtime));
        //node_root.querySelector('input[type="hidden"][name="lastmodifiedtime"]').replaceChildren(document.createTextNode(note_object_data.lastmodifiedtime));
        // capture local url
        node_root.querySelector('input[type="hidden"][name="url"]').replaceChildren(document.createTextNode(note_object_data.url));

        if (typeof note_object_data.enabled != undefined) {
            node_root.querySelector('input[type="hidden"][name="enabled"]').replaceChildren(document.createTextNode(note_object_data.enabled));
        } else {
            // default value if undefined, is enabled(=true)
            node_root.querySelector('input[type="hidden"][name="enabled"]').replaceChildren(document.createTextNode("true"));
        }
    } catch (e) {
        console.error(e);

    }

    // attach event listeners to buttons and icons
    //attachEventlistenersToYellowStickynote(node_root);

    if (note_type == "yellownote") {
        // make the message in the textarea touch-n-go
        try {
            // Grab the textarea element
            const textarea = node_root.querySelector('[name="message_display_text"]');
            console.log(textarea);
            // Set initial placeholder text that should vanish when typing begins
            const placeholderText = "write your notes here..";
            textarea.value = placeholderText;

            // Attach a focus event listener to remove the text as soon as the textarea gains focus
            textarea.addEventListener('focus', function () {
                if (textarea.value === placeholderText) {
                    textarea.value = '';
                }
            });

            // Attach an input event listener to handle the case where the user starts typing
            textarea.addEventListener('input', function () {
                if (textarea.value === '') {
                    textarea.value = placeholderText;
                }
            });

            // Attach a blur event to reset placeholder if nothing is typed
            textarea.addEventListener('blur', function () {
                if (textarea.value === '') {
                    textarea.value = placeholderText;
                }
            });

        } catch (e) {
            console.error(e);
        }
    } else if (note_type == "webframe") {}

    console.debug("calling getSelectionTextDOMPosition")
    var out = getSelectionTextDOMPosition(info.selectionText);
    console.debug(out);

    if (out.selection_matched_in_document) {
        // found selection text in document. get x,y positions
        try {
            console.debug(out.start_range_node);
            console.debug(out.start_range_node.parentNode);
            const p = getXYPositionOfDOMElement(out.start_range_node.parentNode);
            console.log(p);

            console.log(p.left);

            //const pos1 = getXYPositionOfDOMElement(out.start_range_node.parentNode);
            //const pos2 = getXYPositionOfDOMElement(out.end_range_node.parentNode);
            //console.debug(node_root);
            node_root.setAttribute("posx", p.left + "px");
            //    console.debug(node_root);
            node_root.setAttribute("posy", p.top + "px");
        } catch (e) {
            console.error(e);
            // in case of error, fall back on using cursor position

            node_root.posx = mouseX + "px";
            node_root.posy = mouseY + "px";

        }

    } else if (newNote) {
        // use x,y position of cursor for new notes
        console.debug("use x,y position of cursor for new note: " + mouseX + " " + mouseY);
        node_root.posx = mouseX + "px";
        node_root.posy = mouseY + "px";

    } else if (haveValidXYPositons(node_root)) {
        console.debug("use x,y position in the note, if any");
        // use x,y position in the note, if any

    } else {
        // use default
        console.debug("use default x,y position for new note");
    }

    console.debug(node_root);

    const inserted = placeYellowNote(node_root);
    // set the flag that contral which button are shown
    inserted.setAttribute("button_arrangment", 'new');

    // call the function that will set which part of the note will be displayed
    setComponentVisibility(inserted, ",new,.*normalsized,");

    // call the function that will make the note draggable
    console.debug("browsersolutions: makeDragAndResize");
    makeDragAndResize(inserted);

    // attach eventlisteners to the note
    attachEventlistenersToYellowStickynote(inserted);

    // move to the default location on the screen
    //inserted.setAttribute("posx", 50);
    //inserted.setAttribute("posy", 50);
    inserted.querySelector('[name="whole_note_table"]').style.left = inserted.getAttribute("posx");
    inserted.querySelector('[name="whole_note_table"]').style.top = inserted.getAttribute("posy");

    inserted.querySelector('[name="whole_note_table"]').style.width = inserted.getAttribute("box_width");
    inserted.querySelector('[name="whole_note_table"]').style.height = inserted.getAttribute("box_height");

    // call the function that will make the note resizeable
    // console.debug("browsersolutions: makeResizable");
    // makeResizable(inserted);
    console.debug("browsersolutions: calling dropdownlist_add_option");
    dropdownlist_add_option(inserted, "", "", "");

    // place focus
    try {
        inserted.querySelector('[focus="true"]').focus();
    } catch (e) {
        console.error(e);
    }

    // });
}

function save_new_note(event) {
    console.debug("browsersolutions ### save new note");
    console.debug(event);

    // save note to database
    try {
        // get the table node that is the root of the note data.

        var note_root = getYellowStickyNoteRoot(event.target);
        console.log(note_root);

        // var note_table = event.target.parentNode.parentNode.parentNode;
        // console.debug(note_table);
        var selection_text = "";
        try {
            selection_text = note_root.querySelectorAll('input[name="selection_text"]')[0].textContent.trim();
        } catch (e) {
            // set default, current timestamp

        }

        console.debug(selection_text);

        var url = "";
        try {
            url = window.location.href;
            //url = note_root.querySelectorAll('input[name="url"]')[0].textContent.trim();
        } catch (e) {
            // set default, local url

        }

        // new notes do not have a noteid and it one does it is not a new note
        var noteid = null;
        console.debug("noteid: " + noteid);
        try {
            noteid = note_root.querySelector('input[name="noteid"]').textContent.trim();
        } catch (e) {}
        console.debug("noteid: " + noteid);
        // only proceed if there is no noteid set - this note should not be created in this function
        if (noteid == null || noteid == "") {

            var distributionlistid;
            try {
                distributionlistid = note_root.querySelector('[name="distributionlistdropdown"]').value;
                console.log('Selected distributionlistid:', distributionlistid);
            } catch (e) {
                console.error(e);
            }

            var message_display_text = "";
            try {
                //console.debug(note_root.querySelectorAll('[name="message_display_text"]')[0]);
                //console.debug(note_root.querySelectorAll('[name="message_display_text"]')[0].value.trim() );
                message_display_text = note_root.querySelectorAll('[name="message_display_text"]')[0].value.trim();

            } catch (e) {}

            var enabled = "";
            try {
                enabled = note_root.querySelectorAll('input[name="enabled"]')[0].textContent.trim();
            } catch (e) {
                // set default
                enabled = true;
            }

            // update lastmodified timestamp every time
            var lastmodifiedtime = getCurrentTimestamp();

            // read out position parameters
            console.debug(note_root);
            const posx = note_root.getAttribute("posx");
            const posy = note_root.getAttribute("posy");
            const box_height = note_root.getAttribute("box_height");
            const box_width = note_root.getAttribute("box_width");

const note_type = note_root.getAttribute("note_type");

            console.debug("posy: " + posy);

            console.debug("message_display_text: " + message_display_text);
            console.debug("url: " + url);

            console.debug("selection_text: " + selection_text);

            let base64data = utf8_to_b64(selection_text);
            console.log(utf8_to_b64(selection_text));

            const json_create = {
                message_display_text: utf8_to_b64(message_display_text),
                selection_text: utf8_to_b64(selection_text),
                url: url,
                enabled: "true",
                distributionlistid: distributionlistid,
                note_type: note_type,
                posx: posx,
                posy: posy,
                box_width: box_width,
                box_height: box_height
            };
            console.debug(JSON.stringify(json_create));

            // Send save request back to background
            // Stickynotes are always enabled when created.
            chrome.runtime.sendMessage({
                message: {
                    "action": "single_create",
                    "create_details": json_create
                }
            }, function (response) {
                console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));

                // read the noteid assigned to this note that returned from the API service
                var noteid = response.noteid;
                console.debug("noteid: " + noteid);

                note_root.querySelector('input[type="hidden"][name="noteid"]').replaceChildren(document.createTextNode(noteid));
                note_root.setAttribute("noteid", noteid);

                // call the function that will set which part of the note will be displayed
                setComponentVisibility(note_root, ",rw,.*normalsized,");

                attachEventlistenersToYellowStickynote(note_root);

            });
        } else {
            console.log("browsersolutions noteid already set - not creating new note");
        }
    } catch (e) {
        console.error(e);
    }
}

function dropdownlist_add_option(node_root, dropdownlist, option_text, option_value) {
    console.debug("# dropdownlist_add_option");
    console.debug(node_root);
    try {
        // check if the tempate contains a dropdown list, if so pupulate it with the available distribution lists
        const dl_container = node_root.querySelector('[name="distributionlistdropdowncontainer"]');
        console.debug(dl_container);
        //dl_container.replaceChildren(document.createTextNode("loading..."));

        console.debug("calling get_distributionlist");
        get_distributionlist().then(function (response) {
            console.debug("get_distributionlist message sent to background.js with response: " + JSON.stringify(response));
            const selectElement = node_root.querySelector('[name="distributionlistdropdown"]');
            // const selectElement = node_root.getElementById('distributionlistdropdown');
            console.debug(selectElement);
            // create the option to have no discribution (this is the default)
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'do not share';
            selectElement.appendChild(option);

            response.forEach(item => {
                console.log(item);
                const option = document.createElement('option');
                option.value = item.distributionlistid;
                option.textContent = `${item.name} ${item.description}`;
                selectElement.appendChild(option);
            });
            console.debug(selectElement);
            dl_container.appendChild(selectElement);
            console.debug(dl_container);
        });
    } catch (e) {
        console.error(e);
    }

}

function createDistributionlistDropdown(node_root, dropdownlist, option_text, option_value) {
    // create DOM object of the distribution list dropdown
    console.debug("# createDistributionlistDropdown");
    console.debug(node_root);
    console.debug(dropdownlist);
    console.debug(option_text);

    // check if the tempate contains a dropdown list, if so pupulate it with the available distribution lists
    const dl_container = node_root.querySelector('[name="distributionlistdropdowncontainer"]');
    console.debug(dl_container);
    dl_container.replaceChildren(document.createTextNode("loading..."));

    // 	<select name="distributionlistdropdown" style="max-width: 100px; font-size: 1.0rem; padding: 0px; background: rgba(255, 255, 255, 0.8);"></select>
    const dl = document.createElement('select');
    dl.setAttribute("name", "distributionlistdropdown");
    dl.setAttribute("style", "max-width: 100px; font-size: 1.0rem; padding: 0px; background: rgba(255, 255, 255, 0.8);");
    dl_container.appendChild(dl);

}

// return a drop down html list of all available distribution lists
function get_distributionlist() {
    console.debug("# get_distributionlist");
    return new Promise(function (resolve, reject) {

        chrome.runtime.sendMessage({
            message: {
                action: "get_my_distribution_lists"

            }
        }).then(function (response) {
            console.debug("get_distributionlist message sent to background.js with response: " + JSON.stringify(response));
            // render content of ifram based on this
            //console.log(getYellowStickyNoteRoot(event.target));
            //setContentInIframe(content_iframe, response);

            resolve(response);
        });

    });

}

function haveValidXYPositons(node_root) {
    return true

}

function placeYellowNote(newGloveboxNode) {
    console.debug("placeYellowNote");
    var doc = window.document;
    var doc_root = doc.documentElement;
    //console.debug(doc_root);

    const inserted = doc_root.insertBefore(newGloveboxNode, doc_root.firstChild);
    console.log(inserted);

    const table = inserted.querySelector('table[name="whole_note_table"]');
    //    console.debug(table);
    table.style.position = "absolute";

    table.style.left = inserted.getAttribute("posx");
    table.style.top = inserted.getAttribute("posy");

    return inserted;

}

function getXYPositionOfDOMElement(element) {
    console.debug("getXYPositionofDOMElement");
    // Get the position of the element
    const rect = element.getBoundingClientRect();

    // Coordinates
    const top = rect.top + window.scrollY;
    const left = rect.left + window.scrollX;
    const out = {
        left: left,
        top: top
    };
    console.debug(out);
    return out;
}

function highlightTextOccurrences(text) {
    console.debug("highlightTextOccurrences");
    // Generate a unique ID for this operation
    const uniqueId = 'highlight-' + Date.now();

    // Escape special characters for use in a regular expression
    const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    console.debug(escapedText);
    // Create a regular expression to match the text
    const regex = new RegExp(escapedText, 'gi');

    console.debug(regex);
    // Function to recursively search text nodes and highlight text
    function highlightNode(node, seqNum = 1) {
        if (node.nodeType === Node.TEXT_NODE) {
            const matches = [...node.nodeValue.matchAll(regex)];
            console.log(matches);
            if (matches.length > 0) {
                const span = document.createElement('span');
                let lastIdx = 0;
                matches.forEach(match => {
                    span.appendChild(document.createTextNode(node.nodeValue.slice(lastIdx, match.index)));
                    const highlight = document.createElement('mark');
                    highlight.textContent = match[0];
                    highlight.style.backgroundColor = 'paleyellow';
                    highlight.setAttribute('data-highlight-id', uniqueId);
                    highlight.setAttribute('data-sequence-number', seqNum++);
                    span.appendChild(highlight);
                    lastIdx = match.index + match[0].length;
                });
                span.appendChild(document.createTextNode(node.nodeValue.slice(lastIdx)));
                node.parentNode.replaceChild(span, node);
                return seqNum;
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            let children = Array.from(node.childNodes);
            children.forEach(child => {
                seqNum = highlightNode(child, seqNum);
            });
        }
        return seqNum;
    }

    highlightNode(document.body);
    return uniqueId;
}

function removeHighlighting(uniqueId) {
    // Select all highlighted elements with the unique ID
    const highlightedElements = document.querySelectorAll(`[data-highlight-id='${uniqueId}']`);

    highlightedElements.forEach(element => {
        // Create a text node with the original text
        const textNode = document.createTextNode(element.textContent);

        // Replace the highlighted element with the text node
        element.parentNode.replaceChild(textNode, element);

        // If the parent was a span created for highlighting, and now only contains text, unwrap it
        if (element.parentNode.nodeName === 'SPAN' && element.parentNode.childNodes.length === 1) {
            const parent = element.parentNode;
            while (parent.firstChild) {
                parent.parentNode.insertBefore(parent.firstChild, parent);
            }
            parent.parentNode.removeChild(parent);
        }
    });
}

// the session token is not completed as yet
function get_username_from_sessiontoken(token) {

    return (JSON.parse(token)).userid;

}

function get_displayname_from_sessiontoken(token) {

    return (JSON.parse(token)).displayname;

}

function utf8_to_b64(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
}

function b64_to_utf8(str) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
}

function isUndefined(variable) {
    return typeof variable === 'undefined';
}

///
function page_update(request, sender, sendResponse) {
    console.debug("browsersolutions request: " + JSON.stringify(request));

    return new Promise((resolve, reject) => {
        // chose which function to proceed with
        var shared_secret_to_identify_background_js_to_content_script_NoteSelectedHTML = "Glbx_marker6";
        console.debug("request0: " + request.action);

        const position = request.position;
        console.log("update_notes_on_page, position: " + position);

        if (position == 1 || position == "1") {
            // close all notes on this page
            console.debug("browsersolutions: " + "close all notes on this page");
            removeAllNotes();
            resolve();
        } else if (position == 2 || position == "2") {
            // close all notes on this page that are not the users' own

            // check for own notes pertaining to this URL
            console.debug("browsersolutions: " + "check for own notes pertaining to this URL");
            getOwnNotes();
            removeSubscribedNotes();
            resolve(true);

            checkValueAndTriggerFunction();

        } else if (position == 3 || position == "3") {
            // get all in-scope notes for this page

            console.debug("browsersolutions: " + "get all in-scope notes for this page");

            getOwnNotes();
            getSubscribedNotes();
            resolve(true);

        }

    });

    // noteSelectedHTML(request, sender, sendResponse).then(function (res) {
    //       console.log(res);

    //});

}

function checkValueAndTriggerFunction() {
    console.debug("browsersolutions #checkValueAndTriggerFunction");
    // Define your regex pattern here
    const regexPattern = /.*/; // Replace with your actual pattern

    // Retrieve the value from chrome.storage.sync
    chrome.storage.sync.get(['setNoteFocusTo'], function (result) {
        console.debug(result);
        if (result.setNoteFocusTo && regexPattern.test(result.setNoteFocusTo)) {
            // If the value is set and matches the regex, call the desired function
            moveFocusToNote(result.setNoteFocusTo);
            // wipe the value


        } else {
            console.log('Value is not set or does not match the regex');
        }
    });
}

function moveFocusToNote(noteid) {
    try {
        // Function logic here
        console.log('yourFunctionToTrigger triggered with value:', noteid);
        const note_root = document.querySelectorAll('[type="yellownote"][noteid="' + noteid + '"]')[0];

        // Find the element
        const element = note_root.querySelector('[name="whole_note_table"]');

        // Check if the element exists
        if (element) {
            // Scroll the element into view
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        } else {
            console.log('Element not found: ' + elementId);
        }
    } catch (e) {
        //console.error(e);
    }
}

function removeSubscribedNotes() {
    console.log("removeSubscribedNotes");
    // remove not not belonging to this user

    console.debug(document.querySelectorAll('container[class="yellownotecontainer"] , div[class="yellownotecontainer"]'));

    document.querySelectorAll('container[class="yellownotecontainer"] , div[class="yellownotecontainer"]').forEach(function (a) {
        // check if this is user's own note or not
        console.log("removing a note" + a);
        remove_note(a);
    });

}

function removeAllNotes() {
    console.log("removeAllNotes");
    console.debug(document.querySelectorAll('container[class="yellownotecontainer"] , div[class="yellownotecontainer"]'));

    document.querySelectorAll('container[class="yellownotecontainer"] , div[class="yellownotecontainer"]').forEach(function (a) {
        // check if this is user's own note or not
        console.log("removing a note" + a);
        remove_note(a);
    });

}

function remove_noteid(noteid) {
    console.log("# remove_noteid (" + noteid + ")");
    //    var note_root = document.querySelectorAll('[type="yellownote"]')[0];
    console.debug(document.querySelectorAll('[class][note_type][noteid="' + noteid + '"]')[0]);
    console.debug(document.querySelectorAll('[note_type][noteid="' + noteid + '"]')[0]);
    console.debug(document.querySelectorAll('[noteid="' + noteid + '"]')[0]);
    var note_root = document.querySelectorAll('[class][note_type][noteid="' + noteid + '"]')[0];
    console.debug(note_root);
    //if (note_root != null || note_root != undefined) {
    remove_note(note_root);
    //}
}

function remove_note(noteroot) {
    console.debug("browsersolutions #remove_note");
    console.debug(noteroot);
    try {
        // Usage
        removeAllIframes(noteroot);

        // if (noteroot == null || noteroot == undefined) {
        //     console.debug("no valid input");

        // } else {
        // console.debug(noteroot);

        try {
            //unmark_selection_text(noteroot);
        } catch (f) {
            console.error(f);
        }

        console.debug("closing...");
        console.debug(noteroot);
        noteroot.parentNode.removeChild(noteroot);
        //}

    } catch (e) {
        console.error(e);
    }
}

function removeAllIframes(noteroot) {
    console.log("removeAllIframes");
    try {
        var iframes = noteroot.querySelectorAll('iframe');
        console.log(iframes);
        iframes.forEach(function (iframe) {
            if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
            }
        });

        console.log(iframes.length + ' iframes removed');
    } catch (e) {
        console.error(e);
    }
}

function getOwnNotes() {
    console.log("browsersolutions getOwnNotes");
    var notes_found;
    var note_template_html;
    var note_template;
const isOwner = true;
const newNote = false;
    var url = window.location.href.trim();
    var msg;

    // check for own notes pertaining to this URL
    msg = {
        message: {
            "action": "get_own_applicable_stickynotes",
            "url": url
        }
    }
    console.log("browsersolutions " + JSON.stringify(msg));
    chrome.runtime.sendMessage(msg).then(function (response) {
        console.debug("browsersolutions" + "message sent to backgroup.js with response: " + JSON.stringify(response));
        notes_found = response;

        mydetails = {};

        // how many notes came back ?
        //console.debug("browsersolutions, notes found: " + notes_found.length);
        console.debug(response);
        if (Object.keys(response).length > 0) {

            console.debug("browsersolutions notes found: " + Object.keys(response).length);

            // loop through all notes and place them on page
            var i = 0;
            var promiseArray = [];

            notes_found.forEach(function (note) {
                i++;
                console.debug("browsersolutions " + "##### " + i + " ##########################");
                //console.log("browsersolutions " + note);
                //var value = notes_found[key];
                //console.debug(note);
                //console.log("browsersolutions " + (note.json));
                const note_data = JSON.parse(note.json);
                console.log(note_data);
                // iteration code
                // is the note already in place ?

                var brand = "";
                if (note_data.hasOwnProperty('brand')) {
                    brand = note_data.brand;
                } else {
                    note_data.brand = "";
                    brand = "";
                }
                console.debug("browsersolutions brand of note: " + note_data.brand);

                // examine the note data to see if it has a distribution list.
                // This information in not contined inside the node oject itself but is maintained in a separate database field
                if (note.hasOwnProperty('distributionlistid')) {
                    note_data.distributionlistid = note.distributionlistid;

                } else {
                    // make sure to wipe any distribution list id that may have been set before, inside the note object
                    try {
                        delete note_data.distributionlistid
                    } catch (e) {
                        console.error(e);
                    }
                }

                // determine what type of note this is
                var note_type;
                if (note_data.hasOwnProperty('note_type')) {
                    note_type = note_data.note_type;
                } else if (note_data.hasOwnProperty('type')) {
                    note_type = note_data.type;

                    // check what other attribute which present my indicate note type
                } else if (note_data.hasOwnProperty('content_url')) {
                    note_data.note_type = "webframe";
                    note_type = "webframe";
                } else {
                    // set the default to be yellownote
                    note_data.note_type = "yellownote";
                    note_type = "yellownote";
                }
                console.log(note_data);
                console.debug("browsersolutions note_type of note: " + note_type);
                note_data.note_type = note_type;
                // creatorid of note - this is returned from the database as metadata on the note object.
                // Insert it into the note data object
                if (note.hasOwnProperty('creatorid')) {
                    note_data.creatorid = note.creatorid;

                    // check what other attribute which present my indicate note type

                }
                if (note.hasOwnProperty('displayname')) {
                    note_data.displayname = note.displayname;

                    // check what other attribute which present my indicate note type

                }

                if (isNoteOnPage(note_data.noteid)) {
                    console.debug("browsersolutions note IS already on page");
                } else {
                    console.debug("browsersolutions note IS NOT already on page");
                    // has page been scanned ?
                    if (!page_scanned) {

                        // } else {
                        // Carry out scan
                        scan_page();
                        page_scanned = true;
                    }
                    // what brand should be used for the note. Set default it nothing else is applicable for this user (this is the user's own notes)
                    var brand = "default";
                    chrome.storage.local.get([plugin_session_header_name]).then(function (session) {
                        brand = get_brand_from_sessiontoken(session[plugin_session_header_name]);
                        if (isUndefined(brand) || brand == null || brand == '' || brand == 'undefined') {
                            brand = "default";

                        }
                        // Collect template
                        console.debug("collect template based on brand (" + brand + "), note type (" + note_data.note_type + ")");
                        let promise = new Promise((resolve, reject) => {
                                chrome.runtime.sendMessage({
                                    action: "get_template",
                                    brand: brand,
                                    note_type: note_data.note_type

                                }).then(function (response) {
                                    //console.debug("browsersolutions message sent to background.js with response: " + JSON.stringify(response));
                                    const note_template = response;
                                    // console.debug("browsersolutions note_template: " + note_template);
                                    console.debug("browsersolutions resolve");
                                    var template = safeParseInnerHTML(note_template, 'div');
                                    console.debug("browsersolutions calling placeStickyNote");
                                    placeStickyNote(note_data, template, mydetails , isOwner, newNote);
                                    resolve({
                                        note_data,
                                        note_template
                                    });
                                }).catch(reject);
                            });

                        console.log("notes to be placed: " + promiseArray.length);
                        promiseArray.push(promise);
                        console.log("notes to be placed: " + promiseArray.length);
                    });

                }
                console.log("notes to be placed: " + promiseArray.length);

            });
            console.log("notes to be placed: " + promiseArray.length);

            // loop through the list of all notes found, and place them on the page
            Promise.all(promiseArray).then(results => {
                results.forEach(result => {
                    //console.debug(result.note_template);
                    var note_template = safeParseInnerHTML(result.note_template, 'div');
                    console.debug("browsersolutions placeStickyNote");
                    placeStickyNote(result.note_data, note_template, mydetails , isOwner, newNote);
                });
            }).catch(error => {
                console.error("An error occurred: ", error);
            });

        } else {
            console.debug("browsersolutions no notes found");
            // terminate here
        }

    });
}

function update_note(event) {
    console.debug("browsersolutions #update_note");
    console.debug(event);

    // save note to database
    try {
        // get the table node that is the root of the note data.

        var note_root = getYellowStickyNoteRoot(event.target);
        console.log(note_root);

        // var note_table = event.target.parentNode.parentNode.parentNode;
        // console.debug(note_table);
        var selection_text = "";
        try {
            selection_text = note_root.querySelectorAll('input[name="selection_text"]')[0].textContent.trim();
        } catch (e) {
            // set default, current timestamp
        }

        console.debug(selection_text);

        var note_type = "yellownote";
        try {
            note_type = note_root.getAttribute('note_type').trim();
        } catch (e) {
            note_type = "yellownote";
            // set default, current timestamp
        }
        var url = "";
        try {
            url = note_root.querySelectorAll('input[name="url"]')[0].textContent.trim();
        } catch (e) {
            // set default, local url
        }
        var noteid = "";
        try {
            noteid = note_root.getAttribute('noteid').trim();
        } catch (e) {
            // set default, local url
        }

        // carry createtime forwards unchanged
        var createtime = "";
        try {
            createtime = note_root.querySelectorAll('input[name="createtime"]')[0].textContent.trim();
        } catch (e) {
            // set default, current timestamp
            createtime = getCurrentTimestamp();

        }

        var content_url = "";
        // check for content_url for notes that collect content from elsewhere
        try {
            content_url = note_root.querySelector('input[id="urlInput"]').value.trim();
        } catch (e) {}

        var message_display_text = "";
        try {
            //console.debug(note_root.querySelectorAll('[name="message_display_text"]')[0]);
            //console.debug(note_root.querySelectorAll('[name="message_display_text"]')[0].value);
            console.debug(note_root.querySelectorAll('[name="message_display_text"]')[0].value.trim())
            console.debug(utf8_to_b64(note_root.querySelectorAll('[name="message_display_text"]')[0].value.trim()));
            message_display_text = note_root.querySelectorAll('[name="message_display_text"]')[0].value.trim();
        } catch (e) {}

        var enabled = "";
        try {
            enabled = note_root.querySelectorAll('input[name="enabled"]')[0].textContent.trim();
        } catch (e) {
            // set default
            enabled = true;
        }

        // the list of distribution lists is a dropdown. There is an empty field there where the user can select "no distribution list"


        var distributionlistid;
        try {
            distributionlistid = note_root.querySelector('[name="distributionlistdropdown"]').value;
            console.log('Selected distributionlistid:', distributionlistid);
        } catch (e) {
            console.error(e);
        }

        // create out position parameters

        // var note_root = note_table.parentNode;
        // console.debug(note_root);

        // capture new positon and size of note

        //const posx = processBoxParameterInput(note_root.getAttribute("posx"), 0, 0, 1200);
        const posx = note_root.getAttribute("posx");

        //const posy = processBoxParameterInput(note_root.getAttribute("posy"), 0, 0, 5000);
        const posy = note_root.getAttribute("posy");

        //const box_width = processBoxParameterInput(note_root.getAttribute("box_width"), 250, 50, 500);
        const box_width = note_root.getAttribute("box_width");

        //const box_height = processBoxParameterInput(note_root.getAttribute("box_height"), 250, 50, 500);
        const box_height = note_root.getAttribute("box_height");

        console.debug("message_display_text: " + message_display_text);
        console.debug("url: " + url);
        console.debug("noteid: " + noteid);

        console.debug("selection_text: " + selection_text);

        // Encode the String
        var encodedString = utf8_to_b64(selection_text);
        console.log(encodedString); // Outputs: "SGVsbG8gV29ybGQh"
        console.log(b64_to_utf8(encodedString)); // Outputs: "Hello World!"


        const json_update = {
            message_display_text: utf8_to_b64(message_display_text),
            selection_text: encodedString,
            url: url,
            note_type: note_type,
            noteid: noteid,
            enabled: "true",
            content_url: content_url,
            distributionlistid: distributionlistid,
            posx: posx,
            posy: posy,
            box_width: box_width,
            box_height: box_height
        };
        console.debug(JSON.stringify(json_update));

        // Send save request back to background
        // Stickynotes are always enabled when created.
        chrome.runtime.sendMessage({
            message: {
                "action": "single_yellownote_update",
                "update_details": json_update
            }
        }, function (response) {
            console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));

        });

    } catch (e) {
        console.error(e);
    }
}

function getCurrentTimestamp() {

    // compute current timestamp
    var today = new Date();

    var YYYY = today.getFullYear();
    var MM = (today.getMonth() + 1);
    var DD = (today.getDate() + 1);

    if (MM < 10) {
        MM = "0" + MM;
    }

    if (DD < 10) {
        DD = "0" + DD;
    }

    var HH = (today.getHours() + 1);

    if (HH < 10) {
        HH = "0" + HH;
    }

    var mm = (today.getMinutes() + 1);

    if (mm < 10) {
        mm = "0" + mm;
    }

    var ss = (today.getSeconds() + 1);

    if (ss < 10) {
        ss = "0" + ss;
    }

    var dateTime = YYYY + MM + DD + HH + mm + ss;

    //console.debug(dateTime);
    return dateTime;
}

function unmark_selection_text(sticky_note_node) {
    console.debug("# unmark_selection_text");
    // unmark the selection text
    try {
        var marked = sticky_note_node.nextSibling;
        if (marked != null) {
            console.debug(marked);

            // iterate through all child noed and place them prior to this node

            console.debug(marked.childNodes.length)
            for (var i = 0; i < marked.childNodes.length; i++) {
                console.debug(marked.childNodes[i]);

                var insertedNode = marked.parentNode.insertBefore(marked.childNodes[i], marked);

            }
            // remove the span node enveloping the selection text and giving it a highlight.
            marked.remove();
        }
    } catch (e) {
        console.debug(e);
    }
}

function getSubscribedNotes() {
    console.log("browsersolutions getSubscribedNotes noteAudience: ");
    var notes_found;
    var note_template_html;
    var note_template;
const isOwner = false;
const newNote = false;
    var url = window.location.href.trim();

    // check for own notes pertaining to this URL
    const msg = {
        message: {
            "action": "get_url_subscribed_yellownotes",
            "url": url
        }
    }

    console.log("browsersolutions " + JSON.stringify(msg));
    chrome.runtime.sendMessage(msg).then(function (response) {
        console.debug("browsersolutions" + "message sent to backgroup.js with response: " + JSON.stringify(response));
        notes_found = response;

        var brand = "";

        var displayname = "";

        // how many notes came back ?
        //console.debug("browsersolutions, notes found: " + notes_found.length);
        console.debug(response);
        if (Object.keys(response).length > 0) {

            console.debug("browsersolutions notes found: " + Object.keys(response).length);

            // loop through all notes and place them on page
            var i = 0;
            var promiseArray = [];

            notes_found.forEach(function (note) {
                i++;
                console.debug("browsersolutions " + "##### " + i + " ##########################");
                console.log("browsersolutions " + note);
                //var value = notes_found[key];
                //console.debug(note);
                //console.log("browsersolutions " + (note.json));
                const note_data = JSON.parse(note.json);
                console.log(note_data);
                // iteration code
                // is the note already in place ?

                if (note_data.hasOwnProperty('brand')) {
                    brand = note_data.brand;
                    console.debug("browsersolutions brand of note: " + note_data.brand);

                } else {
                    note_data.brand = "default";
                    brand = "default";
                }

                const creatorDetails = note.creatorDetails;
                // is there a displayname attached to the note data ?
                if (note_data.hasOwnProperty('displayname')) {
                    displayname = note_data.displayname;
                    console.debug("browsersolutions displayname of note: " + note_data.displayname);

                } else {
                    // is there a displayname attached to the user profile (also included in the creatorDetails child-object) ?

                    console.debug(creatorDetails);
                    console.debug(creatorDetails.displayname);
                    displayname = creatorDetails.displayname;
                }

                if (note.hasOwnProperty('creatordisplayname')) {
                    note_data.displayname = note.creatordisplayname;

                }

                // is there a banner image ?
                var banner_image = "";
                if (creatorDetails.hasOwnProperty('banner_image')) {
                    banner_image = creatorDetails.banner_image;
                    console.debug("browsersolutions banner_image of note: " + banner_image);
                }

                if (note.hasOwnProperty('distributionlistname')) {
                    //const distlist_name = note.distributionlistname;
                    console.debug("browsersolutions distributionlist of note: " + note.distributionlistname);
                    // include the name of the distribution list the note came from in the note data
                    note_data.distributionlistname = note.distributionlistname;
                }
                // examine the note data to see if it has a distribution list.
                // This information in not contined inside the node oject itself but is maintained in a separate database field
                if (note.hasOwnProperty('distributionlistid')) {
                    note_data.distributionlistid = note.distributionlistid;

                } else {
                    // make sure to wipe any distribution list id that may have been set before, inside the note object
                    try {
                        delete note_data.distributionlistid
                    } catch (e) {
                        console.error(e);
                    }
                }

                const creatorid = note.creatorid;
                console.debug("browsersolutions creatorid of note: " + creatorid);
                // include the name of the creatorid the note came from in the note data
                note_data.creatorid = creatorid;

                // determine what type of note this is
                var note_type;
                if (note_data.hasOwnProperty('note_type')) {
                    note_type = note_data.note_type;

                    // check what other attribute which present my indicate note type
                } else if (note_data.hasOwnProperty('content_url')) {
                    note_data.note_type = "webframe";
                    note_type = "webframe";
                } else {
                    // set the default to be yellownote
                    note_data.note_type = "yellownote";
                    note_type = "yellownote";
                }
                console.log(note_data);
                console.debug("browsersolutions note_type of note: " + note_type);

                if (isNoteOnPage(note_data.noteid)) {
                    console.debug("browsersolutions note IS already on page");
                } else {
                    console.debug("browsersolutions note IS NOT already on page");
                    // has page been scanned ?
                    if (!page_scanned) {

                        // } else {
                        // Carry out scan
                        scan_page();
                        page_scanned = true;

                    }
                    // what brand should be used for the note. Set default it nothing else is applicable for this user (this is the user's own notes)
                    var brand = "default";
                    chrome.storage.local.get([plugin_session_header_name]).then(function (session) {
                        brand = get_brand_from_sessiontoken(session[plugin_session_header_name]);
                        if (isUndefined(brand) || brand == null || brand == '' || brand == 'undefined') {
                            brand = "default";

                        }
                        // Collect template
                        console.debug("collect template based on brand (" + brand + "), note type (" + note_type + ")");
                        let promise = new Promise((resolve, reject) => {
                                chrome.runtime.sendMessage({
                                    action: "get_template",
                                    brand: brand,
                                    note_type: note_type

                                }).then(function (response) {
                                    //console.debug("browsersolutions message sent to background.js with response: " + JSON.stringify(response));
                                    const note_template = response;
                                    // console.debug("browsersolutions note_template: " + note_template);
                                    console.debug("browsersolutions resolve");
                                    var template = safeParseInnerHTML(note_template, 'div');
                                    console.debug("browsersolutions placeStickyNote");
                                    placeStickyNote(note_data, template, note.creatorDetails, isOwner, newNote);
                                    resolve({
                                        note_data,
                                        note_template
                                    });
                                }).catch(reject);
                            });

                        console.log("notes to be placed: " + promiseArray.length);
                        promiseArray.push(promise);
                        console.log("notes to be placed: " + promiseArray.length);
                    });

                }
                console.log("notes to be placed: " + promiseArray.length);

            });
            console.log("notes to be placed: " + promiseArray.length);

            // loop through the list of all notes found, and place them on the page
            Promise.all(promiseArray).then(results => {
                results.forEach(result => {
                    //console.debug(result.note_template);
                    var note_template = safeParseInnerHTML(result.note_template, 'div');
                    // Call procedure that places the notes in thep age with the isOwner flag set to false, since these notes belong to others.
                    // The practical effect of this is to remove all buttons to perform edit-actions on the note, such as edit, delete, etc.
                    console.debug("browsersolutions placeStickyNote");
                    placeStickyNote(result.note_data, note_template, note.creatorDetails, isOwner, newNote);
                });
            }).catch(error => {
                console.error("An error occurred: ", error);
            });

        } else {
            console.debug("browsersolutions no notes found");
            // terminate here
        }

    });
}

var page_scanned = false;

function getAllNotes() {
    console.log("browsersolutions getAllNotes noteAudience: ");
    var notes_found;
    var note_template_html;
    var note_template;

const isOwner = false;
const newNote = false;

    var url = window.location.href.trim();

    // check for own notes pertaining to this URL
    const msg = {
        message: {
            "action": "get_all_available_yellownotes",
            "url": url
        }
    }

    console.log("browsersolutions " + JSON.stringify(msg));
    chrome.runtime.sendMessage(msg).then(function (response) {
        console.debug("browsersolutions" + "message sent to backgroup.js with response: " + JSON.stringify(response));
        notes_found = response;

        // how many notes came back ?
        //console.debug("browsersolutions, notes found: " + notes_found.length);
        console.debug(response);
        if (Object.keys(response).length > 0) {

            console.debug("browsersolutions notes found: " + Object.keys(response).length);

            // loop through all notes and place them on page
            var i = 0;
            var promiseArray = [];

            notes_found.forEach(function (note) {
                i++;
                console.debug("browsersolutions " + "##### " + i + " ##########################");
                //console.log("browsersolutions " + note);
                //var value = notes_found[key];
                //console.debug(note);
                //console.log("browsersolutions " + (note.json));
                const note_data = JSON.parse(note.json);
                console.log(note_data);
                // iteration code
                // is the note already in place ?

                var brand = "";
                if (note_data.hasOwnProperty('brand')) {
                    brand = note_data.brand;
                } else {
                    note_data.brand = "";
                    brand = "";
                }
                console.debug("browsersolutions brand of note: " + note_data.brand);
                // examine the note data to see if it has a distribution list.
                // This information in not contined inside the node oject itself but is maintained in a separate database field
                if (note.hasOwnProperty('distributionlistid')) {
                    note_data.distributionlistid = note.distributionlistid;

                } else {
                    // make sure to wipe any distribution list id that may have been set before, inside the note object
                    try {
                        delete note_data.distributionlistid
                    } catch (e) {
                        console.error(e);
                    }
                }

                // determine what type of note this is
                var note_type;
                if (note_data.hasOwnProperty('note_type')) {
                    note_type = note_data.note_type;

                    // check what other attribute which present my indicate note type
                } else if (note_data.hasOwnProperty('content_url')) {
                    note_data.note_type = "webframe";
                    note_type = "webframe";
                } else {
                    // set the default to be yellownote
                    note_data.note_type = "yellownote";
                    note_type = "yellownote";
                }
                console.log(note_data);
                console.debug("browsersolutions note_type of note: " + note_type);

                if (isNoteOnPage(note_data.noteid)) {
                    console.debug("browsersolutions note IS already on page");
                } else {
                    console.debug("browsersolutions note IS NOT already on page");
                    // has page been scanned ?
                    if (!page_scanned) {

                        // } else {
                        // Carry out scan
                        scan_page();
                        page_scanned = true;

                    }
                    // what brand should be used for the note. Set default it nothing else is applicable for this user (this is the user's own notes)
                    var brand = "default";
                    chrome.storage.local.get([plugin_session_header_name]).then(function (session) {
                        brand = get_brand_from_sessiontoken(session[plugin_session_header_name]);
                        if (isUndefined(brand) || brand == null || brand == '' || brand == 'undefined') {
                            brand = "default";
                        }
                        // Collect template
                        console.debug("collect template based on brand (" + brand + "), note type (" + note_type + ")");
                        let promise = new Promise((resolve, reject) => {
                                chrome.runtime.sendMessage({
                                    action: "get_template",
                                    brand: brand,
                                    note_type: note_type

                                }).then(function (response) {
                                    //console.debug("browsersolutions message sent to background.js with response: " + JSON.stringify(response));
                                    const note_template = response;
                                    // console.debug("browsersolutions note_template: " + note_template);
                                    console.debug("browsersolutions resolve");
                                    var template = safeParseInnerHTML(note_template, 'div');
                                    console.debug("browsersolutions placeStickyNote");
                                    placeStickyNote(note_data, template, note.creatorDetails, isOwner, newNote);
                                    resolve({
                                        note_data,
                                        note_template
                                    });
                                }).catch(reject);
                            });

                        console.log("notes to be placed: " + promiseArray.length);
                        promiseArray.push(promise);
                        console.log("notes to be placed: " + promiseArray.length);
                    });

                }
                console.log("notes to be placed: " + promiseArray.length);

            });
            console.log("notes to be placed: " + promiseArray.length);

            // loop through the list of all notes found, and place them on the page
            Promise.all(promiseArray).then(results => {
                results.forEach(result => {
                    //console.debug(result.note_template);
                    var note_template = safeParseInnerHTML(result.note_template, 'div');
                    console.debug("browsersolutions placeStickyNote");
                    placeStickyNote(result.note_data, note_template, note.creatorDetails, isOwner, newNote);
                });
            }).catch(error => {
                console.error("An error occurred: ", error);
            });
        } else {
            console.debug("browsersolutions no notes found");
            // terminate here
        }
    });
}

// scan all the text on the page, with a view to later making a pattern match with the selected text contained in the note
function scan_page() {
    console.debug("browsersolutions  #scan_page");
    var doc = window.document,
    body = doc.body,
    selection,
    range,
    bodyText;
    //  console.debug(doc);
    //   console.debug(doc.nodeName);
    // root
    var root_node = doc.documentElement;
    //console.debug(root_node);
    whole_page_text = "";
    //console.debug("1.2.0");

    // exec traversal
    var rc = traverse(doc.documentElement);
    //  The data describing the text strucutre of the document is no populated into textnode_map
    //console.debug("browsersolutions "+rc);

    //console.debug(whole_page_text);

    // contain node object and the position within overall text (white space removed)

    //console.debug(textnode_map);

}

function getSelectionTextDOMPosition(selection_text) {
    var doc = window.document,
    body = doc.body,
    selection,
    range,
    bodyText;

    console.debug(doc);
    console.debug("browsersolutions: " + doc.nodeName);
    // root
    var root_node = doc.documentElement;
    //console.debug(root_node);

    whole_page_text = "";
    console.debug("browsersolutions: " + traverse(doc.documentElement));
    console.debug("browsersolutions: " + "################################################");
    // console.debug("browsersolutions: " +whole_page_text);
    // console.debug("browsersolutions: " +textnode_map);

    // console.debug("browsersolutions: " +whole_page_text.replace(/\s/g, ""));
    //console.debug(selectionText.replace(/\s/g,""));
    // remove all whitespace before making attempt to place selection inside larger text


    //console.debug("browsersolutions: " + "note: " + JSON.stringify(note_obj));
    // locate where this note goes.
    // var noteid = note_obj.noteid;
    // var obj = JSON.parse(note_obj.json);
    // Create Base64 Object


    // Decode the String containing the selection text
    //console.debug("browsersolutions: selection_text: " + note_obj.selection_text);
    //var selection_text = "";
    try {
        if (selection_text != "" && selection_text != null) {

            console.debug("browsersolutions: selection_text: " + selection_text);

            // fiund where in the DOM the selection text is found (if at all)
            var {
                selection_matched_in_document,
                start_range_node,
                start_offset,
                end_range_node,
                end_offset
            } = getDOMplacement(selection_text);

            console.log("selection_matched_in_document: " + selection_matched_in_document);
            console.debug("browsersolutions: start_range_node");
            console.log(start_range_node);
            console.log("start_offset: " + start_offset);
            console.log(end_range_node);
            console.log("end_offset: " + end_offset);
            // if the selection text that should be use to anchor the note in the document found, switch to using the coordinates contained in the note
            const out = {
                selection_matched_in_document: selection_matched_in_document,
                start_range_node: start_range_node,
                start_offset: start_offset,
                end_range_node: end_range_node,
                end_offset: end_offset

            }
            return out;
        } else {
            console.debug("browsersolutions: no selection text");
            selection_matched_in_document = false;
            const out = {
                selection_matched_in_document: false,
                start_range_node: null,
                start_offset: null,
                end_range_node: null,
                end_offset: null

            }
            return out;
        }
    } catch (e) {
        console.error(e);
        console.debug("browsersolutions: no selection text");
        selection_matched_in_document = false;
        const out = {
            selection_matched_in_document: false,
            start_range_node: null,
            start_offset: null,
            end_range_node: null,
            end_offset: null

        }
        return out;
    }

}
/*
note_obj contains the data that populated the note

note_template contains the html making up the DOM tree of the note, including all styling and graphical elements.
There are no external references; The note is self contained.


First attempt to use the selction text in the note to place the note in the document. If there are no selection text, use the coordinates in the note to place the note. If there are no coordinates, place the note on top of the page.

 * */

function placeStickyNote(note_obj, note_template, creatorDetails, isOwner, newNote) {
    console.debug("browsersolutions: ###placeStickyNote.start");
    // contenttype
    // permitted values: text, html, embeded, linked
    console.debug(note_obj);
    console.debug(note_template);
    console.debug(creatorDetails);
    console.debug(isOwner);

    // create the note object, populated with data

    /* determine where on the page the note goes

    Check in the following order
    1. Does the note have a selectiontext string and is this string on the page? If so place the note next to this selection
    2. Does the note have coordinates, if use use them
    3. Use the cursor position

     */
    //var out = getSelectionTextPosition(note_obj);


    if (typeof note_obj == 'undefined') {
        // nothing to do
    } else {
        // if noe note, just use cursor position
        if (newNote) {
            console.debug("browsersolutions: newnote=" + newNote);
        } else {

            if (note_obj.selection_text == "") {
                // if no selection_text, only position co-ordinates can place the note

                try {
                    console.debug("browsersolutions: calling: create_stickynote_node");
                    create_stickynote_node(note_obj, note_template, creatorDetails, isOwner, newNote).then(function (response) {
                        var newGloveboxNode = response;

                        console.debug(newGloveboxNode);
                        console.debug("browsersolutions: calling: size_and_place_note_based_on_coordinates");
                        size_and_place_note_based_on_coordinates(newGloveboxNode, note_obj, isOwner, newNote);
                        console.debug("browsersolutions: calling: attachEventlistenersToYellowStickynote");
                        attachEventlistenersToYellowStickynote(newGloveboxNode);
                        // make some parts visible and other not visible
                        if (isOwner) { // if the note is the user's own note, then make the edit buttons visible
                            console.debug("browsersolutions: makeEditButtonsVisible");
                            console.debug("calling setComponentVisibility");
                            setComponentVisibility(newGloveboxNode, ",rw,.*normalsized");
                        } else {
                            console.debug("browsersolutions: makeEditButtonsInvisible");
                            setComponentVisibility(newGloveboxNode, ",ro,.*normalsized");
                        }

                        // Make the stickynote draggable:
                        console.debug("browsersolutions: makeDragAndResize");
                        makeDragAndResize(newGloveboxNode);
                    });
                } catch (e) {
                    console.debug("browsersolutions " + e);
                }

            } else {
                console.debug("browsersolutions: attempt selection text macthing");
                // check if note contains position coordinates/parameters. If so, try to use them to place the note.


                //var background_to_NoteSelectedHTML_sharedsecret = "Glbx_marker6";

                // Use the presence of the dummy value "Glbx_marker" in the request as a
                // insecure "shared secret" to try to ensure only request from the
                // background.js are accepted.
                // This must be improved.
                try {

                    var doc = window.document,
                    body = doc.body,
                    selection,
                    range,
                    bodyText;

                    console.debug(doc);
                    console.debug("browsersolutions: " + doc.nodeName);
                    // root
                    var root_node = doc.documentElement;
                    //console.debug(root_node);

                    whole_page_text = "";
                    console.debug("browsersolutions: " + traverse(doc.documentElement));
                    console.debug("browsersolutions: " + "################################################");
                    // console.debug("browsersolutions: " +whole_page_text);
                    // console.debug("browsersolutions: " +textnode_map);

                    // console.debug("browsersolutions: " +whole_page_text.replace(/\s/g, ""));
                    //console.debug(selectionText.replace(/\s/g,""));
                    // remove all whitespace before making attempt to place selection inside larger text


                    console.debug("browsersolutions: " + "note: " + JSON.stringify(note_obj));
                    // locate where this note goes.
                    var noteid = note_obj.noteid;
                    // var obj = JSON.parse(note_obj.json);
                    // Create Base64 Object


                    // Decode the String containing the selection text
                    console.debug("browsersolutions: selection_text: " + note_obj.selection_text);
                    var selection_text = "";
                    try {
                        if (!isUndefined(note_obj.selection_text) && note_obj.selection_text != "" || note_obj.selection_text != null) {

                            if (newNote) {

                                selection_text = note_obj.selection_text;

                            } else {
                                // for existing notes, the selction text has been base64 encoded before storage
                                selection_text = b64_to_utf8(note_obj.selection_text);

                            }
                            console.debug("browsersolutions: selection_text: " + selection_text);

                            // fiund where in the DOM the selection text is found (if at all)
                            var {
                                selection_matched_in_document,
                                start_range_node,
                                start_offset,
                                end_range_node,
                                end_offset
                            } = getDOMplacement(selection_text, note_obj);

                            console.log("selection_matched_in_document: " + selection_matched_in_document);
                            console.debug("browsersolutions: start_range_node");
                            console.log(start_range_node);
                            console.log("start_offset: " + start_offset);
                            console.log(end_range_node);
                            console.log("end_offset: " + end_offset);
                            // if the selection text that should be use to anchor the note in the document found, switch to using the coordinates contained in the note
                        } else {
                            console.debug("browsersolutions: no selection text");
                            selection_matched_in_document = false;
                        }
                    } catch (e) {
                        console.error(e);
                        console.debug("browsersolutions: no selection text");
                        selection_matched_in_document = false;
                    }

                    if (selection_matched_in_document) {

                        console.debug("browsersolutions: selection_matched_in_document " + selection_matched_in_document);

                        console.debug(start_range_node.textContent);
                        let original_start_range_node_textcontent = start_range_node.textContent;
                        console.debug("browsersolutions: start_range_node start_offset " + start_offset);
                        console.debug("browsersolutions: start_range_node total text length: " + start_range_node.textContent.length);

                        console.debug("browsersolutions: end_range_node");
                        console.debug(end_range_node.textContent);
                        console.debug("browsersolutions: end_range_node end_offset " + end_offset);
                        console.debug("browsersolutions: end_range_node total text length: " + end_range_node.textContent.length);
                        console.debug("browsersolutions: nodesAreIdentical:" + nodesAreIdentical(start_range_node, end_range_node));
                        // create message box and anchor it
                        //console.debug("1.1.3");
                        // create html of tooltip
                        //var it2 = document.createElement("div");

                        //it2.setAttribute("class", 'xstooltip');

                        // create the yellow note, later attach it to the right location in the DOM
                        console.debug("browsersolutions: calling: create_stickynote_node");
                        create_stickynote_node(note_obj, note_template, creatorDetails, isOwner, newNote).then(function (response) {
                            var newGloveboxNode = response;

                            console.debug(newGloveboxNode);
                            var newGloveboxNode = response;

                            console.debug(newGloveboxNode);
                            console.debug("browsersolutions: calling: size_and_place_note_based_on_coordinates");
                            size_and_place_note_based_on_coordinates(newGloveboxNode, note_obj, isOwner, newNote);
                            console.debug("browsersolutions: calling: attachEventlistenersToYellowStickynote");
                            attachEventlistenersToYellowStickynote(newGloveboxNode);
                            // make some parts visible and other not visible
                            if (isOwner) { // if the note is the user's own note, then make the edit buttons visible
                                console.debug("browsersolutions: makeEditButtonsVisible");
                                console.debug("calling setComponentVisibility");
                                setComponentVisibility(newGloveboxNode, ",rw,.*normalsized");
                            } else {
                                console.debug("browsersolutions: makeEditButtonsInvisible");
                                setComponentVisibility(newGloveboxNode, ",ro,.*normalsized");
                            }

                            // Make the stickynote draggable:
                            console.debug("browsersolutions: makeDragAndResize");
                            makeDragAndResize(newGloveboxNode);

                            //return;
                        });

                    } else {
                        // the selection text was not found in the document...
                        // look for coordinates in the note
                        console.debug("browsersolutions: selection text not found in note, using coordinates instead");
                        try {

                            console.log("browsersolutions: " + "note posx: " + note_obj.posx);
                            console.log("browsersolutions: " + "note posy: " + note_obj.posy);

                            // check if note contains position coordinates/parameters. If so, try to use them to place the note

                            var posx = "";
                            posx = note_obj.posx;

                            var posy = "";
                            posy = note_obj.posy;

                            console.debug("browsersolutions: " + "using posx:" + posx + " posy:" + posy);
                            console.debug("browsersolutions: " + valid_stickynote_position_coordinate_regexp.test(posx));
                            console.debug("browsersolutions: " + valid_stickynote_position_coordinate_regexp.test(posy));

                            try {
                                console.debug("browsersolutions: " + "calling create_stickynote_node");
                                create_stickynote_node(note_obj, note_template, creatorDetails, isOwner, newNote).then(function (newGloveboxNode) {
                                    console.debug(newGloveboxNode);
                                    console.debug("calling size_and_place_note_based_on_coordinates");
                                    size_and_place_note_based_on_coordinates(newGloveboxNode, note_obj, isOwner, newNote);

                                    console.debug("calling setComponentVisibility");
                                    if (isOwner) {
                                        setComponentVisibility(newGloveboxNode, ",rw,.*normalsized,");
                                    } else {
                                        setComponentVisibility(newGloveboxNode, ",ro,.*normalsized,");
                                    }
                                    console.debug("calling attachEventlistenersToYellowStickynote");
                                    attachEventlistenersToYellowStickynote(newGloveboxNode);

                                    console.debug("calling makeDragAndResize");
                                    makeDragAndResize(newGloveboxNode);
                                    //newGloveboxNode.addEventListener('mouseenter',
                                    //    function () {
                                    //    console.debug("browsersolutions ### mouseover");
                                    //});

                                    if (isOwner) {
                                        console.debug(newGloveboxNode);
                                        newGloveboxNode.setAttribute("isOwner", "true");
                                    } else {
                                        newGloveboxNode.setAttribute("isOwner", "false");
                                    }
                                    console.debug("######################################################");

                                    // Make the stickynote draggable:
                                    //console.debug("calling makeDraggable");
                                    //makeDraggable(newGloveboxNode, newGloveboxNode.querySelector("[name='topbar_filler']"));
                                });

                            } catch (e) {
                                console.debug("browsersolutions " + e);
                            }
                        } catch (e) {
                            console.debug(e);
                        }

                    }
                } catch (e) {
                    console.debug(e);
                }
            }
            return true;
        }
    }
}

// hold onto some cade that spans multiple text nodes
function one(note_obj, note_template, isOwner, newNote) {

    if (nodesAreIdentical(start_range_node, end_range_node)) {
        console.debug("browsersolutions: " + "start_range_node and end_range_node are identical");
        //start_offset = 10;
        //end_offset = 20;

        // highlight the text the note is tied to (it any)
        //
        console.debug("browsersolutions: start_range_node length=" + start_range_node.length);
        //console.debug("browsersolutions: start_range_node textContent=" + start_range_node.textContent);
        //console.debug(start_range_node);
        console.debug("browsersolutions: start_range_node start offset " + start_offset);

        console.debug("browsersolutions: end_range_node length=" + end_range_node.length);
        //console.debug("browsersolutions: end_range_node textContent=" + end_range_node.textContent);
        //console.debug(end_range_node);
        console.debug("browsersolutions: end_range_node offset " + end_offset);
        let notedRange = document.createRange();
        notedRange.setStart(start_range_node, start_offset);
        notedRange.setEnd(end_range_node, end_offset);

        // create a range to contain the selection specified in the stickynote
        console.debug("browsersolutions: new notedRange");
        console.debug(notedRange);
        console.debug("browsersolutions: range.toString: " + notedRange.toString());

        // make highlighting of the selected text pertaining to the sticky note
        var color = "#ffffcc";

        // Link the span to the note by setting the "to_note" attribute to the noteid of the note
        // newly created notes do not have a noteid yet, in which case, use ""
        var note_id = note_obj.noteid;

        mark2.setAttribute("style", "background-color: " + color + ";");
        mark2.setAttribute("to_note", "" + note_id + "");

        notedRange.surroundContents(mark2);
        console.debug(notedRange);
        console.debug(mark2);
        //it2.appendChild(newGloveboxNode);
        // start_range_node.textContent = original_start_range_node_textcontent.substring(0, start_offset);

        // insert the sticky note document into the main DOM just before the highlighted selection

        // insert the sticky note node immediately before the selection text it "links" too.

        insertedNode = mark2.parentNode.insertBefore(newGloveboxNode, mark2);
        // shift the inserted node slightly to the right, to make the highlighted text more visible

        increaseVerticalDistanceUsingTop(mark2, insertedNode);

        // Shrink text content in the textnode where the selection begins,
        // to no longer incldue the selected text (which has been copied into the span)

        //console.debug("browsersolutions " + start_range_node.textContent);
        //start_range_node.textContent = original_start_range_node_textcontent.substring(0, start_offset);
        //console.debug("browsersolutions " + start_range_node.textContent);

        // shrik the text content in the textnode where the selection ends, to exclude the selected text


    } else {
        // the selection spans multiple DOM nodes

        // create a "span" for each node separately, and link them to the note

        //start_offset = 10;
        //end_offset = 20;
        //console.debug("browsersolutions: start_range_node length=" + start_range_node.length);
        //console.debug(start_range_node);
        //console.debug("browsersolutions: start_range_node start offset " + start_offset);
        //console.log("browsersolutions: insertedNode at root");
        //const rootElement = document.documentElement; // For <html> as root
        //const insertedNode2 = rootElement.appendChild(newGloveboxNode)
        //     console.debug(insertedNode2);
        //console.debug("browsersolutions: end_range_node length=" + end_range_node.length);
        //console.debug(end_range_node);
        //console.debug("browsersolutions: end_range_node offset " + end_offset);
        let notedRange = document.createRange();
        notedRange.setStart(start_range_node, start_offset);
        notedRange.setEnd(end_range_node, end_offset);

        // create a range to contain the selection specified in the stickynote
        console.debug("browsersolutions: new notedRange");
        console.debug(notedRange);
        console.debug("browsersolutions " + notedRange.toString());

        var spanNodesBetween = findNodesBetween(start_range_node, end_range_node);
        console.debug("browsersolutions: spanNodesBetween");
        console.debug(spanNodesBetween);

        // make highlighting of the selected text pertaining to the sticky note
        var color = "#ffffcc";

        // Link the span to the note by setting the "to_note" attribute to the noteid of the note
        // newly created notes do not have a noteid yet, in which case, use ""
        var note_id = note_obj.noteid;

        var mark2 = document.createElement('span');
        mark2.setAttribute("style", "background-color: " + color + ";");
        mark2.setAttribute("to_note", "" + note_id + "");
        let notedRange2 = document.createRange();
        console.debug(notedRange2);
        console.debug("browsersolutions: start_range_node");
        console.debug(start_range_node.textContent);
        notedRange2.setStart(start_range_node, 4);
        notedRange2.setEnd(start_range_node, 15);
        console.debug(notedRange2);
        notedRange2.surroundContents(mark2);
        console.debug(notedRange2);
        console.debug(notedRange2.textContent);
        //it2.appendChild(newGloveboxNode);
        // start_range_node.textContent = original_start_range_node_textcontent.substring(0, start_offset);

        // insert the sticky note document into the main DOM just before the highlighted selection

        // insert the sticky note node immediately before the selection text it links too.
        console.debug(start_range_node.parentNode);
        insertedNode = start_range_node.parentNode.insertBefore(newGloveboxNode, start_range_node);
    }
    console.debug(insertedNode);

}

/*
 * returns integer

 * @param {*} input
 * @param {*} fallback
 * @param {*} lowerLimit
 * @param {*} upperLimit
 * @returns
 */

function processBoxParameterInput(input, fallback, lowerLimit, upperLimit) {
    console.debug("browsersolutions: " + "# processBoxParameterInput");
    console.debug(input);
    console.debug(fallback);
    console.debug(lowerLimit);
    console.debug(upperLimit);

    let number;

    if (typeof input === 'string') {
        number = Number(input);
        if (isNaN(number)) {
            return fallback;
        }
    } else if (typeof input === 'number') {
        number = input;
    } else {
        return fallback;
    }

    if (Number.isInteger(number) && number >= lowerLimit && number <= upperLimit) {
        return number;
    } else {
        return fallback;
    }
}

/*
function to look through the text of the document to locate where the selection string fits in

Taking account of the fact that selction may spand multiple DOM node, the function return both the DOM node the text starts inside of,
and the one it ends inside of. As well as the character position of the start and endpoint in those node

 */
function getDOMposition(textnode_map, selection_text) {

    console.log("browsersolutions getDOMposition, locate in the body of the document the selection text: \"" + selection_text + "\"");

    try {

        if (selection_text !== undefined && selection_text.length > 0) {

            // start
            var start_range_node;
            var start_offset = 0;
            // end
            var end_range_node;
            var end_offset = 0;

            var start_pos = whole_page_text.replace(/\s/g, "").indexOf(selection_text.replace(/\s/g, ""));
            console.debug("browsersolutions start pos: " + start_pos);
            // step through the array of all text nodes to find the one that contains the start pos


            var i = 0,
            j = 0;
            try {
                // put a cap on max nodes / array entries to examine
                while (i < textnode_map.length && i < 5000) {
                    //console.debug(i + " " + textnode_map[i][0] + " " + textnode_map[i][1]);
                    j = i;
                    // first occurrence the start pos, capture the node and exit the iteration
                    if ((textnode_map[i][0] <= start_pos) && (start_pos <= textnode_map[i][1])) {
                        // textnode_map[i][0];
                        console.debug("browsersolutions hit!");
                        start_range_node = textnode_map[i][2];
                        // who far out in the textnode does the selection actually begin (on compacted text, so only approx.)
                        //start_offset = start_pos - textnode_map[i][0];
                        //console.debug(i + " " + textnode_map[i][0]);
                        // break out of iteration
                        i = 10000000;

                        // if the selection is fully contained inside the start node..
                        var indexofSelection = start_range_node.textContent.indexOf(selection_text);
                        console.debug("browsersolutions indexOfSelection: " + indexofSelection);

                        if (indexofSelection > 0) {
                            // selection is fully contained inside start node
                            // start offset  is where the match begins
                            start_offset = indexofSelection;
                        } else {
                            // selection spans outside the start node
                            // The selection text will have some whitespace characters removed (line breaks, and tabs)
                            // to be able to make a match, the text must also have these replace with a single space (ascii 20)
                            // also multiple repeated shapce characters must be collapsed into just one.

                            console.debug("browsersolutions #determine overlap between")
                            //console.debug(selection_text.replace(/\W/g, ""));
                            //console.debug(selection_text.replace(/\w/g, ""));
                            console.debug(align_characterspace(selection_text));
                            console.debug("browsersolutions #and")
                            //console.debug(start_range_node.textContent.replace(/\W/g, ""))
                            //console.debug(start_range_node.textContent.replace(/\w/g, ""))
                            //console.debug(start_range_node.textContent)
                            console.debug(align_characterspace(start_range_node.textContent))

                            var lcs = longest_common_substring(align_characterspace(selection_text), align_characterspace(start_range_node.textContent));
                            //console.debug(lcs);
                            console.debug("browsersolutions #found common section: " + lcs);
                            // look for the startOffset by frying the find where the overlaping piece fit.
                            start_offset = align_characterspace(start_range_node.textContent).indexOf(lcs);
                            console.debug("browsersolutions start_offset" + start_offset);
                        }
                    }
                    i++;
                }
            } catch (e) {
                console.error(e);
            }

            console.debug(start_range_node);
            console.debug(start_offset);
            // start_range_node now contains the DOM node where the selection range begins


            // find end node
            var end_pos = start_pos + selection_text.replace(/\s/g, "").length
                console.debug("end pos: " + end_pos);
            // Step through the array of all text nodes to find the one that contains the end pos

            // When iterating though all textnodes, Start where left off when looking for start node
            try {
                // put a cap on max nodes / array entries to examine
                while (j < textnode_map.length && j < 5000) {
                    console.debug(j + " " + textnode_map[j][0] + " " + textnode_map[j][1]);

                    // first occurrence the start pos, capture the node and exit the iteration
                    if ((textnode_map[j][0] <= end_pos) && (end_pos <= textnode_map[j][1])) {
                        //                	textnode_map[i][0];
                        end_range_node = textnode_map[j][2];
                        // who far from the begining of the textnode does the selection actually end (compacted text, so only approx.)

                        // match selection text on the text node and find the end of the overlap
                        // the selection text will in general begin prior to the text node and the textnode may match only a piece at the end of the selection

                        // find overlap of selection_text and endnode text
                        console.debug("determine overlap between")
                        console.debug(align_characterspace(selection_text));
                        console.debug("and")
                        console.debug(align_characterspace(end_range_node.textContent));
                        console.debug(longest_common_substring(align_characterspace(selection_text), align_characterspace(end_range_node.textContent)));

                        var indexofSelection = align_characterspace(end_range_node.textContent).indexOf(align_characterspace(selection_text));
                        console.debug(indexofSelection);

                        if (indexofSelection > 0) {
                            // if the selection text IS contained inside the
                            // the end offset is the start of the overlap match plus the length of it (which is the length of the selection)
                            var lcs = longest_common_substring(align_characterspace(selection_text), align_characterspace(end_range_node.textContent));
                            end_offset = indexofSelection + lcs.length;
                            console.debug(lcs.length);
                            console.debug(selection_text.length);
                        } else {

                            // If the selection text is NOT contained inside the end node
                            // the length of the common match is the end offset point in the endnode
                            var lcs = longest_common_substring(align_characterspace(selection_text), align_characterspace(end_range_node.textContent));
                            end_offset = lcs.length;
                        }

                        //end_offset = textnode_map[j][1] - end_pos;
                        //console.debug(i + " " + textnode_map[i][0]);
                        // break out of iteration
                        j = 10000000;
                    }
                    j++;
                }
            } catch (e) {
                console.error(e);
            }
            const selection_matched_in_document = true;
            return {
                selection_matched_in_document,
                start_range_node,
                start_offset,
                end_range_node,
                end_offset
            }

        } else {
            return null;
        }

    } catch (e) {
        console.error(e);
        return;
    }

}

/* align whitespace */
function align_characterspace(one) {
    var two;
    return one.replace(/[\n\r\t]/g, " ").replace(/  */g, " ").replace(/[\)\?]/g, "");

}

function longest_common_substring(lcstest_raw, lcstarget_raw) {
    // ")" not supported
    //console.debug(lcstest_raw);
    //console.debug(lcstarget_raw);

    // remove some characters that would screw-up the matching if they are present
    var lcstest = lcstest_raw.replace(/[\)\?]/g, "");
    var lcstarget = lcstarget_raw.replace(/[\)\?]/g, "");

    //console.debug(lcstest);
    //console.debug(lcstarget);

    matchfound = 0
        lsclen = lcstest.length
        for (lcsi = 0; lcsi < lcstest.length; lcsi++) {
            lscos = 0
                for (lcsj = 0; lcsj < lcsi + 1; lcsj++) {
                    re = new RegExp("(?:.{" + lscos + "})(.{" + lsclen + "})", "i");
                    temp = re.test(lcstest);
                    re = new RegExp('(' + RegExp.$1 + ')', 'i');
                    if (re.test(lcstarget)) {
                        matchfound = 1;
                        result = RegExp.$1;
                        break;
                    }
                    lscos = lscos + 1;
                }
                if (matchfound == 1) {
                    return result;
                    break;
                }
                lsclen = lsclen - 1;
        }
        result = "";
    return result;
}

function attachEventlistenersToYellowStickynote(note) {
    console.log("attachEventlistenersToYellowStickynote.start");
    console.debug(note);

    try {

        const mySave_new_note = (event) => {
            event.stopPropagation();
            save_new_note(event);
            event.stopPropagation();
        };
        const myupdate_note = (event) => {
            update_note(event);
            event.stopPropagation();
        };

        // for save buttons/icons
        var allGoTo3 = note.querySelectorAll('[js_action="save_new_note"]');
        for (var i = 0; i < allGoTo3.length; i++) {
            allGoTo3[i].removeEventListener("click", mySave_new_note);
            allGoTo3[i].removeEventListener("click", myupdate_note);
            allGoTo3[i].addEventListener("click", mySave_new_note);
        }
    } catch (e) {
        console.error(e);
    }
    try {

        const mySave_new_note = (event) => {
            event.stopPropagation();
            save_new_note(event);
            event.stopPropagation();
        };
        const myupdate_note = (event) => {
            update_note(event);
            event.stopPropagation();
        };
        var allGoTo7 = note.querySelectorAll('[js_action="update_note"]');
        for (var i = 0; i < allGoTo7.length; i++) {
            allGoTo7[i].removeEventListener("click", mySave_new_note);
            allGoTo7[i].removeEventListener("click", myupdate_note);
            allGoTo7[i].addEventListener("click", myupdate_note);
        }

    } catch (e) {
        console.error(e);
    }

    try {

        const myclose_note = (event) => {
            close_note(event);
            event.stopPropagation();
        };
        // for close buttons/icons
        var allGoTo = note.querySelectorAll('[js_action="close_note"]');
        for (var i = 0; i < allGoTo.length; i++) {
            console.log("attach close note event listener");
            allGoTo[i].removeEventListener("click", myclose_note);
            allGoTo[i].addEventListener("click", myclose_note);
        }
    } catch (e) {
        console.error(e);
    }

    try {

        const myCopy_note_to_clipboard = (event) => {
            copy_note_to_clipboard(event);
            event.stopPropagation();
        };
        var allGoTo5 = note.querySelectorAll('[js_action="copy_note_to_clipboard"]');
        for (var i = 0; i < allGoTo5.length; i++) {
            console.debug(allGoTo5[i]);
            allGoTo5[i].removeEventListener("click", myCopy_note_to_clipboard);
            allGoTo5[i].addEventListener("click", myCopy_note_to_clipboard);
        }

    } catch (e) {
        console.error(e);
    }

    try {

        const myminimize_note = (event) => {
            minimize_note(event);
            event.stopPropagation();
        };

        var allGoTo12 = note.querySelectorAll('[js_action="minimize_note"]');
        for (var i = 0; i < allGoTo12.length; i++) {
            allGoTo12[i].removeEventListener("click", myminimize_note);
            console.log("minimized_note event listener removed")
            allGoTo12[i].addEventListener("click", myminimize_note);
            console.log("minimized_note event listener attached")
        }

    } catch (e) {
        console.error(e);
    }

    try {

        const myfullscreen_note = (event) => {
            fullscreen_note(event);
            event.stopPropagation();
        };

        var allGoTo13 = note.querySelectorAll('[js_action="fullscreen_note"]');
        for (var i = 0; i < allGoTo13.length; i++) {
            allGoTo13[i].addEventListener("click", function (event) {
                fullscreen_note(event);
            });

            //allGoTo13[i].removeEventListener("click", myfullscreen_note);
            //allGoTo13[i].addEventListener("click", myfullscreen_note);

        }

    } catch (e) {
        console.error(e);
    }

    try {

        const myrightsize_note = (event) => {
            rightsize_note(event);
            event.stopPropagation();
        };
        var allGoTo14 = note.querySelectorAll('[js_action="rightsize_note"]');
        for (var i = 0; i < allGoTo14.length; i++) {
            allGoTo14[i].removeEventListener("click", myrightsize_note);
            allGoTo14[i].addEventListener("click", myrightsize_note);
        }
    } catch (e) {
        console.error(e);
    }

    try {

        const mydelete_note = (event) => {
            delete_note(event);
            event.stopPropagation();
        };
        // for delete buttons/icons
        var allGoTo2 = note.querySelectorAll('[js_action="delete_note"]');
        for (var i = 0; i < allGoTo2.length; i++) {
            allGoTo2[i].removeEventListener("click", mydelete_note);
            allGoTo2[i].addEventListener("click", mydelete_note);
        }
    } catch (e) {
        console.error(e);
    }

    try {

        const mydisable_note = (event) => {
            disable_note(event);
            event.stopPropagation();
        };
        var allGoTo8 = note.querySelectorAll('[js_action="disable_note"]');
        for (var i = 0; i < allGoTo8.length; i++) {
            allGoTo8[i].removeEventListener("click", mydisable_note);
            allGoTo8[i].addEventListener("click", mydisable_note);

        }

    } catch (e) {
        console.error(e);
    }

    try {

        const mylocate_note = (event) => {
            console.log("event.stopPropagation();");
            locate_note(event);
            event.stopPropagation();

        };
        // for button going to note location
        var allGoTo11 = note.querySelectorAll('[js_action="locate_note"]');
        for (var i = 0; i < allGoTo11.length; i++) {
            allGoTo11[i].removeEventListener("click", mylocate_note);
            allGoTo11[i].addEventListener("click", mylocate_note);

        }

    } catch (e) {
        console.error(e);
    }

    try {
        const myload_url = (event) => {
            console.log("myload_url");
            console.debug("calling load_url");
            load_url(event);
            event.stopPropagation();
        };
        // load_url

        var allGoTo1_14 = note.querySelectorAll('[js_action="load_url"]');
        for (var i = 0; i < allGoTo1_14.length; i++) {
            allGoTo1_14[i].removeEventListener("click", myload_url);
            allGoTo1_14[i].addEventListener("click", myload_url);
        }

    } catch (e) {
        console.error(e);
    }

    try {
        const mydistributionlist_dropdown = (event) => {
            console.log("mydistributionlist_dropdown");
            //load_url(event);
            event.stopPropagation();
        };
        // for button setting up distribution dropdown list
        var distlist = note.querySelectorAll('[js_action="distribute"]');
        for (var i = 0; i < distlist.length; i++) {
            distlist[i].removeEventListener("click", mydistributionlist_dropdown);
            distlist[i].addEventListener("click", mydistributionlist_dropdown);

        }

    } catch (e) {
        console.error(e);
    }
    console.log("attachEventlistenersToYellowStickynote.end");
}

function load_url(event) {
    console.debug("load_url");
    console.debug(event);
    console.debug(event.target.parentNode);
    // get the root node of the note
    var note_root = getYellowStickyNoteRoot(event.target.parentNode);
    console.debug(note_root);
    return new Promise(function (resolve, reject) {
        console.debug(note_root.querySelector('input[id="urlInput"]'));
        const url = note_root.querySelector('input[id="urlInput"]').value;

        console.debug("#### perform url lookup #### " + url);
        //console.debug(cont1);

        // check for content_url for notes that collect content from elsewhere
        try {
            //cont1.querySelector('input[id="urlInput"]').value = note_object_data.content_url;

            // start the process of looking up the content
            var content_iframe = note_root.querySelector('#contentFrame');
            console.log("content_iframe: " + content_iframe);
            // console.log(content_iframe);

            // send message to background serviceworker and it will lookup the URL. This is to bypass any CORS issues
            // Send save request back to background
            // Stickynotes are always enabled when created.
            console.log("remote url: " + url);
            chrome.runtime.sendMessage({
                message: {
                    "action": "simple_url_lookup",
                    "url": url
                }
            }).then(function (response) {
                console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
                // render content of ifram based on this
                //console.log(getYellowStickyNoteRoot(event.target));
                setContentInIframe(content_iframe, response);
                resolve(response);
            });

        } catch (e) {
            console.error(e);
        }
    });
}

function increaseVerticalDistanceUsingTop(element1, element2) {
    // Ensure that both elements are valid DOM elements
    if (!(element1 instanceof HTMLElement) || !(element2 instanceof HTMLElement)) {
        console.error("Invalid input: both arguments must be DOM elements.");
        return;
    }

    // Function to get the current top value or default to 0 if not set
    function getTopValue(element) {
        const top = window.getComputedStyle(element).top;
        return top !== 'auto' ? parseInt(top, 10) : 0;
    }

    // Get the current top value of the second element
    let topValue = getTopValue(element1);
    console.debug("browsersolutions: " + "topValue: " + topValue);

    // Increase the top value of the second element by 20px
    topValue += 120;

    console.debug("browsersolutions: " + "topValue: " + element2.style.top);

    // Apply the new top value
    element2.style.top = `${topValue}px`;
}

function getYellowStickyNoteRoot(currentElement) {
    console.debug("# getYellowStickyNoteRoot");
    //console.debug(currentElement);

    // let currentElement = element;
    // container type="yellownote"
    //console.log(currentElement);
    //console.log(currentElement.querySelector('container[type="yellownote"]'));

    // the root node of the yellownote is the first(top-most) container element with attribute type="yellownote"
    try {
        if (currentElement.hasAttribute("class")) {
            if (currentElement.getAttribute("class") === "yellownotecontainer") {

                // Condition met, return this element
                return currentElement;
            }

        }
        while (currentElement !== null && currentElement !== document) {
            //console.log(currentElement);
            //console.log(currentElement.querySelector('container[type="yellownote"]'));
            if (currentElement.hasAttribute("class")) {
                if (currentElement.getAttribute("class") === "yellownotecontainer") {

                    // Condition met, return this element
                    return currentElement;
                }
            }
            // Move up the DOM tree to the parent node
            currentElement = currentElement.parentNode;
        }

        // If the loop completes without finding an element with the target class
        return null;
    } catch (e) {
        console.error(e);
        return null;
    }
}

function nodesAreIdentical(node1, node2) {
    // Check if node types are the same
    if (node1.nodeType !== node2.nodeType)
        return false;

    // If they are element nodes, check the tag name
    if (node1.nodeType === Node.ELEMENT_NODE && node1.tagName !== node2.tagName)
        return false;

    // If they have different text content (for text nodes)
    if (node1.nodeType === Node.TEXT_NODE && node1.textContent !== node2.textContent)
        return false;

    // Check attributes
    if (node1.attributes && node2.attributes) {
        if (node1.attributes.length !== node2.attributes.length)
            return false;
        for (let i = 0; i < node1.attributes.length; i++) {
            const attr1 = node1.attributes[i];
            const attr2 = node2.getAttribute(attr1.name);
            if (attr1.value !== attr2)
                return false;
        }
    }

    // Check children nodes recursively
    const children1 = node1.childNodes;
    const children2 = node2.childNodes;
    if (children1.length !== children2.length)
        return false;
    for (let i = 0; i < children1.length; i++) {
        if (!nodesAreIdentical(children1[i], children2[i]))
            return false;
    }

    return true;
}

function getDOMplacement(selection_text) {
    if (selection_text !== undefined && selection_text.length > 0) {

        //var message_display_text = note_obj.message_display_text;
        var selection_matched_in_document = false;

        // start
        var start_range_node;
        var start_offset = 0;
        // end
        var end_range_node;
        var end_offset = 0;
        // using the position of the start of the selection text within the whole text, determine the start node where the selection begins
        // try to match the selection text to the text in the document
        var one = getDOMposition(textnode_map, selection_text);
        console.debug("browsersolutions " + JSON.stringify(one));
        // Now the starting node for the selection is found, as well as the end node (and character offset within the nodes)
        if (one === undefined) {
            console.log("browsersolutions: " + "This is undefined");
            // not place to in the page to attach the note to. place it on top of the page
            start_range_node = document.querySelector(':root');
            start_offset = 0;
            // end
            end_range_node = start_range_node;
            end_offset = 0;
        } else {
            console.debug("browsersolutions: " + JSON.stringify(one));
            if (one.start_range_node === undefined) {
                console.debug("browsersolutions: unable to locate the selection text");
                // if the selection text in the note is not matchable on the page, something that will be a common occurence on dynamic sites, place the note on top of the page
                start_range_node = document.querySelector(':root');
                start_offset = 0;
                // end
                end_range_node = start_range_node;
                end_offset = 0;
            } else {
                selection_matched_in_document = true;
                start_range_node = one.start_range_node;
                end_range_node = one.end_range_node;
                start_offset = one.start_offset;
                end_offset = one.end_offset;
            }
        }
    } else {
        // No text selected in the note that can anchor the palcement of the note to the page. Place the note on top of the page
        start_range_node = document.querySelector(':root');
        start_offset = 0;
        // end
        end_range_node = start_range_node;
        end_offset = 0;
    }
    return {
        selection_matched_in_document,
        start_range_node,
        start_offset,
        end_range_node,
        end_offset
    };
}

function findNodesBetween(startNode, endNode) {
    let nodes = [];
    let node = startNode;

    nodes.push(startNode);
    // Function to traverse the DOM
    const traverseDOM = (node) => {
        // Skip if the node is the end node
        if (node === endNode) {
            return false;
        }

        // Add the node if it's not the start node
        // if (node !== startNode) {
        nodes.push(node);
        // }

        // Check all child nodes
        let child = node.firstChild;
        while (child) {
            if (!traverseDOM(child)) {
                return false; // Stop if we reached the end node
            }
            child = child.nextSibling;
        }

        return true;
    };

    // Start traversing from the next node
    if (node) {
        node = node.nextSibling;
        while (node) {
            if (!traverseDOM(node)) {
                break;
            }
            node = node.nextSibling;
        }
    }

    return nodes;
}

// the session token is not completed as yet
function get_brand_from_sessiontoken(token) {

    try {
        return (JSON.parse(token)).brand;
    } catch (error) {
        return "default";
    }

}

// create a node array of text content nodes in document order
function traverse(elm) {
    // produce a string of all test concatenated
    //var text_str = "";
    // Produce an array of all nodes
    //console.debug("#traverse");

    if (elm.nodeType == Node.ELEMENT_NODE || elm.nodeType == Node.DOCUMENT_NODE) {
        // console.debug("1.0.1");

        // exclude elements with invisible text nodes
        if (isExcluded(elm)) {
            return
        }

        for (var i = 0; i < elm.childNodes.length; i++) {
            // recursively call to traverse
            traverse(elm.childNodes[i]);
        }

    }

    if (elm.nodeType == Node.TEXT_NODE) {
        //  console.debug("1.0.2");
        // exclude text node consisting of only spaces
        if (elm.nodeValue.trim() == "") {
            return
        }

        // elm.nodeValue here is visible text we need.
        //  console.log("##");
        //   console.log(elm.nodeValue);
        var start_position = whole_page_text.length;
        whole_page_text = whole_page_text + elm.nodeValue.replace(/\s/g, "");
        var end_position = whole_page_text.length;
        textnode_map.push([start_position, end_position, elm]);

    }
}

function create_stickynote_node(note_object_data, note_template, creatorDetails, isOwner, newNote) {
    console.log("browsersolutions create_stickynote_node.start");
    return new Promise(function (resolve, reject) {
        console.debug(note_object_data);
        console.debug(note_template);
        console.debug(creatorDetails);
        console.debug(newNote);
        console.debug(isOwner);
        // create the "wrapping" container that hold the DOM-structure of the note
        var cont1 = document.createElement('container');

        //<!--<link rel="stylesheet" type="text/css" href="message-box.css">-->


        // var fullURLToCSS = browser.runtime.getURL("css/yellownote.css");
        //  var link1 = document.createElement('link');
        //  link1.setAttribute("rel", 'stylesheet');
        //  link1.setAttribute("type", 'text/css');
        //  link1.setAttribute("href", fullURLToCSS);
        //  cont1.appendChild(link1);

        cont1.setAttribute("class", "yellownotecontainer");
        // use this attribute to mark this as a stickynote object
        cont1.setAttribute("note_type", note_object_data.note_type);
        cont1.setAttribute("noteid", note_object_data.noteid);

        //cont1.appendChild(create_note_table(note_object_data,note_template));
        cont1.appendChild(note_template);
        console.debug(cont1);
        if (note_object_data.note_type == "http_get_url" || note_object_data.note_type == "webframe" || note_object_data.type == "webframe") {
            // part pertain only to notes of type http_get_url (looking up URLs)
            // Locate the form element
            console.debug("#### perform url lookup ####");

            // check for content_url for notes that collect content from elsewhere
            try {
                if (note_object_data.content_url != undefined) {
                    cont1.querySelector('input[id="urlInput"]').value = note_object_data.content_url;
                }

                // start the process of looking up the content
                var content_iframe = cont1.querySelector('#contentFrame');
                console.log("content_iframe: " + content_iframe);
                // console.log(content_iframe);

                // send message to background serviceworker and it will lookup the URL. This is to bypass any CORS issues
                // Send save request back to background
                // Stickynotes are always enabled when created.
                console.log("remote url: " + note_object_data.content_url);
                chrome.runtime.sendMessage({
                    message: {
                        "action": "simple_url_lookup",
                        "url": note_object_data.content_url
                    }
                }).then(function (response) {
                    //console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
                    // render content of ifram based on this
                    //console.log(getYellowStickyNoteRoot(event.target));
                    setContentInIframe(content_iframe, response);
                    resolve(cont1);
                });

                /*
                the note header contains source info on the note
                 */
                console.debug("browsersolutions calling renderNoteHeader");
                renderNoteHeader(note_object_data, cont1, creatorDetails, isOwner, newNote);
                // set up the drop-down menu for distribution lists/feeds
                // pre-select the distribution list drop down menu
                const dl_container = cont1.querySelector('[name="distributionlistdropdown"]');

                if (!isUndefined(note_object_data.distributionlistid) && note_object_data.distributionlistid != undefined) {
                    console.debug("there is a distribution list assigned already: " + note_object_data.distributionlistid);
                    console.debug("calling: get_distributionlist");
                    get_distributionlist().then(function (response) {
                        console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
                        try {
                            const selectElement = document.getElementById('distributionList');
                            response.forEach(item => {
                                console.log(item);
                                const option = document.createElement('option');
                                option.value = item.distributionlistid;
                                option.textContent = `${item.name} ${item.description}`;
                                if (item.distributionlistid == note_object_data.distributionlistid) {
                                    option.setAttribute("selected", "selected");
                                }
                                dl_container.appendChild(option);
                            });
                            // add the option of not sharing the note with any distribution list/feeds
                            const option0 = document.createElement('option');
                            option0.value = '';
                            option0.textContent = 'do not share';
                            dl_container.appendChild(option0);

                        } catch (e) {
                            console.error(e);
                        }
                    });

                } else {
                    console.debug("calling: get_distributionlist");
                    get_distributionlist().then(function (response) {
                        console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
                        // add the option of not sharing the note with any distribution list/feeds
                        const option0 = document.createElement('option');
                        option0.value = '';
                        option0.textContent = 'do not share';
                        dl_container.appendChild(option0);

                        const selectElement = document.getElementById('distributionList');
                        response.forEach(item => {
                            console.log(item);
                            const option = document.createElement('option');
                            option.value = item.distributionlistid;
                            option.textContent = `${item.name} ${item.description}`;
                            dl_container.appendChild(option);
                        });

                    });
                }

            } catch (e) {
                console.error(e);
            }

        } else {
            // "regular" yellow note type, use this as the default but type="yellownote should be set regardless"
            console.debug(cont1);
            // insert the note metatdata and other permanent content
            cont1.querySelector('input[type="hidden"][name="selection_text"]').replaceChildren(document.createTextNode(note_object_data.selection_text));
            cont1.querySelector('input[type="hidden"][name="noteid"]').replaceChildren(document.createTextNode(note_object_data.noteid));
            cont1.querySelector('input[type="hidden"][name="createtime"]').replaceChildren(document.createTextNode(note_object_data.createtime));
            cont1.querySelector('input[type="hidden"][name="lastmodifiedtime"]').replaceChildren(document.createTextNode(note_object_data.lastmodifiedtime));
            cont1.querySelector('input[type="hidden"][name="note_type"]').replaceChildren(document.createTextNode(note_object_data.type));

            // capture local url
            cont1.querySelector('input[type="hidden"][name="url"]').replaceChildren(document.createTextNode(note_object_data.url));
            if (typeof note_object_data.enabled != undefined) {
                cont1.querySelector('input[type="hidden"][name="enabled"]').replaceChildren(document.createTextNode(note_object_data.enabled));
            } else {
                // default value if undefined, is enabled(=true)
                cont1.querySelector('input[type="hidden"][name="enabled"]').replaceChildren(document.createTextNode("true"));
            }

            // insert the displayed text content
            cont1.querySelector('[name="message_display_text"]').replaceChildren(document.createTextNode(b64_to_utf8(note_object_data.message_display_text)));

            console.debug(JSON.stringify(creatorDetails));
            console.debug(cont1.querySelector('td[name="topbar_filler"]'));
            console.debug(creatorDetails != undefined);
            if (creatorDetails != undefined) {
                try {
                    if (creatorDetails.displayname != undefined) {
                        //cont1.querySelector('[name="creator"]').replaceChildren(document.createTextNode(creatorDetails.displayname));

                    }
                } catch (e) {
                    console.error(e);
                }
                console.debug(creatorDetails.banner_image != undefined);
                if (creatorDetails.banner_image != undefined) {
                    // Create a new img element
                    var imgElement = document.createElement('img');

                    // Set attributes
                    imgElement.setAttribute('height', '20');
                    imgElement.setAttribute('width', '170');
                    imgElement.setAttribute('src', creatorDetails.banner_image);

                    // Apply inline styles
                    imgElement.style.margin = '0px';
                    imgElement.style.height = '20px';

                    // Append the img element to the desired location in the document
                    // For example, appending to the body
                    console.debug(imgElement);
                    console.debug(cont1.querySelector('td[name="topbar_filler"]'));

                    cont1.appendChild(imgElement);

                    //cont1.querySelector('td[name="topbar_filler"]').appendChild(imgElement);
                    console.debug(cont1);

                    console.debug(cont1.querySelector('td[name="topbar_filler"]'));

                    //    cont1.querySelector('[name="creator"]').replaceChildren(document.createTextNode(creatorDetails.displayname));

                }

            }

            /* the note header contains source info on the note

             */
            console.debug("browsersolutions calling renderNoteHeader");
            renderNoteHeader(note_object_data, cont1, creatorDetails, isOwner, newNote);

            // set up the drop-down menu for distribution lists/feeds
            // pre-select the distribution list drop down menu
            const dl_container = cont1.querySelector('[name="distributionlistdropdown"]');

            if (!isUndefined(note_object_data.distributionlistid) && note_object_data.distributionlistid != undefined) {
                console.debug("there is a distribution list assigned already: " + note_object_data.distributionlistid);
                console.debug("calling: get_distributionlist");
                get_distributionlist().then(function (response) {
                    console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
                    try {
                        const selectElement = document.getElementById('distributionList');
                        response.forEach(item => {
                            console.log(item);
                            const option = document.createElement('option');
                            option.value = item.distributionlistid;
                            option.textContent = `${item.name} ${item.description}`;
                            if (item.distributionlistid == note_object_data.distributionlistid) {
                                option.setAttribute("selected", "selected");
                            }
                            dl_container.appendChild(option);
                        });
                        // add the option of not sharing the note with any distribution list/feeds
                        const option0 = document.createElement('option');
                        option0.value = '';
                        option0.textContent = 'do not share';
                        dl_container.appendChild(option0);

                    } catch (e) {
                        console.error(e);
                    }
                });

            } else {
                console.debug("calling: get_distributionlist");
                get_distributionlist().then(function (response) {
                    console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
                    // add the option of not sharing the note with any distribution list/feeds
                    const option0 = document.createElement('option');
                    option0.value = '';
                    option0.textContent = 'do not share';
                    dl_container.appendChild(option0);

                    const selectElement = document.getElementById('distributionList');
                    response.forEach(item => {
                        console.log(item);
                        const option = document.createElement('option');
                        option.value = item.distributionlistid;
                        option.textContent = `${item.name} ${item.description}`;
                        dl_container.appendChild(option);
                    });

                });
            }

        }
        //console.debug(noteForm);

        // there directly by just clicking on this link

        // setup event listener whereby the user can configure this link
        // rewriting to be automatic

        // where to anchor the tooltip
        // setup node in the DOM tree to contain content of message box
        // var newGloveboxNode = document.createElement("Glovebox");
        // console.debug(newGloveboxNode);

        cont1.setAttribute("id", note_object_data.noteid); // attach a unique ID to the


        resolve(cont1);
    });
}

function setContentInIframe(iframe, content) {
    console.debug("# setContentInIframe");
    //const iframe = document.getElementById(iframeId);
    if (iframe) {
        iframe.srcdoc = content; // Using srcdoc to set the content
    } else {
        console.error('Iframe not found');
    }
}

/* the note header contains source info about the note
This information is customizable at different levels (note/feed/creator/brand)
//


// If this note is from a subscription, insert the  name of the feed/distributionlist
The name is a clickable link to the subscription page - the subscription is highlighted in the list of subscriptions

If this note belongs to the current user, insert the name of the user
The name is a clickable link to the my_notes page - the note is highlighted in the list of notes

If the the note header contains brading onformation - typically through an img tag with the brand logo (the image itself is included in the note as base64 encoded data)
The feed name and creator name is inserted below the logo in the for om a css tooltip. The tooltip is activated by hovering over the logo

// insert the display of the note creator and or distribution list the note came from (if any)

// The plan is to also have the option to also customize, at different levels (note/feed/creator/brand), the whole note template but this is not yet implemented

// priority

1. is there a display image for the note, use it (not implemented)
2. is there a display image for the feed, use it (not implemented)
3. is there a display image for the brand, use it (not implemented)
4. is there a display image for the creator, use it

5. is there a displayname for the note, use it
6. is there a displayname for the feed, use it
7. is there a displayname for the creator, use it

// in addition to what is display, there is also a clickable link

Depending on circumstance it goes to one of two places

If the note belongs to the users, the link goes to the note in the my_notes page

If the note is one the user is subscribing to, the link goes to the feed in the my_subscriptions page


 */
function renderNoteHeader(note_object_data, note_container, creatorDetails, isOwner, isNewNote) {
    console.debug("browsersolutions #renderNoteHeader");
    console.debug(note_object_data);
    console.debug(isOwner);
    console.debug(creatorDetails);
    console.debug(isNewNote);
    var headerhtml = "";

    var link_target = "";
    var display_text = "";

    if (isOwner) {
        link_target = "https://www.yellownotes.cloud/pages/my_notes.html?noteid=" + note_object_data.creatorid;
    } else {
        link_target = 'https://www.yellownotes.cloud/pages/my_subscriptions.html?distributionlistid=' + note_object_data.distributionlistid;
    }
    // check if there is a brand (with a possible logo) associated with the note
    if (isOwner) {
        if (note_object_data.distributionlistname != undefined) {
            display_text = 'source: ' + note_object_data.distributionlistid;
        } else if (note_object_data.displayname != undefined) {
            display_text = 'source: ' + note_object_data.displayname;
        }
    } else {
        if (note_object_data.distributionlistname != undefined) {
            display_text = 'source: ' + note_object_data.distributionlistid;
        }
        if (note_object_data.displayname != undefined) {
            display_text = 'source: ' + note_object_data.displayname;
        }
    }

    console.debug(headerhtml);

    var banner_image = "";

    if (creatorDetails != undefined) {
        try {
            if (creatorDetails.displayname != undefined) {
                
                
            }
        } catch (e) {
            console.error(e);
        }
        console.debug(creatorDetails.banner_image != undefined);
        if (creatorDetails.banner_image != undefined) {
            // Create a new img element
            banner_image = creatorDetails.banner_image;
        }

    } else {
        // no creator details, therefore no banner image
        // There is no option for setting image at the level of the feed or the individial note at this time
    }

    const topbarfield = note_container.querySelector('td[name="topbar_filler"]');
    if (banner_image != "") {
        //console.debug(topbarfield);
        //topbarfield.innerHTML = headerhtml;
        var imgElement = document.createElement('img');

        // Set attributes
        imgElement.setAttribute('height', '20');
        imgElement.setAttribute('width', '170');
        imgElement.setAttribute('src', banner_image);

        // Apply inline styles
        imgElement.style.margin = '0px';
        imgElement.style.height = '20px';

        // Append the img element to the desired location in the document
        // For example, appending to the body
        console.debug(imgElement);

        var aElement = document.createElement('a');
        aElement.setAttribute('href', link_target);
        aElement.setAttribute('target', "_blank");
        aElement.setAttribute('rel', "noopener noreferrer");

        aElement.appendChild(imgElement);
        topbarfield.appendChild(aElement);
    } else {
        // no image, use text
        headerhtml = '<div style="word-wrap: break-word; line-height: 1; letter-spacing: -0.5px;">feed: <a href="' + link_target + '" target="_blank" rel="noopener noreferrer"><b>' + display_text + '</b></a></div>\n<br/>\n';

        topbarfield.innerHTML = headerhtml;

    }

}

/*
a note is minimized by changing the visibility of some parts of the note DOM tree
 */

function minimize_note(event) {
    console.debug("browsersolutions #minimize note");
    event.stopPropagation();
    const note = getYellowStickyNoteRoot(event.target);
    console.debug(note);

    // set flag to indicate note does not have it's "regular" size and should not have its size properties updated
    note.setAttribute('sizeproperties', "frozen");
    note.setAttribute('size', 'frozen');
    // determine if this is a brand new note, a note owned by the current user, or a nother the current user is subscribing to
    // this will have bearign on which button are to be displayed in the note footer

    console.debug("calling setComponentVisibility");
    setComponentVisibility(note, ",rw,.*minimized");
    //console.debug("calling attachEventlistenersToYellowStickynote");
    //attachEventlistenersToYellowStickynote(note);

    return;
    // step through all DOM nodes in the node and set to not visible, the ones that should not be displayed when the note is minimized.
    // only nodes with minimized="display" should be displayed when the note is minimized.
    // Select all elements in the DOM
    const allElements = note.querySelectorAll('[ minimized="notvisible" ]');
    // Iterate over the selected elements
    allElements.forEach(function (element) {
        // If the element does not have the attribute with the given value, set display to 'none'
        console.debug(element);
        element.style.display = 'none';
        console.debug("element has minimized attribute set to visible" + element);

    });

    // shrink the size of the note

    note.querySelector('table[name="whole_note_table"]').style.height = "30px";

    // replace the minimize icon, with the maximize one

    // get the minimize button
    const minimize_icon = note.querySelector('td[js_action="minimize_note"]');

    console.debug(minimize_icon);
    // swap event handler
    const myminimize_note = (event) => {
        minimize_note(event);
        event.stopPropagation();
    };

    const myrightsize_note = (event) => {
        rightsize_note(event);
        event.stopPropagation();
    };

    var td = document.createElement('td');
    td.setAttribute("js_action", "rightsize_note");
    td.setAttribute("class", "icon");
    //var textnode = document.createTextNode("max");
    //td.appendChild(textnode);

    var img = document.createElement('img');
    img.setAttribute("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAHYYAAB2GAV2iE4EAAABrSURBVFhH7dixCoAgFEDRZ0v//7m2WKAF5RR38A33wEPHi+JiaS1aJLaNNS0DqfSB0yMpZWwWuXpevGLKQMpAykDKQMpAykDKQMpAykDKQMpAykDqCay1z2rfDq/4r/3oc0t/gv5RUwYyESdp8RUPFGMofQAAAABJRU5ErkJggg==");
    img.setAttribute("alt", "max");
    img.setAttribute("style", "padding: 0px; height: 20px; width: 20px;");
    td.appendChild(img);

    minimize_icon.parentNode.insertBefore(td, minimize_icon.nextSibling);

    //minimize_icon.removeEventListener("click", myminimize_note);
    td.addEventListener("click", myrightsize_note);
    td.style.zIndex = '130';

    minimize_icon.parentNode.removeChild(minimize_icon);

    //console.debug(event);
}

function maximize_note(event) {
    // not yet implemented
    console.debug("browsersolutions #maximize note");
    // set flag to indicate note does not have it's "regular" size and should not have its size properties updated
    note.setAttribute("sizeproperties", "frozen");
    const button_arrangment = note.getAttribute("button_arrangment");

    event.stopPropagation();

}

function rightsize_note(event) {
    event.stopPropagation();

    console.debug("browsersolutions #expand note to normal size");
    const note = getYellowStickyNoteRoot(event.target);
    console.debug(note);

    // set flag to indicate notehas it's "regular" size and its size properties can not be updated
    note.setAttribute("sizeproperties", "free");

    const button_arrangment = note.getAttribute("button_arrangment");

    console.debug("calling setComponentVisibility with button_arrangement: " + button_arrangment);
    setComponentVisibility(note, "," + button_arrangment + ",.*normalsized");
    //console.debug("calling attachEventlistenersToYellowStickynote");
    //attachEventlistenersToYellowStickynote(note);
    return;

    const allElements = note.querySelectorAll('[ minimized="notvisible" ]');
    // Iterate over the selected elements
    allElements.forEach(function (element) {
        // If the element does not have the attribute with the given value, set display to 'none'
        // if (element.getAttribute('minimized') === "notvisible") {
        console.debug(element);
        element.style.display = 'inherit';
        console.debug("element has minimized attribute set to visible" + element);

        //}else{
        // }
    });

    // shrink the size of the note

    note.querySelector('table[name="whole_note_table"]').style.height = "250px";

    // get the rigtsize button
    const rigtsize_icon = note.querySelector('td[js_action="rightsize_note"]');
    console.debug(rigtsize_icon);

    var td = document.createElement('td');
    td.setAttribute("js_action", "minimize_note");
    td.setAttribute("class", "icon");

    //var textnode = document.createTextNode("min");
    //td.appendChild(textnode);
    var img = document.createElement('img');
    img.setAttribute("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAdhgAAHYYBXaITgQAAAJFJREFUWEftjjEKwDAMxPz/F2dLBaGTti5VoWAJo+lmby4MdiyBHUtgxxLYsQR2LIEdS2DHEtixBHYsgR1LYMcS2LEEdiyBHUtgxxLYsQR2LIEdS2DHEtixBHYsgR1LYMcS2LEEdiyBHUtgxxLYsQR2LIEdS2DHEvg8ax1m3uXe8Q98yncHVsGOJbBjCezYYfYFZAOuYDgLc3IAAAAASUVORK5CYII=");
    img.setAttribute("alt", "min");
    img.setAttribute("style", "padding: 0px; height: 20px; width: 20px;");
    td.appendChild(img);

    rigtsize_icon.parentNode.insertBefore(td, rigtsize_icon.nextSibling);

    const myminimize_note = (event) => {
        minimize_note(event);
        event.stopPropagation();
    };
    td.addEventListener("click", myminimize_note);
    td.style.zIndex = '130';

    rigtsize_icon.parentNode.removeChild(rigtsize_icon);
}

function close_note(event) {
    console.debug("# close yellow note");
    // stop clicking anything behind the button
    event.stopPropagation();
    event.preventDefault();

    // call to kill the yellow note window

    // loop upwards from the target nodes to locate the root node for the sticky note

    const stickynote_rootnode = getYellowStickyNoteRoot(event.target);

    try {
        remove_note(stickynote_rootnode);

    } catch (e) {
        console.error(e);
    }
}

/*
disable the note means to keep it from being placed on the pages where it is attached.
It is still visible in the list of notes in the database, but not "on the page". Or available for distribution to other users.
User can still mange the note from the GUI - and re-enable it.
 */

function disable_note(event) {
    console.debug("disable note");
    console.debug(event);
    // stop clicking anything behind the button
    event.stopPropagation();
    try {
        var note_root = getYellowStickyNoteRoot(event.target);

        console.debug(note_root);

        var noteid = note_root.getAttribute("noteid");

        console.debug("browsersolutions noteid: " + noteid);

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
            remove_noteid(noteid);
        });

    } catch (e) {
        console.error(e);
    }
}

// contain node object and the position within overall text (white space removed)
var textnode_map = [];

// Usage
//const rawHTML = '<div><p>Safe content.</p><script>alert("XSS");</script></div>';
//const targetElement = document.getElementById('target-element');
//safeInjectHTML(rawHTML, targetElement);


function safeParseInnerHTML(rawHTML, targetElementName) {

    // list of acceptable html tags


    // list of unacceptable html tags
    const unaccep = ["script"];

    unaccep.forEach(function (item, index) {
        console.log(item);
    });

    const container = document.createElement(targetElementName);
    // Populate it with the raw HTML content
    container.innerHTML = rawHTML;

    return container;
}

function makeDragAndResize(note) {
    console.debug("# makeDragAndResize.start");

    //document.addEventListener('DOMContentLoaded', function() {
    //const tableContainer = document.getElementById('tableContainer');

    // the margin within which the user can resize the note by dragging the edges
    const resizeBorderMargin = 5;

    const tableContainer = note.querySelector('[name="whole_note_table"]');
    //console.debug(tableContainer);
    let isDragging = false,
    isResizing = false;
    let startX,
    startY,
    startWidth,
    startHeight,
    startMiddleHeight,
    topBarFillerWidth,
    posx,
    posy;

    tableContainer.addEventListener('mousedown', startAction);
    tableContainer.addEventListener('touchstart', startAction, {
        passive: false
    });

    function startAction(e) {
        console.debug("# startAction");

        // if this is on top of any buttons of drop down lists, in which case allow other events to take place

        console.debug(e);
        console.debug(e.target.tagName);

        if (e.target.tagName === 'SELECT' || e.target.tagName === 'OPTION') {
            console.debug("on top of a drop down list");
            // allow action on the drop down list
        } else if (e.target.tagName === 'TEXTAREA') {
            console.debug("on top of textarea");
            // allow action on the drop down list
        } else if (e.target.tagName === 'INPUT') {
            // allow default action on the input field
        } else {
            // no action on the note
            // prevent action "behind" the note
            e.preventDefault();

        }

        //           e.stopPropagation();
        // add eventlisteners to terminate dragging/resizing
        document.addEventListener('mouseup', stopAction);
        document.addEventListener('touchend', stopAction);

        const rect = tableContainer.getBoundingClientRect();
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        startWidth = rect.width;
        startHeight = rect.height;
        startLeft = tableContainer.offsetLeft;
        startTop = tableContainer.offsetTop;

        const regex = /\d+/;
        const h = tableContainer.querySelector('[name="whole_note_middlebar"]').style.height;
        const resulth = h.match(regex);
        const number_h = resulth ? parseInt(resulth[0], 10) : null;
        startMiddleHeight = number_h;
        console.debug("startMiddleHeight: " + startMiddleHeight);

        console.debug(tableContainer.querySelector('[name="topbar_filler"]'));
        const w = tableContainer.querySelector('[name="topbar_filler"]').style.width;
        const resultw = w.match(regex);
        const number_w = resultw ? parseInt(resultw[0], 10) : null;
        topBarFillerWidth = number_w;
        console.debug("topBarFillerWidth: " + topBarFillerWidth);

        // Check if the action is near the border (within set number of px)
        // Check if the action is near any edge (within 5px)
        const nearLeftEdge = startX - rect.left <= 5;
        const nearTopEdge = startY - rect.top <= 5;
        const nearRightEdge = rect.right - startX <= 5;
        const nearBottomEdge = rect.bottom - startY <= 5;

        if (nearRightEdge || nearBottomEdge || nearLeftEdge || nearTopEdge) {
            // Start resizing
            console.debug("# start resizing");
            isResizing = true;
            tableContainer.addEventListener('mousemove', resize);
            tableContainer.addEventListener('touchmove', resize, {
                passive: false
            });
        } else {
            // Start dragging
            console.debug("# start dragging");
            isDragging = true;
            tableContainer.addEventListener('mousemove', drag);
            tableContainer.addEventListener('touchmove', drag, {
                passive: false
            });
        }

    }

    function drag(e) {
        console.debug("# drag: " + isDragging);
        if (isDragging) {
            const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            const dx = currentX - startX;
            const dy = currentY - startY;
            posx = tableContainer.offsetLeft + dx
                tableContainer.style.left = (tableContainer.offsetLeft + dx) + 'px';
            posy = tableContainer.offsetTop + dy
                tableContainer.style.top = (tableContainer.offsetTop + dy) + 'px';
            startX = currentX;
            startY = currentY;
        }
    }

    function resize(e) {
        console.debug("# resize: " + isResizing);
        if (isResizing) {
            const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            const dx = currentX - startX;
            const dy = currentY - startY;

            console.debug(topBarFillerWidth);
            console.debug(currentX);
            console.debug(startX);

            // update the insides of note during the expansion/contraction
            console.debug("topBarFillerWidth: " + (topBarFillerWidth + currentX - startX) + 'px');
            // update the width of the filler that padds out the top bar enough to place the icons over in the right corner
            tableContainer.querySelector('[name="topbar_filler"]').style.width = (topBarFillerWidth + currentX - startX) + 'px';
            console.debug("startMiddleHeight: " + (startMiddleHeight + currentY - startY) + 'px');

            tableContainer.querySelector('[name="whole_note_middlebar"]').style.height = (startMiddleHeight + currentY - startY) + 'px';

            if (startX - tableContainer.offsetLeft <= 5) {
                tableContainer.style.width = (startWidth - dx) + 'px';
                tableContainer.style.left = (startLeft + dx) + 'px';
            } else {
                tableContainer.style.width = (startWidth + dx) + 'px';
            }

            if (startY - tableContainer.offsetTop <= 5) {
                tableContainer.style.height = (startHeight - dy) + 'px';
                tableContainer.style.top = (startTop + dy) + 'px';
            } else {
                tableContainer.style.height = (startHeight + dy) + 'px';
            }
        }
    }

    function stopAction() {
        isDragging = false;
        isResizing = false;

        // update the note object internal structure with the new size information
        //console.debug("startMiddleHeight: " +  (startMiddleHeight + currentY - startY) + 'px');

        console.debug(note);
        console.debug(posx);
        console.debug(posy);
        console.debug(note);
        // store the new position coordinates with root node of the note object
        if (!isUndefined(posx) && !isUndefined(posy)) {
            console.debug("update the position properties of the note root node");
            note.setAttribute("posx", posx + "px");
            note.setAttribute("posy", posy + "px");

        } {
            console.debug("do NOT update the position properties of the note object, as there are no new values.");
        }

        // whole_note_middlebar

        // store the new size information in the note object

        console.debug("sizeproperties: " + note.getAttribute("sizeproperties"));
        if (note.getAttribute("sizeproperties") === "frozen") {
            console.debug("do NOT update the size properties of the note object, as it is frozen.");
        } else {

            console.debug("free to update the size properties of the note object");

            //console.debug(note);
            //console.debug(note.querySelector('[name="box_width"]'));
            const regex = /\d+/;
            const w = tableContainer.style.width;
            const resultw = w.match(regex);
            const number_w = resultw ? parseInt(resultw[0], 10) : null;
            //console.debug(number_w);
            note.setAttribute("box_width", number_w + "px");
            const h = tableContainer.style.height;
            const resulth = h.match(regex);
            const number_h = resulth ? parseInt(resulth[0], 10) : null;
            console.debug("box_height: " + number_h);
            note.setAttribute("box_height", number_h + "px");
            // update the message field height to track the note expasion
            //var message_field = note.querySelector('[name="message_display_text"]');
            //console.debug(message_field);
            const new_height = number_h - 70;
            //message_field.style.height = new_height + "px";

            tableContainer.removeEventListener('mousemove', drag);
            tableContainer.removeEventListener('touchmove', drag);
            tableContainer.removeEventListener('mousemove', resize);
            tableContainer.removeEventListener('touchmove', resize);
            document.removeEventListener('mouseup', stopAction);
            document.removeEventListener('touchend', stopAction);
        }
        //});

    }

}

/*
 * serialize the note object into a form which is suitable for pasting into chat messages, email and the like.
 *
 */

function copy_note_to_clipboard(event) {
    console.debug("# copy yellow note to clipboard");
    // stop clicking anything behind the button
    event.stopPropagation();

    // call to copy not to clipboard

    // loop upwards from the target nodes to locate the root node for the sticky note

    const root_note = getYellowStickyNoteRoot(event.target);
    console.debug(root_note);
    try {
        // use the event target to loop the top node of the note object.
        // call remove of this node

        var stickynote_node = null;

        var t = event.target;
        var i = 0;
        while (i < 12) {
            i++;
            console.debug(t);
            console.debug(isSticyNoteRoot(t));

            if (isSticyNoteRoot(t)) {
                stickynote_node = t;
                // exit the loop
                i = 100;
            }
            // iterate one level up
            t = t.parentNode
        }
    } catch (e) {
        console.error(e);
    }

    try {

        console.debug(stickynote_node);

        //console.debug("1.2.1");
        //if (isSticyNoteRoot(stickynote_node)) {
        console.debug("copy...");
        console.debug(stickynote_node);

        var out = NoteDOM2JSON(root_note);

        // redact certain fields of the note object from the output data

        console.debug(out);
        console.debug(JSON.stringify(out));

        delete (out.lastmodifiedtime);
        delete (out.createtime);
        delete (out.enabled);

        // either redact completely or rewrite the noteid

        console.debug(JSON.stringify(out));
        console.debug(encodeURIComponent(JSON.stringify(out)));
        /* Copy the text inside the text field */

        // serialize the yellow note

        //ser_json_note = JSON.stringify(out).replace(/":"/g,"__del__").replace(/","/g,"__sep__").replace(/\{"/g,"__left__").replace(/"\}/g,"__right__");

        //ser_json_note = encodeURI(JSON.stringify(out).replace(/":"/g,"__del__").replace(/","/g,"__sep__"));

        updateClipboard(yellowstockynote_text_opening + encodeURIComponent(JSON.stringify(out)) + yellowstockynote_text_closing);

        //}
    } catch (e) {
        console.error(e);
    }

}

// extract the essential fields from the note DOM object and return them as a JSON object
function NoteDOM2JSON(note) {
    console.debug("# NoteDOM2JSON");
    console.debug(note);
    try {

        console.debug(note.querySelector('[name="url"]').textContent);

        //const posx = processBoxParameterInput(note.querySelector('[name="posx"]'), 0, 0, 1200);
        //const posy = processBoxParameterInput(note.querySelector('[name="posy"]'), 0, 0, 5000);
        //const box_width = processBoxParameterInput(note.querySelector('[name="box_width"]'), 250, 50, 500);
        //         const box_height = processBoxParameterInput(note.querySelector('[name="box_height"]'), 250, 50, 500);

        const box_height = note.querySelector('[name="box_height"]');
        const posx = note.querySelector('[name="posx"]');
        const posy = note.querySelector('[name="posy"]');
        const box_width = note.querySelector('[name="box_width"]');

        var output = {
            url: note.querySelector('[name="url"]').textContent,
            noteid: note.querySelector('[name="noteid"]').textContent,
            message_display_text: utf8_to_b64(note.querySelector('[name="message_display_text"]').value.trim()),
            enabled: note.querySelector('[name="enabled"]').textContent,
            selection_text: note.querySelector('[name="selection_text"]').textContent,
            posx: posx,
            posy: posy,
            box_width: box_width,
            box_height: box_height,
            createtime: note.querySelector('[name="createtime"]').textContent,
            lastmodifiedtime: note.querySelector('[name="lastmodifiedtime"]').textContent
        }
        console.debug(output);
        return output;
    } catch (e) {
        console.error(e);
    }

    // createtime: note.querySelector('[name="createtime"]').textContent,
    //   lastmodifiedtime: note.querySelector('[name="lastmodifiedtime"]')


}

/**
 *
 */

var yellowstockynote_text_opening = "yellownote=";
var yellowstockynote_text_closing = "=yellownote";

function isSticyNoteRoot(ele) {
    //console.debug("# isSticyNoteRoot");
    //console.debug(ele.nodeType);
    //console.debug(ele.nodeName);
    //console.debug(ele.getAttribute("type"));

    try {
        if (ele.nodeName == "CONTAINER" && ele.getAttribute("type") == "yellownote") {
            return true;

        } else {
            return false;
        }
    } catch (e) {
        console.error(e);
        return false;
    }

}

function updateClipboard(newClip) {
    navigator.clipboard.writeText(newClip).then(function () {
        /* clipboard successfully set */
    }, function () {
        /* clipboard write failed */
    });
}

/**
 * make different parts of the graphical elements visible or not.
 */
function setComponentVisibility(note, visibility) {
    console.debug("# setComponentVisibility " + visibility);
    const regex = new RegExp(visibility, 'i');
    const allElements = note.querySelectorAll('[ subcomponentvisibility ]');
    // Iterate over the selected elements

    allElements.forEach(function (element) {
        // If the element does not have the attribute with the given value, set display to 'none'
        // if (element.getAttribute('minimized') === "notvisible") {
        //console.debug(element);
        //console.debug(element.getAttribute('subcomponentvisibility'));
        //console.debug(regex.test( element.getAttribute('subcomponentvisibility') ) );

        if (regex.test(element.getAttribute('subcomponentvisibility'))) {
            // make the element visible
            //console.debug("make visible");
            //console.debug(element);
            element.style["display"] = "";
            //element.style.display = 'inherit';
            //element.style.display = 'unset';

        } else {
            // make the element invisible
            //console.debug("make invisible");
            //console.debug(element);
            element.style.display = 'none';
        }
        //console.debug(element.style.display);
        //element.style.display = 'inherit';
        //  console.debug("element has minimized attribute set to visible" + element);

        //}else{
        // }
    });
    // set new size for the whole note "frame"

    if (/mini/.test(visibility)) {
        console.debug("mini");
        //note.querySelector('table[name="whole_note_table"]').style.height = "30px";

    } else if (/normal/.test(visibility)) {
        console.debug("normal");

        //  note.setAttribute("box_height", number_h);
        //  element = note.querySelector('[name="whole_note_table"]');
        //   const w= element.style.width;
        console.debug("setting to " + note.getAttribute("box_height") + "px");
        note.querySelector('table[name="whole_note_table"]').style.height = note.getAttribute("box_height") + "px";

    }

}

/* locate the X-position on the page for element */
function divOffset_x(el) {
    var rect = el.getBoundingClientRect();
    //console.log(rect);
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    //console.debug(scrollLeft);
    // scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return (rect.right + scrollLeft);
}

/* locate the Y-position on the page for element */
function divOffset_y(el) {
    console.debug("# divOffset_y");
    var rect = el.getBoundingClientRect();
    //console.log(rect);
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    //console.debug(scrollTop);
    return (rect.top + scrollTop);
}

function ignore(elm) {
    //	console.debug("isExcluded")
    //	console.debug(elm );
    //console.debug("elm.tagName: " + elm.tagName );
    //	console.debug("elm.tagName: " + elm.tagName.toUpperCase() );
    if (elm.tagName.toUpperCase() == "STYLE") {
        return true;
    }
    if (elm.tagName.toUpperCase() == "SCRIPT") {
        return true;
    }
    if (elm.tagName.toUpperCase() == "NOSCRIPT") {
        return true;
    }
    if (elm.tagName.toUpperCase() == "IFRAME") {
        return true;
    }
    if (elm.tagName.toUpperCase() == "OBJECT") {
        return true;
    }
    if (elm.tagName.toUpperCase() == "YELLOWSTICKYNOTE") {
        return true;
    }
    return false
}

function isExcluded(elm) {
    //	console.debug("isExcluded")
    //	console.debug(elm );
    //	console.debug("elm.tagName: " + elm.tagName );
    //	console.debug("elm.tagName: " + elm.tagName.toUpperCase() );
    //    if (elm.tagName.toUpperCase() == "STYLE") {
    //        return true;
    //    }
    if (elm.tagName.toUpperCase() == "SCRIPT") {
        return true;
    }
    if (elm.tagName.toUpperCase() == "NOSCRIPT") {
        return true;
    }
    if (elm.tagName.toUpperCase() == "IFRAME") {
        return true;
    }
    if (elm.tagName.toUpperCase() == "OBJECT") {
        return true;
    }
    return false
}

function delete_note(event) {
    console.debug("browsersolutions delete note");
    console.debug(event);
    // stop clicking anything behind the button
    event.stopPropagation();

    // get the node that is the root of the sticky note.

    var note_obj = getYellowStickyNoteRoot(event.target);
    console.debug(note_obj);
    //var noteid = note_obj.querySelectorAll('[name="noteid"]')[0].textContent.trim();
    var noteid = note_obj.getAttribute("noteid");

    console.debug("browsersolutions removing noteid: " + noteid);

    // send delete request back to server to delete the note.
    // rely on the browser already having an authenticated session with the server.


    chrome.runtime.sendMessage({
        message: {
            "action": "single_note_delete",
            "delete_details": {
                "noteid": noteid
            }
        }
    }, function (response) {
        console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
        console.debug("message sent to backgroup.js with response code: " + response.statuscode);

        // finally, call "close" on the note
        remove_noteid(noteid);
    });

}

// check if a yellownote is already on the page
function isNoteOnPage(noteid) {
    console.debug("browsersolutions isNoteOnPage (" + noteid + ")");
    console.debug(document.querySelectorAll('[noteid="' + noteid + '"][type][class]'));
    return document.querySelectorAll('[noteid="' + noteid + '"][type][class]').length > 0;
}

/**
 *
 * @param {*} input
 * @param {*} fallback
 * @returns
 */
function processBoxParameterInput(input, fallback, lowerLimit, upperLimit) {

    let number;

    if (typeof input === 'string') {
        number = Number(input);
        if (isNaN(number)) {
            return fallback;
        }
    } else if (typeof input === 'number') {
        number = input;
    } else {
        return fallback;
    }

    if (Number.isInteger(number) && number >= lowerLimit && number <= upperLimit) {
        return number;
    } else {
        return fallback;
    }
}

var valid_stickynote_position_coordinate_regexp = new RegExp(/^[0-9][0-9]*[a-z][a-z]$/);

/**
 *
 * @param {*} newGloveboxNode
 * @param {*} note_obj
 *
 * place the note object into the DOM
 *
 * If there are coordinates in the not, use those to place the note. Otherwise, attempt to locate,  based on text search,
 *  inside the page the location where the note should be placed. If this does not success, place it on top of the page.
 */

function size_and_place_note_based_on_coordinates(newGloveboxNode, note_obj, isOwner, newNote) {
    console.debug("browsersolutions: " + "#size_and_place_note_based_on_coordinates.start");
    // final placement
    // check if note contains position coordinates/parameters. If so, try to use them to place the note

    console.debug(note_obj);
    var posx = note_obj.posx;
    var posy = note_obj.posy;

    console.debug("browsersolutions posx:" + posx);
    console.debug("browsersolutions posy:" + posy);

    //console.debug("browsersolutions " + valid_stickynote_position_coordinate_regexp.test(posx));
    //console.debug("browsersolutions " + valid_stickynote_position_coordinate_regexp.test(posy));

    const rootElement = document.documentElement;
    //console.debug(rootElement);
    let insertedNode = rootElement.insertBefore(newGloveboxNode, rootElement.firstChild.nextSibling);
    //let insertedNode = rootElement.appendChild(newGloveboxNode);

    console.debug(insertedNode);

    console.debug("moving to posx:" + posx + " posy:" + posy);

    insertedNode.style.top = posy;
    insertedNode.querySelector('[name="whole_note_table"]').style.top = posy;
    insertedNode.style.left = posx;
    insertedNode.querySelector('[name="whole_note_table"]').style.left = posx;

    insertedNode.style.visibility = 'visible';
    insertedNode.style.zIndex = "10000";

    //newGloveboxNode.style.position = 'relative';

    // if note has valid size settings, use those, otherwise go with defaults
    const box_width = note_obj.box_width;
    const box_height = note_obj.box_height;
    console.debug("using box_width:" + box_width + " box_height:" + box_height);

    // examine options to make the width context sensitive

    // set overall size of the note
    insertedNode.style.width = box_width;
    insertedNode.querySelector('[name="whole_note_table"]').style.width = box_width;
    insertedNode.querySelector('[name="whole_note_middlebar"]').style.height = (parseInt(box_height) - 55) + 'px';
    insertedNode.style.height = box_height;
    insertedNode.querySelector('[name="whole_note_table"]').style.height = box_height;

    insertedNode.querySelector('[name="whole_note_table"]').style.position = "absolute";

    // update the size of some other fields in the note object

    try {
        //console.debug(insertedNode.querySelector('[name="contentFrame"]'));

        var note_internal_height_padding = 57;
        if (isOwner) {

        } else {
            // if the note is not owned by the current user, the note will be smaller as the bottom bar is removed
            note_internal_height_padding = 31;
        }

        const new_heigth = (parseInt(box_height) - note_internal_height_padding);
        console.debug("setting new content frame height: " + new_heigth);
        
        insertedNode.querySelector('[name="contentFrame"]').style.height = new_heigth + 'px';
        const note_internal_width_padding = 2;
const new_width = (parseInt(box_width) - note_internal_width_padding);
        console.debug("setting new content frame width " + new_width);
        insertedNode.querySelector('[name="contentFrame"]').style.width = new_width + 'px';

    } catch (e) {
        console.error(e);
    }

    insertedNode.setAttribute("box_width", box_width);
    insertedNode.setAttribute("box_height", box_height);

}
