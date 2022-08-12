//
//////////////////////////////////////////
/// Include DOM Elements in javascript

const formEl = document.querySelector('.form');
const formInput = document.querySelector('.form-input');
const dataDetail = document.querySelectorAll('.data-detail');
const searchBtn = document.querySelector('.btn-search');
const mapEl = document.querySelector('#map');

const getCurrentIPAddress = async function () {
  const res = await fetch('https://api.ipify.org?format=json');
  const data = await res.json();
  const { ip } = data;
  return ip;
};

const timeout = function () {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error('The server took too long to respond'));
    }, 10000);
  });
};

const showMap = function (coords) {
  let map = L.map('map').setView([51.505, -0.09], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  L.marker([51.5, -0.09])
    .addTo(map)
    .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
    .openPopup();
};
// showMap();

const getLocation = async function (ip) {
  try {
    const fetchPro =
      fetch(`https://geo.ipify.org/api/v2/country,city?apiKey=at_YmuMdzCIFhdrUF26k0ezG0DGUFJSK&ipAddress=${ip}
`);
    const res = await Promise.race([fetchPro, timeout()]);
    console.log(res);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
};
const loadMap = function (coords) {
  const map = L.map('map').setView([coords.lat, coords.lng], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  console.log('adding marker');
  L.marker([51.5, -0.09])
    .addTo(map)
    .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
    .openPopup();
};

class App {
  #zoom = 14;
  #map;
  #state;
  #errorMessage = 'Server took too long to respond';
  constructor() {
    this._getCurrentLocation();
    formEl.addEventListener('submit', this._inputIpAddressHandler.bind(this));
    searchBtn.addEventListener('click', this._inputIpAddressHandler.bind(this));
  }
  _getCurrentLocation() {
    (async function () {
      try {
        this._renderSpinner(mapEl);
        Array.from(dataDetail).forEach(el => this._renderSpinner(el));
        const ip = await getCurrentIPAddress();
        const data = await getLocation(ip);
        this.#state = await this._createLocationObject(data);
        this._renderLocation();
        this._renderMap();
      } catch (err) {
        console.error(err);
      }
    }.bind(this)());
  }
  _createLocationObject(data) {
    return {
      ip: data.ip,
      location: {
        city: data.location.city,
        country: data.location.country,
        geonameId: data.location.geonameId,
      },
      timezone: data.location.timezone,
      isp: data.isp,
      coords: { lat: data.location.lat, lng: data.location.lng },
    };
  }
  _renderLocation() {
    const dataArr = Array.from(dataDetail).entries();
    const markups = [
      `<p class="data location">${this.#state.ip}</p>`,
      `<p class="data location">${this.#state.location.city}, ${
        this.#state.location.country
      } \n${this.#state.location.geonameId} </p>`,
      `<p class="data">GMT${this.#state.timezone}</p>`,
      `<p class="data">${this.#state.isp}</p>`,
    ];
    for (let [index, data] of dataArr) {
      data.innerHTML = markups[index];
    }
  }
  _renderMap() {
    if (this.#map) this._clearMap();
    this.#map = L.map('map').setView(
      [this.#state.coords.lat, this.#state.coords.lng],
      this.#zoom
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    L.marker([this.#state.coords.lat, this.#state.coords.lng]).addTo(this.#map);
  }
  _inputIpAddressHandler(e) {
    e.preventDefault();
    const ip = formInput.value;
    console.log(ip);
    if (!ip) return;
    (async function () {
      try {
        const data = await getLocation(ip);
        console.log(data);
        if (data.location.country === 'ZZ')
          throw new Error('Unknown or unspecified country');
        this.#state = await this._createLocationObject(data);
        this._renderLocation();
        this._renderMap();
      } catch (err) {
        console.error(err);
      }
    }.bind(this)());
  }
  _clearMap() {
    this.#map.remove();
    mapEl.innerHTML = '';
  }
  _renderSpinner(el) {
    const markup = `
         <div class="spinner" style="font-size:48px;">
            <i class="fa fa-circle-o-notch fa-spin" style="font-size: 24px"></i>
         </div>`;
    el.insertAdjacentHTML('afterbegin', markup);
  }
}
const app = new App();
