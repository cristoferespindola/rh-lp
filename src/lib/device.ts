export function isMobileDevice() {
  const userAgent =
    navigator.userAgent ||
    navigator.vendor ||
    (window as Window & { opera?: string }).opera ||
    "";
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    userAgent.toLowerCase()
  );
}

export function isLandscape() {
  return window.innerWidth > window.innerHeight;
}

export function isiOSDevice() {
  return (
    typeof navigator !== "undefined" &&
    /iP(hone|od|ad)/.test(navigator.userAgent)
  );
}