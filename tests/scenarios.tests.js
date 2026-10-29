// Funções reais do aplicativo; SDK, fetch e DOM simulados. Não usa rede.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/script.js'), 'utf8');
assert.match(source, /init\(\);\s*$/);
const code = source.replace(/init\(\);\s*$/, ''); // Desativa somente o boot da página.
const input = { desc: 'Compra de teste', val: 50, tipo: 'despesa', met: 'pix', cat: 'transporte', data: '2026-10-28' };
const row = { id: 123, ...input, val: '50' };
const quotes = Object.fromEntries(['USD', 'EUR', 'BTC'].map((c, i) => [c + 'BRL', {
  bid: String(5 + i), ask: String(5.1 + i), high: String(5.2 + i), low: String(4.9 + i), pctChange: '-0.2',
}]));

function application(status, body) {
  const calls = [], logs = [], elements = new Map();
  const response = { status, data: status < 400 ? body : null, error: status >= 400 ? body : null };
  const sdk = {};
  for (const name of ['from', 'select', 'order', 'insert', 'single']) {
    sdk[name] = (...args) => { calls.push({ name, args }); return sdk; };
  }
  sdk.then = (resolve, reject) => Promise.resolve(response).then(resolve, reject);
  const context = vm.createContext({
    window: { supabase: { createClient: () => sdk } },
    console: { error: (...args) => logs.push(args) },
    setTimeout: () => 0, clearTimeout() {},
    document: { addEventListener() {}, getElementById: id => {
      if (id === 'wave-canvas-wrap') return null; // Animação fora do escopo.
      if (!elements.has(id)) elements.set(id, { addEventListener() {}, style: {}, textContent: '', innerHTML: '', disabled: false, classList: { add() {}, remove() {} } });
      return elements.get(id);
    } },
    fetch: async url => {
      calls.push({ name: 'fetch', args: [url] });
      return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
    },
  });
  vm.runInContext(code, context, { filename: 'src/script.js' });
  return { calls, logs, elements, run: expression => vm.runInContext(expression, context) };
}

const results = [];
async function test(id, title, method, endpoint, sent, status, body, checks, verify) {
  const result = { id, title, method, endpoint, sent, simulatedStatus: status, simulatedBody: body, checks };
  try {
    await verify(application(status, body));
    result.result = 'APROVADO';
    console.log(`PASSOU ${id} | ${status} SIMULADO | ${title}`);
  } catch (error) {
    result.result = 'REPROVADO';
    result.error = error.message;
    process.exitCode = 1;
    console.error(`FALHOU ${id}: ${error.message}`);
  }
  results.push(result);
}

async function main() {
  console.log('\nCenários do FinTrack: SIMULAÇÃO identificada, sem banco ou rede reais.');
  await test('CT-01', 'Listagem', 'GET', '/rest/v1/transacoes?select=*&order=data.desc', null, 200, [row],
    ['Consulta correta ao SDK', 'Estado recebe todos os campos e valor numérico'], async a => {
      await a.run('loadTransacoes()');
      assert.deepEqual(JSON.parse(a.run('JSON.stringify(TX)')), [{ id: 123, ...input }]);
      assert.deepEqual(JSON.parse(JSON.stringify(a.calls)), [
        { name: 'from', args: ['transacoes'] }, { name: 'select', args: ['*'] },
        { name: 'order', args: ['data', { ascending: false }] },
      ]);
      assert.equal(a.logs.length, 0);
    });
  await test('CT-02', 'Criação', 'POST', '/rest/v1/transacoes?select=*', input, 201, row,
    ['Registro enviado ao SDK', 'Retorno com id e campos normalizados'], async a => {
      const result = await a.run(`addTransacao(${JSON.stringify(input)})`);
      assert.deepEqual(JSON.parse(JSON.stringify(result)), { id: 123, ...input });
      assert.deepEqual(JSON.parse(JSON.stringify(a.calls)), [
        { name: 'from', args: ['transacoes'] }, { name: 'insert', args: [[input]] },
        { name: 'select', args: [] }, { name: 'single', args: [] },
      ]);
    });
  for (const [id, title, sent, error] of [
    ['CT-03', 'Campo obrigatório ausente', { val: 50, tipo: 'despesa', met: 'pix', cat: 'transporte', data: '2026-10-28' }, { code: '23502', message: 'Campo obrigatório desc ausente.' }],
    ['CT-04', 'Tipo numérico inválido', { ...input, val: 'abc' }, { code: '22P02', message: 'Valor inválido para numeric: abc.' }],
  ]) {
    await test(id, title, 'POST', '/rest/v1/transacoes?select=*', sent, 400, error,
      ['Entrada encaminhada ao SDK', 'Operação rejeitada com código e mensagem do erro simulado'], async a => {
        await assert.rejects(a.run(`addTransacao(${JSON.stringify(sent)})`), e => {
          assert.equal(e.code, error.code);
          assert.equal(e.message, error.message);
          return true;
        });
        assert.deepEqual(JSON.parse(JSON.stringify(a.calls.find(c => c.name === 'insert').args)), [[sent]]);
      });
  }
  const endpoint = 'https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL';
  await test('CT-05', 'Câmbio', 'GET', endpoint, null, 200, quotes,
    ['URL correta', 'Campos das três moedas convertidos', 'Interface renderizada e botão habilitado'], async a => {
      await a.run('cambioLoad()');
      const rates = JSON.parse(a.run('JSON.stringify(cambioRates)'));
      for (const currency of ['USD', 'EUR', 'BTC']) {
        for (const [field, apiField] of Object.entries({ bid: 'bid', ask: 'ask', high: 'high', low: 'low', pct: 'pctChange' })) {
          assert.equal(rates[currency][field], Number(quotes[currency + 'BRL'][apiField]));
        }
      }
      assert.equal(a.calls[0].args[0], endpoint);
      assert.match(a.elements.get('cambio-cards').innerHTML, /Dólar/);
      assert.equal(a.run('cambioCarregado'), true);
      assert.equal(a.elements.get('cambio-refresh-btn').disabled, false);
    });
  await test('CT-06', 'Erro interno nas transações', 'GET', '/rest/v1/transacoes?select=*&order=data.desc', null, 500,
    { message: 'Não foi possível concluir a solicitação. Tente novamente mais tarde.' },
    ['Aviso visual genérico', 'Estado anterior preservado'], async a => {
      a.run(`TX = [${JSON.stringify({ id: 123, ...input })}]`);
      await a.run('loadTransacoes()');
      assert.equal(a.elements.get('t-msg').textContent, 'Não foi possível carregar dados do banco.');
      assert.doesNotMatch(a.elements.get('t-msg').textContent, /stack|SELECT|password|postgres|\.js:/i);
      assert.deepEqual(JSON.parse(a.run('JSON.stringify(TX)')), [{ id: 123, ...input }]);
      assert.equal(a.logs.length, 1); // O console atual ainda registra o erro.
    });
  await test('CT-07', 'Erro HTTP no câmbio', 'GET', endpoint, null, 500, { message: 'Erro interno.' },
    ['Trata Response HTTP 500 simulado', 'Mensagem visual genérica e botão habilitado'], async a => {
      await a.run('cambioLoad()');
      assert.match(a.elements.get('cambio-cards').innerHTML, /Não foi possível carregar as cotações/);
      assert.doesNotMatch(a.elements.get('cambio-cards').innerHTML, /HTTP 500|stack/);
      assert.equal(a.elements.get('cambio-refresh-btn').disabled, false);
      assert.equal(a.run('cambioCarregado'), false);
    });
  const report = {
    executedAt: new Date().toISOString(), node: process.version,
    mode: 'SIMULAÇÃO: funções reais de src/script.js com SDK Supabase, fetch e DOM substituídos.',
    limits: 'Status do Supabase são fixtures do SDK, não respostas HTTP medidas. Não comprova validação ou persistência no banco, nem sanitização do provedor. Câmbio usa objetos Response simulados. O console ainda registra erros do banco.',
    passed: results.filter(r => r.result === 'APROVADO').length,
    failed: results.filter(r => r.result === 'REPROVADO').length, results,
  };
  const dir = path.join(root, 'evidencias');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'resultados.json'), JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(path.join(dir, 'resultados.md'), [
    '# Evidência de execução — FinTrack', '',
    `Execução (UTC): ${report.executedAt}. Node: ${report.node}. Comando: npm test.`, '',
    report.mode, '', report.limits, '',
    '| Cenário | Status SIMULADO | Resultado | Verificações |', '|---|---|---|---|',
    ...results.map(r => `| ${r.id} — ${r.title} | ${r.simulatedStatus} | ${r.result} | ${(r.error || r.checks.join('; ')).replace(/\n/g, ' ')} |`), '',
    `Resultado: ${report.passed} aprovados; ${report.failed} reprovados.`, '',
    'Entradas e respostas simuladas completas: [resultados.json](resultados.json).', '',
  ].join('\n'));
  console.log(`\n${report.passed} aprovados; ${report.failed} reprovados. Evidências em evidencias/.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
