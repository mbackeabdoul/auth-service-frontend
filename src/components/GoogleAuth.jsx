import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function GoogleAuth() {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: { Authorization: `Bearer ${response.access_token}` }
          }
        );

        console.log("Tentative d'envoi au backend:", {
          email: userInfo.data.email,
          firstName: userInfo.data.given_name,
          lastName: userInfo.data.family_name,
          googleId: userInfo.data.sub
        });

        const backendResponse = await axios.post(
          'http://localhost:5000/api/auth/google-signup',
          {
            email: userInfo.data.email,
            firstName: userInfo.data.given_name,
            lastName: userInfo.data.family_name,
            googleId: userInfo.data.sub
          }
        );

        if (backendResponse.data.token) {
          localStorage.setItem('token', backendResponse.data.token);
          setSuccess('Connexion Google réussie!');
          setTimeout(() => {
            navigate('/dashboard'); // Utilisez `navigate` pour rediriger
          }, 2000);
        } else {
          throw new Error('Token non reçu du backend');
        }

      } catch (error) {
        console.error('Erreur complète:', error);
        setError(
          error.response?.data?.message || 
          'Erreur lors de la connexion avec Google'
        );
      }
    },
    onError: (error) => {
      console.error('Erreur login Google:', error);
      setError('Échec de la connexion avec Google');
    }
  });

  return (
    <div>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      <button
        onClick={() => googleLogin()}
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
    </div>
  );
}

export default GoogleAuth;
