declare module 'virtual:pwa-register' {
  export function registerSW(opciones?: { immediate?: boolean; onNeedRefresh?: () => void; onOfflineReady?: () => void }): (recargar?: boolean) => Promise<void>;
}
