import mongoose from 'mongoose';

const completionLogSchema = new mongoose.Schema({
  habit: { type: mongoose.Schema.Types.ObjectId, ref: 'HabitInfo', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'SignUp', required: true, index: true },
  date: { type: String, required: true, index: true }, // YYYY-MM-DD
  timestamp: { type: Date, default: Date.now },
  xpEarned: { type: Number, default: 50 }
}, { collection: 'completionlogs' });

// Compound index for unique completions per day per habit
completionLogSchema.index({ habit: 1, date: 1 }, { unique: true });

const CompletionLog = mongoose.model('CompletionLog', completionLogSchema);
export default CompletionLog;
