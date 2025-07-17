import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './components/auth';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // ✅ Import here

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster position="top-right" reverseOrder={false} /> {/* ✅ Add Toaster */}
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);