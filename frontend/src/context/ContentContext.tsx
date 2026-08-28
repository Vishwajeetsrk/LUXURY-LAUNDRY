"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { API_URL } from "@/lib/api";

interface ContentItem {
  key: string;
  value: string;
  type: string;
}

interface ContentContextType {
  contentMap: Record<string, string>;
  isLoading: boolean;
  getContent: (key: string, fallback: string) => string;
}

const defaultContent: ContentItem[] = [
  { key: "hero_title", value: "Premium Laundry Experience", type: "text" },
  { key: "hero_subtitle", value: "Experience premium laundry and dry cleaning services with free doorstep pickup and delivery.", type: "text" },
  { key: "hero_cta", value: "Explore Services", type: "text" },
  { key: "cards_title", value: "Your Journey Begins Here", type: "text" },
  { key: "cards_subtitle", value: "We make every moment count with solutions designed just for you.", type: "text" },
  { key: "banner_title", value: "Fresh Clothes. Premium Care. Doorstep Delivery.", type: "text" },
  { key: "banner_subtitle", value: "Experience a smarter laundry service with expert fabric care, free pickup, and fast delivery.", type: "text" },
  { key: "trust_title", value: "Trusted By Thousands Of Happy Customers", type: "text" },
  { key: "stats_title", value: "Our Laundry Success Journey", type: "text" },
  { key: "footer_about", value: "LuxWash Premium Laundry provides expert fabric care with modern cleaning technology, doorstep pickup, and fast delivery service.", type: "text" },
];

const defaultContentMap = defaultContent.reduce((acc, item) => {
  acc[item.key] = item.value;
  return acc;
}, {} as Record<string, string>);

const ContentContext = createContext<ContentContextType>({
  contentMap: defaultContentMap,
  isLoading: true,
  getContent: (key, fallback) => defaultContentMap[key] || fallback,
});

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [contentMap, setContentMap] = useState<Record<string, string>>(defaultContentMap);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stopLoadingSafely = () => {
      Promise.resolve().then(() => setIsLoading(false));
    };

    if (!API_URL) {
      stopLoadingSafely();
      return;
    }

    const contentEndpoint = `${API_URL}/api/content`;

    const abortController = new AbortController();

    fetch(contentEndpoint, { signal: abortController.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Content request failed with status ${res.status}`);
        }
        return res.json();
      })
      .then((data: ContentItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const map = data.reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
          }, {} as Record<string, string>);

          // Merge fetched data over default data.
          setContentMap({ ...defaultContentMap, ...map });
        }
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (process.env.NODE_ENV !== "production") {
          console.warn("Content API unavailable, using default content.", err);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      abortController.abort();
    };
  }, []);

  const getContent = (key: string, fallback: string) => {
    return contentMap[key] || fallback;
  };

  return (
    <ContentContext.Provider value={{ contentMap, isLoading, getContent }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  return useContext(ContentContext);
};
