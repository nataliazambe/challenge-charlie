import React from "react";
import logo from "./logo.svg";
import "./App.css";

interface PanelProps {
  localization: string;
  temp1: number;
  temp2: number;
  temp3: number;
  status: string;
  wind: number;
  humidity: number;
  pressure: number;
}

function Panel(props: PanelProps) {
  return (
    <div className="container">
      <div className="header">
        <a className="icone-local" data-icon="("></a>
        <h1 id="rio">{props.localization}</h1>
      </div>
      <div className="main">
        <div className="img">
          <a className="icone-tempo" data-icon="B"></a>
        </div>

        <div className="text">
          <div className="start">
            <span>HOJE</span>
            <span>{props.temp1}°C</span>
          </div>
          <div className="middle">
            <span>{props.status}</span>
          </div>
          <div className="end">
            <span>Vento: NO {props.wind}km/h</span>
            <span>Umidade: {props.humidity}%</span>
            <span>Pressão: {props.pressure}hPA</span>
          </div>
        </div>
      </div>
      <div className="content">
        <div className="info">
          <span>AMANHÃ</span>
          <span>{props.temp2}°C</span>
        </div>
      </div>
      <div className="content2">
        <div className="footer">
          <span>DEPOIS DE AMANHÃ</span>
          <span>{props.temp3}°C</span>
        </div>
      </div>
    </div>
  );
}
function App() {
  return (
    <div className="App">
      <Panel
        localization="Rio de Janeiro, Rio de Janeiro"
        status="Ensolarado"
        temp1={32}
        wind={6.4}
        humidity={78}
        pressure={1003}
        temp2={25}
        temp3={22}
      ></Panel>
    </div>
  );
}

export default App;
