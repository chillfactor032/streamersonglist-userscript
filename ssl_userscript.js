// ==UserScript==
// @name        Streamer Song List UserScript
// @namespace   https://www.chillaspect.com
// @version     1.0.3
// @description Convenience functions for StreamerSongList
// @author      chillfactor032
// @homepage    https://github.com/chillfactor032/streamersonglist-userscript
// @match       https://www.streamersonglist.com/*
// @icon        https://www.streamersonglist.com/assets/icon/favicon-96x96.png
// @updateURL   https://raw.githubusercontent.com/chillfactor032/streamersonglist-userscript/main/version.js
// @downloadURL https://raw.githubusercontent.com/chillfactor032/streamersonglist-userscript/main/ssl_userscript.js
// @supportURL  https://github.com/chillfactor032/streamersonglist-userscript/issues
// @require     https://backbeatbot.com/ssl/CustomHexColorPicker/CustomHexColorPicker.lib.js
// @resource    IMPORTED_CSS https://backbeatbot.com/ssl/CustomHexColorPicker/style.css
// @run-at      document-idle
// @grant       GM_getResourceText
// @grant       GM_addStyle
// @grant       unsafeWindow
// ==/UserScript==

(function() {
    'use strict';
    console.log("SSL UserScript: Starting");
    const my_css = GM_getResourceText("IMPORTED_CSS");
    GM_addStyle(my_css);
    var script_start_time = Date.now();
    var load_interval = setInterval(function(){
        var elapsed = Date.now()-script_start_time;
        var found = load();
        if(found || elapsed > 10000){
            clearInterval(load_interval);
            if(elapsed > 10000){
                console.log("SSL UserScript: Timeout Elapsed. Aborting.");
            }
        }
    }, 1000);
    page_changed();
})();

function page_changed(){
    var url = window.location.href;
    if(url.endsWith("/queue")){
        updateStreamerId();
        check_queue_reloaded();
    }else if(url.endsWith("/songs")){
        updateStreamerId();
        songs();
    }else{
        console.log("SSL UserScript: Non-monitored Page");
    }
}

function load(){
    var nav_elements = document.getElementsByTagName("mat-nav-list");
    var found = nav_elements.length > 0;
    if(found){
        var url = window.location.href;
        nav_elements.item(0).onclick = function(){
            setTimeout(function(){
                page_changed();
            }, 2000);
        }
        console.log("SSL UserScript: Loaded Successfully");
    }
    return found;
}

function check_queue_reloaded(){
    console.log("SSL UserScript: Queue Page Monitor [On]");
    var load_interval = setInterval(function(){
        var current_url = window.location.href;
        //Check if no longer on queue page
        //turn off monitor if navigated away from queue
        if(!current_url.endsWith("/queue")){
            console.log("SSL UserScript: Queue Page Monitor [Off]");
            clearInterval(load_interval);
            return;
        }
        var buttons;
        var queue_rows = document.querySelectorAll("mat-row");
        for(var x = 0; x < queue_rows.length; x++){
            buttons = queue_rows.item(x).querySelectorAll(".chill_injected");
            if(buttons.length==0){
                console.log("SSL UserScript: Queue Page Changed.");
                queue();
                break;
            }
        }
    }, 1000);
}

function queue(){
    console.log("SSL UserScript: Reloading Queue Page Features");
    var bump_styles = getBumpStyles();
    var move_top_button;
    var edit_button;
    var existing_buttons;
    var css_class;
    var queue_rows = document.getElementsByTagName("mat-row");
    var bumpCnt = 0;
    var tool_bar;
    var header_row;
    var header_spacer;
    var ssl_table;
    for(var x = 0; x < queue_rows.length; x++){
        if(queue_rows.item(x).children.length > 0){
            existing_buttons = queue_rows.item(x).querySelectorAll(".chill_injected");
            if(existing_buttons.length > 0){
                // Buttons already exist, dont add any more
                continue;
            }
            var title_element = queue_rows.item(x).children.item(2);
            var title = title_element.innerHTML;
            var artist;
            if(title_element.classList.contains("mat-column-nonlist-song")){
                title = queue_rows.item(x).children.item(2).innerHTML;
                title = title.replaceAll("<!---->","");
                artist = "";
            }else{
                artist = queue_rows.item(x).children.item(3).innerHTML;
            }
            move_top_button = document.createElement("button");
            move_top_button.className = "chill_injected mat-focus-indicator mat-tooltip-trigger mat-icon-button mat-button-base ng-star-inserted";
            move_top_button.innerHTML = "<span class=\"mat-button-wrapper\"><mat-icon _ngcontent-ege-c186=\"\" role=\"img\" fontset=\"ico\" fonticon=\"icon-vertical_align_top\" aria-hidden=\"true\" class=\"mat-icon notranslate icon-vertical_align_top ico mat-icon-no-color\" data-mat-icon-type=\"font\" data-mat-icon-name=\"icon-vertical_align_top\" data-mat-icon-namespace=\"ico\"></mat-icon></span><span matripple=\"\" class=\"mat-ripple mat-button-ripple mat-button-ripple-round\"></span><span class=\"mat-button-focus-overlay\"></span>";
            move_top_button.setAttribute("onclick",`queueMoveToTop(\"${title}\",\"${artist}\");`);
            edit_button = document.createElement("button");
            edit_button.className = "chill_injected mat-focus-indicator mat-tooltip-trigger mat-icon-button mat-button-base ng-star-inserted";
            edit_button.innerHTML = "<span class=\"mat-button-wrapper\"><mat-icon _ngcontent-ege-c186=\"\" role=\"img\" fontset=\"ico\" fonticon=\"icon-mode_edit\" aria-hidden=\"true\" class=\"mat-icon notranslate icon-mode_edit ico mat-icon-no-color\" data-mat-icon-type=\"font\" data-mat-icon-name=\"icon-mode_edit\" data-mat-icon-namespace=\"ico\"></mat-icon></span><span matripple=\"\" class=\"mat-ripple mat-button-ripple mat-button-ripple-round\"></span><span class=\"mat-button-focus-overlay\"></span>";
            edit_button.setAttribute("onclick","queueEdit();");
            queue_rows.item(x).children.item(0).before(edit_button);
            queue_rows.item(x).children.item(0).before(move_top_button);
        }
    }
    tool_bar = document.querySelector("mat-toolbar-row");
    if(tool_bar!=null){
        var bump_count_button = tool_bar.querySelector(".chill_injected");
        if(bump_count_button==null){
            bump_count_button = document.createElement("span");
            bump_count_button.setAttribute("id", "bump-count-label");
            bump_count_button.className = "chill_injected mat-focus-indicator";
            bump_count_button.innerHTML = `Bump Count: 0`;
            bump_count_button.setAttribute("style", "margin-left: 100px; width: 100%; color: white; font-size: 1.2em;");
            tool_bar.children.item(tool_bar.children.length-1).append(bump_count_button);
            header_row = document.querySelector("mat-header-row");
            header_row.children[0].before(header_row.children[0].cloneNode());
            ssl_table = document.querySelector("ssl-table");
            var bump_color_div = getColorSettingsDiv();
            ssl_table.after(bump_color_div);
            var customHexColorPicker = new CustomHexColorPicker();
            var colorInputs = document.querySelectorAll('.colorInput');
            for(var z = 0; z < colorInputs.length; z++){
                customHexColorPicker.register(colorInputs.item(z));
                colorInputs.item(z).onchange = colorInputChange.bind(colorInputs.item(z));
            }
        }
    }
    refreshBumpHighlights();
}

function refreshBumpHighlights(){
    var bump_styles = getBumpStyles();
    var note;
    var css_class;
    var queue_rows = document.getElementsByTagName("mat-row");
    var bunp_cnt_element;
    var bumpCnt = 0;
    for(var x = 0; x < queue_rows.length; x++){
        if(queue_rows.item(x).children.length > 0){
            var title_element = queue_rows.item(x).children.item(4);
            if(title_element.classList.contains("mat-column-nonlist-song")){
                note = queue_rows.item(x).children[8].innerHTML;
            }else{
                note = queue_rows.item(x).children[9].innerHTML;
            }
            //Remove old injected classes
            for(var i = 0; i < bump_styles.length; i++){
                queue_rows.item(x).classList.remove(`chill-bump-${i}`);
            }
            note = note.replaceAll("<!---->","");
            css_class = noteToBumpLevel(note);
            if(css_class.length>0){
                queue_rows.item(x).classList.add(css_class);
                bumpCnt++;
            }
        }
    }
    bunp_cnt_element = document.getElementById("bump-count-label");
    if(bunp_cnt_element!=null){
        bunp_cnt_element.innerHTML = `Bump Count: ${bumpCnt}`;
    }
    injectStyles();
}

unsafeWindow.toggleBumpColorTable = function(){
    var table = document.getElementById("bump-color-div");
    var button = document.getElementById("show_hide_bump_color_table");
    if(table==null || button==null){
        return;
    }
    if (table.style.display === "none") {
        table.style.display = "block";
        button.innerHTML = "Hide Bump Highlighter Table";
    } else {
        table.style.display = "none";
        button.innerHTML = "Show Bump Highlighter Table";
    }
}

// Check to see if localStorage streamerData needs to be updated
function checkUpdateStreamerData(){
    const url = window.location.href;
    const streamerData = localStorage.getItem("streamerData");
    //If its not set, update
    if(streamerData == null){
        return true;
    }
    const obj = JSON.parse(streamerData);
    var username = "";
    var url_fragment = localStorage.getItem("StreamerSonglist_lastUrl");
    // If the lastUrl object isnt in storage, something is wrong
    if(url_fragment==null){
        return true;
    }
    var split = url_fragment.split("/");
    //If the username cant be determined by the lastURL obj, update
    if(split.length < 3){
        return true;
    }
    username = split[2];
    // If the username from the url and the one from localStorage dont match
    // Update
    if(username.toLowerCase() != obj.name.toLowerCase()){
        return true;
    }
    return false;
}

function getColorSettingsDiv(){
    var bump_color_div = document.createElement("div");
    bump_color_div.style = "margin-top: 20px; border-radius: 5px;";
    var bump_styles = getBumpStyles();
    var default_values = {
        "keyword": "",
        "background": "",
        "text": "",
        "inactive": ""
    };
    while(bump_styles.length < 10){
        bump_styles.push(default_values);
    }
    saveBumpStyles(bump_styles);
    var tbody = "";
    for(var x = 0; x < bump_styles.length; x++){
        var bg_color = "";
        var text_color = "";
        var inactive_color = "";
        if(bump_styles[x].background != "" && bump_styles[x].background != "transparent"){
            bg_color = `background-color: ${bump_styles[x].background};`;
        }
        if(bump_styles[x].text != "" && bump_styles[x].text != "transparent"){
            text_color = `background-color: ${bump_styles[x].text};`;
        }
        if(bump_styles[x].inactive != "" && bump_styles[x].inactive != "transparent"){
            inactive_color = `background-color: ${bump_styles[x].inactive};`;
        }
        tbody += `
                <tr class="bump-color-row" style="padding: 5px;">
                    <td><input type="text" id="bump-color-input-1" onblur="bumpColorKeywordChanged(this);" value="${bump_styles[x].keyword}" /></td>
                    <td style="${bg_color}">
                        <button class="colorInput" data-color="${bump_styles[x].background}">Select Color</button>
                    </td>
                    <td style="${text_color}">
                        <button class="colorInput" data-color="${bump_styles[x].text}">Select Color</button>
                    </td>
                    <td style="${inactive_color}">
                        <button class="colorInput" data-color="${bump_styles[x].inactive}">Select Color</button>
                    </td>
                    <td>
                        <button onclick="clearBumpColorRow(${x});">Reset</button>
                    </td>
                </tr>
        `;
    }
    bump_color_div.innerHTML = `
        <style>
        #bump-color {

        }
        #bump-color td{
            padding: 10px;
            text-align: center;
        }
        #bump-color input{
            box-sizing: border-box;
            width: 100%;
        }
        </style>
        <button id="show_hide_bump_color_table" onclick="window.toggleBumpColorTable();">Show Bump Highlighter Table</button><p>
        <div id="bump-color-div" style="display: none;">
        <table id="bump-color" border="1" style="border-collapse: collapse; padding: 5px; width: 65%; border-radius: 5px;">
            <thead>
                <tr>
                    <th>Keyword</th>
                    <th>Background</th>
                    <th>Text</th>
                    <th>Inactive Chat</th>
                    <th>Reset</th>
                </tr>
            </thead>
            <tbody>
                ${tbody}
            </tbody>
        </table>
        <div style="font-style: italic; font-size: 0.75em;">
        *Keywords are not case sensitive and ignore spaces. If a color doesn't seem to change, try reloading the page.<br>
        *Notes get matched to keywords top to bottom and stop after the first match, so more generic keywords should come last (e.g. "bump" vs "cp bump").
        </div>
        </div>
    `;
    return bump_color_div;
}

unsafeWindow.clearBumpColorRow = function(rowIndex){
    var table = document.getElementById("bump-color");
    if(rowIndex >= table.rows.length) return;
    var row = table.rows[rowIndex+1];
    row.children[0].children[0].value = "";
    row.children[1].children[0].setAttribute("data-color", "");
    row.children[2].children[0].setAttribute("data-color", "");
    row.children[3].children[0].setAttribute("data-color", "");
    row.children[1].style = "";
    row.children[2].style = "";
    row.children[3].style = "";
    var bump_styles = getBumpStyles();
    if(rowIndex >= bump_styles.length){
        return;
    }
    bump_styles[rowIndex].keyword = "";
    bump_styles[rowIndex].background = "";
    bump_styles[rowIndex].text = "";
    bump_styles[rowIndex].inactive = "";
    saveBumpStyles(bump_styles);
}

unsafeWindow.bumpColorKeywordChanged = function(self){
    var row = self.parentNode.parentNode;
    var row_index = row.rowIndex-1;
    var keyword = self.value;
    if(keyword.length==0) return;
    var bump_styles = getBumpStyles();
    bump_styles[row_index].keyword = keyword;
    saveBumpStyles(bump_styles);
}

function colorInputChange() {
    var color = this.getAttribute('data-color');
    this.parentNode.style = `background-color: ${color};`;
    var row = this.parentNode.parentNode;
    var row_index = row.rowIndex-1;
    var background = row.children[1].children[0].getAttribute('data-color');
    var text = row.children[2].children[0].getAttribute('data-color');
    var inactive = row.children[3].children[0].getAttribute('data-color');
    var bump_styles = getBumpStyles();
    bump_styles[row_index].background = background;
    bump_styles[row_index].text = text;
    bump_styles[row_index].inactive = inactive;
    saveBumpStyles(bump_styles);
}

function updateStreamerId(){
    var streamerData = localStorage.getItem("streamerData");
    if(!checkUpdateStreamerData()){
        if(streamerData != null){
            const obj = JSON.parse(streamerData);
            console.log(`SSL UserScript: StreamerId Lookup - ${obj.name}[${obj.id}]`);
        }
        return;
    }
    var username = "";
    var url_fragment = localStorage.getItem("StreamerSonglist_lastUrl");
    var split = url_fragment.split("/");
    if(split.length < 3){
        return;
    }
    username = split[2].trim();
    const url = `https://api.streamersonglist.com/v1/streamers/${username}?platform=twitch&isUsername=true`
    var request = new XMLHttpRequest();
    request.open("GET", url);
    request.onreadystatechange = function() {
        if(this.readyState === 4 && this.status === 200) {
            const obj = JSON.parse(this.responseText);
            const streamerId = obj.id;
            console.log(`SSL UserScript: StreamerId Lookup - ${username}[${streamerId}]`);
            localStorage.setItem("streamerData", this.responseText);
        }
    };
    request.send();
}

function getStreamerData(){
    const streamerData = localStorage.getItem("streamerData");
    if(streamerData==null){
        return null;
    }
    const obj = JSON.parse(streamerData);
    return obj;
}

unsafeWindow.getQueue = function(){
    const streamerData = getStreamerData();
    var streamerId = streamerData.id;
    var jwt_token = localStorage.getItem("StreamerSonglist_authToken");
    var request = new XMLHttpRequest();
    request.open("GET", `https://api.streamersonglist.com/v1/streamers/${streamerId}/queue`);
    request.onreadystatechange = function() {
        if(this.readyState === 4 && this.status === 200) {
            document.getElementById("result").innerHTML = this.responseText;
        }
    };
    request.send();
}

unsafeWindow.queueEdit = function(){
    setTimeout(function (){
        var button = document.querySelector("button[data-cy='edit-button']");
        if(button == null){
            console.log("SSL UserScript: Warning - Cannot find edit button");
            return;
        }
        button.click();
    }, 500);
}

unsafeWindow.queueMoveToTop = function(title, artist){
    var queueId;
    const streamerData = getStreamerData();
    var streamerId = streamerData.id;
    const queue_url = `https://api.streamersonglist.com/v1/streamers/${streamerId}/queue`
    var jsonData = {};
    var jwt_token = localStorage.getItem("StreamerSonglist_authToken").replaceAll("\"", "");
    var queueArtist;
    var queueTitle;
    var request = new XMLHttpRequest();
    request.open("GET", queue_url);
    request.onreadystatechange = function() {
        if(this.readyState === 4 && this.status === 200) {
            //find song we want to move
            const queueJson = JSON.parse(this.responseText);
            for(var song of queueJson.list){
                if(song.song == null){
                    //Non-songlist Song
                    queueArtist = "";
                    queueTitle = song.nonlistSong;
                }else{
                    queueArtist = song.song.artist;
                    queueTitle = song.song.title;
                }
                if(queueArtist == artist && queueTitle == title){
                    queueId = song.id
                    const put_url = `https://api.streamersonglist.com/v1/streamers/${streamerId}/queue/${queueId}`;
                    song.position = 1;
                    var put_request = new XMLHttpRequest();
                    put_request.open("PUT", put_url);
                    put_request.setRequestHeader("Authorization", `Bearer ${jwt_token}`);
                    put_request.setRequestHeader("Content-Type", "application/json");
                    put_request.onreadystatechange = function() {
                        if(this.readyState === 4 && this.status === 200) {
                            const obj = JSON.parse(this.responseText);
                            const prevPosition = obj.previousPosition;
                            const curPosition = obj.queue.position;
                            console.log(`SSL UserScript: Moved song ${prevPosition} to position ${curPosition}`);
                        }
                    };
                    put_request.send(JSON.stringify(song));
                    return;
                }
            }
            console.log(`SSL UserScript: Error - could not find match in queue for ${title} - ${artist}`);
        }
    };
    request.send();
}

function injectStyles(){
    var bump_styles = getBumpStyles();
    var css_text = "";
    for(var x = 0; x < bump_styles.length; x++){
        css_text += `
            .chill-bump-${x} {
                background-color: ${bump_styles[x].background};
                color: ${bump_styles[x].text};
            }
            .chill-bump-${x} mat-cell {
                color: ${bump_styles[x].text};
            }
            .chill-bump-${x} span {
                color: ${bump_styles[x].text} !important;
            }
            .chill-bump-${x} .inactive {
                color: ${bump_styles[x].inactive};
            }
        `;
    }
    var style = document.getElementById("chill-injected-style");
    if(style==null){
        style = document.createElement('style');
        style.type = 'text/css';
        style.setAttribute("id", "chill-injected-style");
        document.getElementsByTagName('head')[0].appendChild(style);
    }
    style.innerHTML = css_text;
}

function getBumpStyles(){
    var bump_styles = localStorage.getItem("bump_styles");
    if(bump_styles==null || bump_styles.length==0){
        return [];
    }
    var bump_styles_json = JSON.parse(bump_styles);
    return bump_styles_json;
}

function saveBumpStyles(styleArr){
    var cur_styles = getBumpStyles();
    var style_str = JSON.stringify(styleArr);
    if(style_str == JSON.stringify(cur_styles)){
        return;
    }
    localStorage.setItem("bump_styles", style_str);
    injectStyles();
    queue();
    toast("[SSL Userscript] Bump color highlights have been saved.");
}

function noteToBumpLevel(note){
    note = note.toLowerCase().replaceAll(" ", "");
    if(note==null){
        return "";
    }
    var bump_styles = getBumpStyles();
    for(var x = 0; x < bump_styles.length; x++){
        var keyword = bump_styles[x].keyword.toLowerCase().replaceAll(" ", "");
        if(keyword.length==0) continue;
        if(note.includes(keyword)){
            return `chill-bump-${x}`;
        }
    }
    return "";
}

function songs(){
    console.log("Song Page Loaded. Maybe add some features to this page?");
}

function toast(msg){
    var toast_element = document.createElement("div");
    toast_element.style = "position: absolute; right: 60px; bottom: 60px; z-index:999; margin: 10px;";
    var toast_msg_div = document.createElement("div");
    toast_msg_div.innerHTML = msg;
    toast_msg_div.style = "margin: auto; font-size: 1em; background-color: green; text-align: center; padding: 20px; border-radius: 5px;";
    toast_element.appendChild(toast_msg_div);
    var body = document.querySelector("ssl-landing");
    if(body==null){
        return;
    }
    body.appendChild(toast_element);
    setTimeout(function(){
        toast_element.remove();
    }, 1500);
}













