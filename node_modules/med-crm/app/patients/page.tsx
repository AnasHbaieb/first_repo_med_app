'use client';

import React from 'react';
import Link from 'next/link';
import PatientForm from '../components/PatientForm';
import { Patient } from '../types';

export default function InscriptionEtudiantPage() {
  const handleSubmit = (patientData: Patient) => {
    console.log("Données d'inscription de l'étudiant:", patientData);
    // هنا يمكن إضافة منطق لإرسال البيانات إلى الواجهة الخلفية
    alert("L'étudiant a été inscrit avec succès!");
  };

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
          <h1 className="text-3xl font-bold text-gray-800">Inscription Étudiant</h1>
        </div>
        <p className="text-gray-600 mb-8">{"Formulaire d'inscription pour nouveaux étudiants"}</p>

        <PatientForm onSubmit={handleSubmit} onCancel={() => {}} />
      </div>
    </div>
  );
}
