import React, { useState } from 'react';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
        console.log("Google User Info:", userInfo.data);

        const backendResponse = await axios.post('http://localhost:5000/api/auth/google-signup', {
          email: userInfo.data.email,
          firstName: userInfo.data.given_name,
          lastName: userInfo.data.family_name,
          googleId: userInfo.data.sub
        });

        localStorage.setItem('token', backendResponse.data.token);
        setSuccess('Connexion Google réussie!');
        // Utiliser navigate pour rediriger
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);

      } catch (error) {
        console.error('Erreur Google Auth:', error);
        setError(error.response?.data?.message || 'Erreur de connexion Google');
      }
    },
    onError: (error) => {
      console.error('Erreur Google:', error);
      setError('Échec de la connexion Google');
    },
    redirectUri: 'https://jade-faun-d9c6a4.netlify.app/login'  // Spécifiez l'URL de redirection ici
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const endpoint = isLogin ? 'login' : 'register';
      const response = await axios.post(`http://localhost:5000/api/auth/${endpoint}`, formData);
      
      localStorage.setItem('token', response.data.token);
      setSuccess(isLogin ? 'Connexion réussie!' : 'Inscription réussie!');
      
      // Utiliser navigate pour rediriger
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      setError(error.response?.data?.message || 'Une erreur est survenue');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isLogin ? 'Connexion' : 'Inscription'}
      </h2>

      {/* Bouton Google */}
      <button
        onClick={() => googleLogin()}
        className="w-full mb-4 p-2 border rounded flex items-center justify-center gap-2 hover:bg-gray-50"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
        </svg>
        Continuer avec Google
      </button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">ou</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <>
            <input
              type="text"
              name="firstName"
              placeholder="Prénom"
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required={!isLogin}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Nom"
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required={!isLogin}
            />
          </>
        )}
        
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-100 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 text-sm text-green-600 bg-green-100 rounded">
            {success}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {isLogin ? 'Se connecter' : "S'inscrire"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-500 hover:underline"
        >
          {isLogin ? "S'inscrire" : "Se connecter"}
        </button>
      </p>
    </div>
  );
};

export default AuthForm;
