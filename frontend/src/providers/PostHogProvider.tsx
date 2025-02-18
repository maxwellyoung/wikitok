import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { ReactNode, useEffect } from "react";

// Initialize PostHog
if (typeof window !== "undefined") {
  posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
    api_host:
      import.meta.env.VITE_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    loaded: (posthog) => {
      if (import.meta.env.DEV) posthog.debug(); // Enable debug mode in development
    },
    person_profiles: "identified_only", // or 'always' to create profiles for anonymous users
  });
}

interface PostHogProviderWrapperProps {
  children: ReactNode;
}

export function PostHogProviderWrapper({
  children,
}: PostHogProviderWrapperProps) {
  useEffect(() => {
    // You can add any additional setup here
    return () => {
      // Cleanup if needed
    };
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
