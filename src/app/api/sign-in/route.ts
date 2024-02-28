import { logger } from '@/lib/logger';
import { SignInValidator } from '@/lib/validators';

const adminPassword = process.env.ADMIN_PASSWORD!;

if (!adminPassword) {
  logger.error('env', 'Admin password not found. Read README.md.');
}

export async function POST(req: Request) {
  const body = await req.json();

  const { password } = SignInValidator.parse(body);

  if (password !== adminPassword) {
    return Response.json(
      { success: false, message: 'Incorrect password' },
      { status: 401 },
    );
  }

  return Response.json({ success: true }, { status: 200 });
}
