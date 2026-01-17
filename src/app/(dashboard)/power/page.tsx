import { getAuthUser } from '@/lib/api/middleware/auth';
import '@/lib/data/init'; // Initialize data store
import { dataStore } from '@/lib/data/store';
import { Card, CardContent } from '@/components/ui/card';
import { PowerCharts } from '@/components/power/power-charts';
import type { PowerReading, RackPowerSummary } from '@/types';

async function getPowerData() {
  const user = await getAuthUser();
  if (!user) return null;

  // Get all power readings for user's assigned racks
  const rackIds = user.assignedAssets.filter((assetId) => {
    const asset = dataStore.getAsset(assetId);
    return asset?.type === 'rack';
  });

  // Get the most recent reading for each rack to build summaries
  const rackSummaries: RackPowerSummary[] = rackIds.map((rackId) => {
    const asset = dataStore.getAsset(rackId);
    const latestReading = dataStore.getLatestPowerReading(rackId);

    if (!latestReading || !asset) {
      // Return placeholder if no data
      return {
        assetId: rackId,
        assetName: asset?.name || rackId,
        tenantId: user.tenantId,
        currentPower: 0,
        currentUtilization: 0,
        circuitAStatus: 'offline' as const,
        circuitBStatus: 'offline' as const,
        circuitA: {
          side: 'A' as const,
          voltage: 208,
          current: 0,
          power: 0,
          capacity: 6.24,
          utilizationPercent: 0,
        },
        circuitB: {
          side: 'B' as const,
          voltage: 208,
          current: 0,
          power: 0,
          capacity: 6.24,
          utilizationPercent: 0,
        },
        totalCapacity: 12.48,
        recommendedMax: 9.98,
        peak24h: 0,
        peak7d: 0,
        peak30d: 0,
        average24h: 0,
        average7d: 0,
        average30d: 0,
        monthlyKwh: 0,
        estimatedMonthlyCost: 0,
      };
    }

    // Get readings for statistics
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const last24hReadings = dataStore
      .getPowerReadings({
        tenantId: user.tenantId,
        assetIds: [rackId],
        startDate: oneDayAgo,
      })
      .readings;

    const last7dReadings = dataStore
      .getPowerReadings({
        tenantId: user.tenantId,
        assetIds: [rackId],
        startDate: sevenDaysAgo,
      })
      .readings;

    const last30dReadings = dataStore
      .getPowerReadings({
        tenantId: user.tenantId,
        assetIds: [rackId],
        startDate: thirtyDaysAgo,
      })
      .readings;

    // Calculate statistics
    const peak24h = Math.max(...last24hReadings.map((r) => r.totalPower), 0);
    const peak7d = Math.max(...last7dReadings.map((r) => r.totalPower), 0);
    const peak30d = Math.max(...last30dReadings.map((r) => r.totalPower), 0);

    const average24h =
      last24hReadings.reduce((sum, r) => sum + r.totalPower, 0) / (last24hReadings.length || 1);
    const average7d =
      last7dReadings.reduce((sum, r) => sum + r.totalPower, 0) / (last7dReadings.length || 1);
    const average30d =
      last30dReadings.reduce((sum, r) => sum + r.totalPower, 0) / (last30dReadings.length || 1);

    // Calculate monthly kWh (average power × hours in month)
    const hoursInMonth = 730; // Average
    const monthlyKwh = average30d * hoursInMonth;

    // Cost estimation ($0.12 per kWh typical commercial rate)
    const costPerKwh = 0.12;
    const estimatedMonthlyCost = monthlyKwh * costPerKwh;

    // Determine circuit status
    const getCircuitStatus = (utilization: number) => {
      if (utilization === 0) return 'offline' as const;
      if (utilization >= 85) return 'critical' as const;
      if (utilization >= 70) return 'warning' as const;
      return 'normal' as const;
    };

    return {
      assetId: rackId,
      assetName: asset.name,
      tenantId: user.tenantId,
      currentPower: latestReading.totalPower,
      currentUtilization: latestReading.totalUtilizationPercent,
      circuitAStatus: getCircuitStatus(latestReading.circuitA.utilizationPercent),
      circuitBStatus: getCircuitStatus(latestReading.circuitB.utilizationPercent),
      circuitA: latestReading.circuitA,
      circuitB: latestReading.circuitB,
      totalCapacity: latestReading.circuitA.capacity + latestReading.circuitB.capacity,
      recommendedMax: (latestReading.circuitA.capacity + latestReading.circuitB.capacity) * 0.8,
      peak24h,
      peak7d,
      peak30d,
      average24h,
      average7d,
      average30d,
      monthlyKwh,
      estimatedMonthlyCost,
    };
  });

  // Calculate overall statistics
  const totalCurrentPower = rackSummaries.reduce((sum, r) => sum + r.currentPower, 0);
  const totalCapacity = rackSummaries.reduce((sum, r) => sum + r.totalCapacity, 0);
  const averageUtilization = totalCapacity > 0 ? (totalCurrentPower / totalCapacity) * 100 : 0;
  const racksAtWarning = rackSummaries.filter(
    (r) => r.circuitAStatus === 'warning' || r.circuitBStatus === 'warning'
  ).length;
  const racksAtCritical = rackSummaries.filter(
    (r) => r.circuitAStatus === 'critical' || r.circuitBStatus === 'critical'
  ).length;
  const totalMonthlyKwh = rackSummaries.reduce((sum, r) => sum + r.monthlyKwh, 0);
  const totalMonthlyCost = rackSummaries.reduce((sum, r) => sum + r.estimatedMonthlyCost, 0);

  // Get all historical power readings for charts (grouped by rack)
  const historicalReadingsByRack = rackIds.map((rackId) => {
    const asset = dataStore.getAsset(rackId);
    const readings = dataStore
      .getPowerReadings({
        tenantId: user.tenantId,
        assetIds: [rackId],
        limit: 1000, // Get all readings (we have ~213 per rack)
      })
      .readings;

    return {
      rackId,
      rackName: asset?.name || rackId,
      readings,
    };
  });

  return {
    user,
    rackSummaries,
    historicalReadingsByRack,
    statistics: {
      totalCurrentPower,
      totalCapacity,
      averageUtilization,
      totalRacks: rackIds.length,
      racksAtWarning,
      racksAtCritical,
      monthToDateKwh: totalMonthlyKwh,
      estimatedMonthlyCost: totalMonthlyCost,
      previousMonthKwh: 0, // TODO: Calculate from historical data
      previousMonthCost: 0,
      monthOverMonthChange: 0,
    },
  };
}

export default async function PowerPage() {
  const data = await getPowerData();

  if (!data) {
    return <div>Loading...</div>;
  }

  const { statistics, rackSummaries, historicalReadingsByRack } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Power Utilization</h1>
        <p className="text-slate-600">Monitor power consumption and capacity for your racks.</p>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Total Power Draw</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">
              {statistics.totalCurrentPower.toFixed(2)} kW
            </p>
            <p className="text-xs text-slate-500 mt-1">
              of {statistics.totalCapacity.toFixed(2)} kW capacity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Average Utilization</p>
            <p className="text-2xl font-semibold text-blue-600 mt-1">
              {statistics.averageUtilization.toFixed(1)}%
            </p>
            <p className="text-xs text-slate-500 mt-1">Across {statistics.totalRacks} racks</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Estimated Monthly Cost</p>
            <p className="text-2xl font-semibold text-green-600 mt-1">
              ${statistics.estimatedMonthlyCost.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {statistics.monthToDateKwh.toFixed(0)} kWh @ $0.12/kWh
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Alerts</p>
            <div className="flex items-baseline gap-3 mt-1">
              {statistics.racksAtCritical > 0 && (
                <div>
                  <span className="text-2xl font-semibold text-red-600">
                    {statistics.racksAtCritical}
                  </span>
                  <span className="text-xs text-red-600 ml-1">Critical</span>
                </div>
              )}
              {statistics.racksAtWarning > 0 && (
                <div>
                  <span className="text-2xl font-semibold text-yellow-600">
                    {statistics.racksAtWarning}
                  </span>
                  <span className="text-xs text-yellow-600 ml-1">Warning</span>
                </div>
              )}
              {statistics.racksAtCritical === 0 && statistics.racksAtWarning === 0 && (
                <span className="text-2xl font-semibold text-green-600">All Normal</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rack Power Table */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Rack Power Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Rack</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                    Current Draw
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                    A-Side
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                    B-Side
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                    Utilization
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                    Monthly Est.
                  </th>
                </tr>
              </thead>
              <tbody>
                {rackSummaries.map((rack) => (
                  <tr
                    key={rack.assetId}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-slate-900">
                      {rack.assetName}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-900">
                      <div>
                        <span className="font-semibold">{rack.currentPower.toFixed(2)} kW</span>
                        <span className="text-xs text-slate-500 ml-1">
                          / {rack.totalCapacity.toFixed(2)} kW
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div>
                        <span className="text-slate-900">
                          {rack.circuitA.current.toFixed(1)} A
                        </span>
                        <span className="text-xs text-slate-500 ml-1">
                          ({rack.circuitA.utilizationPercent.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="mt-1 w-full bg-slate-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            rack.circuitAStatus === 'critical'
                              ? 'bg-red-600'
                              : rack.circuitAStatus === 'warning'
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${rack.circuitA.utilizationPercent}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div>
                        <span className="text-slate-900">
                          {rack.circuitB.current.toFixed(1)} A
                        </span>
                        <span className="text-xs text-slate-500 ml-1">
                          ({rack.circuitB.utilizationPercent.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="mt-1 w-full bg-slate-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            rack.circuitBStatus === 'critical'
                              ? 'bg-red-600'
                              : rack.circuitBStatus === 'warning'
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${rack.circuitB.utilizationPercent}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`font-medium ${
                          rack.currentUtilization >= 85
                            ? 'text-red-600'
                            : rack.currentUtilization >= 70
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}
                      >
                        {rack.currentUtilization.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-900">
                      ${rack.estimatedMonthlyCost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Historical Power Charts */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-900">Historical Trends</h2>
        {historicalReadingsByRack.map((rack) => (
          <PowerCharts
            key={rack.rackId}
            allReadings={rack.readings}
            rackName={rack.rackName}
          />
        ))}
      </div>
    </div>
  );
}
