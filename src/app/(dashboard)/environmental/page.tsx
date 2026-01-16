import { getAuthUser } from '@/lib/api/middleware/auth';
import '@/lib/data/init'; // Initialize data store
import { dataStore } from '@/lib/data/store';
import { EnvironmentalMonitor } from '@/components/environmental/environmental-monitor';

async function getEnvironmentalData() {
  const user = await getAuthUser();
  if (!user) return null;

  // Get environmental readings for the last 24 hours
  const readings = dataStore.getEnvironmentalReadings({
    location: 'dc-denver-1',
    hours: 24,
  });

  // Group by zone and type
  const zones = ['zone-north', 'zone-south'];
  const zoneData = zones.map((zoneId) => {
    const zoneReadings = readings.filter((r) => r.zone === zoneId);
    const tempReadings = zoneReadings.filter((r) => r.type === 'temperature');
    const humidityReadings = zoneReadings.filter((r) => r.type === 'humidity');

    const latestTemp = tempReadings.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];

    const latestHumidity = humidityReadings.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];

    return {
      zoneId,
      zoneName: zoneId === 'zone-north' ? 'North Wing' : 'South Wing',
      temperature: latestTemp,
      humidity: latestHumidity,
      tempReadings: tempReadings.slice(0, 12), // Last 12 hours
      humidityReadings: humidityReadings.slice(0, 12),
    };
  });

  // Get status counts
  const criticalCount = readings.filter((r) => r.status === 'critical').length;
  const warningCount = readings.filter((r) => r.status === 'warning').length;
  const normalCount = readings.filter((r) => r.status === 'normal').length;

  return { user, zoneData, readings, criticalCount, warningCount, normalCount };
}

export default async function EnvironmentalPage() {
  const data = await getEnvironmentalData();

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <EnvironmentalMonitor
      readings={data.readings}
      zoneData={data.zoneData}
      criticalCount={data.criticalCount}
      warningCount={data.warningCount}
      normalCount={data.normalCount}
    />
  );
}

