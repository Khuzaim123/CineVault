import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { CinemaIcon, HeartIcon, CheckIcon, BookmarkIcon } from '../components/CustomIcons';

const Profile = () => {
  const { user, signOut, setAvatarUrl: setContextAvatarUrl } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [profile, setProfile] = useState({ username: '', full_name: '', bio: '', avatar_url: '' });
  const [stats, setStats] = useState({ favorites: 0, watchlist: 0 });
  const [profileLoading, setProfileLoading] = useState(true);

  // Edit profile state
  const [editSaved, setEditSaved] = useState(false);
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Password state
  const [pwForm, setPwForm] = useState({ newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  // Avatar upload
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  // Delete
  const [showDelete, setShowDelete] = useState(false);

  // Avatar display — falls back to initials if URL fails to load
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchProfile();
    fetchStats();
  }, [user]);

  const fetchProfile = async () => {
    setProfileLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('[Profile] DB fetch error:', error.message);
    }

    if (data) {
      setProfile(data);
      setContextAvatarUrl(data.avatar_url || null);

      // ── Avatar debug ─────────────────────────────────────────────
      const url = data.avatar_url;
      if (!url) {
        console.log('[Avatar] No avatar_url saved in DB.');
      } else if (url.startsWith('data:')) {
        console.log('[Avatar] Stored as base64 ✅');
      } else {
        console.log('[Avatar] Storage URL in DB:', url);
        // Ping the URL to confirm it's publicly accessible
        fetch(url, { method: 'HEAD' })
          .then(res => {
            if (res.ok) {
              console.log('[Avatar] URL is reachable ✅', res.status);
            } else {
              console.error(
                `[Avatar] ❌ URL returned ${res.status}. ` +
                'Most likely the bucket is NOT set to Public. ' +
                'Fix: Supabase → Storage → avatars → Edit bucket → Public ON'
              );
            }
          })
          .catch(err => console.error('[Avatar] Network error reaching URL:', err));
      }
      // ─────────────────────────────────────────────────────────────
    }

    setProfileLoading(false);
  };

  const fetchStats = async () => {
    const [{ count: fav }, { count: wl }] = await Promise.all([
      supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('watchlist').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    ]);
    setStats({ favorites: fav || 0, watchlist: wl || 0 });
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditLoading(true);
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      username: profile.username,
      full_name: profile.full_name,
      bio: profile.bio,
    });
    setEditLoading(false);
    if (error) { setEditError(error.message); } else { setEditSaved(true); setTimeout(() => setEditSaved(false), 3000); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size (max 2MB)
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Image must be under 2MB.');
      return;
    }

    setAvatarLoading(true);
    setAvatarError('');
    setImgError(false);

    const ext = file.name.split('.').pop().toLowerCase();
    const path = `${user.id}.${ext}`;

    // --- Phase 1: Try Supabase Storage ---
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });

    if (!uploadError) {
      // Storage success — get the public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      const { error: dbError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, avatar_url: url });
      if (!dbError) {
        setProfile(prev => ({ ...prev, avatar_url: url }));
        setContextAvatarUrl(url);   // ← sync Navbar instantly
        setAvatarLoading(false);
        return;
      }
      console.warn('[Avatar] Storage succeeded but DB save failed:', dbError.message);
    } else {
      console.warn('[Avatar] Storage upload failed:', uploadError.message, '— trying base64 fallback');
    }

    // --- Phase 2: Base64 fallback ---
    // Compress and store the image directly in the profiles table.
    // Works even if the storage bucket has no policies configured.
    try {
      const base64url = await new Promise((resolve, reject) => {
        // Compress via canvas to keep the size small
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = () => {
          const MAX = 256; // px — enough for an avatar display
          const scale = Math.min(MAX / img.width, MAX / img.height, 1);
          const canvas = document.createElement('canvas');
          canvas.width  = Math.round(img.width  * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(objectUrl);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = reject;
        img.src = objectUrl;
      });

      const { error: dbError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, avatar_url: base64url });

      if (dbError) {
        setAvatarError('Could not save profile picture: ' + dbError.message);
      } else {
        setProfile(prev => ({ ...prev, avatar_url: base64url }));
        setContextAvatarUrl(base64url); // ← sync Navbar instantly
      }
    } catch (err) {
      setAvatarError('Image processing failed. Please try a different image.');
      console.error('[Avatar] Base64 fallback failed:', err);
    }

    setAvatarLoading(false);
  };

  const handleRemoveAvatar = async () => {
    if (!profile.avatar_url) return;
    setAvatarLoading(true);
    setAvatarError('');

    // Only attempt storage deletion if it's a real storage URL (not base64)
    const isStorageUrl = profile.avatar_url.startsWith('https://');
    if (isStorageUrl) {
      // Extract the file path from the URL (everything after "/avatars/")
      const match = profile.avatar_url.match(/\/avatars\/([^?]+)/);
      if (match) {
        const filePath = match[1];
        const { error: delError } = await supabase.storage
          .from('avatars')
          .remove([filePath]);
        if (delError) {
          // Non-fatal — still clear from DB even if storage delete fails
          console.warn('[Avatar] Storage delete failed:', delError.message);
        }
      }
    }

    // Clear from database
    const { error: dbError } = await supabase
      .from('profiles')
      .upsert({ id: user.id, avatar_url: null });

    if (dbError) {
      setAvatarError('Could not remove picture: ' + dbError.message);
    } else {
      setProfile(prev => ({ ...prev, avatar_url: null }));
      setContextAvatarUrl(null);  // ← sync Navbar instantly
      setImgError(false);
    }
    setAvatarLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError('Passwords do not match.'); return; }
    if (pwForm.newPassword.length < 6) { setPwError('Password must be at least 6 characters.'); return; }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwForm.newPassword });
    setPwLoading(false);
    if (error) { setPwError(error.message); } else { setPwSuccess(true); setPwForm({ newPassword: '', confirmPassword: '' }); }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    // Note: Full account deletion requires a Supabase Edge Function or admin API
    // For now we sign the user out and show a message
    await signOut();
    navigate('/');
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#F0EDE8',
    width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', outline: 'none', fontSize: '0.875rem',
  };

  const cardStyle = {
    background: 'rgba(15,17,32,0.8)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '1rem',
    padding: '2rem',
    marginBottom: '1.5rem',
  };

  const avatarUrl = profile.avatar_url || null;
  const displayName = profile.full_name || profile.username || user?.email?.split('@')[0] || 'User';
  const memberSince = new Date(user?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Profile Header */}
        <div className="text-center mb-10">
          <div className="relative inline-block mb-4">
            <div
              className="w-28 h-28 rounded-full overflow-hidden mx-auto"
              style={{ border: `3px solid ${avatarLoading ? '#E8B84B' : 'rgba(232,184,75,0.4)'}`, transition: 'border-color 0.3s' }}
            >
              {avatarLoading ? (
                <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a1730, #0F1120)' }}>
                  <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
                </div>
              ) : avatarUrl && !imgError ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gold" style={{ background: 'linear-gradient(135deg, #1a1730, #0F1120)' }}>
                  {displayName[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <button
              onClick={() => { setAvatarError(''); fileRef.current?.click(); }}
              disabled={avatarLoading}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all hover:scale-110"
              style={{ background: 'linear-gradient(135deg, #E8B84B, #c49a30)', color: '#07080F' }}
              title="Change avatar"
            >
              {avatarLoading ? '…' : '✎'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </div>

          {/* Upload error banner */}
          {avatarError && (
            <div
              className="mx-auto max-w-xs mb-3 px-4 py-2 rounded-lg text-xs text-center"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
            >
              {avatarError}
            </div>
          )}

          {/* Change / Remove buttons — shown only when a picture is set */}
          {avatarUrl && !imgError && !avatarLoading && (
            <div className="flex items-center justify-center gap-3 mb-3">
              <button
                onClick={() => { setAvatarError(''); fileRef.current?.click(); }}
                className="px-4 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-[1.03]"
                style={{ background: 'rgba(232,184,75,0.12)', border: '1px solid rgba(232,184,75,0.3)', color: '#E8B84B' }}
              >
                Change photo
              </button>
              <button
                onClick={handleRemoveAvatar}
                className="px-4 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-[1.03]"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
              >
                Remove photo
              </button>
            </div>
          )}

          <h1 className="font-display text-3xl font-bold text-text-primary">{displayName}</h1>
          {profile.username && <p className="text-text-muted text-sm mt-1">@{profile.username}</p>}
          <p className="text-text-muted text-xs mt-1">Member since {memberSince}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { label: 'Favorites', value: stats.favorites, Icon: HeartIcon,    link: '/favorites' },
            { label: 'Watchlist', value: stats.watchlist, Icon: BookmarkIcon, link: '/watchlist' },
          ].map(s => (
            <Link key={s.label} to={s.link} className="text-center rounded-xl py-5 transition-all hover:scale-[1.02]" style={{ background: 'rgba(232,184,75,0.06)', border: '1px solid rgba(232,184,75,0.15)' }}>
              <div className="flex justify-center mb-2">
                <s.Icon size={22} color="#E8B84B" />
              </div>
              <div className="font-display text-3xl font-bold text-gold">{s.value}</div>
              <div className="text-text-muted text-xs mt-1">{s.label}</div>
            </Link>
          ))}
        </div>

        {/* Edit Profile */}
        <div style={cardStyle}>
          <h2 className="font-display text-xl font-bold text-text-primary mb-5">Edit Profile</h2>
          {editError && <div className="mb-4 px-4 py-2 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>{editError}</div>}
          {editSaved && <div className="mb-4 px-4 py-2 rounded-lg text-sm" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}>Profile saved!</div>}
          <form onSubmit={handleProfileSave} className="space-y-4">
            {[
              { label: 'Username', field: 'username', placeholder: 'your_username' },
              { label: 'Full Name', field: 'full_name', placeholder: 'John Doe' },
            ].map(({ label, field, placeholder }) => (
              <div key={field}>
                <label className="block text-text-muted text-xs font-medium mb-1.5 uppercase tracking-wider">{label}</label>
                <input
                  type="text"
                  value={profile[field] || ''}
                  onChange={(e) => setProfile(p => ({ ...p, [field]: e.target.value }))}
                  placeholder={placeholder}
                  style={inputStyle}
                />
              </div>
            ))}
            <div>
              <label className="block text-text-muted text-xs font-medium mb-1.5 uppercase tracking-wider">Bio</label>
              <textarea
                value={profile.bio || ''}
                onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))}
                rows={3}
                placeholder="Tell us about yourself..."
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
            <button
              type="submit"
              disabled={editLoading}
              className="px-6 py-2.5 rounded-full font-semibold text-sm transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #E8B84B, #c49a30)', color: '#07080F' }}
            >
              {editLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div style={cardStyle}>
          <h2 className="font-display text-xl font-bold text-text-primary mb-5">Change Password</h2>
          {pwError && <div className="mb-4 px-4 py-2 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>{pwError}</div>}
          {pwSuccess && <div className="mb-4 px-4 py-2 rounded-lg text-sm" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}>Password updated!</div>}
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {[
              { label: 'New Password', field: 'newPassword', placeholder: '••••••••' },
              { label: 'Confirm Password', field: 'confirmPassword', placeholder: '••••••••' },
            ].map(({ label, field, placeholder }) => (
              <div key={field}>
                <label className="block text-text-muted text-xs font-medium mb-1.5 uppercase tracking-wider">{label}</label>
                <input
                  type="password"
                  value={pwForm[field]}
                  onChange={(e) => setPwForm(p => ({ ...p, [field]: e.target.value }))}
                  placeholder={placeholder}
                  style={inputStyle}
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={pwLoading}
              className="px-6 py-2.5 rounded-full font-semibold text-sm transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#F0EDE8' }}
            >
              {pwLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Sign Out + Delete */}
        <div style={cardStyle}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-text-primary">Account</h2>
              <p className="text-text-muted text-sm mt-0.5">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-6 py-2.5 rounded-full font-semibold text-sm transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#F0EDE8' }}
            >
              Sign Out
            </button>
          </div>

          <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(239,68,68,0.15)' }}>
            {!showDelete ? (
              <button onClick={() => setShowDelete(true)} className="text-red-400 text-sm hover:text-red-300 transition-colors">
                Delete account…
              </button>
            ) : (
              <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p className="text-text-primary text-sm mb-4">Are you sure? This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={handleDeleteAccount} className="px-5 py-2 rounded-full text-sm font-medium" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>Yes, delete my account</button>
                  <button onClick={() => setShowDelete(false)} className="px-5 py-2 rounded-full text-sm font-medium" style={{ background: 'rgba(255,255,255,0.06)', color: '#F0EDE8' }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
