---
name: nestjs-unit
description: Padrão de testes unitários do projeto NestJS
---

# Fluxo de desenvolvimento

1. Primeiro analisar os métodos existentes no service
2. Criar testes apenas para métodos reais do service
3. Nunca inventar cenários inexistentes
4. Nunca criar métodos fictícios
5. Validar apenas comportamento da camada atual

# Mocks

- Nunca recriar mocks já existentes
- Sempre reutilizar arquivos em test/mock
- DatabaseService já possui mock centralizado em:
  test/mock/database.mock.ts

- Nunca criar mock inline se já existir mock compartilhado

# Unit tests

- Unit tests não usam banco real
- Unit tests mockam dependências externas
- O foco é validar comportamento do service

# Estrutura esperada

- beforeEach cria TestingModule
- usar providers com useValue
- usar fixtures reutilizáveis
- usar AAA pattern

# Regras importantes

- Não testar Prisma diretamente
- Não criar lógica que não existe no service
- Não criar "its" artificiais apenas para aumentar cobertura
- Não criar cenários irrelevantes
- Respeitar exatamente os métodos implementados

# Fixtures

- reutilizar fixtures existentes em test/fixtures
- nunca criar fixture duplicada

# Assertions

- validar retorno
- validar chamadas do mock
- usar toHaveBeenCalledWith
- validar exceptions apenas quando existirem no service
