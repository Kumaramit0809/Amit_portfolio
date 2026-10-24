import { useEffect, useRef } from 'react';
import { calm } from '../config';

const SYM = '{}[]()<>/=;:+*&|!01'.split('').concat(['=>', 'fn', 'if', '0x']);

export default function RainBackground() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current, cx = cv.getContext('2d');
    let W, H, cols, y, id;
    const size = () => {
      W = cv.width = innerWidth; H = cv.height = innerHeight;
      cols = Math.ceil(W / 18);
      y = Array.from({ length: cols }, () => Math.random() * -50);
      cx.fillStyle = '#0C0D1A'; cx.fillRect(0, 0, W, H);
    };
    const tick = () => {
      cx.fillStyle = 'rgba(12,13,26,.1)'; cx.fillRect(0, 0, W, H);
      cx.font = '14px JetBrains Mono, monospace';
      for (let i = 0; i < cols; i++) {
        const ch = SYM[(Math.random() * SYM.length) | 0];
        cx.fillStyle = Math.random() > 0.96 ? 'rgba(160,230,190,.9)' : 'rgba(120,140,255,.5)';
        cx.fillText(ch, i * 18, y[i] * 18);
        if (y[i] * 18 > H && Math.random() > 0.975) y[i] = 0;
        y[i] += 0.5;
      }
    };
    size();
    addEventListener('resize', size);
    if (calm) { for (let i = 0; i < 120; i++) tick(); } else id = setInterval(tick, 55);
    return () => { clearInterval(id); removeEventListener('resize', size); };
  }, []);
  return <canvas ref={ref} aria-hidden="true" className="fixed inset-0 z-0 h-full w-full" />;
}
