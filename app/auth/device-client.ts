const DEVICE_STORAGE_KEY = "zhichang_device_id";

export function getDeviceKey() {
  let key = localStorage.getItem(DEVICE_STORAGE_KEY);
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem(DEVICE_STORAGE_KEY, key);
  }
  return key;
}
