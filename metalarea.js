// ==UserScript==
// @name         metalarea
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        *metalarea.org/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=metalarea.org
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const LOGIN_PAGE = 'https://metalarea.org/forum/index.php?act=Login&CODE=01';
  const USERNAME = '';
  const PASSWORD = '';

  if (!USERNAME || !PASSWORD) {
    console.log('no login data');
    return;
  }

  if (document.getElementById('userlinksguest')) {
    const formData = {
      UserName: USERNAME,
      PassWord: PASSWORD,
      CookieDate: '1',
    };

    let html = `<input type='hidden' name='referer' value='${window.location.href.replace('http:', 'https:')}'>`;

    Object.keys(formData).forEach((key) => {
      html += `<input type='hidden' name='${key}' value='${formData[key]}'></input>`;
    });

    const formElement = document.createElement('form');
    formElement.setAttribute('method', 'post');
    formElement.setAttribute('name', 'LOGIN');
    formElement.setAttribute('action', LOGIN_PAGE);

    formElement.innerHTML = html;

    document.getElementsByTagName('body')[0].append(formElement);
    formElement.submit();
  }
})();
