import { CweConfig, ManifestIcons, ExtensionInfo } from '../config';

interface ChromeExtensionBrowserAction {
  default_icon?: ManifestIcons;
}
interface ChromeExtensionBackground {
  scripts: string[];
}
interface ChromeExtensionOptionsUi {
  page: string;
  open_in_tab: boolean;
}

interface ChromeExtension {
  manifest_version: '2';
  name: string;
  short_name: string;
  description: string;
  version: string;
  icons: ManifestIcons;
  browser_action: ChromeExtensionBrowserAction;
  permissions: string[];
  content_security_policy: string;
  background: ChromeExtensionBackground;
  options_ui?: ChromeExtensionOptionsUi;
  offline_enabled: boolean;
}

const buildBrowserAction = (config: CweConfig): ChromeExtensionBrowserAction => {
  if (config.manifestOptions?.browserAction) {
    return {
      default_icon: config.manifestOptions.browserAction.defaultIcon,
    };
  }
  return {};
};

const buildOptionsUi = (config: CweConfig): ChromeExtensionOptionsUi | undefined => {
  if (config.manifestOptions?.settingsOptions) {
    return {
      page: config.manifestOptions.settingsOptions.page,
      open_in_tab: config.manifestOptions.settingsOptions.openInTab,
    };
  }
  return undefined;
};

const buildExtensionData = (config: CweConfig): ChromeExtension | null => {
  if (!config.manifestOptions) {
    return null;
  }

  return {
    manifest_version: '2',
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

const generateExtensionInfo = async(config: CweConfig): Promise<ExtensionInfo> => {
  return {
    content: JSON.stringify(buildExtensionData(config), null, 2),
    fileName: 'manifest.json',
    fileType: 'json',
  };
};

export default generateExtensionInfo;
