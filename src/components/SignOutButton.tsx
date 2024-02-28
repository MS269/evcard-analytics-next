'use client';

import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Session } from 'lucia';
import { useRouter } from 'next/navigation';

import { Button } from './ui/button';

interface SignOutButtonProps extends React.ComponentProps<typeof Button> {
  session: Session | null;
}

export default function SignOutButton({ session }: SignOutButtonProps) {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!session) {
        throw new Error('Session not found');
      }

      const { data } = await axios.post('/api/sign-out', {
        sessionId: session.id,
      });
      return data;
    },
    onSuccess: () => {
      router.replace('/sign-in');
      router.refresh();
    },
    onError: () => {
      router.replace('/sign-in');
      router.refresh();
    },
  });

  return session ? (
    <Button variant="outline" onClick={() => mutation.mutate()}>
      로그아웃
    </Button>
  ) : null;
}
