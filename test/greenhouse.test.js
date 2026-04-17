import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { fetchGreenhouse } from '../src/adapters/greenhouse.js';

/**
 * Why we mock fetch in adapter tests:
 *   - Real API calls are slow (hundreds of ms each)
 *   - They depend on the company still existing + still posting jobs
 *   - They fail offline, in CI, and when Greenhouse rate-limits
 *
 * Node 22's fetch is a global, so we override it per-test using
 * t.mock.method(). It auto-restores after the test. No afterEach needed.
 */

const FIXTURE = {
  name: 'Test Company',
  jobs: [
    {
      id: 12345,
      internal_job_id: 67890,
      title: 'Senior Product Manager',
      updated_at: '2026-03-01T12:00:00Z',
      absolute_url: 'https://boards.greenhouse.io/testco/jobs/12345',
      location: { name: 'Remote - US' },
      departments: [{ name: 'Product' }, { name: 'Growth' }],
      offices: [{ name: 'San Francisco' }],
      content: '<p>Build cool things. Salary: $150,000 - $200,000.</p>',
    },
  ],
};

function mockFetch(t, { status = 200, body = FIXTURE } = {}) {
  t.mock.method(global, 'fetch', async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }));
}

describe('fetchGreenhouse', () => {
  test('hits the correct URL', async (t) => {
    const calls = [];
    t.mock.method(global, 'fetch', async (url) => {
      calls.push(url);
      return { ok: true, status: 200, json: async () => FIXTURE };
    });

    await fetchGreenhouse('testco');

    assert.equal(calls.length, 1);
    assert.match(calls[0], /boards-api\.greenhouse\.io\/v1\/boards\/testco\/jobs\?content=true/);
  });

  test('returns [] on 404 (company not found)', async (t) => {
    mockFetch(t, { status: 404, body: {} });
    const jobs = await fetchGreenhouse('nonexistent');
    assert.deepEqual(jobs, []);
  });

  test('throws on non-404 error', async (t) => {
    mockFetch(t, { status: 500, body: {} });
    await assert.rejects(
      () => fetchGreenhouse('testco'),
      /Greenhouse API error for testco: 500/
    );
  });

  test('maps a job to the unified schema', async (t) => {
    mockFetch(t);
    const jobs = await fetchGreenhouse('testco');

    assert.equal(jobs.length, 1);
    const job = jobs[0];

    assert.equal(job.title, 'Senior Product Manager');
    assert.equal(job.company, 'Test Company');
    assert.equal(job.companySlug, 'testco');
    assert.equal(job.ats, 'greenhouse');
    assert.equal(job.department, 'Product');
    assert.equal(job.location, 'Remote - US');
    assert.equal(job.locationType, 'remote');
    assert.equal(job.url, 'https://boards.greenhouse.io/testco/jobs/12345');
    assert.equal(job.postedAt, '2026-03-01T12:00:00Z');
  });

  test('extracts salary from description text', async (t) => {
    mockFetch(t);
    const [job] = await fetchGreenhouse('testco');
    assert.deepEqual(job.salary, { min: 150000, max: 200000, currency: 'USD' });
  });

  test('preserves departments and offices in metadata', async (t) => {
    mockFetch(t);
    const [job] = await fetchGreenhouse('testco');
    assert.deepEqual(job.metadata.departments, ['Product', 'Growth']);
    assert.deepEqual(job.metadata.offices, ['San Francisco']);
    assert.equal(job.metadata.greenhouseId, 12345);
  });

  test('handles empty jobs array', async (t) => {
    mockFetch(t, { body: { name: 'Empty Co', jobs: [] } });
    const jobs = await fetchGreenhouse('emptyco');
    assert.deepEqual(jobs, []);
  });
});
