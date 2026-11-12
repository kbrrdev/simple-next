async function loadEnv(values: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(values)) vi.stubEnv(key, value);
  return (await import('./env')).env;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('env', () => {
  it('reads the API URL without a trailing slash, and defaults the store name', async () => {
    const env = await loadEnv({
      NEXT_PUBLIC_API_URL: 'http://api.test/',
      NEXT_PUBLIC_STORE_NAME: '',
    });

    expect(env).toEqual({
      apiUrl: 'http://api.test',
      siteUrl: 'http://shop.test',
      imageUrl: undefined,
      storeName: 'Store',
    });
  });

  it('uses the configured store name', async () => {
    const env = await loadEnv({ NEXT_PUBLIC_STORE_NAME: ' Sample Shop ' });

    expect(env.storeName).toBe('Sample Shop');
  });

  it('stops when the API URL is missing', async () => {
    await expect(loadEnv({ NEXT_PUBLIC_API_URL: '' })).rejects.toThrow(/is not set/);
  });

  it('reads an optional image URL', async () => {
    const env = await loadEnv({ NEXT_PUBLIC_IMAGE_URL: 'https://cdn.test/bucket/' });

    expect(env.imageUrl).toBe('https://cdn.test/bucket');
  });

  it('stops when the API URL is not a URL', async () => {
    await expect(loadEnv({ NEXT_PUBLIC_API_URL: 'not a url' })).rejects.toThrow(/not a valid URL/);
  });
});
