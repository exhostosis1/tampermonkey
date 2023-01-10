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

(function() {
    'use strict';
    document.exitPictureInPicture = null;
    document.addEventListener('keyup', (e) => {
        if (e.key === 'MediaTrackPrevious') {
            window.player.api('prev');
        }
        else if (e.key === 'MediaTrackNext') {
            window.player.api('next');
        }
    });
})();