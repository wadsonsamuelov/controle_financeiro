# Evidência de execução — FinTrack

Execução (UTC): 2026-10-28T23:32:07.108Z. Node: v26.1.0. Comando: npm test.

SIMULAÇÃO: funções reais de src/script.js com SDK Supabase, fetch e DOM substituídos.

Status do Supabase são fixtures do SDK, não respostas HTTP medidas. Não comprova validação ou persistência no banco, nem sanitização do provedor. Câmbio usa objetos Response simulados. O console ainda registra erros do banco.

| Cenário | Status SIMULADO | Resultado | Verificações |
|---|---|---|---|
| CT-01 — Listagem | 200 | APROVADO | Consulta correta ao SDK; Estado recebe todos os campos e valor numérico |
| CT-02 — Criação | 201 | APROVADO | Registro enviado ao SDK; Retorno com id e campos normalizados |
| CT-03 — Campo obrigatório ausente | 400 | APROVADO | Entrada encaminhada ao SDK; Operação rejeitada com código e mensagem do erro simulado |
| CT-04 — Tipo numérico inválido | 400 | APROVADO | Entrada encaminhada ao SDK; Operação rejeitada com código e mensagem do erro simulado |
| CT-05 — Câmbio | 200 | APROVADO | URL correta; Campos das três moedas convertidos; Interface renderizada e botão habilitado |
| CT-06 — Erro interno nas transações | 500 | APROVADO | Aviso visual genérico; Estado anterior preservado |
| CT-07 — Erro HTTP no câmbio | 500 | APROVADO | Trata Response HTTP 500 simulado; Mensagem visual genérica e botão habilitado |

Resultado: 7 aprovados; 0 reprovados.

Entradas e respostas simuladas completas: [resultados.json](resultados.json).
