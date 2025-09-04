//// models/Room.js
// {
//   _id: ObjectId,
//   name: String, // For channels, threads, groups
//   type: "private/dm" | "private/group" | "team" | "channel" | "thread",
//
//   participants: [
//     {
//       userId: ObjectId,
//       isMuted: Boolean,
//       hasDeleted: Boolean,
//       deletedAt: Date
//     }
//   ],
//
//   parentRoomId: ObjectId, // for threads under channels
//
//   lastMessageId: ObjectId,
//   createdBy: ObjectId,
//   createdAt: Date,
//   updatedAt: Date,
//
//   // 🔧 Scalable Config Field
//   config: {
//     isPinned: Boolean,         // user/admin pinned the room for quick access
//     isArchived: Boolean,       // archived room
//     isPublic: Boolean,         // for public visibility (if allowed by plan)
//     allowMedia: Boolean,       // allow attachments, files, etc
//     allowThreads: Boolean,     // whether threads are supported in this room
//     allowMentions: Boolean,    // whether @mentions work in this room
//     allowReaction: Boolean,    // enable/disable emoji reactions
//     maxParticipants: Number,   // useful for private groups, plan-based
//     accessTier: "basic" | "pro" | "enterprise", // feature gating
//     messageRetentionDays: Number // e.g., delete old messages after N days
//   }
// }