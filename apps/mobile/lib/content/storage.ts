import { Directory, File, Paths } from 'expo-file-system';
import type { ContentVersion, StoredContent, TermData } from '@diki/core';

const contentDir = () => new Directory(Paths.document, 'content');
const termsFile = () => new File(contentDir(), 'terms.json');
const versionFile = () => new File(contentDir(), 'version.json');

export const readStoredContent = async (): Promise<StoredContent | null> => {
  try {
    const terms = termsFile();
    const version = versionFile();
    if (!terms.exists || !version.exists) return null;
    const [termsText, versionText] = await Promise.all([terms.text(), version.text()]);
    return { terms: JSON.parse(termsText), version: JSON.parse(versionText) };
  } catch {
    return null;
  }
};

const writeReplacing = async (target: File, content: string): Promise<void> => {
  const tmp = new File(contentDir(), `${ target.name }.tmp`);
  if (tmp.exists) tmp.delete();
  tmp.create();
  await tmp.write(content);
  await tmp.move(target, { overwrite: true });
};

// version.json 을 마지막에 바꿔 중간에 끊겨도 형식 검사로 걸러지게 한다
export const saveContent = async (terms: TermData[], version: ContentVersion): Promise<void> => {
  const dir = contentDir();
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  await writeReplacing(termsFile(), JSON.stringify(terms));
  await writeReplacing(versionFile(), JSON.stringify(version));
};
