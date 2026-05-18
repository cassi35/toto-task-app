---
name: refactor-test-exception
description: colocando exceptions testes corretamtente
---

# Objetivo

o objetivo é substuir todos os it de testes de integration , e2e de throw em vez da string
importar as exceptions

# steps

1. listar na pasta src/common/exceptions todas as exceptions
2. verificar em cada pasta de integration dentro dos arquivos se precisa trocar para new throw ExceptionEscolhida()

# exemplo

1.  verificou rejects.toThrow('token not found');
2.  trocar para.rejects.toThrow(
    new TokenNotFoundException(),
    )

# rules

- não mecher na estrtura em hipotese nenhuma
- os imports tem que ser corretos

# adendo

se nao exitir na lista exceptions deixe como esta
