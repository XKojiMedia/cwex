import { readFileSync } from 'fs';
import findUp from 'find-up';
import yaml from 'yaml';

export enum EXTENSION_TARGET {
  CHROME = 'chrome',
  MOZILLA = 'mozilla',
}

export const CONFIG_FILE_NAMES = [
  'cwex.yml',
  '.cwexrc',
];

interface ManifestIconMap {
  16: string;
  48: string;
  128: string;
}
export type ManifestIcons = ManifestIconMap | string;

interface ManifestBrowserAction {
  defaultIcon: ManifestIcons;
  defaultTitle: string;
  defaultPopup: string;
}

interface ManifestBackgroundOptions {
  scripts: string[];
}

interface ManifestSettingsOptions {
  page: string;
  openInTab: boolean;
}

export interface ManifestOptions {
  name: string;
  shortName: string;
  description: string;
  version: string;
  icons: ManifestIcons;
  browserAction: ManifestBrowserAction;
  pageAction: ManifestBrowserAction;
  permissions: string[];
  contentSecurityPolicy: string;
  backgroundOptions: ManifestBackgroundOptions;
  settingsOptions: ManifestSettingsOptions;
  offlineEnabled: boolean;
}

export interface CwexConfig {
  // array of glob matching patterns of files and directories
  include: string[];

  // array of regular expressions matching  files and directories to be excluded
  exclude: string[];

  // target browser extensions
  targets: string[];

  // root directory to find files and directories
  rootDir: string;

  // directory where the build would be compiled to
  outDir: string;

  // path to script to execute before compiling extension
  beforeCompile?: string;

  // Manifest file options
  manifestOptions?: ManifestOptions;
}

export interface ExtensionInfo {
  content: string;
  fileName: string;
  fileType: string;
}

export type ExtensionInfoGenerator = (config: CwexConfig) => Promise<ExtensionInfo>;

export interface ExtensionCompilerOption {
  extensionFilesDir: string;
  extensionBuildOutputDir: string;
  config: CwexConfig;
}

export type ExtensionCompiler = (opts: ExtensionCompilerOption) => Promise<boolean>;

export const defaultConfig: CwexConfig = {
  include: [],
  exclude: [],
  targets: [...Object.values(EXTENSION_TARGET)],
  rootDir: './',
  outDir: 'out',
};

export const getConfigFile = async () => {
  return await findUp(CONFIG_FILE_NAMES);
};

export const getConfig = async (configPath = '') => {
  const pathToConfig = configPath ? configPath : await getConfigFile();
  let config = { ...defaultConfig };
  if (pathToConfig) {
    console.log('Config file found:', pathToConfig);
    try {
      config = { ...config, ...yaml.parse(readFileSync(pathToConfig, 'utf8')) };
    } catch (err) {
      console.error('The config file is invalid. Check that you have a valid YAML file.');
      throw err;
    }
  } else {
    console.log('Config file not found.');
  }

  return config;
};
