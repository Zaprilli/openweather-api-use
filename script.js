const apiKey = "298b95adcad4e9a5551a6bdc3d62cc7e"; //
const citySelect = document.getElementById('citySelect');
const selectBtn = document.getElementById('selectBtn');
const locationBtn = document.getElementById('locationBtn');
const weatherInfo = document.getElementById('weatherInfo');

// Монголын хотуудын координатууд (нэмэлт/засвар хийх боломжтой)
const cityCoords = {
  "Ulaanbaatar": {lat:47.918873, lon:106.917701},
  "Erdenet": {lat:49.033333, lon:104.094444},
  "Darkhan": {lat:49.4975, lon:105.9247},
  "Choibalsan": {lat:48.0856, lon:114.5283},
  "Mörön": {lat:49.6346, lon:100.1633},
  "Khovd": {lat:48.0170, lon:91.6339},
  "Ulaangom": {lat:49.9762, lon:92.0758},
  "Baruun-Urt": {lat:46.6812, lon:113.2813},
  "Tsetserleg": {lat:47.1511, lon:102.7958},
  "Arvaikheer": {lat:46.2586, lon:102.7888},
  "Sainshand": {lat:46.1829, lon:113.2814},
  "Bayankhongor": {lat:46.0000, lon:100.0000},
  "Zuunmod": {lat:47.7088, lon:106.9740},
  "Altai": {lat:46.3720, lon:95.8536},
  "Selenge": {lat:49.4975, lon:106.2861}
};

// Initialize map (Leaflet)
const map = L.map('map').setView([47.918873, 106.917701], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let marker = null;

// Map дээр click хийхээр тухайн координатаар цаг агаар авах (сонголт боломжтой)
map.on('click', (e) => {
  const lat = e.latlng.lat;
  const lon = e.latlng.lng;
  placeMarker(lat, lon);
  getWeatherByCoords(lat, lon);
});

// Сонгосон хотоор хайх
selectBtn.addEventListener('click', () => {
  const city = citySelect.value;
  if(!city){
    weatherInfo.innerHTML = `<p class="hint">Хот сонгоно уу.</p>`;
    return;
  }
  const c = cityCoords[city];
  if(c){
    map.setView([c.lat, c.lon], 9);
    placeMarker(c.lat, c.lon);
    getWeatherByCoords(c.lat, c.lon);
  } else {
    weatherInfo.innerHTML = `<p class="hint">${city} хотын координат олдсонгүй.</p>`;
  }
});

// Миний байршил
locationBtn.addEventListener('click', () => {
  if(!navigator.geolocation){
    weatherInfo.innerHTML = `<p class="hint">Таны хөтөч геолокацийг дэмжихгүй байна.</p>`;
    return;
  }
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    map.setView([lat, lon], 10);
    placeMarker(lat, lon);
    getWeatherByCoords(lat, lon);
  }, err => {
    weatherInfo.innerHTML = `<p class="hint">📍 Байршил авахад алдаа: ${err.message}</p>`;
  }, {timeout:15000});
});

// Тогтоосон маркер тавих функц
function placeMarker(lat, lon){
  if(marker) map.removeLayer(marker);
  marker = L.marker([lat, lon]).addTo(map);
}

// OpenWeatherMap-аас координатаар мэдээлэл авна
async function getWeatherByCoords(lat, lon){
  weatherInfo.innerHTML = `<p class="hint">Ачаалж байна...</p>`;
  try{
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}&lang=mn`;
    const res = await fetch(url);
    if(!res.ok) throw new Error(`API алдаа: ${res.status}`);
    const data = await res.json();
    displayWeather(data);
  }catch(err){
    console.error(err);
    weatherInfo.innerHTML = `<p class="hint">Цаг агаар авч чадсангүй: ${err.message}</p>`;
  }
}

// Мэйн дэлгэц дээр харуулах
function displayWeather(data){
  const name = data.name || '';
  const country = (data.sys && data.sys.country) ? data.sys.country : 'MN';
  const temp = data.main?.temp;
  const feels = data.main?.feels_like;
  const hum = data.main?.humidity;
  const wind = data.wind?.speed;
  const desc = data.weather?.[0]?.description || '';
  const icon = data.weather?.[0]?.icon;

  // icon URL
  const iconUrl = icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : '';

  weatherInfo.innerHTML = `
    <div style="display:flex;gap:12px;align-items:center">
      <img src="${iconUrl}" alt="${desc}" style="width:72px;height:72px;object-fit:contain;border-radius:8px;background:rgba(255,255,255,0.6)" />
      <div>
        <h2>${name} ${country ? ', ' + country : ''}</h2>
        <p style="margin:4px 0;font-weight:600;font-size:18px">${(temp)}°C (Feels ${Math.round((feels), 1)}°C)</p>
        <p style="margin:4px 0;color:#3a556b">${capitalize(desc)}</p>
      </div>
    </div>
    <div style="margin-top:10px;display:flex;gap:12px;flex-wrap:wrap">
      <div style="background:#fff;border-radius:10px;padding:8px 10px;box-shadow:0 2px 6px rgba(0,0,0,0.04)"><strong>${hum}%</strong><div style="font-size:12px;color:#6b7280">Чийгшил</div></div>
      <div style="background:#fff;border-radius:10px;padding:8px 10px;box-shadow:0 2px 6px rgba(0,0,0,0.04)"><strong>${wind} m/s</strong><div style="font-size:12px;color:#6b7280">Салхи</div></div>
      <div style="background:#fff;border-radius:10px;padding:8px 10px;box-shadow:0 2px 6px rgba(0,0,0,0.04)"><strong>${data.main?.pressure} hPa</strong><div style="font-size:12px;color:#6b7280">Агаарын даралт</div></div>
    </div>
  `;
}

function capitalize(s){
  if(!s) return '';
  return s.split(' ').map(w => w[0]?.toUpperCase()+w.slice(1)).join(' ');
}
