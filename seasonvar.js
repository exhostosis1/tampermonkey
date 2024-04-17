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

// eslint-disable-next-line wrap-iife, func-names
(async function () {
  // eslint-disable-next-line strict, lines-around-directive
  'use strict';

  function setStyle(query, cssParam, cssValue) {
    document.querySelectorAll(query).forEach((elem) => {
      const el = elem;
      el.style[cssParam] = cssValue;
    });
  }

  setStyle('div.wrapper', 'margin-top', '0');
  setStyle('div.header-icon', 'display', 'none');

  let player;

  await new Promise((resolve) => {
    setTimeout(() => {
      player = window.player;
      resolve();
    }, 2000);
  });

  if (!player) return;

  document.exitPictureInPicture = null;

  document.addEventListener('keyup', (e) => {
    switch (e.key) {
      case 'MediaTrackPrevious':
        player.api('prev');
        break;
      case 'MediaTrackNext':
        player.api('next');
        break;
      default:
        break;
    }
  });
})();
