import React from "react";
import "./App.css";
import { getBingApi } from "./utils/bing";
import {
    WeatherForecast,
    getLatLong,
    getOpenCageApi,
    getOpenWeatherToday,
    getOpenWeatherTomorrow,
} from "./utils/forecast";
import { increaseDay } from "./utils/other";
import { Panel } from "./components/panel";

interface Infos {
    todaysForecast: WeatherForecast;
    tomorrowsDate: Date;
    tomorrowsTemp: number;
    theDayAfterTomorrowDate: Date;
    theDayAfterTomorrowTemp: number;
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
                const tomorrowsDate = increaseDay(todaysForecast.date);
                const tomorrowsTemp = await getOpenWeatherTomorrow(
                    local,
                    tomorrowsDate
                );

                const theDayAfterTomorrowDate = increaseDay(tomorrowsDate);
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
