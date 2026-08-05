'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

interface Student {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

interface Group {
  id: string;
  name: string;
}

export default function StudentManagement() {
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignedStudents, setAssignedStudents] = useState<{ [key: string]: Student[] }>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch all students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, full_name, email, created_at');

      if (studentsError) throw studentsError;

      // Fetch all groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('id, name');

      if (groupsError) throw groupsError;

      // Fetch assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('group_students')
        .select('group_id, student_id');

      if (assignmentsError) throw assignmentsError;

      setGroups(groupsData || []);

      // Organize assignments
      const assignmentsMap: { [key: string]: Student[] } = {};
      const assignedIds = new Set<string>();

      (groupsData || []).forEach((g: Group) => {
        assignmentsMap[g.id] = [];
      });

      if (assignmentsData && studentsData) {
        assignmentsData.forEach((assignment: any) => {
          const student = studentsData.find(s => s.id === assignment.student_id);
          if (student) {
            if (!assignmentsMap[assignment.group_id]) {
              assignmentsMap[assignment.group_id] = [];
            }
            assignmentsMap[assignment.group_id].push(student);
            assignedIds.add(student.id);
          }
        });
      }

      setAssignedStudents(assignmentsMap);

      // Available students are those not assigned to ANY group
      // Wait, can a student be in multiple groups? The requirement says yes,
      // but the UI implies available students are filtered out if assigned.
      // Let's filter out students that are already assigned to the SELECTED group,
      // but actually, we should just show all students and maybe filter out those in the selected group later.
      // For now, let's keep the UI paradigm where available students are those not in ANY group
      // or those not in the CURRENTLY selected group. 
      // Let's make it those not assigned to ANY group as the previous code did.
      const unassigned = (studentsData || []).filter(s => !assignedIds.has(s.id));
      setAvailableStudents(unassigned);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Erreur lors du chargement des données');
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

  const handleAssignToGroup = async () => {
    if (!selectedGroup || selectedStudents.length === 0) {
      setError('Veuillez sélectionner un groupe et au moins un étudiant');
      return;
    }

    try {
      const inserts = selectedStudents.map(studentId => ({
        group_id: selectedGroup,
        student_id: studentId
      }));

      const { error } = await supabase
        .from('group_students')
        .insert(inserts);

      if (error) throw error;

      // Update UI state
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
    } catch (err: any) {
      console.error('Error assigning to group:', err);
      setError(err.message || "Erreur lors de l'assignation");
    }
  };

  const handleRemoveFromGroup = async (groupId: string, studentId: string) => {
    if (!confirm('Voulez-vous vraiment retirer cet étudiant du groupe ?')) return;
    
    try {
      const { error } = await supabase
        .from('group_students')
        .delete()
        .match({ group_id: groupId, student_id: studentId });

      if (error) throw error;

      const student = assignedStudents[groupId].find((s) => s.id === studentId);
      if (student) {
        setAssignedStudents((prev) => ({
          ...prev,
          [groupId]: prev[groupId].filter((s) => s.id !== studentId),
        }));
        setAvailableStudents((prev) => [...prev, student]);
      }
    } catch (err: any) {
      console.error('Error removing from group:', err);
      alert('Erreur lors du retrait: ' + err.message);
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
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Student Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Sélectionnez les étudiants non assignés *
              </label>
              <span className="text-sm text-gray-600">
                {selectedStudents.length} sélectionné(s)
              </span>
            </div>

            {availableStudents.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-lg">
                <p className="text-gray-600">Tous les étudiants ont été assignés à des groupes ou aucun étudiant n&apos;est enregistré.</p>
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
                        {student.full_name}
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
                  {groups.find(g => g.id === groupId)?.name || 'Groupe Inconnu'}
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
                        {student.full_name}
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
