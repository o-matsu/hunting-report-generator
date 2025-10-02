// LIFF関連の型定義
export interface LiffUser {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface LiffConfig {
  liffId: string;
  redirectUri?: string;
}

export interface LiffContext {
  type: 'utou' | 'room' | 'group' | 'none' | 'square_chat' | 'external';
  userId?: string;
  roomId?: string;
  groupId?: string;
}
