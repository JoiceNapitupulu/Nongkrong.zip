import { createContext, useContext, useState } from "react";

type PlaceContextType = {
  selectedPlaces: any[];
  setSelectedPlaces: (places: any[]) => void;
  activePlace: any | null;
  setActivePlace: (place: any | null) => void;
};

const PlaceContext = createContext<PlaceContextType | undefined>(undefined);

export function PlaceProvider({ children }: { children: React.ReactNode }) {
  const [selectedPlaces, setSelectedPlaces] = useState<any[]>([]);
  const [activePlace, setActivePlace] = useState<any | null>(null);

  return (
    <PlaceContext.Provider
      value={{ selectedPlaces, setSelectedPlaces, activePlace, setActivePlace }}
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
