const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 5000;

// Path to the JSON data file
const filePath = path.join(__dirname, '/data/doctors.json');

// Middleware
app.use(cors());
app.use(express.json());

// Helper to read data
const readData = () => {
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
};

// Helper to write data
const writeData = (data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// --- Doctor Routes ---
const doctorRouter = express.Router();

// GET all doctors
doctorRouter.get("/", (req, res) => {
  const doctors = readData();
  res.json(doctors);
});

// GET doctor by ID
doctorRouter.get("/:id", (req, res) => {
  const doctors = readData();
  const doctor = doctors.find((d) => d.id == req.params.id);
  if (!doctor) return res.status(404).json({ message: "Doctor not found" });
  res.json(doctor);
});

// CREATE new doctor
doctorRouter.post("/", (req, res) => {
  const { name, specialization, contact } = req.body;
  if (!name || !specialization || !contact)
    return res.status(400).json({ message: "All fields are required" });

  const doctors = readData();
  const newDoctor = {
    id: Date.now(),
    name,
    specialization,
    contact,
  };
  doctors.push(newDoctor);
  writeData(doctors);
  res.status(201).json(newDoctor);
});

// UPDATE doctor
doctorRouter.put("/:id", (req, res) => {
  const doctors = readData();
  const index = doctors.findIndex((d) => d.id == req.params.id);
  if (index === -1) return res.status(404).json({ message: "Doctor not found" });

  const updatedDoctor = { ...doctors[index], ...req.body };
  doctors[index] = updatedDoctor;
  writeData(doctors);
  res.json(updatedDoctor);
});

// DELETE doctor
doctorRouter.delete("/:id", (req, res) => {
  let doctors = readData();
  const doctorExists = doctors.find((d) => d.id == req.params.id);
  if (!doctorExists) return res.status(404).json({ message: "Doctor not found" });

  doctors = doctors.filter((d) => d.id != req.params.id);
  writeData(doctors);
  res.json({ message: "Doctor deleted successfully" });
});

// Use doctor routes
app.use("/doctors", doctorRouter);

// Root Route
app.get("/", (req, res) => {
  res.send("Doctor Booking Backend is running");
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
