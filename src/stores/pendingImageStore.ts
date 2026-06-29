let _uri: string | null = null;
let _base64: string | null = null;

export const pendingImageStore = {
  set(uri: string, base64: string) {
    _uri = uri;
    _base64 = base64;
  },
  getUri() { return _uri; },
  getBase64() { return _base64; },
  clear() { _uri = null; _base64 = null; },
};
