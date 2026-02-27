import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

function assertTrue(condition, message) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
}

const repoRoot = process.cwd();
const sourcePath = path.join(repoRoot, 'scripts/articles/domain/article.domain.js');
const source = fs.readFileSync(sourcePath, 'utf8');

const context = {
  window: {},
  console,
  CSS: { escape: (value) => String(value) }
};
vm.createContext(context);
vm.runInContext(source, context, { filename: sourcePath });

const domain = context.window.SiteAdvogadaArticlesDomain;
assertTrue(domain && typeof domain === 'object', 'domain should be registered on window');
assertTrue(domain.slugifyPath('Ação Trabalhista!') === 'acao-trabalhista', 'slugify should normalize accents and punctuation');
assertTrue(domain.pickMetric({ stats: { views: '11' } }, ['stats.views']) === 11, 'pickMetric should read nested values');
assertTrue(domain.pickCount({ data: { likes: 9 } }, 'likes') === 9, 'pickCount should read nested payload');

const model = domain.toCardModel({
  _id: 'id1',
  title: 'Titulo',
  slug: 'meu-slug',
  content: 'texto '.repeat(80),
  metrics: { views: 4 }
}, 0, {
  isPhpRuntime: true,
  apiBase: 'https://api.test',
  uploadsBase: 'https://api.test/uploads',
  readCachedMetrics: () => null
});

assertTrue(model.articleUrl.includes('article-detail.php?id=id1&slug=meu-slug'), 'toCardModel should build php article URL');
assertTrue(model.views === 4, 'toCardModel should map metric values');

console.log('PASS: articles.domain.test.mjs');
