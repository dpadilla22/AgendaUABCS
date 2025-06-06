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





////////////////////////////////////////////////////////////////////////////////////////////////////
// 								  	  		            Login User
////////////////////////////////////////////////////////////////////////////////////////////////////

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

    console.log("Sending response:", responseData);
    res.json(responseData);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    if (db) await db.end();
  }
});





////////////////////////////////////////////////////////////////////////////////////////////////////
// 								  	  		           Check Accounts
////////////////////////////////////////////////////////////////////////////////////////////////////

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





////////////////////////////////////////////////////////////////////////////////////////////////////
// 								  	  		             Create Account
////////////////////////////////////////////////////////////////////////////////////////////////////

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





////////////////////////////////////////////////////////////////////////////////////////////////////
// 								  	  		             Create Event
////////////////////////////////////////////////////////////////////////////////////////////////////

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





////////////////////////////////////////////////////////////////////////////////////////////////////
// 								  	  		            Check events
////////////////////////////////////////////////////////////////////////////////////////////////////

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





////////////////////////////////////////////////////////////////////////////////////////////////////
// 								  	  		           Check event by ID
////////////////////////////////////////////////////////////////////////////////////////////////////

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





////////////////////////////////////////////////////////////////////////////////////////////////////
// 								  	  		           Add event to favorites
////////////////////////////////////////////////////////////////////////////////////////////////////

app.post("/events/:id/favorite", async (req, res) => {
  let db;
  const eventId = req.params.id;
  const { accountId } = req.body;

  if (!accountId) {
    return res.status(400).json({
      success: false,
      message: "Account ID is required",
    });
  }

  try {
    db = await connect();

    const query = `INSERT INTO favorites (accountId, eventId) VALUES (?, ?)`;
    await db.execute(query, [accountId, eventId]);

    res.json({
      success: true,
      message: "Event added to favorites",
      status: 200,
    });
  } catch (err) {
    console.error("Error adding event to favorites:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    if (db) db.end();
  }
});





////////////////////////////////////////////////////////////////////////////////////////////////////
// 								  	  		           Check favorites by account
////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/favorites/:accountId", async (req, res) => {
  let db;
  const accountId = req.params.accountId;
  try {
    db = await connect();
    const query = `SELECT * FROM favorites WHERE accountId = ?`;
    const [rows] = await db.execute(query, [accountId]);
    console.log(rows);
    res.json({
      success: true,
      favorites: rows,
      status: 200,
    });
  } catch (err) {
    console.error("Error fetching favorites:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    if (db) db.end();
  }
});





////////////////////////////////////////////////////////////////////////////////////////////////////
// 								  	  		           Eliminate favorites by account
////////////////////////////////////////////////////////////////////////////////////////////////////

app.delete("/favorites/:accountId/:eventId", async (req, res) => {
  let db;
  const { accountId, eventId } = req.params;

  try {
    db = await connect();
    const query = `DELETE FROM favorites WHERE accountId = ? AND eventId = ?`;
    const [result] = await db.execute(query, [accountId, eventId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
      });
    }

    res.json({
      success: true,
      message: "Favorite deleted successfully",
      status: 200,
    });
  } catch (err) {
    console.error("Error deleting favorite:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    if (db) db.end();
  }
});





////////////////////////////////////////////////////////////////////////////////////////////////////
// 								  	  		           Create department
////////////////////////////////////////////////////////////////////////////////////////////////////

app.post("/createDepartment", async (req, res) => {
  let db;
  try {
    const { nameDepartment } = req.body;
    if (!nameDepartment) {
      return res.status(400).json({
        success: false,
        message: "Name department is required",
      });
    }
    db = await connect();
    const query = `CALL SP_CREATE_DEPARTMENT('${nameDepartment}')`;
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





////////////////////////////////////////////////////////////////////////////////////////////////////
// 								  	  		           Create suggestions
////////////////////////////////////////////////////////////////////////////////////////////////////

app.post("/createSuggestion", async (req, res) => {
  let db;
  try {
    const {
      titleEventSuggestion,
      idDepartment,
      dateEventSuggestion,
      timeEventSuggestion,
      locationEventSuggestion,
      accountId,
    } = req.body;
    if (
      !titleEventSuggestion ||
      !idDepartment ||
      !dateEventSuggestion ||
      !timeEventSuggestion ||
      !locationEventSuggestion ||
      !accountId
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    db = await connect();
    const query = `CALL SP_CREATE_SUGGESTION('${titleEventSuggestion}', ${idDepartment}, '${dateEventSuggestion}', '${timeEventSuggestion}', '${locationEventSuggestion}', '${accountId}')`;
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





////////////////////////////////////////////////////////////////////////////////////////////////////
// 								  	  		           Check departments
////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/departments", async (req, res) => {
  let db;
  try {
    db = await connect();

    const query = `SELECT * FROM departments`;
    const [rows] = await db.execute(query);

    res.json({
      success: true,
      departments: rows,
      status: 200,
    });
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    if (db) db.end();
  }
});





////////////////////////////////////////////////////////////////////////////////////////////////////
// 								  	  		           Check suggestions
////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/suggestions", async (req, res) => {
  let db;
  try {
    db = await connect();

    const query = `SELECT * FROM suggestions`;
    const [rows] = await db.execute(query);

    res.json({
      success: true,
      suggestions: rows,
      status: 200,
    });
  } catch (err) {
    console.error("Error fetching suggestions:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    if (db) db.end();
  }
});





////////////////////////////////////////////////////////////////////////////////////////////////////
// 								  	  		           Create notification
////////////////////////////////////////////////////////////////////////////////////////////////////

app.post("/createNotification", async (req, res) => {
  let db;
  try {
    const { accountId, eventId, message } = req.body;
    if (!accountId || !message) {
      return res.status(400).json({
        success: false,
        message: "accountId and message are required",
      });
    }
    db = await connect();
    const query = `CALL SP_CREATE_NOTIFICATION('${accountId}', '${eventId}', '${message}')`;
    await db.execute(query, [accountId, eventId || null, message]);

    res.json({
      success: true,
      message: "Notification created successfully",
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





////////////////////////////////////////////////////////////////////////////////////////////////////
// 								  	  		           Create comment
////////////////////////////////////////////////////////////////////////////////////////////////////

app.post("/createComment", async (req, res) => {
  let db;
  try {
    const { titleComment, descriptionComment, accountId } = req.body;
    if (!titleComment || !descriptionComment || !accountId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    db = await connect();
    const query = `CALL SP_CREATE_COMMENT('${titleComment}', '${descriptionComment}', '${accountId}')`;
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





////////////////////////////////////////////////////////////////////////////////////////////////////
// 								  	  		           Mark attendance
////////////////////////////////////////////////////////////////////////////////////////////////////

app.post("/markAttendance", async (req, res) => {
  let db;
  try {
    const { accountId, eventId } = req.body;
    if (!accountId || !eventId) {
      return res.status(400).json({
        success: false,
        message: "accountId and eventId are required",
      });
    }
    db = await connect();
    const query = `CALL SP_MARK_ATTENDANCE(?, ?)`;
    await db.execute(query, [accountId, eventId]);

    res.json({
      success: true,
      message: "Attendance marked successfully",
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





////////////////////////////////////////////////////////////////////////////////////////////////////
// 								  	  		           Unmark attendance
////////////////////////////////////////////////////////////////////////////////////////////////////

app.post("/unmarkAttendance", async (req, res) => {
  let db;
  try {
    const { accountId, eventId } = req.body;
    if (!accountId || !eventId) {
      return res.status(400).json({
        success: false,
        message: "accountId and eventId are required",
      });
    }
    db = await connect();
    const query = `CALL SP_UNMARK_ATTENDANCE(?, ?)`;
    await db.execute(query, [accountId, eventId]);

    res.json({
      success: true,
      message: "Attendance unmarked successfully",
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





////////////////////////////////////////////////////////////////////////////////////////////////////
// 								  	  		           Check attendance by account
////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/attendance/:accountId", async (req, res) => {
  let db;
  const accountId = req.params.accountId;
  try {
    db = await connect();
    const query = `SELECT a.*, e.* FROM attendance a INNER JOIN events e ON a.eventId = e.id WHERE a.accountId = ?`;
    const [rows] = await db.execute(query, [accountId]);
    console.log(rows);
    res.json({
      success: true,
      attendance: rows,
      status: 200,
    });
  } catch (err) {
    console.error("Error fetching attendance:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    if (db) db.end();
  }
});





////////////////////////////////////////////////////////////////////////////////////////////////////
// 								  	  		           Check comments by account
////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/comments/:accountId", async (req, res) => {
  let db;
  const accountId = req.params.accountId;
  try {
    db = await connect();
    const query = `SELECT * FROM comments WHERE accountId = ?`;
    const [rows] = await db.execute(query, [accountId]);
    console.log(rows);
    res.json({
      success: true,
      comments: rows,
      status: 200,
    });
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    if (db) db.end();
  }
});





////////////////////////////////////////////////////////////////////////////////////////////////////
// 								  	  		           Check all comments
////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/comments", async (req, res) => {
  let db;
  try {
    db = await connect();
    const query = `
      SELECT 
        c.idComment,
        c.titleComment,
        c.descriptionComment,
        c.dateComment,
        a.nameUser
      FROM comments c
      INNER JOIN Account a ON c.accountId = a.idAccount
    `;
    const [rows] = await db.execute(query);
    res.json({
      success: true,
      comments: rows,
      status: 200,
    });
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    if (db) db.end();
  }
});
////////////////////////////////////////////////////////////////////////////////////////////////////
// 								  	  		           Check notification
////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/notifications/:accountId", async (req, res) => {
  let db;
  const accountId = req.params.accountId;
  try {
    db = await connect();
    const query = `SELECT * FROM notifications WHERE accountId = ?`;
    const [rows] = await db.execute(query, [accountId]);
    console.log(rows);
    res.json({
      success: true,
      notifications: rows,
      status: 200,
    });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    if (db) db.end();
  }
});
