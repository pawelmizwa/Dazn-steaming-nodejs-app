import { Schema, model } from "mongoose";
const usersSchema = new Schema({
  Id: String,
  Name: String,
  Email: String,
});
export const users = model("Users", usersSchema);
