/**
 * Application constants
 */

// App info
export const APP_NAME = 'RadiusDC Portal';
export const APP_DESCRIPTION = 'Secure Data Center Client Portal';
export const APP_VERSION = '1.0.0-poc';

// API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
export const API_TIMEOUT = 30000; // 30 seconds

// Authentication
export const AUTH_COOKIE_NAME = 'radiusdc_auth';
export const REFRESH_COOKIE_NAME = 'radiusdc_refresh';
export const TOKEN_EXPIRY = 15 * 60; // 15 minutes in seconds
export const REFRESH_EXPIRY = 30 * 24 * 60 * 60; // 30 days in seconds
export const MFA_CODE_LENGTH = 6;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Polling intervals (milliseconds)
export const POLLING_INTERVALS = {
  ENVIRONMENTAL: 30000, // 30 seconds
  CAMERAS: 60000, // 1 minute
  ACCESS_LOGS: 15000, // 15 seconds
  WEATHER: 300000, // 5 minutes
  ANNOUNCEMENTS: 60000, // 1 minute
} as const;

// Data center locations (for POC)
export const DEFAULT_LOCATION = 'dc-denver-1';

// Environmental thresholds
export const ENVIRONMENTAL_THRESHOLDS = {
  temperature: {
    warningLow: 64,
    warningHigh: 75,
    criticalLow: 60,
    criticalHigh: 80,
    unit: 'fahrenheit' as const,
  },
  humidity: {
    warningLow: 30,
    warningHigh: 60,
    criticalLow: 20,
    criticalHigh: 70,
    unit: 'percentage' as const,
  },
} as const;

// Weather API (National Weather Service)
export const NWS_API_BASE = 'https://api.weather.gov';
export const NWS_USER_AGENT = '(RadiusDC Portal POC, contact@radiusdc.com)';

// Denver, CO coordinates for weather
export const DENVER_COORDINATES = {
  latitude: 39.7392,
  longitude: -104.9903,
};

// Date/time formats
export const DATE_FORMATS = {
  LOG_TIMESTAMP: 'MMM d, yyyy h:mm:ss a',
  SHORT_DATE: 'MMM d',
  FULL_DATE: 'MMMM d, yyyy',
  TIME_ONLY: 'h:mm a',
  CHART_TIME: 'HH:mm',
  CHART_DATE: 'MMM d',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const;

// Role display names
export const ROLE_DISPLAY_NAMES: Record<string, string> = {
  admin: 'Administrator',
  user: 'Standard User',
  viewer: 'Viewer',
};

// Status display configurations
export const STATUS_CONFIGS = {
  online: {
    label: 'Online',
    color: 'success',
    bgColor: 'bg-success-light',
    textColor: 'text-success',
  },
  offline: {
    label: 'Offline',
    color: 'danger',
    bgColor: 'bg-danger-light',
    textColor: 'text-danger',
  },
  maintenance: {
    label: 'Maintenance',
    color: 'warning',
    bgColor: 'bg-warning-light',
    textColor: 'text-warning',
  },
  operational: {
    label: 'Operational',
    color: 'success',
    bgColor: 'bg-success-light',
    textColor: 'text-success',
  },
  normal: {
    label: 'Normal',
    color: 'success',
    bgColor: 'bg-success-light',
    textColor: 'text-success',
  },
  warning: {
    label: 'Warning',
    color: 'warning',
    bgColor: 'bg-warning-light',
    textColor: 'text-warning',
  },
  critical: {
    label: 'Critical',
    color: 'danger',
    bgColor: 'bg-danger-light',
    textColor: 'text-danger',
  },
} as const;

// Navigation items
export const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    permission: null, // Everyone can access
  },
  {
    href: '/access-logs',
    label: 'Access Logs',
    icon: 'FileText',
    permission: 'access_logs:read',
  },
  {
    href: '/cameras',
    label: 'Cameras',
    icon: 'Video',
    permission: 'cameras:view',
  },
  {
    href: '/environmental',
    label: 'Environmental',
    icon: 'Thermometer',
    permission: 'environmental:read',
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: 'Settings',
    permission: null,
  },
] as const;

// Sample traffic camera URLs for POC (public cameras)
// These are placeholders - in production would connect to real security cameras
export const SAMPLE_CAMERA_STREAMS = [
  {
    id: 'cam-1',
    name: 'Main Entrance',
    // Using a placeholder - in real app would be actual RTSP/HLS stream
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'entrance' as const,
  },
  {
    id: 'cam-2',
    name: 'North Hallway',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    type: 'hallway' as const,
  },
  {
    id: 'cam-3',
    name: 'Server Room A',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    type: 'interior' as const,
  },
] as const;

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  NETWORK: 'Unable to connect. Please check your internet connection.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  MFA_REQUIRED: 'Multi-factor authentication is required.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
} as const;
