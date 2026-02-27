import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

function assertTrue(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

const context = { window: {}, console };
vm.createContext(context);

const sourcePath = path.join(process.cwd(), 'scripts/areas/domain/areas.domain.js');
vm.runInContext(fs.readFileSync(sourcePath, 'utf8'), context, { filename: sourcePath });

const domain = context.window.SiteAdvogadaAreasDomain;
assertTrue(Boolean(domain), 'areas domain should be registered globally');
assertTrue(domain.getClearDelayMs() === 5200, 'areas clear delay should be 5200ms');
assertTrue(String(domain.getFeedbackMessage()).includes('Em breve teremos páginas completas'), 'areas feedback message should match expected copy');

console.log('PASS: areas.domain.test.mjs');
