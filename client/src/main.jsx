import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

const rootElement = document.getElementById('root');

createRoot(rootElement).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
)
