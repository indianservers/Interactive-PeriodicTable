import { useEffect, useRef } from "react";

export function labScreenIndex(location, ids) {
  const hash = location.hash || "";
  const queryStart = hash.indexOf("?");
  const hashParams = new URLSearchParams(queryStart < 0 ? "" : hash.slice(queryStart + 1));
  // The active hash route owns its panel. A legacy pathname query must not
  // override an explicit deep link, including an invalid/empty panel fallback.
  const requested = hashParams.has("screen")
    ? hashParams.get("screen")
    : new URLSearchParams(location.search || "").get("screen");
  const index = ids.indexOf(requested);
  return index < 0 ? 0 : index;
}
export function pushLabScreen(url) {
  const next = new URL(url.href);
  // Older labs still write the pathname query. Normalize their navigation to
  // the hash too, so moving tabs replaces a previous hash panel consistently.
  if (next.searchParams.has("screen")) {
    const panel = next.searchParams.get("screen");
    const queryStart = next.hash.indexOf("?");
    const route = queryStart < 0 ? next.hash : next.hash.slice(0, queryStart);
    const params = new URLSearchParams(queryStart < 0 ? "" : next.hash.slice(queryStart + 1));
    params.set("screen", panel);
    next.searchParams.delete("screen");
    next.hash = `${route || "#/"}?${params}`;
  }
  if (next.href === window.location.href) return;
  window.history.pushState({}, "", next);
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
