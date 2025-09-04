import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import styles from "./Messages.module.css";
import useProjectContext from "../../hook/useProjectContext";
import { useSocket } from "../../service/Sockets/SocketContext";
import {
  createRoom,
  getUserRoomsByProject,
  doesDMRoomExist,
} from "../../service/roomService";
import { getMessagesByRoomId, sendMessage } from "../../service/messageService";
import { getUserById } from "../../service/User/UserFetcher";
import { getTimeElapsed } from "../../utils/datetime";
import search from "../../images/icons/search.svg";
import edit from "../../images/icons/edit.svg";
import send from "../../images/icons/send.svg";
import PropTypes from "prop-types";
import attachment from "../../images/icons/attachment.svg";
import reaction from "../../images/icons/reaction.svg";
import replyIcon from "../../images/icons/reply.svg";
import emoji from "../../images/icons/emoji1.svg";
import Picker from "emoji-picker-react";
import bold from "../../images/icons/bold.svg";
import italic from "../../images/icons/italic.svg";
import underline from "../../images/icons/underline.svg";
// ✅ START: Imports for Tiptap
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Placeholder } from "@tiptap/extensions";
// ✅ END: Imports for Tiptap

import { createPortal } from "react-dom";

import kario_message from "../../images/icons/kairo.svg"
import mentions from "../../images/icons/mention.svg"
import drafts from "../../images/icons/drafts.svg"
import saved from "../../images/icons/saved.svg"

import add from "../../images/icons/add_collapsible.svg"
import dropdown from "../../images/icons/dropdown_collapsible.svg"
import hashtag from "../../images/icons/hashtag.svg"
import SideActionBarTower from "../ui/SideActionBarTower"


import menu from "../../images/icons/menu.svg";

const senderInfoCache = new Map();

export const EMOJI_CATEGORIES = {
  "Smileys & People": {
    icon: "😀",
    emojis: [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "🤣",
      "😂",
      "🙂",
      "🙃",
      "😉",
      "😊",
      "😇",
      "🥰",
      "😍",
      "🤩",
      "😘",
      "😗",
      "😚",
      "😙",
      "😋",
      "😛",
      "😜",
      "🤪",
      "😝",
      "🤑",
      "🤗",
      "🤭",
      "🤫",
      "🤔",
      "🤐",
      "🤨",
      "😐",
      "😑",
      "😶",
      "😏",
      "😒",
      "🙄",
      "😬",
      "🤥",
      "😌",
      "😔",
      "😪",
      "🤤",
      "😴",
      "😷",
      "🤒",
      "🤕",
      "🤢",
      "🤮",
      "🤧",
      "🥵",
      "🥶",
      "🥴",
      "😵",
      "🤯",
      "🤠",
      "🥳",
      "😎",
      "🤓",
      "🧐",
      "😕",
      "😟",
      "🙁",
      "😮",
      "😯",
      "😲",
      "😳",
      "🥺",
      "😦",
      "😧",
      "😨",
      "😰",
      "😥",
      "😢",
      "😭",
      "😱",
      "😖",
      "😣",
      "😞",
      "😓",
      "😩",
      "😫",
      "🥱",
      "😤",
      "😡",
      "😠",
      "🤬",
      "😈",
      "👿",
      "💀",
      "💩",
      "🤡",
      "👹",
      "👺",
      "👻",
      "👽",
      "👾",
      "🤖",
      "👋",
      "🤚",
      "🖐️",
      "✋",
      "🖖",
      "👌",
      "🤌",
      "🤏",
      "✌️",
      "🤞",
      "🤟",
      "🤘",
      "🤙",
      "👈",
      "👉",
      "👆",
      "🖕",
      "👇",
      "👍",
      "👎",
      "✊",
      "👊",
      "🤛",
      "🤜",
      "👏",
      "🙌",
      "👐",
      "🤲",
      "🤝",
      "🙏",
      "✍️",
      "💅",
      "🤳",
      "💪",
      "🦾",
    ],
  },
  "Animals & Nature": {
    icon: "🐶",
    emojis: [
      "🙈",
      "🙉",
      "🙊",
      "🐵",
      "🐒",
      "🦍",
      "🦧",
      "🐶",
      "🐕",
      "🦮",
      "🐕‍🦺",
      "🐩",
      "🐺",
      "🦊",
      "🦝",
      "🐱",
      "🐈",
      "🐈‍⬛",
      "🦁",
      "🐯",
      "🐅",
      "🐆",
      "🐴",
      "🐎",
      "🦄",
      "🦓",
      "🦌",
      "🦬",
      "🐮",
      "🐂",
      "🐃",
      "🐄",
      "🐷",
      "🐖",
      "🐗",
      "🐽",
      "🐏",
      "🐑",
      "🐐",
      "🐪",
      "🐫",
      "🦙",
      "🦒",
      "🐘",
      "🦣",
      "🦏",
      "🦛",
      "🐭",
      "🐁",
      "🐀",
      "🐹",
      "🐰",
      "🐇",
      "🐿️",
      "🦫",
      "🦔",
      "🦇",
      "🐻",
      "🐻‍❄️",
      "🐨",
      "🐼",
      "🦥",
      "🦦",
      "🦨",
      "Kangaroo",
      "🦡",
      "🐾",
      "🦃",
      "🐔",
      "🐓",
      "🐣",
      "🐤",
      "🐥",
      "🐦",
      "🐧",
      "🕊️",
      "🦅",
      "🦆",
      "🦢",
      "🦉",
      "🦤",
      "🪶",
      "🐸",
      "🐊",
      "🐢",
      "🦎",
      "🐍",
      "🐲",
      "🐉",
      "🦕",
      "🦖",
      "🐳",
      "🐋",
      "🐬",
      "🦭",
      "🐟",
      "🐠",
      "🐡",
      "🦈",
      "🐙",
      "🐚",
      "🐌",
      "🦋",
      "🐛",
      "🐜",
      "🐝",
      "🪲",
      "🐞",
      "🦗",
      "🪳",
      "🕷️",
      "🕸️",
      "🦂",
      "🦟",
      "🪰",
      "🪱",
      "🦠",
    ],
  },
  "Food & Drink": {
    icon: "🍎",
    emojis: [
      "🍇",
      "🍈",
      "🍉",
      "🍊",
      "🍋",
      "🍌",
      "🍍",
      "🥭",
      "🍎",
      "🍏",
      "🍐",
      "🍑",
      "🍒",
      "🍓",
      "🫐",
      "🥝",
      "🍅",
      "🫒",
      "🥥",
      "🥑",
      "🍆",
      "🥔",
      "🥕",
      "🌽",
      "🌶️",
      "🫑",
      "🥒",
      "🥬",
      "🥦",
      "🧄",
      "🧅",
      "🍄",
      "🥜",
      "🌰",
      "🍞",
      "🥐",
      "🥖",
      "🫓",
      "🥨",
      "🥯",
      "🥞",
      "🧇",
      "🧀",
      "🍖",
      "🍗",
      "🥩",
      "🥓",
      "🍔",
      "🍟",
      "🍕",
      "🌭",
      "🥪",
      "🥙",
      "🧆",
      "🌮",
      "🌯",
      "🫔",
      "🥗",
      "🥘",
      "🫕",
      "🥫",
      "🍝",
      "🍜",
      "🍲",
      "🍛",
      "🍣",
      "🍱",
      "🥟",
      "🦪",
      "🍤",
      "🍙",
      "🍚",
      "🍘",
      "🍥",
      "🥠",
      "🥮",
      "🍢",
      "🍡",
      "🍧",
      "🍨",
      "🍦",
      "🥧",
      "🧁",
      "🍰",
      "🎂",
      "🍮",
      "🍭",
      "🍬",
      "🍫",
      "🍿",
      "🍩",
      "🍪",
      "🥠",
      "🥮",
      "☕",
      "🍵",
      "🫖",
      "🥤",
      "🧋",
      "🧃",
      "🧉",
      "🧊",
      "🥢",
      "🍽️",
      "🍴",
      "🥄",
      "🔪",
      "🏺",
    ],
  },
  Objects: {
    icon: "💡",
    emojis: [
      "📱",
      "💻",
      "🖥️",
      "🖱️",
      "⌨️",
      "🕹️",
      "💾",
      "💿",
      "📀",
      "📼",
      "📷",
      "📹",
      "📞",
      "☎️",
      "📟",
      "📠",
      "📺",
      "📻",
      "🎙️",
      "🧭",
      "⏰",
      "⌛",
      "💡",
      "🔦",
      "🔌",
      "🔋",
      "💰",
      "💵",
      "💴",
      "💶",
      "💷",
      "🪙",
      "💳",
      "💎",
      "⚖️",
      "🔧",
      "🔨",
      "⚒️",
      "⛏️",
      "⚙️",
      "⛓️",
      "🔫",
      "💣",
      "🔪",
      "🗡️",
      "🛡️",
      "🚬",
      "⚰️",
      "🪦",
      "⚱️",
      "🔮",
      "🪄",
      "📿",
      "🧿",
      "💈",
      "🔭",
      "🔬",
      "🚽",
      "🪠",
      "🚿",
      "🛁",
      "🔑",
      "🚪",
      "🪑",
      "🛋️",
      "🛏️",
      "🖼️",
      "🧸",
      "🪅",
      "🎁",
      "🎈",
      "🎉",
      "🎊",
      "🎀",
      "✉️",
      "📦",
      "🏷️",
      "📜",
      "📰",
      "ブック",
      "📑",
      "🔖",
      "🗑️",
      "📁",
      "📂",
      "📅",
      "🗒️",
      "📈",
      "📉",
      "📊",
      "📋",
      "📌",
      "📍",
      "📎",
      "🖇️",
      "📏",
      "📐",
      "✂️",
      "🖊️",
      "🖋️",
      "✒️",
      "🖌️",
      "🖍️",
      "📝",
      "✏️",
      "🔍",
    ],
  },
  Symbols: {
    icon: "🔣",
    emojis: [
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "🤎",
      "💔",
      "❣️",
      "💕",
      "💞",
      "💓",
      "💗",
      "💖",
      "💘",
      "💝",
      "💟",
      "☮️",
      "✝️",
      "☪️",
      "🕉️",
      "☸️",
      "✡️",
      "🔯",
      "🕎",
      "☯️",
      "☦️",
      "🛐",
      "⛎",
      "♈️",
      "♉️",
      "♊️",
      "♋️",
      "♌️",
      "♍️",
      "♎️",
      "♏️",
      "♐️",
      "♑️",
      "♒️",
      "♓️",
      "🆔",
      "⚛️",
      "🉑",
      "☢️",
      "☣️",
      "📴",
      "📳",
      "🈶",
      "🈚️",
      "🈸",
      "🈺",
      "🈷️",
      "✴️",
      "🆚",
      "💮",
      "🉐",
      "㊙️",
      "㊗️",
      "🈴",
      "🈵",
      "🈹",
      "🈲",
      "🅰️",
      "🅱️",
      "🆎",
      "🆑",
      "🅾️",
      "🆘",
      "❌",
      "⭕️",
      "🛑",
      "⛔️",
      "📛",
      "🚫",
      "💯",
      "💢",
      "♨️",
      "🚷",
      "🚯",
      "🚳",
      "🚱",
      "🔞",
      "📵",
      "🚭",
      "❗️",
      "❕",
      "❓",
      "❔",
      "‼️",
      "⁉️",
      "🔅",
      "🔆",
      "〽️",
      "⚠️",
      "🚸",
      "🔱",
      "⚜️",
      "🔰",
      "♻️",
      "✅",
      "🈯️",
      "💹",
      "❇️",
      "✳️",
      "❎",
      "🌐",
      "💠",
      "Ⓜ️",
      "🌀",
      "💤",
      "🏧",
      "🚾",
      "♿️",
      "🅿️",
      "🛗",
      "🈳",
      "🈂️",
      "🛂",
      "🛃",
      "🛄",
      "🛅",
      "🚹",
      "🚺",
      "🚼",
      "⚧",
      "🚻",
      "🚮",
      "🎦",
      "📶",
      "🈁",
      "🔣",
      "ℹ️",
      "🔤",
      "🔡",
      "🔠",
      "🆖",
      "🆗",
      "🆙",
      "🆒",
      "🆕",
      "🆓",
      "0️⃣",
      "1️⃣",
      "2️⃣",
      "3️⃣",
      "4️⃣",
      "5️⃣",
      "6️⃣",
      "7️⃣",
      "8️⃣",
      "9️⃣",
      "🔟",
      "🔢",
      "#️⃣",
      "*️⃣",
      "⏏️",
      "▶️",
      "⏸",
      "⏯",
      "⏹",
      "⏺",
      "⏭",
      "⏮",
      "⏩",
      "⏪",
      "⏫",
      "⏬",
      "◀️",
      "🔼",
      "🔽",
      "➡️",
      "⬅️",
      "⬆️",
      "⬇️",
      "↗️",
      "↘️",
      "↙️",
      "↖️",
      "↕️",
      "↔️",
      "↪️",
      "↩️",
      "⤴️",
      "⤵️",
      "🔀",
      "🔁",
      "🔂",
      "🔄",
      "🔃",
      "🎵",
      "🎶",
      "➕",
      "➖",
      "➗",
      "✖️",
      "♾️",
      "💲",
      "💱",
      "™️",
      "©️",
      "®️",
      "👁️‍🗨️",
      "🔚",
      "🔙",
      "🔛",
      "🔝",
      "🔜",
      "✔️",
      "☑️",
      "🔘",
      "🔴",
      "🟠",
      "🟡",
      "🟢",
      "🔵",
      "🟣",
      "⚫️",
      "⚪️",
      "🟤",
      "🔺",
      "🔻",
      "⬜️",
      "⬛️",
      "🔳",
      "🔲",
      "▪️",
      "▫️",
      "◾️",
      "◽️",
      "◼️",
      "◻️",
      "🟥",
      "🟧",
      "🟨",
      "🟩",
      "🟦",
      "🟪",
      "⬛️",
      "⬜️",
      "🟫",
      "🔶",
      "🔷",
      "🔸",
      "🔹",
      "ʌ",
      "v",
      "<",
      ">",
      "!",
      "!!",
      "?",
      "¿",
      "؟",
      "!",
      "¡",
      "؟",
    ],
  },
  Flags: {
    icon: "🇮🇳",
    emojis: [
      "🇺🇸",
      "🇬🇧",
      "🇨🇦",
      "🇦🇺",
      "🇩🇪",
      "🇫🇷",
      "🇯🇵",
      "🇰🇷",
      "🇨🇳",
      "🇮🇳",
      "🇧🇷",
      "🇷🇺",
      "🇿🇦",
      "🇳🇿",
      "🇲🇽",
      "🇮🇹",
      "🇪🇸",
      "🇳🇴",
      "🇸🇪",
      "🇫🇮",
      "🇩🇰",
      "🇳🇱",
      "🇧🇪",
      "🇨🇭",
      "🇨🇱",
      "🇵🇪",
      "🇦🇷",
      "🇵🇱",
      "🇨🇿",
      "🇭🇺",
      "🇹🇷",
      "🇸🇬",
      "🇮🇩",
      "🇵🇭",
      "🇹🇭",
      "🇻🇳",
      "🇲🇾",
      "🇸🇦",
      "🇦🇪",
      "🇳🇱",
      "🇮🇱",
      "🇮🇷",
      "🇯🇴",
      "🇰🇼",
      "🇱🇧",
      "🇶🇦",
      "🇧🇭",
    ],
  },
};

const useChatScroll = (dep) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [dep]);
  return ref;
};

const FileIcon = () => <svg>...</svg>;

const UtilityWrapper = ({
  replyingTo,
  replyingToUser,
  attachments,
  onRemoveAttachment,
  onCancelReply,
}) => {
  const hasContent = replyingTo || (attachments && attachments.length > 0);
  if (!hasContent) return null;

  return (
    <div className={styles["utility-wrapper"]}>
      {replyingTo && (
        <div className={styles["reply-preview"]}>
          <div className={styles["reply-info"]}>
            <div className={styles["reply-text"]}>
              <span>
                Replying to {replyingToUser ? replyingToUser.name : "user"}
              </span>
              <div>
                {replyingToUser && (
                  <img
                    src={replyingToUser.picture || "/default-avatar.png"}
                    alt={replyingToUser.name}
                    className={styles["reply-user-image"]}
                  />
                )}
                <div dangerouslySetInnerHTML={{ __html: replyingTo.content }} />
              </div>
            </div>
          </div>
          <button onClick={onCancelReply} className={styles["cancel-button"]}>
            &times;
          </button>
        </div>
      )}
      {attachments && attachments.length > 0 && (
        <div className={styles["attachments-preview"]}>
          {attachments.map((file, index) => (
            <div key={index} className={styles["attachment-item"]}>
              <img src={attachment} alt="attachment" />
              <span className={styles["file-name"]}>{file.name}</span>
              <button
                onClick={() => onRemoveAttachment(index)}
                className={styles["remove-button"]}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
UtilityWrapper.propTypes = {
  replyingTo: PropTypes.object,
  replyingToUser: PropTypes.object,
  attachments: PropTypes.array,
  onRemoveAttachment: PropTypes.func.isRequired,
  onCancelReply: PropTypes.func.isRequired,
};

const ChatHeader = ({ room, user, parentRoom }) => {
  if (!room) return null;

  const isDM = room.type === 'private/dm';
  const isChannel = room.type === 'channel';
  const isThread = room.type === 'thread';

  return (
    <div className={styles["message-chatroom-header"]}>
      <div className={styles["chatroom-header-i"]}>
        {isDM && (
          <>
            <img src={user?.picture || "/default-avatar.png"} alt={user?.name || "User"} />
            <div className={styles["chatroom-header-i-text"]}>
              <p>{user?.name || "Unknown User"}</p>
              <p>{user?.role || "Project Member"}</p>
            </div>
          </>
        )}

        {isChannel && (
          <>
            <div className={styles['channel-icon']}><img src={hashtag}/></div>
            <div className={styles["chatroom-header-i-text"]}>
              <p>{room.name}</p>
              <p className={styles.channelDescription}>{room.description || "Channel"}</p>
            </div>
          </>
        )}

        {isThread && (
          <>
            <div className={styles['channel-icon']}><img src={hashtag}/></div>
            <div className={styles["chatroom-header-i-text"]}>
              <p>{room.name}</p>
              <p className={styles.threadParent}>
                In thread of: {parentRoom?.name || "Unknown Channel"}
              </p>
            </div>
          </>
        )}

        {/* Fallback for unknown types */}
        {!isDM && !isChannel && !isThread && (
          <p>{room.name || "Chat"}</p>
        )}
      </div>

      <div className={styles["chatroom-header-i"]}>
        <img src={menu} alt="Menu"/>
      </div>
    </div>
  );
};

ChatHeader.propTypes = {
  room: PropTypes.object.isRequired,
  user: PropTypes.object, // other participant in DM
  parentRoom: PropTypes.object, // for threads to show parent channel
};


const RoomItem = ({ room, otherUser, isActive, onClick }) => {
  return (
    <div
      onClick={onClick}
      key={room._id}
      className={`${styles["rooms-item"]} ${isActive ? styles["active"] : ""}`}
    >
      <p className={styles["room-timestamp"]}>
        {getTimeElapsed(room.lastMessage?.createdAt)}
      </p>
      <div className={styles["rooms-item-info"]}>
        <img
          src={otherUser?.picture || "/default-avatar.png"}
          alt={otherUser?.name}
        />
        <p>{otherUser?.name}</p>
      </div>
      <div className={styles["last-message-wrapper"]}>
        <p
          dangerouslySetInnerHTML={{
            __html: room.lastMessage?.content || "No messages yet",
          }}
        ></p>
      </div>
    </div>
  );
};
RoomItem.propTypes = {
  room: PropTypes.object.isRequired,
  otherUser: PropTypes.object,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

const DMRoomList = ({
  user,
  project,
  dmRooms,
  setActiveRoomId,
  activeRoomId,
  setActiveUser,
  getOtherParticipant,
}) => {
  return (
    <div className={styles["messages-chat-side-wrapper"]}>
      <div className={styles["chat-side-header"]}>
        <div className={styles["chat-side-header-i"]}>
          <p>Messages</p>
        </div>
        <div className={styles["chat-side-header-i"]}>
          <div className={styles["chat-side-header-img-wrapper"]}>
            <img src={search} alt="search" />
          </div>
          <div className={styles["chat-side-header-img-wrapper"]}>
            <img src={edit} alt="edit" />
          </div>
        </div>
      </div>
      <div className={styles["chat-toggle-wrapper"]}>
        <p>Chat Messages</p>
        <p>Channels</p>
        <p>Teams</p>
      </div>
      <div className={styles["rooms-list"]}>
        {dmRooms.map((room) => {
          const otherUser = getOtherParticipant(room);
          return (
            <RoomItem
              key={room._id}
              room={room}
              otherUser={otherUser}
              isActive={room._id === activeRoomId}
              onClick={() => {
                setActiveRoomId(room._id);
                setActiveUser(otherUser);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
DMRoomList.propTypes = {
  user: PropTypes.object,
  project: PropTypes.object,
  dmRooms: PropTypes.array.isRequired,
  setActiveRoomId: PropTypes.func.isRequired,
  activeRoomId: PropTypes.string,
  setActiveUser: PropTypes.func.isRequired,
  getOtherParticipant: PropTypes.func.isRequired,
};


const RoomIcon = ({ roomType, otherUser }) => {
  if (roomType === 'private/dm') {
    return otherUser?.picture ? 
      <img src={otherUser.picture} className={styles.avatarSmall} /> : 
      <div className={styles.fallbackIcon}>👤</div>;
  }
  if (roomType === 'channel') return <div className={styles['sidebar-channel-icon']}><img src={hashtag}/></div>;
  return <div className={styles['thread-icon']}>↳</div>;
};

const SidebarItem = ({ room, otherUser, isActive, onClick, indent  , hasThreads, isExpanded}) => {
 
    return (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={e => (e.key === "Enter" || e.key === " ") && onClick()}
    className={`${styles['side-bar-item']} ${isActive ? styles['activeItem'] : ""}`}
    style={{ 
        padding : `7px 10px`,
        paddingLeft: 10 + indent * 15
    
    }}
  >
    
    <div className={styles['sidebar-item-i']}>
         <RoomIcon roomType={room.type} otherUser={otherUser} />
          <p className={styles['side-item-i-p']}>
            {otherUser ? otherUser.name : room.name}
        </p>
    </div>
    <div className={styles['sidebar-item-i']}>
        {room.unread > 0 && <p className={styles.unreadBadge}>{room.unread}</p>}
             {/* {hasThreads && (
                <span className={styles['expand-icon']}>
                  {isExpanded ? <img src={dropdown}/> : <img style={{
                    transform : 'rotateZ(-90deg)'
                  }} src={dropdown}/>}
                </span>
              )} */}
    </div>
   
  </div>
)
};

SidebarItem.propTypes = {
  room: PropTypes.object.isRequired,
  otherUser: PropTypes.object,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  indent: PropTypes.number,
  hasThreads : PropTypes.bool.isRequired,
  isExpanded : PropTypes.bool.isRequired
};



const Sidebar = ({ user, project, rooms, activeRoomId, setActiveRoomId, setActiveUser }) => {
  const [expandedCategories, setExpandedCategories] = useState({
    dms: true,
    channels: true,
    threads: true,
  });
  const [expandedChannels, setExpandedChannels] = useState({}); // channelId: bool

  const teamMembers = project?.teamMembers || [];

  const dms = useMemo(() => rooms.filter(r => r.type === "private/dm" && r.participants.length === 2), [rooms]);
  const channels = useMemo(() => rooms.filter(r => r.type === "channel"), [rooms]);
  const threads = useMemo(() => rooms.filter(r => r.type === "thread"), [rooms]);

  const threadsByParent = useMemo(() => {
    const map = {};
    threads.forEach(thread => {
      const key = thread.parentRoomId?.toString() || thread.parentRoomId || "__none__";
      if (!map[key]) map[key] = [];
      map[key].push(thread);
    });
    return map;
  }, [threads]);

  const standaloneThreads = threadsByParent["__none__"] || [];

  const getOtherParticipant = useCallback(() => {
    return (room) => {
      if (!room || !user) return null;
      const otherId = room.participants.find(id => id.toString() !== user._id);
      return teamMembers.find(m => m._id.toString() === otherId?.toString());
    };
  }, [user, teamMembers])();

  const toggleCategory = (categoryName) => {
    setExpandedCategories(state => ({
      ...state,
      [categoryName]: !state[categoryName],
    }));
  };

  const toggleChannelExpansion = (channelId) => {
    setExpandedChannels(state => ({
      ...state,
      [channelId]: !state[channelId],
    }));
  };

  const handleRoomSelect = (room) => {
    setActiveRoomId(room._id);
    if (room.type === "private/dm") {
      setActiveUser(getOtherParticipant(room));
    } else {
      setActiveUser(null);
    }
  };

  return (
    <aside className={styles.sidebarWrapper}>
      {/* Header */}
      <div className={styles.sidebarHeader}>
        <div className={styles['sidebar-header-i']}><p>Messages</p></div>
        <div className={styles['sidebar-header-i']}>
          <img src={search}/>
        </div>
      
      </div>

      {/* Search */}
      {/* <div className={styles.searchWrapper}>
        <input type="text" placeholder="Search chats, projects..." className={styles.searchInput} />
        <img src={search} alt="search" className={styles.searchIcon} />
      </div> */}

      {/* Quick Actions */}
      <nav className={styles.quickActions}>
        <div className={styles.actionBtn}><img src={kario_message}/><p>Kairo Assistant </p></div>
        <div className={styles.actionBtn}><img src={drafts}/><p>Drafts</p></div>
        <div className={styles.actionBtn}><img src={saved}/><p>Saved Items</p></div>
        <div className={styles.actionBtn}><img src={mentions}/><p>Mentions</p></div>

        {/* <div className={styles.actionBtn}><p>Inbox</p></div>
        <div className={styles.actionBtn}><p>Direct Messages <span className={styles.unreadBadge}>{dms.length}</span></p></div> */}
      </nav>

      {/* Direct Messages */}
      <section className={`${styles['sidebar-section']} ${!expandedCategories.dms ? styles.sectionCollapsed : ''}`}>
        <div className={styles['section-title']} onClick={() => toggleCategory('dms')}>
         <div><p>Direct Messages </p></div>
         <div className={styles['category-i']}><img src={add}/>{expandedCategories.dms ? <img src={dropdown}/>:  <img style={{transform : "rotateZ(-90deg)"}} src={dropdown}/>}</div>

        </div>
        {expandedCategories.dms && (
          <div className={styles['section-content']}>
            {dms.map(room => (
              <SidebarItem
                key={room._id}
                room={room}
                otherUser={getOtherParticipant(room)}
                isActive={activeRoomId === room._id}
                onClick={() => handleRoomSelect(room)}
              />
            ))}
          </div>
        )}
      </section>

{/* Channels */}
<section className={`${styles['sidebar-section']} ${!expandedCategories.channels ? styles.sectionCollapsed : ''}`}>
  <div
    className={styles['section-title']}
    onClick={() => toggleCategory('channels')}
  >
    <div><p>Channels</p></div>
    <div className={styles['category-i']}>
      <img src={add} />
      {expandedCategories.channels ? <img src={dropdown} /> : <img style={{ transform: 'rotate(-90deg)' }} src={dropdown} />}
    </div>
  </div>
  {expandedCategories.channels && (
    <div className={styles['section-content']}>
      {channels.map(channel => {
        const hasThreads = (threadsByParent[channel._id]?.length ?? 0) > 0;
        const isExpanded = !!expandedChannels[channel._id];
        return (
          <div key={channel._id}>
            <div
              className={`${styles['room-row']} ${isExpanded ? styles['channel-expanded'] : ''}`}
              onClick={() => hasThreads && toggleChannelExpansion(channel._id)}
              role={hasThreads ? "button" : undefined}
              tabIndex={hasThreads ? 0 : undefined}
              onKeyDown={e => hasThreads && (e.key === 'Enter' || e.key === ' ') && toggleChannelExpansion(channel._id)}
              aria-expanded={hasThreads ? isExpanded : undefined}
            >
              <SidebarItem
                room={channel}
                isActive={activeRoomId === channel._id}
                onClick={() => handleRoomSelect(channel)}
                hasThreads = {hasThreads}
                isExpanded={isExpanded}
              />
         
            </div>
            {isExpanded && hasThreads && (
              <div className={styles['thread-list']}>
                {threadsByParent[channel._id].map(thread => (
                  <SidebarItem
                    key={thread._id}
                    room={thread}
                    indent={1}
                    isActive={activeRoomId === thread._id}
                    onClick={() => handleRoomSelect(thread)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  )}
</section>


      {/* Standalone Threads */}
      {standaloneThreads.length > 0 && (
        <section className={`${styles.section} ${!expandedCategories.threads ? styles.sectionCollapsed : ''}`}>
          <div className={styles.sectionTitle} onClick={() => toggleCategory('threads')}>
            Threads {expandedCategories.threads ? '▼' : '▶'}
          </div>
          {expandedCategories.threads && (
            <div className={styles.sectionContent}>
              {standaloneThreads.map(thread => (
                <SidebarItem
                  key={thread._id}
                  room={thread}
                  isActive={activeRoomId === thread._id}
                  onClick={() => handleRoomSelect(thread)}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </aside>
  );
};

Sidebar.propTypes = {
  user: PropTypes.object.isRequired,
  project: PropTypes.object.isRequired,
  rooms: PropTypes.array.isRequired,
  activeRoomId: PropTypes.string,
  setActiveRoomId: PropTypes.func.isRequired,
  setActiveUser: PropTypes.func.isRequired,
};

const QuotedMessage = ({ message, messages }) => {
  const repliedToMsg = messages.find((m) => m._id === message.replyTo);
  if (!repliedToMsg) return null;
  return (
    <div className={styles.quotedMessage}>
      <div
        className={styles.quotedMessageContent}
        dangerouslySetInnerHTML={{ __html: repliedToMsg.content }}
      ></div>
    </div>
  );
};
QuotedMessage.propTypes = {
  message: PropTypes.object.isRequired,
  messages: PropTypes.array.isRequired,
};

// ✅ START: Custom Tiptap Toolbar Component (defined in the same file)
const MenuBar = ({ editor }) => {
  if (!editor) return null;
  return (
    <div className={styles.tiptapMenuBar}>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? styles.isActive : ""}
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? styles.isActive : ""}
      >
        *I*
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive("underline") ? styles.isActive : ""}
      >
        U
      </button>
    </div>
  );
};
// ✅ END: Custom Tiptap Toolbart

const MessageBubble = React.memo(({ msg, fetchSenderInfo, selfUserId, onReply, messages }) => {
  const [sender, setSender] = useState(null);
  const [reactions, setReactions] = useState(msg.reactions || []);
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(Object.keys(EMOJI_CATEGORIES)[0]);
  const isSelf = msg.senderId === selfUserId;

  const emojiButtonRef = useRef(null);
  const pickerRef = useRef(null);
  // Using portal root container from your index.html for emoji picker
  const portalRoot = document.getElementById("emoji-portal");

  const [pickerStyle, setPickerStyle] = useState({ visibility: "hidden", top: 0, left: 0 });

  useEffect(() => {
    const getSender = async () => {
      if (senderInfoCache.has(msg.senderId)) {
        setSender(senderInfoCache.get(msg.senderId));
      } else {
        const data = await fetchSenderInfo(msg.senderId);
        senderInfoCache.set(msg.senderId, data);
        setSender(data);
      }
    };
    getSender();
  }, [msg.senderId, fetchSenderInfo]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target)
      ) {
        setPickerOpen(false);
      }
    };
    if (isPickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPickerOpen]);

  const openPicker = useCallback(() => {
    if (!emojiButtonRef.current) {
      setPickerOpen(true);
      return;
    }
    const rect = emojiButtonRef.current.getBoundingClientRect();
    const pickerWidth = 280; // approximate picker width
    const pickerHeight = 300; // approximate picker height

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const spaceRight = window.innerWidth - rect.left;
    const spaceLeft = rect.right;

    let top, left;

    if (spaceBelow > pickerHeight) {
      top = rect.bottom + window.scrollY;
    } else if (spaceAbove > pickerHeight) {
      top = rect.top - pickerHeight + window.scrollY;
    } else {
      top = Math.max(0, window.innerHeight - pickerHeight) + window.scrollY;
    }

    if (spaceRight > pickerWidth) {
      left = rect.left + window.scrollX;
    } else if (spaceLeft > pickerWidth) {
      left = rect.right - pickerWidth + window.scrollX;
    } else {
      left = window.scrollX;
    }

    setPickerStyle({
      visibility: "visible",
      position: "absolute",
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 9999,
    });
    setPickerOpen(true);
  }, []);

  useEffect(() => {
    if (!isPickerOpen) return;
    const reposition = () => {
      if (emojiButtonRef.current) openPicker();
    };
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [isPickerOpen, openPicker]);

  const handleAddReaction = (emoji) => {
    setReactions((prev) => {
      const existingReaction = prev.find((r) => r.emoji === emoji);
      if (existingReaction) {
        return prev.filter((r) => r.emoji !== emoji);
      } else {
        return [...prev, { emoji: emoji, user: selfUserId }];
      }
    });
    setPickerOpen(false);
  };

  if (!sender) return null;

  // Emoji picker content as a react component for portal rendering
  const emojiPicker = (
    <div
      className={styles["emoji-picker-full"]}
      ref={pickerRef}
      style={pickerStyle}
      role="dialog"
      aria-modal="true"
      aria-label="Emoji picker"
    >
      <div className={styles["emoji-picker-header"]}>
        {Object.entries(EMOJI_CATEGORIES).map(([category, { icon }]) => (
          <button
            key={category}
            title={category}
            className={activeCategory === category ? styles["active-category"] : ""}
            onClick={() => setActiveCategory(category)}
            aria-pressed={activeCategory === category}
          >
            {icon}
          </button>
        ))}
      </div>
      <div className={styles["emoji-picker-body"]} tabIndex={-1}>
        {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
          <span
            key={emoji}
            onClick={() => handleAddReaction(emoji)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleAddReaction(emoji);
            }}
            aria-label={`Add reaction ${emoji}`}
            className={styles["emoji-item"]}
          >
            {emoji}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles["message-item-wrapper"]}>
      <div className={styles["message-item"]}>
        <div className={styles["message-details"]}>
          <div className={styles["message-title-wrapper"]}>
            <img
              src={sender.picture || "/default-avatar.png"}
              alt={sender.name}
              className={styles["message-sender-image"]}
            />
            <p className={styles["message-title-name"]}>{isSelf ? "You" : sender.name}</p>
            <p className={styles["message-title-time"]}>{getTimeElapsed(msg.createdAt)}</p>
          </div>
          {msg.replyTo && <QuotedMessage message={msg} messages={messages} />}
          <div
            className={`${styles["message-content-wrapper"]} ${
              isSelf ? styles["message-content-self"] : ""
            }`}
          >
            <p dangerouslySetInnerHTML={{ __html: msg.content }} />
          </div>
        </div>
        <div className={styles["message-footer"]}>
          {reactions.length > 0 && (
            <div className={styles["reactions-display"]}>
              {reactions.map((r, index) => (
                <div
                  key={index}
                  className={styles["reaction-emoji-wrapper"]}
                  onClick={() => handleAddReaction(r.emoji)}
                >
                  <span className={styles["reaction-emoji"]}>{r.emoji}</span>
                </div>
              ))}
            </div>
          )}
          <div className={styles["message-actions"]}>
            <div
              onClick={openPicker}
              className={styles["action-button"]}
              ref={emojiButtonRef}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openPicker();
              }}
              aria-haspopup="true"
              aria-expanded={isPickerOpen}
              aria-label="Add reaction"
            >
              <img src={reaction} alt="Add Reaction" />
            </div>
            <div
              onClick={() => onReply(msg)}
              className={styles["action-button"]}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onReply(msg);
              }}
              aria-label="Reply to message"
            >
              <img src={replyIcon} alt="Reply" />
              <p>Reply</p>
            </div>
          </div>
        </div>
      </div>
      {isPickerOpen && portalRoot
        ? createPortal(emojiPicker, portalRoot)
        : isPickerOpen && emojiPicker}
    </div>
  );
});

MessageBubble.propTypes = {
  msg: PropTypes.object.isRequired,
  fetchSenderInfo: PropTypes.func.isRequired,
  selfUserId: PropTypes.string,
  onReply: PropTypes.func.isRequired,
  messages: PropTypes.array.isRequired,
};


const ConversationWrapper = ({
  userId,
  roomId,
  messages,
  setMessages,
  project,
  dmRooms,
}) => {
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatFeedRef = useChatScroll(messages);
  const [replyingTo, setReplyingTo] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [replyingToUser, setReplyingToUser] = useState(null);
  const fileInputRef = useRef(null);
  const [_, setForceUpdate] = useState(0); // ✅ Add this new state

  // ✅ START: Tiptap editor setup

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        horizontalRule: false,
        codeBlock: false,
      }),
      Underline,
      Placeholder.configure({
        placeholder: "Write something …",
      }),
    ],
    content: newMessage,

    // This onUpdate is for syncing the content with your React state
    onUpdate: ({ editor }) => {
      setNewMessage(editor.getHTML());
    },

    // ✅ THIS IS THE CRUCIAL FIX
    // This event fires for EVERY change and forces a re-render
    onTransaction: () => {
      setForceUpdate((val) => val + 1);
    },

    editorProps: {
      attributes: {
        class: `ProseMirror ${styles["text-area-message"]}`,
      },

      handleKeyDown: (view, event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          handleSend();
          return true;
        }
        return false;
      },
    },
  });
  // ✅ END: Tiptap editor setup

  const fetchSenderInfo = useCallback(async (senderId) => {
    try {
      const res = await getUserById(senderId);
      return res || { name: "Unknown", picture: "" };
    } catch (err) {
      console.error("Failed to fetch user info:", err);
      return { name: "Unknown", picture: "" };
    }
  }, []);

  useEffect(() => {
    if (replyingTo)
      fetchSenderInfo(replyingTo.senderId).then(setReplyingToUser);
    else setReplyingToUser(null);
  }, [replyingTo, fetchSenderInfo]);

  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    getMessagesByRoomId(roomId, 50, 0)
      .then((res) => setMessages(res || []))
      .catch((err) => console.error("Error loading messages:", err))
      .finally(() => setLoading(false));
  }, [roomId, setMessages]);

  const handleSetReply = (message) => {
    setReplyingTo(message);
    editor?.commands.focus();
  };

  const handleAttachmentClick = () => fileInputRef.current.click();
  const handleFileSelect = (event) =>
    setAttachments((prev) => [...prev, ...Array.from(event.target.files)]);
  const handleRemoveAttachment = (indexToRemove) =>
    setAttachments((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );

  const handleEmojiClick = (event, emojiObject) => {
    editor?.chain().focus().insertContent(emojiObject.emoji).run();
    setShowEmojiPicker(false);
  };

  const handleSend = async () => {
    const content = editor.getHTML();
    const hasText = content.trim().length > 0 && content !== "<p></p>";
    const hasAttachments = attachments.length > 0;
    if (!hasText && !hasAttachments) return;

    const messageData = {
      roomId,
      senderId: userId,
      content,
      type: "text",
      replyTo: replyingTo ? replyingTo._id : null,
      attachments: attachments.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
      })),
    };

    try {
      const res = await sendMessage(messageData);
      if (res) {
        setMessages((prev) => [...prev, res]);
        editor.commands.clearContent(true); // Clear editor content
        setNewMessage(""); // Clear state
        setReplyingTo(null);
        setAttachments([]);
      }
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  return (
    <div className={styles["conversation-wrapper"]}>
      <div className={styles["messages-list"]} ref={chatFeedRef}>
        {loading ? (
          <p>Loading messages...</p>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              msg={msg}
              fetchSenderInfo={fetchSenderInfo}
              selfUserId={userId}
              onReply={handleSetReply}
              messages={messages}
            />
          ))
        )}
      </div>
      <div className={styles["conversation-bottom-wrapper"]}>
        <UtilityWrapper
          replyingTo={replyingTo}
          replyingToUser={replyingToUser}
          attachments={attachments}
          onRemoveAttachment={handleRemoveAttachment}
          onCancelReply={() => setReplyingTo(null)}
        />

        {/* ✅ START: This is your original input area, now with Tiptap */}
        <div className={styles["conversation-input-area"]}>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />

          {/* The Tiptap editor content will be rendered here with your CSS class */}
          <EditorContent editor={editor} />

          <div className={styles["text-action-wrapper"]}>
            <div className={styles["text-action-wrapper-i"]}>
              {/* These buttons now control the Tiptap editor */}

              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                // ✅ Applies 'is-active' class when bold is active
                className={`${styles["text-action-i"]} ${
                  editor?.isActive("bold") ? styles["is-active"] : ""
                }`}
              >
                <img src={bold} alt="bold" />
              </button>

              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                // ✅ Applies 'is-active' class when italic is active
                className={`${styles["text-action-i"]} ${
                  editor?.isActive("italic") ? styles["is-active"] : ""
                }`}
              >
                <img src={italic} alt="italic" />
              </button>

              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                // ✅ Applies 'is-active' class when underline is active
                className={`${styles["text-action-i"]} ${
                  editor?.isActive("underline") ? styles["is-active"] : ""
                }`}
              >
                <img src={underline} alt="underline" />
              </button>

              <div className={styles["emoji-picker-container"]}>
                <div
                  className={styles["text-action-i"]}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <img src={emoji} alt="emoji" />
                </div>
                {showEmojiPicker && (
                  <div className={styles["emoji-picker-popover"]}>
                    <Picker onEmojiClick={handleEmojiClick} />
                  </div>
                )}
              </div>
              <div
                onClick={handleAttachmentClick}
                className={styles["text-action-i"]}
              >
                <img src={attachment} alt="attachment" />
              </div>
              {/* The @mention button can be re-enabled here by adding a Tiptap mention extension */}
            </div>
            <div className={styles["text-action-wrapper-i"]}>
              <div onClick={handleSend} className={styles["send-msg-btn"]}>
                <img src={send} alt="send" />
              </div>
            </div>
          </div>
        </div>
        {/* ✅ END: Input area */}
      </div>
    </div>
  );
};

ConversationWrapper.propTypes = {
  userId: PropTypes.string,
  roomId: PropTypes.string,
  messages: PropTypes.array.isRequired,
  setMessages: PropTypes.func.isRequired,
  project: PropTypes.object,
  dmRooms: PropTypes.array,
};

const Messages = () => {
  const { user, project } = useProjectContext();
  const { emit, on, off } = useSocket("communication");
  const [dmRooms, setDMRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState("68b95c58db8e67f98f8b8245");
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);

  const [rooms, setRooms] = useState([]);
      const [isAppCenterOpen , setAppCenterOpen] = useState(false);
    const [selectedIntegration , setSelectedIntegration] = useState(null);


  useEffect(() => {
    const fetchRooms = async () => {
      if (!user || !project) return;
      try {
        const res = await getUserRoomsByProject("68159219cdb8524689046498", "682261a534dad32c4fb247d4");
        const allRooms = res.rooms || [];
        setRooms(allRooms);
        if (allRooms.length > 0) {
          setActiveRoomId(allRooms[0]._id);
          setActiveUser(null);
        }
      } catch (err) {
        console.error("Failed to fetch rooms", err);
      }
    };
    fetchRooms();
  }, [user, project]);


  useEffect(()=>{
  }, [rooms])
  
  useEffect(() => {
    if (!activeRoomId) return;
    setMessages([]);
    const fetchMessages = async () => {
      try {
        const msgs = await getMessagesByRoomId(activeRoomId, 50, 0);
        setMessages(msgs || []);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };
    fetchMessages();
  }, [activeRoomId]);

  const getOtherParticipant = useCallback(
    (room) => {
      if (!user || !project) return null;
      const otherParticipant = room.participants.find(
        (p) => p.userId !== user._id
      );
      return project.teamMembers.find(
        (member) => member._id === otherParticipant?.userId
      );
    },
    [user, project]
  );

  useEffect(() => {
    if (!user?._id || !project?.teamMembers) return;
    const fetchInitialData = async () => {
      try {
        const res = await getUserRoomsByProject(project._id, user._id);
        const onlyDMs = (res.rooms || []).filter(
          (room) => room.type === "private/dm" && room.participants.length === 2
        );
        setDMRooms(onlyDMs);
        if (onlyDMs.length > 0) {
          const firstRoom = onlyDMs[0];
          setActiveRoomId(firstRoom._id);
          setActiveUser(getOtherParticipant(firstRoom));
        }
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
      }
    };
    fetchInitialData();
  }, [user?._id, project?._id, project?.teamMembers, getOtherParticipant]);

  useEffect(() => {
    if (!user?._id || !activeRoomId) return;
    const handleIncomingMessage = (msg) => {
      if (msg.roomId === activeRoomId) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    on("receivePrivateMessage", handleIncomingMessage);
    return () => off("receivePrivateMessage", handleIncomingMessage);
  }, [user?._id, activeRoomId, on, off]);

  const activeRoomObject = useMemo(() => {
  return rooms.find(room => room._id === activeRoomId) || null;
}, [rooms, activeRoomId]);

const parentRoomObject = useMemo(() => {
  if (!activeRoomObject?.parentRoomId) return null;
  return rooms.find(room => room._id === activeRoomObject.parentRoomId) || null;
}, [rooms, activeRoomObject]);


  return (
    <div className={styles["messages-wrapper"]}>
      <Sidebar
        user={user}
        project={project}
        rooms={rooms}
        activeRoomId={activeRoomId}
        setActiveRoomId={setActiveRoomId}
        setActiveUser={setActiveUser}
      />
      <div className={styles["messages-chatroom-wrapper"]}>
        <div className={styles["message-content-area"]}>
          
          <ChatHeader 
  room={activeRoomObject} 
  user={activeUser} 
  parentRoom={parentRoomObject} 
/>

          
          {activeRoomId && user?._id && project && (
            <ConversationWrapper
              userId={user._id}
              roomId={activeRoomId}
              messages={messages}
              setMessages={setMessages}
              project={project}
              dmRooms={dmRooms}
            />
          )}
        </div>
      </div>

               <div className={styles['dashboard-actionbar-wrapper']}>
                    <SideActionBarTower
                        setAppCenterOpen={setAppCenterOpen}
                        onIntegrationSelect={(integration) => {
                            setSelectedIntegration(integration)
                        }}
                    />
                </div>
    </div>
  );
};

export default Messages;
