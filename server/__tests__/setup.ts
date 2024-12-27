// Увеличиваем таймаут для всех тестов
jest.setTimeout(10000);

// Отключаем вывод консоли во время тестов
global.console = {
	...console,
	log: jest.fn(),
	error: jest.fn(),
	warn: jest.fn(),
	info: jest.fn(),
	debug: jest.fn(),
};
