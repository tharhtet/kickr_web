export interface LoginInput {
  email: string;
  password: string;
}

/** Body of `POST /auth/signup` — password min 8 chars, name 2–60 chars. */
export interface SignupInput extends LoginInput {
  name: string;
}

/** Shape returned by `POST /auth/signup` — the account is auto-confirmed. */
export interface SignupResponse {
  message: string;
}

/**
 * Shape returned by `POST /auth/login` (AWS Cognito-backed).
 * `sub` + `refreshToken` are what `POST /auth/refresh` (`RefreshTokenDto`)
 * expects back, so both are kept in storage alongside the access token.
 */
export interface LoginResponse {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  sub: string;
  expiresIn?: number;
}
