// src/components/PageWrapper.js
import { motion } from 'framer-motion';

const transition = {
  duration: 0.1,
  ease: [0.25, 0.8, 0.25, 1], // 자연스러운 easeInOut
};

const variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
      style={{
        minHeight: '100vh',
        width: '100%',
        overflowX: 'hidden',
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageWrapper;
