import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CinemaIcon } from '../components/CustomIcons';
import { MailIcon } from '../components/CustomIcons';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signUp, signInWithGoogle, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect away if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Show spinner while auth state is being restored
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  // Don't render the form if user is already logged in
  if (user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error: err } = await signUp(email, password);
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error: err } = await signInWithGoogle();
    if (err) {
      setError(err.message);
      setGoogleLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" style={{ background: 'radial-gradient(ellipse at top, #1a1730 0%, #07080F 60%)' }}>
        <div className="max-w-md w-full text-center rounded-2xl p-10" style={{ background: 'rgba(15,17,32,0.9)', border: '1px solid rgba(232,184,75,0.2)', boxShadow: '0 0 60px rgba(232,184,75,0.08)' }}>
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(232,184,75,0.1)', border: '1px solid rgba(232,184,75,0.3)' }}>
            <MailIcon size={36} color="#E8B84B" />
          </div>
          <h2 className="font-display text-3xl font-bold text-text-primary mb-3">Check your email</h2>
          <p className="text-text-muted leading-relaxed mb-6">
            We've sent a confirmation link to <strong className="text-text-primary">{email}</strong>. Click the link to activate your account.
          </p>
          <Link to="/login" className="inline-block px-8 py-3 rounded-full font-semibold text-sm" style={{ background: 'linear-gradient(135deg, #E8B84B, #c49a30)', color: '#07080F' }}>
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" style={{ background: 'radial-gradient(ellipse at top, #1a1730 0%, #07080F 60%)' }}>
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-3 mb-10 group">
          <div className="text-gold group-hover:scale-110 transition-transform duration-300">
            <CinemaIcon size={36} />
          </div>
          <span className="font-display text-3xl font-bold text-text-primary">CineVault</span>
        </Link>

        <div className="rounded-2xl p-8" style={{ background: 'rgba(15,17,32,0.9)', border: '1px solid rgba(232,184,75,0.2)', boxShadow: '0 0 60px rgba(232,184,75,0.08)' }}>
          <h1 className="font-display text-3xl font-bold text-text-primary mb-2">Create account</h1>
          <p className="text-text-muted text-sm mb-8">Join CineVault — it's free forever</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl mb-6 font-medium text-sm transition-all duration-300 hover:scale-[1.02]"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#F0EDE8' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {googleLoading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-text-muted text-xs">or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { label: 'Email', type: 'email', value: email, setter: setEmail, placeholder: 'you@example.com' },
              { label: 'Password', type: 'password', value: password, setter: setPassword, placeholder: '••••••••' },
              { label: 'Confirm Password', type: 'password', value: confirm, setter: setConfirm, placeholder: '••••••••' },
            ].map(({ label, type, value, setter, placeholder }) => (
              <div key={label}>
                <label className="block text-text-muted text-xs font-medium mb-2 uppercase tracking-wider">{label}</label>
                <input
                  type={type}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  required
                  placeholder={placeholder}
                  className="w-full px-4 py-3 rounded-xl text-text-primary text-sm outline-none transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onFocus={(e) => { e.target.style.border = '1px solid rgba(232,184,75,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(232,184,75,0.08)'; }}
                  onBlur={(e) => { e.target.style.border = '1px solid rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(232,184,75,0.25)]"
              style={{ background: 'linear-gradient(135deg, #E8B84B 0%, #c49a30 100%)', color: '#07080F' }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-text-muted text-sm text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-gold hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
