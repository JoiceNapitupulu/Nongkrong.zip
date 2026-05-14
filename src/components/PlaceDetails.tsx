import { usePlaceContext } from "../PlaceContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Navigation, Image as ImageIcon, Star, ChevronLeft, ChevronRight, Clock, Share2, Check, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, MouseEvent, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function PlaceDetails() {
  const { 
    activePlace, 
    setActivePlace, 
    selectedPlaces, 
    toggleFavorite, 
    isFavorite,
    userReviews,
    addUserReview
  } = usePlaceContext();
  const [copied, setCopied] = useState(false);

  const [photoIndex, setPhotoIndex] = useState(0);
  const [view, setView] = useState<"info" | "gallery" | "reviews">("info");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const photos = activePlace?.photoUris || (activePlace?.photoUri ? [activePlace.photoUri] : []);

  // Reset photo index when place changes
  useEffect(() => {
    setPhotoIndex(0);
    setView("info");
  }, [activePlace?.id]);

  const handleNextPhoto = (e: MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = (e: MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  if (!activePlace) return null;

  const isFav = isFavorite(activePlace.id);

  const handleShare = async () => {
    const placeName = activePlace.displayName || activePlace.name;
    const shareUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}&query_place_id=${activePlace.id}`;
    const text = `Check out ${placeName} via Nongkrong.zip: ${shareUrl}`;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

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

  const handleSubmitReview = (e: FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    const newReview = {
      rating: reviewRating,
      text: reviewText,
      authorAttribution: { displayName: "Loe" },
      relativePublishTimeDescription: "Baru saja",
      isLocal: true,
    };

    addUserReview(activePlace.id, newReview);
    setReviewText("");
    setReviewRating(5);
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
      
      {/* Tabs */}
      <div className="flex border-b-2 border-white bg-background shrink-0 p-1 gap-1">
         <button 
           onClick={() => setView("info")}
           className={`flex-1 py-1 text-[10px] uppercase font-bold transition-all ${view === 'info' ? 'bg-primary text-black border border-white' : 'text-muted-foreground hover:text-white'}`}
         >
           Detail
         </button>
         <button 
           onClick={() => setView("reviews")}
           className={`flex-1 py-1 text-[10px] uppercase font-bold transition-all ${view === 'reviews' ? 'bg-primary text-black border border-white' : 'text-muted-foreground hover:text-white'}`}
         >
           Ulasan ({ (activePlace.reviews?.length || 0) + (userReviews[activePlace.id]?.length || 0) })
         </button>
         {photos.length > 0 && (
           <button 
             onClick={() => setView("gallery")}
             className={`flex-1 py-1 text-[10px] uppercase font-bold transition-all ${view === 'gallery' ? 'bg-primary text-black border border-white' : 'text-muted-foreground hover:text-white'}`}
           >
             Galeri
           </button>
         )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
         {view === "info" && (
            <>
               {photos.length > 0 ? (
                   <div className="w-full h-48 border-2 border-white relative overflow-hidden bg-muted shrink-0 group">
                      <AnimatePresence initial={false} mode="wait">
                        <motion.div
                          key={photoIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          drag="x"
                          dragConstraints={{ left: 0, right: 0 }}
                          onDragEnd={(_, info) => {
                            if (info.offset.x > 50) handlePrevPhoto({ stopPropagation: () => {} } as MouseEvent);
                            else if (info.offset.x < -50) handleNextPhoto({ stopPropagation: () => {} } as MouseEvent);
                          }}
                          className="w-full h-full cursor-grab active:cursor-grabbing"
                        >
                          <img 
                            src={photos[photoIndex]} 
                            alt="" 
                            className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-500" 
                            draggable={false}
                          />
                        </motion.div>
                      </AnimatePresence>
      
                      {photos.length > 1 && (
                        <>
                          {/* Navigation Buttons */}
                          <button 
                            onClick={handlePrevPhoto}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 border border-white p-1 hover:bg-primary hover:text-black transition-colors opacity-0 group-hover:opacity-100 z-10"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button 
                            onClick={handleNextPhoto}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 border border-white p-1 hover:bg-primary hover:text-black transition-colors opacity-0 group-hover:opacity-100 z-10"
                          >
                            <ChevronRight size={16} />
                          </button>
      
                          {/* Indicators */}
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                            {photos.map((_: any, i: number) => (
                              <div 
                                key={i} 
                                className={`w-1.5 h-1.5 border border-white transition-colors ${i === photoIndex ? 'bg-primary' : 'bg-black/50'}`} 
                              />
                            ))}
                          </div>
                        </>
                      )}
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
            </>
         )}

         {view === "reviews" && (
            <div className="space-y-4">
               {/* Review Form */}
               <form onSubmit={handleSubmitReview} className="p-3 border-2 border-white bg-black/40 space-y-3">
                  <h4 className="font-heading uppercase text-xs font-bold text-primary">Tulis Ulasan</h4>
                  <div className="flex gap-1">
                     {[1, 2, 3, 4, 5].map((s) => (
                        <button
                           key={s}
                           type="button"
                           onClick={() => setReviewRating(s)}
                           className="transition-transform active:scale-90"
                        >
                           <Star 
                              className={`w-5 h-5 ${s <= reviewRating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
                           />
                        </button>
                     ))}
                  </div>
                  <textarea
                     value={reviewText}
                     onChange={(e) => setReviewText(e.target.value)}
                     placeholder="Gimana menurut lo tempat ini bre?"
                     className="w-full bg-black border border-white/20 p-2 text-xs font-sans min-h-[80px] focus:border-primary outline-none text-white resize-none"
                  />
                  <Button 
                    type="submit" 
                    disabled={!reviewText.trim()}
                    className="w-full rounded-none border border-white bg-primary text-black hover:bg-white hover:text-black uppercase text-[10px] font-bold h-8 transition-colors"
                  >
                    Kirim Ulasan
                  </Button>
               </form>

               {/* Combined Reviews Display */}
               <div className="space-y-3">
                  <h4 className="font-heading uppercase text-xs font-bold border-b border-white/20 pb-1 text-primary">Apa Kata Mereka</h4>
                  {[...(userReviews[activePlace.id] || []), ...(activePlace.reviews || [])].length === 0 ? (
                     <p className="text-[10px] font-mono text-muted-foreground uppercase text-center py-4">Belum ada ulasan bre.</p>
                  ) : (
                     [...(userReviews[activePlace.id] || []), ...(activePlace.reviews || [])].map((rev: any, idx: number) => (
                        <div key={idx} className={`bg-black border p-3 text-sm font-sans transition-all duration-300 ${rev.isLocal ? 'border-primary bg-primary/5' : 'border-white/20 opacity-90 hover:border-white/40'}`}>
                           <div className="flex justify-between items-center mb-1">
                              <div className="flex flex-col">
                                 <span className="font-bold text-xs flex items-center gap-2">
                                    {rev.authorAttribution?.displayName || 'Anonim'}
                                    {rev.isLocal && <span className="text-[8px] bg-primary text-black px-1 uppercase font-bold">Loe</span>}
                                 </span>
                                 <span className="text-[9px] text-muted-foreground">
                                    {rev.relativePublishTimeDescription || 'Baru saja'}
                                 </span>
                              </div>
                              <span className="text-[10px] bg-primary/20 text-primary px-1">{rev.rating} ★</span>
                           </div>
                           <p className="text-xs text-muted-foreground leading-relaxed italic">"{rev.text}"</p>
                        </div>
                     ))
                  )}
               </div>
            </div>
         )}

         {view === "gallery" && (
            <div className="space-y-4">
               <div className="relative w-full aspect-video border-2 border-white overflow-hidden bg-black group">
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={photoIndex}
                      src={photos[photoIndex]} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full object-contain grayscale hover:grayscale-0 transition-all duration-500"
                    />
                  </AnimatePresence>
                  
                  {photos.length > 1 && (
                    <>
                      <button 
                        onClick={handlePrevPhoto}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 border border-white p-1 hover:bg-primary hover:text-black transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button 
                        onClick={handleNextPhoto}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 border border-white p-1 hover:bg-primary hover:text-black transition-colors"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </>
                  )}
               </div>

               <div className="grid grid-cols-4 gap-2">
                  {photos.map((url: string, i: number) => (
                    <button 
                      key={i} 
                      onClick={() => setPhotoIndex(i)}
                      className={`aspect-square border-2 transition-all ${i === photoIndex ? 'border-primary ring-2 ring-primary/50' : 'border-white/20 hover:border-white'}`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover grayscale active:grayscale-0" />
                    </button>
                  ))}
               </div>

               <div className="text-center">
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                     Photo {photoIndex + 1} of {photos.length}
                  </span>
               </div>
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
         <div className="flex gap-2">
            <Button 
               onClick={() => toggleFavorite(activePlace)} 
               variant="outline" 
               className={`w-10 rounded-none border-2 border-white transition-all duration-300 h-10 p-0 ${isFav ? 'bg-primary border-primary text-black' : 'hover:bg-white hover:text-black'}`}
               type="button"
               title={isFav ? "Hapus dari Favorit" : "Simpan ke Favorit"}
            >
               <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
            </Button>
            <Button onClick={handleShare} variant="outline" className="flex-1 rounded-none uppercase font-heading tracking-widest text-[10px] sm:text-sm border-2 border-white hover:bg-white hover:text-black transition-colors h-10" type="button">
               {copied ? (
                  <><Check className="mr-2 w-4 h-4" /> Copied!</>
               ) : (
                  <><Share2 className="mr-2 w-4 h-4" /> Share</>
               )}
            </Button>
            <Button onClick={handleDirections} className="flex-[2] rounded-none uppercase font-heading tracking-widest text-lg border-2 border-white hover:bg-white hover:text-black transition-colors h-10 md:h-12" type="button">
               <Navigation className="mr-2 w-5 h-5" /> Get Directions
            </Button>
         </div>
      </div>
    </Card>
  );
}
