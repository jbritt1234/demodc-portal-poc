import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/api/middleware/auth';

export default async function Home() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  // User is authenticated, redirect to dashboard
  redirect('/dashboard');
}
