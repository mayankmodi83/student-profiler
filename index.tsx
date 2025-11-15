import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { logoBase64 } from './assets/logo';

// Set favicon from logo
const faviconLink = document.querySelector("link[rel~='icon']");
if (faviconLink) {
  (faviconLink as HTMLLinkElement).href = logoBase64;
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
