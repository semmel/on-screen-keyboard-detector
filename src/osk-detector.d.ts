export function subscribe(listener: (visibility: 'hidden' | 'visible') => void | Promise<void>): (() => void);
export function isSupported(): boolean;
