export interface RefreshTokenRecord {
  id: string;
  compCode: string;
  empId: string;
}

export interface RefreshTokenRepositoryPort {
  create(params: {
    compCode: string;
    empId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<string>;
  findValidByHash(tokenHash: string): Promise<RefreshTokenRecord | null>;
  revoke(id: string): Promise<void>;
}

export const REFRESH_TOKEN_REPOSITORY = Symbol('REFRESH_TOKEN_REPOSITORY');
