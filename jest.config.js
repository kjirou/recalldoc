module.exports = {
  preset: 'ts-jest',
  roots: [
    '<rootDir>/src',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
}
