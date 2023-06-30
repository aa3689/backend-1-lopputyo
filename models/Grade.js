const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  coursecode: {
    type: String,
    required: true,
    max: 10,
  },
  grade: { type: Number, required: false, min: 0, max: 5 },
});

module.exports = mongoose.model('Grade', GradeSchema);
