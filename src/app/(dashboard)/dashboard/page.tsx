import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/api/middleware/auth';
import { LogoutButton } from '@/components/dashboard/logout-button';

export default async function DashboardPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Welcome, {user.firstName} {user.lastName}
          </h1>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Authentication Successful!</h2>
              <p className="text-blue-700">Phase 2 (Authentication) is now complete.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-700 mb-2">User Info</h3>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Email:</dt>
                    <dd className="font-medium">{user.email}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Role:</dt>
                    <dd className="font-medium capitalize">{user.role}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Tenant ID:</dt>
                    <dd className="font-medium">{user.tenantId}</dd>
                  </div>
                </dl>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-700 mb-2">Permissions</h3>
                <div className="flex flex-wrap gap-2">
                  {user.permissions.slice(0, 5).map((perm) => (
                    <span
                      key={perm}
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                    >
                      {perm}
                    </span>
                  ))}
                  {user.permissions.length > 5 && (
                    <span className="px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded-full">
                      +{user.permissions.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg md:col-span-2">
                <h3 className="font-semibold text-slate-700 mb-2">Assigned Assets</h3>
                <div className="flex flex-wrap gap-2">
                  {user.assignedAssets.map((asset) => (
                    <span
                      key={asset}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded"
                    >
                      {asset}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
