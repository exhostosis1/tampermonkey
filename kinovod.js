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
    }, 500);
  });

  if (player) {
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
    const paging = document.getElementById('pg_full');
    if (!paging || !isElementInViewport(paging) || currentPage === page) return;
    currentPage = page;

    url.searchParams.set('page', page);
    const res = await fetch(url.href);

    if (!res.ok) return;

    const newDoc = document.implementation.createHTMLDocument().body;
    newDoc.innerHTML = await res.text();

    const items = newDoc.querySelectorAll('div#main > div.container > ul.items > li.item');
    const list = document.querySelector('div#main > div.container > ul.items');

    if (items.length === 0 || !list) return;

    const spacers = list.querySelectorAll('li.spacer');
    spacers.forEach((x) => list.removeChild(x));

    let html = list.innerHTML;
    items.forEach((element) => {
      html += ` ${element.outerHTML}`;
    });

    list.innerHTML = html;

    const pagingElems = paging.querySelectorAll('li');
    pagingElems.forEach((x) => {
      if (+x.firstChild.innerHTML === page) {
        x.classList.add('active');
      } else {
        x.classList.remove('active');
      }
    });

    page += 1;
  });
})();
