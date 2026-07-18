'use client';

import React, { useState, useEffect } from 'react';
import { MedicalRecord } from '../types';

interface MedicalRecordFormProps {
  record?: MedicalRecord; // Optional, for editing existing record
  onSubmit: (record: MedicalRecord) => void;
  onCancel: () => void;
}

export default function MedicalRecordForm({
  record: initialRecord,
  onSubmit,
  onCancel,
}: MedicalRecordFormProps) {
  const [record, setRecord] = useState<MedicalRecord>(
    initialRecord || {
      id: '',
      patientId: '',
      date: '',
      doctor: '',
      diagnosis: '',
      treatment: '',
    }
  );

  useEffect(() => {
    if (initialRecord) {
      setRecord(initialRecord);
    }
  }, [initialRecord]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRecord((prevRecord) => ({
      ...prevRecord,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(record);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {initialRecord ? 'Modifier le dossier médical' : 'Ajouter un nouveau dossier médical'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">ID Patient</label>
            <input
              type="text"
              id="patientId"
              name="patientId"
              value={record.patientId}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={record.date}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="doctor" className="block text-sm font-medium text-gray-700">Médecin</label>
            <input
              type="text"
              id="doctor"
              name="doctor"
              value={record.doctor}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700">Diagnostic</label>
            <input
              type="text"
              id="diagnosis"
              name="diagnosis"
              value={record.diagnosis}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="treatment" className="block text-sm font-medium text-gray-700">Traitement</label>
            <input
              type="text"
              id="treatment"
              name="treatment"
              value={record.treatment}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {initialRecord ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
