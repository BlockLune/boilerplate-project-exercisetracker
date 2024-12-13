import "dotenv/config";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";

await mongoose.connect(process.env.MONGO_URI);

const userSchema = new mongoose.Schema({
  username: String,
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
  res.status(200).json(
    users.map((user) => ({
      username: user.username,
      _id: user._id,
    }))
  );
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  const user = await User.findById(req.params.id).exec();
  user.log = [
    ...user.log,
    {
      description: req.body.description,
      duration: req.body.duration,
      date: req.body.date ? new Date(req.body.date) : undefined,
    },
  ];
  const result = await user.save();
  const updatedUser = result._doc;
  const logLength = updatedUser.log.length;
  const addedLog = updatedUser.log[logLength - 1];
  res.status(201).json({
    username: updatedUser.username,
    description: addedLog.description,
    duration: addedLog.duration,
    date: addedLog.date.toDateString(),
    _id: updatedUser._id,
  });
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const user = User.findById(req.params.id).exec();
  res.json(user.log);
});
