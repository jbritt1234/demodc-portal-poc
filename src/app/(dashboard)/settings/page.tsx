import { getAuthUser } from '@/lib/api/middleware/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

async function getSettingsData() {
  const user = await getAuthUser();
  if (!user) return null;

  return { user };
}

export default async function SettingsPage() {
  const data = await getSettingsData();

  if (!data) {
    return <div>Loading...</div>;
  }

  const roleColors: Record<string, 'default' | 'success' | 'info' | 'warning' | 'danger'> = {
    admin: 'danger',
    user: 'success',
    viewer: 'info',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="text-slate-600">
          Manage your account preferences and security settings.
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your personal and account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">First Name</label>
              <div className="mt-1 p-3 bg-slate-50 rounded-md border border-slate-200">
                <p className="text-slate-900">{data.user.firstName}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Last Name</label>
              <div className="mt-1 p-3 bg-slate-50 rounded-md border border-slate-200">
                <p className="text-slate-900">{data.user.lastName}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <div className="mt-1 p-3 bg-slate-50 rounded-md border border-slate-200">
                <p className="text-slate-900">{data.user.email}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">User ID</label>
              <div className="mt-1 p-3 bg-slate-50 rounded-md border border-slate-200">
                <p className="text-slate-900 font-mono text-sm">{data.user.userId}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>Your role and permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Role</label>
            <div className="mt-2">
              <Badge variant={roleColors[data.user.role]}>
                {data.user.role.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Permissions</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {data.user.permissions.map((permission) => (
                <Badge key={permission} variant="default">
                  {permission}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Assigned Assets</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {data.user.assignedAssets.map((asset) => (
                <Badge key={asset} variant="info">
                  {asset}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Tenant ID</label>
            <div className="mt-1 p-3 bg-slate-50 rounded-md border border-slate-200">
              <p className="text-slate-900 font-mono text-sm">{data.user.tenantId}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>Manage your authentication and security preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <p className="font-medium text-slate-900">Multi-Factor Authentication (MFA)</p>
              <p className="text-sm text-slate-500 mt-1">
                {data.user.mfaEnabled
                  ? 'MFA is currently enabled for your account'
                  : 'MFA is currently disabled for your account'}
              </p>
            </div>
            <Badge variant={data.user.mfaEnabled ? 'success' : 'warning'}>
              {data.user.mfaEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <p className="font-medium text-slate-900">Password</p>
              <p className="text-sm text-slate-500 mt-1">
                Last changed: Not available in demo mode
              </p>
            </div>
            <span className="text-sm text-slate-400">Demo Account</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <p className="font-medium text-slate-900">Session Security</p>
              <p className="text-sm text-slate-500 mt-1">
                Using httpOnly cookies with JWT authentication
              </p>
            </div>
            <Badge variant="success">Secure</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Demo Notice */}
      <Alert variant="info">
        <AlertTitle>Demo Account</AlertTitle>
        <AlertDescription>
          This is a demonstration account. In a production environment, you would be able to edit your profile,
          change your password, configure MFA settings, and manage notification preferences from this page.
        </AlertDescription>
      </Alert>
    </div>
  );
}
