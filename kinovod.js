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

// eslint-disable-next-line wrap-iife, func-names
(async function () {
  // eslint-disable-next-line strict, lines-around-directive
  'use strict';

  let player;

  await new Promise((resolve) => {
    setTimeout(() => {
      player = window.pljsglobal && window.pljsglobal[0];
      resolve();
    }, 2000);
  });

  if (player) {
    document.addEventListener('keyup', (e) => {
      if (e.key === 'MediaTrackPrevious') {
        player.api('prev');
      } else if (e.key === 'MediaTrackNext') {
        player.api('next');
      }
    });

    return;
  }

  const url = new URL(window.location.href);
  let page = new URLSearchParams(url.search).get('page') ?? 1;

  document.addEventListener('scroll', async () => {
    if ((window.innerHeight + window.scrollY) < document.body.offsetHeight) {
      return;
    }

    const res = await fetch(`${url.origin}${url.pathname}?page=${page}`).then((data) => data.text());
    page += 1;

    const doc = document.implementation.createHTMLDocument().body;

    doc.innerHTML = res;

    const items = doc.querySelectorAll('div#main > div.container > ul.items > li.item');
    const list = document.querySelector('div#main > div.container > ul.items');

    if (!items || !list) return;

    const spacers = list.querySelectorAll('li.spacer');
    spacers.forEach((x) => list.removeChild(x));

    let count = 0;

    items.forEach((x) => {
      count += 1;
      if (count % 6 === 0) return;
      const temp = x;
      temp.style['margin-right'] = '20px';
    });

    list.append(...items);
    list.append(...spacers);
  });
})();
