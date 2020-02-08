import fs from 'fs';
import path from 'path';
import { CweConfig, ManifestIcons, ExtensionInfo, ExtensionCompilerOption, ExtensionCompiler } from '../config';
import archiver from 'archiver';
import { ensureFile } from 'fs-extra';

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

export const compileExtension: ExtensionCompiler = async(opts: ExtensionCompilerOption) => {
  const outputPath = path.resolve(opts.extensionBuildOutputDir, 'chrome.zip');
  await ensureFile(outputPath);
  const output = fs.createWriteStream(outputPath);

  return new Promise((resolve, reject) => {

    // zip extension files
    const archive = archiver('zip');
     
    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on('close', () => {
      // console.log(archive.pointer() + ' total bytes');
      // console.log('archiver has been finalized and the output file descriptor has closed.');
      return resolve(true);
    });

    // This event is fired when the data source is drained no matter what was the data source.
    // It is not part of this library but rather from the NodeJS Stream API.
    // @see: https://nodejs.org/api/stream.html#stream_event_end
    output.on('end', () => {
      console.log('Data has been drained');
      return resolve(true);
    });
    
    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        // log warning
        console.log(err);
      } else {
        // throw error
        return reject(err);
      }
    });
    
    // good practice to catch this error explicitly
    archive.on('error', (err) => {
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
