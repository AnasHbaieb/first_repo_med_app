'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

interface StudentAttendance {
  id: string;
  name: string;
  email: string;
  group_id: string;
  sessions: {
    date: string;
    attended: boolean;
  }[];
  monthsPaid: number;
  totalSessions: number;
  paymentStatus: 'paid' | 'pending' | 'overdue';
}

interface Group {
  id: string;
  name: string;
}

export default function AttendanceTracking() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate 8 dates for the sessions (for demo purposes we use the last 8 days)
  const generateSessionDates = () => {
    const dates = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const SESSION_DATES = generateSessionDates();

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchStudentsAndAttendance(selectedGroup);
    } else {
      setStudents([]);
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    const { data } = await supabase.from('groups').select('id, name');
    if (data) {
      setGroups(data);
      if (data.length > 0) setSelectedGroup(data[0].id);
    }
    setLoading(false);
  };

  const fetchStudentsAndAttendance = async (groupId: string) => {
    setLoading(true);
    try {
      // Fetch students in this group and their payment status
      const { data: groupStudentsData, error: gsError } = await supabase
        .from('group_students')
        .select(`
          payment_status,
          student_id,
          students (id, full_name, email)
        `)
        .eq('group_id', groupId);

      if (gsError) throw gsError;

      // Fetch attendance for this group
      const { data: attendanceData, error: attError } = await supabase
        .from('attendance')
        .select('student_id, session_date, status')
        .eq('group_id', groupId)
        .in('session_date', SESSION_DATES);

      if (attError) throw attError;

      const formattedStudents: StudentAttendance[] = (groupStudentsData || []).map((gs: any) => {
        const studentInfo = gs.students;
        
        // Map attendance to our 8 fixed dates
        const sessions = SESSION_DATES.map(date => {
          const record = (attendanceData || []).find(
            (a: any) => a.student_id === studentInfo.id && a.session_date === date
          );
          return {
            date,
            attended: record ? record.status === 'present' : false,
          };
        });

        const totalAttended = sessions.filter(s => s.attended).length;

        return {
          id: studentInfo.id,
          name: studentInfo.full_name,
          email: studentInfo.email,
          group_id: groupId,
          sessions,
          monthsPaid: Math.floor(totalAttended / 8) || 0, // Mock calculation
          totalSessions: totalAttended,
          paymentStatus: gs.payment_status as any || 'pending',
        };
      });

      setStudents(formattedStudents);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = async (studentId: string, sessionIndex: number) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const session = student.sessions[sessionIndex];
    const newStatus = !session.attended ? 'present' : 'absent';

    // Optimistic UI update
    setStudents(students.map(s => {
      if (s.id === studentId) {
        const newSessions = [...s.sessions];
        newSessions[sessionIndex] = { ...session, attended: !session.attended };
        const total = newSessions.filter(x => x.attended).length;
        return { ...s, sessions: newSessions, totalSessions: total, monthsPaid: Math.floor(total / 8) };
      }
      return s;
    }));

    try {
      const { error } = await supabase
        .from('attendance')
        .upsert({
          group_id: selectedGroup,
          student_id: studentId,
          session_date: session.date,
          status: newStatus,
        }, { onConflict: 'group_id, student_id, session_date' });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating attendance:', error);
      // Revert on error (could implement full revert if needed)
    }
  };

  const togglePaymentStatus = async (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const statuses: ('paid' | 'pending' | 'overdue')[] = ['paid', 'pending', 'overdue'];
    const currentIndex = statuses.indexOf(student.paymentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    // Optimistic UI update
    setStudents(students.map(s => 
      s.id === studentId ? { ...s, paymentStatus: nextStatus } : s
    ));

    try {
      const { error } = await supabase
        .from('group_students')
        .update({ payment_status: nextStatus })
        .match({ group_id: selectedGroup, student_id: studentId });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
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

  if (loading && groups.length === 0) {
    return <div className="text-center py-12">Chargement...</div>;
  }

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
          {groups.length === 0 && <option value="">Aucun groupe disponible</option>}
          {groups.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
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
        {loading && selectedGroup ? (
          <div className="text-center py-12">Chargement des étudiants...</div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-600 text-lg">Aucun étudiant assigné à ce groupe</p>
          </div>
        ) : (
          students.map((student) => (
            <div key={student.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Student Header */}
              <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{student.name}</h3>
                  <p className="text-blue-100">{student.email}</p>
                </div>
                <button
                  onClick={() => togglePaymentStatus(student.id)}
                  className="hover:opacity-90 transition-opacity cursor-pointer"
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
                    Total: {student.totalSessions} / {student.sessions.length} séances
                  </p>
                </div>

                {/* Payment Status */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Mois payés (est.)</p>
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
