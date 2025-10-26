import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'

console.log('🚀 App initialization started');

const root = document.getElementById("root");
if (!root) {
  console.error('❌ Root element not found!');
} else {
  console.log('✅ Root element found, mounting app...');
  createRoot(root).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  console.log('✅ App mounted successfully');
}
