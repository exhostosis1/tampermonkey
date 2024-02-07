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

(async function () {
    'use strict';
    let player;

    await new Promise(resolve => setTimeout(() => {
        player = window.pljsglobal && window.pljsglobal[0];
        resolve();
    }, 2000));

    if (player) {
        document.addEventListener('keyup', (e) => {
            if (e.key === 'MediaTrackPrevious') {
                player.api('prev');
            }
            else if (e.key === 'MediaTrackNext') {
                player.api('next');
            }
        });
    }
    else {
        let url = new URL(window.location.href);
        let page = new URLSearchParams(url.search).get("page") ?? 1;

        document.addEventListener('scroll', async () => {

            if ((window.innerHeight + window.scrollY) < document.body.offsetHeight) {
                return;
            }

            let res = await fetch(`${url.origin}${url.pathname}?page=${++page}`).then(data => data.text());

            let doc = document.implementation.createHTMLDocument().body;

            doc.innerHTML = res;

            let items = doc.querySelectorAll("div#main > div.container > ul.items > li.item");
            let list = document.querySelector("div#main > div.container > ul.items");

            if (!items || !list) return;

            let spacers = list.querySelectorAll("li.spacer");
            spacers.forEach(x => list.removeChild(x));

            let count = 0;

            items.forEach(x => {
                count++;
                if (count % 6 == 0) return;
                x.style["margin-right"] = "20px"
            });

            list.append(...items);
            list.append(...spacers);
        });
    }
})();