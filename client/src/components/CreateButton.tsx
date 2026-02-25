import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Plus,
  X,
  FileText,
  Image as ImageIcon,
  Video,
  HelpCircle,
} from "lucide-react";

const createOptions = [
  { type: "text_post", label: "Texte", icon: FileText, color: "bg-[#0B3C5D]" },
  { type: "image_post", label: "Image", icon: ImageIcon, color: "bg-[#00C896]" },
  { type: "video", label: "Vidéo", icon: Video, color: "bg-[#F5B700]" },
  { type: "quiz", label: "QCM", icon: HelpCircle, color: "bg-[#0B3C5D]" },
];

export function CreateButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
            data-testid="create-overlay"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50" data-testid="create-button-container">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 mb-2"
            >
              {createOptions.map((option, index) => (
                <motion.div
                  key={option.type}
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-sm font-medium text-white bg-black/70 px-3 py-1 rounded-md whitespace-nowrap">
                    {option.label}
                  </span>
                  <Button
                    size="icon"
                    className={`interactive-element hover-elevate ${option.color} text-white rounded-full shadow-lg`}
                    onClick={() => {
                      setIsOpen(false);
                      setLocation(`/create/${option.type}`);
                    }}
                    data-testid={`button-create-${option.type}`}
                  >
                    <option.icon className="h-5 w-5" />
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          className="gradient-stem text-white rounded-full shadow-xl h-14 w-14 flex items-center justify-center"
          onClick={() => setIsOpen(!isOpen)}
          data-testid="button-create-main"
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
          </motion.div>
        </button>
      </div>
    </>
  );
}
