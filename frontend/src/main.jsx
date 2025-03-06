import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
  <StrictMode>

<GoogleOAuthProvider clientId="279602924722-44chfk2u6vrdod410j4vr54ash0j0emn.apps.googleusercontent.com">
      <App />
</GoogleOAuthProvider>
  </StrictMode>,
)