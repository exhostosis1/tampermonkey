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
  const Agg_id = '';
  const Password = '';

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
    if (!Agg_id || !Password) {
    console.log('no login data');
    return;
  }
    
    const token = window.localStorage.getItem('ngStorage-token');

    if (checkTokenDate(token)) return;

    const loginData = await postData('https://api-tv.ipnet.ua/api/v1/online-tv/account/login', {
      agg_id: Agg_id,
      password: Password,
    });

    if (!loginData.ok) return;

    const { data } = (await loginData.json());

    window.localStorage.setItem('ngStorage-token', `"${data.token}"`);
    window.localStorage.setItem('ngStorage-refresh_token', `"${data.refresh_token}"`);

    document.location.reload();
  }

  function findScope() {
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

  function addChannels(scope, channelsToAdd) {
    const localScope = scope;

    const category = {
      name: 'Added',
      note: 'added',
      $$hashKey: 'added',
      visibility: true,
      channels: channelsToAdd,
    };
    localScope.Channels.img_to_category.added = 'category_vip.svg';

    localScope.Channels.categories.push(category);
    localScope.Channels.all_channels.splice(0, 0, ...channelsToAdd);
  }

  function createFavourites(scope, channels) {
    const localScope = scope;
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
    localScope.Channels.img_to_category.favourites = 'category_top_serials.svg';

    localScope.Channels.categories.push(category);
  }

  const favname = 'favourite_items';
  let FAVOURITES = localStorage.getItem(favname)?.split(',').filter((x) => x.length > 0) || [];

  function addToFavourites(scope, channelName) {
    if (FAVOURITES.length === 0) {
      FAVOURITES.push(channelName);
      createFavourites(scope, FAVOURITES);
      localStorage.setItem(favname, FAVOURITES);
      return;
    }

    const category = scope.Channels.categories.find((x) => x.name === 'Favourites');
    const channel = scope.Channels.all_channels.find((x) => x.name === channelName);

    if (!category || !channel) return;

    category.channels.push(channel);

    FAVOURITES.push(channelName);
    localStorage.setItem(favname, FAVOURITES);
  }

  function removeFromFavourites(scope, channelName) {
    const category = scope.Channels.categories.find((x) => x.name === 'Favourites');
    const index = category.channels.findIndex((x) => x.name === channelName);

    if (!category || index < 0) return;

    category.channels.splice(index, 1);
    FAVOURITES = category.channels.map((x) => x.name);
    localStorage.setItem(favname, FAVOURITES);
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

  function buyCurrentChannel(scope) {
    const localScope = scope;

    localScope.Channels.currentChannel.is_tshift = true;
    const epg = scope.EPG.currentChannelEPG;
    localScope.EPG.currentChannelEPG = [];
    localScope.$apply();
    localScope.EPG.currentChannelEPG = epg;
    localScope.$apply();
  }

  function processMediaKeys(scope) {
    const video = document.getElementsByTagName('video')[0];

    document.addEventListener('keyup', (e) => {
      switch (e.key) {
        case 'MediaTrackPrevious':
          scope.Channels.prevChannel();
          break;
        case 'MediaTrackNext':
          scope.Channels.nextChannel();
          break;
        case 'MediaPlayPause':
          if (video.paused) scope.Player.restore(); else scope.Player.pause();
          break;
        case 'Enter':
          scope.Nav.toggleAll();
          break;
        default:
          break;
      }
    });
  }

  const LOGIN_REQUIRED = true;
  const SWITCH_TO_CHANNEL = false;
  const CHANNELS_TO_ADD = CHANNELS;

  if (LOGIN_REQUIRED) await login();

  await new Promise((resolve) => {
    setTimeout(() => resolve(), 2000);
  });

  let scope;

  try {
    scope = await findScope();
  } catch {
    return;
  }

  if (CHANNELS_TO_ADD) addChannels(scope, CHANNELS_TO_ADD);
  if (SWITCH_TO_CHANNEL) setChannel(scope, SWITCH_TO_CHANNEL);
  processMediaKeys(scope);

  if (!scope.Channels.currentChannel.is_tshift) {
    buyCurrentChannel(scope);
  }

  if (FAVOURITES.length > 0) createFavourites(scope, FAVOURITES);

  scope.Nav?.hideAll();
  scope.Player?.toggleCursorMouse();
  document.getElementsByClassName('overlay')[0].hidden = true;

  const channelButtons = document.querySelectorAll('.channels-block md-list-item button');

  const flyout = document.createElement('div');
  flyout.id = 'flyout';
  flyout.processingFunction = () => { };

  const css = document.createElement('style');

  css.innerText = `
  #flyout {
    display: none;
    position: absolute;
    width: 200px;
    height: 30px;
    background-color: rgb(80, 80, 80);
    color: white;
    z-index: 999;
    text-align: center;
    padding-top: 10px;
    border-radius: 15px;
    cursor: pointer;
  }

  #flyout:hover {
    background-color: gray;
  }`;

  flyout.addEventListener('click', () => {
    flyout.processingFunction();
    flyout.style.display = 'none';
  });

  const body = document.getElementsByTagName('body')[0];
  body.append(flyout);
  body.addEventListener('click', () => {
    flyout.style.display = 'none';
  });
  body.append(css);

  function getProcessingFunction(name, mode) {
    if (mode === 'add') {
      return () => addToFavourites(scope, name);
    }

    if (mode === 'remove') {
      return () => removeFromFavourites(scope, name);
    }

    return () => { };
  }

  channelButtons.forEach((button) => {
    button.addEventListener('contextmenu', (event) => {
      event.preventDefault();

      const channelName = event.target.ariaLabel;

      const isInFavourites = FAVOURITES.findIndex((x) => x === channelName) >= 0;

      flyout.innerHTML = isInFavourites ? 'Remove from favourites' : 'Add to favourites';
      flyout.processingFunction = getProcessingFunction(channelName, isInFavourites ? 'remove' : 'add');

      flyout.style.left = `${event.clientX}px`;
      flyout.style.top = `${event.clientY}px`;

      flyout.style.display = 'block';
    });
  });
})();
