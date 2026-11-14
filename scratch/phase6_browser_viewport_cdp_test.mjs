import { spawn } from 'child_process';
import assert from 'assert';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';

const viewports = [
  { name: 'Mobile (360px - Samsung Galaxy)', width: 360, height: 740 },
  { name: 'Mobile (390px - iPhone 12/13/14)', width: 390, height: 844 },
  { name: 'Mobile (430px - iPhone Pro Max)', width: 430, height: 932 },
  { name: 'Desktop (1440px - Standard HD)', width: 1440, height: 900 },
];

function runCdpSession(url, width, height, port) {
  return new Promise((resolve, reject) => {
    const chrome = spawn(CHROME_PATH, [
      '--headless=new',
      `--remote-debugging-port=${port}`,
      `--window-size=${width},${height}`,
      '--disable-gpu',
      '--no-sandbox',
      url,
    ]);

    let resolved = false;

    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        try { chrome.kill(); } catch {}
      }
    };

    setTimeout(async () => {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/json`);
        const tabs = await res.json();
        const tab = tabs.find((t) => t.url.includes('3000'));
        if (!tab || !tab.webSocketDebuggerUrl) {
          throw new Error('Target tab not found on port ' + port);
        }

        const ws = new WebSocket(tab.webSocketDebuggerUrl);

        ws.onopen = () => {
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 1,
              method: 'Runtime.evaluate',
              params: {
                expression: 'JSON.stringify({ body: document.body.innerText, header: document.querySelector("header")?.innerText || "" })',
              },
            }));
          }, 1500);
        };

        ws.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.id === 1 && msg.result?.result?.value) {
            const data = JSON.parse(msg.result.result.value);
            ws.close();
            cleanup();
            resolve(data);
          }
        };

        ws.onerror = (err) => {
          cleanup();
          reject(err);
        };
      } catch (err) {
        cleanup();
        reject(err);
      }
    }, 1500);

    setTimeout(() => {
      if (!resolved) {
        cleanup();
        reject(new Error('Timeout waiting for CDP response'));
      }
    }, 10000);
  });
}

console.log('================================================================');
console.log('SSK NATURAL GOLD - BROWSER & VIEWPORT VERIFICATION (CDP)');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function check(desc, fn) {
  try {
    fn();
    console.log(`[PASS] ${desc}`);
    passCount++;
  } catch (err) {
    console.error(`[FAIL] ${desc}: ${err.message}`);
    failCount++;
  }
}

let portCounter = 9500;

// Test 1: Desktop Viewport (1440px)
const desktop = await runCdpSession(`${BASE_URL}/`, 1440, 900, portCounter++);

check('1.1 Desktop: Header renders dynamic free delivery threshold (₹1500 [Demo])', () => {
  assert.ok(desktop.header.includes('1500'), 'Header must render ₹1500 free delivery threshold from backend');
  assert.ok(desktop.header.includes('[Demo]'), 'Threshold must be labeled [Demo]');
});

check('1.2 Desktop: Header renders FSSAI Pending Verification [Demo]', () => {
  assert.ok(desktop.header.includes('Pending Verification'), 'FSSAI must be labeled Pending Verification');
  assert.ok(desktop.header.includes('[Demo]'), 'FSSAI must be labeled [Demo]');
});

check('1.3 Desktop: Homepage renders live PostgreSQL products', () => {
  assert.ok(desktop.body.includes('Groundnut'), 'Must include Groundnut oil product');
  assert.ok(desktop.body.includes('Sesame'), 'Must include Sesame oil product');
  assert.ok(desktop.body.includes('Coconut'), 'Must include Coconut oil product');
});

check('1.4 Desktop: Footer renders FSSAI Registration (Pending Verification)', () => {
  assert.ok(desktop.body.includes('FSSAI Registration (Pending Verification)'), 'Footer trust badge must show Registration Pending');
});

// Test 2: Mobile Viewports (360px, 390px, 430px)
for (const vp of viewports.slice(0, 3)) {
  const mobile = await runCdpSession(`${BASE_URL}/`, vp.width, vp.height, portCounter++);

  check(`2.1 ${vp.name}: Homepage renders live products`, () => {
    assert.ok(mobile.body.includes('Groundnut'), 'Must render Groundnut oil');
    assert.ok(mobile.body.includes('Sesame'), 'Must render Sesame oil');
    assert.ok(mobile.body.includes('Coconut'), 'Must render Coconut oil');
  });

  check(`2.2 ${vp.name}: Mobile bottom navigation renders`, () => {
    assert.ok(mobile.body.includes('Home') && mobile.body.includes('Shop') && mobile.body.includes('Cart'), 'Mobile bar must render');
  });

  check(`2.3 ${vp.name}: FSSAI Pending Verification in footer`, () => {
    assert.ok(mobile.body.includes('FSSAI Registration (Pending Verification)'), 'Must render FSSAI Registration Pending Verification');
  });
}

// Test 3: Catalogue Page (/shop)
const shopPage = await runCdpSession(`${BASE_URL}/shop`, 1440, 900, portCounter++);
check('3.1 Catalogue Page (/shop): Renders all live products and filters', () => {
  assert.ok(shopPage.body.includes('Groundnut'), 'Catalogue must list Groundnut Oil');
  assert.ok(shopPage.body.includes('Sesame'), 'Catalogue must list Sesame Oil');
  assert.ok(shopPage.body.includes('Coconut'), 'Catalogue must list Coconut Oil');
  assert.ok(shopPage.body.includes('3 Items'), 'Catalogue must show 3 live items from PostgreSQL');
});

// Test 4: Product Detail Page (/products/traditional-groundnut-oil)
const detailPage = await runCdpSession(`${BASE_URL}/products/traditional-groundnut-oil`, 1440, 900, portCounter++);
check('4.1 Product Detail (/products/:slug): Renders verified product details and botanical name', () => {
  assert.ok(detailPage.body.includes('Traditional Groundnut Oil'), 'Must render product title');
  assert.ok(detailPage.body.includes('ARACHIS HYPOGAEA'), 'Must render botanical name');
  assert.ok(detailPage.body.includes('In Stock'), 'Must indicate in-stock state');
  assert.ok(detailPage.body.includes('Vaagai Wood Mortar'), 'Must render wood press specifications');
});

console.log('\n================================================================');
console.log(`TOTAL BROWSER CDP RESULTS: ${passCount} Passed, ${failCount} Failed.`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL BROWSER & VIEWPORT TESTS PASSED WITH ZERO FAILURES!\n');
}
