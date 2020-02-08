import { readFileSync } from 'fs';
import findUp from 'find-up';
import yaml from 'yaml';

export enum EXTENSION_TARGET {
  CHROME = 'chrome',
  MOZILLA = 'mozilla',
}

export const CONFIG_FILE_NAMES = [
  'cwe.yml',
  '.cwerc',
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

export interface CweConfig {
  // array of glob matching patterns of files and directories
  include: string[];

  // array of glob matching patterns of files and directories
  exclude: string[];

  // target browser extensions
  targets: string[];

  // root directory to find files and directories
  rootDir: string;

  // directory where the build would be compiled to
  outDir: string;

  // Manifest file options
  manifestOptions?: ManifestOptions;
}

export interface ExtensionInfo {
  content: string;
  fileName: string;
  fileType: string;
}

export type ExtensionInfoGenerator = (config: CweConfig) => Promise<ExtensionInfo>;

export interface ExtensionCompilerOption {
  extensionFilesDir: string;
  extensionBuildOutputDir: string;
  config: CweConfig;
}

export type ExtensionCompiler = (opts: ExtensionCompilerOption) => Promise<boolean>;

export const defaultConfig: CweConfig = {
  include: [],
  exclude: [],
  targets: [...Object.values(EXTENSION_TARGET), 'x'],
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
