// Gera os PDFs da documentação a partir dos .md (Chromium headless via Playwright).
// Uso: node docs/gen-pdf.mjs [tecnica|guia|comercial|all]
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { chromium } from '@playwright/test';

const DOCS = dirname(fileURLToPath(import.meta.url));

// Conjuntos: cada PDF é a concatenação dos .md na ordem indicada.
const SETS = {
  tecnica: {
    out: 'documentacao-tecnica-aurora.pdf',
    title: 'Documentação Técnica — Aurora',
    files: [
      'documentacao-tecnica/README.md',
      'documentacao-tecnica/autenticacao-rbac.md',
      'documentacao-tecnica/api-reference.md',
      'documentacao-tecnica/comportamentos-e-limitacoes.md',
    ],
  },
  guia: {
    out: 'guia-usuario-aurora.pdf',
    title: 'Guia do Usuário — Aurora',
    files: ['guia-usuario-aurora.md'],
  },
  comercial: {
    out: 'apresentacao-comercial-aurora.pdf',
    title: 'Apresentação Comercial — Aurora',
    files: ['apresentacao-comercial-aurora.md'],
  },
  cobertura: {
    out: 'relatorio-cobertura-testes-aurora.pdf',
    title: 'Relatório de Cobertura de Testes — Aurora',
    files: ['relatorio-cobertura-testes-aurora.md'],
  },
  'apresentacao-qualidade': {
    out: 'apresentacao-qualidade-aurora.pdf',
    title: 'Apresentação — Qualidade e Cobertura do Aurora',
    files: ['apresentacao-qualidade-aurora.md'],
  },
};

const CSS = `
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
         color: #1a1a1a; line-height: 1.55; font-size: 12px; }
  h1 { font-size: 22px; border-bottom: 2px solid #2563eb; padding-bottom: 6px; margin-top: 0; }
  h1:not(:first-child) { page-break-before: always; }
  h2 { font-size: 17px; margin-top: 1.6em; color: #1e3a8a; }
  h3 { font-size: 14px; margin-top: 1.2em; }
  code { font-family: "SFMono-Regular", Menlo, Consolas, monospace; font-size: 11px;
         background: #f1f5f9; padding: 1px 4px; border-radius: 3px; }
  pre { background: #0f172a; color: #e2e8f0; padding: 12px; border-radius: 6px; overflow-x: auto; }
  pre code { background: none; color: inherit; padding: 0; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; }
  th, td { border: 1px solid #cbd5e1; padding: 6px 9px; text-align: left; font-size: 11px; }
  th { background: #f1f5f9; }
  blockquote { border-left: 4px solid #93c5fd; margin: 1em 0; padding: 4px 14px; color: #475569; background: #f8fafc; }
  a { color: #2563eb; text-decoration: none; }
  img { max-width: 100%; }
`;

async function build(key) {
  const set = SETS[key];
  if (!set) throw new Error(`conjunto desconhecido: ${key}`);
  const md = set.files.map((f) => readFileSync(join(DOCS, f), 'utf8')).join('\n\n');
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
    <title>${set.title}</title><style>${CSS}</style></head><body>${marked.parse(md)}</body></html>`;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  // Nota: o conjunto "guia" usa imagens com caminho relativo (img/*.png). Para
  // regenerá-lo, grave o HTML dentro de docs/guia-usuario/ e use page.goto(file://).
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.pdf({ path: join(DOCS, set.out), format: 'A4', printBackground: true });
  await browser.close();
  console.log(`✓ ${set.out}`);
}

const target = process.argv[2] || 'all';
const keys = target === 'all' ? Object.keys(SETS) : [target];
for (const k of keys) await build(k);
