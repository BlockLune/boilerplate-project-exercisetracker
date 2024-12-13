import "dotenv/config";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";

mongoose.connect(process.env.MONGO_URI);

const userSchema = new mongoose.Schema({
  username: String,
});

const exerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: {
    type: Date,
    default: Date.now,
  },
});

const logSchema = new mongoose.Schema({
  username: String,
  count: Number,
  log: [
    {
      description: String,
      duration: Number,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const User = mongoose.model("User", userSchema);
const Exercise = mongoose.model("Exercise", exerciseSchema);
const Log = mongoose.model("Log", logSchema);

const app = express();
app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

app.get("/", (_, res) => {
  res.sendFile(import.meta.dirname + "/views/index.html");
});

app.post("/api/users", async (req, res) => {
  const user = new User({
    username: req.body.username,
  });
  const result = await user.save();
  res.status(201).json({
    username: result._doc.username,
    _id: result._doc._id,
  });
});

app.get("/api/users", async (_, res) => {
  const users = await User.find().exec();
  res.status(200).json(users);
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  const user = await User.findById(req.params.id).exec();
  const exercise = new Exercise({
    username: user.username,
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date,
  });
  const result = await exercise.save();
  res.status(201).json(exercise);
});
