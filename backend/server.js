const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const connectDB = require("./config/db");
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/osm", require("./routes/overpassRoutes"));

const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("Socket Connected:", socket.id);

  socket.on("driverLocation", (data) => {
    io.emit("updateDriverLocation", data);
  });

  socket.on("disconnect", () => {
    console.log("Socket Disconnected:", socket.id);
  });
});

server.listen(process.env.PORT, () => {
  console.log("Backend running on port", process.env.PORT);
});
