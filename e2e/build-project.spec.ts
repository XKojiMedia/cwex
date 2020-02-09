import path from 'path';
import fs from 'fs-extra';
import { buildProject } from '../src';
jest.unmock('web-ext');

describe('buildProject', () => {
  it('builds successfully', async () => {
    await buildProject({
      configPath: path.resolve(__dirname, './fixtures/cwex.yml'),
    });
    expect(await fs.pathExists(path.resolve(__dirname, './e2e-test-out'))).toBeTruthy();
    expect(await fs.pathExists(path.resolve(__dirname, './e2e-test-out', 'chrome-files'))).toBeTruthy();
    expect(await fs.pathExists(path.resolve(__dirname, './e2e-test-out', 'chrome-files', 'manifest.json'))).toBeTruthy();
    expect(fs.readFileSync(path.resolve(__dirname, './e2e-test-out', 'chrome-files', 'manifest.json'), 'utf8')).toMatchSnapshot();
    expect(await fs.pathExists(path.resolve(__dirname, './e2e-test-out', 'chrome-build'))).toBeTruthy();
    expect(await fs.pathExists(path.resolve(__dirname, './e2e-test-out', 'chrome-build', 'chrome.zip'))).toBeTruthy();
    expect(await fs.pathExists(path.resolve(__dirname, './e2e-test-out', 'mozilla-files'))).toBeTruthy();
    expect(await fs.pathExists(path.resolve(__dirname, './e2e-test-out', 'mozilla-files', 'manifest.json'))).toBeTruthy();
    expect(fs.readFileSync(path.resolve(__dirname, './e2e-test-out', 'mozilla-files', 'manifest.json'), 'utf8')).toMatchSnapshot();
    expect(await fs.pathExists(path.resolve(__dirname, './e2e-test-out', 'mozilla-build'))).toBeTruthy();
  });
});
