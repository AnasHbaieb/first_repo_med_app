'use client';

import React, { useState } from 'react';

interface StudentAttendance {
  id: string;
  name: string;
  email: string;
  group: string;
  sessions: {
    date: string;
    attended: boolean;
  }[];
  monthsPaid: number;
  totalSessions: number;
  paymentStatus: 'paid' | 'pending' | 'overdue';
}

export default function AttendanceTracking() {
  const [selectedGroup, setSelectedGroup] = useState('group1');
  const [students, setStudents] = useState<StudentAttendance[]>([
    {
      id: '1',
      name: 'Jean Dupont',
      email: 'jean@example.com',
      group: 'group1',
      sessions: [
        { date: '2024-01-08', attended: true },
        { date: '2024-01-15', attended: true },
        { date: '2024-01-22', attended: false },
        { date: '2024-01-29', attended: true },
        { date: '2024-02-05', attended: true },
        { date: '2024-02-12', attended: true },
        { date: '2024-02-19', attended: true },
        { date: '2024-02-26', attended: true },
      ],
      monthsPaid: 1,
      totalSessions: 8,
      paymentStatus: 'paid',
    },
    {
      id: '2',
      name: 'Marie Martin',
      email: 'marie@example.com',
      group: 'group1',
      sessions: [
        { date: '2024-01-08', attended: true },
        { date: '2024-01-15', attended: true },
        { date: '2024-01-22', attended: true },
        { date: '2024-01-29', attended: true },
        { date: '2024-02-05', attended: true },
        { date: '2024-02-12', attended: true },
        { date: '2024-02-19', attended: false },
        { date: '2024-02-26', attended: false },
      ],
      monthsPaid: 1,
      totalSessions: 8,
      paymentStatus: 'paid',
    },
  ]);

  const groupStudents = students.filter((s) => s.group === selectedGroup);

  const toggleAttendance = (studentId: string, sessionIndex: number) => {
    setStudents(
      students.map((student) => {
        if (student.id === studentId) {
          const newSessions = [...student.sessions];
          newSessions[sessionIndex] = {
            ...newSessions[sessionIndex],
            attended: !newSessions[sessionIndex].attended,
          };
          return { ...student, sessions: newSessions };
        }
        return student;
      })
    );
  };

  const togglePaymentStatus = (studentId: string) => {
    setStudents(
      students.map((student) => {
        if (student.id === studentId) {
          const statuses: ('paid' | 'pending' | 'overdue')[] = ['paid', 'pending', 'overdue'];
          const currentIndex = statuses.indexOf(student.paymentStatus);
          const nextStatus = statuses[(currentIndex + 1) % statuses.length];
          return { ...student, paymentStatus: nextStatus };
        }
        return student;
      })
    );
  };

  const getPaymentBadge = (status: string) => {
    const styles = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
    };
    const labels = {
      paid: 'Payé',
      pending: 'En attente',
      overdue: 'En retard',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Suivi des Présences et Paiements</h2>
        <p className="text-gray-600 mt-2">
          Enregistrez les présences et gérez les paiements (8 sessions = 1 mois)
        </p>
      </div>

      {/* Group Filter */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Sélectionnez un groupe
        </label>
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="w-full md:w-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="group1">Groupe A - Mathématiques</option>
          <option value="group2">Groupe B - Sciences</option>
          <option value="group3">Groupe C - Langues</option>
        </select>
      </div>

      {/* Legend */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Légende</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-700">Présent</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span className="text-gray-700">Absent</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-gray-700">8 séances = 1 mois complété</span>
          </div>
        </div>
      </div>

      {/* Students Grid */}
      <div className="space-y-6">
        {groupStudents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-600 text-lg">Aucun étudiant assigné à ce groupe</p>
          </div>
        ) : (
          groupStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Student Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{student.name}</h3>
                  <p className="text-blue-100">{student.email}</p>
                </div>
                <button
                  onClick={() => togglePaymentStatus(student.id)}
                  className="hover:opacity-90 transition-opacity"
                >
                  {getPaymentBadge(student.paymentStatus)}
                </button>
              </div>

              {/* Student Body */}
              <div className="p-6">
                {/* Sessions Grid */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Présences des 8 dernières séances</h4>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                    {student.sessions.map((session, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleAttendance(student.id, idx)}
                        className={`p-3 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                          session.attended
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                        title={session.date}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    Total: {student.sessions.filter((s) => s.attended).length} / {student.sessions.length} séances
                  </p>
                </div>

                {/* Payment Status */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Mois payés</p>
                      <p className="text-2xl font-bold text-blue-600">{student.monthsPaid}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Total séances</p>
                      <p className="text-2xl font-bold text-purple-600">{student.totalSessions}</p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Statut paiement</p>
                      <p className="text-lg font-bold text-indigo-600 capitalize">
                        {student.paymentStatus === 'paid'
                          ? '✓ Payé'
                          : student.paymentStatus === 'pending'
                          ? '⏳ En attente'
                          : '⚠️ En retard'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
