---
name: nestjs-unit
description: Padrão de testes unitários do projeto NestJS
---

# Antes de escrever qualquer teste

1. Leia o arquivo do service a ser testado
   - mapeie todos os métodos públicos
   - mapeie todas as dependências injetadas no constructor

2. Para cada dependência, verifique se já existe mock em test/mock/services/
   - padrão de nome: test/mock/services/{nomeService}.mock.ts
   - ex: UsersService → test/mock/services/usersService.mock.ts
   - se existir: importe e use
   - Crie mock apenas para métodos efetivamente utilizados pelo service testado.

3. Verifique se DatabaseService já tem mock em test/mock/database.mock.ts
   - sempre reutilize, nunca recrie

4. Verifique fixtures disponíveis em test/fixtures/ e factories em test/factories/
   - consulte a skill factorie-fixture para decidir se cria fixture nova

# Responsabilidade por camada

Unit:

- mocka dependências externas
- não usa banco real
- valida comportamento isolado do service

Integration:

- integra com banco/test module real
- pode usar Prisma real
- não mocka camada persistência
- valida integração entre módulos

E2E:

- sobe app completo
- testa fluxo HTTP real
- usa supertest/app.inject
- valida contrato da API

# Estrutura do arquivo de teste

- beforeEach com jest.clearAllMocks() + TestingModule
- providers com useValue apontando para mocks importados de test/mock/
- nunca declare mock inline dentro do arquivo de teste

# Escrita dos testes (it)

- crie it apenas para métodos públicos reais do service
- siga o padrão AAA: Arrange / Act / Assert
- para cada método, cubra:
  - caminho feliz (success case)
  - cada exceção que o service lança explicitamente

# Mocks

- nunca recrie mock que já existe em test/mock/
- nunca crie mock inline se já existe arquivo de mock
- se o mock não existir, crie em test/mock/services/{nomeService}.mock.ts com o padrão:
  export const nomeServiceMock = {
  metodo: jest.fn(),
  ...
  }
- exporte todos os métodos que o service utiliza

# Assertions

- valide o retorno do método (toEqual)
- valide chamadas de dependências (toHaveBeenCalledWith)
- valide exceções com rejects.toThrow(new HttpException(...))
- não use assertions genéricas (toBeTruthy, toBeDefined) quando é possível ser específico

# Proibido

- importar variáveis de ambiente secretas (.env)
- criar cenários que não existem no service
- criar it apenas para aumentar cobertura
- mockar métodos privados com spyOn exceto quando for o único caminho
  (se precisar, documente o motivo no comentário)
- criar mock de um service dentro do arquivo de teste de outro service
- testar implementacao de libs externas como
- bcrypt
- jwt
- prisma
- faker
  Validar apenas:
- integração da chamada
- comportamento do service
- nunca mockar o método do próprio service testado
- mockar apenas dependências externas

# Organização do arquivo de teste

- Um describe externo: describe('NomeService', () => { ... })
- Um describe interno por método público:
  describe('login', () => { ... })
  describe('signup', () => { ... })
- Constantes repetidas dentro do arquivo: extraia para const no topo
  ex: const HASHED_PASSWORD = 'hashed-password'

# Métodos privados

- Valide método privado pelo retorno do método público que o chama
- Nunca use spyOn em privado para testar lógica que pode ser
  validada indiretamente
- Se o método privado chama dependência externa: candidate a extrair
  para helper injetável
- spyOn em privado: último recurso, sempre com comentário explicando
  por que não foi possível validar indiretamente

# DTO vs Entity

Nunca reutilizar fixture de entidade como DTO.

Separar explicitamente:
por exemplo

- loginDtoFixture
- signupDtoFixture
- userEntityFixture
- tokenEntityFixture

DTO representa input do método.
Entity representa retorno persistido.

# estrttura

Dados imutáveis:

- const no topo

Dados mutáveis por teste:

- criar dentro do it
- ou beforeEach quando compartilhado

# Determinismo

- evitar valores aleatórios não controlados
- mockar:
  - Date.now
  - Math.random
  - uuid
  - crypto.randomUUID
    quando impactarem assertions

# Anti abstração

Não extrair para const:

- strings pequenas usadas poucas vezes
- responses usadas em apenas 1 teste
- payloads sem reutilização real

Só extrair quando:

- reduz complexidade
- melhora semântica
- reduz duplicação real

# Hierarquia de extração

1. inline simples
2. const local
3. fixture compartilhada
4. factory

Preferir sempre o menor nível possível.
