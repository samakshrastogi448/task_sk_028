import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const target = process.env.PRODUCTION_URL || 'https://tasksk028.vercel.app';
const viewports = [
  { name:'mobile', width:390, height:844 },
  { name:'tablet', width:768, height:1024 },
  { name:'laptop', width:1366, height:768 },
  { name:'desktop', width:1920, height:1080 }
];

const browser = await chromium.launch({ headless:true });
let blockers = 0;
let majors = 0;
let warnings = 0;
const results = [];

for (const vp of viewports) {
  const context = await browser.newContext({ viewport: { width:vp.width, height:vp.height }, reducedMotion:'no-preference' });
  const page = await context.newPage();
  const runtimeErrors = [];
  page.on('pageerror', e => runtimeErrors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') runtimeErrors.push(m.text()); });
  const response = await page.goto(target, { waitUntil:'networkidle', timeout:60000 });
  await page.waitForTimeout(1200);
  const brokenImages = await page.locator('img').evaluateAll(imgs => imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src));
  const overflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  const serious = axe.violations.filter(v => ['serious','critical'].includes(v.impact));
  if (!response || response.status() >= 400) blockers++;
  if (runtimeErrors.length) blockers += runtimeErrors.length;
  if (brokenImages.length) majors += brokenImages.length;
  if (overflow > 2) majors++;
  if (serious.length) majors += serious.length;
  results.push({ viewport:vp, http:response?.status(), runtimeErrors, brokenImages, overflow, seriousA11y:serious.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})) });
  await page.screenshot({ path:`qa-${vp.name}.png`, fullPage:true });
  await context.close();
}

const reducedContext = await browser.newContext({ viewport:{width:390,height:844}, reducedMotion:'reduce' });
const reducedPage = await reducedContext.newPage();
await reducedPage.goto(target, { waitUntil:'networkidle', timeout:60000 });
const reducedMotionPass = await reducedPage.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
if (!reducedMotionPass) majors++;
await reducedContext.close();
await browser.close();

const summary = { target, blockers, majors, warnings, reducedMotionPass, pass:blockers===0&&majors===0, results };
console.log(JSON.stringify(summary,null,2));
if (!summary.pass) process.exit(1);
