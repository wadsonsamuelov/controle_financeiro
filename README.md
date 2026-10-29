<div align="center">

<h1>FinTrack</h1>
<p><strong>Gestão financeira pessoal — inteligente, visual e sem dependências.</strong></p>

<p>
  <img alt="status" src="https://img.shields.io/badge/status-em%20desenvolvimento-orange?style=flat-square">
  <img alt="version" src="https://img.shields.io/badge/version-2.2.3-blue?style=flat-square">
  <img alt="license" src="https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square">
  <img alt="ci" src="https://img.shields.io/github/actions/workflow/status/wadsonsamuelov/controle_financeiro/ci.yml?label=CI%2FCD&style=flat-square">
  <img alt="html" src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white">
  <img alt="js" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black">
  <img alt="supabase" src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white">
</p>

</div>

---
https://wadsonsamuelov.github.io/controle_financeiro/
## Por que usar o FinTrack?

A maioria das pessoas sabe que precisa controlar as finanças. Poucas realmente fazem isso — porque as ferramentas disponíveis são ou complexas demais, ou pagas, ou exigem cadastro em serviços que ninguém confia.

**O FinTrack resolve isso.**

É uma aplicação web completa que roda direto no navegador. Sem instalar nada. Sem pagar nada. Sem depender de um app de terceiro que some depois. Você abre, cadastra suas movimentações e em segundos tem um painel com tudo que precisa saber sobre sua saúde financeira.

> Saldo disponível. Receitas vs despesas. Metas de economia. Cotação do dólar em tempo real. Calendário de vencimentos. Tudo em um único lugar, com uma interface que não envergonha.

Se você já quis parar de usar planilha mas nunca encontrou uma alternativa gratuita e decente — essa é ela.

---

## Funcionalidades

| Módulo | O que faz |
|---|---|
| **Home** | Painel de boas-vindas com saldo, ações rápidas e últimas movimentações |
| **Dashboard** | KPIs (receita, despesa, taxa de poupança), gráfico histórico de 6 meses e resumo mensal |
| **Transações** | Cadastro, edição e exclusão de receitas e despesas com filtros por tipo e método de pagamento |
| **Projetos & Metas** | Criação de objetivos financeiros com progresso visual em barra |
| **Calendário** | Eventos financeiros por data (salário, gastos fixos, vencimentos, recorrências) |
| **Distribuição** | Análise de gastos por categoria e por método de pagamento via gráficos de pizza |
| **Câmbio** | Cotações em tempo real (USD, EUR, BTC) + conversor de moedas com swap |
| **Configurações** | Perfil, conta, aparência, notificações, preferências financeiras, privacidade e plano |
| **Tema** | Modo claro e escuro com persistência |
| **Persistência** | Transações sincronizadas via Supabase; metas e eventos salvos em `localStorage` |

---

## Stack técnica

| Camada | Tecnologia | Detalhes |
|---|---|---|
| Estrutura | HTML5 | SPA sem framework, roteamento manual via JS |
| Estilo | CSS3 | Custom properties, grid, modo escuro nativo |
| Lógica | JavaScript (ES2022) | Vanilla JS, async/await, sem bundler |
| Gráficos | Chart.js 4.4 | Bar e doughnut charts via CDN |
| Backend | Supabase | Banco PostgreSQL gerenciado, SDK JS v2 |
| Câmbio | AwesomeAPI | REST público para cotações BRL/USD/EUR/BTC |
| Tipografia | Plus Jakarta Sans + JetBrains Mono | Google Fonts |
| CI/CD | GitHub Actions | Testes + deploy automático no GitHub Pages |
| Hospedagem | GitHub Pages | Deploy disparado a cada push na `main` |

---

## Arquitetura

O FinTrack é uma **SPA (Single Page Application)** construída sem framework. O roteamento é feito via JavaScript puro com a função `goto()`, que ativa/desativa seções `div.page` conforme a navegação.

```
controle_financeiro/
├── src/
│   ├── index.html          # Shell da aplicação — todo o HTML vive aqui
│   ├── script.js           # Toda a lógica: estado, CRUD, gráficos, API calls
│   └── style.css           # Design system via CSS custom properties
├── tests/
│   └── api.tests.js        # Testes de integração da API de câmbio
├── .github/
│   └── workflows/
│       └── ci.yml          # Pipeline: test → deploy
├── package.json
└── README.md
```

### Fluxo de dados

```
Usuário
  │
  ├─ Transações ──► Supabase (PostgreSQL)  ← fonte de verdade para TX
  │                      ↓
  │              loadTransacoes() na inicialização
  │
  ├─ Metas / Eventos ──► localStorage  ← persistência local
  │
  └─ Câmbio ──► AwesomeAPI REST  ← chamada sob demanda
```

### Estado da aplicação

O estado global é mantido em variáveis module-level (`TX`, `GOALS`, `CEVS`) e sincronizado com Supabase (transações) e `localStorage` (demais dados). Não há gerenciador de estado externo — o re-render é acionado diretamente após cada mutação via funções de render (`renderTxList`, `renderGoals`, etc.).

---

## Como rodar localmente

O projeto não precisa de build. Basta servir o diretório `src/`:

```bash
# Com Python
python -m http.server 8080 --directory src

# Com Node.js (npx)
npx serve src

# Com VS Code — instale a extensão Live Server e abra index.html
```

Acesse em `http://localhost:8080`.

> As transações são salvas no Supabase configurado. Para usar sua própria instância, edite `SUPABASE_URL` e `SUPABASE_KEY` no início de `src/script.js`.

---

## Testes

Os testes verificam o comportamento do aplicativo com respostas simuladas das APIs, sem acessar os provedores reais:

```bash
npm test
# Gera também evidencias/resultados.md e evidencias/resultados.json
```

---

## CI/CD

O pipeline é definido em [.github/workflows/ci.yml](.github/workflows/ci.yml) e roda automaticamente em todo push e pull request para `main`:

```
push → main
  │
  ├─ [test]   Testes de integração (Node 20)
  │
  └─ [deploy] Upload do diretório src/ → GitHub Pages
               (só executa se os testes passarem)
```

---

## Variáveis de ambiente

Não há arquivo `.env`. As credenciais do Supabase estão diretamente em `script.js` com a chave `publishable` (segura para uso client-side, conforme [documentação do Supabase](https://supabase.com/docs/guides/api/api-keys)).

Para produção com sua própria instância:

| Variável | Onde alterar | Descrição |
|---|---|---|
| `SUPABASE_URL` | `src/script.js:7` | URL do projeto Supabase |
| `SUPABASE_KEY` | `src/script.js:8` | Chave anon/publishable |

---

## Schema do banco (Supabase)

### Configurar o banco real para a demonstração

O projeto atual já respondeu aos testes reais com sucesso. Para configurar uma nova instância de demonstração, execute primeiro [supabase/schema.sql](supabase/schema.sql) e depois [supabase/demo.sql](supabase/demo.sql) no SQL Editor. O primeiro cria a tabela e ativa RLS; o segundo permite as operações que o aplicativo sem login utiliza. Não é necessário reaplicar esses arquivos para repetir os testes no banco atual.

**Somente dados fictícios:** as políticas de demonstração permitem que qualquer visitante consulte, cadastre, edite e exclua transações. Não utilize esse modo para finanças pessoais.

Depois execute:

```bash
npm run test:real
```

Esse comando usa a conexão atual de `src/script.js`, verifica a tabela, cadastra um registro `TESTE-AULA-<identificador>`, consulta o registro salvo, testa erros 400 e tenta remover somente o registro criado nesta execução. Não limpa a tabela inteira. Em uma falha de rede durante a criação ou limpeza, confira se o registro com esse marcador permaneceu no banco.

Os relatórios são gravados em `evidencias/resultados-reais.md` e `evidencias/resultados-reais.json`, separados dos testes simulados. O erro 500 continua sendo simulado por `npm test`: não provocamos falhas no banco real. Esta suíte real não roda automaticamente no pipeline.

**Execução real comprovada:** oito verificações passaram, incluindo criação (201), consulta do registro persistido (200), ausência de campo obrigatório (400), tipo numérico inválido (400) e remoção do registro de teste (204), seguida de consulta confirmando sua ausência. Veja o [relatório real](evidencias/resultados-reais.md) e as [requisições e respostas recebidas](evidencias/resultados-reais.json). Somente registros fictícios com identificador exclusivo são usados; o teste não remove outras transações.

Criar os arquivos SQL no repositório não cria a tabela no serviço: é necessário executá-los no SQL Editor. Um erro real `404 / PGRST205` indica que a API não encontrou a tabela; não equivale à aprovação dos cenários 200, 201 ou 400.

A tabela `transacoes` no PostgreSQL:

```sql
create table transacoes (
  id    bigint generated always as identity primary key,
  desc  text        not null,
  val   numeric     not null,
  tipo  text        not null,  -- 'receita' | 'despesa'
  met   text,                  -- 'pix' | 'cartao' | 'dinheiro' | 'boleto' | 'ted' | 'debito'
  cat   text,                  -- 'alimentação' | 'moradia' | 'transporte' | ...
  data  date        not null
);
```

---

## Contribuindo

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/minha-melhoria`
3. Commit suas mudanças: `git commit -m 'feat: adiciona X'`
4. Push: `git push origin feature/minha-melhoria`
5. Abra um Pull Request

Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/) nas mensagens.

---

## Licença

Distribuído sob a licença MIT. Veja [LICENSE](LICENSE) para mais informações.

---

<div align="center">
  <sub>Feito por <a href="https://github.com/wadsonsamuelov">Wadson Samuel</a></sub>
  <sub> e <a href="https://github.com/rth-ur">Arthur Clemente</a></sub>
</div>

## Cenários de testes das APIs — atividade da próxima aula

### Objetivo e ambiente

Cada cenário abaixo informa endpoint, método HTTP, dados enviados, status e conteúdo esperado. A aprovação exige conferir **status e corpo da resposta**, além dos efeitos da operação quando aplicável.

O FinTrack é uma aplicação de navegador: as transações utilizam a API REST do Supabase e o câmbio utiliza a AwesomeAPI. Metas e eventos ficam no `localStorage` e não possuem endpoints HTTP. Não existe um servidor próprio do FinTrack retornando esses status.

Execute os cenários de transações em uma **instância de testes do Supabase**, com a tabela definida neste README, acesso permitido pelas políticas de teste e sem dados reais. Use:

- `BASE_URL=https://<projeto-de-testes>.supabase.co/rest/v1`.
- Headers `apikey: <chave-publicável-do-projeto-de-testes>` e `Content-Type: application/json`.
- Quando a política exigir autenticação, acrescente `Authorization: Bearer <token-do-usuário-de-teste>`.
- Nas criações, envie também `Prefer: return=representation` e `Accept: application/vnd.pgrst.object+json`, correspondentes ao retorno solicitado por `insert().select().single()` no aplicativo.
- Registre status e JSON recebidos, resultado (aprovado/reprovado) e data da execução. IDs são gerados pelo banco; não compare com um número fixo.

Os exemplos abaixo são **resultados esperados**, não evidências de execução contra os provedores.

### CT-01 — Listar transações com sucesso (200)

| Campo | Especificação |
|---|---|
| Endpoint | `{BASE_URL}/transacoes?select=*&order=data.desc` |
| Método HTTP | `GET` |
| Dados enviados | Sem corpo; parâmetros `select=*` e `order=data.desc`. |
| Pré-condição | Cadastrar previamente a transação de CT-02 no banco de testes. |
| Status esperado | `200 OK` |
| Resposta esperada | Array JSON contendo a transação cadastrada, com `id`, `desc`, `val`, `tipo`, `met`, `cat` e `data`. |

Verifique os valores da transação cadastrada e a ordenação decrescente por data. Exemplo de item esperado: `{"id":123,"desc":"Compra de teste","val":50,"tipo":"despesa","met":"pix","cat":"transporte","data":"2026-10-28"}`. O ID é ilustrativo; para comparar o valor financeiro, converta `val` para número, como faz a aplicação.

### CT-02 — Criar transação válida (201)

| Campo | Especificação |
|---|---|
| Endpoint | `{BASE_URL}/transacoes?select=*` |
| Método HTTP | `POST` |
| Dados enviados | JSON abaixo e headers de criação descritos no ambiente. |
| Status esperado | `201 Created` |
| Resposta esperada | Objeto JSON com `id` gerado e todos os valores enviados preservados. |

```json
{
  "desc": "Compra de teste",
  "val": 50,
  "tipo": "despesa",
  "met": "pix",
  "cat": "transporte",
  "data": "2026-10-28"
}
```

Verifique que `id` é um inteiro positivo, que os demais campos correspondem à entrada e que uma consulta posterior por `id` encontra exatamente o recurso criado. Anote esse ID para remover somente o registro de teste ao terminar.

### CT-03 — Omitir campo obrigatório (400)

| Campo | Especificação |
|---|---|
| Endpoint | `{BASE_URL}/transacoes?select=*` |
| Método HTTP | `POST` |
| Dados enviados | `{"val":50,"tipo":"despesa","met":"pix","cat":"transporte","data":"2026-10-28"}` — campo `desc` omitido. |
| Status esperado | `400 Bad Request` |
| Resposta esperada | Objeto JSON de erro com `code: "23502"` e `message` indicando a violação do campo obrigatório `desc`. |

Verifique que `message` é uma string não vazia e menciona `desc`. Não fixe a mensagem inteira, pois ela pode variar conforme o provedor. Confirme que nenhum registro foi criado. Este cenário pressupõe a restrição `desc text not null` descrita no schema.

### CT-04 — Enviar valor de tipo inválido (400)

| Campo | Especificação |
|---|---|
| Endpoint | `{BASE_URL}/transacoes?select=*` |
| Método HTTP | `POST` |
| Dados enviados | `{"desc":"Valor inválido de teste","val":"abc","tipo":"despesa","met":"pix","cat":"transporte","data":"2026-10-28"}`. |
| Status esperado | `400 Bad Request` |
| Resposta esperada | Objeto JSON com `code: "22P02"` e `message` indicando valor inválido para o tipo numérico. |

Verifique que a mensagem é não vazia e identifica o problema de conversão numérica. Confirme que a transação inválida não foi persistida.

### CT-05 — Consultar cotações válidas (200)

| Campo | Especificação |
|---|---|
| Endpoint | `https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL` |
| Método HTTP | `GET` |
| Dados enviados | Sem corpo; pares de moedas no caminho. |
| Status esperado | `200 OK` |
| Resposta esperada | Objeto JSON com as chaves `USDBRL`, `EURBRL` e `BTCBRL`; cada cotação deve conter `bid`, `ask`, `high`, `low` e `pctChange`. |

Verifique que os valores podem ser convertidos em números finitos; `bid`, `ask`, `high` e `low` devem ser positivos. `pctChange` pode ser negativo ou zero. Cotações reais variam: não compare com valores fixos. Em testes com mock, compare também os valores definidos na fixture.

### CT-06 — Falha interna controlada (500)

| Campo | Especificação |
|---|---|
| Endpoint | `{BASE_URL}/transacoes?select=*&order=data.desc` (interceptado no ambiente de testes). |
| Método HTTP | `GET` |
| Dados enviados | Sem corpo; mesma consulta válida do CT-01. |
| Simulação | Substituir somente a resposta dessa requisição por um mock HTTP com status 500 e o JSON abaixo. |
| Status esperado | `500 Internal Server Error` |
| Resposta esperada | `{"message":"Não foi possível concluir a solicitação. Tente novamente mais tarde."}`. |
| Resultado esperado no FinTrack | Aviso `Não foi possível carregar dados do banco.`, sem detalhes técnicos na interface. |

**Procedimento da simulação:**

1. Abra o FinTrack em ambiente local de testes, configurado para o Supabase de testes.
2. Use uma ferramenta de interceptação HTTP do navegador ou do executor de testes para interceptar a consulta à tabela `transacoes`.
3. Configure a interceptação para responder com status `500`, header `Content-Type: application/json` e o JSON genérico acima, sem encaminhar a requisição ao Supabase.
4. Recarregue a aplicação para executar `loadTransacoes()`. Registre o status e o corpo HTTP e confira o aviso apresentado ao usuário.
5. Confirme que o corpo e o aviso não contêm stack trace, SQL, nomes de arquivos internos, credenciais ou informações de conexão. Remova a interceptação e confirme que o carregamento normal volta a funcionar.

O status deve ser exatamente 500: um bloqueio de rede ou timeout não substitui este cenário. Não desligue serviços nem provoque falhas no banco de produção.

**Limite da verificação:** esse teste confirma o comportamento do aplicativo diante de uma resposta 500 simulada. O JSON genérico é definido pelo mock; ele não comprova que o Supabase sanitiza todas as falhas reais. A aplicação já apresenta uma mensagem genérica no carregamento, mas o tratamento atual também registra o erro no console. Uma avaliação que inclua o console precisa verificar e tratar esse ponto separadamente.

### Execução, pipeline e evidências

```bash
npm test
```

A suíte original em [tests/api.tests.js](tests/api.tests.js) verifica cinco condições de sucesso do câmbio com `fetch` simulado. A nova suíte [tests/scenarios.tests.js](tests/scenarios.tests.js) executa as funções reais de `src/script.js`, substituindo o SDK Supabase, o `fetch` e os elementos da página por simulações controladas. Não instala dependências e funciona no Node 20 ou superior.

Foram executados **sete cenários simulados, todos aprovados**, além das cinco verificações originais. CT-01 a CT-06 correspondem aos cenários acima; CT-07 acrescenta uma resposta HTTP 500 simulada no câmbio, verificando o aviso genérico e o botão de nova tentativa. Os arquivos de evidência são sobrescritos a cada execução e registram o resultado daquela execução, inclusive falhas.

**Evidências para apresentar:**

- [Relatório legível com data, versão do Node e resultado por cenário](evidencias/resultados.md).
- [Relatório JSON com entradas, status e corpos simulados e verificações](evidencias/resultados.json).
- Para demonstrar ao vivo, abra o terminal na pasta do projeto e execute `npm test`. Mostre as linhas `PASSOU CT-01` até `PASSOU CT-07`, a contagem final e os relatórios gerados. Pode salvar uma captura dessa execução para a apresentação.
- Após publicar e executar o [pipeline](.github/workflows/ci.yml), abra **GitHub → Actions → execução → Artifacts → evidencias-testes-simulados** para baixar os relatórios daquela execução. Uma execução local não comprova que o pipeline remoto passou.

**O que está comprovado:** as funções do FinTrack enviam os parâmetros previstos, normalizam os dados de sucesso, propagam erros de criação e apresentam avisos genéricos de falha no carregamento. Nos cenários de Supabase, os status são metadados das fixtures do SDK; o aplicativo recebe os campos `data` e `error`. No câmbio, o aplicativo recebe objetos `Response` HTTP simulados.

**Limite dos testes simulados:** eles não comprovam status HTTP e validação efetivos do Supabase, persistência, ordenação real dos registros ou sanitização de erros pelo provedor. A suíte separada `npm run test:real` agora comprova criação, consulta, erros 400 e limpeza no banco real, conforme o [relatório real](evidencias/resultados-reais.md). A ordenação de múltiplos registros e a sanitização de falhas reais do provedor continuam sem verificação. O corpo genérico do erro 500 é definido pela simulação. O console da aplicação ainda registra erros do banco; a mensagem visual verificada é genérica.

O pipeline agora executa `npm test` e salva os relatórios como artefato. O deploy continua dependendo do sucesso dos testes. Para uma execução manual contra os provedores, registre separadamente data, status efetivamente recebido, corpo, efeitos no banco e resultado; não apresente o relatório simulado como teste de integração real.

Depois dos testes, remova os registros criados na instância de testes usando os IDs anotados. Não inclua chaves nem tokens nas evidências.

### Pequena explicação para apresentar

Um cenário de teste define a requisição e o resultado esperado. Neste projeto, verificamos consultas válidas com 200, criação com 201, dados inválidos com 400 e uma falha interna simulada com 500. Além do status, conferimos o JSON, a persistência dos dados e a mensagem exibida ao usuário. O erro 500 é simulado em testes para não afetar a produção.

### Entrega ao professor

- Repositório: [controle_financeiro no GitHub](https://github.com/wadsonsamuelov/controle_financeiro).
- Publicar este README no GitHub antes da aula.
- Um membro do grupo deve enviar o link pelo **Espaço Aluno**, antes da próxima aula. A data da aula não foi informada.

Mensagem sugerida: “Professor, seguem os cenários de testes das APIs do FinTrack, documentados no README: https://github.com/wadsonsamuelov/controle_financeiro. Incluímos endpoint, método, dados enviados, status e resposta esperados para sucesso, requisição inválida e falha interna controlada.”
