// ==UserScript==
// @name         seasonvar
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @icon         https://www.google.com/s2/favicons?domain=tampermonkey.net
// @grant        none
// @match        http://seasonvar.ru/*
// ==/UserScript==

(async function() {
    'use strict';
    
    let player;

    await new Promise(resolve => setTimeout(() => { 
        player = window.player;
        resolve();
     }, 2000));
    
    document.exitPictureInPicture = null;

    document.addEventListener('keyup', (e) => {
        if (e.key === 'MediaTrackPrevious') {
            player.api('prev');
        }
        else if (e.key === 'MediaTrackNext') {
            player.api('next');
        }
    });
})();