// ==UserScript==
// @name         sweet
// @namespace    http://tampermonkey.net/
// @version      2024-07-10
// @description  try to take over the world!
// @author       You
// @match        https://sweet.tv/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=sweet.tv
// @grant        none
// ==/UserScript==

// eslint-disable-next-line wrap-iife, func-names
(function () {
  // eslint-disable-next-line strict, lines-around-directive
  'use strict';

  const promoInterval = setInterval(() => {
    const promo = document.querySelector('div[ng-if="$root.promotionReady"]');

    if (promo) {
      promo.style.display = 'none';
      clearInterval(promoInterval);
    }
  }, 100);

  setInterval(() => {
    const button = document.querySelector('button[data-quality="360"]') || document.querySelector('button[data-quality="480"]');

    if (button && !button.classList.contains('quality_select')) {
      button.click();
    }
  }, 1000);
})();
