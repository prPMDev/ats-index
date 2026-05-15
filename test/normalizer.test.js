import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { stripHtml, jobId, normalize } from '../src/normalizer.js';

describe('stripHtml', () => {
  test('removes basic tags', () => {
    assert.equal(stripHtml('<p>Hello <strong>world</strong></p>'), 'Hello world');
  });

  test('converts <li> to markdown bullets', () => {
    const input = '<ul><li>First</li><li>Second</li></ul>';
    assert.match(stripHtml(input), /- First/);
    assert.match(stripHtml(input), /- Second/);
  });

  test('decodes common HTML entities', () => {
    assert.equal(stripHtml('Tom &amp; Jerry'), 'Tom & Jerry');
    assert.equal(stripHtml('a &lt; b'), 'a < b');
  });

  test('handles empty input', () => {
    assert.equal(stripHtml(''), '');
    assert.equal(stripHtml(null), '');
  });
});

describe('jobId', () => {
  test('is deterministic for same inputs', () => {
    const a = jobId('stripe', 'Senior PM', 'greenhouse');
    const b = jobId('stripe', 'Senior PM', 'greenhouse');
    assert.equal(a, b);
  });

  test('differs when any field differs', () => {
    const base = jobId('stripe', 'Senior PM', 'greenhouse');
    assert.notEqual(base, jobId('stripe', 'Staff PM', 'greenhouse'));
    assert.notEqual(base, jobId('stripe', 'Senior PM', 'lever'));
  });

  test('is case-insensitive', () => {
    assert.equal(
      jobId('Stripe', 'Senior PM', 'greenhouse'),
      jobId('stripe', 'senior pm', 'greenhouse')
    );
  });

  test('distinguishes the same role across offices (issue #17)', () => {
    const sf = jobId('brex', 'Group Product Manager', 'greenhouse', 'San Francisco');
    const sea = jobId('brex', 'Group Product Manager', 'greenhouse', 'Seattle');
    const ny = jobId('brex', 'Group Product Manager', 'greenhouse', 'New York');
    assert.notEqual(sf, sea);
    assert.notEqual(sf, ny);
    assert.notEqual(sea, ny);
  });

  test('still deterministic with location', () => {
    assert.equal(
      jobId('brex', 'GPM', 'greenhouse', 'Remote - US'),
      jobId('brex', 'GPM', 'greenhouse', 'Remote - US')
    );
  });
});

describe('normalize', () => {
  test('maps a minimal raw job to the unified schema', () => {
    const raw = {
      company: 'stripe',
      title: 'Senior PM',
      location: 'Remote - US',
      description: '<p>Build things.</p>',
      url: 'https://boards.greenhouse.io/stripe/jobs/123',
    };
    const job = normalize(raw, 'greenhouse');

    assert.equal(job.company, 'stripe');
    assert.equal(job.title, 'Senior PM');
    assert.equal(job.ats, 'greenhouse');
    assert.equal(job.description, 'Build things.');
    assert.equal(job.status, 'open');
    assert.ok(job.id, 'id should be generated');
    assert.ok(job.firstSeen, 'firstSeen should be set');
  });

  test('detects remote locationType', () => {
    const job = normalize({ title: 'x', location: 'Remote - US' }, 'greenhouse');
    assert.equal(job.locationType, 'remote');
  });

  test('extracts salary from description text when no structured field', () => {
    const raw = {
      title: 'x',
      description: 'Range is $150,000 - $200,000 based on location.',
    };
    const job = normalize(raw, 'greenhouse');
    assert.deepEqual(job.salary, { min: 150000, max: 200000, currency: 'USD' });
  });

  test('returns null salary when nothing matches', () => {
    const job = normalize({ title: 'x', description: 'no dollars here' }, 'greenhouse');
    assert.equal(job.salary, null);
  });
});
