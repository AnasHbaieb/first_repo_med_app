'use client';

import React, { useState, useEffect } from 'react';
import { Patient } from '../types';

interface PatientFormProps {
  patient?: Patient; // Optional, for editing existing patient
  onSubmit: (patient: Patient) => void;
  onCancel: () => void;
}

const EMPTY_PATIENT: Patient = {
  id: '',
  fullName: '',
  studentPhoneNumber: undefined,
  parentPhoneNumber: undefined,
  academicYear: '',
  section: undefined,
  institutionName: '',
};

function normalizePatient(data?: Partial<Patient>): Patient {
  return {
    ...EMPTY_PATIENT,
    ...data,
    fullName: data?.fullName ?? '',
    academicYear: data?.academicYear ?? '',
    institutionName: data?.institutionName ?? '',
  };
}

export default function PatientForm({
  patient: initialPatient,
  onSubmit,
}: PatientFormProps) {
  const [patient, setPatient] = useState<Patient>(() => normalizePatient(initialPatient));

  useEffect(() => {
    if (initialPatient) {
      setPatient(normalizePatient(initialPatient));
    }
  }, [initialPatient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPatient((prevPatient) => ({
      ...prevPatient,
      [name]:
        name === 'parentPhoneNumber' || name === 'studentPhoneNumber'
          ? value === ''
            ? undefined
            : Number(value)
          : name === 'section' && value === ''
          ? undefined
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(patient);
  };

  return (
    <div className="p-6 bg-white rounded-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{"Informations de l'étudiant"}</h2>
      <p className="text-gray-600 mb-6">{"Veuillez remplir tous les champs obligatoires pour compléter l'inscription."}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">{"Nom et Prénom d'éleve *"}</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={patient.fullName ?? ''}
              onChange={handleChange}
              required
              placeholder="Entrez le nom et le prénom"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="studentPhoneNumber" className="block text-sm font-medium text-gray-700">{"Numéro de téléphone de l'élève *"}</label>
            <input
              type="number"
              id="studentPhoneNumber"
              name="studentPhoneNumber"
              value={patient.studentPhoneNumber === undefined ? '' : patient.studentPhoneNumber}
              onChange={handleChange}
              required
              placeholder="+216 XX XXX XXX"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="parentPhoneNumber" className="block text-sm font-medium text-gray-700">Numéro de téléphone du parent *</label>
            <input
              type="number"
              id="parentPhoneNumber"
              name="parentPhoneNumber"
              value={patient.parentPhoneNumber === undefined ? '' : patient.parentPhoneNumber}
              onChange={handleChange}
              required
              placeholder="+216 XX XXX XXX"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700">Année Scolaire *</label>
            <select
              id="academicYear"
              name="academicYear"
              value={patient.academicYear ?? ''}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">{"Sélectionnez l'année scolaire"}</option>
              <option value="9ere">9ème Année</option>
              <option value="1ere">1ère Année</option>
              <option value="2eme">2ème Année</option>
              <option value="3eme">3ème Année</option>
              <option value="4eme">4ème Année</option>
            </select>
          </div>
          {(patient.academicYear === '2eme' || patient.academicYear === '3eme' || patient.academicYear === '4eme') && (
            <div>
              <label htmlFor="section" className="block text-sm font-medium text-gray-700">Section *</label>
              <select
                id="section"
                name="section"
                value={patient.section || ''}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Sélectionnez la section</option>
                {patient.academicYear === '2eme' && (
                  <>
                    <option value="informatique">Informatique</option>
                    <option value="sciences">Sciences</option>
                  </>
                )}
                {(patient.academicYear === '3eme' || patient.academicYear === '4eme') && (
                  <>
                    <option value="informatique">Informatique</option>
                    <option value="technique">Technique</option>
                    <option value="sciences_experimentales">Sciences expérimentales</option>
                    <option value="math">Math</option>
                    <option value="autre">Autre</option>
                  </>
                )}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="institutionName" className="block text-sm font-medium text-gray-700">{"Nom de l'établissement *"}</label>
            <input
              type="text"
              id="institutionName"
              name="institutionName"
              value={patient.institutionName ?? ''}
              onChange={handleChange}
              required
              placeholder={"Entrez le nom de l'établissement"}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors duration-300"
        >
          {"Confirmer l'inscription"}
        </button>
      </form>
    </div>
  );
}
