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

loadScript(context, 'scripts/services/domain/services.domain.js');
loadScript(context, 'scripts/services/application/init-services.usecase.js');

const domain = context.window.SiteAdvogadaServicesDomain;
const useCaseFactory = context.window.SiteAdvogadaInitServicesUseCase;
const useCase = useCaseFactory.createInitServicesUseCase({ domain });

const plan = useCase.buildInitPlan();
assertTrue(plan.skipAnimation === false, 'usecase should reflect domain reduced-motion decision');
assertTrue(plan.observerOptions.threshold === 0.22, 'usecase should expose observer options from domain');

console.log('PASS: services.usecase.test.mjs');
