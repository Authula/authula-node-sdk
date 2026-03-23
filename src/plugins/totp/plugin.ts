import type { AuthulaClient } from "@/client";
import { wrappedFetch } from "@/fetch";
import type { Plugin } from "@/types/plugins";
import type {
  DisableResponse,
  EnableResponse,
  GenerateBackupCodesResponse,
  GetTOTPURIResponse,
  VerifyBackupCodeRequest,
  VerifyBackupCodeResponse,
  VerifyTOTPRequest,
  VerifyTOTPResponse,
} from "./types";

export class TOTPPlugin implements Plugin {
  public readonly id = "totp";

  public init(client: AuthulaClient) {
    return {
      enable: async (): Promise<EnableResponse> => {
        return wrappedFetch(client, "/totp/enable", {
          method: "POST",
        });
      },
      disable: async (): Promise<DisableResponse> => {
        return wrappedFetch(client, "/totp/disable", {
          method: "POST",
        });
      },
      getUri: async (): Promise<GetTOTPURIResponse> => {
        return wrappedFetch(client, "/totp/get-uri", {
          method: "GET",
        });
      },
      verify: async (data: VerifyTOTPRequest): Promise<VerifyTOTPResponse> => {
        return wrappedFetch(client, "/totp/verify", {
          method: "POST",
          body: data,
        });
      },
      verifyBackupCode: async (
        data: VerifyBackupCodeRequest,
      ): Promise<VerifyBackupCodeResponse> => {
        return wrappedFetch(client, "/totp/verify-backup-code", {
          method: "POST",
          body: data,
        });
      },
      generateBackupCodes: async (): Promise<GenerateBackupCodesResponse> => {
        return wrappedFetch(client, "/totp/generate-backup-codes", {
          method: "POST",
        });
      },
    };
  }
}
