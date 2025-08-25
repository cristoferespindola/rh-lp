import Logo from "../svg/Logo";
import { X } from "lucide-react";
import { motion } from "framer-motion";

export const ACTIONS = [
  { id: "rsvp", label: "RSVP", href: "https://rhparisevent.com" },
  { id: "book", label: "BOOK A TABLE", href: "mailto:RHParisOpeningParty@rh.com?subject=Reserve%20a%20Table%20at%20Le%20Jardin%20or%20Le%20Petit%20RH&body=Please%20request%20a%20table%20for%20a%20party%20of%20two%20or%20four%20beginning%20at%207pm%20until%2011pm.%0A%0AReservations%20are%20exclusively%20available%20for%20guests%20invited%20to%20the%20unveiling%20of%20RH%20Paris%20on%204%20September" },
  { id: "cancel-plans", label: "CANCEL OTHER PLANS", href: "#" },
];


interface VideoActionsProps {
  onClose?: () => void;
}

export default function VideoActions({ onClose }: VideoActionsProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const logoVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.8
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-black flex flex-col items-center justify-around text-white p-8 relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {onClose && (
        <motion.button 
          className="absolute top-4 right-4 bg-black/60 text-white border-0 p-3 rounded-lg cursor-pointer transition-colors hover:bg-black/80"
          onClick={onClose}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <X className="w-5 h-5" />
        </motion.button>
      )}
      
      <motion.div 
        className="flex flex-col items-center justify-center gap-8"
        variants={containerVariants}
      >
        {ACTIONS.map((action) => (
          <motion.a
            href={action.href}
            key={action.id}
            className="text-white flex flex-col items-center justify-center hover:opacity-80 transition-opacity"
            target={action.href.startsWith('http') ? '_blank' : '_self'}
            rel={action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-2xl" style={{
              fontFamily: "RH Sans Serif",
              fontSize: "clamp(1.5rem, 0.6964rem + 1.6071vw, 2.625rem)",
              fontStyle: "normal",
              fontWeight: "400",
              lineHeight: "1.2",
              letterSpacing: "0.44px",
              textTransform: "uppercase",
            }}>{action.label}</span>
            <span className="text-lg" style={{
              fontFamily: "RH Sans",
              fontSize: "clamp(0.75rem, 0.5714rem + 0.3571vw, 1rem)",
              fontStyle: "normal",
              fontWeight: "600",
              lineHeight: "1.2",
              letterSpacing: "0.44px",
              textTransform: "uppercase",
              marginTop: "8px",
            }}>Click here</span>
          </motion.a>
        ))}
      </motion.div>
      
      <motion.div 
        variants={logoVariants}
      >
        <Logo style={{
          width: "clamp(3.75rem, 1.0714rem + 5.3571vw, 7.5rem)",
          height: "auto",
        }} />
      </motion.div>
    </motion.div>
  );
}
