export default {
    cache: {
      ttl: 2 * 60 * 1000, //2 minute
      maxItems: 50, 
    },
    cron: {
      rateRefreshInterval: '0 */1 * * * *', // Cron expression for running every 1 minutes
    },
  };
  