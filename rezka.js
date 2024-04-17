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

  function setStyle(query, cssParam, cssValue) {
    document.querySelectorAll(query).forEach((elem) => {
      const el = elem;
      el.style[cssParam] = cssValue;
    });
  }

  setStyle('.b-collections__newest, #hd-comments-list, .b-newest_slider_wrapper, table.b-post__actions td:first-child, .b-dwnapp, #addcomment-title, #comments-form, #hd-comments-navigation', 'display', 'none');

  setStyle('.b-content__inline_inner_mainprobar', 'padding-right', '0');
  setStyle('.b-wrapper', 'width', '1700px');
  setStyle('#cdnplayer, #cdnplayer-container', 'height', '720px');
  setStyle('#cdnplayer, #cdnplayer-container', 'width', 'auto');
  setStyle('#top-nav', 'position', 'sticky');

  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();

    return (
      rect.top >= 0
      && rect.left >= 0
      && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
      && rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  const paging = document.querySelector('div.b-navigation');

  const url = new URL(window.location.href);
  const reg = /(?<=\/page\/)\d+(?=\/)/gi;
  const match = reg.exec(url.pathname);

  let page;

  if (match) {
    page = +match[0];
  } else {
    url.pathname += url.pathname.endsWith('/') ? '' : '/';
    url.pathname += 'page/1/';
    page = 1;
  }

  let pending = false;

  document.addEventListener('scroll', async () => {
    if (pending || !paging || !isElementInViewport(paging)) return;
    pending = true;
    page += 1;

    url.pathname = url.pathname.replace(reg, page);

    const res = await fetch(url.href);

    if (!res.ok) return;

    const newDoc = document.implementation.createHTMLDocument().body;
    newDoc.innerHTML = await res.text();

    const items = newDoc.querySelectorAll('div.b-content__inline_items > div.b-content__inline_item');

    if (items.length === 0) return;

    paging.before(...items);
    pending = false;
  });
})();
