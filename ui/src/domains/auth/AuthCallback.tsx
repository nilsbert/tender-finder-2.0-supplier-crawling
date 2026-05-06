import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const AuthCallback: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { loginWithToken } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        const state = params.get("state") || "/";

        if (token) {
            console.log("IAM Gateway callback: Received valid identity token.");
            loginWithToken(token).then(() => {
                // Redirect back to the destination or dashboard
                const redirectPath = state.startsWith("/") ? state : "/dashboard";
                navigate(redirectPath);
            }).catch((err: any) => {
                console.error("Failed to finish login from token", err);
                navigate("/access-restricted");
            });
        } else {
             console.error("IAM Gateway callback: No token found in URL.");
             navigate("/");
        }
    }, [location, navigate, loginWithToken]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h1 className="text-xl font-bold">Completing Identity Verification...</h1>
                <p className="text-slate-400 mt-2">Connecting you to the secured portal.</p>
            </div>
        </div>
    );
};

export default AuthCallback;
