export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || '/api',
  PUSHER_KEY: import.meta.env.VITE_PUSHER_APP_KEY || '6b76cdf4227718f1d2fe',
  PUSHER_CLUSTER: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'ap2',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
