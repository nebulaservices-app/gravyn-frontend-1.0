import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import styles from "../../components/features/Kairo.module.css";
import kairo from "../../images/logo/kairo.svg";
import close from "../../images/icons/close.svg";
import send from "../../images/icons/send.svg";

export function cleanHtmlWrapper(text = "") {
    return text
        .replace(/^```(?:html|jsx)?\s*/i, "")  // remove leading ```html or ```jsx
        .replace(/```$/g, "")                  // remove trailing ```
        .replace(/^jsx\s*/i, "")               // remove stray "jsx" prefix
        .trim();
}

export const Kairo = ({ user, handleClose }) => {
    const [messages, setMessages] = useState([
        {
            sender: "kairo",
            text: `<div class="${styles['paragraph']}">Hello! I am <strong>Kairo</strong>. How can I assist you today? 🤖</div>`
        }
    ]);
    const [input, setInput] = useState("");
    const bottomRef = useRef(null);
    const picture = user.picture;
    const userId = localStorage.getItem("nuid");

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: "user", text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");

        setMessages(prev => [...prev, { sender: "kairo", text: "💬 Thinking..." }]);

        try {
            const response = await axios.post("http://localhost:5001/api/v1/comm/chat/ai/message", {
                message: input,
                userId
            });

            const data = response.data;
            setMessages(prev => prev.slice(0, -1)); // remove "thinking..."

            let reply = "Okay!";
            if (data?.success) {
                reply = data.message || "✅ Done!";
            } else {
                reply = data?.message || "❗ Something went wrong.";
            }

            setMessages(prev => [...prev, { sender: "kairo", text: reply }]);
        } catch (err) {
            setMessages(prev => prev.slice(0, -1));
            setMessages(prev => [
                ...prev,
                {
                    sender: "kairo",
                    text: "⚠️ Sorry, I had trouble reaching the AI server."
                }
            ]);
        }
    };

    const handleKeyPress = e => {
        if (e.key === "Enter") handleSend();
    };

    return (
        <section className={styles["ai-overlay-wrapper"]}>
            <section className={styles["ai-chatterbox-wrapper-i"]}>
                {/* Header */}
                <div className={styles["ai-chatterbox-header"]}>
                    <div className={styles["chatterbox-header-capsule"]}>
                        <img src={kairo} alt="Kairo" />
                        <div className={styles["chatterbox-text-wrapper"]}>
                            <p>Kairo.ai</p>
                            <p>Nebula Intelligent Agent</p>
                        </div>
                    </div>
                    <img onClick={handleClose} className={styles["closer-button"]} src={close} />
                </div>

                {/* Messages */}
                <div className={styles["ai-chatterbox-conversation-wrapper"]}>
                    <div className={styles["message-parent-wrapper"]}>
                        {messages.map((msg, index) => {

                            console.log("Message returned" , msg.text)
                            return(
                            <div
                                key={index}
                                className={`${styles["message"]} ${styles[msg.sender]}`}
                            >
                                <img
                                    src={msg.sender === "kairo" ? kairo : picture}
                                    alt={msg.sender}
                                />
                                {msg.sender === "kairo" ? (
                                    <div
                                        className={styles["kairo-card"]}
                                        dangerouslySetInnerHTML={{
                                            __html: cleanHtmlWrapper(msg.text)
                                        }}
                                    />
                                ) : (
                                    <p>{msg.text}</p>
                                )}
                            </div>
                        )})}
                        <div ref={bottomRef} />
                    </div>
                </div>

                {/* Footer */}
                <div className={styles["ai-chatterbox-footer"]}>
                    <div className={styles["chatterbox-input-wrapper"]}>
                        <input
                            placeholder="Type your message..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <div className={styles["send-button-wrapper"]} onClick={handleSend}>
                            <img src={send} alt="Send" />
                        </div>
                    </div>
                </div>
            </section>
        </section>
    );
};