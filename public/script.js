const searchFormEl = document.querySelector('#search-form');
const searchInputEl = document.querySelector('#search-input');

const loaderE1 = document.querySelector('#loader');
const errorContainerEl = document.querySelector('#error-container');

const historyContainerEl = document.querySelector('#history-container');





const cityNameEl = document.querySelector('#city-name-date');
const temperatureEl = document.querySelector('#temperature');
const humidityEl = document.querySelector('#humidity');
const windSpeedEl = document.querySelector('#wind-speed');
const forecastContainerEl = document.querySelector('#forecast-container');

function renderHistory(){
    const history = JSON.parse(localStorage.getItem('weatherHistory') || '[]');
    historyContainerEl.innerHTML = '';
    for (const city of history) {
    const historyBtn = document.createElement('button');
    historyBtn.textContent = city;
    historyBtn.classList.add('history-btn');
    historyBtn.setAttribute('data-city', city);
    historyContainerEl.append(historyBtn);
    }
}
function displayCurrentWeather(data){
    const currentDate = new Date().toLocaleDateString();
    cityNameEl.textContent= `${data.name}(${currentDate})`;
    temperatureEl.textContent= `Temp: ${Math.round(data.main.temp)} °C`;
    humidityEl.textContent = `Humidity: ${data.main.humidity}%`;
     windSpeedEl.textContent = `Wind Speed: ${data.wind.speed} km/h`;
}

function displayForecast(forecastList){
    forecastContainerEl.innerHTML = '';
    for(let i=0;i< forecastList.length;i+=8){
        const dailyForecast = forecastList[i];
        const card = document.createElement('div');
        card.classList.add('forecast-card');
        const date = new Date(dailyForecast.dt_txt);
    const dateEl = document.createElement('h3');
    dateEl.textContent = date.toLocaleDateString();
        const iconCode = dailyForecast.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    const iconEl = document.createElement('img');
    iconEl.setAttribute('src', iconUrl);
    iconEl.setAttribute('alt', dailyForecast.weather[0].description);
    const tempEl = document.createElement('p');
    tempEl.textContent = `Temp: ${Math.round(dailyForecast.main.temp)} °C`;
     const humidityEl = document.createElement('p');
    humidityEl.textContent = `Humidity: ${dailyForecast.main.humidity}%`;   
    card.append(dateEl, iconEl, tempEl, humidityEl);
    forecastContainerEl.append(card);
    }
}
/**
 * @param {string} city
 */
function saveCityToHistory(city) {
     const historyString = localStorage.getItem('weatherHistory') || '[]';
     let history = JSON.parse(historyString);
     history = history.filter(existingCity => existingCity.toLowerCase() !== city.toLowerCase());
     history.unshift(city);
     if (history.length > 10) {
    history = history.slice(0, 10);
  }
  localStorage.setItem('weatherHistory', JSON.stringify(history));
  renderHistory();
}
async function fetchWeather(city) {
    try{
        errorContainerEl.classList.add('hidden');
    forecastContainerEl.innerHTML = '';
        loaderE1.classList.remove('hidden');
    const response = await fetch(`/api/weather/${city}`);
    if(!response.ok){
         const errorData = await response.json();
      throw new Error(errorData.error || 'An unknown error occurred.');
    }
     const {currentWeather ,forecast} = await response.json();
    
     displayCurrentWeather(currentWeather);
     displayForecast(forecast.list);
     saveCityToHistory(currentWeather.name);
    }
    catch(error){
        console.error('Frontend Fetch Error:',error);
        errorContainerEl.textContent = error.message;
        errorContainerEl.classList.remove('hidden');
    }finally{
        loaderE1.classList.add('hidden');
    }

}

/**
 * @param {number} lat 
 * @param {number} lon
 */
async function fetchWeatherByCoords(lat,lon) {
    try{
        errorContainerEl.classList.add('hidden');
         forecastContainerEl.innerHTML = '';
         loaderE1.classList.remove('hidden');
         const response = await fetch(`/api/weather/coords?lat=${lat}&lon=${lon}`); 
                if (!response.ok) {
                    const errorData = await response.json();
      throw new Error(errorData.error || 'An unknown error occurred.');
    }
            const {currentWeather, forecast} = await response.json();
            displayCurrentWeather(currentWeather);
            displayForecast(forecast.list);
            saveCityToHistory(currentWeather.name);
    }
    catch(error){
        console.error('Frontend Coords Fetch Error:', error);
        errorContainerEl.textContent = 'Could not fetch weather for your location. ' + error.message ;
        errorContainerEl.classList.remove('hidden');
    }
    finally{
        loaderE1.classList.add('hidden');
    }
}

searchFormEl.addEventListener('submit', (event) =>{
    event.preventDefault();
    const city = searchInputEl.value.trim();
    if(city){
      fetchWeather(city);  
      searchInputEl.value='';
    }
});

historyContainerEl.addEventListener('click', (event) => {
    if (event.target.matches('.history-btn')) {
        const city = event.target.dataset.city;
        fetchWeather(city);
    }
});
renderHistory();

if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition((position)=>{
        const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      fetchWeatherByCoords(latitude, longitude);
    },
(error)=>{
    console.error('Error getting user location:', error.message);
});
}else{
    console.log('Geolocation is not available on this browser.');
}