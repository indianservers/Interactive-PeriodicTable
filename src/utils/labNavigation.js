export function completeLab(onNavigate) {
  if (onNavigate) onNavigate("virtual-labs");
  else {
    const url = new URL(location.href);
    url.searchParams.delete("screen");
    url.hash = "/virtual-labs";
    location.assign(url.href);
  }
}
