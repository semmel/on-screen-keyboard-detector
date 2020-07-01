const oskd: {
  subscribe: (listener: (visibility: 'hidden' | 'visible') => void | Promise<void>) => (() => void),
  isSupported: () => boolean,
};
export = oskd;
