import globby, { GlobbyOptions } from 'globby';

export const getFiles = (patterns: string[], opts: GlobbyOptions = {}) => {
  return globby(patterns, opts);
};
