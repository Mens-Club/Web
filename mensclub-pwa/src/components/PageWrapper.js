// src/components/PageWrapper.js
import { motion } from 'framer-motion';

const transition = {
  duration: 0.1,
  ease: [0.25, 0.8, 0.25, 1],
};

const sharedBackground = '#f8f9fa'; // ✅ 원하는 배경색으로 통일

const variants = {
  initial: {
    opacity: 0,
    y: 30,
    backgroundColor: sharedBackground,
  },
  animate: {
    opacity: 1,
    y: 0,
    backgroundColor: sharedBackground,
  },
  exit: {
    opacity: 0,
    y: -20,
    backgroundColor: sharedBackground,
  },
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
