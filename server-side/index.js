const express = require("express")
const app = express()
const cors = require("cors")
const port = process.env.PORT || 3030
const pool = require("./db.js")
console.log(port)

// Middleware
app.use(express.json())
app.use(cors()) 

// Routes
// Add new note
app.post("/note", async (req,res) => {
  try {
    const {text} = req.body
    
    const newNoteInDB = await pool.query("INSERT INTO note (text) VALUES($1)",[text])
    
    res.json(newNoteInDB)

  } catch(err) {
    console.log(err.message)
  }
});

// Read all notes
app.get("/read_notes", async (req,res) => {
  try {
    const readAllNotesInDB = await pool.query("SELECT * FROM note")
    res.json(readAllNotesInDB)

  } catch(err) {
    console.log(err.message)
  }
});

// Update note
app.put("/edit_note/:id", async (req,res) => {
  try {
    const {id} = req.params;
    const {text} = req.body

    const updateNoteInDB = await pool.query("UPDATE note SET text = $1 WHERE note_id = $2",[text,id])

    res.json(updateNoteInDB)

  } catch(err) {
    console.log(err.message)
  }
})

// Delete note
app.delete("/delete_note/:id", async (req,res) => {
  try {
    const {id} = req.params;
    const deleteNoteFromDB = await pool.query("DELETE FROM note WHERE note_id = $1",[id])

    console.log("Note was successfully deleted")
  } catch(err) {
    console.log(err.message)
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})