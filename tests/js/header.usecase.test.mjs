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
    location: { hash: '#articles' }
  },
  console
};
vm.createContext(context);

loadScript(context, 'scripts/header/domain/header.domain.js');
loadScript(context, 'scripts/header/application/init-header-menu.usecase.js');

const domain = context.window.SiteAdvogadaHeaderDomain;
const useCaseFactory = context.window.SiteAdvogadaInitHeaderMenuUseCase;
const useCase = useCaseFactory.createInitHeaderMenuUseCase({ domain });
const plan = useCase.buildPlan();

assertTrue(plan.selectors.menuToggle === '.menu-toggle', 'header usecase should expose menu selector');
assertTrue(plan.selectors.siteMenu === '.site-menu', 'header usecase should expose site menu selector');
assertTrue(plan.queries.mobileMenu === '(max-width: 47.99em)', 'header usecase should expose mobile query');
assertTrue(plan.scrollOffset === 100, 'header usecase should expose scroll offset');
assertTrue(plan.shouldAdjustArticlesHash() === true, 'header usecase should evaluate hash behavior from domain');

console.log('PASS: header.usecase.test.mjs');
