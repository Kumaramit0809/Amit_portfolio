import { AVATAR_URL, LINKS } from '../config';
import { initials } from '../lib/utils';
import useTypewriter from '../hooks/useTypewriter';

const WRAP = 'px-4 sm:px-[34px]';

export function Hero({ data, tagText }) {
  const tag = useTypewriter(tagText);
  const name = data?.name || 'Amit Kumar';
  const exp = data?.experiences?.[0];
  const links = [
    data?.mail && [data.mail, 'mailto:' + data.mail],
    LINKS.github && ['GitHub', LINKS.github],
    LINKS.leetcode && ['LeetCode', LINKS.leetcode],
    LINKS.linkedin && ['LinkedIn', LINKS.linkedin],
  ].filter(Boolean);

  return (
    <header id="contact" className={`mt-7 grid gap-4 md:grid-cols-[1.5fr_1fr] ${WRAP}`}>
      <div className="rounded-[20px] border border-line bg-hero px-[22px] py-7 backdrop-blur-[8px] sm:px-10 sm:py-11">
        <div className="min-h-[22px] font-mono text-sm text-[#8FE3B0] after:ml-0.5 after:animate-bl after:content-['▌'] motion-reduce:after:animate-none">
          {tag}
        </div>
        <h1 className="mb-3.5 mt-3 font-grotesk text-[clamp(2.6rem,7vw,5rem)] font-bold leading-[.95] tracking-[-.035em]">{name}</h1>
        {exp && <p className="mb-2 text-lg">{[exp.role, exp.company].filter(Boolean).join(' at ')}</p>}
        <p className="max-w-[56ch] text-mute">
          Recruiters: skip the reading. Browse my work below, or use the chat button to ask me anything.
        </p>
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-sm text-mute">
          {links.map(([t, h]) => <a key={h} href={h} target="_blank" rel="noreferrer" className="hover:text-ink">{t}</a>)}
          {data?.phone && <span>{data.phone}</span>}
        </div>
      </div>

      <aside className="flex flex-col items-center justify-center gap-2 rounded-[20px] border border-line bg-glass p-6 text-center">
        {AVATAR_URL
          ? <img src={AVATAR_URL} alt={name} className="h-28 w-28 rounded-full object-cover" />
          : <div className="grid h-28 w-28 place-items-center rounded-full bg-blue font-grotesk text-4xl font-bold">{initials(name)}</div>}
        <div className="mt-2 font-grotesk text-lg font-bold">{name}</div>
        {exp?.company && <div className="text-sm text-mute">{exp.company}</div>}
        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
          {(data?.skill || []).slice(0, 4).map((s) => (
            <span key={s} className="rounded-full border border-blue px-3 py-1 text-[13px] text-[#9DB8FF]">{s}</span>
          ))}
        </div>
      </aside>
    </header>
  );
}

export function Stats({ stats, years }) {
  const items = [
    [stats?.leetcode_solved, 'LeetCode solved', (v) => v + '+'],
    [stats?.github_repos, 'GitHub repos', (v) => v],
    [years ?? stats?.years, 'Years of experience', (v) => v],
    [stats?.contest_top_percent, 'LeetCode contest', (v) => 'Top ' + v + '%'],
  ].filter(([v]) => v != null && v !== 0);
  if (!items.length) return null;
  return (
    <div className={`mt-4 ${WRAP}`}>
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-line bg-glass px-4 py-4 text-center sm:grid-cols-4">
        {items.map(([v, l, f]) => (
          <div key={l}>
            <div className="font-grotesk text-2xl font-bold">{f(v)}</div>
            <div className="text-[13px] text-mute">{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}