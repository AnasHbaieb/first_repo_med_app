import React from 'react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg mt-10">
        <div className="flex items-center mb-6">
          <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Retour
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Espace Administrateur</h1>
        </div>
        <p className="text-gray-600 mb-8">Accès au tableau de bord administrateur</p>

        <div className="p-6 bg-white rounded-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Connexion</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe *</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder="Entrez votre mot de passe"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors duration-300"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
