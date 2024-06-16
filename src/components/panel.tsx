import React from "react";
import { FaEye } from "react-icons/fa";
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
    const [isHighContrast, setIsHighContrast] = React.useState(false);

    React.useEffect(() => {
        setlocalization(data ? data.localization : "");
    }, [data?.localization]);

    const toggleTemperature = () => {
        setIsCelsius(!isCelsius);
    };

    const toggleHighContrast = () => {
        document.body.classList.toggle("high-contrast");
        setIsHighContrast(!isHighContrast);
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

    function getColor(temp: number, opacity: number, shift: number): string {
        if (isHighContrast) {
            return "black";
        } else if (data) {
            let color = getColorForTemperature(data.temp);
            color.r -= shift;
            color.g -= shift;
            color.b -= shift;
            return `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
        } else {
            return "grey";
        }
    }

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
                <a className="icone-local" data-icon="("></a>
                <input
                    className="input-local"
                    style={
                        isHighContrast
                            ? { backgroundColor: "black", color: "white" }
                            : undefined
                    }
                    type="text"
                    value={localization}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    placeholder="Digite a localização"
                />
                <div onClick={toggleHighContrast} className="contrast-button">
                    <FaEye />
                </div>
            </div>
            <div
                className="main"
                style={{
                    backgroundColor: getColor(convertedTempToday, 0.7, 0),
                }}
            >
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
            <div
                className="content"
                style={{
                    backgroundColor: getColor(convertedTempTomorrow, 0.85, 0),
                }}
            >
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
                className="content"
                style={{
                    backgroundColor: getColor(
                        convertedTempAfterTomorrow,
                        0.85,
                        20
                    ),
                }}
            >
                <div className="info">
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
