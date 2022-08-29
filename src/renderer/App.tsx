import { Button, H1 } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import {
  MemoryRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import Directory from "./components/Directory";
import { DEFAULT_LOCALE } from "./locale";
import LocationBar from "./components/LocationBar";
import Splash from "./components/Splash";
import { maybeParseJSON, useSerialState } from "./serial";
import { DatasetProduct, ProductTree } from "common/products";
import Listing from "./components/Listing";
import Debug from "./components/Debug";

const LISTING_KEY = "app.listing";

const Test = () => (
  <div className="inner-content">
    <H1>Test</H1>
    <Link to="/">
      <Button>{lang.goToHome}</Button>
    </Link>
  </div>
);

const Content = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [lang, setLang] = useState("");

  useEffect(() => {
    const checkUserData = () => setLang(localStorage.getItem("locale") ?? DEFAULT_LOCALE);
    window.addEventListener("set-locale", checkUserData);
    return () => window.removeEventListener("set-locale", checkUserData);
  }, []);
  useEffect(() => navigate(0), [lang, navigate]);
  useEffect(() => localStorage.setItem("lastPage", location.pathname), [location]);

  const [products, setProducts] = useState(maybeParseJSON<ProductTree>(sessionStorage.getItem("products")));
  const [listing, setListing] = useSerialState(LISTING_KEY, [] as DatasetProduct[]);

  useEffect(() => {
    const checkUserData = () => setProducts(maybeParseJSON(sessionStorage.getItem("products")));
    window.addEventListener("set-products", checkUserData);
    return () => window.removeEventListener("set-products", checkUserData);
  }, []);

  return (
    <LocationBar>
      <Routes>
        <Route
          path="/init"
          element={
            <Navigate
              to={(() => {
                const lastPage = localStorage.getItem("lastPage");
                return lastPage === null || lastPage === "/init" ? "/splash" : lastPage;
              })()}
            />
          }
        />
        <Route path="/" element={<Navigate to="/splash" />} />
        <Route path="splash" element={<Splash />} />
        <Route path="test" element={<Test />} />
        <Route path="list" element={<Listing listing={listing} />} />
        <Route
          path="dir"
          element={
            <Directory
              products={products}
              addToListing={(product) => setListing((list) => [...list, product])}
            />
          }
        />
        <Route path="debug" element={<Debug />} />
      </Routes>
    </LocationBar>
  );
};

export default function App() {
  return (
    <Router initialEntries={["/init"]}>
      <Content />
    </Router>
  );
}
