const Goal = require('../models/Goal');
const Meeting = require('../models/Meeting');

const CATEGORY_WEIGHTS = {
  Academic: 1,
  Technical: 1,
  Career: 1,
  Communication: 1,
  'Personal Development': 1,
  Project: 1,
  Internship: 1,
};

const computeStudentProgress = async (studentId, mentorId = null) => {
  const goals = await Goal.find({ student: studentId });
  const dimensions = {};
  let overall = 0;

  if (goals.length) {
    const buckets = Object.fromEntries(Object.keys(CATEGORY_WEIGHTS).map((k) => [k, 0]));
    const present = [];
    goals.forEach((g) => {
      if (Object.prototype.hasOwnProperty.call(buckets, g.category)) {
        if (g.status === 'Completed') buckets[g.category] = 100;
        else buckets[g.category] = Math.max(buckets[g.category], g.progress);
        if (!present.includes(g.category)) present.push(g.category);
      }
    });
    Object.assign(dimensions, buckets);

    const totalMeetings = await Meeting.countDocuments({ student: studentId, status: { $in: ['completed', 'accepted', 'pending', 'cancelled', 'rejected', 'rescheduled'] } });
    const attendedMeetings = await Meeting.countDocuments({ student: studentId, status: 'completed' });
    const attendanceScore = totalMeetings ? Math.round((attendedMeetings / totalMeetings) * 100) : 60;
    dimensions.MeetingAttendance = attendanceScore;

    const values = present.map((k) => buckets[k]);
    overall = values.length
      ? Math.round((values.reduce((a, b) => a + b, 0) + attendanceScore) / (values.length + 1))
      : Math.round(attendanceScore);
    return { overall, dimensions };
  }

  return { overall: 60, dimensions };
};

module.exports = { computeStudentProgress };