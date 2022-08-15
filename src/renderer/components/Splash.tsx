import { H1 } from "@blueprintjs/core";
import icon from "../../../assets/icon.svg";
import "./Splash.css";

export default function Splash() {
  return (
    <div>
      <div id="splash">
        <img width="200" alt="icon" src={icon} />
        <H1 className="title">Arbeix</H1>
      </div>
    </div>
  );
}
