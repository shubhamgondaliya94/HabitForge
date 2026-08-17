import mongoose from 'mongoose';

const loginInfoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'SignUp', required: true, index: true },
  loginIdentifier: { type: String, required: true },
  loginTime: { type: Date, default: Date.now },
  ipAddress: { type: String, default: '127.0.0.1' },
  status: { type: String, enum: ['SUCCESS', 'FAILED'], default: 'SUCCESS' }
}, { collection: 'login_info' });

const LoginInfo = mongoose.model('LoginInfo', loginInfoSchema);
export default LoginInfo;
