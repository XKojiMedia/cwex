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

export interface ManifestBrowserAction {
  default_icon?: ManifestIcons;
  default_title?: string;
  default_popup?: string;
}

interface ManifestBackgroundOptions {
  scripts: string[];
}

interface ManifestSettingsOptions {
  page: string;
  open_in_tab: boolean;
}

export interface ManifestOptions {
  version: string;
  name: string;
  short_name?: string;
  description?: string;
  icons?: ManifestIcons;
  browser_action?: ManifestBrowserAction;
  page_action?: ManifestBrowserAction;
  permissions?: string[];
  content_security_policy?: string;
  background?: ManifestBackgroundOptions;
  options_ui?: ManifestSettingsOptions;
  offline_enabled?: boolean;
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

  // Config options specific to a target e.g. chrome: { include, exclude, etc }
  targetOptions?: { [key: string]: CwexConfig };
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
