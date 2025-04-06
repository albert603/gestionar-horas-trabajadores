
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
          <h2>Something went wrong</h2>
          <p>The application failed to load. Please check the console for more details.</p>
        </div>
      `;
    }
  }
}
