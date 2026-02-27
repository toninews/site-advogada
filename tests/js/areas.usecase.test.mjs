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

loadScript(context, 'scripts/areas/domain/areas.domain.js');
loadScript(context, 'scripts/areas/application/init-areas-feedback.usecase.js');

const domain = context.window.SiteAdvogadaAreasDomain;
const useCaseFactory = context.window.SiteAdvogadaInitAreasFeedbackUseCase;
const useCase = useCaseFactory.createInitAreasFeedbackUseCase({ domain });

const state = useCase.createFeedbackState();
assertTrue(state.clearDelayMs === 5200, 'usecase should expose clear delay from domain');
assertTrue(String(state.message).length > 20, 'usecase should expose feedback message from domain');

console.log('PASS: areas.usecase.test.mjs');
