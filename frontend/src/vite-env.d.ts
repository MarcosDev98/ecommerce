/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Agrega aquí otras variables que tengas en tu .env
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}