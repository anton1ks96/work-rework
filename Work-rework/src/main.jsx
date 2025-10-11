import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import ("./styles/index.css")

import('./scripts/js/changetheme.js');

import('./styles/MainContent.module.css')


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
