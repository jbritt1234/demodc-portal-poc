import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Announcement } from '@/types';

interface AnnouncementsFeedProps {
  announcements: Announcement[];
}

export function AnnouncementsFeed({ announcements }: AnnouncementsFeedProps) {
  if (announcements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">No active announcements</p>
        </CardContent>
      </Card>
    );
  }

  const variantMap = {
    critical: 'danger' as const,
    warning: 'warning' as const,
    info: 'info' as const,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Announcements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {announcements.slice(0, 3).map((announcement) => (
          <Alert key={announcement.announcementId} variant={variantMap[announcement.severity]}>
            <AlertTitle>{announcement.title}</AlertTitle>
            <AlertDescription className="mt-2">
              {announcement.message}
            </AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}
