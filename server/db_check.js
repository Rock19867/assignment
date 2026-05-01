const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Project = require('./models/Project');
const User = require('./models/User');
const Task = require('./models/Task');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const users = await User.find();
  console.log("USERS:");
  users.forEach(u => console.log(`- ${u.name} (${u.role}) - ID: ${u._id}`));

  const projects = await Project.find();
  console.log("\nPROJECTS:");
  projects.forEach(p => console.log(`- ${p.name} - Members: ${p.members.join(', ')}`));

  const tasks = await Task.find();
  console.log("\nTASKS:");
  tasks.forEach(t => console.log(`- ${t.title} - Project: ${t.project} - Assignee: ${t.assignee}`));

  process.exit();
}

test();
