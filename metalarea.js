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

(function() {
    'use strict';

    if(document.getElementById("userlinksguest") !== null)
    {
        login();
    }

    function login() {
        let formData = {
            UserName: "exhostosis",
            PassWord: "e74eae2fd9adc9f",
            CookieDate: "1"
        };

        postAndRedirect("https://metalarea.org/forum/index.php?act=Login&CODE=01", formData);
    };

    function postAndRedirect(url, postData)
    {
        let html = `<input type="hidden" name="referer" value=${window.location.href.replace("http", "https")}>`;

        for (var key in postData)
        {
            if (postData.hasOwnProperty(key))
            {
                html += `<input type='hidden' name='${key}' value='${postData[key]}'></input>`;
            }
        }

        var formElement = document.createElement("form");
        formElement.setAttribute("method", "post");
        formElement.setAttribute("name", "LOGIN");
        formElement.setAttribute("action", url);

        formElement.innerHTML = html;

        document.getElementsByTagName('body')[0].append(formElement);
        formElement.submit();
    };
})();