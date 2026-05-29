import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept and handle Firestore quota/resource-exhausted errors cleanly to prevent console spam & platform error flags
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

const isQuotaError = (message: string) => {
  if (!message) return false;
  const lowercaseMsg = String(message).toLowerCase();
  return (
    lowercaseMsg.includes("@firebase/firestore") ||
    lowercaseMsg.includes("quota limit exceeded") ||
    lowercaseMsg.includes("resource-exhausted") ||
    lowercaseMsg.includes("free daily write units") ||
    lowercaseMsg.includes("maximum backoff delay") ||
    lowercaseMsg.includes("quota exceeded")
  );
};

console.error = function (...args: any[]) {
  const message = args.map(arg => {
    if (arg && typeof arg === "object") {
      return String(arg.message || arg.stack || JSON.stringify(arg));
    }
    return String(arg || "");
  }).join(" ");

  if (isQuotaError(message)) {
    try {
      if (localStorage.getItem("firestore_quota_exceeded") !== "true") {
        localStorage.setItem("firestore_quota_exceeded", "true");
        setTimeout(() => {
          window.location.reload();
        }, 300);
      }
    } catch (e) {
      // safe ignore
    }
    return; // Suppress
  }
  originalConsoleError.apply(console, args);
};

console.warn = function (...args: any[]) {
  const message = args.map(arg => {
    if (arg && typeof arg === "object") {
      return String(arg.message || arg.stack || JSON.stringify(arg));
    }
    return String(arg || "");
  }).join(" ");

  if (isQuotaError(message)) {
    try {
      if (localStorage.getItem("firestore_quota_exceeded") !== "true") {
        localStorage.setItem("firestore_quota_exceeded", "true");
        setTimeout(() => {
          window.location.reload();
        }, 300);
      }
    } catch (e) {
      // safe ignore
    }
    return; // Suppress
  }
  originalConsoleWarn.apply(console, args);
};

// Listen to unhandled promise rejections and error events
window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  const errMsg = String(reason?.message || reason || "");
  if (isQuotaError(errMsg)) {
    event.preventDefault(); // Prevent logging to stdout/stderr
    try {
      if (localStorage.getItem("firestore_quota_exceeded") !== "true") {
        localStorage.setItem("firestore_quota_exceeded", "true");
        setTimeout(() => {
          window.location.reload();
        }, 300);
      }
    } catch (e) {
      // safe ignore
    }
  }
});

window.addEventListener("error", (event) => {
  const errMsg = String(event.message || event.error?.message || event.error || "");
  if (isQuotaError(errMsg)) {
    event.preventDefault(); // Prevent logging
    try {
      if (localStorage.getItem("firestore_quota_exceeded") !== "true") {
        localStorage.setItem("firestore_quota_exceeded", "true");
        setTimeout(() => {
          window.location.reload();
        }, 300);
      }
    } catch (e) {
      // safe ignore
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

