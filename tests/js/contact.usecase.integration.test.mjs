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

const context = { window: {}, console, setTimeout, clearTimeout };
vm.createContext(context);

loadScript(context, 'scripts/articles/domain/domain.error.js');
loadScript(context, 'scripts/contact/domain/contact.domain.js');
loadScript(context, 'scripts/contact/adapters/contact.repository.js');
loadScript(context, 'scripts/contact/application/submit-contact.usecase.js');

const domain = context.window.SiteAdvogadaContactDomain;
const domainError = context.window.SiteAdvogadaDomainError;
const repository = context.window.SiteAdvogadaContactRepository.createContactRepository({ delayMs: 0 });
const useCase = context.window.SiteAdvogadaSubmitContactUseCase.createSubmitContactUseCase({
  domain,
  repository,
  domainError
});

let failed = null;
try {
  await useCase.execute({
    name: 'Teste',
    phone: '123',
    email: 'mail@test.com',
    area: 'Outro',
    message: 'Teste'
  });
} catch (error) {
  failed = error;
}

assertTrue(Boolean(failed), 'usecase should throw on invalid payload');
assertTrue(domainError.isDomainError(failed), 'invalid payload should throw DomainError');
assertTrue(failed.code === 'CONTACT_PHONE_INVALID', 'invalid payload should use phone invalid code');

const ok = await useCase.execute({
  name: 'Teste',
  phone: '(47) 99999-1234',
  email: 'mail@test.com',
  area: 'Outro',
  message: 'Teste'
});

assertTrue(ok.ok === true, 'usecase should resolve ok on valid payload');
assertTrue(String(ok.message).includes('Mensagem simulada com sucesso'), 'usecase should return success message');

console.log('PASS: contact.usecase.integration.test.mjs');
