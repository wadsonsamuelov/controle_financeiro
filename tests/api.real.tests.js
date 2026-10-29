// Integração REAL com o Supabase de demonstração. Cria somente dados fictícios.
// Não é executado no CI padrão. Comando: npm run test:real
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/script.js'), 'utf8');
const url = source.match(/const SUPABASE_URL = '([^']+)'/)[1];
const key = source.match(/const SUPABASE_KEY = '([^']+)'/)[1];
const marker = 'TESTE-AULA-' + randomUUID();
const record = { desc: marker, val: 12.5, tipo: 'despesa', met: 'pix', cat: 'transporte', data: '2026-10-28' };
const results = [];
let createdId;

function verifyRecord(body) {
  for (const [field, value] of Object.entries(record)) {
    assert.equal(field === 'val' ? Number(body[field]) : body[field], value, `Campo ${field}`);
  }
}

async function request(method, query, body, object = false) {
  const response = await fetch(`${url}/rest/v1/transacoes${query}`, {
    method, signal: AbortSignal.timeout(15000),
    headers: {
      apikey: key, 'Content-Type': 'application/json',
      ...(object ? { Prefer: 'return=representation', Accept: 'application/vnd.pgrst.object+json' } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const text = await response.text();
  let parsed;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }
  return { method, endpoint: '/rest/v1/transacoes' + query, sent: body ?? null, status: response.status, body: parsed };
}

async function check(id, description, expectedStatus, response, verify) {
  const item = { id, description, expectedStatus, ...response };
  try {
    assert.equal(response.status, expectedStatus);
    await verify(response.body);
    item.result = 'APROVADO';
    console.log(`PASSOU ${id} | HTTP ${response.status} REAL | ${description}`);
  } catch (error) {
    item.result = 'REPROVADO';
    item.error = error.message;
    console.error(`FALHOU ${id} | HTTP ${response.status} | ${description}`);
    process.exitCode = 1;
  }
  results.push(item);
  return item.result === 'APROVADO';
}

async function main() {
  console.log('Integração REAL: banco Supabase de demonstração. Somente dados fictícios.');
  try {
    const available = await check('REAL-00', 'Tabela acessível', 200,
      await request('GET', '?select=id&limit=0'), body => assert.deepEqual(body, []));
    if (!available) {
      console.error('Execute supabase/schema.sql e supabase/demo.sql no SQL Editor. Os demais cenários não foram executados.');
      return;
    }
    const creation = await request('POST', '?select=*', record, true);
    // Guarda o ID mesmo se uma verificação posterior falhar, para tentar a limpeza.
    if (creation.status === 201 && Number.isSafeInteger(creation.body?.id)) createdId = creation.body.id;
    const created = await check('CT-02', 'Criar registro fictício', 201, creation, body => {
      assert.ok(Number.isSafeInteger(body.id) && body.id > 0);
      verifyRecord(body); // Colunas extras, como created_at, são permitidas.
    });
    if (created) {
      await check('CT-01', 'Consultar registro persistido pelo ID', 200,
        await request('GET', `?select=*&order=data.desc&id=eq.${createdId}`), body => {
          assert.equal(body.length, 1);
          assert.equal(body[0].id, createdId);
          verifyRecord(body[0]);
        });
    }
    for (const [id, title, input, code, message] of [
      ['CT-03', 'Rejeitar campo obrigatório ausente', { val: 50, tipo: 'despesa', met: 'pix', cat: 'transporte', data: '2026-10-28' }, '23502', /desc/i],
      ['CT-04', 'Rejeitar valor numérico inválido', { ...record, val: 'abc' }, '22P02', /numeric/i],
    ]) {
      await check(id, title, 400, await request('POST', '?select=*', input, true), body => {
        assert.equal(body.code, code);
        assert.equal(typeof body.message, 'string');
        assert.match(body.message, message);
      });
    }
    if (createdId !== undefined) {
      await check('REAL-01', 'Marcador exclusivo aparece somente no registro criado', 200,
        await request('GET', `?select=id&desc=eq.${encodeURIComponent(marker)}`), body => {
          assert.deepEqual(body, [{ id: createdId }]);
        });
    }
  } catch (error) {
    results.push({ id: 'EXECUCAO', description: 'Falha ao executar requisição', status: 'sem resposta', result: 'REPROVADO', error: error.message });
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    try {
      if (createdId !== undefined) {
        await check('LIMPEZA', 'Remover somente o registro criado nesta execução', 204,
          await request('DELETE', `?id=eq.${createdId}&desc=eq.${encodeURIComponent(marker)}`), body => assert.equal(body, null));
        await check('LIMPEZA-02', 'Confirmar remoção do registro de teste', 200,
          await request('GET', `?select=id&id=eq.${createdId}`), body => assert.deepEqual(body, []));
      }
    } catch (error) {
      results.push({ id: 'LIMPEZA', description: 'Limpeza não confirmada; verifique o marcador no banco', status: 'sem resposta', result: 'REPROVADO', error: error.message });
      console.error(error.message);
      process.exitCode = 1;
    } finally {
      const report = {
        executedAt: new Date().toISOString(), mode: 'REAL: requisições HTTP ao Supabase configurado no aplicativo.',
        projectUrl: url, passed: results.filter(r => r.result === 'APROVADO').length,
        failed: results.filter(r => r.result === 'REPROVADO').length, results,
        limits: 'Erro 500 não é provocado no banco real; continua simulado na suíte npm test. CT-01 consulta por ID e não comprova ordenação de múltiplas transações. Se houver erro de rede durante a criação, um registro com o marcador pode permanecer no banco.',
        marker,
      };
      const dir = path.join(root, 'evidencias');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'resultados-reais.json'), JSON.stringify(report, null, 2) + '\n');
      fs.writeFileSync(path.join(dir, 'resultados-reais.md'), [
        '# Testes reais — Supabase', '', `Execução UTC: ${report.executedAt}`, '', report.mode, '',
        '| Cenário | Status HTTP recebido | Resultado |', '|---|---|---|',
        ...results.map(r => `| ${r.id}: ${r.description} | ${r.status} | ${r.result} |`), '',
        `${report.passed} aprovados; ${report.failed} reprovados. Somente os cenários listados foram executados.`, '',
        report.limits, '', 'Detalhes: [resultados-reais.json](resultados-reais.json).', '',
      ].join('\n'));
      console.log('Relatórios: evidencias/resultados-reais.md e evidencias/resultados-reais.json');
    }
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
