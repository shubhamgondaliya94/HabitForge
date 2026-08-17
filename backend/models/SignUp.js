import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  category: { type: String, default: 'general' },
  unlockedAt: { type: Date, default: Date.now }
}, { _id: false });

const signUpSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '⚔️' },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  title: { type: String, default: 'Novice Adventurer' },
  badges: [badgeSchema],
  isPremium: { type: Boolean, default: false },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SignUp' }],
  createdAt: { type: Date, default: Date.now }
}, { collection: 'sign_up' });

const SignUp = mongoose.model('SignUp', signUpSchema);
export default SignUp;
