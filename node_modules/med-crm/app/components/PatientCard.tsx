'use client';

import React from 'react';
import { Patient } from '../types';

interface PatientCardProps {
  patient: Patient;
  onViewDetails: (patientId: string) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patientId: string) => void;
}

export default function PatientCard({
  patient,
  onViewDetails,
  onEdit,
  onDelete,
}: PatientCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center mb-4">
      <div>
        <p className="text-lg font-medium text-gray-900">{patient.fullName}</p>
        <p className="text-sm text-gray-500">Année scolaire : {patient.academicYear}</p>
        <p className="text-sm text-gray-500">Contact : {patient.studentPhoneNumber}</p>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onViewDetails(patient.id)}
          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
        >
          Voir
        </button>
        <button
          onClick={() => onEdit(patient)}
          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
        >
          Modifier
        </button>
        <button
          onClick={() => onDelete(patient.id)}
          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
