export interface WeatherForecast {
    date: Date;
    status: string;
    tempToday: number;
    wind: number;
    humidity: number;
    pressure: number;
    icon: string;
}

export function getLatLong(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

export async function getOpenCageApi(
    lat: number,
    long: number
): Promise<string> {
    try {
        const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${lat},${long}&key=03258f98963441abb58b89a02c8bf237`
        );
        const data = await response.json();
        let city = data.results[0].components.city;
        let countryCode = data.results[0].components.country_code;
        let local = city + "," + countryCode;
        return local;
    } catch (error) {
        console.error("Erro ao obter dados do OpenCage:", error);
        throw error;
    }
}

export async function getOpenWeatherToday(
    local: string
): Promise<WeatherForecast> {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${local}&APPID=d3682fc83138e0d4f4d3bb7f1f04f247&units=metric`
        );
        const data = await response.json();

        let timeStamp = data.dt;
        const date = new Date(timeStamp * 1000);

        let status = data.weather[0].description;
        let tempToday = data.main.temp;
        let wind = data.wind.speed;
        let humidity = data.main.humidity;
        let pressure = data.main.pressure;

        const strategy: Record<string, [string, string]> = {
            "clear sky": ["Céu limpo", "B"],
            "few clouds": ["Poucas nuvens", "H"],
            "scattered clouds": ["Nuvens dispersas", "N"],
            "broken clouds": ["Parcialmente nublado", "Y"],
            "shower rain": ["Pancadas de chuva", "R"],
            rain: ["Chuva", "Q"],
            thunderstorm: ["Trovoada", "0"],
            snow: ["Neve", "#"],
            mist: ["Névoa", "S"],
        };

        let [translatedStatus, icon] = strategy[status] ?? [
            "Status desconhecido",
            "?",
        ];

        let todaysForecast: WeatherForecast = {
            date,
            status: translatedStatus,
            icon,
            tempToday,
            wind,
            humidity,
            pressure,
        };

        return todaysForecast;
    } catch (error) {
        console.error("Erro ao obter dados do OpenWeather:", error);
        throw error;
    }
}

export async function getOpenWeatherTomorrow(
    local: string,
    tomorrowsDate: Date
): Promise<number> {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${local}&appid=d3682fc83138e0d4f4d3bb7f1f04f247&units=metric`
        );
        const data = await response.json();

        let forecasts = data.list;
        let tomorrowsForecast = [];
        for (let i = 0; i < forecasts.length; i++) {
            let forecastDate = new Date(forecasts[i].dt_txt);
            if (forecastDate.getDate() == tomorrowsDate.getDate()) {
                tomorrowsForecast.push(forecasts[i]);
            }
        }

        //Previsao no horario da menor diferenca
        let dif = 0;
        let smallestDif = 1000;
        let closestForecast = null;

        for (let i = 0; i < tomorrowsForecast.length; i++) {
            let forecastHour = new Date(tomorrowsForecast[i].dt_txt);
            dif = Math.abs(tomorrowsDate.getHours() - forecastHour.getHours());
            if (dif < smallestDif) {
                smallestDif = dif;
                closestForecast = tomorrowsForecast[i];
            }
        }
        return closestForecast.main.temp;
    } catch (error) {
        console.error("Erro ao obter dados do OpenWeather:", error);
        throw error;
    }
}
