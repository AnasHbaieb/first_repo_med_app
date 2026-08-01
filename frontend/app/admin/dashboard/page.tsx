'use client';

import React from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const stats = [
    { label: 'Groupes', value: '0', icon: '👥', href: '/admin/groups' },
    { label: 'Étudiants', value: '0', icon: '🎓', href: '/admin/students' },
    { label: 'Présences', value: '0', icon: '📋', href: '/admin/attendance' },
    { label: 'Paiements', value: '0', icon: '💰', href: '/admin/attendance' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Bienvenue dans le tableau de bord</h2>
        <p className="text-blue-100">
          Gérez efficacement vos groupes, étudiants et suivez les présences et paiements.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-700 font-medium">{stat.label}</h3>
              <span className="text-3xl">{stat.icon}</span>
            </div>
            <p className="text-4xl font-bold text-blue-600">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-2">Cliquez pour gérer</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/groups"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 hover:shadow-lg transition-all text-center font-semibold"
          >
            <div className="text-3xl mb-2">👥</div>
            <div>Créer un groupe</div>
          </Link>
          <Link
            href="/admin/students"
            className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6 hover:shadow-lg transition-all text-center font-semibold"
          >
            <div className="text-3xl mb-2">🎓</div>
            <div>Ajouter un étudiant</div>
          </Link>
          <Link
            href="/admin/attendance"
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6 hover:shadow-lg transition-all text-center font-semibold"
          >
            <div className="text-3xl mb-2">📋</div>
            <div>Marquer les présences</div>
          </Link>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Fonctionnalités principales</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            <span className="text-2xl">📌</span>
            <div>
              <h4 className="font-semibold text-gray-900">Gestion des groupes</h4>
              <p className="text-gray-600 text-sm">Créez et gérez les groupes d&apos;études avec leurs horaires hebdomadaires</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            <span className="text-2xl">🎓</span>
            <div>
              <h4 className="font-semibold text-gray-900">Gestion des étudiants</h4>
              <p className="text-gray-600 text-sm">Assignez les étudiants aux groupes et gérez leurs inscriptions</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            <span className="text-2xl">📊</span>
            <div>
              <h4 className="font-semibold text-gray-900">Suivi des présences</h4>
              <p className="text-gray-600 text-sm">Enregistrez les présences et gérez les paiements (8 sessions = 1 mois)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
