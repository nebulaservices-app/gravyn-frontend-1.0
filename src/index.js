import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { SocketProvider } from './service/Sockets/SocketContext'; // ✅ Import your context
import axios from 'axios';

axios.defaults.withCredentials = true;

const root = ReactDOM.createRoot(document.getElementById('root'));
const clientId = "736543213507-6npp1f64qo2c59ph9do6ia30ip19qpnv.apps.googleusercontent.com";

// (Optional) If you're using authToken from localStorage or cookie:
const token = localStorage.getItem('authToken'); // if applicable

root.render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={clientId}>
            <SocketProvider initialNamespaces={['communication']} authToken={token}>
                <App />
            </SocketProvider>
        </GoogleOAuthProvider>
    </React.StrictMode>
);

reportWebVitals();