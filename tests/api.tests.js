// tests/api.test.js
// Teste de integração — AwesomeAPI (câmbio)
// Como rodar: node tests/api.test.js

const API_URL = 'https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL';

let passou = 0;
let falhou = 0;

function ok(nome, detalhe) {
  console.log('  ✅ PASSOU —', nome, detalhe ? '| ' + detalhe : '');
  passou++;
}
function fail(nome, motivo) {
  console.log('  ❌ FALHOU —', nome, '|', motivo);
  falhou++;
}

async function rodar() {
  console.log('\n══════════════════════════════════════');
  console.log('  Testes de integração — AwesomeAPI');
  console.log('══════════════════════════════════════\n');

  // Teste 1: API responde com status 200
  console.log('Teste 1: API retorna status 200');
  try {
    const res = await fetch(API_URL);
    res.ok ? ok('status ' + res.status) : fail('status inesperado', res.status);
  } catch (e) { fail('erro de rede', e.message); }

  // Teste 2: Resposta contém as três chaves esperadas
  console.log('Teste 2: Resposta contém USDBRL, EURBRL e BTCBRL');
  try {
    const data = await (await fetch(API_URL)).json();
    (data.USDBRL && data.EURBRL && data.BTCBRL)
      ? ok('todas as chaves presentes')
      : fail('chave ausente', JSON.stringify(Object.keys(data)));
  } catch (e) { fail('erro ao parsear JSON', e.message); }

  // Teste 3: Cotação USD-BRL é número positivo
  console.log('Teste 3: Cotação USD-BRL é um número positivo');
  try {
    const data = await (await fetch(API_URL)).json();
    const v = parseFloat(data.USDBRL.bid);
    (!isNaN(v) && v > 0) ? ok('USD-BRL bid = ' + v) : fail('valor inválido', v);
  } catch (e) { fail('erro', e.message); }

  // Teste 4: BTC vale mais que USD (sanity check)
  console.log('Teste 4: BTC-BRL > USD-BRL (sanity check)');
  try {
    const data = await (await fetch(API_URL)).json();
    const btc = parseFloat(data.BTCBRL.bid);
    const usd = parseFloat(data.USDBRL.bid);
    btc > usd
      ? ok('BTC (' + btc.toFixed(0) + ') > USD (' + usd.toFixed(2) + ')')
      : fail('relação inesperada', `BTC=${btc}, USD=${usd}`);
  } catch (e) { fail('erro', e.message); }

  // Teste 5: Objeto USDBRL tem todos os campos obrigatórios
  console.log('Teste 5: USDBRL tem campos bid, ask, high, low, pctChange');
  try {
    const data = await (await fetch(API_URL)).json();
    const campos = ['bid', 'ask', 'high', 'low', 'pctChange'];
    const ausentes = campos.filter(c => data.USDBRL[c] === undefined);
    ausentes.length === 0
      ? ok('todos os campos presentes')
      : fail('campos ausentes', ausentes.join(', '));
  } catch (e) { fail('erro', e.message); }

  // Resultado
  console.log('\n══════════════════════════════════════');
  console.log(` Resultado: ${passou} passou(ram) · ${falhou} falhou(ram)`);
  console.log('══════════════════════════════════════\n');
  if (falhou > 0) process.exit(1);
}

rodar();