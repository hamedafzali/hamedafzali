import { useState, useEffect } from "react";

export function useTypingAnimation(
  strings: string[],
  charDelay = 100,
  pauseAfter = 2000,
): { text: string; isTyping: boolean } {
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (strings.length === 0) {
      setText("");
      setIsTyping(false);
      return;
    }

    const current = strings[index % strings.length];
    let charIndex = 0;
    setIsTyping(true);

    const interval = setInterval(() => {
      if (charIndex <= current.length) {
        setText(current.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        setTimeout(() => {
          setText("");
          setIndex((prev) => (prev + 1) % strings.length);
        }, pauseAfter);
      }
    }, charDelay);

    return () => {
      clearInterval(interval);
      setIsTyping(false);
    };
  }, [index, strings, charDelay, pauseAfter]);

  return { text, isTyping };
}
