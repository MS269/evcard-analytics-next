import { cookies } from 'next/headers';
import { Argon2id } from 'oslo/password';

import { lucia } from '@/lib/auth';
import { authDb, type DatabaseUser } from '@/lib/db';
import { SignInValidator } from '@/lib/validators';

export async function POST(req: Request) {
  const body = await req.json();

  const { password } = SignInValidator.parse(body);

  const admin = authDb
    .prepare(`SELECT * FROM user WHERE id = ?`)
    .get('admin') as DatabaseUser | undefined;

  if (!admin) {
    return Response.json(
      { success: false, message: 'Admin does not exist.' },
      { status: 401 },
    );
  }

  const validPassword = await new Argon2id().verify(admin.password, password);

  if (!validPassword) {
    return Response.json(
      { success: false, message: 'Incorrect password' },
      { status: 401 },
    );
  }

  const session = await lucia.createSession('admin', {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return Response.json({ success: true }, { status: 200 });
}
