export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  for (const key of required) {
    if (typeof config[key] !== 'string' || config[key].trim() === '') {
      throw new Error(`Environment variable ${key} is required`);
    }
  }

  const jwtSecret = config.JWT_SECRET;
  if (typeof jwtSecret !== 'string' || jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  const dbPort = Number(config.DB_PORT ?? 5432);
  if (!Number.isInteger(dbPort) || dbPort < 1 || dbPort > 65535) {
    throw new Error('DB_PORT must be a valid TCP port');
  }

  const appPort = Number(config.PORT ?? 3000);
  if (!Number.isInteger(appPort) || appPort < 1 || appPort > 65535) {
    throw new Error('PORT must be a valid TCP port');
  }

  return { ...config, DB_PORT: dbPort, PORT: appPort };
}
