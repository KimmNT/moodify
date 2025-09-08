import { useState, useEffect } from "react";

type Favorite = {
  id: string;
  title: string;
  thumbnail: string;
};

export default function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>(() => {
    const stored = localStorage.getItem("favorites");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (video: Favorite) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === video.id);
      if (exists) {
        return prev.filter((f) => f.id !== video.id);
      } else {
        return [...prev, video];
      }
    });
  };

  const isFavorite = (id: string) => favorites.some((f) => f.id === id);

  return { favorites, toggleFavorite, isFavorite };
}
