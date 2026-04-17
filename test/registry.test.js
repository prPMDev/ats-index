import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadRegistry, searchRegistry } from '../src/registry.js';

describe('loadRegistry', () => {
  test('loads a single ATS as an array', async () => {
    const companies = await loadRegistry('greenhouse');
    assert.ok(Array.isArray(companies), 'should return an array');
    assert.ok(companies.length > 0, 'greenhouse registry should not be empty');
  });

  test('each entry has slug and name', async () => {
    const companies = await loadRegistry('greenhouse');
    for (const c of companies) {
      assert.ok(c.slug, `missing slug: ${JSON.stringify(c)}`);
      assert.ok(c.name, `missing name: ${JSON.stringify(c)}`);
    }
  });

  test('returns empty array for unknown ATS', async () => {
    const companies = await loadRegistry('nonexistent-ats');
    assert.deepEqual(companies, []);
  });

  test('loads all ATS platforms when called with no arg', async () => {
    const all = await loadRegistry();
    assert.ok(all.greenhouse, 'greenhouse key present');
    assert.ok(all.lever, 'lever key present');
    assert.ok(all.ashby, 'ashby key present');
    assert.ok(Array.isArray(all.greenhouse));
  });
});

describe('searchRegistry', () => {
  test('finds by company name (case-insensitive)', async () => {
    const all = await loadRegistry();
    const firstCompany = all.greenhouse[0];
    const results = await searchRegistry(firstCompany.name.toUpperCase());
    assert.ok(results.some(r => r.slug === firstCompany.slug));
  });

  test('attaches ats field to each result', async () => {
    const all = await loadRegistry();
    const someName = all.greenhouse[0].name;
    const results = await searchRegistry(someName);
    for (const r of results) {
      assert.ok(['greenhouse', 'lever', 'ashby'].includes(r.ats));
    }
  });

  test('returns empty array when nothing matches', async () => {
    const results = await searchRegistry('zzzz-no-such-company-zzzz');
    assert.deepEqual(results, []);
  });
});
