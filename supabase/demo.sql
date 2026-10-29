-- SOMENTE DEMONSTRAÇÃO PÚBLICA COM DADOS FICTÍCIOS.
-- Execute schema.sql antes deste arquivo, no SQL Editor do mesmo projeto.
-- Qualquer visitante poderá consultar, criar, editar e excluir transações.
-- Não use estas políticas com dados financeiros pessoais.
begin;

grant usage on schema public to anon;
grant select, insert, update, delete on table public.transacoes to anon;
grant usage, select on sequence public.transacoes_id_seq to anon;

-- A remoção abaixo afeta somente as políticas de demonstração deste arquivo.
drop policy if exists fintrack_demo_select on public.transacoes;
drop policy if exists fintrack_demo_insert on public.transacoes;
drop policy if exists fintrack_demo_update on public.transacoes;
drop policy if exists fintrack_demo_delete on public.transacoes;

create policy fintrack_demo_select on public.transacoes
  for select to anon using (true);
create policy fintrack_demo_insert on public.transacoes
  for insert to anon with check (true);
create policy fintrack_demo_update on public.transacoes
  for update to anon using (true) with check (true);
create policy fintrack_demo_delete on public.transacoes
  for delete to anon using (true);

commit;
