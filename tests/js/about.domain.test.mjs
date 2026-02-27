import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

function assertTrue(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

const context = { window: {}, console };
vm.createContext(context);

const sourcePath = path.join(process.cwd(), 'scripts/about/domain/about.domain.js');
vm.runInContext(fs.readFileSync(sourcePath, 'utf8'), context, { filename: sourcePath });

const domain = context.window.SiteAdvogadaAboutDomain;
assertTrue(Boolean(domain), 'about domain should be registered globally');
assertTrue(domain.getRevealSelector() === '.hidden', 'about reveal selector should target hidden elements');
assertTrue(domain.getRevealClassName() === 'show', 'about reveal class should be show');
assertTrue(domain.getObserverOptions().threshold === 0, 'about observer threshold should be zero');

console.log('PASS: about.domain.test.mjs');
