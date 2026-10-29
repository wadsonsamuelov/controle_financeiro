-- Execute no SQL Editor do projeto Supabase.
-- Cria somente a tabela; não apaga nem substitui tabelas existentes.
-- O acesso pelo aplicativo depende das políticas RLS, definidas separadamente.
begin;

create table if not exists public.transacoes (
  id bigint generated always as identity primary key,
  "desc" text not null,
  val numeric not null,
  tipo text not null,
  met text,
  cat text,
  data date not null
);

alter table public.transacoes enable row level security;

commit;

-- Com RLS ativada, nenhuma política nova de acesso público é criada.
-- Defina as políticas antes de tentar cadastrar dados pelo aplicativo.
-- Se a tabela já existia, este script não remove políticas anteriores
-- nem corrige diferenças entre suas colunas e o schema acima.
