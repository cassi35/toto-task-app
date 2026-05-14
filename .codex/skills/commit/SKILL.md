---
name: commit
description: esse skill é para cracao de commit
---

# fluxo

1. git status pra entender o que foi modificado
2. leia no terminal os modificado

- git add cada arquivo
- pegue o contexto das conversas anteriores
- git commit -m '[feat/fix/style/refactor/test/chore] aquiColoca o argumento '
- # observacao
  - quero que voce entenda o que foi criado pegue referencias do historico de prompt dos ultimos ou se eu eu usar de contexto esse fluxo altere o que acabei de criar

# exemplo

- 1.  git status
- 2. **saida**

```
 .codex/skills/AGENTS.md
        .codex/skills/exceptions/
        .codex/skills/factories/
        .codex/skills/refactor-test/
        src/common/exeptions/
        src/enums/
        test/fixtures/auth.fixture.ts
        test/fixtures/email.fixture.ts
        test/fixtures/employee.fixture.ts
        test/fixtures/token.fixture.ts
        test/mock/services/mailerService.mock.ts

```

- 3. **historico chat ou o prompt \***
     - **prompt**
     ```
     [$nestjs-unit](/home/cassiano/projetosGithub/toto-task-app/.codex/skills/e2e/SKILL.md) [$factorie-fixture](/home/cassiano/projetosGithub/toto-task-app/.codex/skills/factories/SKILL.md)
     Gerar unit tests para:
     ```
- auth
- email
- employees
- token

Users já existe.

Seguir rigorosamente:

- reutilização
- anti-duplicação
- DTO != entity
- sem mock inline
- sem spy em private
- sem abstração prematura

``

- 4. **comecar os add**
  1. observe conjuntos de arquivos como no exemplo tem [test/unit, .codex/skills, test/fixture]
  - **exemplo**
  1.  adicione manualmente o git add test/unit/
  2.  git commit -m 'feat: create a new unit test token , auth , email , users'
  3.  assim sucessivamente ...

  4.  git push origin
  5.  git pull (para atualizar)

# lembrando

- estou no diretorio cassiano@cassiano-IdeaPad-3-15ALC6:~/projetosGithub/toto-task-app$
- quando altero anote.txt o git add tem que ser individual e commit com -m 'feat: o que alterei'
- o commit tem que ser em ingles

# o que nao fazer

- nao quero commit aleatorio use estrtura profissional [feat/fix/style/refactor/test/chore]
- nao quero que os commits de -m '' sejam aleatorios quero que se baseie no contexto formecido ou ja fornecido
- quero

# variaveis

- se quando colocar git status ja estar como modified crie o commit
