import globby, { GlobbyOptions } from 'globby';

export const getFiles = (patterns: string[], opts: GlobbyOptions = {}) => {
  return globby(patterns, opts);
};

export const getResolvedModule = (modulePath: string, { resolver = require.resolve } = {}) => {
  try {
    return resolver(modulePath);
  } catch (err) {
    return '';
  }
};

export const getResolvedTargetModule = (target: string, { resolver = require.resolve } = {}) => {
  return getResolvedModule(`../targets/${target}`, { resolver });
};
