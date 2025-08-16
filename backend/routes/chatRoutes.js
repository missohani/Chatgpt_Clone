import express from "express";
import Chat from "../models/chat.js";
import UserChats from "../models/userChats.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const router = express.Router();

// Create new chat
router.post("/chats", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { text } = req.body;

    if (!userId || !text) return res.status(400).json({ error: "Invalid input" });

    const newChat = new Chat({
      userId,
      history: [{ role: "user", parts: [{ text }] }],
    });

    const savedChat = await newChat.save();

    const userChats = await UserChats.findOne({ userId });

    if (!userChats) {
      const newUserChats = new UserChats({
        userId,
        chats: [{ _id: savedChat._id, title: text.substring(0, 40) }],
      });
      await newUserChats.save();
    } else {
      await UserChats.updateOne(
        { userId },
        {
          $push: {
            chats: {
              _id: savedChat._id,
              title: text.substring(0, 40),
            },
          },
        }
      );
    }

    res.status(201).json({ chatId: savedChat._id });
  } catch (err) {
    console.error("❌ Error creating chat:", err);
    res.status(500).json({ error: "Error creating chat!" });
  }
});

// Fetch user chats
router.get("/userchats", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const userChats = await UserChats.findOne({ userId });
    res.status(200).json(userChats?.chats || []);
  } catch (err) {
    console.error("❌ Error fetching user chats:", err);
    res.status(500).json({ error: "Error fetching user chats!" });
  }
});

// Delete a chat
router.delete("/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth?.userId;
  const chatId = req.params.id;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    await Chat.deleteOne({ _id: chatId, userId });

    await UserChats.updateOne(
      { userId },
      { $pull: { chats: { _id: chatId } } }
    );

    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting chat:", err);
    res.status(500).json({ error: "Error deleting chat!" });
  }
});

// Rename a chat
router.put("/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth?.userId;
  const chatId = req.params.id;
  const { newTitle } = req.body;

  if (!userId || !newTitle) return res.status(400).json({ error: "Invalid input" });

  try {
    const result = await UserChats.updateOne(
      { userId, "chats._id": chatId },
      { $set: { "chats.$.title": newTitle } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Chat not found or not modified" });
    }

    res.status(200).json({ message: "Chat title updated successfully" });
  } catch (err) {
    console.error("❌ Error renaming chat:", err);
    res.status(500).json({ error: "Error renaming chat!" });
  }
});

export default router;
