import express from "express";
import multer from "multer";
// import fs from "fs/promises";
import sqlite3 from "sqlite3";
import cors from "cors";

let db;
let times_sent = 0;
function setup_db() {
	db = new sqlite3.Database("./db/imagestore.db", (err) => {
		if (err) {
			return console.error(err.message);
		}
		console.log("Connected to the File database.");
	});
	db.run(
		`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    image_filename TEXT NOT NULL
  )
`,
		(err) => {
			if (err) {
				console.error(err.message);
			}
			console.log("Created users table.");
		}
	);
}


const app = express();
app.use(express.static("images"));

const images_path = "images";

// Allow requests from any origin
app.use(cors());

// Configure multer to handle file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, images_path);
	},
	filename: (req, file, cb) => {
		// console.log(req)

		const user = req.body.username.replaceAll(" ", "_");
		const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const file_name =
			user + "-" + unique + "." + file.originalname.split(".").pop();

		// console.log(file_name);
		cb(null, file_name);
	},
});

const upload = multer({ storage: storage });

// Define a route to handle the POST request
app.post("/", upload.single("image"), (req, res) => {
	const { username, email } = req.body;
	const imageFilename = req.file.filename;
	// Save the recived data to database
	const sql = `INSERT INTO users (username, email, image_filename) VALUES (?, ?, ?)`;
	const params = [username, email, imageFilename];
	db.run(sql, params, (err) => {
		if (err) {
			console.error(err.message);
			res.status(500).send("Error saving user data");
			return;
		}
		console.log("Created Entry");
		res.send("User created successfully");
	});

});

app.get('/getall', async (req, res) => {

	const sql = `SELECT * FROM users`;
	db.all(sql, [], (err, rows) => {
		if (err) {
			console.error(err.message);
			res.status(500).send('Error retrieving users');
			return;

		}
		console.log("Sent all user data: " + times_sent + " times")
		times_sent++;
		res.json(rows);
	});
})

app.get('/getone', (req, res) => {
	const search = req.query.search || '';
	const sql = `SELECT * FROM users WHERE username LIKE '%' || ? || '%'`;
	const params = [search];
	db.all(sql, params, (err, rows) => {
		if (err) {
			console.error(err.message);
			res.status(500).send('Error retrieving users');
			return;
		}
		res.json(rows);
	});
});

setup_db();

app.listen(3000, () => {
	console.log("Server started on port 3000");
});

