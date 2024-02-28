'use client';

import { useRouter } from 'next/navigation';

import { useAdminStore } from '@/app/hooks/useAdminStore';

export default function PrivatePage({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const isSignedIn = useAdminStore((state) => state.isSignedIn);

  if (!isSignedIn) {
    router.replace('/sign-in');
  }

  return <>{children}</>;
}
