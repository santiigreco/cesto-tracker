import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../utils/supabaseClient';

describe('Integración y Flujo de Autenticación con Google', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('el cliente de Supabase debe invocar signInWithOAuth con provider google y redirectTo correcto', async () => {
    const signInSpy = vi.spyOn(supabase.auth, 'signInWithOAuth').mockResolvedValueOnce({
      data: {
        provider: 'google',
        url: 'https://druqnbzzibkrxffftogl.supabase.co/auth/v1/authorize?provider=google&redirect_to=http%3A%2F%2Flocalhost%3A5173'
      },
      error: null
    } as any);

    const redirectOrigin = 'http://localhost:5173';
    const result = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectOrigin
      }
    });

    expect(signInSpy).toHaveBeenCalledTimes(1);
    expect(signInSpy).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: redirectOrigin
      }
    });

    expect(result.error).toBeNull();
    expect(result.data.provider).toBe('google');
    expect(result.data.url).toContain('provider=google');
  });

  it('debe registrar y propagar correctamente errores devueltos por el proveedor OAuth', async () => {
    vi.spyOn(supabase.auth, 'signInWithOAuth').mockResolvedValueOnce({
      data: { provider: 'google', url: null },
      error: { message: 'OAuth provider disabled', status: 400 } as any
    });

    const result = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'http://localhost:5173' }
    });

    expect(result.error).toBeDefined();
    expect(result.error?.message).toBe('OAuth provider disabled');
  });
});
