import express from "express";
import connect from "./db.js";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server is running baby!");
});

app.get("/Accounts", async (req, res) => {
  let db;
  try {
    db = await connect();
    const query = "SELECT * FROM Account";
    const [rows] = await db.execute(query);
    console.log(rows);

    res.json({
      data: rows,
      status: 200,
    });
  } catch (err) {
    console.error(err);
  } finally {
    if (db) db.end();
  }
});

app.post("/login", async (req, res) => {
  let db;
  try {
    const { identifierUser, passwordUser } = req.body;

    if (!identifierUser || !passwordUser) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    db = await connect();

    const query =
      "SELECT nameUser, passwordUser, idAccount FROM Account WHERE identifierUser = ?";
    const [rows] = await db.execute(query, [identifierUser]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = rows[0];

    console.log("DB user data:", {
      name: user.nameUser,
      idAccount: user.idAccount,
    });

    const isPasswordValid = await bcrypt.compare(
      passwordUser,
      user.passwordUser
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const responseData = {
      success: true,
      message: "Login successful",
      user: {
        name: user.nameUser,
        email: identifierUser,
        idAccount: user.idAccount,
      },
    };

    console.log("Enviando respuesta:", responseData);
    res.json(responseData);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
    });
  } finally {
    if (db) await db.end();
  }
});

app.post("/createAccount", async (req, res) => {
  let db;
  try {
    const { nameUser, emailUser, passwordUser } = req.body;
    bcrypt.hash(passwordUser, 8, async (error, hash) => {
      if (error) throw error;
      db = await connect();
      const query = `CALL SP_CREATE_ACCOUNT('${nameUser}', '${emailUser}', '${hash}')`;
      const [rows] = await db.execute(query);
      console.log(rows);

      res.json({
        data: rows,
        status: 200,
      });
    });
  } catch (err) {
    console.error(err);
  } finally {
    if (db) db.end();
  }
});

app.post("/createEvent", async (req, res) => {
  let db;
  try {
    const { imageUrl, title, department, date, location } = req.body;
    if (!imageUrl || !title || !department || !date || !location) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    db = await connect();
    const query = `CALL SP_CREATE_EVENT('${imageUrl}', '${title}', '${department}', '${date}', '${location}')`;
    const [rows] = await db.execute(query);
    console.log(rows);

    res.json({
      data: rows,
      status: 200,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    if (db) db.end();
  }
});

app.get("/events", async (req, res) => {
  let db;
  try {
    db = await connect();

    const query = `SELECT * FROM events`;
    const [rows] = await db.execute(query);

    res.json({
      success: true,
      events: rows,
      status: 200,
    });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    if (db) db.end();
  }
});

app.get("/events/:id", async (req, res) => {
  let db;
  const eventId = req.params.id;

  try {
    db = await connect();

    const query = `SELECT * FROM events WHERE id = ?`;
    const [rows] = await db.execute(query, [eventId]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.json({
      success: true,
      event: rows[0],
      status: 200,
    });
  } catch (err) {
    console.error("Error fetching event:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    if (db) db.end();
  }
});



