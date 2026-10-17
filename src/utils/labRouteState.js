import { useEffect, useRef } from "react";

export function labScreenIndex(location, ids) {
  const hashQuery = (location.hash || "").split("?")[1] || "";
  const requested =
    new URLSearchParams(location.search || "").get("screen") ||
    new URLSearchParams(hashQuery).get("screen");
  const index = ids.indexOf(requested);
  return index < 0 ? 0 : index;
}
export function pushLabScreen(url) {
  if (url.href === window.location.href) return;
  window.history.pushState({}, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
// Restore the active panel without resetting the experiment's other state.
export function useLabRouteSync(ids, setValue, indexed = true) {
  const state = useRef({ ids, setValue, indexed });
  state.current = { ids, setValue, indexed };
  useEffect(() => {
    const restore = () => {
      const { ids, setValue, indexed } = state.current;
      const index = labScreenIndex(window.location, ids);
      setValue(indexed ? index : ids[index]);
    };
    restore();
    window.addEventListener("popstate", restore);
    window.addEventListener("hashchange", restore);
    return () => {
      window.removeEventListener("popstate", restore);
      window.removeEventListener("hashchange", restore);
    };
  }, []);
}
