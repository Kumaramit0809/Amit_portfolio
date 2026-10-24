const inline = (t) =>
  t.split(/\*\*(.+?)\*\*/g).map((s, i) => (i % 2 ? <strong key={i}>{s}</strong> : s));

export default function Markdown({ text }) {
  const out = [];
  let list = [];
  const flush = () => {
    if (!list.length) return;
    out.push(
      <ul key={out.length} className="mb-2 list-disc pl-[1.2em]">
        {list.map((l, i) => <li key={i}>{inline(l)}</li>)}
      </ul>
    );
    list = [];
  };
  text.split('\n').forEach((l) => {
    const m = l.match(/^\s*[-*•]\s+(.*)/);
    if (m) list.push(m[1]);
    else {
      flush();
      if (l.trim()) out.push(<p key={out.length} className="mb-2 last:mb-0">{inline(l)}</p>);
    }
  });
  flush();
  return <>{out}</>;
}
