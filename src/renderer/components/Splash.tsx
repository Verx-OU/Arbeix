import { Button, H1 } from "@blueprintjs/core";
import { Link } from "react-router-dom";
import "./Splash.css";

export default function Splash() {
  return (
    <div>
      <div id="splash">
        <div>
          <H1 className="title">Arbeix</H1>
        </div>
        <div className="right-panel">
          <Link to="/manage/products">
            <Button large text={lang.manageProducts} intent="success" icon="box" />
          </Link>
        </div>
      </div>
    </div>
  );
}
