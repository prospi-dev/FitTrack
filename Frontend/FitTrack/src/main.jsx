import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './index.css'

// BrowserRouter enables client-side routing
// AuthProvider wraps everything so every component can access auth state

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App/>
        </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
