import mongoose from 'mongoose';

const habitInfoSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  frequency: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
  category: { type: String, enum: ['fitness', 'mindfulness', 'learning', 'health', 'productivity', 'other'], default: 'productivity' },
  color: { type: String, default: '#8b5cf6' },
  icon: { type: String, default: '⭐' },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastCompletedDate: { type: String, default: null }, // YYYY-MM-DD
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'SignUp', required: true, index: true },
  userName: { type: String, required: true, trim: true }, // Name of the user in habit_info table
  targetPerWeek: { type: Number, default: 7 },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'habit_info' });

const HabitInfo = mongoose.model('HabitInfo', habitInfoSchema);
export default HabitInfo;
