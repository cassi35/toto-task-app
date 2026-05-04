enum AuthRouter {
  BASE = 'auth',
  LOGIN = 'login',
  SIGNUP = 'signup',
  LOGOUT = 'logout',
  VERIFY_EMAIL = 'verify-email',
  FORGOT_PASSWORD = 'forgot-password',
  RESET_PASSWORD = 'reset-password',
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
  GOOGLE_CALLBACK = 'google/callback',
  MICROSOFT_CALLBACK = 'microsoft/callback',
}
export default AuthRouter;
/* 
✔ evita erro de digitação
✔ melhora refactor
✔ padroniza rotas
✔ reutiliza em testes e controller
*/
