import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/__tests__'],
	testMatch: ['**/*.test.ts'],
	moduleFileExtensions: ['ts', 'js', 'json', 'node'],
	collectCoverage: true,
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'lcov'],
	coveragePathIgnorePatterns: ['/node_modules/', '/__tests__/'],
	verbose: true,
	testTimeout: 10000,
	setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
};

export default config;
