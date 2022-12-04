import fs from "fs";
import path from "path";
import {
  CwexConfig,
  ManifestIcons,
  ExtensionInfo,
  ExtensionCompilerOption,
  ExtensionCompiler,
  IDictionary,
  ManifestContentScriptOptions,
} from "../config";
import archiver from "archiver";
import { ensureFile } from "fs-extra";
import log from "../utils/logger";

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
  manifest_version: 2;
  name: string;
  version: string;
  short_name?: string;
  description?: string;
  author?: string;
  icons?: ManifestIcons;
  browser_action?: ChromeExtensionBrowserAction;
  permissions?: string[];
  content_security_policy?: string;
  background?: ChromeExtensionBackground;
  options_ui?: ChromeExtensionOptionsUi;
  offline_enabled?: boolean;
  chrome_settings_overrides?: IDictionary;
  chrome_ui_overrides?: IDictionary;
  chrome_url_overrides?: IDictionary;
  commands?: IDictionary;
  content_scripts?: IDictionary<ManifestContentScriptOptions>;
  devtools_page?: string;
  homepage_url?: string;
  incognito?: "spanning" | "split" | "not_allowed";
  minimum_chrome_version?: string;
  omnibox?: IDictionary;
  storage?: IDictionary;
  web_accessible_resources?: IDictionary;
}

const buildBrowserAction = (
  config: CwexConfig
): ChromeExtensionBrowserAction => {
  if (config.manifestOptions?.browser_action) {
    return {
      default_icon: config.manifestOptions.browser_action.default_icon,
    };
  }
  return {};
};

const buildOptionsUi = (
  config: CwexConfig
): ChromeExtensionOptionsUi | undefined => {
  if (config.manifestOptions?.options_ui) {
    return {
      page: config.manifestOptions.options_ui.page,
      open_in_tab: config.manifestOptions.options_ui.open_in_tab,
    };
  }
  return undefined;
};

const buildExtensionData = (config: CwexConfig): ChromeExtension | null => {
  if (!config.manifestOptions) {
    return null;
  }

  return {
    manifest_version: 2,
    name: config.manifestOptions.name,
    version: config.manifestOptions.version,
    short_name: config.manifestOptions.short_name,
    description: config.manifestOptions.description,
    author: config.manifestOptions.author,
    icons: config.manifestOptions.icons,
    browser_action: buildBrowserAction(config),
    permissions: config.manifestOptions.permissions,
    content_security_policy: config.manifestOptions.content_security_policy,
    background: config.manifestOptions.background,
    options_ui: buildOptionsUi(config),
    offline_enabled: config.manifestOptions.offline_enabled,
    chrome_settings_overrides: config.manifestOptions.chrome_settings_overrides,
    chrome_ui_overrides: config.manifestOptions.chrome_ui_overrides,
    chrome_url_overrides: config.manifestOptions.chrome_url_overrides,
    commands: config.manifestOptions.commands,
    content_scripts: config.manifestOptions.content_scripts,
    devtools_page: config.manifestOptions.devtools_page,
    homepage_url: config.manifestOptions.homepage_url,
    incognito: config.manifestOptions.incognito,
    minimum_chrome_version: config.manifestOptions.minimum_chrome_version,
    omnibox: config.manifestOptions.omnibox,
    storage: config.manifestOptions.storage,
    web_accessible_resources: config.manifestOptions.web_accessible_resources,
  };
};

export const generateExtensionInfo = async (
  config: CwexConfig
): Promise<ExtensionInfo> => {
  const extensionData = buildExtensionData(config);
  return {
    content: extensionData ? JSON.stringify(extensionData, null, 2) : "",
    fileName: "manifest.json",
    fileType: "json",
  };
};

export const compileExtension: ExtensionCompiler = async (
  opts: ExtensionCompilerOption
) => {
  const outputPath = path.resolve(
    opts.extensionBuildOutputDir,
    opts.config.outFile ?? "chrome.zip"
  );
  await ensureFile(outputPath);
  const output = fs.createWriteStream(outputPath);

  return new Promise((resolve, reject) => {
    // zip extension files
    const archive = archiver("zip");

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on("close", () => {
      // log(archive.pointer() + ' total bytes');
      // log('archiver has been finalized and the output file descriptor has closed.');
      return resolve(true);
    });

    // This event is fired when the data source is drained no matter what was the data source.
    // It is not part of this library but rather from the NodeJS Stream API.
    // @see: https://nodejs.org/api/stream.html#stream_event_end
    output.on("end", () => {
      log("Data has been drained");
      return resolve(true);
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on("warning", (err) => {
      if (err.code === "ENOENT") {
        // log warning
        log(err);
      } else {
        // throw error
        return reject(err);
      }
    });

    // good practice to catch this error explicitly
    archive.on("error", (err) => {
      return reject(err);
    });

    // pipe archive data to the file
    archive.pipe(output);

    // append files from a sub-directory, putting its contents at the root of archive
    archive.directory(opts.extensionFilesDir, false);

    // finalize the archive (ie we are done appending files but streams have to finish yet)
    // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
    archive.finalize();
  });
};

export default generateExtensionInfo;
