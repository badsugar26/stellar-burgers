module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',

  // Корневая директория проекта
  roots: ['<rootDir>/src'],

  moduleNameMapper: {
    // CSS модули (ваши .module.css файлы)
    '\\.(css|scss|less)$': 'identity-obj-proxy',

    // Псевдонимы из вашего tsconfig.json
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@ui/(.*)$': '<rootDir>/src/components/ui/$1',
    '^@ui-pages/(.*)$': '<rootDir>/src/components/ui/pages/$1',
    '^@utils-types$': '<rootDir>/src/utils/types',
    '^@api$': '<rootDir>/src/utils/burger-api.ts',
    '^@slices/(.*)$': '<rootDir>/src/services/slices/$1',

    // Для статических файлов
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  testMatch: [
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/src/**/*.test.tsx',
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/src/**/*.spec.tsx'
  ],

  // Трансформация TypeScript файлов
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        // Для ускорения тестов
        isolatedModules: true
      }
    ]
  },

  // Игнорируем
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/', '/cypress/'],

  // Для покрытия кода
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/**/types.ts'
  ],

  coverageDirectory: 'coverage',

  // Настройки для ускорения
  maxWorkers: '50%'
};
