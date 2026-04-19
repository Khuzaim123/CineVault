import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GuestModalProvider } from './context/GuestModalContext';
import Navbar from './components/Navbar';
import MobileViewToggle from './components/MobileViewToggle';
import { useDevProtection } from './hooks/useDevProtection';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import Search from './pages/Search';
import Watchlist from './pages/Watchlist';
import Favorites from './pages/Favorites';
import Movies from './pages/Movies';
import TV from './pages/TV';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';

// Inner component so hooks can run inside Router + AuthProvider context
const AppShell = () => {
  // Disable right-click and DevTools shortcuts globally
  useDevProtection();

  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <Routes>
        <Route path="/"                element={<Home />} />
        <Route path="/movie/:id"       element={<MovieDetail />} />
        <Route path="/search"          element={<Search />} />
        <Route path="/watchlist"       element={<Watchlist />} />
        <Route path="/favorites"       element={<Favorites />} />
        <Route path="/movies"          element={<Movies />} />
        <Route path="/tv"              element={<TV />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/signup"          element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile"         element={<Profile />} />
    </Routes>
      {/* Fixed bottom-right button to preview the site in a mobile frame */}
      <MobileViewToggle />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <GuestModalProvider>
          <AppShell />
        </GuestModalProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
