export type JWTTokenType = "Bearer";

/**
 * The type that is returned when using the `jwt.repond_json` capability.
 */
export type JWTTokensResponse = {
  tokenType: JWTTokenType;
  accessToken: string;
  refreshToken?: string;
};
