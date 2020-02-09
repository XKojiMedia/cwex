import { buildProject, buildTarget } from './build';
import fsExtra from 'fs-extra';
import path from 'path';
const config = require('../config');
const utils = require('../utils');
const build = require('./build');

jest.mock('fs-extra', () => {
  return {
    remove: jest.fn(),
    copy: jest.fn((src, dest, opts) => opts.filter(src)),
    outputFile: jest.fn(),
  };
});
jest.mock('path', () => {
  return {
    resolve: jest.fn((...args) => args.join('/')),
    basename: jest.fn(_ => _),
    posix: {}
  }
});
config.getConfig = jest.fn();
utils.getFiles = jest.fn(() => [ 'file3', 'file4' ]);
utils.getResolvedModule = jest.fn();
utils.getResolvedTargetModule = jest.fn();

describe('buildTarget', () => {
  beforeEach(() => {
    utils.getResolvedModule.mockImplementation((path: string) => `/path/to/module/${path}`);
    utils.getResolvedTargetModule.mockImplementation((path: string) => `/path/to/target/module/${path}`);
  });
  afterEach(() => {
    utils.getResolvedModule.mockClear();
    utils.getResolvedTargetModule.mockClear();
  });

  it('should run and compile extension', async () => {
    utils.getResolvedModule.mockImplementation((path: string) => `/path/to/module/${path}`);
    utils.getResolvedTargetModule.mockImplementation((path: string) => `/path/to/target/module/${path}`);
    const generateExtensionInfo = jest.fn(() => Promise.resolve({
      content: 'test content',
      fileName: 'test.json',
    }));
    const compileExtension = jest.fn();
    const beforeCompileScript = jest.fn();
    const _req = jest.fn((path: string) => {
      if (path.includes('before-compile-script.js')) {
        return beforeCompileScript;
      }
      return {
        compileExtension,
        generateExtensionInfo,
      };
    });

    await buildTarget({
      targets: [ 'target1' ],
      exclude: [ 'exclude\/regex' ],
      beforeCompile: '/path/to/before-compile-script.js',
      include: [],
      rootDir: '',
      outDir: '',
    }, 'target1', { includedFiles: [ 'file3', 'file4' ], _require: _req });

    expect(utils.getResolvedModule).toHaveBeenCalled();
    expect(fsExtra.copy).toHaveBeenCalledWith('file3', '/target1-files/file3', expect.anything());
    expect(fsExtra.copy).toHaveBeenCalledWith('file4', '/target1-files/file4', expect.anything());
    expect(fsExtra.outputFile).toHaveBeenCalled();
    expect(fsExtra.outputFile).toHaveBeenCalledWith(expect.stringMatching(/test.json$/), 'test content', 'utf8');
  });
});

describe('buildProject', () => {
  beforeEach(() => {
  });
  afterEach(() => {
    config.getConfig.mockClear();
    utils.getFiles.mockClear();
  });

  it('should run and compile extension', async () => {
    config.getConfig.mockImplementation(() => ({
      targets: [ 'target1' ],
      exclude: [ 'exclude\/regex' ],
      beforeCompile: '/path/to/before-compile-script.js',
      outDir: 'test-out',
      rootDir: 'root',
    }));
    const _buildTarget = build.buildTarget;
    build.buildTarget = jest.fn();
    utils.getFiles.mockImplementation(() => Promise.resolve([ 'file1', 'file2' ]));
    await buildProject();
    expect(build.buildTarget).toHaveBeenCalledWith({
      targets: [ 'target1' ],
      exclude: [ 'exclude\/regex' ],
      beforeCompile: '/path/to/before-compile-script.js',
      outDir: 'test-out',
      rootDir: 'root',
    }, 'target1', expect.objectContaining({
      includedFiles: [ 'file1', 'file2' ],
      outDir: 'root/test-out',
    }));
    build.buildTarget = _buildTarget;
  });
});
