import { splitTitle } from '../lib/utils';

const G = ['bg-g0', 'bg-g1', 'bg-g2', 'bg-g3'];
const LIFT = 'transition-transform duration-[180ms] hover:scale-[1.04] focus-visible:scale-[1.04] motion-reduce:transition-none';
const WRAP = 'px-4 sm:px-[34px]';
const GRID = 'grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3.5';

function Section({ id, title, children }) {
  return (
    <section id={id} className={`mt-10 scroll-mt-6 ${WRAP}`}>
      <h2 className="mb-4 font-grotesk text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

function AskCard({ i, q, title, text, ask }) {
  return (
    <button
      onClick={() => ask(q)}
      className={`${G[i % 4]} ${LIFT} relative flex h-[160px] flex-col overflow-hidden rounded-[14px] border border-line p-4 text-left`}
    >
      <h3 className="mb-1 font-grotesk text-lg font-bold leading-[1.15]">{title}</h3>
      <p className="line-clamp-3 text-[13px] text-[#DDE0FF]">{text}</p>
      <span className="mt-auto text-xs opacity-75">Ask AI about this ↗</span>
    </button>
  );
}

export function SkeletonRow() {
  return (
    <Section title="Projects">
      <div className={GRID}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[160px] animate-pl rounded-[14px] bg-glass motion-reduce:animate-none" />
        ))}
      </div>
    </Section>
  );
}

/* ---------- tree timeline: one box per entry, alternating left / right of a centre line ---------- */

function Branch({ left, e, ask }) {
  return (
    <div className={`relative pb-5 pl-10 md:w-1/2 md:pl-0 ${left ? 'md:pr-10' : 'md:ml-auto md:pl-10'}`}>
      <span className={`absolute left-[11px] top-[22px] h-2.5 w-2.5 rounded-full bg-blue ${left ? 'md:left-auto md:-right-[5px]' : 'md:-left-[5px]'}`} />
      <span className={`absolute left-[21px] top-[26px] h-0.5 w-4 bg-[#4A5BD6] md:w-[35px] ${left ? 'md:left-auto md:right-[5px]' : 'md:left-[5px]'}`} />
      <div className="rounded-[14px] border border-line bg-[#11132E]/90 p-4 backdrop-blur-[6px]">
        <h3 className="font-grotesk text-lg font-bold leading-tight">{e.title}</h3>
        {e.sub && <p className="mt-0.5 text-sm text-mute">{e.sub}</p>}
        {e.lines?.length > 0 && (
          e.lines.length > 1
            ? <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] text-[#DDE0FF]">{e.lines.map((l, i) => <li key={i}>{l}</li>)}</ul>
            : <p className="mt-2 text-[15px] text-[#DDE0FF]">{e.lines[0]}</p>
        )}
        {e.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {e.tags.map((t) => <span key={t} className="rounded-full border border-line px-2.5 py-0.5 text-xs">{t}</span>)}
          </div>
        )}
        <button onClick={() => ask(e.q)} className="mt-3 text-xs text-[#9DB8FF] hover:underline">Ask AI about this ↗</button>
      </div>
    </div>
  );
}

function Tree({ entries, ask }) {
  return (
    <div className="relative before:absolute before:bottom-0 before:left-[15px] before:top-0 before:w-0.5 before:bg-[#4A5BD6] md:before:left-1/2 md:before:-translate-x-1/2">
      {entries.map((e, i) => <Branch key={i} left={i % 2 === 0} e={e} ask={ask} />)}
    </div>
  );
}

const lines = (text) =>
  String(text || '').split(/\n+/).map((l) => l.replace(/^\s*[-*•·]\s*/, '').trim()).filter(Boolean);

const eduParts = (s) => String(s).split(/\s*[;|]\s*|\s*,\s*(?![^()]*\))/).map((x) => x.trim()).filter(Boolean);

export default function Sections({ data = {}, ask = () => {} }) {
  const projects = data?.project || [];
  const skills = data?.skill || [];
  const certs = data?.certification || [];

  const expEntries = (data?.experiences || []).map((e) => ({
    title: e.role || 'Role',
    sub: [e.company, e.duration].filter(Boolean).join(' · '),
    lines: lines(e.description),
    tags: e.skill_used,
    q: `Tell me about your ${e.role || 'role'}${e.company ? ' at ' + e.company : ''}.`,
  }));

  const eduEntries = (data?.education || []).map((x) => {
    const [head, ...rest] = eduParts(x);
    return { title: head || String(x), lines: rest, q: 'Tell me about your education: ' + (head || x) };
  });

  const certEntries = certs.map((c) => {
    const [t, desc] = splitTitle(c);
    return { title: t, lines: desc ? [desc] : [], q: 'Tell me about this certification: ' + t };
  });

  return (
    <>
      {projects.length > 0 && (
        <Section id="projects" title="Projects">
          <div className={GRID}>
            {projects.map((p, i) => {
              const [t, desc] = splitTitle(p);
              return <AskCard key={i} i={i} ask={ask} q={'Tell me about this project: ' + t} title={t} text={desc} />;
            })}
          </div>
        </Section>
      )}

      {expEntries.length > 0 && (
        <Section id="experience" title="Experience">
          <Tree entries={expEntries} ask={ask} />
        </Section>
      )}

      {skills.length > 0 && (
        <Section id="skills" title="Skills">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
            {skills.map((s) => (
              <button
                key={s}
                onClick={() => ask(`How have you used ${s}?`)}
                className={`${LIFT} flex min-h-[60px] items-center justify-center rounded-[14px] border border-line bg-glass px-3 py-2 text-center font-medium hover:border-blue`}
              >
                {s}
              </button>
            ))}
          </div>
        </Section>
      )}

      {eduEntries.length > 0 && (
        <Section id="education" title="Education">
          <Tree entries={eduEntries} ask={ask} />
        </Section>
      )}

      {certEntries.length > 0 && (
        <Section id="certifications" title="Certifications">
          <Tree entries={certEntries} ask={ask} />
        </Section>
      )}
    </>
  );
}