import { z } from 'zod';

export const SignInValidator = z.object({
  password: z.string().min(1, { message: '비밀번호를 다시 확인해주세요.' }),
});

export type TSignInValidator = z.infer<typeof SignInValidator>;
