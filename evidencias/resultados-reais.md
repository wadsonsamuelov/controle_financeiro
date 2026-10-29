# Testes reais — Supabase

Execução UTC: 2026-10-28T23:42:30.293Z

REAL: requisições HTTP ao Supabase configurado no aplicativo.

| Cenário | Status HTTP recebido | Resultado |
|---|---|---|
| REAL-00: Tabela acessível | 200 | APROVADO |
| CT-02: Criar registro fictício | 201 | APROVADO |
| CT-01: Consultar registro persistido pelo ID | 200 | APROVADO |
| CT-03: Rejeitar campo obrigatório ausente | 400 | APROVADO |
| CT-04: Rejeitar valor numérico inválido | 400 | APROVADO |
| REAL-01: Marcador exclusivo aparece somente no registro criado | 200 | APROVADO |
| LIMPEZA: Remover somente o registro criado nesta execução | 204 | APROVADO |
| LIMPEZA-02: Confirmar remoção do registro de teste | 200 | APROVADO |

8 aprovados; 0 reprovados. Somente os cenários listados foram executados.

Erro 500 não é provocado no banco real; continua simulado na suíte npm test. CT-01 consulta por ID e não comprova ordenação de múltiplas transações. Se houver erro de rede durante a criação, um registro com o marcador pode permanecer no banco.

Detalhes: [resultados-reais.json](resultados-reais.json).
