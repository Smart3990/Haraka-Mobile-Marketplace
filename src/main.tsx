import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { testConnection } from './lib/firebase.ts';

// Test Firestore connection on boot per Firebase skill guidelines
testConnection();

createRoot(document.getElementById('root')!).render(<App />);
