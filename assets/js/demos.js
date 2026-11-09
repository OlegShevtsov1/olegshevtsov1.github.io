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

  // Agent tool approval: deterministic illustrative flow. No commands or APIs are executed.
  let approvalStep = 0;
  let approvalDecision = null;
  const next = $('#approval-next');
  const approval = $('#approval-approval');
  const log = $('#approval-log');
  const result = $('#approval-result');
  const stage = $('#approval-stage');
  const addEvent = (idx, message) => {
    const item = document.createElement('li');
    const n = document.createElement('span');
    n.textContent = String(idx).padStart(2, '0');
    item.append(n, document.createTextNode(message));
    log.append(item);
  };
  const resetApproval = () => {
    approvalStep = 0;
    approvalDecision = null;
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
    if (approvalStep === 0) {
      log.replaceChildren();
      addEvent(1, 'The agent wrote a migration and proposes running bin/rails db:migrate.');
      addEvent(2, 'The harness checks its permission rules: rspec → allow, db:migrate → ask, kamal deploy → deny. It asks a human.');
      approvalStep = 1;
      stage.textContent = '02 / 03';
      approval.hidden = false;
      next.hidden = true;
      result.textContent = 'Paused at the approval boundary. Nothing runs without permission.';
    }
  });
  const finish = allowed => {
    if (approvalStep !== 1 || approvalDecision !== null) return;
    approvalDecision = allowed;
    approvalStep = 2;
    approval.hidden = true;
    next.hidden = true;
    stage.textContent = '03 / 03';
    if (allowed) {
      addEvent(3, 'Approved. Mock result: 1 migration applied, schema.rb updated.');
      addEvent(4, 'The agent runs the related specs and reports 12 examples, 0 failures — as evidence, not as a claim.');
      result.textContent = '✓ Example complete: the command output is simulated and then checked against the request. No real database was touched.';
      result.className = 'trace-result success';
    } else {
      addEvent(3, 'Permission denied. Execution stops safely.');
      result.textContent = '✕ Example stopped: the agent can explain what it needed and why, but the database stays untouched.';
      result.className = 'trace-result denied';
    }
  };
  $('#approval-approve')?.addEventListener('click', () => finish(true));
  $('#approval-deny')?.addEventListener('click', () => finish(false));
  $('#approval-reset')?.addEventListener('click', resetApproval);

  // RSpec checks: fictional, standalone JavaScript checks only.
  const goodSample = `RSpec.describe "GET /api/v1/projects" do\n  let!(:projects) { create_list(:project, 3, :with_tasks) }\n\n  it "returns projects with task counts" do\n    get "/api/v1/projects", headers: auth_headers\n    expect(response).to have_http_status(:ok)\n    expect(json["data"].size).to eq(3)\n  end\nend`;
  const badSample = `RSpec.describe "GET /api/v1/projects" do\n  fit "returns projects" do\n    3.times { Project.create!(name: "P") }\n    get "/api/v1/projects"\n    sleep 2\n    puts response.body\n  end\nend`;
  const editor = $('#spec-editor');
  $$('[data-preset]').forEach(button => button.addEventListener('click', () => {
    editor.value = button.dataset.preset === 'clean' ? goodSample : badSample;
    $('#spec-run').click();
  }));
  const makeResult = (passed, message) => {
    const li = document.createElement('li');
    li.className = passed ? 'pass' : 'warn';
    li.textContent = message;
    return li;
  };
  $('#spec-run')?.addEventListener('click', () => {
    const code = editor.value;
    const checks = [
      [!/\b(?:fit|fdescribe|fcontext)\b|focus:\s*true/.test(code), 'No focused spec left behind (fit / fdescribe / focus: true)'],
      [!/\b(?:xit|xdescribe|xcontext)\b|^\s*skip\b/m.test(code), 'No accidentally skipped specs (xit / xdescribe / skip)'],
      [/\bexpect\s*[({]/.test(code), 'An expectation verifies the intended result'],
      [!/\bsleep\b/.test(code), 'No fixed sleeps (sleep)'],
      [!/^\s*(?:puts|pp|p)\b|binding\.(?:pry|irb)|\bdebugger\b/m.test(code), 'No debug output left in (puts / pp / binding.pry)'],
      [!/\b[A-Z]\w*\.create!?\s*\(/.test(code), 'Test data comes from factories, not Model.create!'],
    ];
    const failures = checks.filter(([pass]) => !pass).length;
    $('#spec-summary').textContent = failures ? `${failures} item${failures !== 1 ? 's' : ''} worth reviewing.` : 'Looking good in this sample.';
    $('#spec-results').replaceChildren(...checks.map(([pass, message]) => makeResult(pass, message)));
  });

  const gateCases = {
    fast: { label: 'FAST GATE / ITERATION', checks: ['Read the spec, ADRs and current repo state','RuboCop, ESLint and type-check the change','Run the specs next to the change','Review the diff for accidental scope'], quote: '“A green check is a clue. Understanding what it proves is the job.”' },
    release: { label: 'RELEASE GATE / EVIDENCE', checks: ['Full RSpec + frontend suite on one Docker image per commit','Check secrets, config and security boundaries','Tag-only release → Kamal deploy with health checks','Smoke-test production and watch error tracking','Keep one-click rollback ready; record what stays unverified'], quote: '“The work is complete when the evidence matches the claim.”' }
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
      await navigator.clipboard.writeText('olegshevtsov1@gmail.com');
      button.textContent = 'Copied! ✓';
    } catch {
      button.textContent = 'Use the email link on the left';
    }
    window.setTimeout(() => button.innerHTML = original, 2000);
  });
})();
