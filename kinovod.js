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
  let page = url.searchParams.get('page');
  page = page ? +page + 1 : 2;

  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();

    return (
      rect.top >= 0
      && rect.left >= 0
      && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
      && rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  let currentPage = 0;

  document.addEventListener('scroll', async () => {
    const el = document.getElementById('pg_full');
    if (!el || !isElementInViewport(el) || currentPage === page) return;
    currentPage = page;

    url.searchParams.set('page', page);
    const res = await fetch(url.href);

    if (!res.ok) return;

    const newDoc = document.implementation.createHTMLDocument().body;
    newDoc.innerHTML = await res.text();

    const items = newDoc.querySelectorAll('div#main > div.container > ul.items > li.item');
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

    page += 1;
  });
})();
