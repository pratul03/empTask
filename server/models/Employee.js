import { Schema, model } from "mongoose";

const employeeSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  designation: { type: String, required: true },
  gender: { type: String, required: true },
  course: { type: String, required: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default model("Employee", employeeSchema);
