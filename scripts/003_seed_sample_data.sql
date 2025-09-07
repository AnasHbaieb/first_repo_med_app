-- Insert sample students
INSERT INTO public.students (prenom, nom, telephone_1, telephone_2, annee_scolaire, filiere, nom_ecole, date_inscription) VALUES
('Ahmed', 'Benali', '0612345678', '0523456789', 'Terminale', 'Sciences Mathématiques', 'Lycée Mohammed V', '2024-09-01 10:00:00+00'),
('Fatima', 'Zahra', '0634567890', NULL, '1ère Bac', 'Sciences Expérimentales', 'Lycée Al Khawarizmi', '2024-09-02 14:30:00+00'),
('Youssef', 'Alami', '0645678901', '0556789012', '2ème Bac', 'Lettres Modernes', 'Lycée Ibn Sina', '2024-09-03 09:15:00+00'),
('Aicha', 'Mansouri', '0667890123', NULL, 'Terminale', 'Sciences Économiques', 'Lycée Hassan II', '2024-08-15 16:45:00+00'),
('Omar', 'Tazi', '0678901234', '0589012345', '1ère Bac', 'Sciences Mathématiques', 'Lycée Moulay Youssef', '2024-08-20 11:20:00+00');

-- Insert sample class sessions
INSERT INTO public.class_sessions (class_name, day_of_week, start_time, end_time) VALUES
('Mathématiques Terminale', 1, '14:00:00', '16:00:00'), -- Monday
('Physique 1ère Bac', 2, '16:00:00', '18:00:00'), -- Tuesday
('Français 2ème Bac', 3, '14:00:00', '16:00:00'), -- Wednesday
('Économie Terminale', 4, '16:00:00', '18:00:00'), -- Thursday
('Sciences 1ère Bac', 5, '14:00:00', '16:00:00'); -- Friday
