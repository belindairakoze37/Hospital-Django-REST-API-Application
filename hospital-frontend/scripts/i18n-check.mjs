#!/usr/bin/env node
/**
 * i18n:check — compares every language file against the primary language
 * (English) and fails when a key is missing, extra, or duplicated.
 *
 * Usage:
 *   npm run i18n:check               # fail on missing/extra keys
 *   npm run i18n:check -- --strict   # also fail on statically unused keys
 *   npm run i18n:check -- --verbose  # list values still identical to English
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '..');
const srcRoot = path.join(projectRoot, 'src');
const i18nEntry = path.join(srcRoot, 'i18n', 'translations.js');

const args = process.argv.slice(2);
const strictUnused = args.includes('--strict');
const verbose = args.includes('--verbose');

const RED = '\u001b[31m';
const GREEN = '\u001b[32m';
const YELLOW = '\u001b[33m';
const DIM = '\u001b[2m';
const RESET = '\u001b[0m';

/* 1. Load the merged translation store ------------------------------ */
let store;
try {
  const mod = await import(pathToFileURL(i18nEntry).href);
  store = mod.translations;
} catch (error) {
  console.error(`${RED}x Could not load ${i18nEntry}${RESET}`);
  console.error(error.message);
  process.exit(1);
}

const languages = Object.keys(store);
const primary = languages.includes('English') ? 'English' : languages[0];
const primaryKeys = Object.keys(store[primary]).sort();

console.log(`\ni18n:check - primary language "${primary}" (${primaryKeys.length} keys)`);
console.log(`languages: ${languages.join(', ')}\n`);

/* 2. Duplicate keys inside a language block ------------------------- */
const sourceFiles = ['translations.js', 'appTranslations.js', 'queueTranslations.js', 'publicTranslations.js']
  .map((name) => path.join(srcRoot, 'i18n', name))
  .filter((file) => fs.existsSync(file));

const duplicates = [];
for (const file of sourceFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const blockRe = /^\s{2}(\w+):\s*\{/gm;
  const blocks = [];
  let match;
  while ((match = blockRe.exec(source))) blocks.push({ name: match[1], start: match.index });

  blocks.forEach((block, index) => {
    const end = index + 1 < blocks.length ? blocks[index + 1].start : source.length;
    const body = source.slice(block.start, end);
    const keys = [...body.matchAll(/^\s{4}(\w+):/gm)].map((m) => m[1]);
    const seen = new Set();
    for (const key of keys) {
      if (seen.has(key)) duplicates.push(`${path.basename(file)} > ${block.name} > ${key}`);
      seen.add(key);
    }
  });
}

/* 3. Compare every language with the primary one -------------------- */
let failures = 0;
const report = [];

for (const language of languages) {
  const dictionary = store[language];
  const keys = Object.keys(dictionary);
  const missing = primaryKeys.filter((key) => !(key in dictionary));
  const extra = keys.filter((key) => !(key in store[primary]));
  const identical =
    language === primary ? [] : primaryKeys.filter((key) => dictionary[key] === store[primary][key]);

  report.push({ language, total: keys.length, missing, extra, identical });
  if (missing.length || extra.length) failures += 1;
}

console.log('Per-language comparison');
console.log(DIM + '-'.repeat(72) + RESET);
for (const row of report) {
  const ok = !row.missing.length && !row.extra.length;
  const mark = ok ? `${GREEN}OK ${RESET}` : `${RED}!! ${RESET}`;
  console.log(
    `${mark}${row.language.padEnd(12)} keys=${String(row.total).padStart(4)}  ` +
      `missing=${row.missing.length}  extra=${row.extra.length}  sameAsEnglish=${row.identical.length}`
  );
  if (row.missing.length) console.log(`   ${RED}missing:${RESET} ${row.missing.join(', ')}`);
  if (row.extra.length) console.log(`   ${RED}extra:${RESET}   ${row.extra.join(', ')}`);
  if (verbose && row.identical.length) {
    console.log(`   ${DIM}sameAsEnglish: ${row.identical.join(', ')}${RESET}`);
  }
}

/* 4. Statically unused keys (best effort - dynamic lookups exist) --- */
const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.jsx?$/.test(entry.name)) files.push(full);
  }
})(srcRoot);

const used = new Set();
const usageSources = [];
for (const file of files) {
  // The translation modules themselves mention every key; skip them.
  if (file.includes(`${path.sep}i18n${path.sep}`)) continue;
  usageSources.push(fs.readFileSync(file, 'utf8'));
}
const usageBlob = usageSources.join('\n');

// A key counts as used when it appears as a quoted literal anywhere in the app
// (t('key'), { title: 'key' }, labelKey: 'key', ...). Plural variants such as
// `patientsAhead_other` are resolved from the base key at runtime.
for (const key of primaryKeys) {
  if (usageBlob.includes(`'${key}'`) || usageBlob.includes(`"${key}"`) || usageBlob.includes(`\`${key}\``)) {
    used.add(key);
    continue;
  }
  const base = key.replace(/_(zero|one|two|few|many|other)$/, '');
  if (base !== key && (usageBlob.includes(`'${base}'`) || usageBlob.includes(`"${base}"`))) {
    used.add(key);
  }
}

// Keys assembled from a prefix (e.g. `apiError${PascalCase}`) are resolved
// dynamically from backend codes, so they never appear as literals.
const DYNAMIC_PREFIXES = ['apiError'];
const isDynamic = (key) => DYNAMIC_PREFIXES.some((prefix) => key.startsWith(prefix));

const unused = primaryKeys.filter((key) => !used.has(key) && !isDynamic(key));
if (unused.length) {
  console.log(
    `\n${YELLOW}warn: ${unused.length} key(s) not found by the static scan${RESET} ` +
      `${DIM}(may be resolved dynamically - review before deleting)${RESET}`
  );
  console.log(`   ${unused.join(', ')}`);
  if (strictUnused) failures += 1;
}

/* 5. Duplicate keys ------------------------------------------------- */
if (duplicates.length) {
  console.log(`\n${RED}duplicate keys found:${RESET}`);
  duplicates.forEach((entry) => console.log(`   ${entry}`));
  failures += 1;
}

/* 6. Result --------------------------------------------------------- */
console.log('');
if (failures) {
  console.error(`${RED}i18n:check failed (${failures} problem group(s))${RESET}\n`);
  process.exit(1);
}
console.log(
  `${GREEN}i18n:check passed - all ${languages.length} languages share ${primaryKeys.length} keys${RESET}\n`
);
