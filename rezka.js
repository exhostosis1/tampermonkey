// ==UserScript==
// @name         rezka
// @namespace    http://tampermonkey.net/
// @version      2024-02-13
// @description  try to take over the world!
// @author       You
// @match        https://rezka.ag/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rezka.ag
// @grant        none
// ==/UserScript==

// eslint-disable-next-line wrap-iife, func-names
(async function () {
  // eslint-disable-next-line strict, lines-around-directive
  'use strict';

  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();

    return (
      rect.top >= 0
      && rect.left >= 0
      && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
      && rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  const header = document.getElementById('top-nav');
  const sticky = header.offsetTop;

  const url = new URL(window.location.href);
  const reg = /(?<=\/page\/)\d+(?=\/)/gi;
  const match = reg.exec(url.pathname);

  let page = match ? +match[0] + 1 : 2;

  let currentPage = 0;

  document.addEventListener('scroll', async () => {
    if (window.scrollY > sticky) {
      header.style.position = 'fixed';
    } else {
      header.style.position = 'relative';
    }

    const paging = document.getElementsByClassName('b-navigation')[0];

    if (!paging || !isElementInViewport(paging) || currentPage === page) return;
    currentPage = page;

    if (match) {
      url.href.replace(reg, page);
    } else {
      url.pathname += url.pathname.endsWith('/') ? '' : '/';
      url.pathname += `page/${page}/`;
    }

    const res = await fetch(url.href);

    if (!res.ok) return;

    const newDoc = document.implementation.createHTMLDocument().body;
    newDoc.innerHTML = await res.text();

    const items = newDoc.querySelectorAll('div.b-content__inline_items > div.b-content__inline_item');
    const list = document.querySelector('div.b-content__inline_items');

    if (items.length === 0 || !list) return;

    const nav = list.querySelector('div.b-navigation');
    nav.before(...items);

    page += 1;
  });
})();
