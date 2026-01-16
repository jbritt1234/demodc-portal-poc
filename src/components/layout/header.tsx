import { AuthUser } from '@/types/auth';
import { UserMenu } from './user-menu';

interface HeaderProps {
  user: AuthUser;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-sm text-slate-600">
          Location: <span className="font-medium text-slate-900">Denver DC - Downtown</span>
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
        <UserMenu user={user} />
      </div>
    </header>
  );
}
