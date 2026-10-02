// ============================================================================
// 마크다운 → 네이버 스마트에디터용 HTML 변환기
//
// 두 곳에서 같이 씁니다 — 초안을 만드는 scripts/blog-draft.mjs 와,
// 대시보드에서 본문을 고친 뒤 [네이버용 복사] 를 누르는 dashboard/index.html.
// 그래서 대시보드 폴더에 둡니다(Vercel 에 함께 올라가고, Node 는 상대경로로 불러옵니다).
// 변환 규칙을 한 군데만 고치면 양쪽이 같이 따라옵니다.
//
// 네이버는 class·외부 CSS 를 지우므로 스타일은 태그 안에 직접 씁니다.
// 지원 범위는 블로그 글에 실제로 쓰는 것만 — 제목·문단·목록·인용·굵게·구분선.
// ============================================================================
const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

export function toNaverHtml(md) {
  const out = [];
  let list = null;
  const flush = () => { if (list) { out.push(`</${list}>`); list = null; } };
  const inline = (t) => esc(t)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/`(.+?)`/g, '<code style="background:#f4f4f4;padding:1px 4px;">$1</code>');

  for (const raw of String(md ?? '').split(/\r?\n/)) {
    const line = raw.trimEnd();
    if (!line.trim()) { flush(); continue; }

    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      flush();
      const size = [26, 22, 19, 17][h[1].length - 1];
      out.push(`<p style="font-size:${size}px;font-weight:700;margin:26px 0 10px;line-height:1.45;">${inline(h[2])}</p>`);
      continue;
    }
    if (/^>\s?/.test(line)) {
      flush();
      out.push(`<p style="margin:14px 0;padding:12px 16px;background:#f7f8fa;color:#444;font-size:15px;line-height:1.75;">${inline(line.replace(/^>\s?/, ''))}</p>`);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      if (list !== 'ul') { flush(); out.push('<ul style="margin:12px 0 12px 18px;">'); list = 'ul'; }
      out.push(`<li style="margin:6px 0;font-size:16px;line-height:1.8;">${inline(line.replace(/^[-*]\s+/, ''))}</li>`);
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      if (list !== 'ol') { flush(); out.push('<ol style="margin:12px 0 12px 18px;">'); list = 'ol'; }
      out.push(`<li style="margin:6px 0;font-size:16px;line-height:1.8;">${inline(line.replace(/^\d+\.\s+/, ''))}</li>`);
      continue;
    }
    if (/^---+$/.test(line)) { flush(); out.push('<p style="margin:22px 0;color:#ccc;">— — —</p>'); continue; }
    flush();
    out.push(`<p style="margin:12px 0;font-size:16px;line-height:1.85;">${inline(line)}</p>`);
  }
  flush();
  return out.join('\n');
}
