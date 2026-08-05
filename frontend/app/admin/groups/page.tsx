'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

interface Group {
  id: string;
  name: string;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  studentCount: number;
  createdAt: string;
}

const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function GroupManagement() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    schedule: [{ day: 'Lundi', startTime: '09:00', endTime: '11:00' }],
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          id,
          name,
          schedule,
          created_at,
          group_students (count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedGroups: Group[] = data.map((g: any) => ({
          id: g.id,
          name: g.name,
          schedule: g.schedule || [],
          studentCount: g.group_students?.[0]?.count || 0,
          createdAt: g.created_at,
        }));
        setGroups(formattedGroups);
      }
    } catch (err: any) {
      console.error('Error fetching groups:', err);
      setError(err.message || 'Erreur lors du chargement des groupes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = () => {
    setFormData({
      ...formData,
      schedule: [...formData.schedule, { day: 'Lundi', startTime: '09:00', endTime: '11:00' }],
    });
  };

  const handleRemoveSchedule = (index: number) => {
    setFormData({
      ...formData,
      schedule: formData.schedule.filter((_, i) => i !== index),
    });
  };

  const handleScheduleChange = (index: number, field: string, value: string) => {
    const newSchedule = [...formData.schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setFormData({ ...formData, schedule: newSchedule });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const { data, error } = await supabase
        .from('groups')
        .insert([{
          name: formData.name,
          schedule: formData.schedule,
        }])
        .select(`
          id,
          name,
          schedule,
          created_at,
          group_students (count)
        `)
        .single();

      if (error) throw error;

      if (data) {
        const newGroup: Group = {
          id: data.id,
          name: data.name,
          schedule: data.schedule || [],
          studentCount: data.group_students?.[0]?.count || 0,
          createdAt: data.created_at,
        };
        setGroups([newGroup, ...groups]);
      }

      setFormData({
        name: '',
        schedule: [{ day: 'Lundi', startTime: '09:00', endTime: '11:00' }],
      });
      setShowForm(false);
    } catch (err: any) {
      console.error('Error creating group:', err);
      alert('Erreur: ' + err.message);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) return;
    
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGroups(groups.filter((group) => group.id !== id));
    } catch (err: any) {
      console.error('Error deleting group:', err);
      alert('Erreur lors de la suppression: ' + err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Gestion des Groupes</h2>
          <p className="text-gray-600 mt-2">Créez et gérez les groupes d&apos;études</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition-all"
        >
          {showForm ? 'Annuler' : '+ Nouveau groupe'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Créer un nouveau groupe</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du groupe *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Groupe A - Mathématiques"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Schedule */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Horaire hebdomadaire *
                </label>
                <button
                  type="button"
                  onClick={handleAddSchedule}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Ajouter une séance
                </button>
              </div>

              <div className="space-y-4">
                {formData.schedule.map((slot, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Séance {index + 1}</span>
                      {formData.schedule.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSchedule(index)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <select
                        value={slot.day}
                        onChange={(e) => handleScheduleChange(index, 'day', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {DAYS_OF_WEEK.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all"
            >
              Créer le groupe
            </button>
          </form>
        </div>
      )}

      {/* Groups List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Chargement des groupes...</div>
        ) : groups.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">👥</div>
            <p className="text-gray-600 text-lg mb-4">Aucun groupe créé yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Créer votre premier groupe
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nom du groupe</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Horaire</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Étudiants</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {groups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{group.name}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="space-y-1">
                        {group.schedule.map((slot, idx) => (
                          <div key={idx} className="text-sm">
                            {slot.day}: {slot.startTime} - {slot.endTime}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {group.studentCount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
