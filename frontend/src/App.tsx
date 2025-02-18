import { useEffect, useRef, useCallback, useState } from "react";
import { WikiCard, WikiArticle } from "./components/WikiCard";
import { Search, X, Download, Menu, Info, Heart } from "lucide-react";
import { Analytics } from "@vercel/analytics/react";
import { LanguageSelector } from "./components/LanguageSelector";
import { useLikedArticles } from "./contexts/LikedArticlesContext";
import { useWikiArticles } from "./hooks/useWikiArticles";
import { motion, AnimatePresence } from "framer-motion";
import { PostHogProviderWrapper } from "./providers/PostHogProvider";
import posthog from "posthog-js";

function App() {
  const [showAbout, setShowAbout] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { articles, loading, fetchArticles } = useWikiArticles();
  const { likedArticles, toggleLike: originalToggleLike } = useLikedArticles();
  const observerTarget = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && !loading) {
        fetchArticles();
      }
    },
    [loading, fetchArticles]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: "100px",
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [handleObserver]);

  useEffect(() => {
    fetchArticles();
  }, []);

  const filteredLikedArticles = likedArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.extract.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    const simplifiedArticles = likedArticles.map((article) => ({
      title: article.title,
      url: article.url,
      extract: article.extract,
      thumbnail: article.thumbnail?.source || null,
    }));

    const dataStr = JSON.stringify(simplifiedArticles, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `wikitok-favorites-${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  // Add PostHog event tracking for article interactions
  const trackArticleInteraction = useCallback(
    (action: string, article: WikiArticle) => {
      posthog.capture(action, {
        article_id: article.pageid,
        article_title: article.title,
        timestamp: new Date().toISOString(),
      });
    },
    []
  );

  // Modify the toggleLike function to include tracking
  const toggleLikeWithTracking = useCallback(
    (article: WikiArticle) => {
      originalToggleLike(article);
      const isLiked = likedArticles.some((a) => a.pageid === article.pageid);
      trackArticleInteraction(
        isLiked ? "article_unliked" : "article_liked",
        article
      );
    },
    [originalToggleLike, likedArticles, trackArticleInteraction]
  );

  return (
    <PostHogProviderWrapper>
      <div className="h-screen w-full bg-black text-white overflow-y-scroll snap-y snap-mandatory">
        {/* Header */}
        <motion.div
          className="fixed top-0 left-0 right-0 z-50"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-transparent">
            <div className="absolute inset-0 backdrop-blur-[2px]" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <motion.button
                onClick={() => window.location.reload()}
                className="flex items-center gap-3 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-lg relative"
                  whileHover={{ rotate: 5 }}
                >
                  <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative">W</span>
                </motion.div>
                <div className="flex flex-col -space-y-1">
                  <span className="text-xl font-bold text-shadow">WikiTok</span>
                  <span className="text-xs text-white/50">
                    Discover Knowledge
                  </span>
                </div>
              </motion.button>

              <div className="flex items-center gap-4">
                <motion.button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2.5 rounded-full hover:bg-white/10 transition-all glass-effect md:hidden relative overflow-hidden group"
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Menu className="w-5 h-5 relative" />
                </motion.button>

                <nav className="hidden md:flex items-center gap-5">
                  <motion.button
                    onClick={() => setShowAbout(!showAbout)}
                    className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-all glass-effect px-3.5 py-2 rounded-full group relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Info className="w-4 h-4 relative group-hover:scale-110 transition-transform" />
                    <span className="relative font-medium">About</span>
                  </motion.button>

                  <motion.button
                    onClick={() => setShowLikes(!showLikes)}
                    className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-all glass-effect px-3.5 py-2 rounded-full group relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Heart className="w-4 h-4 relative group-hover:scale-110 transition-transform" />
                    <span className="relative font-medium">Likes</span>
                  </motion.button>

                  <div className="relative">
                    <div className="absolute -inset-[1px] bg-gradient-to-br from-white/20 to-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <LanguageSelector />
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              className="fixed inset-0 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={() => setShowMenu(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <motion.div
                className="absolute right-0 top-0 bottom-0 w-[280px] bg-gray-900/50 backdrop-blur-2xl p-6 glass-effect border-l border-white/[0.08]"
                initial={{ x: "100%", opacity: 0.5 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{
                  type: "spring",
                  damping: 30,
                  stiffness: 300,
                  opacity: { duration: 0.2 },
                }}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <motion.div
                      className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold"
                      whileHover={{ rotate: 5 }}
                    >
                      W
                    </motion.div>
                    <motion.button
                      onClick={() => setShowMenu(false)}
                      className="p-2 rounded-full hover:bg-white/10 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>

                  <nav className="flex-1 -mx-2">
                    <motion.div
                      className="space-y-1"
                      initial="closed"
                      animate="open"
                      variants={{
                        open: {
                          transition: {
                            staggerChildren: 0.07,
                            delayChildren: 0.1,
                          },
                        },
                        closed: {
                          transition: {
                            staggerChildren: 0.05,
                            staggerDirection: -1,
                          },
                        },
                      }}
                    >
                      <motion.button
                        onClick={() => {
                          setShowAbout(true);
                          setShowMenu(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white group"
                        variants={{
                          open: { x: 0, opacity: 1 },
                          closed: { x: 50, opacity: 0 },
                        }}
                        whileHover={{ x: 8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Info className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">About</span>
                      </motion.button>

                      <motion.button
                        onClick={() => {
                          setShowLikes(true);
                          setShowMenu(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white group"
                        variants={{
                          open: { x: 0, opacity: 1 },
                          closed: { x: 50, opacity: 0 },
                        }}
                        whileHover={{ x: 8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Likes</span>
                      </motion.button>

                      <motion.div
                        className="px-4 py-3"
                        variants={{
                          open: { x: 0, opacity: 1 },
                          closed: { x: 50, opacity: 0 },
                        }}
                      >
                        <LanguageSelector />
                      </motion.div>
                    </motion.div>
                  </nav>

                  <motion.div
                    className="pt-4 mt-4 border-t border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <a
                      href="https://dev.maxwellyoung.info"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-2 text-sm text-white/50 hover:text-white/70 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                        <span className="text-xs font-medium">M</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white/70">
                          Maxwell Young
                        </p>
                        <p className="text-xs">Design Engineer</p>
                      </div>
                    </a>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* About Modal */}
        <AnimatePresence>
          {showAbout && (
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAbout(false)}
            >
              <motion.div
                className="bg-gray-900/40 backdrop-blur-xl p-8 rounded-2xl max-w-lg relative glass-effect border border-white/[0.08]"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
                <motion.button
                  onClick={() => setShowAbout(false)}
                  className="absolute top-4 right-4 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>

                <div className="flex flex-col gap-6">
                  <div>
                    <motion.div
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg"
                      whileHover={{ rotate: 5 }}
                    >
                      W
                    </motion.div>
                    <h2 className="text-2xl font-bold mb-2">About WikiTok</h2>
                    <p className="text-white/90 leading-relaxed">
                      A TikTok-style interface for exploring random Wikipedia
                      articles. Swipe or scroll to discover fascinating
                      knowledge from around the world.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        Features
                      </h3>
                      <ul className="text-white/80 space-y-2">
                        <li className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-white/40" />
                          Vertical scrolling feed of random articles
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-white/40" />
                          Support for multiple languages
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-white/40" />
                          Save and export your favorite articles
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-white/40" />
                          Beautiful, responsive design
                        </li>
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <div className="flex flex-col gap-4">
                        <div className="space-y-1">
                          <p className="text-white/70">
                            Originally by{" "}
                            <a
                              href="https://x.com/Aizkmusic"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:text-blue-400 transition-colors"
                            >
                              @Aizkmusic
                            </a>
                          </p>
                          <p className="text-white/70">
                            Enhanced by{" "}
                            <a
                              href="https://dev.maxwellyoung.info"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:text-blue-400 transition-colors group"
                            >
                              Maxwell Young
                              <span className="text-white/50 text-sm ml-1 group-hover:text-blue-400/70">
                                Design Engineer
                              </span>
                            </a>
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <motion.a
                            href="https://github.com/maxwellyoung/wikitok"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <svg
                              className="w-5 h-5"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            <span className="text-sm">View on GitHub</span>
                          </motion.a>
                          <motion.a
                            href="https://dev.maxwellyoung.info"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <span className="text-sm">More Projects</span>
                          </motion.a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Likes Modal */}
        <AnimatePresence>
          {showLikes && (
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gray-900 p-8 rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col relative"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.button
                  onClick={() => setShowLikes(false)}
                  className="absolute top-4 right-4 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>

                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Liked Articles</h2>
                  {likedArticles.length > 0 && (
                    <motion.button
                      onClick={handleExport}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </motion.button>
                  )}
                </div>

                <div className="relative mb-6">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search liked articles..."
                    className="w-full bg-white/5 text-white px-4 py-3 pl-11 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                  <Search className="w-5 h-5 text-white/50 absolute left-4 top-1/2 transform -translate-y-1/2" />
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 pr-4 -mr-4">
                  <AnimatePresence>
                    {filteredLikedArticles.length === 0 ? (
                      <motion.p
                        className="text-white/70 text-center py-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {searchQuery
                          ? "No matches found."
                          : "No liked articles yet."}
                      </motion.p>
                    ) : (
                      <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {filteredLikedArticles.map((article) => (
                          <motion.div
                            key={`${article.pageid}-${Date.now()}`}
                            className="flex gap-4 items-start group p-4 rounded-xl hover:bg-white/5 transition-colors"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            layout
                          >
                            {article.thumbnail && (
                              <img
                                src={article.thumbnail.source}
                                alt={article.title}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-4">
                                <a
                                  href={article.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-bold hover:text-blue-400 transition-colors truncate"
                                >
                                  {article.title}
                                </a>
                                <motion.button
                                  onClick={() =>
                                    toggleLikeWithTracking(article)
                                  }
                                  className="text-white/50 hover:text-white/90 p-2 rounded-full hover:bg-white/10 md:opacity-0 md:group-hover:opacity-100 transition-all"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  aria-label="Remove from likes"
                                >
                                  <X className="w-4 h-4" />
                                </motion.button>
                              </div>
                              <p className="text-sm text-white/70 line-clamp-2 mt-1">
                                {article.extract}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="pt-16">
          {articles.map((article) => (
            <WikiCard key={article.pageid} article={article} />
          ))}
          <div ref={observerTarget} className="h-10 -mt-1" />
        </div>

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div
              className="fixed inset-0 z-30 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              <motion.div
                className="relative flex flex-col items-center gap-8"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="relative">
                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl flex items-center justify-center"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <motion.div
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg flex items-center justify-center text-white text-2xl font-bold"
                      animate={{
                        rotate: [0, -5, 0],
                        scale: [1, 0.95, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      W
                    </motion.div>
                  </motion.div>
                  <div className="absolute -inset-4">
                    <div className="w-24 h-24 rounded-[2rem] loading-pulse opacity-50" />
                  </div>
                </div>

                <motion.div
                  className="flex flex-col items-center gap-3 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="relative">
                    <motion.div
                      className="h-1 w-32 rounded-full overflow-hidden bg-white/5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.div
                        className="h-full w-1/3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                        animate={{
                          x: ["0%", "200%"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </motion.div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-medium text-white/90">
                      Loading more articles...
                    </p>
                    <p className="text-sm text-white/50">
                      Discovering fascinating knowledge
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Analytics />
      </div>
    </PostHogProviderWrapper>
  );
}

export default App;
