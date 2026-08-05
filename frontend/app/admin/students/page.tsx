'use client';

import React, { useState, useEffect } from 'react';
import { get } from '@/app/lib/api';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  group_id?: string;
  school_year?: string;
  enrolled_at?: string;
  created_at?: string;
}

interface PatientResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at?: string;
}

export default function StudentManagement() {
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignedStudents, setAssignedStudents] = useState<{ [key: string]: Student[] }>({});

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await get<PatientResponse[]>('/patients');
      if (response.success && Array.isArray(response.data)) {
        const students: Student[] = response.data.map((patient: PatientResponse) => ({
          id: patient.id,
          first_name: patient.first_name,
          last_name: patient.last_name,
          email: patient.email,
          school_year: 'Non assigné',
          enrolled_at: patient.created_at ?? new Date().toISOString(),
          created_at: patient.created_at ?? new Date().toISOString(),
        }));
        setAvailableStudents(students);
      }
    } catch (err: any) {
      if (err instanceof TypeError || err.message === 'Failed to fetch') {
        setError("Impossible de se connecter au serveur. Vérifiez que l'API est en cours d'exécution sur le port 4000.");
      } else {
        setError('Erreur lors du chargement des étudiants');
      }
      console.error('[v0]', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAssignToGroup = () => {
    if (!selectedGroup || selectedStudents.length === 0) {
      setError('Veuillez sélectionner un groupe et au moins un étudiant');
      return;
    }

    const studentsToAssign = availableStudents.filter((s) =>
      selectedStudents.includes(s.id)
    );

    setAssignedStudents((prev) => ({
      ...prev,
      [selectedGroup]: [
        ...(prev[selectedGroup] || []),
        ...studentsToAssign,
      ],
    }));

    setAvailableStudents((prev) =>
      prev.filter((s) => !selectedStudents.includes(s.id))
    );

    setSelectedStudents([]);
    setSelectedGroup('');
    setError('');
  };

  const handleRemoveFromGroup = (groupId: string, studentId: string) => {
    const student = assignedStudents[groupId].find((s) => s.id === studentId);
    if (student) {
      setAssignedStudents((prev) => ({
        ...prev,
        [groupId]: prev[groupId].filter((s) => s.id !== studentId),
      }));
      setAvailableStudents((prev) => [...prev, student]);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement des étudiants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Gestion des Étudiants</h2>
        <p className="text-gray-600 mt-2">
          Assignez les étudiants aux groupes d&apos;études
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Assignment Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Assigner des étudiants à un groupe</h3>

        <div className="space-y-6">
          {/* Group Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionnez un groupe *
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Choisir un groupe --</option>
              <option value="group1">Groupe A - Mathématiques</option>
              <option value="group2">Groupe B - Sciences</option>
              <option value="group3">Groupe C - Langues</option>
            </select>
          </div>

          {/* Student Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Sélectionnez les étudiants *
              </label>
              <span className="text-sm text-gray-600">
                {selectedStudents.length} sélectionné(s)
              </span>
            </div>

            {availableStudents.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-lg">
                <p className="text-gray-600">Tous les étudiants ont été assignés à des groupes</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {availableStudents.map((student) => (
                  <label
                    key={student.id}
                    className="flex items-center space-x-3 p-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleSelectStudent(student.id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {student.first_name} {student.last_name}
                      </p>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Assign Button */}
          <button
            onClick={handleAssignToGroup}
            disabled={!selectedGroup || selectedStudents.length === 0}
            className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Assigner au groupe
          </button>
        </div>
      </div>

      {/* Assigned Students by Group */}
      <div className="space-y-6">
        {Object.entries(assignedStudents).map(([groupId, students]) => (
          students.length > 0 && (
            <div key={groupId} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white p-6">
                <h3 className="text-xl font-bold">
                  {groupId === 'group1'
                    ? 'Groupe A - Mathématiques'
                    : groupId === 'group2'
                    ? 'Groupe B - Sciences'
                    : 'Groupe C - Langues'}
                </h3>
                <p className="text-blue-100 mt-1">{students.length} étudiant(s)</p>
              </div>

              <div className="divide-y">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {student.first_name} {student.last_name}
                      </p>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveFromGroup(groupId, student.id)}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      Retirer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
