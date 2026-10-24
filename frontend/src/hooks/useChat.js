import { useRef, useState } from 'react';
import { API } from '../config';

export default function useChat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [busy, setBusy] = useState(false);
  const greeted = useRef(false);
  const busyRef = useRef(false);

  const openChat = () => {
    setOpen(true);
    if (!greeted.current) {
      greeted.current = true;
      setMsgs([{ id: 0, role: 'bot', text: 'Hi! Ask me anything about my work.' }]);
    }
  };
  const close = () => setOpen(false);

  const ask = async (q) => {
    q = q.trim();
    if (busyRef.current || !q) return;
    busyRef.current = true;
    setBusy(true);
    openChat();
    const id = Date.now();
    setMsgs((m) => [...m, { id, role: 'me', text: q }, { id: id + 1, role: 'typing' }]);
    let reply;
    try {
      const r = await fetch(API + '/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      const j = await r.json();
      if (!r.ok || j.error) throw new Error(j.error || r.status);
      reply = { id: id + 1, role: 'bot', text: j.answer || '', sources: j.sources || [] };
    } catch (e) {
      reply = {
        id: id + 1,
        role: 'bad',
        text: `That didn't go through (${e.message}). The server may be waking up. Wait a few seconds and try again.`,
      };
    }
    setMsgs((m) => m.map((x) => (x.id === id + 1 ? reply : x)));
    busyRef.current = false;
    setBusy(false);
  };

  return { open, msgs, busy, ask, openChat, close };
}
