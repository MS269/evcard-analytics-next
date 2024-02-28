import { cookies } from 'next/headers';

import { lucia } from '@/lib/auth';

export async function POST(req: Request) {
  const { sessionId } = await req.json();

  if (!sessionId) {
    return Response.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 },
    );
  }

  await lucia.invalidateSession(sessionId);
  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return Response.json({ success: true }, { status: 200 });
}
