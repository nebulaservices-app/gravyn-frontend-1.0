import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Picker from 'emoji-picker-react';

import kairo from "../../../images/logo/kairo.svg";
import close from "../../../images/icons/close.svg";
import attachmentIcon from "../../../images/icons/attachment.svg";
import send from "../../../images/icons/send.svg";
import bold from "../../../images/icons/bold.svg";
import italic from "../../../images/icons/italic.svg";
import underlineIcon from "../../../images/icons/underline.svg";
import emoji from "../../../images/icons/emoji1.svg";

import styles from "./kairo.style.module.css";

const getMessagesByRoomId = async (roomId, limit, offset) => [];

export const KairoInterface = ({ user, handleClose, roomId, setKairoVisible }) => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const bottomRef = useRef(null);
    const picture = user?.picture || '';
    const userId = localStorage.getItem("nuid");

    // --- TIPTAP EDITOR ---
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
                placeholder: "Type your message...",
            }),
        ],
        content: '',
        editorProps: {
            attributes: { class: `ProseMirror ${styles["text-area-message"]}` },
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

    // --- AUTO SCROLL ---
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // --- LOAD MESSAGES ---
    useEffect(() => {
        if (!roomId) return;
        setLoading(true);
        getMessagesByRoomId(roomId, 50, 0)
            .then((res) => setMessages(res || []))
            .catch((err) => console.error("Error loading messages:", err))
            .finally(() => setLoading(false));
    }, [roomId]);

    // --- TYPING ANIMATION (DYNAMIC SPEED) ---
    const simulateTyping = (text) => {
        return new Promise((resolve) => {
            if (!text) return resolve();

            let index = 0;

            // Dynamic typing speed: faster for longer text
            const minSpeed = 2; // fastest typing (ms per char)
            const maxSpeed = 10; // slowest typing
            const lengthFactor = Math.min(text.length / 100, 1); // cap scaling
            const typingSpeed = Math.max(maxSpeed - lengthFactor * (maxSpeed - minSpeed), minSpeed);

            const typedMessage = { sender: 'kairo', text: '' };
            setMessages((prev) => [...prev, typedMessage]);

            const typeNext = () => {
                if (index >= text.length) return resolve();
                index++;

                setMessages((prev) => {
                    const updated = [...prev];
                    const lastMsg = { ...updated[updated.length - 1] };
                    lastMsg.text = text.slice(0, index);
                    updated[updated.length - 1] = lastMsg;
                    return updated;
                });

                bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

                // Add natural randomness
                const jitter = Math.random() * 15;
                setTimeout(typeNext, typingSpeed + jitter);
            };

            typeNext();
        });
    };

    // --- HANDLE SEND ---
    const handleSend = async () => {
        if (isSending || !editor) return;

        const messageText = editor.getHTML();
        const hasText = editor.getText().trim().length > 0;
        if (!hasText) return;

        setIsSending(true);
        setIsThinking(true);

        const userMessage = { sender: 'user', text: messageText };
        setMessages((prev) => [...prev, userMessage]);
        editor.commands.clearContent();

        try {
            const response = await axios.post('http://localhost:5001/api/v1/comm/chat/ai/message', {
                message: userMessage.text,
                userId,
            });

            const data = response.data;
            let replyText = "Something went wrong.";

            if (data?.success) {
                switch (data.type) {
                    case 'fallback':
                        replyText = data.message || "I'm not sure how to help with that.";
                        break;
                    case 'ask-required':
                        replyText = `I need a few more details: ${data.missingFields?.join(', ')}`;
                        break;
                    case 'intent-handled':
                        replyText = data.message || "✅ Done!";
                        break;
                    default:
                        replyText = data.message || "Understood.";
                }
            } else {
                replyText = data?.message || "There was an issue with the AI response.";
            }

            setIsThinking(false);
            await simulateTyping(replyText);
        } catch (err) {
            console.error("API Error:", err);
            setIsThinking(false);
            await simulateTyping("Sorry, I had trouble reaching the AI server.");
        } finally {
            setIsSending(false);
        }
    };

    const handleEmojiClick = (emojiObject) => {
        editor?.chain().focus().insertContent(emojiObject.emoji).run();
        setShowEmojiPicker(false);
    };

    if (!editor) return null;

    return (
        <section className={styles['ai-overlay-wrapper']}>
            <section className={styles['ai-chatterbox-wrapper-i']}>
                {/* Header */}
                <div className={styles['ai-chatterbox-header']}>
                    <div className={styles['chatterbox-header-capsule']}>
                        <img src={kairo} alt="Kairo Logo" />
                        <div className={styles['chatterbox-text-wrapper']}>
                            <p>Kairo.ai</p>
                            <p>Gravyn Intelligent Agent</p>
                        </div>
                    </div>
                    <img onClick={() => setKairoVisible(false)} className={styles['closer-button']} src={close} alt="Close" />
                </div>

                {/* Conversation */}
                <div className={styles['ai-chatterbox-conversation-wrapper']}>
                    {isLoading ? <p>Loading messages...</p> : (
                        <div className={styles['message-parent-wrapper']}>
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`${styles['message-parent']} ${styles[msg.sender]} ${msg.sender === "kairo"
                                        ? styles['message-parent-kairo']
                                        : styles['message-parent-user']
                                        }`}
                                >
                                    <div className={styles['message-right']}>
                                        <div className={styles['message-sender-wrapper']}>
                                            {msg.sender !== "kairo" && (
                                                <img
                                                    src={msg.sender === "kairo" ? kairo : picture}
                                                    alt={`${msg.sender} avatar`}
                                                />
                                            )}
                                            <p>{msg.sender === "kairo" ? "Kairo.ai" : `${user.name}`}</p>
                                        </div>
                                        <div className={styles['message-wrapper']}>
                                            <div
                                                className={styles['message']}
                                                dangerouslySetInnerHTML={{ __html: msg.text }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isThinking && (
                                <div
                                    className={`${styles['message-parent']} ${styles['kairo']} ${styles['message-parent-kairo']}`}
                                >
                                    <div className={styles['message-right']}>
                                        <div className={styles['message-sender-wrapper']}>
                                            <p>Kairo.ai</p>
                                        </div>
                                        <div className={styles['message-wrapper-thinking']}>
                                            <div className={styles['thinking-bubbles']}>
                                                <div className={styles['thinking-bubble']}></div>
                                                <div className={styles['thinking-bubble']}></div>
                                                <div className={styles['thinking-bubble']}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={styles['ai-chatterbox-footer']}>
                    <div className={styles["conversation-input-area"]}>
                        <EditorContent editor={editor} />
                        <div className={styles["text-action-wrapper"]}>
                            <div className={styles["text-action-wrapper-i"]}>
                                <button
                                    type="button"
                                    onClick={() => editor.chain().focus().toggleBold().run()}
                                    className={`${styles["text-action-i"]} ${editor.isActive("bold") ? styles["is-active"] : ""}`}
                                >
                                    <img src={bold} alt="Bold" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => editor.chain().focus().toggleItalic().run()}
                                    className={`${styles["text-action-i"]} ${editor.isActive("italic") ? styles["is-active"] : ""}`}
                                >
                                    <img src={italic} alt="Italic" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                                    className={`${styles["text-action-i"]} ${editor.isActive("underline") ? styles["is-active"] : ""}`}
                                >
                                    <img src={underlineIcon} alt="Underline" />
                                </button>
                                <div className={styles["text-action-i"]}>
                                    <img src={attachmentIcon} alt="Attachment" />
                                </div>
                            </div>
                            <div className={styles["text-action-wrapper-i"]}>
                                <button onClick={handleSend} disabled={isSending} className={styles["send-msg-btn"]}>
                                    <img src={send} alt="Send" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </section>
    );
};
