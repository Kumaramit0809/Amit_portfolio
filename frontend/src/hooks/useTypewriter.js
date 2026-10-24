import { useEffect, useState } from 'react';
import { calm } from '../config';

export default function useTypewriter(text) {
  const [out, setOut] = useState('');
  useEffect(() => {
    if (!text) { setOut(''); return; }
    const full = '> ' + text;
    if (calm) { setOut(full); return; }
    let i = 0;
    const t = setInterval(() => {
      setOut(full.slice(0, ++i));
      if (i >= full.length) clearInterval(t);
    }, 45);
    return () => clearInterval(t);
  }, [text]);
  return out;
}
