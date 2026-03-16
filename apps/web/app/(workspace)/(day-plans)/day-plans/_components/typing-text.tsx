import { useEffect, useState } from "react";
import styles from "./typing-text.module.css";

type Props = {
    text: string;
    speed?: number;
};

export default function TypingWords({ text, speed = 20 }: Props) {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        setDisplayedText("");

        if (!text) return;

        const words = text.split(" ");
        let index = 0;

        const interval = setInterval(() => {
            index++;
            setDisplayedText(words.slice(0, index).join(" "));

            if (index >= words.length) {
                clearInterval(interval);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed]);

    return (
        <p className={styles.text}>
            {displayedText}
        </p>
    );
}
