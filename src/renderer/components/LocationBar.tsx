import { Tab, Tabs } from "@blueprintjs/core";
import { useLocation, useNavigate } from "react-router-dom";
import "./LocationBar.css";

export default function LocationBar(props: React.PropsWithChildren) {
  const location = useLocation();
  const navigate = useNavigate();
  const { children } = props;

  const LOCATIONS = [
    ["/splash", lang.tabHome],
    ["/test", lang.tabTest],
    ["/list", lang.tabList],
    ["/dir", lang.tabDir],
  ] as [string, string][];

  return (
    <>
      <div id="location" className="top-bar">
        <Tabs large selectedTabId={location.pathname} onChange={(newTab) => navigate(newTab as string)}>
          {LOCATIONS.map(([link, name]) => {
            return <Tab key={link} title={<a>{name}</a>} id={link} className="option"></Tab>;
          })}
        </Tabs>
      </div>
      <div id="content" data-route={location.pathname}>
        {children}
      </div>
    </>
  );
}
