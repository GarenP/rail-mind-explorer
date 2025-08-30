import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('🚀 Starting OpenFrontIO Analytics Dashboard...');

try {
  const rootElement = document.getElementById("root");
  console.log('Root element found:', rootElement);
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  createRoot(rootElement).render(<App />);
  console.log('✅ App successfully mounted');
} catch (error) {
  console.error('❌ Failed to start app:', error);
}
