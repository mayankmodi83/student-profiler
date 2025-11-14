// This file provides type definitions for environment variables
// that are injected by Vite. It prevents TypeScript errors when
// accessing `process.env.API_KEY`.

// Fix: Replaced `declare const process` with namespace augmentation to avoid redeclaration errors.
// We are augmenting the NodeJS.ProcessEnv interface to add our
// environment variables. This avoids redeclaring the global `process` object.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}
