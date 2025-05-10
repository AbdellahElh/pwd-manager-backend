// src/server.ts
import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import credentialRoutes from "./routes/CredentialRoutes";
import userRoutes from "./routes/UserRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/credentials", credentialRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
