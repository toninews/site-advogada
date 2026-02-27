import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

function assertTrue(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

const context = { window: {}, console };
vm.createContext(context);

const sourcePath = path.join(process.cwd(), 'scripts/history/domain/history.domain.js');
vm.runInContext(fs.readFileSync(sourcePath, 'utf8'), context, { filename: sourcePath });

const domain = context.window.SiteAdvogadaHistoryDomain;
assertTrue(Boolean(domain), 'history domain should be registered globally');
assertTrue(domain.MOBILE_MAX_WIDTH === 980, 'history mobile max width should be 980');
assertTrue(domain.DESKTOP_MIN_WIDTH === 981, 'history desktop min width should be 981');
assertTrue(domain.getObserverOptions().threshold === 0.2, 'history observer threshold should be 0.2');

const mobileWin = { matchMedia: () => ({ matches: true }) };
const desktopWin = { matchMedia: () => ({ matches: true }) };
assertTrue(domain.isMobileViewport(mobileWin) === true, 'history should identify mobile viewport');
assertTrue(domain.isDesktopViewport(desktopWin) === true, 'history should identify desktop viewport');

console.log('PASS: history.domain.test.mjs');
