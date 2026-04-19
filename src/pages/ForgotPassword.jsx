import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CinemaIcon } from '../components/CustomIcons';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await resetPassword(email);
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'radial-gradient(ellipse at top, #1a1730 0%, #07080F 60%)' }}>
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-3 mb-10 group">
          <div className="text-gold group-hover:scale-110 transition-transform duration-300"><CinemaIcon size={36} /></div>
          <span className="font-display text-3xl font-bold text-text-primary">CineVault</span>
        </Link>

        <div className="rounded-2xl p-8" style={{ background: 'rgba(15,17,32,0.9)', border: '1px solid rgba(232,184,75,0.2)', boxShadow: '0 0 60px rgba(232,184,75,0.08)' }}>
          {sent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">📬</div>
              <h2 className="font-display text-2xl font-bold text-text-primary mb-3">Reset link sent</h2>
              <p className="text-text-muted text-sm mb-6">Check your inbox at <strong className="text-text-primary">{email}</strong>. Click the link to reset your password.</p>
              <Link to="/login" className="text-gold hover:underline text-sm font-medium">Back to Sign In</Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-3xl font-bold text-text-primary mb-2">Reset password</h1>
              <p className="text-text-muted text-sm mb-8">Enter your email and we'll send you a reset link.</p>

              {error && (
                <div className="mb-5 px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-text-muted text-xs font-medium mb-2 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl text-text-primary text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={(e) => { e.target.style.border = '1px solid rgba(232,184,75,0.5)'; }}
                    onBlur={(e) => { e.target.style.border = '1px solid rgba(255,255,255,0.1)'; }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #E8B84B 0%, #c49a30 100%)', color: '#07080F' }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-text-muted text-sm text-center mt-6">
                <Link to="/login" className="text-gold hover:underline font-medium">Back to Sign In</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
