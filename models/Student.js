const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  studentcode: {
    type: String,
    unique: true,
    required: true,
    match: /^[a-z]{1}[0-9]{4}$/,
  },
  name: { type: String, required: true, max: 80 },
  email: {
    type: String,
    required: true,
    max: 100,
    match: /^[^@]+@[^@]+\.[^@]+$/,
  },
  studypoints: { type: Number, required: false, min: 0, max: 300 },
});

const Student = mongoose.model('Student', StudentSchema);

module.exports = Student;
