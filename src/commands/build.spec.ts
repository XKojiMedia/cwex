import { buildProject } from './build';
import fsExtra from 'fs-extra';
import path from 'path';
const config = require('../config');
const utils = require('../utils');

jest.mock('fs-extra');
jest.mock('path');
config.getConfig = jest.fn(() => ({
  targets: [],
}));
utils.getFiles = jest.fn();
utils.getResolvedModule = jest.fn();
utils.getResolvedTargetModule = jest.fn();

describe('buildProject', () => {
  it('should run', async () => {
    await buildProject();
  });
});
