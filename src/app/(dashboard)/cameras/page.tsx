import { getAuthUser } from '@/lib/api/middleware/auth';
import '@/lib/data/init'; // Initialize data store
import { dataStore } from '@/lib/data/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

  const statusBadgeVariant = (status: string) => {
    if (status === 'online') return 'success';
    if (status === 'offline') return 'danger';
    return 'warning';
  };

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

      {/* Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.cameras.map((camera) => (
          <Card key={camera.cameraId}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{camera.name}</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    {camera.metadata?.model || 'Camera'}
                  </p>
                </div>
                <Badge variant={statusBadgeVariant(camera.status)}>
                  {camera.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Video Placeholder */}
              <div className="aspect-video bg-slate-900 rounded-lg mb-4 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl">📹</span>
                  <p className="text-xs text-slate-400 mt-2">
                    {camera.status === 'online' ? 'Live Feed' : camera.status === 'offline' ? 'Offline' : 'Maintenance'}
                  </p>
                </div>
              </div>

              {/* Camera Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Location</span>
                  <span className="text-slate-900">{camera.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Resolution</span>
                  <span className="text-slate-900">{camera.metadata?.resolution || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Features</span>
                  <div className="flex gap-1">
                    {camera.metadata?.ptz && (
                      <Badge variant="default" className="text-xs">PTZ</Badge>
                    )}
                    {camera.metadata?.nightVision && (
                      <Badge variant="default" className="text-xs">Night Vision</Badge>
                    )}
                    {camera.metadata?.audioEnabled && (
                      <Badge variant="default" className="text-xs">Audio</Badge>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">FPS</span>
                  <span className="text-slate-900">{camera.metadata?.fps || 0} fps</span>
                </div>
                {camera.streamUrl && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-xs text-slate-400 font-mono">
                      {camera.streamUrl}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data.cameras.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-500">No cameras found for your assigned assets.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
