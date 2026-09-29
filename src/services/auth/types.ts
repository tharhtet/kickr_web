export interface LoginInput {
  email: string;
  password: string;
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
