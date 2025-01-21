import React, { useState } from 'react';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';

const AuthForm = () => {
  const [isQuickSignup, setIsQuickSignup] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        // Obtenir les informations du profil Google
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: { Authorization: `Bearer ${response.access_token}` }
          }
        );

        // Envoyer les données au backend
        const backendResponse = await axios.post('http://localhost:5000/api/auth/google-signup', {
          email: userInfo.data.email,
          firstName: userInfo.data.given_name,
          lastName: userInfo.data.family_name,
          googleId: userInfo.data.sub
        });

        setSuccess('Connexion avec Google réussie !');
        // Gérer le token JWT reçu du backend
        localStorage.setItem('token', backendResponse.data.token);
      } catch (error) {
        setError(error.response?.data?.message || 'Erreur lors de la connexion avec Google');
      }
    },
    onError: () => {
      setError('La connexion avec Google a échoué');
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isQuickSignup) {
        const response = await axios.post('http://localhost:5000/api/auth/quick-signup', {
          email: formData.email
        });
        setSuccess(`Inscription réussie! Consultez votre email pour le mot de passe temporaire`);
        localStorage.setItem('token', response.data.token);
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Les mots de passe ne correspondent pas');
          return;
        }
        const response = await axios.post('http://localhost:5000/api/auth/full-signup', {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        });
        setSuccess('Inscription réussie!');
        localStorage.setItem('token', response.data.token);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Une erreur est survenue');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Inscription</h2>
      
      {/* Bouton Google */}
      <button
        onClick={() => googleLogin()}
        className="w-full mb-4 bg-white border border-gray-300 text-gray-700 p-2 rounded flex items-center justify-center hover:bg-gray-50"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continuer avec Google
      </button>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">ou</span>
        </div>
      </div>

      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isQuickSignup}
            onChange={() => setIsQuickSignup(!isQuickSignup)}
            className="form-checkbox"
          />
          <span>Inscription rapide avec email</span>
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isQuickSignup && (
          <>
            <div>
              <input
                type="text"
                name="firstName"
                placeholder="Prénom"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required={!isQuickSignup}
              />
            </div>
            <div>
              <input
                type="text"
                name="lastName"
                placeholder="Nom"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required={!isQuickSignup}
              />
            </div>
          </>
        )}

        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {!isQuickSignup && (
          <>
            <div>
              <input
                type="password"
                name="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required={!isQuickSignup}
              />
            </div>
            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmer le mot de passe"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required={!isQuickSignup}
              />
            </div>
          </>
        )}

        {error && (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50">
            {success}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          S'inscrire
        </button>
      </form>
    </div>
  );
};

export default AuthForm;