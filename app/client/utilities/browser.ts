export function isFullscreenSupported(): boolean {
  try {
    return typeof document.body.requestFullscreen === 'function' && document.fullscreenEnabled;
  } catch {
    return false;
  }
}

export function isInFullscreen(): boolean {
  return Boolean(document.fullscreenElement);
}

export function isScreenOrientationSupported(): boolean {
  try {
    return typeof screen.orientation.lock === 'function';
  } catch {
    return false;
  }
}
