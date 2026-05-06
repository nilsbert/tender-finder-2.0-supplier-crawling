import { describe, it, expect } from 'vitest'
import { Identity, RoutePolicy } from './index'

describe('Identity Value Object', () => {
    it('should throw error when email is missing or invalid', () => {
        expect(() => new Identity("not-an-email")).toThrow("Invalid email format");
    });

    it('should respect explicit isAdmin status', () => {
        const admin = new Identity('admin@mhp.com', 'Admin', true);
        const user = new Identity('user@mhp.com', 'User', false);

        expect(admin.isAdmin).toBe(true);
        expect(user.isAdmin).toBe(false);
    });

    it('should respect isAdmin flag', () => {
        const id = new Identity('admin@mhp.com', 'Admin User', true)
        expect(id.isAdmin).toBe(true)
    })
});

describe('RoutePolicy', () => {
    it('should identify /dashboard as a public route', () => {
        expect(RoutePolicy.isPublic('/dashboard')).toBe(true);
    });

    it('should identify /config/ai as requiring admin', () => {
        expect(RoutePolicy.requiresAdmin('/config/ai')).toBe(true);
    });
});
