import { validateRequest } from '@/lib/auth';

import { ModeToggle } from './ModeToggle';
import SignOutButton from './SignOutButton';

export default async function Header() {
  const { session } = await validateRequest();

  return (
    <div className="fixed top-0 inset-x-0 z-10 py-2 border-b">
      <div className="max-w-sm container h-full flex items-center justify-between gap-2">
        <ModeToggle />
        <SignOutButton session={session} variant="outline" />
      </div>
    </div>
  );
}
