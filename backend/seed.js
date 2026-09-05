require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Department = require('./models/Department');
const Mentorship = require('./models/Mentorship');
const Meeting = require('./models/Meeting');
const Goal = require('./models/Goal');
const Task = require('./models/Task');
const Feedback = require('./models/Feedback');
const Message = require('./models/Message');
const Resource = require('./models/Resource');
const Announcement = require('./models/Announcement');
const Notification = require('./models/Notification');

const DAY = 24 * 60 * 60 * 1000;

const run = async () => {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany(), Department.deleteMany(), Mentorship.deleteMany(), Meeting.deleteMany(),
    Goal.deleteMany(), Task.deleteMany(), Feedback.deleteMany(), Message.deleteMany(),
    Resource.deleteMany(), Announcement.deleteMany(), Notification.deleteMany(),
  ]);

  console.log('Creating users...');
  const admin = await User.create({ name: 'System Admin', email: 'admin@mentorhub.com', password: 'admin123', role: 'admin', phone: '+91 90000 00001', bio: 'Platform administrator' });

  const mentors = await User.create([
    { name: 'Rahul Sharma', email: 'rahul@mentorhub.com', password: 'mentor123', role: 'mentor', department: 'Computer Science', designation: 'Senior Software Engineer', specialization: 'Full Stack Development, AI', experience: 8, bio: 'Passionate about mentoring budding developers.', profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80' },
    { name: 'Priya Verma', email: 'priya@mentorhub.com', password: 'mentor123', role: 'mentor', department: 'Electronics', designation: 'Project Manager', specialization: 'Product Management, Agile', experience: 10, bio: 'Helping students navigate their careers.', profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
    { name: 'Amit Patel', email: 'amit@mentorhub.com', password: 'mentor123', role: 'mentor', department: 'Mechanical', designation: 'Design Engineer', specialization: 'CAD, Product Design', experience: 6, bio: 'Mentor for mechanical design students.', profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  ]);

  const departments = await Department.create([
    { name: 'Computer Science', code: 'CS', courses: [{ name: 'B.Tech CSE', semesters: 8 }, { name: 'MCA', semesters: 4 }] },
    { name: 'Electronics', code: 'EC', courses: [{ name: 'B.Tech ECE', semesters: 8 }] },
    { name: 'Mechanical', code: 'ME', courses: [{ name: 'B.Tech ME', semesters: 8 }] },
    { name: 'Management', code: 'MBA', courses: [{ name: 'MBA', semesters: 4 }] },
  ]);

  const students = await User.create([
    { name: 'Narendra Kumar', email: 'narendra@mentorhub.com', password: 'student123', role: 'student', rollNumber: 'CS2101', course: 'B.Tech CSE', department: 'Computer Science', semester: '6', phone: '+91 90000 00010', academicPerformance: { cgpa: 8.2, percentage: 82 }, skills: ['JavaScript', 'Python', 'React'], interests: ['Web Dev', 'AI'], careerGoal: 'Become a Full Stack Developer', bio: 'Enthusiastic computer science student.', profilePhoto: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=400&q=80' },
    { name: 'Ritika Singh', email: 'ritika@mentorhub.com', password: 'student123', role: 'student', rollNumber: 'CS2102', course: 'B.Tech CSE', department: 'Computer Science', semester: '6', academicPerformance: { cgpa: 8.8, percentage: 88 }, skills: ['Java', 'Spring', 'SQL'], interests: ['Backend Dev'], careerGoal: 'Software Engineer at a product company', bio: 'Backend enthusiast.' },
    { name: 'Aman Gupta', email: 'aman@mentorhub.com', password: 'student123', role: 'student', rollNumber: 'EC2108', course: 'B.Tech ECE', department: 'Electronics', semester: '6', academicPerformance: { cgpa: 7.5, percentage: 75 }, skills: ['MATLAB', 'Circuit Design'], interests: ['VLSI'], careerGoal: 'VLSI Design Engineer', bio: 'Electronics student.' },
    { name: 'Sneha Reddy', email: 'sneha@mentorhub.com', password: 'student123', role: 'student', rollNumber: 'CS2103', course: 'B.Tech CSE', department: 'Computer Science', semester: '5', academicPerformance: { cgpa: 9.1, percentage: 91 }, skills: ['React', 'Node.js', 'UI/UX'], interests: ['Frontend', 'Design'], careerGoal: 'Frontend Architect', bio: 'Loves designing clean interfaces.' },
    { name: 'Vikram Joshi', email: 'vikram@mentorhub.com', password: 'student123', role: 'student', rollNumber: 'ME2203', course: 'B.Tech ME', department: 'Mechanical', semester: '5', academicPerformance: { cgpa: 7.9, percentage: 79 }, skills: ['SolidWorks', 'AutoCAD'], interests: ['Robotics'], careerGoal: 'Design Engineer in EV industry', bio: 'Mechanical design enthusiast.' },
    { name: 'Pooja Nair', email: 'pooja@mentorhub.com', password: 'student123', role: 'student', rollNumber: 'MB2304', course: 'MBA', department: 'Management', semester: '2', academicPerformance: { cgpa: 8.0, percentage: 80 }, skills: ['Marketing', 'Excel'], interests: ['HR', 'Analytics'], careerGoal: 'HR Manager', bio: 'MBA student focusing on HR.' },
  ]);

  console.log('Creating assignments...');
  const [m1, m2, m3] = mentors;
  const [s1, s2, s3, s4, s5, s6] = students;

  const assignments = [];
  assignments.push(await Mentorship.create({ student: s1._id, mentor: m1._id, department: 'Computer Science', assignedDate: new Date('2026-09-03'), status: 'active', history: [{ mentor: m1._id, action: 'assigned', date: new Date('2026-09-03') }] }));
  assignments.push(await Mentorship.create({ student: s2._id, mentor: m1._id, department: 'Computer Science', assignedDate: new Date('2026-08-20'), status: 'active', history: [{ mentor: m1._id, action: 'assigned' }] }));
  assignments.push(await Mentorship.create({ student: s4._id, mentor: m1._id, department: 'Computer Science', assignedDate: new Date('2026-08-25'), status: 'active', history: [{ mentor: m1._id, action: 'assigned' }] }));
  assignments.push(await Mentorship.create({ student: s3._id, mentor: m2._id, department: 'Electronics', assignedDate: new Date('2026-08-18'), status: 'active', history: [{ mentor: m2._id, action: 'assigned' }] }));
  assignments.push(await Mentorship.create({ student: s5._id, mentor: m3._id, department: 'Mechanical', assignedDate: new Date('2026-08-22'), status: 'active', history: [{ mentor: m3._id, action: 'assigned' }] }));
  assignments.push(await Mentorship.create({ student: s6._id, mentor: m2._id, department: 'Management', assignedDate: new Date('2026-09-01'), status: 'active', history: [{ mentor: m2._id, action: 'assigned' }] }));

  console.log('Creating meetings...');
  await Meeting.create([
    { student: s1._id, mentor: m1._id, date: new Date('2026-09-10'), time: '11:00 AM', purpose: 'Career Guidance', message: 'Need guidance about career path in full stack development.', status: 'accepted' },
    { student: s1._id, mentor: m1._id, date: new Date('2026-08-25'), time: '10:00 AM', purpose: 'Intro meeting', message: 'Getting started with mentorship.', status: 'completed', notes: { discussion: 'Discussed academic background and career goals.', actionItems: ['Read Node.js docs', 'Start a simple REST API'], followUpDate: new Date('2026-09-01') }, completedAt: new Date('2026-08-25') },
    { student: s2._id, mentor: m1._id, date: new Date('2026-09-12'), time: '02:00 PM', purpose: 'AI Specialization discussion', message: 'Want to discuss electives.', status: 'pending' },
    { student: s3._id, mentor: m2._id, date: new Date('2026-09-11'), time: '12:00 PM', purpose: 'Internship search help', message: 'Need help with internship applications.', status: 'accepted' },
    { student: s4._id, mentor: m1._id, date: new Date('2026-09-08'), time: '04:00 PM', purpose: 'Portfolio review', message: 'Please review my portfolio.', status: 'accepted' },
    { student: s6._id, mentor: m2._id, date: new Date('2026-09-15'), time: '03:00 PM', purpose: 'HR career roadmap', message: 'Guidance for HR specialization.', status: 'pending' },
  ]);

  console.log('Creating goals...');
  await Goal.create([
    { student: s1._id, mentor: m1._id, title: 'Learn React.js', description: 'Master React hooks, state management and routing.', category: 'Technical', priority: 'High', deadline: new Date('2026-09-30'), progress: 70, status: 'In Progress', milestones: ['Hooks', 'Redux', 'Next.js intro'] },
    { student: s1._id, mentor: m1._id, title: 'Build REST API using Express', description: 'Create a complete image-similarity search REST API.', category: 'Project', priority: 'High', deadline: new Date('2026-10-15'), progress: 40, status: 'In Progress', milestones: ['Models', 'Auth', 'Search' ] },
    { student: s1._id, mentor: m1._id, title: 'Improve Communication Skills', description: 'Participate in weekly technical discussions.', category: 'Communication', priority: 'Medium', deadline: new Date('2026-11-01'), progress: 30, status: 'In Progress' },
    { student: s2._id, mentor: m1._id, title: 'Master Java Collections', description: 'Deep dive into data structures in Java.', category: 'Academic', priority: 'High', deadline: new Date('2026-09-25'), progress: 80, status: 'In Progress' },
    { student: s4._id, mentor: m1._id, title: 'Design System Portfolio', description: 'Build a polished UI portfolio.', category: 'Career', priority: 'Medium', deadline: new Date('2026-10-01'), progress: 55, status: 'In Progress' },
    { student: s3._id, mentor: m2._id, title: 'VLSI Internship Preparation', description: 'Prepare for VLSI internship interviews.', category: 'Internship', priority: 'High', deadline: new Date('2026-09-20'), progress: 60, status: 'In Progress' },
    { student: s5._id, mentor: m3._id, title: 'Learn SolidWorks Advanced', description: 'Advanced assembly and simulation.', category: 'Technical', priority: 'Medium', deadline: new Date('2026-10-10'), progress: 25, status: 'In Progress' },
  ]);

  console.log('Creating tasks...');
  await Task.create([
    { student: s1._id, mentor: m1._id, title: 'Build REST API using Express.js', description: 'Design endpoints for blog with auth.', deadline: new Date('2026-09-15'), priority: 'High', status: 'In Progress' },
    { student: s1._id, mentor: m1._id, title: 'Complete React Hooks tutorial', description: 'Finish official React docs hooks section.', deadline: new Date('2026-09-12'), priority: 'Medium', status: 'Pending' },
    { student: s2._id, mentor: m1._id, title: 'Design Spring Boot CRUD app', description: 'Build a simple CRUD API with Spring Boot.', deadline: new Date('2026-09-18'), priority: 'High', status: 'In Progress' },
    { student: s4._id, mentor: m1._id, title: 'Redesign portfolio homepage', description: 'Create a modern landing page.', deadline: new Date('2026-09-20'), priority: 'Medium', status: 'Submitted', submission: { link: 'https://example.com/portfolio', note: 'Implemented with Tailwind.', submittedAt: new Date('2026-09-04') }, feedback: 'Great work! Improve the hero section typography.' },
    { student: s3._id, mentor: m2._id, title: 'Prepare VLSI interview questions', description: 'Compile and practice 50 questions.', deadline: new Date('2026-09-14'), priority: 'High', status: 'In Progress' },
  ]);

  console.log('Creating feedback...');
  await Feedback.create([
    { student: s1._id, mentor: m1._id, type: 'mentor-to-student', technicalSkills: 8, communication: 7, consistency: 9, problemSolving: 8, overallRating: 8, feedback: 'Student is showing good improvement in technical skills.' },
    { student: s1._id, mentor: m1._id, type: 'student-to-mentor', overallRating: 9, communication: 9, guidance: 9, availability: 8, comment: 'Great mentor, very supportive and available.' },
    { student: s2._id, mentor: m1._id, type: 'mentor-to-student', technicalSkills: 9, communication: 8, consistency: 9, problemSolving: 8, overallRating: 9, feedback: 'Excellent analytical skills, keep it up.' },
  ]);

  console.log('Creating resources...');
  await Resource.create([
    { mentor: m1._id, title: 'Node.js Crash Course', description: 'Complete beginner to advanced Node.js.', type: 'Video', url: 'https://www.nodejs.org', category: 'Technical' },
    { mentor: m1._id, title: 'React Official Docs', description: 'The best reference for React.', type: 'Link', url: 'https://react.dev', category: 'Technical' },
    { mentor: m1._id, title: 'System Design Primer', description: 'Repository of system design resources.', type: 'Link', url: 'https://github.com/donnemartin/system-design-primer', category: 'Career' },
    { mentor: m2._id, title: 'Agile Methodology Notes', description: 'Scrum and Kanban summary.', type: 'Notes', url: '', category: 'Management' },
  ]);

  console.log('Creating announcements...');
  await Announcement.create([
    { admin: admin._id, title: 'Internship Orientation', message: 'All students are requested to attend the internship orientation session on 15 September 2026.', target: { type: 'all' }, eventDate: new Date('2026-09-15') },
    { admin: admin._id, title: 'Hackathon 2026', message: 'Registration open for the annual hackathon. Team up and build!', target: { type: 'department', department: 'Computer Science' }, eventDate: new Date('2026-09-25') },
  ]);

  console.log('Creating notifications & messages...');
  await Notification.create([
    { user: s1._id, type: 'mentor_assigned', title: 'Mentor assigned', message: 'Rahul Sharma is now your mentor.', link: '/dashboard/mentor', read: true },
    { user: s1._id, type: 'meeting_accepted', title: 'Meeting accepted', message: 'Rahul Sharma accepted your meeting on Sep 10 at 11:00 AM.', link: '/dashboard/meetings' },
    { user: s1._id, type: 'new_task', title: 'New task assigned', message: 'Rahul Sharma assigned: Build REST API using Express.js', link: '/dashboard/tasks' },
    { user: s1._id, type: 'goal_assigned', title: 'New goal assigned', message: 'Learn React.js', link: '/dashboard/goals' },
    { user: m1._id, type: 'new_message', title: 'New message', message: 'Narendra Kumar: Hello sir, can we discuss the project?', link: '/dashboard/messages' },
  ]);

  await Message.create([
    { sender: m1._id, receiver: s1._id, content: 'Hi Narendra! Welcome to the mentorship program. What would you like to focus on first?', read: true },
    { sender: s1._id, receiver: m1._id, content: 'Hello sir, thank you! I want to focus on building full stack projects.', read: true },
    { sender: m1._id, receiver: s1._id, content: 'Great. Let us start with the REST API task and meet every week.', read: false },
  ]);

  console.log('\n=== SEED COMPLETE ===');
  console.log('Admin  -> admin@mentorhub.com / admin123');
  console.log('Mentor -> rahul@mentorhub.com / mentor123');
  console.log('Student-> narendra@mentorhub.com / student123');
  await mongoose.disconnect();
};

run().catch((err) => { console.error(err); process.exit(1); });