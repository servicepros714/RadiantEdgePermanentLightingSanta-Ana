import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { DraftProvider } from './lib/draft.jsx';
import './styles/base.css';
import './styles/chrome.css';
import './styles/home.css';
import './styles/book.css';

if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <DraftProvider>
        <App />
      </DraftProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
