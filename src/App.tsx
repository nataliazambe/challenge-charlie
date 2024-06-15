import React from "react";
import "./App.css";

interface PanelProps {
    localization: string;
    status: string;
    temp: number;
    wind: number;
    humidity: number;
    pressure: number;
    tomorrowTemp: number;
    theDayAfterTomorrowTemp: number;
    icon: string;
}

interface MyComponentProps {
    data: PanelProps | null;
    onLocalizationChange: (newLocalization: string) => void;
}

interface WeatherForecast {
    date: Date;
    status: string;
    tempToday: number;
    wind: number;
    humidity: number;
    pressure: number;
    icon: string;
}

interface Infos {
    todaysForecast: WeatherForecast;
    tomorrowsDate: Date;
    tomorrowsTemp: number;
    theDayAfterTomorrowDate: Date;
    theDayAfterTomorrowTemp: number;
}

function Panel(props: MyComponentProps) {
    const { data, onLocalizationChange } = props;

    const [isCelsius, setIsCelsius] = React.useState(true);
    const [localization, setlocalization] = React.useState(
        data ? data.localization : ""
    );
    React.useEffect(() => {
        setlocalization(data ? data.localization : "");
    }, [data?.localization]);

    const convertTemperature = (temp: number): number => {
        return isCelsius ? temp : (temp * 9) / 5 + 32;
    };

    const toggleTemperature = () => {
        setIsCelsius(!isCelsius);
    };

    const convertedTempToday = data ? convertTemperature(data.temp) : 0;
    const convertedTempTomorrow = data
        ? convertTemperature(data.tomorrowTemp)
        : 0;
    const convertedTempAfterTomorrow = data
        ? convertTemperature(data.theDayAfterTomorrowTemp)
        : 0;

    const todayColor = data ? getColorForTemperature(data.temp) : "grey";
    const tomorrowColor = data
        ? getColorForTemperature(data.tomorrowTemp)
        : "grey";
    const dayAfterTomorrowColor = data
        ? getColorForTemperature(data.theDayAfterTomorrowTemp)
        : "grey";

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setlocalization(event.target.value);
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            onLocalizationChange(localization);
        }
    };
    return (
        <div className="container">
            <div className="header">
                <div className="local">
                    <a className="icone-local" data-icon="("></a>

                    <input
                        type="text"
                        value={localization}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyPress}
                        placeholder="Digite a localização"
                    />
                </div>
            </div>
            <div className="main" style={{ backgroundColor: todayColor }}>
                <div className="img">
                    <a
                        className="icone-tempo"
                        data-icon={data ? data.icon : ""}
                    ></a>
                </div>

                <div className="text">
                    <div className="start">
                        <span>HOJE</span>
                        <span
                            onClick={toggleTemperature}
                            style={{ cursor: "pointer" }}
                        >
                            {data
                                ? `${roundToInteger(convertedTempToday)}°${
                                      isCelsius ? "C" : "F"
                                  }`
                                : "--°C"}
                        </span>
                    </div>
                    <div className="middle">
                        <span>{data ? data.status : "--"}</span>
                    </div>
                    <div className="end">
                        <span>
                            Vento: {data ? `NO ${data.wind}km/h` : "--km/h"}
                        </span>
                        <span>
                            Umidade: {data ? `${data.humidity}%` : "--%"}
                        </span>
                        <span>
                            Pressão: {data ? `${data.pressure}hPA` : "--hPA"}
                        </span>
                    </div>
                </div>
            </div>
            <div className="content" style={{ backgroundColor: tomorrowColor }}>
                <div className="info">
                    <span>AMANHÃ</span>
                    <span
                        onClick={toggleTemperature}
                        style={{ cursor: "pointer" }}
                    >
                        {data
                            ? `${roundToInteger(convertedTempTomorrow)}°${
                                  isCelsius ? "C" : "F"
                              }`
                            : "--°C"}
                    </span>
                </div>
            </div>
            <div
                className="content2"
                style={{ backgroundColor: dayAfterTomorrowColor }}
            >
                <div className="footer">
                    <span>DEPOIS DE AMANHÃ</span>
                    <span
                        onClick={toggleTemperature}
                        style={{ cursor: "pointer" }}
                    >
                        {data
                            ? `${roundToInteger(convertedTempAfterTomorrow)}°${
                                  isCelsius ? "C" : "F"
                              }`
                            : "--°C"}
                    </span>
                </div>
            </div>
        </div>
    );
}

async function getBingApi(): Promise<string> {
    try {
        const response = await fetch(
            "https://corsproxy.io/?https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=pt-BR"
        );
        const data = await response.json();
        let imageUrl = data.images[0].url;
        const fullUrl = `https://www.bing.com${imageUrl}`;
        return fullUrl;
    } catch (error) {
        console.error("Erro ao obter dados da API do Bing:", error);
        throw error;
    }
}

function getLatLong(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

async function getOpenCageApi(lat: number, long: number): Promise<string> {
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

async function getOpenWeatherToday(local: string): Promise<WeatherForecast> {
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

function increaseDay(todaysDate: Date): Promise<Date> {
    return new Promise((resolve) => {
        let tomorrowsDate = new Date(todaysDate.getTime());

        tomorrowsDate.setDate(tomorrowsDate.getDate() + 1);

        resolve(tomorrowsDate);
    });
}

async function getOpenWeatherTomorrow(
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

const getColorForTemperature = (temp: number): string => {
    if (temp <= 15) {
        return "rgba(0, 0, 255,0.85)"; // Azul para temperaturas frias
    } else if (temp > 15 && temp <= 20) {
        return "rgba(255,238,88,0.85)"; // Amarelo escuro para temperaturas amenas
    } else if (temp > 20 && temp <= 25) {
        return "rgba(255,193,7,0.85)"; // Amarelo médio para temperaturas médias
    } else if (temp > 25 && temp <= 30) {
        return "rgba(255,202,40,0.9)"; // Amarelo claro para temperaturas quentes
    } else if (temp > 30 && temp <= 35) {
        return "rgba(255,152,0,0.9)"; // Laranja para temperaturas muito quentes
    } else {
        return "rgba(244,67,54,0.8)"; // Vermelho para temperaturas extremamente quentes
    }
};

function roundToInteger(value: number): number {
    return Math.round(value);
}

function App() {
    const [info, setInfo] = React.useState<Infos | null>(null);
    const [local, setLocal] = React.useState<string>("");
    const [bingImage, setBingImage] = React.useState<string>("");

    const handleLocalizationChange = (newLocalization: string) => {
        setLocal(newLocalization);
    };
    React.useEffect(() => {
        async function init() {
            let backgroundUrl = await getBingApi();
            setBingImage(backgroundUrl);

            const latLong = await getLatLong();
            const lat = latLong.coords.latitude;
            const long = latLong.coords.longitude;

            const localization = await getOpenCageApi(lat, long);
            setLocal(localization);
        }
        init();
    }, []);
    React.useEffect(() => {
        async function fetchData() {
            try {
                if (local == "") {
                    throw new Error("Localização não informada!");
                }
                const todaysForecast = await getOpenWeatherToday(local);
                if (todaysForecast.icon == "?") {
                    throw new Error("Localização inválida!");
                }
                const tomorrowsDate = await increaseDay(todaysForecast.date);
                const tomorrowsTemp = await getOpenWeatherTomorrow(
                    local,
                    tomorrowsDate
                );

                const theDayAfterTomorrowDate = await increaseDay(
                    tomorrowsDate
                );
                const theDayAfterTomorrowTemp = await getOpenWeatherTomorrow(
                    local,
                    theDayAfterTomorrowDate
                );
                setInfo({
                    todaysForecast,
                    tomorrowsDate,
                    tomorrowsTemp,
                    theDayAfterTomorrowDate,
                    theDayAfterTomorrowTemp,
                });
            } catch (error) {
                setInfo(null);
                console.error("Erro ao obter localização:", error);
            }
        }

        fetchData();
    }, [local]);
    return (
        <div className="App" style={{ background: `url(${bingImage})` }}>
            <Panel
                data={
                    info
                        ? {
                              localization: local,
                              status: info.todaysForecast.status,
                              icon: info.todaysForecast.icon,
                              temp: info.todaysForecast.tempToday,
                              wind: info.todaysForecast.wind,
                              humidity: info.todaysForecast.humidity,
                              pressure: info.todaysForecast.pressure,
                              tomorrowTemp: info.tomorrowsTemp,
                              theDayAfterTomorrowTemp:
                                  info.theDayAfterTomorrowTemp,
                          }
                        : null
                }
                onLocalizationChange={handleLocalizationChange}
            />
        </div>
    );
}

export default App;
