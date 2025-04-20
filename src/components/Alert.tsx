import { AnimatePresence, motion } from "framer-motion";

const Alert = ({
  showAlert,
  alertData,
  style,
}: {
  showAlert: boolean;
  alertData: string;
  style: string;
}) => {
  return (
    <AnimatePresence>
      {showAlert && (
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.5 }}
          role="alert"
          className={`fixed top-0 left-0 w-full z-50`}
        >
          <div
            className={`alert ${style} w-[90%] md:w-[75%] mx-auto mt-4 rounded-lg shadow-md`}
          >
            <span>{alertData}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert;
