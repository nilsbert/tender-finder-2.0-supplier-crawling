import { describe, it, expect } from 'vitest';
import { Identity } from './index';

describe('Identity Logic (feat-068)', () => {
    it('extracts OID and TenantID from MSAL claims in production', () => {
        const mockAccount = {
            username: 'alex@mhp.com',
            name: 'Alex Miller',
            idTokenClaims: {
                oid: 'aaaa-bbbb-cccc-dddd',
                tid: '72f988bf-86f1-41af-91ab-2d7cd011db47'
            }
        };

        // Simulate PRODUCTION environment
        const identity = new Identity(
            mockAccount.username,
            mockAccount.name,
            true,
            mockAccount.idTokenClaims.oid,
            mockAccount.idTokenClaims.tid
        );

        expect(identity.email).toBe('alex@mhp.com');
        expect(identity.oid).toBe('aaaa-bbbb-cccc-dddd');
        expect(identity.tenantId).toBe('72f988bf-86f1-41af-91ab-2d7cd011db47');
    });

    it('defaults isAdmin to false in the basic constructor', () => {
        const identity = new Identity('haruki@mhp.com', 'Haruki');
        expect(identity.isAdmin).toBe(false);
    });

    it('supports fromAccount factory mapping', () => {
        const mockAccount = {
            username: 'test@mhp.com',
            name: 'Test',
            idTokenClaims: {
                oid: 'oid-123',
                tid: 'tid-456'
            }
        };
        const identity = Identity.fromAccount(mockAccount, true);
        expect(identity.isAdmin).toBe(true);
        expect(identity.oid).toBe('oid-123');
        expect(identity.tenantId).toBe('tid-456');
    });
});
