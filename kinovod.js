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
    const pagingFull = document.getElementById('pg_full');
    const pagingSmall = document.getElementById('pg_small');

    const paging = pagingFull?.computedStyleMap().get('display').value === 'none' ? pagingSmall : pagingFull;

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
    spacers.forEach((x) => x.remove());

    let html = list.innerHTML;
    items.forEach((element) => {
      html += ` ${element.outerHTML}`;
    });

    const elemCount = Math.floor(list.offsetWidth / list.children[0].offsetWidth);

    let spacersCount = elemCount - (items.length % elemCount || elemCount);

    while (spacersCount > 0) {
      html += ' <li class="spacer"></li>';
      spacersCount -= 1;
    }

    list.innerHTML = html;

    if (paging.id === 'pg_full') {
      const pagingElems = paging.querySelectorAll('li');
      pagingElems.forEach((x) => {
        if (+x.firstChild.innerHTML === page) {
          x.classList.add('active');
        } else {
          x.classList.remove('active');
        }
      });
    } else if (paging.id === 'pg_small') {
      const pagingElems = paging.querySelectorAll('option');
      const numOfPages = pagingElems[pagingElems.length - 1].getAttribute('value');
      pagingElems.forEach((temp) => {
        const x = temp;
        if (+x.getAttribute('value') === page) {
          x.setAttribute('selected', 'selected');
          x.innerHTML = `${page} / ${numOfPages}`;
        } else {
          x.removeAttribute('selected');
          x.innerHTML = `${x.getAttribute('value')}`;
        }
      });
    }

    page += 1;
  });
})();
