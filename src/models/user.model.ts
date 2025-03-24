import mongoose, { Schema } from "mongoose";
import { UserDocument } from "../interfaces/user.interface";
import { GenderEnum } from "../enums/user.enum";
import { compareValues, hashValue } from "../utils/bcrypt";

const UserSchema = new Schema<UserDocument>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: true },
    firstName: { type: String, minlength: 2 },
    lastName: { type: String, minlength: 2 },
    gender: { type: String, enum: Object.values(GenderEnum), default: null },
    dateOfBirth: { type: String },
    location: { type: String },
    hobbies: { type: [String] },
    profileImage: { type: String },
    bio: { type: String },
  },
  {
    timestamps: true,
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        (ret.id = ret._id.toString()), delete ret._id, delete ret._v;
        return ret;
      },
    },
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        (ret.id = ret._id.toString()), delete ret._id, delete ret._v;
        return ret;
      },
    },
  }
);

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    if (this.password) {
      this.password = await hashValue(this.password);
    }
  }
  next();
});

UserSchema.methods.omitPassword = function (): Omit<UserDocument, "password"> {
  const userObject = this.object();
  delete userObject.password;
  return userObject;
};

UserSchema.methods.comparePassword = async function (value: string) {
  return compareValues(value, this.password);
};

const UserModel = mongoose.model<UserDocument>("User", UserSchema);
export default UserModel;
