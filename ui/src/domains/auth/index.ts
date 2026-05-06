/**
 * Value Object representing the authenticated user's identity.
 */
export class Identity {
    constructor(
        public readonly email: string,
        public readonly name?: string,
        private readonly _isAdmin: boolean = false,
        public readonly oid?: string,
        public readonly tenantId?: string,
        public readonly firstName?: string,
        public readonly lastName?: string
    ) {
        if (!email || !email.includes("@")) {
            console.error("Identity Validation Failed - raw email value:", `'${email}'`, typeof email);
            throw new Error(`Invalid email format for Identity: ${email || "(empty)"}`);
        }
    }

    get isAdmin(): boolean {
        return this._isAdmin;
    }

    static fromAccount(account: any, isAdmin: boolean = false): Identity {
        return new Identity(
            account.username || account.idTokenClaims?.preferred_username || account.idTokenClaims?.email,
            account.name || account.idTokenClaims?.name,
            isAdmin,
            account.idTokenClaims?.oid,
            account.idTokenClaims?.tid
        );
    }
}

/**
 * Policy defining route access rules.
 */
export class RoutePolicy {
    private static publicRoutes = ["/dashboard", "/tenders"];

    static isPublic(path: string): boolean {
        return this.publicRoutes.some(route => path.startsWith(route));
    }

    static requiresAdmin(path: string): boolean {
        return path.startsWith("/config") || path.startsWith("/admin");
    }
}
