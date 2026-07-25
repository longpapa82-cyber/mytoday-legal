/**
 * add-analytics.mjs — Cloudflare Web Analytics beacon을 전 HTML 페이지 <head>에 일괄 삽입.
 *
 * - 쿠키리스(개인정보 무수집) → 동의 배너/개인정보처리방침 수정 불필요.
 * - SRI(integrity) 미적용: Cloudflare가 beacon.min.js를 무중단 자동 갱신하므로
 *   해시를 고정하면 갱신 시점에 로딩이 차단되어 측정이 멈춤(Cloudflare 공식 권장 방식).
 *   안전장치는 defer + 쿠키리스(유출 개인정보 없음) + 신뢰 도메인 고정으로 대체.
 * - 멱등성: 이미 삽입된 파일은 건너뜀. 재실행 안전.
 * - 실제 토큰 발급 후: e1a2a20fc07f46f3ab8fa57bd2282efc 를 실토큰으로 치환하거나
 *   이 파일 상단 TOKEN 상수를 바꿔 재실행(기존 삽입분은 skip되므로, 치환은 별도).
 *
 * 사용: node add-analytics.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const TOKEN = 'e1a2a20fc07f46f3ab8fa57bd2282efc'; // 실제 토큰 발급 후 치환

const SNIPPET =
  `<!-- Cloudflare Web Analytics (cookieless) -->` +
  `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" ` +
  `data-cf-beacon='{"token": "${TOKEN}"}'></script>` +
  `<!-- End Cloudflare Web Analytics -->`;

// 대상 파일: 루트 *.html + blog/*.html
const rootHtml = readdirSync(ROOT).filter((f) => f.endsWith('.html'));
const blogHtml = readdirSync(join(ROOT, 'blog'))
  .filter((f) => f.endsWith('.html'))
  .map((f) => join('blog', f));
const files = [...rootHtml, ...blogHtml];

let inserted = 0;
let skipped = 0;
for (const rel of files) {
  const path = join(ROOT, rel);
  let html = readFileSync(path, 'utf8');

  if (html.includes('cloudflareinsights')) {
    console.log(`  skip (already present): ${rel}`);
    skipped++;
    continue;
  }
  if (!html.includes('</head>')) {
    console.warn(`  WARN no </head>, skipped: ${rel}`);
    skipped++;
    continue;
  }

  // 첫 번째 </head> 직전에 삽입
  html = html.replace('</head>', `  ${SNIPPET}\n</head>`);
  writeFileSync(path, html, 'utf8');
  console.log(`  inserted: ${rel}`);
  inserted++;
}

console.log(`\nDone. inserted=${inserted}, skipped=${skipped}, total=${files.length}`);
