'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AiProviderId } from '@diki/core';
import { aiFetch, AiClientError, EMPTY_PUBLIC_STATE, type PublicKeyState } from './aiClient';

type Status = 'loading' | 'ready' | 'unavailable';

export function useAiKeys() {
  const [status, setStatus] = useState<Status>('loading');
  const [state, setState] = useState<PublicKeyState>(EMPTY_PUBLIC_STATE);
  const [models, setModels] = useState<Partial<Record<AiProviderId, string[]>>>({});

  useEffect(() => {
    let cancelled = false;
    aiFetch<PublicKeyState>('/keys')
      .then((data) => {
        if (cancelled) return;
        setState(data);
        setStatus('ready');
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus(error instanceof AiClientError && error.code === 'unavailable' ? 'unavailable' : 'ready');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const register = useCallback(async (provider: AiProviderId, apiKey: string) => {
    const data = await aiFetch<PublicKeyState & { models: string[] }>('/keys', { method: 'POST', body: { provider, apiKey } });
    setState(data);
    setModels((prev) => ({ ...prev, [provider]: data.models }));
  }, []);

  const loadModels = useCallback(async (provider: AiProviderId) => {
    const data = await aiFetch<{ models: string[] }>(`/keys/models?provider=${ provider }`);
    setModels((prev) => ({ ...prev, [provider]: data.models }));
  }, []);

  const update = useCallback(async (body: { active?: AiProviderId; provider?: AiProviderId; model?: string }) => {
    setState(await aiFetch<PublicKeyState>('/keys', { method: 'PATCH', body }));
  }, []);

  const remove = useCallback(async (provider?: AiProviderId) => {
    setState(await aiFetch<PublicKeyState>(provider ? `/keys?provider=${ provider }` : '/keys', { method: 'DELETE' }));
    if (provider) setModels((prev) => ({ ...prev, [provider]: undefined }));
    else setModels({});
  }, []);

  return { status, state, models, register, loadModels, update, remove };
}
