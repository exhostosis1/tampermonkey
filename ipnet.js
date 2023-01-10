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
        { 'id': 280, 'name': '1+1 HD', 'nick': '1plus1_hd', 'is_tshift_allowed': true, 'url': 'https://api-tv.ipnet.ua/api/v1/manifest/2118742531.m3u8', 'tshift_url': 'https://api-tv.ipnet.ua/api/v1/manifest/2118742531.m3u8?timeshift=', 'icon_url': 'https://api-tv.ipnet.ua/media/channels-icons/2118742531.gif', 'is_tshift': false, 'epg_static': 'https://v3-ipjet.ipnet.ua/static/programs/280.json', 'preview_url': 'https://v3.ipjet.ipnet.ua/thumbnails/2118742531/', 'tshift_duration': 604800, 'can_buy': false, 'youtube_playlist_id': '', 'channel_type': 'channel', 'is_disable_timeshift_rew': false, 'is_disable_timeshift_ff': false },
        { 'id': 295, 'name': '2+2 HD', 'nick': '2plus2_hd', 'is_tshift_allowed': true, 'url': 'https://api-tv.ipnet.ua/api/v1/manifest/2118742545.m3u8', 'tshift_url': 'https://api-tv.ipnet.ua/api/v1/manifest/2118742545.m3u8?timeshift=', 'icon_url': 'https://api-tv.ipnet.ua/media/channels-icons/2118742545.gif', 'is_tshift': false, 'epg_static': 'https://v3-ipjet.ipnet.ua/static/programs/295.json', 'preview_url': 'https://v3.ipjet.ipnet.ua/thumbnails/2118742545/', 'tshift_duration': 604800, 'can_buy': false, 'youtube_playlist_id': '', 'channel_type': 'channel', 'is_disable_timeshift_rew': false, 'is_disable_timeshift_ff': false },
        { 'id': 630, 'name': '1+1', 'nick': '1plus1', 'is_tshift_allowed': true, 'url': 'https://api-tv.ipnet.ua/api/v1/manifest/1293295500.m3u8', 'tshift_url': 'https://api-tv.ipnet.ua/api/v1/manifest/1293295500.m3u8?timeshift=', 'icon_url': 'https://api-tv.ipnet.ua/media/channels-icons/1293295500.gif', 'is_tshift': false, 'epg_static': 'https://v3-ipjet.ipnet.ua/static/programs/630.json', 'preview_url': 'https://v3.ipjet.ipnet.ua/thumbnails/1293295500/', 'tshift_duration': 259200, 'can_buy': false, 'youtube_playlist_id': null, 'channel_type': 'channel', 'is_disable_timeshift_rew': false, 'is_disable_timeshift_ff': false },
        { 'id': 665, 'name': '2+2', 'nick': '2plus2', 'is_tshift_allowed': true, 'url': 'https://api-tv.ipnet.ua/api/v1/manifest/1340433820.m3u8', 'tshift_url': 'https://api-tv.ipnet.ua/api/v1/manifest/1340433820.m3u8?timeshift=', 'icon_url': 'https://api-tv.ipnet.ua/media/channels-icons/1340433820.gif', 'is_tshift': false, 'epg_static': 'https://v3-ipjet.ipnet.ua/static/programs/665.json', 'preview_url': 'https://v3.ipjet.ipnet.ua/thumbnails/1340433820/', 'tshift_duration': 259200, 'can_buy': false, 'youtube_playlist_id': '', 'channel_type': 'channel', 'is_disable_timeshift_rew': false, 'is_disable_timeshift_ff': false },
        { 'id': 775, 'name': 'VIP Comedy', 'nick': 'vip_comedy_hd', 'is_tshift_allowed': true, 'url': 'https://api-tv.ipnet.ua/api/v1/manifest/1302383551.m3u8', 'tshift_url': 'https://api-tv.ipnet.ua/api/v1/manifest/1302383551.m3u8?timeshift=', 'icon_url': 'https://api-tv.ipnet.ua/media/channels-icons/1302383551.gif', 'is_tshift': false, 'epg_static': 'https://v3-ipjet.ipnet.ua/static/programs/775.json', 'preview_url': 'https://v3.ipjet.ipnet.ua/thumbnails/1302383551/', 'tshift_duration': 172800, 'can_buy': false, 'youtube_playlist_id': '', 'channel_type': 'channel', 'is_disable_timeshift_rew': false, 'is_disable_timeshift_ff': false },
        { 'id': 776, 'name': 'VIP Megahit', 'nick': 'vip_megahit_hd', 'is_tshift_allowed': true, 'url': 'https://api-tv.ipnet.ua/api/v1/manifest/1302387861.m3u8', 'tshift_url': 'https://api-tv.ipnet.ua/api/v1/manifest/1302387861.m3u8?timeshift=', 'icon_url': 'https://api-tv.ipnet.ua/media/channels-icons/1302387861.gif', 'is_tshift': false, 'epg_static': 'https://v3-ipjet.ipnet.ua/static/programs/776.json', 'preview_url': 'https://v3.ipjet.ipnet.ua/thumbnails/1302387861/', 'tshift_duration': 172800, 'can_buy': false, 'youtube_playlist_id': '', 'channel_type': 'channel', 'is_disable_timeshift_rew': false, 'is_disable_timeshift_ff': false },
    ];

    await login();

    const SET_CHANNEL = undefined;
    const ADD_CHANNELS_NAMES = ['1+1 HD', '2+2 HD'];

    let video;

    let scope = await findFunc();

    await new Promise(resolve => setTimeout(() => resolve(), 2000));

    ADD_CHANNELS_NAMES && addChannels(scope);
    SET_CHANNEL && setChannel(scope);
    mediaKeys(scope);

    scope.Channels.categories.forEach(c => c.channels.forEach(x => { x.can_buy = false; }));
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
        let filtered_channel_names = ADD_CHANNELS_NAMES.filter(x => scope.Channels.all_channels.findIndex(y => y.name === x) === -1);
        let selected_channels = channels.filter(x => filtered_channel_names.includes(x.name));

        if (selected_channels.length === 0) return;

        scope.Channels.all_channels.splice(0, 0, ...selected_channels);

        scope.Channels.currentChannelIndex = scope.Channels.all_channels.findIndex(x => x.id === scope.Channels.currentChannel.id);
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