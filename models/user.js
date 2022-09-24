const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  friends: [{
    type: String,
  }],
  socketId:{
    type:String
  }
});

const myDB = mongoose.connection.useDb('chatApp');
const UserInfo = myDB.model("user", UserSchema);

// export default UserInfo;
module.exports = UserInfo;
