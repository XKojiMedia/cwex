import globby, { GlobbyOptions } from 'globby';

export const getFiles = (patterns: string[], opts: GlobbyOptions = {}) => {
  return globby(patterns, opts);
};

export const getResolvedTargetModule = (target: string) => {
  try {
    return require.resolve(`../targets/${target}`);
  } catch (err) {
    return '';
  }
};
