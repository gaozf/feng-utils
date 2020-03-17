function getStoreUtil(key) {
  const storage = key === 'session' ? window.sessionStorage : window.localStorage;

  const storageUtil = {
    set(key, data) {
      if (data !== null && typeof data === 'object') {
        data = JSON.stringify(data);
      }
      storage.setItem(key, data);
    },
    get(key) {
      let val = storage.getItem(key);
      if (val === null || val === 'null') {
        return null;
      } else if (val === 'undefined') {
        return undefined;
      } else {
        try {
          return JSON.parse(val)
        } catch (error) {
          console.log('parse error:', error);
          return val;
        }
      }
    },
    remove(key) {
      if (key instanceof Array) {
        for (let k of key) {
          storage.removeItem(k);
        }
      } else {
        storage.removeItem(key);
      }
    }
  }

  return storageUtil;
}

const sessionStore = getStoreUtil('session');
const localStore = getStoreUtil('local'); 

console.log(sessionStore, localStore);

export { sessionStore, localStore }