import { useEffect, useState } from 'react';
import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import mathJaxAsset from '@/assets/mathjax/tex-svg-full.txt';

let cached: Promise<string> | null = null;
let resolved: string | null = null;

const readMathJaxScript = async (): Promise<string> => {
  const asset = Asset.fromModule(mathJaxAsset);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  if (uri.startsWith('file:')) return new File(uri).text();
  const response = await fetch(uri);
  if (!response.ok) throw new Error(`mathjax asset ${ response.status }`);
  return response.text();
};

// 설치본 MathJax 스크립트를 한 번만 읽어 문자열로 캐시한다
export const loadMathJaxScript = (): Promise<string> => {
  if (!cached) {
    cached = readMathJaxScript().then((text) => {
      resolved = text;
      return text;
    }, (error: unknown) => {
      cached = null;
      throw error;
    });
  }
  return cached;
};

// 읽는 중이면 null, 실패하면 빈 문자열(수식 없이 본문만 표시)
export const useMathJaxScript = (): string | null => {
  const [script, setScript] = useState<string | null>(resolved);
  useEffect(() => {
    if (resolved !== null) return;
    let cancelled = false;
    loadMathJaxScript().then(
      (text) => {
        if (!cancelled) setScript(text);
      },
      () => {
        if (!cancelled) setScript('');
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);
  return script;
};
