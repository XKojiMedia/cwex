import { buildProject } from './build';
import fsExtra from 'fs-extra';
import path from 'path';
const config = require('../config');
const utils = require('../utils');

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

describe('buildProject', () => {
  beforeEach(() => {
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should run and compile extension', async () => {
    config.getConfig.mockImplementation(() => ({
      targets: [ 'target1' ],
      exclude: [ 'exclude\/regex' ],
      beforeCompile: '/path/to/before-compile-script.js'
    }));
    utils.getResolvedModule.mockImplementation((path: string) => `/path/to/module/${path}`);
    utils.getResolvedTargetModule.mockImplementation((path: string) => `/path/to/target/module/${path}`);
    utils.getFiles.mockImplementation(() => Promise.resolve([ 'file1', 'file2' ]));
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
    await buildProject({ _require: _req });
    expect(utils.getResolvedModule).toHaveBeenCalled();
    expect(fsExtra.outputFile).toHaveBeenCalled();
    expect(fsExtra.outputFile).toHaveBeenCalledWith(expect.stringMatching(/test.json$/), 'test content', 'utf8');
  });
});
