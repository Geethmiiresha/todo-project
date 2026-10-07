import { validateEnvironment } from './configuration';

const validConfig = {
  DB_HOST: 'localhost',
  DB_USER: 'todo',
  DB_PASSWORD: 'local-password',
  DB_NAME: 'todo',
  JWT_SECRET: 'a-secure-example-secret-at-least-32-characters',
};

describe('validateEnvironment', () => {
  it('normalizes validated port configuration', () => {
    expect(validateEnvironment({ ...validConfig, DB_PORT: '5432' })).toEqual(
      expect.objectContaining({ DB_PORT: 5432, PORT: 3000 }),
    );
  });

  it('rejects missing database configuration', () => {
    expect(() => validateEnvironment({ ...validConfig, DB_NAME: '' })).toThrow(
      'DB_NAME is required',
    );
  });

  it('rejects weak JWT secrets and invalid ports', () => {
    expect(() =>
      validateEnvironment({ ...validConfig, JWT_SECRET: 'short' }),
    ).toThrow('JWT_SECRET must be at least 32 characters long');
    expect(() =>
      validateEnvironment({ ...validConfig, PORT: '70000' }),
    ).toThrow('PORT must be a valid TCP port');
  });
});
