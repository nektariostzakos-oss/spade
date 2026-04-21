/*
 * k6 load test for the feed endpoint.
 * Goal: 500 RPS, p95 < 200ms (per CLAUDE_BRIEF.md Phase 7).
 *
 *   k6 run infra/k6/feed.js \
 *     -e API_URL=https://api.toolbox.dev
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    ramp: {
      executor: 'ramping-arrival-rate',
      startRate: 50,
      timeUnit: '1s',
      preAllocatedVUs: 200,
      maxVUs: 1000,
      stages: [
        { target: 100, duration: '30s' },
        { target: 500, duration: '1m' },
        { target: 500, duration: '3m' },
        { target: 0, duration: '30s' },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<200', 'p(99)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE = __ENV.API_URL || 'http://localhost:4000';

export default function () {
  const res = http.get(`${BASE}/v1/feed?limit=10`);
  check(res, {
    'status 200': (r) => r.status === 200,
    'body has items': (r) => typeof r.body === 'string' && r.body.includes('"items"'),
  });
  sleep(Math.random() * 0.1);
}
