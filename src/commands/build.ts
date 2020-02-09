import { resolve, basename } from 'path';
import { remove, copy, outputFile } from 'fs-extra';
import { getConfig, ExtensionInfoGenerator, ExtensionCompiler, CwexConfig } from '../config';
import { getFiles, getResolvedTargetModule, getResolvedModule } from '../utils';

export const buildTarget = async (config: CwexConfig, target: string, { outDir = '', _require = require as any }) => {
  const resolvedTargetModule = getResolvedTargetModule(target);
    console.log('resolved module:', resolvedTargetModule);
    if (!resolvedTargetModule) {
      console.log('No module found for target:', target);
      return;
    }
    const targetModule = _require(resolvedTargetModule);
    const generateExtensionInfo: ExtensionInfoGenerator = targetModule.generateExtensionInfo;

    // TODO: Build target steps: beforeBuild:target, afterBuild:target, preCompile:target, postCompile:target

    // Compile templates with config data
    const extensionInfo = await generateExtensionInfo(config);
    console.log(`${target} extension info:`, extensionInfo);

    const extensionOutDir = resolve(outDir, `${target}-files`);
    console.log('Resolved output directory:', outDir);

    console.log('Removing output directory..');
    await remove(extensionOutDir);

    const includedFiles = await getFiles(config.include, {
      ignore: config.exclude,
      onlyFiles: false,
      expandDirectories: false,
      absolute: true,
    });
    console.log('Included files:', includedFiles);

    console.log('Copying included files to output directory..');
    for (const file of includedFiles) {
      await copy(file, resolve(extensionOutDir, basename(file)), {
        filter: (src) => {
          return !config.exclude.find(excludeRegex => {
            return new RegExp(excludeRegex).test(src);
          });
        }
      });
    }
  
    console.log('Copying manifest file to output directory..');
    const manifestOutputPath = resolve(extensionOutDir, extensionInfo.fileName);
    outputFile(manifestOutputPath, extensionInfo.content, 'utf8');

    const compileExtension: ExtensionCompiler = targetModule.compileExtension;

    if (compileExtension) {
      if (config.beforeCompile) {
        const resolvedBeforeCompileModule = getResolvedModule(resolve(process.cwd(), config.beforeCompile));
        if (resolvedBeforeCompileModule) {
          console.log('Executing beforeCompile script..', resolvedBeforeCompileModule);
          const beforeCompileModule = _require(resolvedBeforeCompileModule);
          await beforeCompileModule({
            config,
            extensionFilesDir: extensionOutDir,
          });
        }
      }
      console.log('Compiling extension..');
      await compileExtension({
        config,
        extensionFilesDir: extensionOutDir,
        extensionBuildOutputDir: resolve(outDir, `${target}-build`),
      });
    }
  
    console.log('Build completed.');
};

export const buildProject = async ({ configPath = '', _require = require as any } = {}) => {
  console.log('Current working directory:', process.cwd());
  const config = await getConfig(configPath);
  console.log('Config:', config);

  const outDir = resolve(config.rootDir, config.outDir);
  console.log('Resolved output directory:', outDir);

  console.log('Removing output directory..');
  await remove(outDir);

  console.log(`Building for ${config.targets.length} targets:`, config.targets);
  for (const target of config.targets) {
    let targetConfig = config;
    if (config.targetOptions && config.targetOptions[target]) {
      targetConfig = { ...config, ...config.targetOptions[target] };
    }

    await buildTarget(targetConfig, target, { outDir, _require });
  }
};
