/* Lightweight Markdown → HTML (safe subset for research reports) */

function renderMarkdown(text) {
  if (!text) return "";

  const normalizedText = window.formatDisplayText ? window.formatDisplayText(text) : text;
  const lines = String(normalizedText).replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) { html.push("</ul>"); inUl = false; }
    if (inOl) { html.push("</ol>"); inOl = false; }
  };

  const inline = (s) =>
    esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>')
      .replace(/\[(\d+)\]/g, '<sup class="md-ref">[$1]</sup>')
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>',
      );

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (!line.trim()) {
      closeLists();
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      closeLists();
      html.push('<hr class="md-hr" />');
      continue;
    }

    const h4 = line.match(/^####\s+(.+)/);
    if (h4) {
      closeLists();
      html.push(`<h4 class="md-h4">${inline(h4[1])}</h4>`);
      continue;
    }

    const h3 = line.match(/^###\s+(.+)/);
    if (h3) {
      closeLists();
      html.push(`<h3 class="md-h3">${inline(h3[1])}</h3>`);
      continue;
    }

    const h2 = line.match(/^##\s+(.+)/);
    if (h2) {
      closeLists();
      html.push(`<h2 class="md-h2">${inline(h2[1])}</h2>`);
      continue;
    }

    const ul = line.match(/^[-*]\s+(.+)/);
    if (ul) {
      if (inOl) { html.push("</ol>"); inOl = false; }
      if (!inUl) { html.push('<ul class="md-ul">'); inUl = true; }
      html.push(`<li>${inline(ul[1])}</li>`);
      continue;
    }

    const ol = line.match(/^\d+\.\s+(.+)/);
    if (ol) {
      if (inUl) { html.push("</ul>"); inUl = false; }
      if (!inOl) { html.push('<ol class="md-ol">'); inOl = true; }
      html.push(`<li>${inline(ol[1])}</li>`);
      continue;
    }

    closeLists();
    html.push(`<p class="md-p">${inline(line)}</p>`);
  }

  closeLists();
  return html.join("\n");
}

function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

window.renderMarkdown = renderMarkdown;
