---
name: test-refactor
description: Refatoração de testes existentes
---

# Objetivo

Refatorar testes existentes sem reescrever do zero.

# Antes de alterar

1. Ler o arquivo inteiro
2. Identificar:
   - duplicação
   - literals repetidos
   - payloads inline
   - fixtures duplicadas
   - spy desnecessário
   - assertions fracas
   - factories artificiais

# Pode fazer

- extrair const
- extrair fixture reutilizável
- substituir payload inline repetido
- dividir describe muito grande
- reutilizar mock existente
- remover código morto

# Não pode

- alterar lógica validada
- criar novos cenários
- reescrever arquivo inteiro
- criar abstração prematura
- criar helper sem reutilização real
- criar factory sem necessidade

# Regras

- DTO != entity
- fixture fixa
- factory dinâmica
- sem mock inline
- sem spy em private sem necessidade
