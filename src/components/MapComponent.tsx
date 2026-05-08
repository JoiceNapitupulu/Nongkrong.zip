import { useState, useEffect } from "react";
import { Map, AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";
import { usePlaceContext } from "../PlaceContext";

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
                
                {selectedPlaces.map((place, idx) => {
                    if (!place.location) return null;
                    const isActive = activePlace?.id === place.id;
                    return (
                        <AdvancedMarker 
                            key={place.id || idx} 
                            position={place.location}
                            title={place.displayName || place.name}
                            onClick={() => setActivePlace(place)}
                            className="transition-transform hover:scale-110"
                        >
                            <div className={`
                                w-10 h-10 flex items-center justify-center font-heading text-lg
                                border-2 border-white cursor-pointer
                                ${isActive ? 'bg-primary text-black z-10 scale-125' : 'bg-black text-white hover:bg-primary hover:text-black'}
                            `}>
                                {idx + 1}
                            </div>
                        </AdvancedMarker>
                    );
                })}
            </Map>
    );
}
