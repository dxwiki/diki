import { Linking } from 'react-native';
import { WEB_BASE_URL } from './config';

export const webUrl = (path: string): string => `${ WEB_BASE_URL }${ path.startsWith('/') ? path : `/${ path }` }`;

export const openExternal = async (url: string): Promise<boolean> => {
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
};

export const openWeb = (path: string): Promise<boolean> => openExternal(webUrl(path));
