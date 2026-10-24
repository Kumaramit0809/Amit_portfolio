import { useCallback, useEffect, useState } from 'react';
import { API } from './config';
import useChat from './hooks/useChat';
import RainBackground from './components/RainBackground';
import Nav from './components/Nav';
import { Hero, Stats } from './components/Header';
import Sections, { SkeletonRow } from './components/Sections';
import Chat from './components/Chat';

export default function App() {
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState('loading');
  const chat = useChat();

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const r = await fetch(API + '/');
      if (!r.ok) throw new Error(r.status);
      setData(await r.json());
      setStatus('ok');
      fetch(API + '/stats').then((r) => (r.ok ? r.json() : null)).then(setStats).catch(() => { });
    } catch {
      setStatus('error');
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const name = data?.name || 'Amit Kumar';
  useEffect(() => { document.title = name + ' ~ portfolio'; }, [name]);

  const tagText = status === 'ok'
    ? data.experiences?.[0]?.role || 'software engineer'
    : status === 'error' ? 'backend offline' : '';

  return (
    <>
      <RainBackground />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-glow" />
      <div className="relative z-[2] pb-[120px]">
        <Nav name={name} />
        <Hero data={data} tagText={tagText} />
        <Stats stats={stats} years={data?.total_experience} />
        {status === 'loading' && <SkeletonRow />}
        {status === 'error' && (
          <p className="my-5 px-4 font-mono text-[13px] text-[#FF9C9C] sm:px-[34px]">
            The server is waking up (free hosting sleeps when idle). Give it a few seconds.
            <button onClick={load} className="ml-2 underline">Retry</button>
          </p>
        )}
        {status === 'ok' && <Sections data={data} ask={chat.ask} />}
      </div>
      <Chat chat={chat} name={name} />
    </>
  );
}