'use client';

import React from 'react';
import { useLiff } from './LiffProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const LiffUserInfo: React.FC = () => {
  const { isLiffReady, isLoggedIn, user, liffContext, login, logout } = useLiff();

  if (!isLiffReady) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>LIFF初期化中...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>LIFFを初期化しています...</p>
        </CardContent>
      </Card>
    );
  }

  if (!isLoggedIn) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>LINEログイン</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>LINEアカウントでログインしてください。</p>
          <Button onClick={login} className="w-full">
            LINEでログイン
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>ユーザー情報</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {user && (
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              {user.pictureUrl && (
                <img
                  src={user.pictureUrl}
                  alt={user.displayName}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold">{user.displayName}</p>
                <p className="text-sm text-gray-600">ID: {user.userId}</p>
              </div>
            </div>
            {user.statusMessage && (
              <p className="text-sm text-gray-600">
                ステータス: {user.statusMessage}
              </p>
            )}
          </div>
        )}

        {liffContext && (
          <div className="space-y-2">
            <h4 className="font-medium">コンテキスト情報</h4>
            <p className="text-sm">タイプ: {liffContext.type}</p>
            {liffContext.userId && (
              <p className="text-sm">ユーザーID: {liffContext.userId}</p>
            )}
            {liffContext.roomId && (
              <p className="text-sm">ルームID: {liffContext.roomId}</p>
            )}
            {liffContext.groupId && (
              <p className="text-sm">グループID: {liffContext.groupId}</p>
            )}
          </div>
        )}

        <Button onClick={logout} variant="outline" className="w-full">
          ログアウト
        </Button>
      </CardContent>
    </Card>
  );
};
