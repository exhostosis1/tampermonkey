// ==UserScript==
// @name         kinovod
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @icon         https://www.google.com/s2/favicons?domain=tampermonkey.net
// @grant        none
// @match        https://kinovod.net/*
// ==/UserScript==

(function() {
    'use strict';

    let player;

    setTimeout(() => {
        player = window.pljssglobal[0]
    }, 2000);

    document.addEventListener('keyup', (e) => {
        if (e.key === 'MediaTrackPrevious') {
            player.api('prev');
        }
        else if (e.key === 'MediaTrackNext') {
            player.api('next');
        }
    });
})();