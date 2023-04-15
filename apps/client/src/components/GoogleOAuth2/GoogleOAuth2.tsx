"use client";
import React from "react";
import GoogleLogin from "react-google-login";
import { useGoogleOAuth2Authentication } from "@/hooks/useGoogleOAuth2Authentication";

export const GoogleOAuth2 = () => {
    const clientId = process.env.GOOGLE_OAUTH2_CLIENT_ID as string;
    const { handleSuccess } = useGoogleOAuth2Authentication();
    return (
        <GoogleLogin
            clientId={clientId}
            buttonText="Login"
            onSuccess={handleSuccess}
        ></GoogleLogin>
    );
};
