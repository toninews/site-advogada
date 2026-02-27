import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

function assertTrue(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

const context = { window: {}, console };
vm.createContext(context);

const sourcePath = path.join(process.cwd(), 'scripts/articles/domain/domain.error.js');
vm.runInContext(fs.readFileSync(sourcePath, 'utf8'), context, { filename: sourcePath });

const domainError = context.window.SiteAdvogadaDomainError;
assertTrue(Boolean(domainError), 'Domain error module should register globally');

const error = domainError.createDomainError('X_TEST', 'Teste', { status: 1 });
assertTrue(domainError.isDomainError(error), 'isDomainError should detect domain error instance');
assertTrue(error.code === 'X_TEST', 'Domain error should expose code');
assertTrue((error.details || {}).status === 1, 'Domain error should expose details');

console.log('PASS: domain.error.test.mjs');
