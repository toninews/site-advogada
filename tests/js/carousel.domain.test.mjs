import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

function assertTrue(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

const context = { window: {}, console };
vm.createContext(context);

const sourcePath = path.join(process.cwd(), 'scripts/carousel/domain/carousel.domain.js');
vm.runInContext(fs.readFileSync(sourcePath, 'utf8'), context, { filename: sourcePath });

const domain = context.window.SiteAdvogadaCarouselDomain;
assertTrue(Boolean(domain), 'carousel domain should be registered globally');
assertTrue(domain.getAutoplayDelayMs() === 6500, 'carousel autoplay delay should be 6500ms');
assertTrue(domain.normalizeIndex(5, 4) === 1, 'normalizeIndex should wrap forward indexes');
assertTrue(domain.normalizeIndex(-1, 4) === 3, 'normalizeIndex should wrap backward indexes');
assertTrue(domain.getWarmupDelayMs() === 240, 'carousel warmup delay should be 240ms');
assertTrue(domain.getIdleWarmupTimeoutMs() === 1200, 'carousel idle timeout should be 1200ms');
assertTrue(domain.buildIndicatorTransform(2) === 'translateX(calc(2 * var(--pagination-step)))', 'indicator transform should match expected format');

console.log('PASS: carousel.domain.test.mjs');
