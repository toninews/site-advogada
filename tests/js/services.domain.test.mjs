import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

function assertTrue(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

const context = { window: {}, console };
vm.createContext(context);

const sourcePath = path.join(process.cwd(), 'scripts/services/domain/services.domain.js');
vm.runInContext(fs.readFileSync(sourcePath, 'utf8'), context, { filename: sourcePath });

const domain = context.window.SiteAdvogadaServicesDomain;
assertTrue(Boolean(domain), 'services domain should be registered globally');

const winReduced = { matchMedia: () => ({ matches: true }) };
const winNormal = { matchMedia: () => ({ matches: false }) };
assertTrue(domain.shouldSkipAnimation(winReduced) === true, 'shouldSkipAnimation should respect reduced motion');
assertTrue(domain.shouldSkipAnimation(winNormal) === false, 'shouldSkipAnimation should allow animation when not reduced');

const options = domain.getObserverOptions();
assertTrue(options.threshold === 0.22, 'observer threshold should match expected value');
assertTrue(options.rootMargin === '0px 0px -10% 0px', 'observer rootMargin should match expected value');

console.log('PASS: services.domain.test.mjs');
