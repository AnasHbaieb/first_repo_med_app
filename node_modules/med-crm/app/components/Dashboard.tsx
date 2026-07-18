import React from 'react';

export default function Dashboard() {
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tableau de Bord Médical</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Patient Statistics Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Statistiques des Patients</h2>
          <p className="text-gray-600">Nombre total de patients : 150</p>
          <p className="text-gray-600">Nouveaux patients ce mois-ci : 10</p>
        </div>

        {/* Upcoming Appointments Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Rendez-vous à venir</h2>
          <ul className="list-disc list-inside text-gray-600">
            <li>Patient : Ahmed - 10:00 AM</li>
            <li>Patient : Fatima - 11:30 AM</li>
            <li>Patient : Khalid - 2:00 PM</li>
          </ul>
        </div>

        {/* Recent Medical Records Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Dossiers Médicaux Récents</h2>
          <ul className="list-disc list-inside text-gray-600">
            <li>{"Patient : Laila - Rapport d'examen"}</li>
            <li>Patient : Youssef - Prescription</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
