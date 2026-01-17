'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import type { Camera } from '@/types';

interface CameraGridProps {
  cameras: Camera[];
}

export function CameraGrid({ cameras }: CameraGridProps) {
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  const statusBadgeVariant = (status: string) => {
    if (status === 'online') return 'success';
    if (status === 'offline') return 'danger';
    return 'warning';
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cameras.map((camera) => (
          <Card
            key={camera.cameraId}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedCamera(camera)}
          >
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
                    {camera.status === 'online'
                      ? 'Live Feed'
                      : camera.status === 'offline'
                      ? 'Offline'
                      : 'Maintenance'}
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
                  <span className="text-slate-900">
                    {camera.metadata?.resolution || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Features</span>
                  <div className="flex gap-1">
                    {camera.metadata?.ptz && (
                      <Badge variant="default" className="text-xs">
                        PTZ
                      </Badge>
                    )}
                    {camera.metadata?.nightVision && (
                      <Badge variant="default" className="text-xs">
                        Night Vision
                      </Badge>
                    )}
                    {camera.metadata?.audioEnabled && (
                      <Badge variant="default" className="text-xs">
                        Audio
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Camera Detail Modal */}
      {selectedCamera && (
        <Modal
          isOpen={!!selectedCamera}
          onClose={() => setSelectedCamera(null)}
          title={selectedCamera.name}
          size="xl"
        >
          <div className="p-6">
            {/* Large Video View */}
            <div className="aspect-video bg-slate-900 rounded-lg mb-6 flex items-center justify-center">
              <div className="text-center">
                <span className="text-8xl">📹</span>
                <p className="text-lg text-slate-400 mt-4">
                  {selectedCamera.status === 'online'
                    ? 'Live Feed - Click to Expand'
                    : selectedCamera.status === 'offline'
                    ? 'Camera Offline'
                    : 'Under Maintenance'}
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  {selectedCamera.metadata?.model || 'Camera'} •{' '}
                  {selectedCamera.metadata?.resolution || 'N/A'}
                </p>
              </div>
            </div>

            {/* Status and Controls */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-4">
                <Badge variant={statusBadgeVariant(selectedCamera.status)} className="text-sm">
                  {selectedCamera.status}
                </Badge>
                <span className="text-sm text-slate-500">
                  {selectedCamera.location}
                </span>
              </div>
              <div className="flex gap-2">
                {selectedCamera.metadata?.ptz && (
                  <button className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors">
                    🎮 PTZ Controls
                  </button>
                )}
                <button className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors">
                  📸 Snapshot
                </button>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Technical Specs */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">
                  Technical Specifications
                </h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Model</span>
                    <span className="text-slate-900 font-medium">
                      {selectedCamera.metadata?.model || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Resolution</span>
                    <span className="text-slate-900 font-medium">
                      {selectedCamera.metadata?.resolution || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Frame Rate</span>
                    <span className="text-slate-900 font-medium">
                      {selectedCamera.metadata?.fps || 0} fps
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Field of View</span>
                    <span className="text-slate-900 font-medium">
                      {selectedCamera.metadata?.fieldOfView || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Features & Capabilities */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">
                  Features & Capabilities
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 py-2">
                    <span className={selectedCamera.metadata?.ptz ? 'text-green-500' : 'text-slate-300'}>
                      {selectedCamera.metadata?.ptz ? '✓' : '✗'}
                    </span>
                    <span className="text-sm text-slate-700">Pan-Tilt-Zoom (PTZ)</span>
                  </div>
                  <div className="flex items-center gap-2 py-2">
                    <span className={selectedCamera.metadata?.nightVision ? 'text-green-500' : 'text-slate-300'}>
                      {selectedCamera.metadata?.nightVision ? '✓' : '✗'}
                    </span>
                    <span className="text-sm text-slate-700">Night Vision</span>
                  </div>
                  <div className="flex items-center gap-2 py-2">
                    <span className={selectedCamera.metadata?.audioEnabled ? 'text-green-500' : 'text-slate-300'}>
                      {selectedCamera.metadata?.audioEnabled ? '✓' : '✗'}
                    </span>
                    <span className="text-sm text-slate-700">Audio Recording</span>
                  </div>
                  <div className="flex items-center gap-2 py-2">
                    <span className={selectedCamera.metadata?.motionDetection ? 'text-green-500' : 'text-slate-300'}>
                      {selectedCamera.metadata?.motionDetection ? '✓' : '✗'}
                    </span>
                    <span className="text-sm text-slate-700">Motion Detection</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stream URL */}
            {selectedCamera.streamUrl && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  Stream URL
                </h3>
                <div className="bg-slate-50 rounded-lg p-3">
                  <code className="text-xs text-slate-600 font-mono break-all">
                    {selectedCamera.streamUrl}
                  </code>
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Camera ID</span>
                  <p className="text-slate-900 font-mono text-xs mt-1">
                    {selectedCamera.cameraId}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Asset ID</span>
                  <p className="text-slate-900 font-mono text-xs mt-1">
                    {selectedCamera.assetId}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {cameras.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-500">No cameras found for your assigned assets.</p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
