import { CweConfig, ManifestIcons, ExtensionInfo, ExtensionCompiler } from '../config';
const webExt = require('web-ext').default;

interface MozillaAddonBrowserAction {
  default_icon?: ManifestIcons;
}
interface MozillaAddonBackground {
  scripts: string[];
}
interface MozillaAddonOptionsUi {
  page: string;
  open_in_tab: boolean;
}

interface MozillaAddon {
  manifest_version: 2;
  name: string;
  short_name: string;
  description: string;
  version: string;
  icons: ManifestIcons;
  browser_action: MozillaAddonBrowserAction;
  permissions: string[];
  content_security_policy: string;
  background: MozillaAddonBackground;
  options_ui?: MozillaAddonOptionsUi;
  offline_enabled: boolean;
}

const buildBrowserAction = (config: CweConfig): MozillaAddonBrowserAction => {
  if (config.manifestOptions?.browserAction) {
    return {
      default_icon: config.manifestOptions.browserAction.defaultIcon,
    };
  }
  return {};
};

const buildOptionsUi = (config: CweConfig): MozillaAddonOptionsUi | undefined => {
  if (config.manifestOptions?.settingsOptions) {
    return {
      page: config.manifestOptions.settingsOptions.page,
      open_in_tab: config.manifestOptions.settingsOptions.openInTab,
    };
  }
  return undefined;
};

const buildExtensionData = (config: CweConfig): MozillaAddon | null => {
  if (!config.manifestOptions) {
    return null;
  }

  return {
    manifest_version: 2,
    name: config.manifestOptions.name,
    short_name: config.manifestOptions.shortName,
    description: config.manifestOptions.description,
    version: config.manifestOptions.version,
    icons: config.manifestOptions.icons,
    browser_action: buildBrowserAction(config),
    permissions: config.manifestOptions.permissions,
    content_security_policy: config.manifestOptions.contentSecurityPolicy,
    background: config.manifestOptions.backgroundOptions,
    options_ui: buildOptionsUi(config),
    offline_enabled: config.manifestOptions.offlineEnabled,
  };
};

export const generateExtensionInfo = async(config: CweConfig): Promise<ExtensionInfo> => {
  return {
    content: JSON.stringify(buildExtensionData(config), null, 2),
    fileName: 'manifest.json',
    fileType: 'json',
  };
};

export default generateExtensionInfo;

export const compileExtension: ExtensionCompiler = async (opts) => {
  return await webExt.cmd.build({
    sourceDir: opts.extensionFilesDir,
    overwriteDest: true,
    artifactsDir: opts.extensionBuildOutputDir,
  });
};
