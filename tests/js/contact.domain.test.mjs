import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

function assertTrue(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

const context = { window: {}, console };
vm.createContext(context);

const sourcePath = path.join(process.cwd(), 'scripts/contact/domain/contact.domain.js');
vm.runInContext(fs.readFileSync(sourcePath, 'utf8'), context, { filename: sourcePath });

const domain = context.window.SiteAdvogadaContactDomain;
assertTrue(Boolean(domain), 'contact domain should be registered globally');
assertTrue(domain.normalizePhone('(47) 99999-1234') === '47999991234', 'normalizePhone should keep only digits');
assertTrue(domain.formatPhone('47999991234') === '(47) 99999-1234', 'formatPhone should format 11-digit phone');

const invalid = domain.validatePayload({ name: 'A', phone: '47999', email: 'a@a.com', area: 'Outro', message: 'x' });
assertTrue(!invalid.valid && invalid.code === 'CONTACT_PHONE_INVALID', 'validatePayload should reject invalid phone');

const valid = domain.validatePayload({ name: 'A', phone: '(47) 99999-1234', email: 'a@a.com', area: 'Outro', message: 'x' });
assertTrue(valid.valid, 'validatePayload should accept valid payload');

console.log('PASS: contact.domain.test.mjs');
