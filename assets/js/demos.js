'use strict';
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  $('#year').textContent = String(new Date().getFullYear());

  const menu = $('.menu-toggle');
  const nav = $('#site-nav');
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('open', open);
  });
  $$('.site-nav a').forEach(a => a.addEventListener('click', () => {
    menu?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-label', 'Open menu');
    nav?.classList.remove('open');
  }));

  const tabs = $$('.demo-tab');
  const activateDemo = (id, moveFocus = false) => {
    tabs.forEach(tab => {
      const active = tab.dataset.demo === id;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && moveFocus) tab.focus();
    });
    $$('.demo-panel').forEach(panel => panel.hidden = panel.id !== `panel-${id}`);
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateDemo(tab.dataset.demo));
    tab.addEventListener('keydown', event => {
      const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (!delta) return;
      event.preventDefault();
      activateDemo(tabs[(index + delta + tabs.length) % tabs.length].dataset.demo, true);
    });
  });
  $$('[data-open-demo]').forEach(link => link.addEventListener('click', () => activateDemo(link.dataset.openDemo)));

  // Violet: deterministic illustrative flow. No commands or APIs are executed.
  let violetStep = 0;
  let violetDecision = null;
  const next = $('#violet-next');
  const approval = $('#violet-approval');
  const log = $('#violet-log');
  const result = $('#violet-result');
  const stage = $('#violet-stage');
  const addEvent = (idx, message) => {
    const item = document.createElement('li');
    const n = document.createElement('span');
    n.textContent = String(idx).padStart(2, '0');
    item.append(n, document.createTextNode(message));
    log.append(item);
  };
  const resetViolet = () => {
    violetStep = 0;
    violetDecision = null;
    log.replaceChildren();
    addEvent(0, 'Click start to see how this flow works.');
    stage.textContent = '00 / 03';
    result.textContent = 'No actions have been executed. This is an educational simulation.';
    result.className = 'trace-result';
    approval.hidden = true;
    next.hidden = false;
    next.textContent = 'Start walkthrough →';
  };
  next?.addEventListener('click', () => {
    if (violetStep === 0) {
      log.replaceChildren();
      addEvent(1, 'The model proposes reading a project directory.');
      addEvent(2, 'The system checks capability scope and requests human approval.');
      violetStep = 1;
      stage.textContent = '02 / 03';
      approval.hidden = false;
      next.hidden = true;
      result.textContent = 'Paused at the approval boundary. Nothing runs without permission.';
    }
  });
  const finish = allowed => {
    if (violetStep !== 1 || violetDecision !== null) return;
    violetDecision = allowed;
    violetStep = 2;
    approval.hidden = true;
    next.hidden = true;
    stage.textContent = '03 / 03';
    if (allowed) {
      addEvent(3, 'Approved. Mock tool result: 3 project folders, 2 README files.');
      addEvent(4, 'The assistant forms a summary from the returned data.');
      result.textContent = '✓ Example complete: the tool output is simulated and then verified against the request. No real folder was accessed.';
      result.className = 'trace-result success';
    } else {
      addEvent(3, 'Permission denied. Execution stops safely.');
      result.textContent = '✕ Example stopped: the assistant can explain the denial, but cannot access the folder.';
      result.className = 'trace-result denied';
    }
  };
  $('#violet-approve')?.addEventListener('click', () => finish(true));
  $('#violet-deny')?.addEventListener('click', () => finish(false));
  $('#violet-reset')?.addEventListener('click', resetViolet);

  // Test Architecture Validator: fictional, standalone JavaScript checks only.
  const goodSample = `test('saves settings', async ({ page }) => {\n  await page.goto('/settings');\n  await page.getByRole('button', { name: 'Save' }).click();\n  await expect(page.getByText('Saved')).toBeVisible();\n});`;
  const badSample = `test.only('saves the form', async ({ page }) => {\n  await page.goto('/settings');\n  await page.waitForTimeout(5000);\n  await page.locator('#save').click();\n});`;
  const editor = $('#guard-editor');
  $$('[data-preset]').forEach(button => button.addEventListener('click', () => {
    editor.value = button.dataset.preset === 'clean' ? goodSample : badSample;
    $('#guard-run').click();
  }));
  const makeResult = (passed, message) => {
    const li = document.createElement('li');
    li.className = passed ? 'pass' : 'warn';
    li.textContent = message;
    return li;
  };
  $('#guard-run')?.addEventListener('click', () => {
    const code = editor.value;
    const checks = [
      [!/(?:test|describe)\.only\s*\(/.test(code), 'No focused test left behind (test.only / describe.only)'],
      [!/(?:test|describe)\.skip\s*\(/.test(code), 'No accidentally skipped tests (test.skip / describe.skip)'],
      [/\bexpect\s*\(/.test(code), 'An assertion verifies the intended result'],
      [!/\bwaitForTimeout\s*\(/.test(code), 'No fixed sleeps (waitForTimeout)'],
    ];
    const failures = checks.filter(([pass]) => !pass).length;
    $('#guard-summary').textContent = failures ? `${failures} item${failures !== 1 ? 's' : ''} worth reviewing.` : 'Looking good in this sample.';
    $('#guard-results').replaceChildren(...checks.map(([pass, message]) => makeResult(pass, message)));
  });

  const gateCases = {
    fast: { label: 'FAST GATE / ITERATION', checks: ['Read the actual repository context','Lint and type-check the change','Run nearby tests','Review the diff before proceeding'], quote: '“A green check is a clue. Understanding what it proves is the job.”' },
    release: { label: 'RELEASE GATE / EVIDENCE', checks: ['Run the full test suite and build','Check security and configuration boundaries','Inspect real runtime behavior and UI','Read back important remote writes','Record what remains unverified'], quote: '“The work is complete when the evidence matches the claim.”' }
  };
  $$('.sdlc-choice').forEach(button => button.addEventListener('click', () => {
    $$('.sdlc-choice').forEach(b => {const active = b === button; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active));});
    const config = gateCases[button.dataset.gate];
    $('#sdlc-label').textContent = config.label;
    $('#sdlc-count').textContent = `${config.checks.length} checks`;
    const rows = config.checks.map(check => { const li = document.createElement('li'); const mark = document.createElement('b'); mark.textContent = '✓'; const label = document.createElement('span'); label.textContent = check; li.append(mark,label); return li; });
    $('#sdlc-checks').replaceChildren(...rows);
    $('#sdlc-quote').textContent = config.quote;
  }));

  $('#copy-mail')?.addEventListener('click', async event => {
    const button = event.currentTarget;
    const original = button.innerHTML;
    try {
      await navigator.clipboard.writeText('mateusllemosf@gmail.com');
      button.textContent = 'Copied! ✓';
    } catch {
      button.textContent = 'Use the email link on the left';
    }
    window.setTimeout(() => button.innerHTML = original, 2000);
  });
})();
