import { useState, useRef, useEffect } from "react";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, MapPin, Loader2 } from "lucide-react";
import { usePlaceContext } from "../PlaceContext";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const displayPlaces: FunctionDeclaration = {
  name: "displayPlaces",
  description: "Display recommended places on the map to the user.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      places: {
        type: Type.ARRAY,
        description: "List of places to display",
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Full name of the place" },
            querySearch: { type: Type.STRING, description: "A highly specific search query to find this place on Google Maps (e.g. 'Pantjoran PIK Jakarta')" },
            summary: { type: Type.STRING, description: "A Gen Z style short explanation of why it's cool or viral, optionally mentioning what Tiktok or Twitter says about it." },
          },
          required: ["name", "querySearch", "summary"],
        },
      },
    },
    required: ["places"],
  },
};

type Message = {
  role: "user" | "model";
  text: string;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Halo bre! Mau nyari hidden gem cafe, listening bar, ato tempat gigs di Jakarta nih? Kasih tau mood lo dong." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const placesLib = useMapsLibrary("places");
  const { setSelectedPlaces, setActivePlace } = usePlaceContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !placesLib) return;
    const userText = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setIsLoading(true);

    try {
      // Gemini requires alternating history, starting with user.
      // If we have an initial model message, let's just use it as part of system prompt,
      // or start history with a dummy user message to satisfy the API.
      const history = [];
      history.push({ role: "user", parts: [{ text: "Halo AI, ayo bantu gue nyari tempat." }] });
      history.push({ role: "model", parts: [{ text: "Halo bre! Mau nyari hidden gem cafe, listening bar, ato tempat gigs di Jakarta nih? Kasih tau mood lo dong." }] });
      
      // Append the rest of the actual conversation (excluding the first initial model message to avoid duplicates)
      const actualConvo = messages.slice(1);
      actualConvo.forEach((m) => {
        history.push({ role: m.role, parts: [{ text: m.text }] });
      });
      history.push({ role: "user", parts: [{ text: userText }] });

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: history,
        config: {
          systemInstruction: "Kamu adalah 'Nongkrong.zip', bot asisten skena Jakarta yang estetik dan brutalist. Bahasa gaul Gen Z (pakai lo/gue, chill). Tugas utamamu bantu cari tempat nongkrong (hidden gem beneran yang jarang orang tau, listening bar, cafe estetis, art space). Gunakan tools googleSearch untuk cari info tren realtime, preferensi tempat yang viral di TikTok atau Twitter, dan ceritakan di summary kenapa tempat itu hype. Berikan minimal 5 dan maksimal 7 rekomendasi terbaik secara bersamaan, panggil function displayPlaces HANYA SEKALI dengan daftar tempat tersebut.",
          temperature: 0.7,
          tools: [
            { googleSearch: {} },
            { functionDeclarations: [displayPlaces] }
          ],
          toolConfig: { includeServerSideToolInvocations: true },
        }
      });

      const finishReason = response.candidates?.[0]?.finishReason;
      if (finishReason && finishReason !== 'STOP') {
        setMessages((prev) => [...prev, { role: "model", text: `Filter blocked respon ini bre (Reason: ${finishReason}). Coba ganti kata-katanya.` }]);
        return;
      }

      let responseText = response.text || "";
      const functionCalls = response.functionCalls;
      
      if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
          if (call.name === "displayPlaces" && call.args && call.args.places) {
            const rawPlaces = call.args.places as any[];
            const mapPlaces = [];
            for (const rp of rawPlaces) {
               try {
                 const res = await placesLib.Place.searchByText({
                   textQuery: rp.querySearch + " Jakarta",
                   fields: ["displayName", "location", "formattedAddress", "photos", "id", "reviews", "rating", "regularOpeningHours"],
                   maxResultCount: 1,
                 });
                 if (res.places && res.places.length > 0) {
                   const place = res.places[0];
                   mapPlaces.push({
                     ...rp,
                     id: place.id,
                     location: { lat: place.location?.lat(), lng: place.location?.lng() },
                     address: place.formattedAddress,
                     displayName: place.displayName,
                     photoUri: place.photos?.[0]?.getURI({ maxWidth: 400 }),
                     rating: place.rating,
                     reviews: place.reviews,
                     openingHours: place.regularOpeningHours?.weekdayDescriptions,
                   });
                 }
               } catch (e) {
                 console.error("Error searching place", rp, e);
               }
            }
            setSelectedPlaces(mapPlaces);
            if (mapPlaces.length > 0) setActivePlace(mapPlaces[0]);
          }
        }
      }

      if (responseText) {
          setMessages((prev) => [...prev, { role: "model", text: responseText }]);
      } else if (functionCalls && functionCalls.length > 0) {
          // If no text, generate follow up text
         const response2 = await ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: [...history, {role: "model", parts: response.candidates?.[0]?.content?.parts || []}],
            config: {
              systemInstruction: "Beritahu user bahwa rekomendasi sudah ditampilkan di peta dengan bahasa singkat dan asik.",
              tools: [ { googleSearch: {} } ],
            }
         });
         setMessages((prev) => [...prev, { role: "model", text: response2.text || "Udah gue tampilin di map cuy! Cekidot ya." }]);
      } else {
          setMessages((prev) => [...prev, { role: "model", text: "Gue bingung bre, ga ada respon dari server. Coba lagi." }]);
      }

    } catch (e: any) {
      console.error(e);
      let errorMessage = "Duh, sinyal gue lagi ampas bro. Coba lagi bentar.";
      
      const errorStr = e.message || String(e);
      if (errorStr.includes("429") || errorStr.includes("RESOURCE_EXHAUSTED") || errorStr.includes("quota")) {
         errorMessage = "Waduh bre, limit AI kita nyangkut nih (kebanyakan request). Sabar bentar ya, ngopi dulu aja ntar coba lagi ☕";
      } else {
         errorMessage = `Duh, error bre: ${errorStr}. Coba lagi.`;
      }
      
      setMessages((prev) => [...prev, { role: "model", text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border-r-4 border-b-4 border-white">
      <div className="p-4 bg-primary text-primary-foreground border-b-4 border-white uppercase tracking-widest font-heading font-bold text-xl flex items-center gap-2">
        <MapPin className="stroke-[3px]" /> Nongkrong.zip
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-black">
        <div className="space-y-4">
          {messages.map((ms, i) => (
            <div key={i} className={`flex ${ms.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 max-w-[85%] border-2 whitespace-pre-wrap ${ms.role === 'user' ? 'bg-primary text-primary-foreground border-white font-mono text-sm' : 'bg-background text-foreground border-white font-sans text-[15px]'}`}>
                {ms.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="p-3 bg-background text-foreground border-2 border-white flex items-center gap-2 font-mono text-xs">
                 <Loader2 className="animate-spin w-4 h-4" /> Mikir bentar...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t-4 border-white bg-background">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <Input 
            value={input} 
            onChange={e => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ketik mood lo disini..." 
            className="border-2 border-white rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 font-mono text-sm bg-black text-white"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} className="rounded-none border-2 border-white uppercase font-bold tracking-wider hover:bg-white hover:text-black transition-colors bg-primary text-black">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
