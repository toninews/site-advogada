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

const context = { window: {}, console };
vm.createContext(context);

loadScript(context, 'scripts/about/domain/about.domain.js');
loadScript(context, 'scripts/about/application/init-about-reveal.usecase.js');

const domain = context.window.SiteAdvogadaAboutDomain;
const useCaseFactory = context.window.SiteAdvogadaInitAboutRevealUseCase;
const useCase = useCaseFactory.createInitAboutRevealUseCase({ domain });

const plan = useCase.buildRevealPlan();
assertTrue(plan.selector === '.hidden', 'about usecase should expose reveal selector');
assertTrue(plan.className === 'show', 'about usecase should expose reveal class');
assertTrue(plan.observerOptions.threshold === 0, 'about usecase should expose observer options');

console.log('PASS: about.usecase.test.mjs');
