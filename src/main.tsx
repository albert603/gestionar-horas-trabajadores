
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Get the root element
const rootElement = document.getElementById("root");

// Verify the root element exists
if (!rootElement) {
  console.error("Root element not found! Make sure there's a div with id 'root' in your HTML file.");
} else {
  try {
    // Clear any potentially corrupted authentication data
    if (localStorage.getItem('currentUser')) {
      try {
        // Test if the stored data is valid JSON
        JSON.parse(localStorage.getItem('currentUser') || '{}');
      } catch (e) {
        // If invalid, clear it
        console.error("Invalid currentUser data in localStorage, clearing.");
        localStorage.removeItem('currentUser');
      }
    }
    
    // Create root and render app
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (error) {
    console.error("Failed to render the application:", error);
    // Display a user-friendly error message
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h2>Algo salió mal</h2>
          <p>La aplicación no pudo cargarse. Por favor, verifica la consola para más detalles.</p>
        </div>
      `;
    }
  }
}
