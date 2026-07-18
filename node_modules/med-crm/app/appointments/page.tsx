'use client';

import React, { useState, useEffect } from 'react';
import { Appointment } from '../types';
import AppointmentForm from '../components/AppointmentForm';
import { get, post, put, remove } from '../lib/api';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setError(null);
    const response = await get<Appointment[]>('/attendance'); // point de terminaison pour les rendez-vous depuis le README de GitHub
    if (response.success && response.data) {
      setAppointments(response.data);
    } else {
      setError(response.error || 'Échec de la récupération des données de rendez-vous');
    }
  };

  const handleAddAppointment = () => {
    setCurrentAppointment(undefined);
    setShowForm(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setCurrentAppointment(appointment);
    setShowForm(true);
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    setError(null);
    const response = await remove(`/attendance/${appointmentId}`); // point de terminaison pour la suppression
    if (response.success) {
      setAppointments(appointments.filter(app => app.id !== appointmentId));
    } else {
      setError(response.error || 'Échec de la suppression du rendez-vous');
    }
  };

  const handleSubmitForm = async (appointmentData: Appointment) => {
    setError(null);
    if (appointmentData.id) {
      // modifier un rendez-vous existant
      const response = await put<Appointment>(`/attendance/${appointmentData.id}`, appointmentData); // point de terminaison pour la modification
      if (response.success && response.data) {
        setAppointments(appointments.map((app) => (app.id === response.data!.id ? response.data! : app)));
      } else {
        setError(response.error || 'Échec de la modification du rendez-vous');
      }
    } else {
      // ajouter un nouveau rendez-vous
      const response = await post<Appointment>('/attendance', appointmentData); // point de terminaison pour l'ajout
      if (response.success && response.data) {
        setAppointments([...appointments, response.data]);
      } else {
        setError(response.error || 'Échec de l\'ajout d\'un nouveau rendez-vous');
      }
    }
    setShowForm(false);
    setCurrentAppointment(undefined);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setCurrentAppointment(undefined);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestion des Rendez-vous</h1>
      {error && <p className="text-red-500 mb-4">Erreur : {error}</p>}
      <button
        onClick={handleAddAppointment}
        className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
      >
        Ajouter un nouveau rendez-vous
      </button>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Liste des Rendez-vous</h2>
        {appointments.length === 0 ? (
          <p className="text-gray-600">Aucun rendez-vous actuellement.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <li key={appointment.id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="text-lg font-medium text-gray-900">ID Patient: {appointment.patientId}</p>
                  <p className="text-sm text-gray-500">Date: {appointment.date}</p>
                  <p className="text-sm text-gray-500">Heure: {appointment.time}</p>
                  <p className="text-sm text-gray-500">Raison: {appointment.reason}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditAppointment(appointment)}
                    className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteAppointment(appointment.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {showForm && (
        <AppointmentForm
          appointment={currentAppointment}
          onSubmit={handleSubmitForm}
          onCancel={handleCancelForm}
        />
      )}
    </div>
  );
}
