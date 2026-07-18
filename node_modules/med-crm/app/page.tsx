import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 md:p-24 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Med-CRM</h1>
        <p className="text-xl text-gray-700">Système de Gestion des Étudiens</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center justify-between text-center border border-gray-100">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">Inscription Étudiant</h2>
          <p className="text-gray-700 mb-6">{"Formulaire d'inscription pour nouveaux étudiants"}</p>
          <Link href="/patients" className="w-full">
            <button className="bg-gray-900 text-white px-8 py-3 rounded-lg text-lg hover:bg-gray-700 transition-colors duration-300 w-full">
              {"S'inscrire"}
            </button>
          </Link>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center justify-between text-center border border-gray-100">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Espace Administrateur</h2>
          <p className="text-gray-700 mb-6">Accès au tableau de bord administrateur</p>
          <Link href="/auth/login" className="w-full">
            <button className="border border-gray-300 text-gray-800 px-8 py-3 rounded-lg text-lg hover:bg-gray-100 transition-colors duration-300 w-full">
              Se connecter
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
