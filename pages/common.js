/**
 * 
 */


var yellowstockynote_text_opening = "yellownote=";
var yellowstockynote_text_closing = "=yellownote";



// the session token is not completed as yet
 function get_username_from_sessiontoken(token) {
    
    return (JSON.parse(token)).userid;   
    
}


/**
 * make note "draggable" across the screen
 */

function dragStickyNote(elmnt) {
    console.debug("# dragStickyNote");
    console.debug(elmnt);
try{
    // identity the root element of the stickynote - based on any arbitrarily clicked element contained inside it.
    // check if clicked element is root
    // loop upwards until note root is found

    var StickyNoteRootNode = getYellowStickyNoteRoot(elmnt);
//    if (isSticyNoteRoot(elmnt)) {
  //      // the element is the root and is the element where position should be set

//        StickyNoteRootNode = elmnt;

  //  }

    console.debug(StickyNoteRootNode);


    var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        console.debug("2.0");
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        console.debug("2.2");
        // otherwise, move the DIV from anywhere inside the DIV:
        // assign top row in the note table to be "dragable"
        console.debug(StickyNoteRootNode.querySelector("tr.whole_note_topbar"));

        StickyNoteRootNode.querySelector("tr.whole_note_topbar").onmousedown = dragMouseDown;

        //elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        console.debug("# dragMouseDown");
        console.debug(e);
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        console.debug("# elementDrag");
        //console.debug(e);
        //console.debug(divOffset_y(e.target));
        //console.debug(divOffset_x(e.target));

        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        //console.debug(pos1);
        //console.debug(pos2);
        //console.debug(pos3);
        //console.debug(pos4);

        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        //console.debug(pos1);
        //console.debug(pos2);
        // console.debug(pos3);
        // console.debug(pos4);

        //console.debug(elmnt.offsetTop);
        //console.debug(elmnt.offsetLeft);

        //console.debug("seting y: " + (elmnt.offsetTop - pos2));
        //console.debug("seting x: " + (elmnt.offsetLeft - pos1));

        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";

        //     cont1.setAttribute("type", 'glovebox');

        //console.debug(document.querySelector('container[type="glovebox"]'));

        //document.querySelector('container[type="glovebox"]').style.position = "absolute";

        //document.querySelector('container[type="glovebox"]').style.top = (elmnt.offsetTop - pos2) + "px";
        //document.querySelector('container[type="glovebox"]').style.left = (elmnt.offsetLeft - pos1) + "px";

        //document.querySelector('container[type="glovebox"]').setAttribute("posy", (elmnt.offsetTop - pos2));
        //document.querySelector('container[type="glovebox"]').setAttribute("posx", (elmnt.offsetLeft - pos1));

        //console.debug(document.querySelector('container[type="glovebox"]'));

    }

    function closeDragElement(e) {
        console.debug("# closeDragElement");
        //console.debug(e);
        // stop moving when mouse button is released:
        // store final position in root node
        //console.debug(StickyNoteRootNode);
        console.debug("seting y: " + (elmnt.offsetTop - pos2));
        console.debug("seting x: " + (elmnt.offsetLeft - pos1));
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";

        StickyNoteRootNode.setAttribute("posy", (elmnt.offsetTop - pos2));
        StickyNoteRootNode.setAttribute("posx", (elmnt.offsetLeft - pos1));

        document.onmouseup = null;
        document.onmousemove = null;
    }
}catch(e){
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

function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    const buffer = new ArrayBuffer(8);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

function base64EncodeUnicode(str) {
    // Firstly, escape the string using encodeURIComponent to get the UTF-8
    // encoding of the characters,
    // Secondly, we convert the percent encodings into raw bytes, and add it to
    // btoa() function.
    utf8Bytes = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
            return String.fromCharCode('0x' + p1);
        });

    return btoa(utf8Bytes);
}

function stringToArrayBuffer(str) {
    var buf = new ArrayBuffer(str.length * 2);
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function arrayBufferToString(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function isExcluded(elm) {
    //	console.debug("isExcluded")
    //	console.debug(elm );
    //	console.debug("elm.tagName: " + elm.tagName );
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
    return false
}


/*
function to look through the text of the document to locate where the selection string fits in

Taking account of the fact that selction may spand multiple DOM node, the function return both the DOM node the text starts inside of,
 and the one it ends inside of. As well as the character position of the start and endpoint in those node

*/
function getDOMposition(textnode_map, selection_text) {

    console.log("browsersolutions getDOMposition, locate in the body of the document the selection text: " + selection_text);

    try {

        if (selection_text !== undefined && selection_text.length > 0) {

            // start
            var start_range_node;
            var start_offset = 0;
            // end
            var end_range_node;
            var end_offset = 0;

            var start_pos = whole_page_text.replace(/\s/g, "").indexOf(selection_text.replace(/\s/g, ""));
            console.debug("start pos: " + start_pos);
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
                        console.debug("hit!");
                        start_range_node = textnode_map[i][2];
                        // who far out in the textnode does the selection actually begin (on compacted text, so only approx.)
                        //start_offset = start_pos - textnode_map[i][0];
                        //console.debug(i + " " + textnode_map[i][0]);
                        // break out of iteration
                        i = 10000000;

                        // if the selection is fully contained inside the start node..
                        var indexofSelection = start_range_node.textContent.indexOf(selection_text);
                        console.debug(indexofSelection);

                        if (indexofSelection > 0) {
                            // selection is fully contained inside start node
                            // start offset  is where the match begins
                            start_offset = indexofSelection;
                        } else {
                            // selection spans outside the start node
                            // The selection text will have some whitespace characters removed (line breaks, and tabs)
                            // to be able to make a match, the text must also have these replace with a single space (ascii 20)
                            // also multiple repeated shapce characters must be collapsed into just one.

                            console.debug("#determine overlap between")
                            //console.debug(selection_text.replace(/\W/g, ""));
                            //console.debug(selection_text.replace(/\w/g, ""));
                            console.debug(align_characterspace(selection_text));
                            console.debug("#and")
                            //console.debug(start_range_node.textContent.replace(/\W/g, ""))
                            //console.debug(start_range_node.textContent.replace(/\w/g, ""))
                            //console.debug(start_range_node.textContent)
                            console.debug(align_characterspace(start_range_node.textContent))

                            var lcs = longest_common_substring(align_characterspace(selection_text), align_characterspace(start_range_node.textContent));
                            //console.debug(lcs);
                            console.debug("#found common section: " + lcs);
                            // look for the startOffset by frying the find where the overlaping piece fit.
                            start_offset = align_characterspace(start_range_node.textContent).indexOf(lcs);
                            console.debug(start_offset);
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

            return {
                "start_range_node": start_range_node,
                "start_offset": start_offset,
                "end_range_node": end_range_node,
                "end_offset": end_offset
            }

        } else {
            return null;
        }

    } catch (e) {
        console.error(e);
        return;
    }

}



function utf8_to_b64(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}

function b64_to_utf8(str) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
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
        const myclose_note = (event) => {
            close_note(event);
            event.stopPropagation();
        };

        const myCopy_note_to_clipboard = (event) => {
            copy_note_to_clipboard(event);
            event.stopPropagation();
        };

       
        const myminimize_note = (event) => {
            minimize_note(event);
            event.stopPropagation();
        };

        const mymaximize_note = (event) => {
            maximize_note(event);
            event.stopPropagation();
        };
        const myrightsize_note = (event) => {
            rightsize_note(event);
            event.stopPropagation();
        };

        const mydelete_note = (event) => {
            delete_note(event);
            event.stopPropagation();
        };
        const mySave_changes_to_note = (event) => {
            save_changes_to_note(event);
            event.stopPropagation();
        };
        const mydisable_note = (event) => {
            disable_note(event);
            event.stopPropagation();
        };

        const mynote_goto = (event) => {
            console.log("event.stopPropagation();");
            note_goto(event);
            event.stopPropagation();

        };



        // for close buttons/icons
        var allGoTo = note.querySelectorAll('[js_action="close_note"]');
        for (var i = 0; i < allGoTo.length; i++) {
            allGoTo[i].removeEventListener("click", myclose_note);
            allGoTo[i].addEventListener("click", myclose_note);
        }

        // for save buttons/icons
        var allGoTo3 = note.querySelectorAll('[js_action="save_new_note"]');
        for (var i = 0; i < allGoTo3.length; i++) {
            allGoTo3[i].removeEventListener("click", mySave_new_note);
            allGoTo3[i].removeEventListener("click", mySave_changes_to_note);
            allGoTo3[i].addEventListener("click", mySave_new_note);
        }


        // for delete buttons/icons
        var allGoTo2 = note.querySelectorAll('[js_action="delete_note"]');
        for (var i = 0; i < allGoTo2.length; i++) {
            allGoTo2[i].removeEventListener("click", mydelete_note);
            allGoTo2[i].addEventListener("click", mydelete_note);
        }

       
        var allGoTo5 = note.querySelectorAll('[js_action="copy_note_to_clipboard"]');
        for (var i = 0; i < allGoTo5.length; i++) {
            console.debug(allGoTo5[i]  );
            allGoTo5[i].removeEventListener("click", myCopy_note_to_clipboard);
            allGoTo5[i].addEventListener("click", myCopy_note_to_clipboard);
        }


        var allGoTo7 = note.querySelectorAll('[js_action="save_changes_to_note"]');
        for (var i = 0; i < allGoTo7.length; i++) {
            allGoTo7[i].removeEventListener("click", mySave_new_note);
            allGoTo7[i].removeEventListener("click", mySave_changes_to_note);
            allGoTo7[i].addEventListener("click", mySave_changes_to_note);
        }

        var allGoTo8 = note.querySelectorAll('[js_action="disable_note"]');
        for (var i = 0; i < allGoTo8.length; i++) {
            allGoTo8[i].removeEventListener("click", mydisable_note);
            allGoTo8[i].addEventListener("click", mydisable_note);
          
          

        }
 // for button going to note location
        var allGoTo11 = note.querySelectorAll('[js_action="note_goto"]');
        for (var i = 0; i < allGoTo11.length; i++) {
            allGoTo11[i].removeEventListener("click", mynote_goto);
            allGoTo11[i].addEventListener("click", mynote_goto);
          
        }


        var allGoTo12 = note.querySelectorAll('[js_action="minimize_note"]');
        for (var i = 0; i < allGoTo12.length; i++) {
            allGoTo12[i].removeEventListener("click", myminimize_note);
            allGoTo12[i].addEventListener("click", myminimize_note);
       }

       var allGoTo13 = note.querySelectorAll('[js_action="maximize_note"]');
       for (var i = 0; i < allGoTo13.length; i++) {
           allGoTo13[i].removeEventListener("click", mymaximize_note);
           allGoTo13[i].addEventListener("click", mymaximize_note);
      }
      var allGoTo14 = note.querySelectorAll('[js_action="rightsize_note"]');
      for (var i = 0; i < allGoTo14.length; i++) {
          allGoTo14[i].removeEventListener("click", myrightsize_note);
          allGoTo14[i].addEventListener("click", myrightsize_note);
     }



    } catch (e) {
        console.error(e);
    }

}





// A procedure that examined the html/DOM structure and only alows certain tags to be included in the output
// this is a security measure to prevent XSS attacks.
// TBC
function safeInjectHTML(rawHTML, targetElement) {
    console.log("safeInjectHTML.start");
    // Create a detached DOM element
    const container = document.createElement('div');

    // Populate it with the raw HTML content
    container.innerHTML = rawHTML;

    // Initialize an empty DocumentFragment
    const fragment = document.createDocumentFragment();

    // List of allowed tags
    const allowedTags = ['p', 'span', 'div', 'a', 'td', "div", "container", "form", "tr"];

    // Loop through each child node of the detached element
    Array.from(container.childNodes).forEach((node) => {
        console.log(node.tagName);

        // If it's a text node, append it to the DocumentFragment
        if (node.nodeType === Node.TEXT_NODE) {
            fragment.appendChild(node.cloneNode(true));
        }
        // If it's an element node, check if the tag is in the list of allowed tags
        else if (node.nodeType === Node.ELEMENT_NODE && allowedTags.includes(node.tagName.toLowerCase())) {
            // Clone this node deeply
            const clonedNode = node.cloneNode(true);

            // If this is an anchor, ensure it has rel="noopener noreferrer" for security
            if (clonedNode.tagName.toLowerCase() === 'a') {
                clonedNode.setAttribute('target', '_blank');
                clonedNode.setAttribute('rel', 'noopener noreferrer');
            }
            fragment.appendChild(clonedNode);
        } else {
            console.log("safeInjectHTML.rejecting: " + node.nodeName);
        }
    });
    // Append the sanitized content to the target element
    targetElement.appendChild(fragment);
}

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

// contain node object and the position within overall text (white space removed)
var textnode_map = [];


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



function create_stickynote_node(note_object_data, note_template) {
    console.log("browsersolutions create_stickynote_node.start");
    console.debug("browsersolutions " + JSON.stringify(note_object_data));
    console.debug(note_template);

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
    cont1.setAttribute("note_type", 'yellownote');
    cont1.setAttribute("uuid", note_object_data.uuid);

    //cont1.appendChild(create_note_table(note_object_data,note_template));
    cont1.appendChild(note_template);

    // Locate the form element
    console.debug(cont1);
    var noteForm = cont1.querySelector('form[name="note_form"]');
    console.debug(noteForm);

    noteForm.querySelector('input[type="hidden"][name="selection_text"]').replaceChildren(document.createTextNode(note_object_data.selection_text));
    noteForm.querySelector('input[type="hidden"][name="uuid"]').replaceChildren(document.createTextNode(note_object_data.uuid));

    noteForm.querySelector('input[type="hidden"][name="note_type"]').replaceChildren(document.createTextNode(note_object_data.note_type));

    noteForm.querySelector('input[type="hidden"][name="createtime"]').replaceChildren(document.createTextNode(note_object_data.createtime));
    noteForm.querySelector('input[type="hidden"][name="lastmodifiedtime"]').replaceChildren(document.createTextNode(note_object_data.lastmodifiedtime));
    // capture local url
    noteForm.querySelector('input[type="hidden"][name="url"]').replaceChildren(document.createTextNode(note_object_data.url));

    if (typeof note_object_data.enabled != undefined) {
        noteForm.querySelector('input[type="hidden"][name="enabled"]').replaceChildren(document.createTextNode(note_object_data.enabled));
    } else {
        // default value if undefined, is enabled(=true)
        noteForm.querySelector('input[type="hidden"][name="enabled"]').replaceChildren(document.createTextNode("true"));
    }

    console.debug(noteForm);

    // there directly by just clicking on this link

    // setup event listener whereby the user can configure this link
    // rewriting to be automatic

    // where to anchor the tooltip
    // setup node in the DOM tree to contain content of message box
    // var newGloveboxNode = document.createElement("Glovebox");
    // console.debug(newGloveboxNode);

    cont1.setAttribute("id", note_object_data.uuid); // attach a unique ID to the


    return cont1;

}



function locateStickyNote(request, sender, sendResponse) {

	try{
	
	var shared_secret_to_identify_background_js_to_content_script_NavigateToSpecificStickynote = "Glbx_marker3465";
	
    console.debug("browsersolutions JSON(request): " + JSON.stringify(request));


    // only execute this code if it has been properly called. The value of Get_GloveboxCiphertext is not being used for anything other than to screen out calls to this code.
    if (request.NavigateToSpecificStickynote == shared_secret_to_identify_background_js_to_content_script_NavigateToSpecificStickynote ) {
// look up
    	console.debug("#################" );
    	request.note_object.selection_text
    	
    	// check if the note has set position coordinated and no selected text. if so, go to that positon
    	
    	var selection_text  = request.note_object.selection_text
    	
    	console.debug(selection_text);

    	var selection_text  = request.note_object.selection_text
    	
    	console.debug(selection_text);
    	
    	
    	var valid_pos_regex = /^[0-9\.]*$/;
    	
    	valid_pos_regex.test(request.note_object.posx);
    	valid_pos_regex.test(request.note_object.posy);

    	if (valid_pos_regex.test(request.note_object.posx) && valid_pos_regex.test(request.note_object.posy)){

        	window.scrollTo(request.note_object.posx, request.note_object.posy); 

    		
    	}else{
        	//window.scrollTo(500, 0); 
    		// try searching for the note in the document

    	}
    	
    	
    }
	}catch(e){
		console.error(e);
	}

}


function getYellowStickyNoteRoot(currentElement) {

    // let currentElement = element;
    // container type="yellownote"
    //console.log(currentElement);
    //console.log(currentElement.querySelector('container[type="yellownote"]'));

    if (currentElement.hasAttribute("note_type"))  {
        if (currentElement.getAttribute("note_type") === "yellownote" ){
        
        // Condition met, return this element
        return currentElement;
        }
    }
    while (currentElement !== null && currentElement !== document) {
        //console.log(currentElement);
        //console.log(currentElement.querySelector('container[type="yellownote"]'));
        if (currentElement.hasAttribute("note_type"))  {
            if (currentElement.getAttribute("note_type") === "yellownote" ){
            
            // Condition met, return this element
            return currentElement;
            }
        }
        // Move up the DOM tree to the parent node
        currentElement = currentElement.parentNode;
    }

    // If the loop completes without finding an element with the target class
    return null;
}

function getCursorXY(e) {
    //console.debug("########");
    //console.debug(e);


    Cursor_clientX = e.clientX;
    Cursor_clientY = e.clientY;
    Cursor_layerX = e.layerX;
    Cursor_layerY = e.layerY;

    //console.debug("Cursor_x: " + Cursor_clientX);

    // set a globally accessible variable contaning the mouse position, accessible to be read as required

    //	document.getElementById('cursorX').value = (window.Event) ? e.pageX : event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
    //		document.getElementById('cursorY').value = (window.Event) ? e.pageY : event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
}

function serialize_note(out) {

    //return  JSON.stringify(out).replace(/":"/g,"__del__").replace(/","/g,"__sep__").replace(/\{"/g,"__left__").replace(/"\}/g,"__right__");
    return encodeURI(JSON.stringify(out).replace(/":"/g, "__del__").replace(/","/g, "__sep__"));
}

function deserialize_note(out) {
console.debug("# deserialize_note");



    //return  JSON.stringify(out).replace(/":"/g,"__del__").replace(/","/g,"__sep__").replace(/\{"/g,"__left__").replace(/"\}/g,"__right__");
    //console.debug(out.replace(/"__del__"/g,":").replace(/"__sep__"/g,",").replace(/__left__"/g,"\{").replace(/__right__/g,"0\"\}"));
    //return  out.replace(/__del__/g,":").replace(/__sep__/g,",").replace(/__left__/g,"\{").replace(/__right__/g,"0\"\}");

    //return  JSON.stringify(out).replace(/":"/g,"__del__").replace(/","/g,"__sep__").replace(/\{"/g,"__left__").replace(/"\}/g,"__right__");
    console.debug(out.replace(/"__del__"/g, ":").replace(/"__sep__"/g, ",").replace(/__left__"/g, "\{\"").replace(/__right__/g, "\"\}"));
    return JSON.parse(decodeURI(out).replace(/__del__/g, "\":\"").replace(/__sep__/g, "\",\"").replace(/__left__/g, "\{\"").replace(/__right__/g, "\"\}"));



}



function isSticyNoteRoot(ele) {
    //console.debug("# isSticyNoteRoot");
    //console.debug(ele.nodeType);
    //console.debug(ele.nodeName);
    //console.debug(ele.getAttribute("type"));

try{
    if (ele.nodeName == "CONTAINER" && ele.getAttribute("note_type") == "yellownote") {
        return true;

    } else {
        return false;
    }
}catch(e){
    console.error(e);   
    return false;
}

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



function offset(el) {
    var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft
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