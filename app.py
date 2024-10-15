from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

TOMORROW_IO_API_KEY = os.getenv('TOMORROW_IO_API_KEY')
IPINFO_TOKEN = os.getenv('IPINFO_TOKEN')

@app.route('/')
def index():
    return render_template('weather.html')

def get_geolocation():
    url = f"https://ipinfo.io/json?token={IPINFO_TOKEN}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return f"{data['city']},{data['region']},{data['country']}"
    
    return None
def geocode_address(address):
    return address

def fetch_weather_data(location):
    url = "https://api.tomorrow.io/v4/timelines"
    params = {
        "location": location,
        "apikey": TOMORROW_IO_API_KEY,
        # Use ChatGPT to organize the param fields; lines 36 - 44; total lines: 9; prompt "Generate a weather data API request that includes the following fields: 
        # temperature, apparent temperature, minimum and maximum temperature, wind speed and direction, humidity, sea level pressure, UV index, weather code,
        #  precipitation probability and type, sunrise and sunset times, visibility, moon phase, and cloud cover. 
        # The request should fetch data at hourly ('1h') and daily ('1d') intervals, use imperial units, and align with the 'America/Los_Angeles' timezone":
        "fields": [
            "temperature", "temperatureApparent", "temperatureMin", "temperatureMax",
            "windSpeed", "windDirection", "humidity", "pressureSeaLevel", "uvIndex",
            "weatherCode", "precipitationProbability", "precipitationType",
            "sunriseTime", "sunsetTime", "visibility", "moonPhase", "cloudCover"
        ],
        "timesteps": ["1h", "1d"],
        "units": "imperial",
        "timezone": "America/Los_Angeles"
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    
@app.route('/get_weather')
def get_weather():
    use_geolocation = request.args.get('use_geolocation', 'false').lower() == 'true'
    if use_geolocation:
        location = get_geolocation()
        if location:
            city, state, country = location.split(',')
            weather_data = fetch_weather_data(location)
            if weather_data:
                 #Used medium.com to figure out how to use jsonfiy errors; lines: 60- 66link https://medium.com/@sujathamudadla1213/jsonify-method-in-flask-ecfa5e483c29;
                return jsonify({
                    'weather': weather_data,
                    'location': {
                        'city': city,
                        'state': state,
                        'country': country
                    }
                })
    else:
        address = request.args.get('address')
        if address:
            weather_data = fetch_weather_data(address)
            if weather_data:
                return jsonify({'weather': weather_data})
    return jsonify({'error'}), 400
if __name__ == '__main__':
    app.run(debug=True)