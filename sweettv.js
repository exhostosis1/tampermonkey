/* eslint-disable no-unused-vars */
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

(async function () {
  'use strict';

  const REFRESH_TOKEN = '';

  function setLoginCookie() {
    if (!REFRESH_TOKEN) {
      console.log('no login data');
      return;
    }

    const date = new Date();
    date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));

    document.cookie = `refresh_token=${REFRESH_TOKEN}; expires=${date.toUTCString()}; path=/`;

    location.reload();
  }

  function checkLoginCookie() {
    const reg = /(?<=refresh_token=)[a-z0-9-]+/gi;
    let match = reg.exec(decodeURIComponent(document.cookie));

    return match && match[0] === REFRESH_TOKEN;
  }

  function removePromotion() {
    const promoInterval = setInterval(() => {
      const promo = document.querySelector('div[ng-if="$root.promotionReady"]');

      if (promo) {
        promo.style.display = 'none';
        clearInterval(promoInterval);
      }
    }, 100);

      const versionInterval = setInterval(() => {
      const version = document.querySelector('div[check-version]');

      if (version) {
        version.style.display = 'none';
        clearInterval(versionInterval);
      }
    }, 1000);
  };

  function setLowestQuality() {
    setInterval(() => {
      const button = document.querySelector('button[data-quality="360"]') || document.querySelector('button[data-quality="480"]');

      if (button && !button.classList.contains('quality_select')) {
        button.click();
      }
    }, 1000);
  }

  function findPlyr() {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const plyr = document.getElementsByClassName('plyr')[0];
        if (!plyr) return;

        clearInterval(interval);
        resolve(plyr);
      }, 100);
    });
  }

  async function processFullscreen() {
    const plyr = await findPlyr();
    const parent = plyr.parentNode;
    const prevstyle = {};

    const body = document.getElementsByTagName('body')[0];

    function setFullscreen() {
      body.append(plyr);

      prevstyle.position = plyr.style.position;
      prevstyle.left = plyr.style.left;
      prevstyle.top = plyr.style.top;
      prevstyle.width = plyr.style.width;
      prevstyle.height = plyr.style.height;
      prevstyle['z-index'] = plyr.style['z-index'];

      plyr.style.position = 'absolute';
      plyr.style.left = '0';
      plyr.style.top = '0';
      plyr.style.width = '100%';
      plyr.style.height = '100%';
      plyr.style['z-index'] = '9999';
    }

    const oldFs = document.querySelector('button[data-plyr="fullscreen"]');
    oldFs.style.display = 'none';

    const newFs = document.createElement('button');
    newFs.classList.add('plyr__control');
    newFs.classList.add('plyr__controls__item');
    newFs.setAttribute('data-plyr-item', '');
    newFs.setAttribute('type', 'button');
    newFs.setAttribute('data-plyr', 'fullscreen');

    newFs.innerHTML = '<div data-plyr-item="" class="icon--exit--fullscreen"><svg><use xlink:href="/images/tv/sprite_player.svg#exit_fullscreen_svg"></use></svg></div>';

    oldFs.parentNode.append(newFs);

    function removeFullscreen(key) {
      if (key.key !== 'Escape' && key.type !== 'click') return;

      document.removeEventListener('keyup', removeFullscreen);
      newFs.style.display = 'none';
      oldFs.style.display = 'inline-block';

      plyr.style.position = prevstyle.position;
      plyr.style.left = prevstyle.left;
      plyr.style.top = prevstyle.top;
      plyr.style.width = prevstyle.width;
      plyr.style.height = prevstyle.height;
      plyr.style['z-index'] = prevstyle['z-index'];

      parent.append(plyr);
    }

    setFullscreen();

    newFs.addEventListener('click', removeFullscreen);
    document.addEventListener('keyup', removeFullscreen);
  };


  checkLoginCookie() || setLoginCookie();
  removePromotion();
//  setLowestQuality();
//  await processFullscreen();
})();