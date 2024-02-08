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

// eslint-disable-next-line wrap-iife, func-names
(async function () {
  // eslint-disable-next-line strict, lines-around-directive
  'use strict';

  const CHANNELS = [
    {
      id: 382,
      name: 'Viasat KINO Megahit',
      can_buy: false,
      channel_type: 'channel',
      epg_static: 'https://v3-ipjet.ipnet.ua/static/programs/382.json',
      icon_url: 'https://api-tv.ipnet.ua/media/channels-icons/2118742638.gif',
      is_disable_timeshift_ff: false,
      is_disable_timeshift_rew: false,
      is_tshift: true,
      is_tshift_allowed: true,
      nick: 'viasat_megahit',
      preview_url: 'https://v3.ipjet.ipnet.ua/thumbnails/2118742638/',
      tshift_duration: 172800,
      tshift_url: 'https://api-tv.ipnet.ua/api/v1/manifest/2118742638.m3u8?timeshift=',
      url: 'https://api-tv.ipnet.ua/api/v1/manifest/2118742638.m3u8',
      youtube_playlist_id: '',
    },
    {
      id: 775,
      name: 'Viasat KINO Comedy',
      can_buy: false,
      channel_type: 'channel',
      epg_static: 'https://v3-ipjet.ipnet.ua/static/programs/775.json',
      icon_url: 'https://api-tv.ipnet.ua/media/channels-icons/1302383551.gif',
      is_disable_timeshift_ff: false,
      is_disable_timeshift_rew: false,
      is_tshift: true,
      is_tshift_allowed: true,
      nick: 'kino_comedy',
      preview_url: 'https://v3.ipjet.ipnet.ua/thumbnails/1302383551/',
      tshift_duration: 172800,
      tshift_url: 'https://api-tv.ipnet.ua/api/v1/manifest/1302383551.m3u8?timeshift=',
      url: 'https://api-tv.ipnet.ua/api/v1/manifest/1302383551.m3u8',
      youtube_playlist_id: '',
    },
  ];

  function checkTokenDate(token) {
    if (!token || token === 'null') return false;

    const encryptedDate = token.split('.')[1];
    if (!encryptedDate) return false;

    const { exp } = JSON.parse(atob(encryptedDate));
    if (!exp) return false;

    return new Date(exp * 1000) > new Date();
  }

  function postData(url = '', data = {}) {
    return fetch(url, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(data),
    });
  }

  async function login() {
    const token = window.localStorage.getItem('ngStorage-token');

    if (checkTokenDate(token)) return;

    const loginData = await postData('https://api-tv.ipnet.ua/api/v1/online-tv/account/login', {
      agg_id: '',
      password: '',
    });

    if (loginData.ok) {
      const { data } = (await loginData.json());

      window.localStorage.setItem('ngStorage-token', `"${data.token}"`);
      window.localStorage.setItem('ngStorage-refresh_token', `"${data.refresh_token}"`);

      document.location.reload();
    }
  }

  async function findScope() {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        const video = document.getElementsByTagName('video')[0];
        if (video) {
          const scope = window?.angular?.element(video)?.scope();

          clearInterval(interval);
          if (scope) {
            resolve(scope);
          } else {
            reject();
          }
        }
      }, 100);
    });
  }

  function addChannels(scope, channels) {
    const selectedChannels = channels.filter((x) => scope.Channels
      .all_channels.findIndex((y) => y.id === x) === -1);

    if (selectedChannels.length === 0) return;

    const category = {
      name: 'Added',
      note: 'added',
      $$hashKey: 'added',
      visibility: true,
      channels: selectedChannels,
    };
    scope.Channels.categories.push(category);
    scope.Channels.all_channels.splice(0, 0, ...selectedChannels);
  }

  function addToFavourites(scope, channels) {
    const selectedChannels = scope.Channels
      .all_channels.filter((x) => channels.includes(x.name));

    if (selectedChannels.length === 0) return;

    const category = {
      name: 'Favourites',
      note: 'favourites',
      $$hashKey: 'favourites',
      visibility: true,
      channels: selectedChannels,
    };
    scope.Channels.categories.push(category);
  }

  function setChannel(scope, channelName) {
    const index = scope.Channels.all_channels.findIndex((x) => x.name === channelName);
    const channel = scope.Channels.all_channels[index];

    if (channel) {
      scope.Channels?.switchChannels(channel, index);
      scope.Nav.blocks.topDescription.handler(false);
      scope.Channels.setCurrentChannelIndex(channel.id, index);
    }
  }

  function buyCurrentChannel(s) {
    const scope = s;

    scope.Channels.currentChannel.is_tshift = true;
    const epg = scope.EPG.currentChannelEPG;
    scope.EPG.currentChannelEPG = [];
    scope.$apply();
    scope.EPG.currentChannelEPG = epg;
    scope.$apply();
  }

  function processMediaKeys(scope) {
    const video = document.getElementsByTagName('video')[0];

    document.addEventListener('keyup', (e) => {
      if (e.key === 'MediaTrackPrevious') {
        scope.Channels.prevChannel();
      } else if (e.key === 'MediaTrackNext') {
        scope.Channels.nextChannel();
      } else if (e.key === 'MediaPlayPause') {
        if (video.paused) {
          scope.Player.restore();
        } else {
          scope.Player.pause();
        }
      } else if (e.key === 'Enter') {
        scope.Nav.toggleAll();
      }
    });
  }

  const LOGIN_REQUIRED = true;
  const SWITCH_TO_CHANNEL = false;
  const CHANNELS_TO_ADD = CHANNELS;
  const FAVOURITES = ['Viasat History'];

  if (LOGIN_REQUIRED) await login();

  await new Promise((resolve) => {
    setTimeout(() => resolve(), 2000);
  });

  const scope = await findScope();

  if (CHANNELS_TO_ADD) addChannels(scope, CHANNELS_TO_ADD);
  if (SWITCH_TO_CHANNEL) setChannel(scope, SWITCH_TO_CHANNEL);
  processMediaKeys(scope);

  if (!scope.Channels.currentChannel.is_tshift) {
    buyCurrentChannel(scope);
  }

  if (FAVOURITES) addToFavourites(scope, FAVOURITES);

  scope.Nav?.hideAll();
  scope.Player?.toggleCursorMouse();
  document.getElementsByClassName('overlay')[0].hidden = true;
})();
