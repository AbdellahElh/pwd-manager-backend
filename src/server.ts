// src/server.ts
import express from "express";
import cors from "cors";
import userRoutes from "./routes/UserRoutes";
import credentialRoutes from "./routes/CredentialRoutes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

app.use("/users", userRoutes);
app.use("/credentials", credentialRoutes);

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
