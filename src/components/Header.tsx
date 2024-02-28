'use client';

import { useAdminStore } from '@/app/hooks/useAdminStore';

import { ModeToggle } from './ModeToggle';
import { Button } from './ui/button';

export default function Header() {
  const isSignedIn = useAdminStore((state) => state.isSignedIn);
  const signOut = useAdminStore((action) => action.signOut);

  return (
    <div className="fixed top-0 inset-x-0 z-10 py-2 border-b">
      <div className="max-w-sm container h-full flex items-center justify-between gap-2">
        <ModeToggle />

        {isSignedIn ? (
          <Button variant="outline" onClick={() => signOut()}>
            로그아웃
          </Button>
        ) : null}
      </div>
    </div>
  );
}
