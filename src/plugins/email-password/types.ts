export type SignUpRequest = {
  name: string;
  email: string;
  password: string;
  callbackUrl?: string;
};

export type SignInRequest = {
  email: string;
  password: string;
  callbackUrl?: string;
};

export type VerifyEmailRequest = {
  token: string;
  callbackUrl?: string;
};

export type SendEmailVerificationRequest = {
  callbackUrl?: string;
};

export type RequestPasswordResetRequest = {
  email: string;
  callbackUrl?: string;
};

export type ChangePasswordRequest = {
  token: string;
  password: string;
};

export type RequestEmailChangeRequest = {
  newEmail: string;
  callbackUrl?: string;
};
