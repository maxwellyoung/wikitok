import { Share2, Heart, ArrowRight, ExternalLink } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLikedArticles } from "../contexts/LikedArticlesContext";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

export interface WikiArticle {
  title: string;
  extract: string;
  pageid: number;
  url: string;
  thumbnail: {
    source: string;
    width: number;
    height: number;
  };
}

interface WikiCardProps {
  article: WikiArticle;
}

export function WikiCard({ article }: WikiCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { toggleLike, isLiked } = useLikedArticles();
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse gradient effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x);
    mouseY.set(y);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("image-fade-in");
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.extract || "",
          url: article.url,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      await navigator.clipboard.writeText(article.url);
      const notification = document.createElement("div");
      notification.className =
        "fixed bottom-4 left-1/2 transform -translate-x-1/2 glass-effect px-4 py-2 rounded-full text-sm text-white/90 slide-up-fade-in";
      notification.textContent = "Link copied to clipboard";
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 2000);
    }
  };

  const background = useMotionTemplate`radial-gradient(
    600px circle at ${mouseX}px ${mouseY}px,
    rgba(255,255,255,0.06),
    transparent 40%
  )`;

  return (
    <motion.div
      ref={cardRef}
      className="h-screen w-full flex items-center justify-center snap-start relative gesture-area"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background }}
      />
      <div className="h-full w-full relative overflow-hidden">
        {article.thumbnail ? (
          <motion.div
            className="absolute inset-0"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          >
            <img
              loading="lazy"
              src={article.thumbnail.source}
              alt={article.title}
              className={`w-full h-full object-cover transition-opacity duration-700 bg-black ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                console.error("Image failed to load:", e);
                setImageLoaded(true);
              }}
            />
            {!imageLoaded && (
              <motion.div
                className="absolute inset-0 bg-gray-900"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/90" />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900" />
        )}

        <motion.div
          className="absolute inset-x-0 bottom-0 p-6 md:p-8 text-white z-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <motion.a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-block"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-shadow-lg tracking-tight text-balance mb-1">
                    {article.title}
                  </h2>
                  <motion.div
                    className="flex items-center gap-1.5 text-white/50 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>wikipedia.org</span>
                  </motion.div>
                </motion.a>
              </div>

              <div className="flex gap-2 md:gap-3 flex-shrink-0">
                <motion.button
                  onClick={() => toggleLike(article)}
                  className={`p-2.5 md:p-3 rounded-full backdrop-blur-sm transition-all hover-lift glass-effect ${
                    isLiked(article.pageid)
                      ? "bg-red-500/90 hover:bg-red-600/90"
                      : "hover:bg-white/10"
                  }`}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Like article"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isLiked(article.pageid) ? "fill-white" : ""
                    }`}
                  />
                </motion.button>
                <motion.button
                  onClick={handleShare}
                  className="p-2.5 md:p-3 rounded-full backdrop-blur-sm hover:bg-white/10 transition-all hover-lift glass-effect"
                  whileTap={{ scale: 0.95 }}
                  aria-label="Share article"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            <motion.p
              className="text-base md:text-lg text-white/90 mb-5 leading-relaxed text-balance line-clamp-3 md:line-clamp-4 text-shadow max-w-3xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {article.extract}
            </motion.p>

            <motion.a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white group transition-colors text-shadow hover-lift glass-effect px-4 py-2 rounded-full text-sm"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="font-medium">Read full article</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
