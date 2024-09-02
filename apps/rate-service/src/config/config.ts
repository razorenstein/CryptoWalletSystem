export default {
    cache: {
      ttl: 1 * 60 * 1000, //1 minute
      maxItems: 50, 
    },
    cron: {
      rateRefreshInterval: '0 */1 * * * *', // Cron expression for running every 1 minutes
    },
  };
  