import { Tab, Tabs } from "@blueprintjs/core";
import { useLocation, useNavigate } from "react-router-dom";
import "./LocationBar.css";

interface LocationBarProps {
  disabledRoutes: string[];
}

export default function LocationBar(props: React.PropsWithChildren<LocationBarProps>) {
  const location = useLocation();
  const navigate = useNavigate();
  const { disabledRoutes, children } = props;

  const LOCATIONS = [
    ["/splash", lang.tabHome, false],
    ["/debug", lang.tabDebug, false],
    ["/list", lang.tabList, false],
    ["/dir", lang.tabDir, true],
  ] as [string, string, boolean][];

  return (
    <>
      <div id="location" className="top-bar">
        <Tabs large selectedTabId={location.pathname} onChange={(newTab) => navigate(newTab as string)}>
          {LOCATIONS.filter(([link]) => link === location.pathname || !disabledRoutes.includes(link)).map(
            ([link, name, ephemeral]) => {
              return (
                <Tab
                  key={link}
                  title={<a>{name}</a>}
                  id={link}
                  className={`option${ephemeral ? " ephemeral" : ""}`}
                ></Tab>
              );
            }
          )}
        </Tabs>
      </div>
      <div id="content" data-route={location.pathname} key={location.pathname}>
        {children}
      </div>
    </>
  );
}
