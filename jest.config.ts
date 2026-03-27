import type { Config } from 'jest';

const config: Config = {
  projects: ['<rootDir>/packages/*', '<rootDir>/apps/*'],
  coverageDirectory: '<rootDir>/coverage',
};

export default config;
