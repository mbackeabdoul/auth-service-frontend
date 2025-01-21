import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

function GoogleAuth() {
  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: { Authorization: `Bearer ${response.access_token}` }
          }
        );

        console.log("User info received:", userInfo.data);

        const backendRes = await axios.post('https://auth-service-backend.onrender.com/api/auth/google-signup', {
          email: userInfo.data.email,
          firstName: userInfo.data.given_name,
          lastName: userInfo.data.family_name,
          googleId: userInfo.data.sub
        });

        localStorage.setItem('token', backendRes.data.token);
        console.log('Connexion réussie!');
      } catch (error) {
        console.error('Erreur détaillée:', error.response?.data || error.message);
      }
    },
    onError: (error) => {
      console.error('Erreur de connexion Google:', error);
    }
  });

  return (
    <button
      onClick={() => {
        try {
          login();
        } catch (error) {
          console.error('Erreur au clic:', error);
        }
      }}
      className="w-full p-2 border rounded flex items-center justify-center gap-2 hover:bg-gray-50"
    >
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
      </svg>
      Continuer avec Google
    </button>
  );
}

export default GoogleAuth;