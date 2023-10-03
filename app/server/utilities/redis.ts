import { createClient as redisCreateClient } from 'redis';

export const client = redisCreateClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

client.on('error', (err) => {
  console.error(err);
});
