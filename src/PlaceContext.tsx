import { createContext, useContext, useState, ReactNode } from "react";

type PlaceContextType = {
  selectedPlaces: any[];
  setSelectedPlaces: (places: any[]) => void;
  activePlace: any | null;
  setActivePlace: (place: any | null) => void;
  favorites: any[];
  toggleFavorite: (place: any) => void;
  isFavorite: (placeId: string) => boolean;
  userReviews: { [placeId: string]: any[] };
  addUserReview: (placeId: string, review: any) => void;
  savedChats: any[];
  saveChat: (messages: any[]) => void;
  deleteChat: (id: string) => void;
};

const PlaceContext = createContext<PlaceContextType | undefined>(undefined);

export function PlaceProvider({ children }: { children: ReactNode }) {
  const [selectedPlaces, setSelectedPlaces] = useState<any[]>([]);
  const [activePlace, setActivePlace] = useState<any | null>(null);
  const [favorites, setFavorites] = useState<any[]>(() => {
    const saved = localStorage.getItem("nongkrong_favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [userReviews, setUserReviews] = useState<{ [placeId: string]: any[] }>(() => {
    const saved = localStorage.getItem("nongkrong_user_reviews");
    return saved ? JSON.parse(saved) : {};
  });
  const [savedChats, setSavedChats] = useState<any[]>(() => {
    const saved = localStorage.getItem("nongkrong_saved_chats");
    return saved ? JSON.parse(saved) : [];
  });

  const saveChat = (messages: any[]) => {
    if (messages.length <= 1) return; // Don't save empty/initial chats
    const id = Date.now().toString();
    const title = messages.find(m => m.role === 'user')?.text.slice(0, 30) + '...' || 'Saved Chat';
    const newChat = { id, title, messages, timestamp: new Date().toISOString() };
    
    setSavedChats(prev => {
      const next = [newChat, ...prev];
      localStorage.setItem("nongkrong_saved_chats", JSON.stringify(next));
      return next;
    });
  };

  const deleteChat = (id: string) => {
    setSavedChats(prev => {
      const next = prev.filter(c => c.id !== id);
      localStorage.setItem("nongkrong_saved_chats", JSON.stringify(next));
      return next;
    });
  };

  const addUserReview = (placeId: string, review: any) => {
    setUserReviews((prev) => {
      const next = { ...prev };
      if (!next[placeId]) next[placeId] = [];
      next[placeId] = [review, ...next[placeId]];
      localStorage.setItem("nongkrong_user_reviews", JSON.stringify(next));
      return next;
    });
  };

  const toggleFavorite = (place: any) => {
    setFavorites((prev) => {
      const isFav = prev.some((p) => p.id === place.id);
      let next;
      if (isFav) {
        next = prev.filter((p) => p.id !== place.id);
      } else {
        next = [...prev, place];
      }
      localStorage.setItem("nongkrong_favorites", JSON.stringify(next));
      return next;
    });
  };

  const isFavorite = (placeId: string) => {
    return favorites.some((p) => p.id === placeId);
  };

  return (
    <PlaceContext.Provider
      value={{ 
        selectedPlaces, 
        setSelectedPlaces, 
        activePlace, 
        setActivePlace,
        favorites,
        toggleFavorite,
        isFavorite,
        userReviews,
        addUserReview,
        savedChats,
        saveChat,
        deleteChat
      }}
    >
      {children}
    </PlaceContext.Provider>
  );
}

export function usePlaceContext() {
  const context = useContext(PlaceContext);
  if (!context) {
    throw new Error("usePlaceContext must be used within a PlaceProvider");
  }
  return context;
}
