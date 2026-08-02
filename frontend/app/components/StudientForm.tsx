'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';

export interface FormData {
  fullName: string;
  studentNumber: string;
  parentNumber: string;
  class: string;
  section: string;
  instituteName: string;
}

interface PatientFormProps {
  patient?: Partial<FormData>;
  onSubmit: (patient: FormData) => void;
  onCancel?: () => void;
}

const EMPTY_FORM: FormData = {
  fullName: '',
  studentNumber: '',
  parentNumber: '',
  class: '',
  section: '',
  instituteName: '',
};

const CLASS_OPTIONS = ['9éme', '1ér', '2éme', '3éme', 'Bac'];

const SECTION_BY_CLASS: Record<string, string[]> = {
  '2éme': ['Technologie', 'Sciences', 'Autre'],
  '3éme': ['Mathématiques', 'Sciences Expérimentales', 'Informatique', 'Technique', 'Autre'],
  Bac: ['Mathématiques', 'Sciences Expérimentales', 'Informatique', 'Technique', 'Autre'],
};

function normalizeFormData(data?: Partial<FormData>): FormData {
  return {
    ...EMPTY_FORM,
    ...data,
    fullName: data?.fullName?.trim() ?? '',
    studentNumber: data?.studentNumber?.trim() ?? '',
    parentNumber: data?.parentNumber?.trim() ?? '',
    class: data?.class ?? '',
    section: data?.section ?? '',
    instituteName: data?.instituteName?.trim() ?? '',
  };
}

export default function PatientForm({
  patient: initialPatient,
  onSubmit,
  onCancel,
}: PatientFormProps) {
  const [formData, setFormData] = useState<FormData>(() => normalizeFormData(initialPatient));
  const [error, setError] = useState('');

  const selectedClass = formData.class;
  const showSection = selectedClass === '2éme' || selectedClass === '3éme' || selectedClass === 'Bac';
  const sectionOptions = selectedClass ? SECTION_BY_CLASS[selectedClass] ?? [] : [];

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      if (name === 'class' && value !== '2éme' && value !== '3éme' && value !== 'Bac') {
        next.section = '';
      }

      if (name === 'class' && value === '2éme') {
        const validSections = SECTION_BY_CLASS['2éme'];
        next.section = validSections.includes(prev.section) ? prev.section : '';
      }

      if ((name === 'class' && value === '3éme') || (name === 'class' && value === 'Bac')) {
        const validSections = SECTION_BY_CLASS[value];
        next.section = validSections.includes(prev.section) ? prev.section : '';
      }

      return next;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextData = normalizeFormData(formData);

    if (!nextData.fullName || !nextData.studentNumber || !nextData.parentNumber || !nextData.class || !nextData.instituteName) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (showSection && !nextData.section) {
      setError('Veuillez sélectionner une section pour cette classe.');
      return;
    }

    setError('');
    onSubmit(nextData);
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <h2 className="mb-2 text-xl font-semibold text-gray-900">Informations de l&apos;étudiant</h2>
      <p className="mb-6 text-sm text-gray-600">Veuillez remplir tous les champs obligatoires.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-gray-700">
              Nom complet *
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Entrez le nom complet"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label htmlFor="studentNumber" className="mb-1 block text-sm font-medium text-gray-700">
              Numéro de l&apos;étudiant *
            </label>
            <input
              id="studentNumber"
              name="studentNumber"
              type="text"
              value={formData.studentNumber}
              onChange={handleChange}
              required
              placeholder="Entrez le numéro de l'étudiant"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label htmlFor="parentNumber" className="mb-1 block text-sm font-medium text-gray-700">
              Numéro du parent *
            </label>
            <input
              id="parentNumber"
              name="parentNumber"
              type="text"
              value={formData.parentNumber}
              onChange={handleChange}
              required
              placeholder="Entrez le numéro du parent"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label htmlFor="class" className="mb-1 block text-sm font-medium text-gray-700">
              Classe *
            </label>
            <select
              id="class"
              name="class"
              value={formData.class}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Sélectionnez la classe</option>
              {CLASS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {showSection && (
            <div>
              <label htmlFor="section" className="mb-1 block text-sm font-medium text-gray-700">
                Section *
              </label>
              <select
                id="section"
                name="section"
                value={formData.section}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Sélectionnez une section</option>
                {sectionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="md:col-span-2">
            <label htmlFor="instituteName" className="mb-1 block text-sm font-medium text-gray-700">
              Nom de l&apos;institut *
            </label>
            <input
              id="instituteName"
              name="instituteName"
              type="text"
              value={formData.instituteName}
              onChange={handleChange}
              required
              placeholder="Entrez le nom de l'institut"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
          )}

          <button
            type="submit"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
          >
            Confirmer l&apos;inscription
          </button>
        </div>
      </form>
    </div>
  );
}