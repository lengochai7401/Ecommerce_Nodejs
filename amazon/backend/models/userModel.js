import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: async function (value) {
          const user = await this.constructor.findOne({ email: value });
          if (user) {
            return false; // Email is not unique
          }
          return true; // Email is unique
        },
        message: 'This email has been registered!',
      },
    },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false, required: true, default: false },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

export default User;
