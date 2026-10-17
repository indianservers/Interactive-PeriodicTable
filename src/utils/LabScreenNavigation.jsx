import { pushLabScreen } from "./labRouteState.js";
import "./labScreenNavigation.css";
export default function LabScreenNavigation({ ids, active }) {
  return (
    <details className="lab-screen-menu">
      <summary>
        Lab screens{" "}
        <b>
          {active + 1} / {ids.length}
        </b>
      </summary>
      <nav aria-label="Lab screens">
        {ids.map((id, index) => {
          const url = new URL(window.location.href);
          url.searchParams.set("screen", id);
          return (
            <a
              key={id}
              href={url.href}
              aria-current={active === index ? "page" : undefined}
              onClick={(e) => {
                if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
                e.preventDefault();
                pushLabScreen(url);
                e.currentTarget.closest("details").open = false;
                window.scrollTo(0, 0);
              }}
            >
              <b>{index + 1}</b>
              <span>{id.replaceAll("-", " ")}</span>
            </a>
          );
        })}
      </nav>
    </details>
  );
}
