import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { changeProfileImage, register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import communicationRoutes from "./routes/communication.js";
import postRoutes from "./routes/posts.js";
import channelRoutes from "./routes/channel.js";
import { verifyToken } from "./middleware/auth.js";
import { Server } from "socket.io";
import { createChannel } from "./controllers/channel.js";
import http from "http";

// CONFIGURATIONS //
// __dirname type module Alternative
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "*"],
    methods: ["GET", "POST"]
  },
});

io.on("connection", (socket) => {
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
  });

  socket.on("sendMessage", (data) => {
    io.to(data.channelId).emit("receiveMessage", data);
  });

  socket.on("sendPersonalMessage", (data) => {
    io.to(data.conversationId).emit("receivePersonalMessage", data);
  })
});



// MIDDLEWARES //
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(cors());

//This line of code sets up a static file server to serve files from the public/assets directory.
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// FILE STORAGE //
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/assets");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// ROUTES WITH FILES //

app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);
app.post("/changeProfileImage", verifyToken, upload.single("picture"), changeProfileImage);
app.post("/channel", verifyToken, upload.single("picture"), createChannel);



// ROUTES //
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/channel", channelRoutes);
app.use("/communication", communicationRoutes);

// MONGOOSE SETUP //
const PORT = process.env.PORT || 6001;
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_ATLAS_DB, {
    useUnifiedTopology: true,
  })
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log("Successfully connected to mongodb");
    });
  })
  .catch((error) => console.log(`${error} did not connect`));

app.get("/", (req, res) => {
  res.send("This is index.js");
});
