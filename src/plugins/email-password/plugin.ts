import type { AuthulaClient } from "@/client";
import { wrappedFetch } from "@/fetch";
import type { Plugin } from "@/types";
import type {
  ChangePasswordRequest,
  RequestEmailChangeRequest,
  RequestPasswordResetRequest,
  SendEmailVerificationRequest,
  SignInRequest,
  SignUpRequest,
} from "./types";

export class EmailPasswordPlugin implements Plugin {
  public readonly id = "emailPassword";

  public init(client: AuthulaClient) {
    return {
      signUp: async <T>(data: SignUpRequest): Promise<T> => {
        return wrappedFetch<T>(client, "/sign-up", {
          method: "POST",
          body: data,
        });
      },
      signIn: async <T>(data: SignInRequest): Promise<T> => {
        return wrappedFetch<T>(client, "/sign-in", {
          method: "POST",
          body: data,
        });
      },
      sendEmailVerification: async (
        data: SendEmailVerificationRequest,
      ): Promise<void> => {
        return wrappedFetch(client, `/send-email-verification`, {
          method: "POST",
          body: data,
        });
      },
      requestPasswordReset: async (
        data: RequestPasswordResetRequest,
      ): Promise<void> => {
        return wrappedFetch(client, `/request-password-reset`, {
          method: "POST",
          body: data,
        });
      },
      changePassword: async (data: ChangePasswordRequest): Promise<void> => {
        return wrappedFetch(client, `/change-password`, {
          method: "POST",
          body: data,
        });
      },
      requestEmailChange: async (
        data: RequestEmailChangeRequest,
      ): Promise<void> => {
        return wrappedFetch(client, `/request-email-change`, {
          method: "POST",
          body: data,
        });
      },
    };
  }
}
