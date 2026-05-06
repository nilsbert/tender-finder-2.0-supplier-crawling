import React, { createContext, useContext, useEffect, useState } from "react";
import { PublicClientApplication, AccountInfo, InteractionStatus } from "@azure/msal-browser";
import { MsalProvider, useMsal } from "@azure/msal-react";
import { msalConfig } from "./msalConfig";
import { Identity } from "./index";

const msalInstance = new PublicClientApplication(msalConfig);

interface AuthContextType {
    identity: Identity | null;
    isLoading: boolean;
    login: () => Promise<void>;
    loginWithToken: (token: string) => Promise<void>;
    logout: () => Promise<void>;
    toggleRole: () => void;
    updateProfile: (firstName: string, lastName: string, email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <MsalProvider instance={msalInstance}>
            <AuthContent>{children}</AuthContent>
        </MsalProvider>
    );
};

const applyLocalProfile = (baseIdentity: Identity | null): Identity | null => {
    if (!baseIdentity) return null;
    try {
        const localStr = localStorage.getItem("userProfileMask");
        if (localStr) {
            const localData = JSON.parse(localStr);
            return new Identity(
                localData.email || baseIdentity.email,
                baseIdentity.name,
                localData.isAdmin !== undefined ? localData.isAdmin : baseIdentity.isAdmin,
                baseIdentity.oid,
                baseIdentity.tenantId,
                localData.firstName,
                localData.lastName
            );
        }
    } catch (e) {
        console.warn("Failed to parse local profile mask", e);
    }
    return baseIdentity;
};

const AuthContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { instance, accounts, inProgress } = useMsal();
    const [identity, setIdentityState] = useState<Identity | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const setIdentity = (newIdentity: Identity | null) => {
        setIdentityState(applyLocalProfile(newIdentity));
    };

    /**
     * Completes identity hydration from a raw OIDC token.
     */
    const loginWithToken = async (token: string) => {
        setIsLoading(true);
        try {
            // Store token for future requests (used in axios interceptors if needed, or manual fetch)
            sessionStorage.setItem("tf_identity_token", token);
            
            // Verify and hydrate from monolith backend
            const meRes = await fetch("/api/auth/me", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (meRes.ok) {
                const meData = await meRes.json();
                setIdentity(new Identity(
                    meData.email,
                    meData.name,
                    meData.is_admin,
                    meData.oid,
                    meData.tenantId
                ));
            } else {
                throw new Error("Failed to verify identity token with backend");
            }
        } catch (error) {
            console.error("Login with token failed", error);
            sessionStorage.removeItem("tf_identity_token");
            setIdentity(null);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const checkEnvironment = async () => {
            const authDisabled = import.meta.env.VITE_AUTH_DISABLED === "true";
            try {
                const res = await fetch("/api/config/status");
                const data = await res.json();

                // PRODUCTION or Explicit Enforcement: Support IAM Gateway Transition
                try {
                    // Check if we should use Mock Auth (Legacy Dev Mode)
                    const useMock = import.meta.env.VITE_AUTH_PROVIDER === "mock" || (data.environment !== "PRODUCTION" && !import.meta.env.VITE_AUTH_PROVIDER);

                    if (useMock && !authDisabled) {
                        setIdentity(new Identity("admin@mhp.com", "MHP Administrator", true));
                        setIsLoading(false);
                        return;
                    }
                    // Try to fetch identity using previously stored token
                    const storedToken = sessionStorage.getItem("tf_identity_token");
                    const headers: HeadersInit = storedToken ? { 'Authorization': `Bearer ${storedToken}` } : {};
                    
                    const meRes = await fetch("/api/auth/me", { headers });
                    if (meRes.ok) {
                        const meData = await meRes.json();
                        setIdentity(new Identity(
                            meData.email,
                            meData.name,
                            meData.is_admin,
                            meData.oid,
                            meData.tenantId
                        ));
                    } else if (meRes.status === 401) {
                        // Trigger IAM Gateway redirect if enforced (Prod or explicit flag)
                        const enforced = import.meta.env.VITE_AUTH_PROVIDER === 'msal';
                        const isPublicAuthRoute = window.location.pathname.startsWith("/auth") || window.location.pathname.startsWith("/access-restricted");
                        
                        if ((data.environment === "PRODUCTION" || enforced) && !isPublicAuthRoute) {
                            const iamUrl = import.meta.env.VITE_IAM_API_URL || "/iam";
                            window.location.href = `${iamUrl}/api/auth/login?state=${encodeURIComponent(window.location.pathname)}`;
                            return;
                        }
                        setIdentity(null);
                    } else if (meRes.status === 403) {
                        // Check for whitelist restriction
                        const errorData = await meRes.json();
                        if (errorData.detail === "WHITELIST_RESTRICTED") {
                             window.location.href = "/access-restricted";
                             return;
                        }
                        setIdentity(null);
                    }
                } catch (error) {
                    console.warn("Failed to fetch identity from backend", error);
                    setIdentity(null);
                }
            } catch (error) {
                console.error("Environment check failed", error);
                const authEnforced = import.meta.env.VITE_AUTH_PROVIDER === 'msal';
                if (!authDisabled && !authEnforced) {
                    setIdentity(new Identity("dev-admin@mhp.com", "Dev Admin", true));
                } else {
                    setIdentity(null);
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkEnvironment();
    }, []);

    const login = async () => {
        const iamUrl = import.meta.env.VITE_IAM_API_URL || "/iam";
        window.location.href = `${iamUrl}/api/auth/login?state=${encodeURIComponent(window.location.pathname)}`;
    };

    const logout = async () => {
        try {
            console.log("Initiating multi-stage logout...");
            
            // 1. Clear local state immediately
            setIdentity(null);
            sessionStorage.removeItem("tf_identity_token");

            // 2. Clear monolith session (Best effort)
            try {
                 await fetch("/api/auth/logout", { method: 'POST' });
            } catch (e) {
                 console.warn("Monolith logout fetch failed", e);
            }

            // 3. Global Redirect to IAM Microservice for MSAL sign-out
            const iamUrl = import.meta.env.VITE_IAM_API_URL || "/iam";
            const logoutTarget = `${iamUrl}/api/auth/logout`;
            
            console.log("Redirecting to global sign-out:", logoutTarget);
            window.location.href = logoutTarget;
            
        } catch (error) {
            console.error("Critical logout failure", error);
            window.location.href = "/";
        }
    };

    const toggleRole = () => {
        if (identity) {
            setIdentity(new Identity(identity.email, identity.name, !identity.isAdmin, identity.oid, identity.tenantId, identity.firstName, identity.lastName));
        }
    };

    const updateProfile = (firstName: string, lastName: string, email: string) => {
        localStorage.setItem("userProfileMask", JSON.stringify({ firstName, lastName, email }));
        if (identity) {
            // Re-apply to current identity
            setIdentityState(applyLocalProfile(new Identity(
                identity.email,
                identity.name,
                identity.isAdmin,
                identity.oid,
                identity.tenantId,
                identity.firstName,
                identity.lastName
            )));
        }
    };

    return (
        <AuthContext.Provider value={{ identity, isLoading, login, loginWithToken, logout, toggleRole, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
