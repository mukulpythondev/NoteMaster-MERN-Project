const express = require("express");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");
const fetchuser = require("../middleware/fetchuser");
const router = express.Router();
//Route 1: Get all the notes using : GET "notes/getnotes" login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
 try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
 } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server error' });
 }
   
});
//Route 2: Add all the notes using : Post "notes/addnotes" login required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid Title !").isLength({ min: 3 }),
    body("description", "Password minimum length is 8").isLength({ min: 5 }),
  ],
 
    async (req, res) => {
        try {
        const { title, description, tag } = req.body;
        const errors = validationResult(req);
        // if there are errors thnn return bad gateway and errors
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const note = new Notes({
          title,
          description,
          tag,
          user: req.user.id,
        });
        const savenote=await note.save()
        res.json(savenote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server error' });
  }
 
})
//Route 3 :Update  the note using : Put "notes/updatenote" login required
router.put(
  "/updatenote/:id",
  fetchuser,
  async (req, res) => {
    try {
      const {title,description,tag}=req.body
      // creating new note object
   const newnote={};
   if (title){ newnote.title=title;}
   if (description){newnote.description=description;}
   if (tag){newnote.tag=tag;}
   let note= await Notes.findById(req.params.id)
 if (!note){
  return res.status(404).send("Not Found!")
 }
 if (note.user.toString() !==req.user.id){
 return res.status(401).send("Not Allowed")
 }
 note = await Notes.findByIdAndUpdate(req.params.id,{$set:newnote},{new:true})
 res.json({note})
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server error' });
    }
  
})
//Route 4 :Delete the note using : Put "notes/deletenote" login required
router.delete(
  "/deletenote/:id",
  fetchuser,
  async (req, res) => {
     try {
         // find the note to deleted and delete it 
  let note= await Notes.findById(req.params.id)
  if (!note){
   return res.status(404).send("Not Found!")
  }
  // Allow deletion only if user owns the note
  if (note.user.toString() !==req.user.id){
  return res.status(401).send("Not Allowed")
  }
  note = await Notes.findByIdAndDelete(req.params.id)
  res.json({"Sucess":"Note is Deleted",note:note})
     } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server error' });
     }
 
})
module.exports = router;
