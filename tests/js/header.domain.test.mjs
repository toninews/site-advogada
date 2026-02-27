import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

function assertTrue(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

const context = { window: {}, console };
vm.createContext(context);

const sourcePath = path.join(process.cwd(), 'scripts/header/domain/header.domain.js');
vm.runInContext(fs.readFileSync(sourcePath, 'utf8'), context, { filename: sourcePath });

const domain = context.window.SiteAdvogadaHeaderDomain;
assertTrue(Boolean(domain), 'header domain should be registered globally');

const fakeToggleOpen = { getAttribute: () => 'true' };
const fakeToggleClosed = { getAttribute: () => 'false' };
assertTrue(domain.isMenuOpen(fakeToggleOpen) === true, 'isMenuOpen should return true when aria-expanded is true');
assertTrue(domain.isMenuOpen(fakeToggleClosed) === false, 'isMenuOpen should return false when aria-expanded is false');
assertTrue(domain.getArticlesScrollOffset() === 100, 'header scroll offset should be 100');
assertTrue(domain.getMobileMenuQuery() === '(max-width: 47.99em)', 'mobile query should match expected value');

const winWithHash = { location: { hash: '#articles' } };
const winWithoutHash = { location: { hash: '#about' } };
assertTrue(domain.shouldAdjustArticlesHash(winWithHash) === true, 'shouldAdjustArticlesHash should detect #articles hash');
assertTrue(domain.shouldAdjustArticlesHash(winWithoutHash) === false, 'shouldAdjustArticlesHash should ignore other hashes');

console.log('PASS: header.domain.test.mjs');
