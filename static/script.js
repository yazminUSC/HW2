document.addEventListener('DOMContentLoaded', function() {
    const resultsDiv = document.getElementById('daily-results');
    const form = document.getElementById('weatherForm');
    const streetInput = document.getElementById('street');
    const cityInput = document.getElementById('city');
    const stateInput = document.getElementById('state');
    const useGeolocationCheckbox = document.getElementById('useGeolocation');
    const clearButton = document.getElementById('clearButton');
    useGeolocationCheckbox.checked = false;
    streetInput.disabled = false; 
    cityInput.disabled = false;
    stateInput.disabled = false;

    useGeolocationCheckbox.addEventListener('change', function() {
        const isChecked = this.checked;
        streetInput.disabled = isChecked;
        cityInput.disabled = isChecked;
        stateInput.disabled = isChecked;
        if (isChecked) {
            streetInput.value = '';
            cityInput.value = '';
            stateInput.value = '';
            hideAllErrors();
        }
    });
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        hideAllErrors();

        if (useGeolocationCheckbox.checked) {
            fetchWeatherUsingGeolocation();
        } else {
            if (validateForm()) {
                fetchWeatherUsingAddress();
            }
        }
    });

    clearButton.addEventListener('click', function() {
        // Line: 41 Work cited: https://www.w3schools.com/jsref/met_form_reset.asp
        form.reset();
        hideAllErrors();
        resultsDiv.innerHTML = '';
        streetInput.disabled = false;
        cityInput.disabled = false;
        stateInput.disabled = false;
    });
    function validateForm() {
        let isValid = true;
        if (!streetInput.value.trim()) {
            showError('street', 'Street is required');
            isValid = false;
        }
        if (!cityInput.value.trim()) {
            showError('city', 'City is required');
            isValid = false;
        }
        if (!stateInput.value.trim()) {
            showError('state', 'State is required');
            isValid = false;
        }
        return isValid;
    }
    function showError(fieldId, message) {
        const errorSpan = document.getElementById(`${fieldId}Error`);
        errorSpan.textContent = message;
        errorSpan.style.display = 'block';
    }
    function hideAllErrors() {
        document.querySelectorAll('.error-message').forEach(span => {
            span.textContent = '';
            span.style.display = 'none';
        });
    }
    
    function getWeatherInfo(code) {
        const weatherInfo = {
            "0": { description: "Unknown", image: "unknown.svg" },
            "1000": { description: "Clear", image: "clear_day.svg" },
            "1100": { description: "Mostly Clear", image: "mostly_clear_day.svg" },
            "1101": { description: "Partly Cloudy", image: "partly_cloudy_day.svg" },
            "1102": { description: "Mostly Cloudy", image: "mostly_cloudy.svg" },
            "1001": { description: "Cloudy", image: "cloudy.svg" },
            "2000": { description: "Fog", image: "fog.svg" },
            "2100": { description: "Light Fog", image: "fog_light.svg" },
            "4000": { description: "Drizzle", image: "drizzle.svg" },
            "4001": { description: "Rain", image: "rain.svg" },
            "4200": { description: "Light Rain", image: "rain_light.svg" },
            "4201": { description: "Heavy Rain", image: "rain_heavy.svg" },
            "5000": { description: "Snow", image: "snow.svg" },
            "5001": { description: "Flurries", image: "flurries.svg" },
            "5100": { description: "Light Snow", image: "snow_light.svg" },
            "5101": { description: "Heavy Snow", image: "snow_heavy.svg" },
            "6000": { description: "Freezing Drizzle", image: "freezing_drizzle.svg" },
            "6001": { description: "Freezing Rain", image: "freezing_rain.svg" },
            "6200": { description: "Light Freezing Rain", image: "freezing_rain_light.svg" },
            "6201": { description: "Heavy Freezing Rain", image: "freezing_rain_heavy.svg" },
            "7000": { description: "Ice Pellets", image: "ice_pellets.svg" },
            "7101": { description: "Heavy Ice Pellets", image: "ice_pellets_heavy.svg" },
            "7102": { description: "Light Ice Pellets", image: "ice_pellets_light.svg" },
            "8000": { description: "Thunderstorm", image: "tstorm.svg" }
        };
        
        return weatherInfo[code] || { description: 'Unknown', image: 'unknown.svg' };
    }

        
    function fetchWeatherUsingGeolocation() {
        fetch('https://ipinfo.io/json?token=5656a30b541d93')
            .then(response => response.json())
            .then(data => {
                const location = `${data.city},${data.region}`;
                fetchWeatherData(location);
            })
            .catch(error => console.error('Error:', error));
    }

    function fetchWeatherUsingAddress() {
        const location = `${streetInput.value},${cityInput.value},${stateInput.value}`;
        fetchWeatherData(location);
    }
    function displayWeatherData(data, city, state) {
        const resultsDiv = document.getElementById('daily-results');
        resultsDiv.innerHTML = '';
        let timelines;
        if (data.weather && data.weather.data && data.weather.data.timelines) {
            timelines = data.weather.data.timelines;
        } else if (data.data && data.data.timelines) {
            timelines = data.data.timelines;
        }
        const hourlyData = timelines.find(timeline => timeline.timestep === '1h');
        const dailyData = timelines.find(timeline => timeline.timestep === '1d');
        const currentWeather = hourlyData.intervals[0].values;
        const weatherInfo = getWeatherInfo(currentWeather.weatherCode);
        

        const cardHtml = `
            <div class="weather-card">
                <div class="weather-card-header">
                    <p class="weather-card-header">${city}, ${state}</p>
                </div>
                <div class="weather-card-body">
                    <div class="weather-card-top-flex">
                        <div class="description">
                            <img src="/static/images/WeatherSymbols/${weatherInfo.image}" alt="${weatherInfo.description}" style="width: 110px;">
                            <p>${weatherInfo.description}</p>
                        </div>
                        <p class="temperature"><span>${currentWeather.temperature}°</span></p>
                    </div>
                    
                    <div class="weather-card-container">
                        <div class="weather-item">
                            <p class="title">Humidity</p>
                            <img src="${humidityIconPath}" class="weather-icon">
                            <p class="value">${currentWeather.humidity}%</p>
                        </div>
                        <div class="weather-item">
                            <p class="title">Pressure</p>
                            <img src="${pressureIconPath}" class="weather-icon">
                            <p class="value">${currentWeather.pressureSeaLevel} inHg</p>
                        </div>
                
                        <div class="weather-item">
                            <p class="title">Wind</p>
                            <img src="${windIconPath}" class="weather-icon">
                            <p class="value">${currentWeather.windSpeed} mph</p>
                        </div>
                        <div class="weather-item">
                            <p class="title">Visibility</p>
                            <img src="${visibilityIconPath}" class="weather-icon">
                            <p class="value">${currentWeather.visibility} miles</p>
                        </div>
                        <div class="weather-item">
                            <p class="title">Cloud Cover</p>
                            <img src="${cloudCoverIconPath}" class="weather-icon">
                            <p class="value">${currentWeather.cloudCover}%</p>
                        </div>
                        <div class="weather-item">
                            <p class="title">UV Index</p>
                            <img src="${uvIndexIconPath}" class="weather-icon">
                            <p class="value">${currentWeather.uvIndex}</p>
                        </div>
                    </div>
        
                </div>
            </div>
        `;
        const tableHtml = `
        <table class="forecast-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Temp High</th>
                    <th>Temp Low</th>
                    <th>Wind Speed</th>
                </tr>
            </thead>
            <tbody>
                ${dailyData.intervals.map((day, index) => {
                    const weatherInfo = getWeatherInfo(day.values.weatherCode);
                    return `
                        <tr class="clickable-row" data-index="${index}">
                            <td>${new Date(day.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'short',  year: 'numeric', day: 'numeric' })}</td>
                            <td>
                                <img src="/static/images/WeatherSymbols/${weatherInfo.image}" alt="${weatherInfo.description}" style="width: 40px; vertical-align: middle;">
                                ${weatherInfo.description}
                            </td>
                            <td>${day.values.temperatureMax}</td>
                            <td>${day.values.temperatureMin}</td>
                            <td>${day.values.windSpeed}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        `;    
        resultsDiv.innerHTML = cardHtml + tableHtml;
        document.querySelectorAll('.clickable-row').forEach(row => {
            row.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                showPopup(dailyData.intervals[index], { data: { timelines } });
            });
        });
    }
    
    function showPopup(dayData, weatherData) {
        const resultsDiv = document.getElementById('daily-results');
        const popupHtml = `
            <div class="details2">Daily Weather Details</div>
                <div class="popup">
                    <div class="flex-container2">
                    <div class="weather-details">
                        <p>${new Date(dayData.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'short', year: 'numeric', day: 'numeric' })}</p>
                        <p>${getWeatherInfo(dayData.values.weatherCode).description}</p>
                        <p>${dayData.values.temperatureMax}°F/${dayData.values.temperatureMin}°F</p>
                    </div>
                    <div class="weather-icon">
                        <img src="/static/images/WeatherSymbols/${getWeatherInfo(dayData.values.weatherCode).image}" style="width: 120px; vertical-align: middle; margin-left: -50px;">
                    </div>
                </div>
                <div class="weather-values" >
                    <p>Precipitation Probability: ${dayData.values.precipitationType}%</p>
                    <p>Chance of rain: ${dayData.values.precipitationProbability}%</p>
                    <p>Wind Speed: ${dayData.values.windSpeed} mph</p>
                    <p>Humidity: ${dayData.values.humidity}%</p>
                    <p>Visibility: ${dayData.values.windSpeed}mi</p>
                    <p>Sunrise/Sunset: ${new Date(dayData.values.sunriseTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })} /
                ${new Date(dayData.values.sunsetTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</p>
                </div>
            </div>
            <div class="details2">Weather Charts</div>
        `;
        const toggleHtml = `
            <div class="chart-toggle">
                <span id="toggle-arrow">▼ </span>
            </div>
        `;
        resultsDiv.innerHTML = popupHtml + toggleHtml;
        const dailyChartContainer = document.createElement('div');
        dailyChartContainer.id = 'daily-chart-container';
        dailyChartContainer.style.display = 'none';
        resultsDiv.appendChild(dailyChartContainer);
    
        const hourlyChartContainer = document.createElement('div');
        hourlyChartContainer.id = 'hourly-chart-container';
        hourlyChartContainer.style.display = 'none';
        resultsDiv.appendChild(hourlyChartContainer);
        const dailyData = weatherData.data.timelines.find(timeline => timeline.timestep === '1d');
        const minTemperatures = [];
        const maxTemperatures = [];
        const categories = [];
        dailyData.intervals.slice(0, 15).forEach(day => {
            categories.push(new Date(day.startTime).toLocaleDateString());
            minTemperatures.push(day.values.temperatureMin);
            maxTemperatures.push(day.values.temperatureMax);
        });
        const hourlyData = weatherData.data.timelines.find(timeline => timeline.timestep === '1h');
        const hourlyTemperatures = [];
        const hourlyHumidity = [];
        const hourlyPressure = [];
        const hourlyWindSpeed = [];
        const hourlyCategories = [];
        hourlyData.intervals.slice(0, 120).forEach(hour => {
            hourlyCategories.push(new Date(hour.startTime).toLocaleString());
            hourlyTemperatures.push(hour.values.temperature);
            hourlyHumidity.push(hour.values.humidity);
            hourlyPressure.push(hour.values.pressureSeaLevel);
            hourlyWindSpeed.push(hour.values.windSpeed);
        });
        document.getElementById('toggle-arrow').addEventListener('click', function() {
            const isExpanded = dailyChartContainer.style.display === 'block';
            //CITE CHATGPT:lines: 296 - 303 & 254-258, total lines: 11, HOW TO MAKE COLLAPSSABLE CHART, Prompt: "I am struggling to make a collpasable chart in JS. I need the code to toggles the visibility of 
            //two chart containers when a button with the ID 'toggle-arrow' is clicked. The charts should be collapsed or expanded based on their current visibility. 
            //If the charts are visible, collapse them and change the arrow to down else show an up arrow"
            if (isExpanded) {
                dailyChartContainer.style.display = 'none';
                hourlyChartContainer.style.display = 'none';
                this.innerHTML = '▼'; 
            } else {
                dailyChartContainer.style.display = 'block';
                hourlyChartContainer.style.display = 'block';
                this.innerHTML = '▲';
                createTemperatureChart(categories, minTemperatures, maxTemperatures);
                createHourlyChart(hourlyCategories, hourlyTemperatures, hourlyHumidity, hourlyPressure, hourlyWindSpeed);
            }
        });
    }
    

    function createTemperatureChart(categories, minTemperatures, maxTemperatures) {
        const temperatureRangeData = categories.map((date, index) => [minTemperatures[index], maxTemperatures[index]]);
    
        Highcharts.chart('daily-chart-container', {
            chart: {
                type: 'arearange',
                zooming: {
                    type: 'x'
                },
                scrollablePlotArea: {
                    minWidth: 600,
                    scrollPositionX: 1
                }
            },
            title: {
                text: 'Temperature Range (Min, Max) by Day'
            },
            xAxis: {
                categories: categories,
                title: {
                    text: 'Date'
                }
            },
            yAxis: {
                title: {
                    text: 'Temperature (°F)'
                }
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: '°F',
                xDateFormat: '%A, %b %e'
            },
            legend: {
                enabled: false
            },
            series: [{
                name: 'Temperature Range',
                data: temperatureRangeData,
                color: {
                    linearGradient: {
                        x1: 0,
                        x2: 0,
                        y1: 0,
                        y2: 1
                    },
                    stops: [
                        [0, '#F3F584'],
                        [1, '#33a1ff']
                    ]
                }
            }]
        });
    }
    
    function createHourlyChart(categories, hourlyTemperatures, hourlyHumidity, hourlyPressure, hourlyWindSpeed) {
        Highcharts.chart('hourly-chart-container', {
            chart: {
                type: 'line'
            },
            title: {
                text: 'Hourly Weather Data (Next 5 Days)'
            },
            xAxis: {
                categories: categories,
                title: {
                    text: 'Time'
                }
            },
            yAxis: {
                title: {
                    text: 'Values'
                }
            },
            series: [{
                name: 'Temperature',
                data: hourlyTemperatures,
                tooltip: {
                    valueSuffix: '°F'
                },
                marker: {
                    enabled: true,
                    radius: 3
                }
            }, {
                name: 'Humidity',
                data: hourlyHumidity,
                tooltip: {
                    valueSuffix: '%'
                },
                marker: {
                    enabled: true,
                    radius: 3
                }
            }, {
                name: 'Air Pressure',
                data: hourlyPressure,
                tooltip: {
                    valueSuffix: 'hPa'
                },
                marker: {
                    enabled: true,
                    radius: 3
                }
            }, {
                name: 'Wind Speed',
                data: hourlyWindSpeed,
                tooltip: {
                    valueSuffix: 'mph'
                },
                marker: {
                    enabled: true,
                    radius: 3
                }
            }],
            tooltip: {
                shared: true
            }
        });
    }    
    
    function fetchWeatherData() {
        const useGeolocation = document.getElementById('useGeolocation').checked;
        let url = '/get_weather?use_geolocation=' + useGeolocation;
        let city, state;
    
        if (!useGeolocation) {
            const street = document.getElementById('street').value;
            city = document.getElementById('city').value;
            state = document.getElementById('state').value;
            const address = encodeURIComponent(`${street},${city},${state}`);
            url += '&address=' + address;
        }
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (useGeolocation) {
                    if (data.location) {
                        city = data.location.city;
                        state = data.location.state;
                    } else {
                        console.error('Geolocation data not found in response');
                    }
                }
                console.log(city); // For debugging
                console.log(state); // For debugging
                displayWeatherData(data.weather, city, state);
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('daily-results').innerHTML = `<p>Error: ${error.message}</p>`;
            });
    }
});