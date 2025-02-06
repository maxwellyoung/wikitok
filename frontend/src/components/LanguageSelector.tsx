import { useState, useEffect, useRef } from "react";
import { LANGUAGES } from "../languages";
import { useLocalization } from "../hooks/useLocalization";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronDown } from "lucide-react";

export function LanguageSelector() {
  const [showDropdown, setShowDropdown] = useState(false);
  const { currentLanguage, setLanguage } = useLocalization();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-flex items-center" ref={dropdownRef}>
      <motion.button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded-full hover:bg-white/10"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Globe className="w-4 h-4" />
        <span>{currentLanguage.name}</span>
        <motion.div
          animate={{ rotate: showDropdown ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute overflow-hidden right-0 top-full mt-2 bg-gray-900/90 backdrop-blur-lg rounded-xl border border-white/10 shadow-xl"
          >
            <motion.div
              className="py-2 max-h-[300px] overflow-y-auto overflow-x-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {LANGUAGES.map((language) => (
                <motion.button
                  key={language.id}
                  onClick={() => {
                    setLanguage(language.id);
                    setShowDropdown(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition-colors ${
                    language.id === currentLanguage.id ? "bg-white/5" : ""
                  }`}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      className="w-full h-full object-cover"
                      src={language.flag}
                      alt={language.name}
                    />
                  </div>
                  <span className="text-sm whitespace-nowrap">
                    {language.name}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
