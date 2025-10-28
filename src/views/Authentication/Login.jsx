import React, {useState, useEffect, useRef} from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/script/AuthContext";
import Orbiez from "../../components/ui/Orbiez"
import gravyn from "../../images/icons/gravyn.svg"
import styles from "./Login.module.css"

import google from "../../images/icons/google.svg"
import linkedin from "../../images/icons/linkedin.svg"
import microsoft from "../../images/icons/microsoft.svg"










const CustomGoogleLoginButton = ({ handleLogin }) => {
    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            handleLogin(tokenResponse.access_token);
        },
        onError: () => console.log("Login Failed"),
    });

    return (
        <div
            onClick={() => login()}
            className={`${styles['sign-btn']} ${styles['google-btn']}`}
        >
            <img src={google}/>
            <p>Sign in with Google</p>
        </div>
    );
};




const Login = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const { login } = useAuth();



    const handleLogin = async (accessToken) => {
        try {

            console.log("Access token" , accessToken)

            const res = await fetch("http://localhost:5001/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tokenId: accessToken }),
                credentials: 'include' // 🔥 This is what tells browser to store cookies!
            });

            const data = await res.json();
            console.log(" login page" , data)

            if (data?.user) {
                console.log("Data of logged in user form login page" , data)
                login(data.user); // ✅ Store in context
            } else {
                console.error("Login failed:", data);
            }
        } catch (error) {
            console.error("Login error:", error);
        }
    };


    return (
        <div className={styles['parent-wrapper']}>

            <Orbiez/>


            <div className={styles['login-modal']}>
                <div className={styles['login-header']}>
                    <img src={gravyn}/>
                    <p className={styles['login-header-title']}>Sign in with Gravyn</p>
                    <p>Move work forward with a secure, single login across projects and teams.</p>
                </div>

                {user ? (
                    <div>
                        <p>Welcome, {user.name}</p>
                    </div>
                ) : (
                    <div className={styles['login-content-wrapper']}>
                       <CustomGoogleLoginButton handleLogin={handleLogin}/>

                               <div
                               onClick={() => login()}
                               className={`${styles['sign-btn']} ${styles['google-btn']}`}
                               >
                                  <img src={microsoft}/>
                                     <p>Sign in with Microsoft</p>
                               </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default Login;