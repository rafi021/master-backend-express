import redis from "express-redis-cache";

const redisCache = redis({
  port: 6379,
  host: "127.0.0.1",
  prefix: "master_backend",
  expire: 60 * 60, //1hr
});

export default redisCache;
 