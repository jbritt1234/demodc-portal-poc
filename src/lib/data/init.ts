import { dataStore } from './store';
import { seedTenants, seedLocations, seedAssets, seedCameras, seedAnnouncements } from './seed';
import { generateAccessLogs, generateEnvironmentalReadings } from './generators';

/**
 * Initialize the data store with seed data and generated time-series data
 * This should be called once when the application starts
 */
export function initializeDataStore(): void {
  console.log('[DataStore] Initializing...');

  // Clear any existing data
  dataStore.clear();

  // Load seed data
  console.log('[DataStore] Loading tenants...');
  seedTenants.forEach((tenant) => {
    dataStore.tenants.set(tenant.tenantId, tenant);
  });

  console.log('[DataStore] Loading locations...');
  seedLocations.forEach((location) => {
    dataStore.locations.set(location.locationId, location);
  });

  console.log('[DataStore] Loading assets...');
  seedAssets.forEach((asset) => {
    dataStore.assets.set(asset.assetId, asset);
  });

  console.log('[DataStore] Loading cameras...');
  seedCameras.forEach((camera) => {
    dataStore.cameras.set(camera.cameraId, camera);
  });

  console.log('[DataStore] Loading announcements...');
  seedAnnouncements.forEach((announcement) => {
    dataStore.announcements.set(announcement.announcementId, announcement);
  });

  // Generate time-series data
  console.log('[DataStore] Generating access logs...');
  seedTenants.forEach((tenant) => {
    // Enrich tenant assets with full asset details
    const enrichedAssets = tenant.assignedAssets.map((ta) => {
      const asset = dataStore.assets.get(ta.assetId);
      const location = dataStore.locations.get(ta.location);
      const zone = location?.zones.find((z) => z.zoneId === asset?.zone);

      return {
        assetId: ta.assetId,
        name: asset?.name || ta.assetId,
        location: ta.location,
        locationName: location?.shortName || ta.location,
        zone: asset?.zone || 'unknown',
        zoneName: zone?.name || 'Unknown Zone',
      };
    });

    const logs = generateAccessLogs(tenant.tenantId, enrichedAssets, 30, 15);
    dataStore.accessLogs.push(...logs);
  });

  console.log('[DataStore] Generating environmental readings...');
  seedLocations.forEach((location) => {
    const zones = location.zones.map((z) => ({
      zoneId: z.zoneId,
      zoneName: z.name,
    }));
    const readings = generateEnvironmentalReadings(location.locationId, zones, 48);
    dataStore.environmentalReadings.push(...readings);
  });

  console.log('[DataStore] Initialization complete!');
  console.log(`  - Tenants: ${dataStore.tenants.size}`);
  console.log(`  - Locations: ${dataStore.locations.size}`);
  console.log(`  - Assets: ${dataStore.assets.size}`);
  console.log(`  - Cameras: ${dataStore.cameras.size}`);
  console.log(`  - Announcements: ${dataStore.announcements.size}`);
  console.log(`  - Access Logs: ${dataStore.accessLogs.length}`);
  console.log(`  - Environmental Readings: ${dataStore.environmentalReadings.length}`);
}

// Initialize immediately when this module is imported
initializeDataStore();
