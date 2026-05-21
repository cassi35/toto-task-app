# Auth Module

## Objetivo

Permitir cadastro e login de usuários.

## Features

- Signup
- Login
- Refresh Token
- Logout

## Regras

### Signup

- Email obrigatório
- Senha mínimo 8 caracteres
- Email deve ser único
- Senha deve ser hashada

### Login

- Validar credenciais
- Retornar JWT

## Endpoints

POST /auth/signup

Request:

```json
{
  "email": "user@email.com",
  "password": "12345678"
}
```
