export function liveKitHttpUrl(url: string) {
  return url.replace(/^wss:/i, 'https:').replace(/^ws:/i, 'http:');
}

export function liveKitClientUrl(url: string) {
  if (/^wss?:/i.test(url)) return url;
  return url.replace(/^https:/i, 'wss:').replace(/^http:/i, 'ws:');
}
