const express = require("express");
const router = express.Router();

const Note = require("../models/notes");

// GET all notes for a RealEstateQuery
// GET /api/notes/query/:queryId
router.get("/query/:queryId", async (req, res) => {
  try {
    const notes = await Note.find({
      realEstateQuery: req.params.queryId,
    }).sort({ createdAt: -1 });

    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ message: "Failed to get notes", error: err.message });
  }
});

// CREATE new note
// POST /api/notes
router.post("/", async (req, res) => {
  try {
    const { realEstateQuery, note } = req.body;

    if (!realEstateQuery || !note) {
      return res.status(400).json({
        message: "realEstateQuery and note are required",
      });
    }

    const newNote = await Note.create({
      realEstateQuery,
      note,
    });

    res.status(201).json(newNote);
  } catch (err) {
    res.status(500).json({ message: "Failed to create note", error: err.message });
  }
});

// UPDATE note
// PUT /api/notes/:noteId
router.put("/:noteId", async (req, res) => {
  try {
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ message: "note is required" });
    }

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.noteId,
      { note },
      { new: true, runValidators: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json(updatedNote);
  } catch (err) {
    res.status(500).json({ message: "Failed to update note", error: err.message });
  }
});

// DELETE note
// DELETE /api/notes/:noteId
router.delete("/:noteId", async (req, res) => {
  try {
    const deletedNote = await Note.findByIdAndDelete(req.params.noteId);

    if (!deletedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({
      message: "Note deleted successfully",
      deletedNote,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete note", error: err.message });
  }
});

module.exports = router;