import { useState, useEffect } from "react";
import { Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { usePlaceContext } from "../PlaceContext";
import { Plus, Minus } from "lucide-react";

function MapController() {
    const map = useMap();
    const { selectedPlaces } = usePlaceContext();

    useEffect(() => {
        if (!map || selectedPlaces.length === 0) return;
        
        const bounds = new google.maps.LatLngBounds();
        let hasValidLocation = false;
        
        selectedPlaces.forEach(p => {
            if (p.location && p.location.lat && p.location.lng) {
                bounds.extend(p.location);
                hasValidLocation = true;
            }
        });

        if (hasValidLocation) {
            map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 350 }); // Right padding for side panel
            if (selectedPlaces.length === 1) {
                map.setZoom(15);
            }
        }
    }, [map, selectedPlaces]);

    return null;
}

function ZoomControls() {
    const map = useMap();

    const handleZoomIn = () => {
        if (!map) return;
        map.setZoom((map.getZoom() || 12) + 1);
    };

    const handleZoomOut = () => {
        if (!map) return;
        map.setZoom((map.getZoom() || 12) - 1);
    };

    return (
        <div className="absolute left-6 bottom-10 flex flex-col gap-2 z-10">
            <button 
                onClick={handleZoomIn}
                className="w-10 h-10 bg-black border-2 border-white text-white flex items-center justify-center hover:bg-primary hover:text-black transition-all active:translate-y-[2px] active:translate-x-[2px] shadow-[4px_4px_0_0_#000] hover:shadow-none"
                title="Zoom In"
            >
                <Plus size={20} />
            </button>
            <button 
                onClick={handleZoomOut}
                className="w-10 h-10 bg-black border-2 border-white text-white flex items-center justify-center hover:bg-primary hover:text-black transition-all active:translate-y-[2px] active:translate-x-[2px] shadow-[4px_4px_0_0_#000] hover:shadow-none"
                title="Zoom Out"
            >
                <Minus size={20} />
            </button>
        </div>
    );
}

export default function MapComponent() {
    const { selectedPlaces, activePlace, setActivePlace } = usePlaceContext();

    return (
            <Map
                mapId="DEMO_MAP_ID"
                defaultCenter={{ lat: -6.2088, lng: 106.8456 }} // Jakarta
                defaultZoom={12}
                disableDefaultUI={true}
                className="w-full h-full grayscale-[50%] contrast-[1.2]"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                colorScheme="DARK"
            >
                <MapController />
                <ZoomControls />
                
                {selectedPlaces.map((place, idx) => {
                    if (!place.location) return null;
                    const isActive = activePlace?.id === place.id;
                    return (
                        <AdvancedMarker 
                            key={place.id || idx} 
                            position={place.location}
                            title={place.displayName || place.name}
                            onClick={() => setActivePlace(place)}
                            zIndex={isActive ? 1000 : 0}
                        >
                            <div className={`
                                w-10 h-10 flex items-center justify-center font-heading text-xl font-bold
                                border-2 border-white cursor-pointer transition-all duration-300
                                ${isActive 
                                    ? 'bg-primary text-black scale-125 shadow-[0_0_20px_#fff] z-50' 
                                    : 'bg-black text-white hover:bg-primary hover:text-black hover:scale-110 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]'}
                            `}>
                                {idx + 1}
                            </div>
                        </AdvancedMarker>
                    );
                })}
            </Map>
    );
}
