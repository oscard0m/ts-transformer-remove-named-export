import { transformer } from '../src/index';
import Compiler from 'ts-transform-test-compiler';
import { readdirSync } from 'fs';
import { resolve, basename } from 'path';
import { ScriptTarget, ModuleKind, ModuleResolutionKind } from 'typescript';

const removeExtension = (file: string): string => basename(file, '.ts');

const fixtures = readdirSync(
	resolve(__dirname, '__fixtures__')
).map(removeExtension);

const fixturesNamedExports = fixtures.filter(file => file.startsWith('named-export-'));
const fixturesDefaultExports = fixtures.filter(file => file.startsWith('default-export-'));
const fixturesNoExports = fixtures.filter(file => file.startsWith('no-export-'));

describe('transform', () => {
	const compiler = new Compiler(transformer, 'test', {
		target: ScriptTarget.ES2015,
		skipLibCheck: true,
		esModuleInterop: true,
		strict: true,
		forceConsistentCasingInFileNames: true,
		module: ModuleKind.ES2015,
		moduleResolution: ModuleResolutionKind.NodeJs,
		isolatedModules: true,
		noUnusedLocals: true,
		allowJs: true
	});

	compiler.setRootDir('test/__fixtures__/');

	describe('blacklisting "onBrowser" export', () => {
		const result = compiler.compile(
			'__transpiled__/onBrowserBlacklisted',
			{ blacklistedExorts: ['onBrowser'] }
		);

		test.each(fixturesNamedExports)('transforms when %i', async(fixture) => {
			const onBrowser = result.requireContent(fixture, 'onBrowser');
			const onExtraction = result.requireContent(fixture, 'onExtraction');

			expect(onBrowser).toBeUndefined();

			expect(onExtraction).toBeDefined();
			expect(onExtraction()).toEqual('onExtraction');

			expect(result.succeeded).toBeTruthy();
		});

		test.each(fixturesDefaultExports)('Respects %i', async(fixture) => {
			const { onBrowser, onExtraction } = result.requireContent(fixture);

			expect(onBrowser).toBeDefined();
			expect(onBrowser()).toEqual('onBrowser');

			expect(onExtraction).toBeDefined();
			expect(onExtraction()).toEqual('onExtraction');

			expect(result.succeeded).toBeTruthy();
		});
	});

	describe('blacklisting "onExtraction" export', () => {
		const result = compiler.compile(
			'__transpiled__/onExtractionBlacklisted',
			{ blacklistedExorts: ['onExtraction'] }
		);

		test.each(fixturesNamedExports)('transforms when %i', async(fixture) => {
			const onBrowser = result.requireContent(fixture, 'onBrowser');
			const onExtraction = result.requireContent(fixture, 'onExtraction');

			expect(onExtraction).toBeUndefined();

			expect(onBrowser).toBeDefined();
			expect(onBrowser()).toEqual('onBrowser');

			expect(result.succeeded).toBeTruthy();
		});

		test.each(fixturesDefaultExports)('Respects %i', async(fixture) => {
			const { onBrowser, onExtraction } = result.requireContent(fixture);

			expect(onBrowser).toBeDefined();
			expect(onBrowser()).toEqual('onBrowser');

			expect(onExtraction).toBeDefined();
			expect(onExtraction()).toEqual('onExtraction');

			expect(result.succeeded).toBeTruthy();
		});

		test.each(fixturesNoExports)('Respects %i', async() => {
			expect(result.succeeded).toBeTruthy();
		});
	});
});