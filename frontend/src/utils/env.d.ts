/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  // adicione outras variáveis VITE_ aqui se quiser
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
