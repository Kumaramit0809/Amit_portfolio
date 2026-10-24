import { useEffect, useRef, useState } from 'react';
import Markdown from './Markdown';
import { initials } from '../lib/utils';

const CHIPS = [
  ['Why should we hire you?', 'Why should we hire you?'],
  ['Best project?', 'Walk me through your best project.'],
  ['Top skills?', 'What are your strongest technical skills?'],
  ['Experience?', 'Tell me about your experience so far.'],
];

export default function Chat({ chat, name }) {
  const { open, msgs, busy, ask, openChat, close } = chat;
  const [text, setText] = useState('');
  const box = useRef(null);
  const end = useRef(null);

  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs]);
  useEffect(() => { if (open) box.current?.focus(); }, [open, busy]);
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && close();
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  }, [close]);

  const send = () => { const v = text; setText(''); ask(v); };

  if (!open) {
    return (
      <div className="fixed bottom-[max(22px,env(safe-area-inset-bottom))] right-[max(22px,env(safe-area-inset-right))] z-[5] flex items-center gap-3">
        <span className="rounded-[16px_16px_4px_16px] bg-white px-3.5 py-2 text-sm text-[#12143A] shadow-[0_8px_24px_#0006] max-sm:hidden">
          Hi! Ask me about my work
        </span>
        <button
          onClick={openChat}
          aria-label="Open chat"
          className="relative grid h-[60px] w-[60px] place-items-center rounded-full bg-blue shadow-[0_8px_24px_rgba(47,107,255,.5)] after:absolute after:right-0.5 after:top-0.5 after:h-3.5 after:w-3.5 after:rounded-full after:border-2 after:border-bg after:bg-[#34D27B] after:content-['']"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <section
      aria-label="Chat"
      className="fixed bottom-[max(22px,env(safe-area-inset-bottom))] right-[max(22px,env(safe-area-inset-right))] z-[6] flex h-[min(600px,calc(100vh-44px))] w-[390px] flex-col overflow-hidden rounded-[20px] border border-line bg-[#11132E] shadow-[0_20px_60px_#000a] max-sm:inset-0 max-sm:h-auto max-sm:w-auto max-sm:rounded-none"
    >
      <div className="flex items-center gap-2.5 border-b border-line px-4 py-3.5">
        <div className="grid h-[38px] w-[38px] place-items-center rounded-full bg-blue font-grotesk text-sm font-bold">{initials(name)}</div>
        <div>
          <b className="block leading-tight">{name}</b>
          <small className="text-[#34D27B]">● online</small>
        </div>
        <button onClick={close} aria-label="Close chat" className="ml-auto px-2 py-1 text-[22px] text-mute">×</button>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-auto p-3.5" aria-live="polite">
        {msgs.map((m) => (
          <div
            key={m.id}
            className={
              'max-w-[85%] rounded-2xl px-[13px] py-[9px] text-[15px] leading-[1.45] ' +
              (m.role === 'me' ? 'self-end rounded-br bg-blue'
                : m.role === 'bad' ? 'bg-[rgba(255,100,100,.15)] text-[#FFB3B3]'
                  : 'rounded-bl bg-white/10')
            }
          >
            {m.role === 'typing' ? (
              <span>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ animationDelay: `${i * 0.15}s` }} className="mx-0.5 inline-block h-1.5 w-1.5 animate-up rounded-full bg-mute motion-reduce:animate-none" />
                ))}
              </span>
            ) : m.role === 'bot' ? <Markdown text={m.text} /> : m.text}
            {m.sources?.length > 0 && <div className="mt-1.5 text-xs text-[#8FE3B0]">✓ Live data: {m.sources.join(', ')}</div>}
          </div>
        ))}
        <div ref={end} />
      </div>

      {msgs.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-3.5 pb-2.5">
          {CHIPS.map(([label, q]) => (
            <button key={label} onClick={() => ask(q)} className="rounded-full border border-blue px-3 py-1 text-[13px] text-[#9DB8FF] hover:bg-blue hover:text-white">{label}</button>
          ))}
        </div>
      )}

      <div className="flex gap-2 border-t border-line px-3 pb-3.5 pt-2.5">
        <input
          ref={box}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder={`Message ${name.split(' ')[0]}…`}
          aria-label="Message"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-[22px] border border-line bg-white/[.08] px-3.5 py-2.5 text-white focus:outline focus:outline-2 focus:outline-blue"
        />
        <button onClick={send} disabled={busy} aria-label="Send" className="grid h-[42px] w-[42px] place-items-center rounded-full bg-blue disabled:opacity-50">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
          </svg>
        </button>
      </div>
    </section>
  );
}
