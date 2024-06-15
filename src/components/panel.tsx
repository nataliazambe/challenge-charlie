import React from "react";
import {
    convertTemperature,
    getColorForTemperature,
    roundToInteger,
} from "../utils/other";
interface PanelData {
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

interface PanelProps {
    data: PanelData | null;
    onLocalizationChange: (newLocalization: string) => void;
}

export function Panel(props: PanelProps) {
    const { data, onLocalizationChange } = props;

    const [isCelsius, setIsCelsius] = React.useState(true);
    const [localization, setlocalization] = React.useState(
        data ? data.localization : ""
    );
    React.useEffect(() => {
        setlocalization(data ? data.localization : "");
    }, [data?.localization]);

    const toggleTemperature = () => {
        setIsCelsius(!isCelsius);
    };

    const convertedTempToday = data
        ? convertTemperature(data.temp, isCelsius)
        : 0;
    const convertedTempTomorrow = data
        ? convertTemperature(data.tomorrowTemp, isCelsius)
        : 0;
    const convertedTempAfterTomorrow = data
        ? convertTemperature(data.theDayAfterTomorrowTemp, isCelsius)
        : 0;

    const todayColor = data ? getColorForTemperature(data.temp, 0.7) : "grey";
    const tomorrowColor = data
        ? getColorForTemperature(data.tomorrowTemp, 0.85)
        : "grey";
    const dayAfterTomorrowColor = data
        ? getColorForTemperature(data.theDayAfterTomorrowTemp, 0.85)
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
