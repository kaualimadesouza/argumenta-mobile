import { ApiError } from './ApiError'

/** pt-BR for the domain errors the auth and onboarding screens can hit today.
 *  Extend this table as later cards reach new endpoints. */
export const MESSAGES: Record<string, string> = {
  EmailAlreadyRegisteredError: 'Esse e-mail já tem uma conta. Entre em vez de criar.',
  InvalidCredentialsError: 'E-mail ou senha não conferem.',
  TermsNotAcceptedError: 'Você precisa aceitar os termos para criar a conta.',
  GoogleSignInFailedError: 'O login com o Google não completou. Tente de novo.',
  TooManyAttemptsError: 'Muitas tentativas seguidas. Espere alguns minutos.',
  ExamTargetAlreadyExistsError: 'Esse vestibular já está na sua lista.',
  ValidationError: 'Confira os campos: algo aí não está no formato esperado.',
}

const FALLBACK = 'Algo deu errado aqui do nosso lado. Tente de novo em instantes.'
const OFFLINE = 'Sem conexão com o Argumenta. Verifique a internet e tente de novo.'

export function messageFor(error: unknown): string {
  if (!(error instanceof ApiError)) return OFFLINE
  return MESSAGES[error.code] ?? FALLBACK
}
