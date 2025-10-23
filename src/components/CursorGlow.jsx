import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function CursorGlow() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", updateMousePosition);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  return (
    <motion.div
      className="cursor-glow"
      animate={{
        x: mousePosition.x - 15,
        y: mousePosition.y - 15,
      }}
      transition={{
        type: "spring",
        damping: 30,
        stiffness: 200,
        mass: 0.2
      }}
      style={{
        position: "fixed",
        width: "30px",
        height: "30px",
        background: "radial-gradient(circle, rgba(0, 224, 184, 0.4) 0%, transparent 70%)",
        pointerEvents: "none",
        borderRadius: "50%",
        filter: "blur(15px)",
        zIndex: 9999,
        mixBlendMode: "screen"
      }}
    />
  );
}