// ==UserScript==
// @name         kinovod
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @icon         https://www.google.com/s2/favicons?domain=tampermonkey.net
// @grant        none
// @match        https://kinovod.pro/*
// ==/UserScript==

(async function () {
  'use strict';

  //   div#comments,
  // div#footer > p:first-child,
  // ul > li:has(a[href="/tv"]),
  // ul > li:has(a[href="/soon"]),
  // ul > li:has(a[href="/collections"]) {
  //   display:none !important;
  // }

  // div#header {
  //   position: sticky;
  //   margin-top: 0;
  // }

  function setStyle(query, cssParam, cssValue) {
    document.querySelectorAll(query).forEach((elem) => {
      const el = elem;
      el.style[cssParam] = cssValue;
    });
  }

  setStyle('div#comments, div#footer > p:first-child, ul > li:has(a[href="/tv"]), ul > li:has(a[href="/soon"]), ul > li:has(a[href="/collections"])', 'display', 'none');

  const header = document.getElementById('header');
  header.style.position = 'sticky';
  header.style['margin-top'] = 0;

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

  let pending = false;

  const pagingFull = document.getElementById('pg_full');
  const pagingSmall = document.getElementById('pg_small');

  const paging = pagingFull?.computedStyleMap().get('display').value === 'none' ? pagingSmall : pagingFull;

  document.addEventListener('scroll', async () => {
    if (pending || !paging || !isElementInViewport(paging)) return;
    pending = true;

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
    pending = false;
  });
})();
