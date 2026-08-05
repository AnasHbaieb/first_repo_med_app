const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Route for patients (called by frontend)
app.get('/patients', (req, res) => {
    res.json({ success: true, data: [] }); 
});

// The frontend is looking for the API on port 4000
const PORT = 4000; 

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
