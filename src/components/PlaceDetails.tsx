import { usePlaceContext } from "../PlaceContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Navigation, Image as ImageIcon, Star, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PlaceDetails() {
  const { activePlace, setActivePlace, selectedPlaces } = usePlaceContext();

  if (!activePlace) return null;

  const handleDirections = () => {
    if (activePlace.location) {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${activePlace.location.lat},${activePlace.location.lng}&destination_place_id=${activePlace.id}`, "_blank");
    }
  };

  const currentIndex = selectedPlaces.findIndex((p: any) => p.id === activePlace.id);
  
  const handleNext = () => {
     if (currentIndex < selectedPlaces.length - 1) {
         setActivePlace(selectedPlaces[currentIndex + 1]);
     } else {
         setActivePlace(selectedPlaces[0]); // loop back
     }
  };

  const handlePrev = () => {
     if (currentIndex > 0) {
         setActivePlace(selectedPlaces[currentIndex - 1]);
     } else {
         setActivePlace(selectedPlaces[selectedPlaces.length - 1]); // loop back
     }
  };

  return (
    <Card className="absolute bottom-6 right-6 w-80 lg:w-96 bg-card border-4 border-white rounded-none shadow-[8px_8px_0_0_#fff] z-10 flex flex-col max-h-[80vh] sm:max-h-[85vh] pointer-events-auto">
      <div className="flex justify-between items-start p-4 border-b-2 border-white bg-background shrink-0">
         <div className="pr-2">
            <h3 className="font-heading uppercase text-xl font-bold leading-tight">{activePlace.displayName || activePlace.name}</h3>
            <p className="font-mono text-xs text-muted-foreground mt-1 line-clamp-2">{activePlace.address}</p>
         </div>
         <Button variant="ghost" size="icon" className="h-6 w-6 rounded-none hover:bg-white hover:text-black border border-transparent hover:border-white shrink-0" onClick={() => setActivePlace(null)}>
            <X className="w-4 h-4" />
         </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
         {activePlace.photoUri ? (
             <div className="w-full h-40 border-2 border-white relative overflow-hidden bg-muted shrink-0">
                <img src={activePlace.photoUri} alt={activePlace.displayName} className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-500" />
             </div>
         ) : (
            <div className="w-full h-40 border-2 border-white bg-muted flex flex-col items-center justify-center text-muted-foreground font-mono text-xs shrink-0">
               <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
               No Image
            </div>
         )}

         <div className="bg-primary/20 border-l-4 border-primary p-3">
             <Badge className="rounded-none bg-primary text-black mb-2 font-mono uppercase text-[10px] tracking-wider">AI Insight</Badge>
             <p className="text-sm font-sans leading-relaxed">{activePlace.summary}</p>
         </div>

         {activePlace.rating && (
            <div className="flex items-center gap-2 font-mono text-sm">
               <div className="flex items-center text-primary">
                 <Star className="w-4 h-4 fill-current" />
               </div>
               <span>{activePlace.rating} / 5</span>
            </div>
         )}

         {activePlace.openingHours && (
            <div className="space-y-1">
               <div className="flex items-center gap-2 font-mono text-sm text-primary mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="font-bold uppercase tracking-wider">Jam Operasional</span>
               </div>
               <div className="bg-black/50 p-2 border border-white/20">
                 <ul className="text-xs font-mono space-y-1 text-muted-foreground">
                    {activePlace.openingHours.map((schedule: string, idx: number) => {
                       // Highlight today if possible, but for simplicity let's just list them
                       const isToday = new Date().getDay() === (idx === 6 ? 0 : idx + 1);
                       return (
                          <li key={idx} className={`${isToday ? 'text-primary font-bold' : ''}`}>
                            {schedule}
                          </li>
                       );
                    })}
                 </ul>
               </div>
            </div>
         )}

         {activePlace.reviews && activePlace.reviews.length > 0 && (
            <div className="space-y-3 mt-4">
               <h4 className="font-heading uppercase text-sm font-bold border-b border-white/20 pb-1 text-primary">Apa Kata Mereka</h4>
               {activePlace.reviews.slice(0, 3).map((rev: any, idx: number) => (
                  <div key={idx} className="bg-black border border-white/20 p-3 text-sm font-sans opacity-90">
                     <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs">{rev.authorAttribution?.displayName || 'Anonim'}</span>
                        <span className="text-[10px] bg-primary/20 text-primary px-1">{rev.rating} ★</span>
                     </div>
                     <p className="text-xs line-clamp-3 text-muted-foreground">{rev.text}</p>
                  </div>
               ))}
            </div>
         )}
      </div>
      
      <div className="p-4 border-t-2 border-white bg-background shrink-0 flex flex-col gap-2">
         {selectedPlaces.length > 1 && (
             <div className="flex items-center justify-between gap-1 mb-1">
                 <Button onClick={handlePrev} variant="outline" className="flex-1 rounded-none border-2 border-white uppercase font-bold text-xs h-8 hover:bg-white hover:text-black transition-colors" type="button">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                 </Button>
                 <span className="font-mono text-[10px] font-bold w-10 text-center text-muted-foreground">
                    {currentIndex + 1}/{selectedPlaces.length}
                 </span>
                 <Button onClick={handleNext} variant="outline" className="flex-1 rounded-none border-2 border-white uppercase font-bold text-xs h-8 hover:bg-white hover:text-black transition-colors" type="button">
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                 </Button>
             </div>
         )}
         <Button onClick={handleDirections} className="w-full rounded-none uppercase font-heading tracking-widest text-lg border-2 border-white hover:bg-white hover:text-black transition-colors h-12" type="button">
            <Navigation className="mr-2 w-5 h-5" /> Gas Kesana
         </Button>
      </div>
    </Card>
  );
}
