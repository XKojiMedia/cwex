import debug from 'debug';

export const enableLogging = () => debug.enable('cwex');
export const disableLogging = () => debug.disable();

export const log = debug('cwex');
export default log;
