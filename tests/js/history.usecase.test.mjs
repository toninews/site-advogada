import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

function assertTrue(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

function loadScript(context, relativePath) {
  const fullPath = path.join(process.cwd(), relativePath);
  const source = fs.readFileSync(fullPath, 'utf8');
  vm.runInContext(source, context, { filename: fullPath });
}

const context = {
  window: {
    matchMedia: () => ({ matches: false })
  },
  console
};
vm.createContext(context);

loadScript(context, 'scripts/history/domain/history.domain.js');
loadScript(context, 'scripts/history/application/init-history-reveal.usecase.js');

const domain = context.window.SiteAdvogadaHistoryDomain;
const useCaseFactory = context.window.SiteAdvogadaInitHistoryRevealUseCase;
const useCase = useCaseFactory.createInitHistoryRevealUseCase({ domain });

const plan = useCase.buildPlan();
assertTrue(plan.observerOptions.threshold === 0.2, 'history usecase should expose observer options');
assertTrue(typeof plan.shouldToggleCardOnClick === 'function', 'history usecase should expose click predicate');
assertTrue(typeof plan.shouldResetCardOnResize === 'function', 'history usecase should expose resize predicate');

console.log('PASS: history.usecase.test.mjs');
