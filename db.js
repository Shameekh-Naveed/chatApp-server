require("dotenv").config();
const mongoose = require("mongoose");


const connectToMongo = () => {
  mongoose.connect(
    process.env.REACT_APP_mongoURI,
    () => {
      console.log("Connected to MongoDB");
    }
  );
};

const db = mongoose.connection;
db.once("open", () => {
  console.log("MongoDB opened");
});
db.on("error", (error) => {
  console.log({ error });
});

module.exports = connectToMongo;
