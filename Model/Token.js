import mongoose from "mongoose";
import { Schema } from "mongoose";

const token = new Schema({
    sessionToken : String
});

export default mongoose.model("Tokens", token);