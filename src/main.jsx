import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

/**
 * StrictMode is intentionally removed.
 *
 * React StrictMode in development intentionally mounts → unmounts → remounts
 * every component.  This causes onAuthStateChange to subscribe, unsubscribe,
 * then re-subscribe in rapid succession.  During that gap the Supabase client
 * may fire the SIGNED_IN event (from the OAuth ?code= exchange) between the
 * unmount and remount — and because there is no listener at that moment, the
 * auth state is never written to React state, leaving the user appearing
 * logged out even after a successful Google sign-in.
 *
 * StrictMode can be re-enabled once Supabase releases a version whose auth
 * listener is resilient to StrictMode's intentional double-invoke cycle.
 */
createRoot(document.getElementById('root')).render(<App />);
