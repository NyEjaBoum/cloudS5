import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/auth.css'
import App from './App.jsx'
import './firebase'; // <-- Ajoute cette ligne AVANT tout appel à Firebase

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)