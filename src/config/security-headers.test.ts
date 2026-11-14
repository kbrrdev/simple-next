import { securityHeaders } from './security-headers';

function csp(options: Parameters<typeof securityHeaders>[0]) {
  return securityHeaders(options).find((header) => header.key === 'Content-Security-Policy')?.value;
}

describe('securityHeaders', () => {
  it('allows only the API and the image host, and no framing', () => {
    const policy = csp({
      apiUrl: 'https://api.store.ph/',
      imageUrl: 'https://images.store.ph/uploads',
      development: false,
    });

    expect(policy).toContain(
      "img-src 'self' data: blob: https://api.store.ph https://images.store.ph",
    );
    expect(policy).toContain("connect-src 'self' https://api.store.ph");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("form-action 'self'");
    expect(policy).not.toContain('unsafe-eval');
  });

  it('lets the development server evaluate code and reload', () => {
    const policy = csp({ apiUrl: 'http://localhost:3000', development: true });

    expect(policy).toContain("'unsafe-eval'");
    expect(policy).toContain('ws:');
  });
});
