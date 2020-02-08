import { resolve, basename } from 'path';
import { remove, copy, outputFile } from 'fs-extra';
import { getConfig } from '../config';
import { getFiles } from '../utils';
import buildChromeExtensionInfo from '../targets/chrome';

export const buildProject = async ({ configPath = '' } = {}) => {
  console.log(process.cwd());
  const config = await getConfig(configPath);
  console.log('Config:', config);

  // Compile templates with config data
  const chromeExtensionInfo = await buildChromeExtensionInfo(config);
  console.log('chrome extension info:', chromeExtensionInfo);

  // TODO: Build target steps: beforeBuild:target, afterBuild:target

  const includedFiles = await getFiles(config.include, {
    ignore: config.exclude,
    onlyFiles: false,
    expandDirectories: false,
    absolute: true,
  });
  console.log('Included files:', includedFiles);

  const outDir = resolve(config.rootDir, config.outDir);
  console.log('Resolved output directory:', outDir);

  console.log('Removing output directory..');
  await remove(outDir);

  console.log('Copying included files to output directory..');
  for (const file of includedFiles) {
    await copy(file, resolve(outDir, basename(file)));
  }

  console.log('Copying manifest file to output directory..');
  const manifestOutputPath = resolve(outDir, chromeExtensionInfo.fileName);
  outputFile(manifestOutputPath, chromeExtensionInfo.content, 'utf8');

  console.log('Build completed.');
};
