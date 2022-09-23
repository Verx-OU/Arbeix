import { useEffect, useState } from "react";
import { MemoryRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import Directory from "./components/Directory";
import { DEFAULT_LOCALE } from "./locale";
import LocationBar from "./components/LocationBar";
import Splash from "./components/Splash";
import { maybeParseJSON, useSerialState } from "./serial";
import { DatasetProduct, ProductTree } from "types/products";
import Listing from "./components/Listing";
import Debug from "./components/Debug";

const LISTING_KEY = "app.listing";
const SELECTING_PRODUCT_KEY = "app.selectingproduct";

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
  const [selectingProduct, setSelectingProduct] = useSerialState(SELECTING_PRODUCT_KEY, false);
  const disabledRoutes = [];
  if (!selectingProduct) disabledRoutes.push("/dir");

  useEffect(() => {
    const checkUserData = () => setProducts(maybeParseJSON(sessionStorage.getItem("products")));
    window.addEventListener("set-products", checkUserData);
    return () => window.removeEventListener("set-products", checkUserData);
  }, []);

  return (
    <LocationBar disabledRoutes={disabledRoutes}>
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
        <Route
          path="list"
          element={
            <Listing
              listing={listing}
              goSelectProduct={() => {
                setSelectingProduct(true);
                navigate("dir");
              }}
            />
          }
        />
        <Route
          path="dir"
          element={
            <Directory
              products={products}
              addToListing={(product) => {
                setSelectingProduct(false);
                setListing((list) => [...list, product]);
                navigate("list");
              }}
            />
          }
        />
        <Route
          path="manage/products"
          element={
            <Directory
              products={products}
              addToListing={(product) => {
                setSelectingProduct(false);
                navigate("splash");
              }}
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
