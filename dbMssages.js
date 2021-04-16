import mongoose from "mongoose";

const whatsappSchema = mongoose.Schema({
  identity:String,
  user1:String,
  user2:String,
  message:String,
  timestamp:String,
});

//collection
export default mongoose.model("messagecontents", whatsappSchema);