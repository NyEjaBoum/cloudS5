import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/auth.css'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </StrictMode>,
)
