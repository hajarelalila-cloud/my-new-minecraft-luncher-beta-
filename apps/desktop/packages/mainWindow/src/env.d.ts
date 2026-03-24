/// <reference types="vite/client" />

interface ImportMetaEnv {
  MODE: string
  VITE_MAIN_DSN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module "*.riv" {
  const content: any
  export default content
}

declare const __APP_VERSION__: string
declare const __SHOWCASE_MODE__: boolean
