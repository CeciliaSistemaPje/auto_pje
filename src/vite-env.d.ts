/// <reference types="vite/client" />

// Tipagem das variáveis de ambiente expostas ao frontend (prefixo VITE_).
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_BACKEND_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
