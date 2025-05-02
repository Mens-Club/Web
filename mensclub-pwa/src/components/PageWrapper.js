import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom'; // ✅ 추가

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
  const location = useLocation(); // ✅ 현재 경로 가져오기

  // ✅ TopNav를 보여줄 경로
  const showTopNavPaths = ['/main', '/camera', '/fashion', '/my'];
  const shouldShowTopNav = showTopNavPaths.includes(location.pathname);

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
      style={{
        minHeight: '100vh',
        width: '600px',
        overflowX: 'hidden',
        margin: '0 auto',
        marginTop: shouldShowTopNav ? '80px' : '0',  // ✅ TopNav 있으면 60px, 없으면 0
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageWrapper;
