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

// Global error handler: always returns JSON.
app.use(
  (
    err: any,
    res: express.Response,
  ) => {
    console.error(err);
    // Use err.status if available (for custom errors) or default to 500.
    res.status(err.status || 500);
    res.type("json");
    res.json({
      message: err.message || "Internal Server Error",
      // Optionally include error details if available.
      details: err.details || undefined,
    });
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
