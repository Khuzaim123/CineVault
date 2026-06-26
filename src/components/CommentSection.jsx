import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useGuestModal } from '../context/GuestModalContext';

// ── Icons ─────────────────────────────────────────────────────────────────────
const SendIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>);
const TrashIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>);
const EditIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const ReplyIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 00-4-4H4"/></svg>);
const ThumbsUpIcon = ({ filled }) => (<svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>);
const ClockIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const CalendarIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>);
const TrendingIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>);
const ChatIcon = () => (<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="13" y2="14"/></svg>);
const ChevronIcon = ({ open }) => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>);

// ── Helpers ───────────────────────────────────────────────────────────────────
const timeAgo = (d) => {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const initials = (n) => n ? n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?';
const COLORS = ['#E8B84B','#6366f1','#10b981','#f43f5e','#0ea5e9','#a855f7','#f97316'];
const avatarColor = (id) => COLORS[(id?.charCodeAt(0) || 0) % COLORS.length];

// ── Textarea Input ────────────────────────────────────────────────────────────
const CommentInput = ({ placeholder, value, onChange, onSubmit, onCancel, isSubmitting, disabled, showCancel }) => (
  <form onSubmit={onSubmit}>
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.2s' }}
      onFocusCapture={e => e.currentTarget.style.borderColor = 'rgba(232,184,75,0.4)'}
      onBlurCapture={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
    >
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled || isSubmitting}
        maxLength={1000} rows={3}
        style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 14, padding: '12px 14px', resize: 'none', fontFamily: 'inherit', lineHeight: 1.6 }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, padding: '0 12px 10px' }}>
        <span style={{ fontSize: 11, color: value.length > 900 ? '#f87171' : 'rgba(255,255,255,0.25)', marginRight: 'auto' }}>{value.length}/1000</span>
        {showCancel && <button type="button" onClick={onCancel} style={{ padding: '6px 14px', borderRadius: 99, fontSize: 12, background: 'rgba(255,255,255,0.07)', color: '#fff', border: 'none', cursor: 'pointer' }}>Cancel</button>}
        <button type="submit" disabled={!value.trim() || isSubmitting}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 99, fontSize: 12, fontWeight: 600, border: 'none', cursor: !value.trim() ? 'not-allowed' : 'pointer', background: !value.trim() ? 'rgba(255,255,255,0.07)' : '#E8B84B', color: !value.trim() ? 'rgba(255,255,255,0.3)' : '#07080F', transition: 'all 0.2s' }}>
          <SendIcon />{isSubmitting ? 'Posting…' : 'Post'}
        </button>
      </div>
    </div>
  </form>
);

// ── Single Comment (top-level or reply) ───────────────────────────────────────
const CommentCard = ({ comment, currentUser, likedIds, onDelete, onToggleLike, onEdit, onReply, replies = [], isReply = false }) => {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const isOwner = currentUser?.id === comment.user_id;
  const isLiked = likedIds.has(comment.id);
  const color = avatarColor(comment.user_id);

  const saveEdit = () => {
    if (editText.trim() && editText.trim() !== comment.content) onEdit(comment.id, editText.trim());
    setEditing(false);
  };

  const submitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplySubmitting(true);
    await onReply(comment.id, replyText.trim());
    setReplyText('');
    setShowReplyBox(false);
    setReplySubmitting(false);
  };

  const actionBtn = (onClick, children, hoverColor = '#E8B84B') => (
    <button onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 12, padding: 0, transition: 'color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.color = hoverColor}
      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
    >{children}</button>
  );

  return (
    <div style={{ marginLeft: isReply ? 40 : 0 }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16, transition: 'border-color 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(232,184,75,0.15)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {/* Avatar */}
          <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: color + '22', border: `2px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color, overflow: 'hidden' }}>
            {comment.user_avatar ? <img src={comment.user_avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : initials(comment.user_name)}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>{comment.user_name || 'Anonymous'}</span>
              {isOwner && <span style={{ fontSize: 10, background: 'rgba(232,184,75,0.15)', color: '#E8B84B', padding: '1px 8px', borderRadius: 99, border: '1px solid rgba(232,184,75,0.25)', fontWeight: 600 }}>You</span>}
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>{timeAgo(comment.created_at)}{comment.updated_at !== comment.created_at && ' · edited'}</span>
            </div>

            {/* Content / Edit */}
            {editing ? (
              <div>
                <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={3} maxLength={1000} autoFocus
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(232,184,75,0.3)', borderRadius: 8, color: '#fff', fontSize: 14, padding: '8px 12px', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={saveEdit} style={{ padding: '5px 14px', borderRadius: 99, background: '#E8B84B', color: '#07080F', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Save</button>
                  <button onClick={() => { setEditing(false); setEditText(comment.content); }} style={{ padding: '5px 14px', borderRadius: 99, background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, margin: 0, wordBreak: 'break-word' }}>{comment.content}</p>
            )}

            {/* Actions */}
            {!editing && (
              <div style={{ display: 'flex', gap: 14, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Like toggle */}
                <button onClick={() => onToggleLike(comment.id, isLiked)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: isLiked ? '#E8B84B' : 'rgba(255,255,255,0.4)', fontSize: 12, padding: 0, transition: 'color 0.2s', fontWeight: isLiked ? 600 : 400 }}
                  onMouseEnter={e => { if (!isLiked) e.currentTarget.style.color = '#E8B84B'; }}
                  onMouseLeave={e => { if (!isLiked) e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
                >
                  <ThumbsUpIcon filled={isLiked} />
                  <span>{comment.likes > 0 ? comment.likes : ''} {isLiked ? 'Liked' : 'Like'}</span>
                </button>

                {/* Reply (only on top-level) */}
                {!isReply && actionBtn(() => { setShowReplyBox(v => !v); setReplyText(''); }, <><ReplyIcon /> Reply</>)}

                {isOwner && (
                  <>
                    {actionBtn(() => setEditing(true), <><EditIcon /> Edit</>, '#60a5fa')}
                    {actionBtn(() => onDelete(comment.id), <><TrashIcon /> Delete</>, '#f87171')}
                  </>
                )}

                {/* Show/hide replies toggle */}
                {!isReply && replies.length > 0 && (
                  <button onClick={() => setShowReplies(v => !v)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 12, padding: 0, marginLeft: 'auto' }}
                  >
                    <ChevronIcon open={showReplies} />
                    {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reply input */}
      {showReplyBox && (
        <div style={{ marginLeft: 40, marginTop: 8 }}>
          <CommentInput placeholder="Write a reply…" value={replyText} onChange={setReplyText}
            onSubmit={submitReply} onCancel={() => { setShowReplyBox(false); setReplyText(''); }}
            isSubmitting={replySubmitting} showCancel />
        </div>
      )}

      {/* Nested replies */}
      {!isReply && showReplies && replies.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {replies.map(r => (
            <CommentCard key={r.id} comment={r} currentUser={currentUser} likedIds={likedIds}
              onDelete={onDelete} onToggleLike={onToggleLike} onEdit={onEdit} onReply={onReply} isReply />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const CommentSection = ({ mediaId, mediaType }) => {
  const { user, avatarUrl } = useAuth();
  const { showWatchModal } = useGuestModal();
  const [comments, setComments] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [text, setText] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [error, setError] = useState(null);

  // Resolve display name — prefer full_name (Google), then name, then email prefix
  const getUserName = () => {
    if (!user) return 'Anonymous';
    return (
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.display_name ||
      user.email?.split('@')[0] ||
      'Anonymous'
    );
  };

  // Resolve avatar — prefer live avatarUrl from context (kept fresh), then metadata
  const getUserAvatar = () => {
    return (
      avatarUrl ||
      user?.user_metadata?.avatar_url ||
      user?.user_metadata?.picture ||
      null
    );
  };

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    setIsLoading(true);
    try {
      let q = supabase.from('comments').select('*').eq('media_id', mediaId).eq('media_type', mediaType);
      if (sortBy === 'newest') q = q.order('created_at', { ascending: false });
      else if (sortBy === 'oldest') q = q.order('created_at', { ascending: true });
      else q = q.order('likes', { ascending: false });
      const { data } = await q;
      setComments(data || []);

      if (user) {
        const { data: liked } = await supabase.from('comment_likes').select('comment_id').eq('user_id', user.id);
        setLikedIds(new Set((liked || []).map(l => l.comment_id)));
      }
    } catch (e) { console.error(e); setError('Failed to load comments.'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [mediaId, mediaType, sortBy, user?.id]);

  // ── Post top-level comment ──────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { showWatchModal(); return; }
    const trimmed = text.trim();
    if (!trimmed) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await supabase.from('comments').insert({
        user_id: user.id, media_id: mediaId, media_type: mediaType,
        content: trimmed, user_name: getUserName(), user_avatar: getUserAvatar(), parent_id: null
      });
      setText('');
      fetchAll();
    } catch { setError('Failed to post.'); }
    finally { setIsSubmitting(false); }
  };

  // ── Reply ───────────────────────────────────────────────────────────────────
  const handleReply = async (parentId, content) => {
    if (!user) { showWatchModal(); return; }
    await supabase.from('comments').insert({
      user_id: user.id, media_id: mediaId, media_type: mediaType,
      content, user_name: getUserName(), user_avatar: getUserAvatar(), parent_id: parentId
    });
    fetchAll();
  };

  // ── Toggle like ─────────────────────────────────────────────────────────────
  const handleToggleLike = async (commentId, isLiked) => {
    if (!user) { showWatchModal(); return; }
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    if (isLiked) {
      // Unlike
      setLikedIds(prev => { const n = new Set(prev); n.delete(commentId); return n; });
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes: Math.max(0, c.likes - 1) } : c));
      await supabase.from('comment_likes').delete().eq('user_id', user.id).eq('comment_id', commentId);
      await supabase.from('comments').update({ likes: Math.max(0, comment.likes - 1) }).eq('id', commentId);
    } else {
      // Like
      setLikedIds(prev => new Set([...prev, commentId]));
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c));
      await supabase.from('comment_likes').insert({ user_id: user.id, comment_id: commentId });
      await supabase.from('comments').update({ likes: comment.likes + 1 }).eq('id', commentId);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    await supabase.from('comments').delete().eq('id', id);
    setComments(prev => prev.filter(c => c.id !== id && c.parent_id !== id));
  };

  // ── Edit ────────────────────────────────────────────────────────────────────
  const handleEdit = async (id, content) => {
    await supabase.from('comments').update({ content, updated_at: new Date().toISOString() }).eq('id', id);
    setComments(prev => prev.map(c => c.id === id ? { ...c, content, updated_at: new Date().toISOString() } : c));
  };

  // ── Build tree (top-level + replies) ────────────────────────────────────────
  const topLevel = comments.filter(c => !c.parent_id);
  const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId);
  const totalCount = comments.length;

  const SORT_OPTS = [
    { key: 'newest', label: 'Newest', Icon: ClockIcon },
    { key: 'oldest', label: 'Oldest', Icon: CalendarIcon },
    { key: 'top',    label: 'Top',    Icon: TrendingIcon },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ fontFamily: 'var(--font-display, serif)', fontSize: '1.35rem', fontWeight: 700, color: '#fff', margin: 0 }}>
          Comments {totalCount > 0 && <span style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>({totalCount})</span>}
        </h3>
        <div style={{ display: 'flex', gap: 6 }}>
          {SORT_OPTS.map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setSortBy(key)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: sortBy === key ? '1px solid #E8B84B' : '1px solid rgba(255,255,255,0.12)', background: sortBy === key ? 'rgba(232,184,75,0.15)' : 'rgba(255,255,255,0.04)', color: sortBy === key ? '#E8B84B' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }}>
              <Icon />{label}
            </button>
          ))}
        </div>
      </div>

      {/* Main input */}
      <div style={{ marginBottom: 24 }}>
        <CommentInput placeholder={user ? 'Share your thoughts…' : 'Sign in to comment…'}
          value={text} onChange={setText} onSubmit={handleSubmit}
          isSubmitting={isSubmitting} disabled={!user}
          showCancel={false}
        />
        {!user && (
          <button onClick={showWatchModal} style={{ marginTop: 8, fontSize: 12, color: '#E8B84B', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
            Sign in to join the discussion
          </button>
        )}
        {error && <p style={{ color: '#f87171', fontSize: 12, marginTop: 8 }}>{error}</p>}
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, height: 88, animation: 'pulse 1.5s ease-in-out infinite' }} />)}
        </div>
      ) : topLevel.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'rgba(255,255,255,0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><ChatIcon /></div>
          <p style={{ margin: 0, fontSize: 14 }}>No comments yet. Be the first!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {topLevel.map(c => (
            <CommentCard key={c.id} comment={c} currentUser={user} likedIds={likedIds}
              onDelete={handleDelete} onToggleLike={handleToggleLike}
              onEdit={handleEdit} onReply={handleReply}
              replies={getReplies(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
