import type { Metadata } from 'next';

import SignInForm from '@/components/SignInForm';

export const metadata: Metadata = {
  title: 'Sign in',
};

export default function SignInPage() {
  return (
    <div className="mt-40 flex flex-col items-center space-y-8">
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Evcard Analytics
      </h3>

      <SignInForm />
    </div>
  );
}
