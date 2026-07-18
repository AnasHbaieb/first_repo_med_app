import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import patientRoutes from './routes/patientRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import medicalRecordRoutes from './routes/medicalRecordRoutes';
import authRoutes from './routes/authRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config(); // Add this line to load environment variables

const app = express();
const PORT = process.env.PORT || 3001; // Define PORT here

// Security Middleware
app.use(cors());
app.use(helmet());

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
