---
name: factorie-fixture
description: Criação e reutilização correta de fixtures e factories nos testes
---

# Definições

Fixture: objeto estático com valores fixos que representa um caso canônico reutilizável.

- use quando o mesmo dado aparece igual em múltiplos testes
- NÃO use faker — valores fixos garantem previsibilidade em toHaveBeenCalledWith

Factory: função que gera objetos com valores dinâmicos via faker, aceita overrides.

- use quando precisa de variações do mesmo objeto
- use quando o dado é gerado em runtime e não pode ser hardcoded

# Antes de criar qualquer fixture ou factory

1. Leia test/fixtures/ e teste/factories/ — liste o que já existe
2. Verifique se o dado que você precisa já está coberto
3. Só crie se não existir equivalente

# Quando criar fixture

- o mesmo objeto (mesmo shape, mesmos campos) aparece em 2+ arquivos de teste
- representa uma entidade ou DTO canônico (ex: userFixture, tokenFixture)
- o valor precisa ser estável para assertions com toHaveBeenCalledWith

# Quando criar factory

- o teste precisa de variações do mesmo objeto (ex: user ativo vs inativo)
- o dado é dinâmico por natureza (ex: timestamps, IDs gerados)
- precisa de override por parâmetro

# Padrão de fixture

Arquivo: test/fixtures/{entidade}.fixture.ts

export const nomeFixture = {
campo: 'valor-fixo-e-descritivo',
email: 'nome@example.com', // fixo, não faker
id: 1,
}

# Padrão de factory

Arquivo: test/factories/{entidade}.factories.ts

import { faker } from '@faker-js/faker'

export function nomeFactory(overrides?: Partial<NomeTipo>): NomeTipo {
return {
id: faker.number.int(),
email: faker.internet.email(),
...overrides,
}
}

# Relação com o service testado

Antes de criar fixture/factory para um service, mapeie:

- quais DTOs ele recebe (input)
- quais entidades ele retorna (output)
- quais objetos ele passa para dependências

Crie fixture/factory apenas para os que se repetem entre unit, integration ou e2e.

# Proibido

- criar fixture com faker (valores não determinísticos quebram assertions)
- criar fixture duplicada de uma já existente com outro nome
- criar factory quando fixture já resolve
- criar fixture isolada usada em apenas 1 it de 1 arquivo

# Constantes vs fixture

- Valor usado em 2+ lugares no mesmo arquivo de teste → const local no topo
- Valor usado em 2+ arquivos de teste → fixture
- Nunca string mágica solta dentro de expect() ou mock.mockResolvedValue()

# Response fixtures

Se um mesmo objeto de resposta aparece em múltiplos testes:

- extrair para fixture
- principalmente auth responses

Exemplo:

- loginResponseFixture
- signupResponseFixture

# atentar

Factories devem representar entidades variáveis.

Não criar factory para:

- DTO simples
- payload pequeno
- objetos usados em cenário único
