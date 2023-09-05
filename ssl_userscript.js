// ==UserScript==
// @name        Streamer Song List UserScript
// @namespace   https://www.chillaspect.com
// @version     0.2.3
// @description Convenience functions for StreamerSongList
// @author      chillfactor032
// @homepage    https://github.com/chillfactor032/streamersonglist-userscript
// @match       https://www.streamersonglist.com/*
// @icon        https://www.streamersonglist.com/assets/icon/favicon-96x96.png
// @updateURL   https://raw.githubusercontent.com/chillfactor032/streamersonglist-userscript/main/version.js
// @downloadURL https://raw.githubusercontent.com/chillfactor032/streamersonglist-userscript/main/ssl_userscript.js
// @supportURL  https://github.com/chillfactor032/streamersonglist-userscript/issues
// @run-at      document-idle
// @grant       none
// ==/UserScript==


(function() {
    'use strict';
    console.log("SSL UserScript: Starting");
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
            console.log("Check Page Changed");
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
                injectStyles();
                queue();
                break;
            }
        }
    }, 1000);
}

function queue(){
    console.log("SSL UserScript: Reloading Queue Page Features");
    var move_top_button;
    var edit_button;
    var existing_buttons;
    var note;
    var css_class;
    var queue_rows = document.getElementsByTagName("mat-row");
    var bumpCnt = 0;
    var tool_bar;
    for(var x = 0; x < queue_rows.length; x++){
        if(queue_rows.item(x).children.length > 0){
            existing_buttons = queue_rows.item(x).querySelectorAll(".chill_injected");
            if(existing_buttons.length > 0){
                // Buttons already exist, dont add any more
                continue;
            }
            note = queue_rows.item(x).children[7].innerHTML;
            css_class = noteToBumpLevel(note);
            if(css_class.length>0){
                queue_rows.item(x).classList.add(css_class);
                bumpCnt++;
            }
            var title_element = queue_rows.item(x).children.item(2);
            var title = title_element.innerHTML;
            var artist;

            if(title_element.classList.contains("mat-column-nonlist-song")){
                title = queue_rows.item(x).children.item(2).innerHTML;
                title = title.replaceAll("<!---->","");
                artist = "";
                console.log("Non-songlist song: "+title);
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
            bump_count_button.className = "chill_injected mat-focus-indicator";
            bump_count_button.innerHTML = `Bump Count: ${bumpCnt}`;
            bump_count_button.setAttribute("style", "margin-left: 100px; width: 100%; color: white; font-size: 1.2em;");
            tool_bar.children.item(tool_bar.children.length-1).append(bump_count_button);
        }else{
            bump_count_button.innerHTML = `Bump Count: ${bumpCnt}`;
        }

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

window.getQueue = function(){
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

window.queueEdit = function(){
    setTimeout(function (){
        var button = document.querySelector("button[data-cy='edit-button']");
        if(button == null){
            console.log("SSL UserScript: Warning - Cannot find edit button");
            return;
        }
        button.click();
    }, 500);
}

window.queueMoveToTop = function(title, artist){
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
    var css_text = `
.bump {
    background-color: #003300;
}
.bump .inactive {
    color: #00e600;
}
.cpbump {
    background-color: #003366;
}
.cpbump .inactive {
    color: #3399ff;
}
.bitsbump {
    background-color: #003366;
}
.bitsbump .inactive {
    color: #3399ff;
}
.gsbump {
    background-color: #003366;
}
.gsbump .inactive {
    color: #3399ff;
}
.donobump {
    background-color: #003366;
}
.donobump .inactive {
    color: #3399ff;
}
.t3bump {
    background-color: #003366;
}
.t3bump .inactive {
    color: #3399ff;
}
`;
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css_text;
    document.getElementsByTagName('head')[0].appendChild(style);
}

function noteToBumpLevel(note){
    note = note.toLowerCase().replaceAll(" ", "");
    if(note==null){
        return "";
    }
    if(note.includes("cpbump")){
        return "cpbump";
    }else if(note.includes("bitsbump")){
        return "bitsbump";
    }else if(note.includes("gsbump")){
        return "gsbump";
    }else if(note.includes("donobump")){
        return "donobump";
    }else if(note.includes("t3bump")){
        return "t3bump";
    }else if(note.includes("bump")){
        return "bump";
    }
    return "";
}

function songs(){
    console.log("Song Page Loaded. Maybe add some features to this page?");
}
