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

    let channels = [
        {
          "can_buy": false,
          "channel_type": "channel",
          "epg_static": "https://v3-ipjet.ipnet.ua/static/programs/382.json",
          "icon_url": "https://api-tv.ipnet.ua/media/channels-icons/2118742638.gif",
          "id": 382,
          "is_disable_timeshift_ff": false,
          "is_disable_timeshift_rew": false,
          "is_tshift": true,
          "is_tshift_allowed": true,
          "name": "Viasat KINO Megahit",
          "nick": "viasat_megahit",
          "preview_url": "https://v3.ipjet.ipnet.ua/thumbnails/2118742638/",
          "tshift_duration": 172800,
          "tshift_url": "https://api-tv.ipnet.ua/api/v1/manifest/2118742638.m3u8?timeshift=",
          "url": "https://api-tv.ipnet.ua/api/v1/manifest/2118742638.m3u8",
          "youtube_playlist_id": ""
        },
        {
          "can_buy": false,
          "channel_type": "channel",
          "epg_static": "https://v3-ipjet.ipnet.ua/static/programs/775.json",
          "icon_url": "https://api-tv.ipnet.ua/media/channels-icons/1302383551.gif",
          "id": 775,
          "is_disable_timeshift_ff": false,
          "is_disable_timeshift_rew": false,
          "is_tshift": true,
          "is_tshift_allowed": true,
          "name": "Viasat KINO Comedy",
          "nick": "kino_comedy",
          "preview_url": "https://v3.ipjet.ipnet.ua/thumbnails/1302383551/",
          "tshift_duration": 172800,
          "tshift_url": "https://api-tv.ipnet.ua/api/v1/manifest/1302383551.m3u8?timeshift=",
          "url": "https://api-tv.ipnet.ua/api/v1/manifest/1302383551.m3u8",
          "youtube_playlist_id": ""
        },
    ];

    await login();

    const SET_CHANNEL = undefined;
    const ADD_CHANNELS_IDS = [ 382, 775 ];

    let video;

    let scope = await findFunc();

    await new Promise(resolve => setTimeout(() => resolve(), 2000));

    if(ADD_CHANNELS_IDS) {
        if(ADD_CHANNELS_IDS === "all")
            addAll(scope);
        else
            addChannels(scope);
    };

    SET_CHANNEL && setChannel(scope);
    mediaKeys(scope);

    scope.Channels.categories.forEach(c => c.channels.forEach(x => {
        if(x.can_buy) {
            x.can_buy = false;
            x.is_tshift = true;
        }
    }));

    scope.Channels.currentChannel.is_tshift = true;
    let epg = scope.EPG.currentChannelEPG;
    scope.EPG.currentChannelEPG = [];
    scope.$apply();
    scope.EPG.currentChannelEPG = epg;
    scope.$apply();

    scope.Nav?.hideAll();
    scope.Player?.toggleCursorMouse();

    async function findFunc() {
        return await new Promise(resolve => {
            let interval = setInterval(() => {
                video = document.getElementsByTagName('video')[0];
                if (video) {
                    let scope = window?.angular?.element(video)?.scope();

                    clearInterval(interval);
                    resolve(scope);
                }
            }, 100);
        });
    }

    function addChannels(scope) {
        let filtered_channel_ids = ADD_CHANNELS_IDS.filter(x => scope.Channels.all_channels.findIndex(y => y.id === x) === -1);
        let selected_channels = channels.filter(x => filtered_channel_ids.includes(x.id));

        if (selected_channels.length === 0) return;

        scope.Channels.all_channels.splice(0, 0, ...selected_channels);

        scope.Channels.currentChannelIndex = scope.Channels.all_channels.findIndex(x => x.id === scope.Channels.currentChannel.id);
    }

    function addAll(scope) {
        var category = {...scope.Channels.categories[0]};
        category.name = "All";
        category.note = "all";
        category.$$hashKey = "new";
        category.channels = channels;

        scope.Channels.categories.push(category);
    }

    function setChannel(scope) {
        if (scope.Channels.currentChannel.name !== SET_CHANNEL) {
            let index = scope.Channels.all_channels.findIndex(x => x.name === SET_CHANNEL);
            let channel = scope.Channels.all_channels[index];

            if (channel) {
                scope.Channels?.switchChannels(channel, index);
                scope.Nav.blocks.topDescription.handler(false);
                scope.Channels.setCurrentChannelIndex(channel.id, index);
            };
        }
    }

    function mediaKeys(scope) {
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

    async function postData(url = '', data = {}) {
        // Default options are marked with *
        const response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *client
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
        return await response.json(); // parses JSON response into native JavaScript objects
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
    };
})();
