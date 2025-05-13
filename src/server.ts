// src/server.ts
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import credentialRoutes from "./routes/CredentialRoutes";
import userRoutes from "./routes/UserRoutes";
import { loadModelsOnce } from "./services/user.service";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Load face-api models before accepting requests for performance
loadModelsOnce().catch(err => {
  console.error("Failed to load face-api models:", err);
  process.exit(1);
});

app.use("/api/users", userRoutes);
app.use("/api/credentials", credentialRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
