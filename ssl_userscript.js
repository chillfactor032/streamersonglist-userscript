// ==UserScript==
// @name        Streamer Song List UserScript
// @namespace   https://www.chillaspect.com
// @version     0.1.2
// @description Convenience functions for StreamerSongList
// @author      chillfactor032
// @match       https://www.streamersonglist.com/*
// @icon        https://www.streamersonglist.com/assets/icon/favicon-96x96.png
// @updateURL   https://raw.githubusercontent.com/chillfactor032/streamersonglist-userscript/main/ssl_userscript.js
// @downloadURL https://raw.githubusercontent.com/chillfactor032/streamersonglist-userscript/main/ssl_userscript.js
// @supportURL  https://github.com/chillfactor032/streamersonglist-userscript
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
        check_queue_reloaded();
    }else if(url.endsWith("/songs")){
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
        console.log("SSL UserScript: Loaded");
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
    console.log("Queue Table Has Changed");
    var move_top_button;
    var edit_button;
    var existing_buttons;
    var queue_rows = document.getElementsByTagName("mat-row");
    for(var x = 0; x < queue_rows.length; x++){
        if(queue_rows.item(x).children.length > 0){
            existing_buttons = queue_rows.item(x).querySelectorAll(".chill_injected");
            if(existing_buttons.length > 0){
                // Buttons already exist, dont add any more
                continue;
            }
            move_top_button = document.createElement("button");
            move_top_button.className = "chill_injected mat-focus-indicator mat-tooltip-trigger mat-icon-button mat-button-base ng-star-inserted";
            move_top_button.innerHTML = "<span class=\"mat-button-wrapper\"><mat-icon _ngcontent-ege-c186=\"\" role=\"img\" fontset=\"ico\" fonticon=\"icon-vertical_align_top\" aria-hidden=\"true\" class=\"mat-icon notranslate icon-vertical_align_top ico mat-icon-no-color\" data-mat-icon-type=\"font\" data-mat-icon-name=\"icon-vertical_align_top\" data-mat-icon-namespace=\"ico\"></mat-icon></span><span matripple=\"\" class=\"mat-ripple mat-button-ripple mat-button-ripple-round\"></span><span class=\"mat-button-focus-overlay\"></span>";
            move_top_button.setAttribute("onclick","queueMoveToTop("+(x+1)+");");
            edit_button = document.createElement("button");
            edit_button.className = "chill_injected mat-focus-indicator mat-tooltip-trigger mat-icon-button mat-button-base ng-star-inserted";
            edit_button.innerHTML = "<span class=\"mat-button-wrapper\"><mat-icon _ngcontent-ege-c186=\"\" role=\"img\" fontset=\"ico\" fonticon=\"icon-mode_edit\" aria-hidden=\"true\" class=\"mat-icon notranslate icon-mode_edit ico mat-icon-no-color\" data-mat-icon-type=\"font\" data-mat-icon-name=\"icon-mode_edit\" data-mat-icon-namespace=\"ico\"></mat-icon></span><span matripple=\"\" class=\"mat-ripple mat-button-ripple mat-button-ripple-round\"></span><span class=\"mat-button-focus-overlay\"></span>";
            edit_button.setAttribute("onclick","queueEdit("+(x+1)+");");
            queue_rows.item(x).children.item(0).before(edit_button);
            queue_rows.item(x).children.item(0).before(move_top_button);
        }
    }
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

window.queueMoveToTop = function(row){
    var wait = 500;
    setTimeout(function (){
        var button = document.querySelector("button[data-cy='move-top-button']");
        if(button == null){
            console.log("SSL UserScript: Warning - Cannot find moveToTop button");
            return;
        }
        button.click();
    }, wait);
}

function songs(){
    console.log("Song Page Loaded. Maybe add some features to this page?");
}









