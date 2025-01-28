import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');  // Si le token est absent, redirige vers la page de login
      return;  // Sortir de l'effet pour ne pas essayer de charger les données
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (error) {
        console.error('Erreur:', error);
        if (error.response?.status === 401) {
          handleLogout();  // Si le token est invalide, déconnexion
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);  // Ajout de `navigate` dans les dépendances pour garantir qu'il reste cohérent

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');  // Redirection après déconnexion
  };
  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold">Mon Dashboard</span>
            </div>
            <div className="flex items-center">
              <span className="mr-4">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Carte Profil */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Profil</h3>
                <dl className="mt-2 divide-y divide-gray-200">
                  <div className="py-3">
                    <dt className="text-sm font-medium text-gray-500">Nom</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user?.firstName} {user?.lastName}</dd>
                  </div>
                  <div className="py-3">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                  </div>
                  <div className="py-3">
                    <dt className="text-sm font-medium text-gray-500">Membre depuis</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(user?.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Carte Statistiques */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Statistiques</h3>
                <div className="mt-5 grid grid-cols-2 gap-5">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500">Total Visites</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500">Actions</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
                  </div>
                </div>
              </div>
            </div>

            {/* Carte Actions Rapides */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Actions Rapides</h3>
                <div className="mt-4 space-y-4">
                  <button className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Modifier le profil
                  </button>
                  <button className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                    Nouvelle action
                  </button>
                  <button className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                    Voir les statistiques
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
