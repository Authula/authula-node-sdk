import type { Session, User } from "../../types";

export type EnableResponse = {
  totpUri: string;
  backupCodes: string[];
};

export type DisableResponse = {
  message: string;
};

export type GetTOTPURIResponse = {
  totpUri: string;
};

export type VerifyTOTPRequest = {
  code: string;
  trustDevice?: boolean;
};

export type VerifyTOTPResponse = {
  user: User;
  session: Session;
};

export type VerifyBackupCodeRequest = {
  code: string;
  trustDevice?: boolean;
};

export type VerifyBackupCodeResponse = {
  user: User;
  session: Session;
};

export type GenerateBackupCodesResponse = {
  backupCodes: string[];
};
