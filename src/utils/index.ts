import globby, { GlobbyOptions } from 'globby';

export const getFiles = (patterns: string[], opts: GlobbyOptions = {}) => {
  return globby(patterns, opts);
};

export const getResolvedModule = (modulePath: string) => {
  try {
    return require.resolve(modulePath);
  } catch (err) {
    return '';
  }
};

export const getResolvedTargetModule = (target: string) => {
  return getResolvedModule(`../targets/${target}`);
};
