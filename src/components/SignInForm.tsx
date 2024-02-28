'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { SignInValidator, TSignInValidator } from '@/lib/validators';

import { Button } from './ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';

export default function SignInForm() {
  const router = useRouter();

  const form = useForm<TSignInValidator>({
    resolver: zodResolver(SignInValidator),
    defaultValues: { password: '' },
  });

  const mutation = useMutation({
    mutationFn: async ({ password }: TSignInValidator) => {
      const { data } = await axios.post('api/sign-in', { password });
      return data;
    },
    onSuccess: () => {
      router.push('/analytics');
      router.refresh();
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          return form.setError('password', {
            message: '비밀번호를 다시 확인해 주세요.',
          });
        }
      }

      return form.setError('root', { message: error.message });
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((e) => mutation.mutate(e))}
        className="w-80 space-y-8"
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호</FormLabel>
              <FormControl>
                <Input type="password" placeholder="비밀번호" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" disabled={mutation.isPending}>
          {
            <Loader2
              className={cn('mr-2 animate-spin', {
                hidden: !mutation.isPending,
              })}
            />
          }
          로그인
        </Button>
      </form>
    </Form>
  );
}
