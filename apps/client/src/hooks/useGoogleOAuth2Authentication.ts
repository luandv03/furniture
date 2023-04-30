import {
    GoogleLoginResponse,
    GoogleLoginResponseOffline,
} from "react-google-login";
import axios from "axios";

export const useGoogleOAuth2Authentication = () => {
    const handleSuccess = async (
        response: GoogleLoginResponse | GoogleLoginResponseOffline
    ) => {
        if ("accessToken" in response) {
            await axios.post(
                `${process.env.BASE_URL}/customer/auth/google-authentication`,
                {
                    token: response.accessToken,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        }
    };

    return {
        handleSuccess,
    };
};
