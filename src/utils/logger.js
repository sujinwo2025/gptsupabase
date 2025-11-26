import pino from 'pino';

const logLevel = process.env.LOG_LEVEL || 'info';
const NODE_ENV = process.env.NODE_ENV || 'development';

const transportConfig = NODE_ENV === 'production' 
  ? undefined
  : {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        singleLine: false,
      },
    };

const logger = pino(
  {
    level: logLevel,
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        headers: req.headers,
        remoteAddress: req.ip,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
        headers: res.getHeaders?.(),
      }),
    },
  },
  NODE_ENV === 'production' ? pino.destination() : pino.transport(transportConfig)
);

export default logger;
