// src/server.ts
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import credentialRoutes from "./routes/CredentialRoutes";
import userRoutes from "./routes/UserRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

// Serve static files from public directory
app.use(express.static("public"));

app.use("/api/users", userRoutes);
app.use("/api/credentials", credentialRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
