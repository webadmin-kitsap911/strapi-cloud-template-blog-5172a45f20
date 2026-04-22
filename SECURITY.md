# Security Notes

## Remaining Low-Severity Vulnerability: elliptic

As of April 2026, `npm audit` reports 4 low-severity vulnerabilities related to the `elliptic` package.

### Affected Dependency Chain

```
@strapi/plugin-users-permissions
  └── grant (OAuth provider)
        └── jwk-to-pem (JWT key conversion)
              └── elliptic (elliptic curve cryptography)
```

### What the Vulnerability Is

The advisory [GHSA-848j-6mx2-7j84](https://github.com/advisories/GHSA-848j-6mx2-7j84) describes a "risky cryptographic implementation" in the elliptic library. Specifically, it relates to ECDSA signature malleability—where valid signatures can be mathematically transformed into different but still-valid signatures.

### Why This Doesn't Put Us at Risk

1. **Signature malleability primarily affects blockchain/cryptocurrency applications** where transaction uniqueness depends on signature values. In web authentication contexts like OAuth, this is not exploitable.

2. **The vulnerability is in an indirect dependency** used only for OAuth provider integrations (Google, GitHub, etc. login). Our admin panel uses local authentication with TOTP, not OAuth.

3. **No known practical exploits exist** for this vulnerability in web authentication scenarios.

4. **The severity is rated "low"** by npm's audit system, indicating minimal real-world risk.

### Resolution Path

This will be resolved when Strapi updates their `grant` dependency to a version that uses a patched `jwk-to-pem` or alternative library. We are tracking this and will update when a fix is available upstream.

### References

- https://github.com/advisories/GHSA-848j-6mx2-7j84
- https://github.com/indutny/elliptic/issues/316
