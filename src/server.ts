// src/server.ts
import express from "express";
import cors from "cors";
import userRoutes from "./routes/users";
import credentialRoutes from "./routes/credentials";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/users", userRoutes);

app.use("/credentials", credentialRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
