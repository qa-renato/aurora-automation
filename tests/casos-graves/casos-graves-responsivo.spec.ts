import { test, expect } from '../../fixtures/test-fixtures';
import { CasosGravesPage, KPIS } from '../../pages/CasosGravesPage';

// Guard responsivo do painel "Gerenciar Casos" (/casos-graves) — Lote 7.
// BUG #686: em larguras intermediárias (~768–960px) os cards de KPI ficam
// estreitos e, com `overflow: visible`, o rótulo TRANSBORDA do card e colide
// com o vizinho ("AGUARDANDO"+"EM", "CONCLUÍDOS"+"ARQUIVA"). No desktop
// (1280px) não ocorre.

test.describe('Casos Graves — responsividade do painel Gerenciar Casos', () => {
  // REGRESSÃO #686 — CORRIGIDO (verificado deployado no sandbox em 2026-06-13;
  // fix inbot-monorepo #135). A ~820px nenhum rótulo de KPI deve transbordar seu
  // card. Antes os 5 rótulos tinham scrollWidth > clientWidth (overflow:visible).
  // Travado como teste PASSANTE — se regredir, falha.
  test('R686 — a ~820px os rótulos de KPI não devem transbordar o card [regressão #686]', async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 900 });
    const cg = new CasosGravesPage(page);
    await cg.navigate();
    await cg.abrirGestao();

    // mede, para cada KPI, se o texto do rótulo extrapola a própria caixa
    const overflows = await page.evaluate((kpis) => {
      const out: { k: string; overflow: number }[] = [];
      for (const k of kpis) {
        const el = [...document.querySelectorAll('*')].find(
          (e) => e.children.length === 0 && new RegExp('^' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test((e.textContent || '').trim()),
        ) as HTMLElement | undefined;
        if (el) out.push({ k, overflow: el.scrollWidth - el.clientWidth });
      }
      return out;
    }, KPIS as unknown as string[]);

    expect(overflows.length, 'rótulos de KPI encontrados').toBeGreaterThan(0);
    // comportamento correto: nenhum rótulo transborda (overflow <= tolerância)
    const transbordando = overflows.filter((o) => o.overflow > 2);
    expect(transbordando, `KPIs transbordando: ${JSON.stringify(transbordando)}`).toHaveLength(0);
  });
});
