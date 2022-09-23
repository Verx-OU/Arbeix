import { Button, H1 } from "@blueprintjs/core";
import { Link } from "react-router-dom";
import icon from "../../../assets/icon.svg";
import "./Splash.css";

export default function Splash() {
  return (
    <div>
      <div id="splash">
        <div>
          <img width="200" alt="icon" src={icon} />
          <H1 className="title">Arbeix</H1>
        </div>
        <div>
          <Button>
            <Link to="/manage/products">{lang.manageProducts}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
