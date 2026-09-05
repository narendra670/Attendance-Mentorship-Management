'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import Avatar from '@/components/Avatar';
import { PageLoader, EmptyState, Spinner } from '@/components/ui';
import { cn, formatDateTime, timeAgo } from '@/lib/utils';

export default function MessagesPage() {
  const { user, token } = useAuth();
  const [selected, setSelected] = useState(null);
  const { data: convosData, loading, error, reload } = useFetch('/messages');
  const [messages, setMessages] = useState([]);
  const [peer, setPeer] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const conversations = convosData?.conversations || [];

  const openChat = async (peerId) => {
    setSelected(peerId);
    setChatLoading(true);
    try {
      const res = await api(`/messages/${peerId}`, { token });
      setMessages(res.messages);
      setPeer(res.peer);
    } catch {
      setMessages([]);
    } finally {
      setChatLoading(false);
    }
  };

  // Poll for new messages in the open conversation
  useEffect(() => {
    if (!selected || !token) return;
    const tick = async () => {
      try {
        const res = await api(`/messages/${selected}`, { token });
        setMessages(res.messages);
        setPeer(res.peer);
      } catch {}
    };
    const id = setInterval(tick, 4000);
    return () => clearInterval(id);
  }, [selected, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || !selected) return;
    setSending(true);
    setInput('');
    try {
      await api('/messages', { method: 'POST', token, body: { receiver: selected, content } });
      const res = await api(`/messages/${selected}`, { token });
      setMessages(res.messages);
      reload();
    } catch (err) {
      setInput(content);
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error) return <EmptyState title="Could not load messages" message={error} />;

  return (
    <div className="card flex h-[calc(100vh-8rem)] overflow-hidden">
      {/* Conversation list */}
      <div className={cn('flex w-full flex-col border-r border-slate-200 sm:w-72 md:w-80', selected ? 'hidden sm:flex' : 'flex')}>
        <div className="border-b border-slate-100 px-4 py-4">
          <h1 className="text-lg font-bold text-slate-900">Messages</h1>
          <p className="text-xs text-slate-500">Chat with your mentorship community</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-slate-400">
              No conversations yet.
              <br />
              {user?.role === 'student' ? 'Message your mentor to get started.' : 'Messages will appear here.'}
            </div>
          )}
          {conversations.map((c) => (
            <button
              key={c.peer._id}
              onClick={() => openChat(c.peer._id)}
              className={cn(
                'flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50',
                selected === c.peer._id && 'bg-brand-50 hover:bg-brand-50'
              )}
            >
              <div className="relative">
                <Avatar name={c.peer.name} src={c.peer.profilePhoto} />
                <span className={cn('absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white', c.peer.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300')} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-slate-800">{c.peer.name}</span>
                  <span className="shrink-0 text-[11px] text-slate-400">{timeAgo(c.lastAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-slate-500">{c.lastMessage}</span>
                  {c.unread > 0 && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div className={cn('flex min-w-0 flex-1 flex-col', selected ? 'flex' : 'hidden sm:flex')}>
        {!selected ? (
          <div className="flex flex-1 flex-col items-center justify-center text-slate-400">
            <div className="text-5xl">💬</div>
            <p className="mt-3 text-sm">Select a conversation to start chatting</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 sm:hidden">←</button>
              <Avatar name={peer?.name} src={peer?.profilePhoto} />
              <div>
                <div className="text-sm font-semibold text-slate-900">{peer?.name}</div>
                <div className="text-xs capitalize text-slate-500">{peer?.role} · {peer?.department || '—'}</div>
              </div>
              <div className="ml-auto text-xs text-slate-400">{peer?.status === 'online' ? '🟢 Online' : 'Offline'}</div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4">
              {chatLoading && <div className="flex justify-center"><Spinner /></div>}
              {!chatLoading && messages.length === 0 && (
                <div className="py-10 text-center text-sm text-slate-400">Say hello 👋</div>
              )}
              {messages.map((m) => {
                const mine = m.sender?._id === user?._id || m.sender === user?._id;
                return (
                  <div key={m._id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                      mine ? 'rounded-br-sm bg-brand-600 text-white' : 'rounded-bl-sm bg-white text-slate-700'
                    )}>
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
                      <div className={cn('mt-1 text-[10px]', mine ? 'text-brand-100' : 'text-slate-400')}>
                        {formatDateTime(m.createdAt)}
                        {m.read && mine && <span className="ml-1">✓✓</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={send} className="flex items-center gap-2 border-t border-slate-100 p-3">
              <input
                className="input"
                placeholder="Type a message…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit" disabled={sending || !input.trim()} className="btn-primary shrink-0 !px-4 !py-2">
                {sending ? <Spinner className="h-4 w-4 text-white" /> : 'Send'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}