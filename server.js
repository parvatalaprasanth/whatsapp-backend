import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMssages.js";
import Pusher from "pusher";
import cors from "cors";
import bodyParser from "body-parser";

//app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: "1188927",
  key: "cee6b9ad2c2f3563f0c7",
  secret: "9cde7c8b0cfeb94651b6",
  cluster: "ap2",
  useTLS: true
});

const db = mongoose.connection; 

db.once("open", () => {
  console.log("DB connected");

  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    console.log("A change occured", change);

    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("message", "inserted", {
        identity: messageDetails.identity,
        user1: messageDetails.user1,
        user2: messageDetails.user2,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
      });
    } else {
      console.log("Error triggering Pusher");
    }
  });
});


app.use(express.json());
app.use(cors());


const connection_url =
  "mongodb+srv://sparkeye8://password//@cluster0.ply7b.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});



app.get("/", (req, res) => res.status(200).send("hello world"));






app.get("/messages/sync", (req, res) => {
    const requestedid = req.query.id;
    console.log(requestedid);
    const dbMessage = {identity:req.query.id};
    Messages.find(dbMessage,(err, data) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send(data);
      }
    });
  });

app.post("/messages/new", (req, res) => {
    const dbMessage = req.body;
    console.log("hi")
    Messages.create(dbMessage, (err, data) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(201).send(data);
      }
    });
  });


app.listen(port, () => console.log(`Listening on localhost:${port}`));
