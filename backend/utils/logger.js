const NODE_ENV = process.env.NODE_ENV || 'development';

const LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const currentLevel = LEVELS[NODE_ENV === 'production' ? 'INFO' : 'DEBUG'];

function log(level, message, meta = {}) {
  const levelValue = LEVELS[level] ?? LEVELS.INFO;
  if (levelValue < currentLevel) return;

  const timestamp = new Date().toISOString();
  const entry = {
    timestamp,
    level,
    message,
    ...meta
  };

  if (NODE_ENV === 'development') {
    const color = {
      DEBUG: '\x1b[36m',
      INFO: '\x1b[32m',
      WARN: '\x1b[33m',
      ERROR: '\x1b[31m'
    }[level] || '';
    console.log(`${color}[${timestamp}] [${level}] ${message}\x1b[0m`, Object.keys(meta).length ? meta : '');
  } else {
    // Production: structured JSON logs
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  debug: (msg, meta) => log('DEBUG', msg, meta),
  info: (msg, meta) => log('INFO', msg, meta),
  warn: (msg, meta) => log('WARN', msg, meta),
  error: (msg, meta) => log('ERROR', msg, meta)
};
