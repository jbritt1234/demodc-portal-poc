import { getAuthUser } from '@/lib/api/middleware/auth';
import '@/lib/data/init'; // Initialize data store
import { dataStore } from '@/lib/data/store';
import { Card, CardContent } from '@/components/ui/card';
import { CameraGrid } from '@/components/cameras/camera-grid';

async function getCameras() {
  const user = await getAuthUser();
  if (!user) return null;

  const cameras = dataStore.getCameras(user.tenantId, user.assignedAssets);

  return { user, cameras };
}

export default async function CamerasPage() {
  const data = await getCameras();

  if (!data) {
    return <div>Loading...</div>;
  }

  const onlineCount = data.cameras.filter((c) => c.status === 'online').length;
  const offlineCount = data.cameras.filter((c) => c.status === 'offline').length;
  const maintenanceCount = data.cameras.filter((c) => c.status === 'maintenance').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Cameras</h1>
        <p className="text-slate-600">
          Monitor security cameras for your assigned assets.
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Total Cameras</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{data.cameras.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Online</p>
            <p className="text-2xl font-semibold text-green-600 mt-1">{onlineCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Offline</p>
            <p className="text-2xl font-semibold text-red-600 mt-1">{offlineCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Maintenance</p>
            <p className="text-2xl font-semibold text-yellow-600 mt-1">{maintenanceCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Camera Grid with Modal */}
      <CameraGrid cameras={data.cameras} />
    </div>
  );
}
