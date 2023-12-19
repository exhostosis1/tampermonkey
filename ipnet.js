// ==UserScript==
// @name         ipnet
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        *://tv.ipnet.ua/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ipnet.ua
// @grant        none
// ==/UserScript==

(async function () {
    'use strict';

    const CHANNELS = [
        {
            "id": 382,
            "name": "Viasat KINO Megahit",
            "can_buy": false,
            "channel_type": "channel",
            "epg_static": "https://v3-ipjet.ipnet.ua/static/programs/382.json",
            "icon_url": "https://api-tv.ipnet.ua/media/channels-icons/2118742638.gif",
            "is_disable_timeshift_ff": false,
            "is_disable_timeshift_rew": false,
            "is_tshift": true,
            "is_tshift_allowed": true,
            "nick": "viasat_megahit",
            "preview_url": "https://v3.ipjet.ipnet.ua/thumbnails/2118742638/",
            "tshift_duration": 172800,
            "tshift_url": "https://api-tv.ipnet.ua/api/v1/manifest/2118742638.m3u8?timeshift=",
            "url": "https://api-tv.ipnet.ua/api/v1/manifest/2118742638.m3u8",
            "youtube_playlist_id": ""
        },
        {
            "id": 775,
            "name": "Viasat KINO Comedy",
            "can_buy": false,
            "channel_type": "channel",
            "epg_static": "https://v3-ipjet.ipnet.ua/static/programs/775.json",
            "icon_url": "https://api-tv.ipnet.ua/media/channels-icons/1302383551.gif",
            "is_disable_timeshift_ff": false,
            "is_disable_timeshift_rew": false,
            "is_tshift": true,
            "is_tshift_allowed": true,
            "nick": "kino_comedy",
            "preview_url": "https://v3.ipjet.ipnet.ua/thumbnails/1302383551/",
            "tshift_duration": 172800,
            "tshift_url": "https://api-tv.ipnet.ua/api/v1/manifest/1302383551.m3u8?timeshift=",
            "url": "https://api-tv.ipnet.ua/api/v1/manifest/1302383551.m3u8",
            "youtube_playlist_id": ""
        },
    ];

    const LOGIN_REQUIRED = true;
    const SWITCH_TO_CHANNEL = false;
    const CHANNELS_TO_ADD = "all";

    LOGIN_REQUIRED && await login();

    await new Promise(resolve => setTimeout(() => resolve(), 2000));
    let scope = await findScope();

    CHANNELS_TO_ADD && addChannels(scope, CHANNELS_TO_ADD === "all" ? CHANNELS : CHANNELS.filter(x => CHANNELS_TO_ADD.includes(x.id)));
    SWITCH_TO_CHANNEL && setChannel(scope, SWITCH_TO_CHANNEL);
    processMediaKeys(scope);
    buyCurrentChannel(scope);
    buyChannels(scope);

    scope.Nav?.hideAll();
    scope.Player?.toggleCursorMouse();
    document.getElementsByClassName('overlay')[0].hidden = true;

    //functions

    function buyChannels(scope) {
        scope.Channels.categories.forEach(c => c.channels.forEach(x => {
            if (x.can_buy) {
                x.can_buy = false;
                x.is_tshift = true;
            }
        }));
    }

    function buyCurrentChannel(scope) {
        scope.Channels.currentChannel.is_tshift = true;
        let epg = scope.EPG.currentChannelEPG;
        scope.EPG.currentChannelEPG = [];
        scope.$apply();
        scope.EPG.currentChannelEPG = epg;
        scope.$apply();
    }

    async function findScope() {
        return new Promise(resolve => {
            let interval = setInterval(() => {
                let video = document.getElementsByTagName('video')[0];
                if (video) {
                    let scope = window?.angular?.element(video)?.scope();

                    clearInterval(interval);
                    resolve(scope);
                }
            }, 100);
        });
    }

    function addChannels(scope, channels) {
        let selected_channels = channels.filter(x => scope.Channels.all_channels.findIndex(y => y.id === x) === -1);

        if (selected_channels.length === 0) return;

        var category = { ...scope.Channels.categories[0] };
        category.name = "Added";
        category.note = "added";
        category.$$hashKey = "added";
        category.channels = selected_channels;

        scope.Channels.categories.push(category);
    }

    function setChannel(scope, channel) {
        if (scope.Channels.currentChannel.name !== channel) {
            let index = scope.Channels.all_channels.findIndex(x => x.id === channel);
            let channel = scope.Channels.all_channels[index];

            if (channel) {
                scope.Channels?.switchChannels(channel, index);
                scope.Nav.blocks.topDescription.handler(false);
                scope.Channels.setCurrentChannelIndex(channel.id, index);
            }
        }
    }

    function processMediaKeys() {
        let paused = false;

        document.addEventListener('keyup', (e) => {
            if (e.key === 'MediaTrackPrevious') {
                scope.Channels.prevChannel();
            }
            else if (e.key === 'MediaTrackNext') {
                scope.Channels.nextChannel();
            }
            else if (e.key === 'MediaPlayPause') {
                if (paused) {
                    scope.Player.restore();
                    paused = false;
                } else {
                    scope.Player.pause();
                    paused = true;
                }
            }
            else if (e.key === 'Enter') {
                scope.Nav.toggleAll();
            }
        });
    }

    function checkTokenDate(token) {
        if (!token || token == "null") return false;

        var encryptedDate = token.split(".")[1];

        if (!encryptedDate) return false;

        var date = new Date(JSON.parse(atob(encryptedDate))?.exp * 1000);

        return date > new Date();
    }

    async function login() {
        let token = window.localStorage.getItem("ngStorage-token");

        if (!checkTokenDate(token)) {
            let loginData = await postData("https://api-tv.ipnet.ua/api/v1/online-tv/account/login", {
                agg_id: "405144097",
                password: "667c7032876182efffebe32283907a44"
            });

            if (loginData?.code === 200) {
                window.localStorage.setItem("ngStorage-token", `"${loginData.data.token}"`);
                window.localStorage.setItem("ngStorage-refresh_token", `"${loginData.data.refresh_token}"`);

                document.location.reload();
            }
        }

        async function postData(url = '', data = {}) {
            const response = await fetch(url, {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                redirect: 'follow',
                referrerPolicy: 'no-referrer',
                body: JSON.stringify(data)
            });

            return response.json();
        }
    }
})();
