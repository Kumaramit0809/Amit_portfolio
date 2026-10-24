import { API } from '../config';

const ITEMS = [
  ['Projects', '#projects'], ['Experience', '#experience'], ['Skills', '#skills'],
  ['Education', '#education'], ['Contact', '#contact'],
];

export default function Nav({ name }) {
  return (
    <nav className="flex items-center justify-between px-4 pt-[max(18px,env(safe-area-inset-top))] sm:px-[34px]">
      <span className="font-grotesk text-lg font-bold">{name}</span>
      <div className="flex items-center gap-5 text-sm">
        <div className="hidden gap-5 text-mute md:flex">
          {ITEMS.map(([t, h]) => <a key={h} href={h} className="hover:text-ink">{t}</a>)}
        </div>
        <a href={API + '/cv'} className="rounded-[22px] border border-line px-4 py-[9px] font-medium hover:bg-glass">
          Download CV
        </a>
      </div>
    </nav>
  );
}