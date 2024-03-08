import { validateRequest } from '@/lib/auth';

import SignOutButton from './SignOutButton';
import ThemeToggle from './ThemeToggle';

export default async function Header() {
  const { session } = await validateRequest();

  return (
    <div className="fixed top-0 inset-x-0 z-10 py-2 border-b bg-background">
      <div className="max-w-sm container h-full flex items-center justify-between gap-2">
        <ThemeToggle />
        <SignOutButton session={session} variant="outline" />
      </div>
    </div>
  );
}
