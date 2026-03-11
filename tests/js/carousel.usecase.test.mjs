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

loadScript(context, 'scripts/carousel/domain/carousel.domain.js');
loadScript(context, 'scripts/carousel/application/init-carousel.usecase.js');

const domain = context.window.SiteAdvogadaCarouselDomain;
const useCaseFactory = context.window.SiteAdvogadaInitCarouselUseCase;
const useCase = useCaseFactory.createInitCarouselUseCase({ domain });

const plan = useCase.buildPlan();
assertTrue(plan.autoplayDelayMs === 3000, 'carousel usecase should expose autoplay delay');
assertTrue(plan.warmupDelayMs === 240, 'carousel usecase should expose warmup delay');
assertTrue(plan.idleWarmupTimeoutMs === 1200, 'carousel usecase should expose idle warmup timeout');
assertTrue(plan.normalizeIndex(-1, 4) === 3, 'carousel usecase should delegate normalizeIndex');
assertTrue(plan.indicatorTransform(1) === 'translateX(calc(1 * var(--pagination-step)))', 'carousel usecase should delegate transform builder');

console.log('PASS: carousel.usecase.test.mjs');
