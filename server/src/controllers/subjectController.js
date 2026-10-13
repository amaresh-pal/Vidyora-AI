const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');

exports.getSubjects = async (req, res) => {
  try {
    const { classLevel } = req.query;
    const filter = {};
    if (classLevel) {
      filter.classLevels = classLevel;
    }
    const subjects = await Subject.find(filter).sort({ name: 1 });
    res.json({ subjects });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subjects', error: error.message });
  }
};

exports.getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json({ subject });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subject', error: error.message });
  }
};

exports.getChaptersBySubject = async (req, res) => {
  try {
    const { classLevel } = req.query;
    const filter = { subject: req.params.id };
    if (classLevel) filter.classLevel = classLevel;

    const chapters = await Chapter.find(filter).sort({ order: 1 });
    res.json({ chapters });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chapters', error: error.message });
  }
};
