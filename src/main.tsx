import React from 'react';
import ReactDOM from 'react-dom/client';
import { injectSpeedInsights } from '@vercel/speed-insights';
import App from './App';
import './index.css';

// Enable Vercel Speed Insights for performance monitoring
injectSpeedInsights();

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
