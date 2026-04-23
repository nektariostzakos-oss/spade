/*
 * k6 load test for the lead-routing endpoint.
 *   k6 run infra/k6/lead-routing.js \
 *     -e API_URL=https://api.toolbox.dev \
 *     -e CLERK_JWT=...
 */
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 50,
  duration: '2m',
  thresholds: {
    http_req_duration: ['p(95)<800'],
    http_req_failed: ['rate<0.02'],
  },
};

const BASE = __ENV.API_URL || 'http://localhost:4000';
const TOKEN = __ENV.CLERK_JWT;

const payload = JSON.stringify({
  description: 'Kitchen sink is leaking under the cabinet, started yesterday.',
  photos: [],
  trade: 'PLUMBING',
  urgency: 'HIGH',
  locationLat: 33.96,
  locationLng: -83.37,
});

export default function () {
  const res = http.post(`${BASE}/v1/jobs`, payload, {
    headers: {
      'content-type': 'application/json',
      ...(TOKEN ? { authorization: `Bearer ${TOKEN}` } : {}),
    },
  });
  check(res, { 'status 2xx': (r) => r.status >= 200 && r.status < 300 });
}
