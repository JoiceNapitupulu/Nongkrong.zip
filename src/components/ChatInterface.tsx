import { useState, useRef, useEffect } from "react";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, MapPin, Github, Heart, MessageSquare, Trash2, Bookmark, Save } from "lucide-react";
import { usePlaceContext } from "../PlaceContext";
import placesDataRaw from "../places.json";

const placesData = placesDataRaw as any[];

function searchLocalPlaces(query: string) {
  const q = query.toLowerCase();
  return placesData.map(p => {
    let score = 0;
    const name = (p.name || "").toLowerCase();
    const cat = (p.category || "").toLowerCase();
    const addr = (p.address_full || "").toLowerCase();
    
    if (name.includes(q)) score += 10;
    if (cat.includes(q)) score += 5;
    if (addr.includes(q)) score += 2;
    
    const words = q.split(/\s+/);
    for (const w of words) {
        if (w.length > 3) {
            if (name.includes(w)) score += 3;
            if (cat.includes(w)) score += 2;
            if (addr.includes(w)) score += 1;
        }
    }
    
    return { ...p, score };
  })
  .filter(p => p.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 15);
}

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

const MOOD_CHIPS = [
  { label: "☕ Chill & Melow", prompt: "Cari tempat yang tenang buat chill dan melow bre." },
  { label: "🔊 Listening Bar", prompt: "Gue pengen dengerin vinyl, cariin listening bar yang asik." },
  { label: "🕵️ Hidden Gem", prompt: "Cariin hidden gem yang beneran hidden, jangan yang pasaran." },
  { label: "💬 Deep Talk", prompt: "Butuh tempat yang PW buat deep talk semaleman." },
  { label: "🎸 Underground Gigs", prompt: "Ada info gigs underground atau tempat live music keren?" },
];

export default function ChatInterface() {
  const [view, setView] = useState<"chat" | "saved">("chat");
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("nongkrong_chat_history");
    return saved ? JSON.parse(saved) : [
      { role: "model", text: "Halo bre! Mau nyari hidden gem cafe, listening bar, ato tempat gigs di Jakarta nih? Kasih tau mood lo dong." }
    ];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"places" | "chats">("places");
  const { setSelectedPlaces, setActivePlace, favorites, savedChats, saveChat, deleteChat } = usePlaceContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("nongkrong_chat_history", JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (manualInput?: string) => {
    const textToProcess = manualInput || input;
    if (!textToProcess.trim()) return;
    
    const userText = textToProcess;
    if (!manualInput) setInput("");
    
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setIsLoading(true);

    try {
      const history = [];
      history.push({ role: "user", parts: [{ text: "Halo AI, ayo bantu gue nyari tempat." }] });
      history.push({ role: "model", parts: [{ text: "Halo bre! Mau nyari hidden gem cafe, listening bar, ato tempat gigs di Jakarta nih? Kasih tau mood lo dong." }] });
      
      const actualConvo = messages.slice(1);
      actualConvo.forEach((m) => {
        history.push({ role: m.role, parts: [{ text: m.text }] });
      });
      
      const localResults = searchLocalPlaces(userText);
      let contextText = userText;
      if (localResults.length > 0) {
        contextText += `\n\n[CONTEXT: Data Tempat Lokal dari Database kita]\n` + localResults.map(p => `- ${p.name} (${p.category}): ${p.address_full}, Rating: ${p.rating}`).join('\n');
      }
      history.push({ role: "user", parts: [{ text: contextText }] });

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: history,
        config: {
          systemInstruction: "Kamu adalah 'Nongkrong.zip', bot asisten skena Jakarta yang estetik dan brutalist. Bahasa gaul Gen Z (pakai lo/gue, chill). Tugas utamamu bantu cari tempat nongkrong. WAJIB cari dan pilih tempat dari CONTEXT Data Tempat Lokal yang diberikan jika ada. Berikan minimal 5 dan maksimal 7 rekomendasi terbaik secara bersamaan, ceritakan di summary kenapa tempat itu menarik, dan panggil function displayPlaces HANYA SEKALI dengan daftar tempat tersebut.",
          temperature: 0.7,
          tools: [
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
                 const query = (rp.querySearch || rp.name).toLowerCase();
                 // Temukan dari local json
                 const place = placesData.find((p: any) => 
                    (p.name && p.name.toLowerCase() === query) || 
                    (p.name && p.name.toLowerCase().includes(query)) || 
                    query.includes(p.name?.toLowerCase())
                 );

                 if (place) {
                   mapPlaces.push({
                     ...rp,
                     id: place.url || place.name,
                     location: { lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) },
                     address: place.address_full,
                     displayName: place.name,
                     photoUri: undefined, 
                     photoUris: [],
                     rating: parseFloat(place.rating) || 0,
                     reviews: [],
                     openingHours: place.hours ? [place.hours] : undefined,
                   });
                 } else {
                   // Fallback jika tidak ketemu persis
                   mapPlaces.push({
                     ...rp,
                     id: "temp-" + Date.now() + Math.random(),
                     location: { lat: -6.200000, lng: 106.816666 }, // default JKT
                     address: "Jakarta",
                     displayName: rp.name,
                     rating: 0,
                     reviews: [],
                     photoUris: [],
                   });
                 }
               } catch (e) {
                 console.error("Error mapping local place", rp, e);
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
         const response2 = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [...history, {role: "model", parts: response.candidates?.[0]?.content?.parts || []}],
            config: {
              systemInstruction: "Beritahu user bahwa rekomendasi sudah ditampilkan di peta dengan bahasa singkat dan asik.",
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

  const clearHistory = () => {
    const initialMessage: Message[] = [
      { role: "model", text: "Halo bre! Mau nyari hidden gem cafe, listening bar, ato tempat gigs di Jakarta nih? Kasih tau mood lo dong." }
    ];
    setMessages(initialMessage);
    localStorage.removeItem("nongkrong_chat_history");
  };

  return (
    <div className="flex flex-col h-full bg-card border-r-4 border-b-4 border-white">
      <div className="p-4 bg-primary text-primary-foreground border-b-4 border-white uppercase tracking-widest font-heading font-bold text-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="stroke-[3px]" /> Nongkrong.zip
        </div>
        <div className="flex items-center gap-2">
          {view === 'chat' && messages.length > 1 && (
            <>
              <button 
                onClick={() => saveChat(messages)}
                className="p-1 hover:bg-black/20 transition-all border-2 border-transparent hover:border-black active:bg-black/40 text-black/60 hover:text-black"
                title="Save Session"
              >
                <Save size={18} />
              </button>
              <button 
                onClick={clearHistory}
                className="p-1 hover:bg-black/20 transition-all border-2 border-transparent hover:border-black active:bg-black/40 text-black/60 hover:text-black"
                title="Clear Chat"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
          <a 
            href="https://github.com/JoiceNapitupulu" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-1 hover:bg-black/20 transition-all border-2 border-transparent hover:border-black active:bg-black/40"
            title="GitHub Profile"
          >
            <Github size={20} className="text-black" />
          </a>
        </div>
      </div>

      {/* View Switcher */}
      <div className="flex border-b-2 border-white bg-background p-1 gap-1">
        <button 
          onClick={() => setView("chat")}
          className={`flex-1 py-1 text-[10px] uppercase font-bold flex items-center justify-center gap-2 transition-all ${view === 'chat' ? 'bg-primary text-black border border-white' : 'text-muted-foreground hover:text-white'}`}
        >
          <MessageSquare size={12} /> Chat
        </button>
        <button 
          onClick={() => setView("saved")}
          className={`flex-1 py-1 text-[10px] uppercase font-bold flex items-center justify-center gap-2 transition-all ${view === 'saved' ? 'bg-primary text-black border border-white' : 'text-muted-foreground hover:text-white'}`}
        >
          <Bookmark size={12} className={view === 'saved' ? 'fill-current' : ''} /> Terpilih ({favorites.length + savedChats.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-black">
        {view === 'chat' ? (
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
        ) : (
          <div className="space-y-4">
             {/* Sub-Tabs for Saved View */}
             <div className="flex gap-2 border-b border-white/20 pb-2 mb-2">
                <button 
                  onClick={() => setActiveTab("places")}
                  className={`text-[9px] uppercase font-black px-2 py-0.5 border ${activeTab === 'places' ? 'bg-primary text-black border-white' : 'text-muted-foreground border-transparent hover:text-white'}`}
                >
                   Tempat ({favorites.length})
                </button>
                <button 
                  onClick={() => setActiveTab("chats")}
                  className={`text-[9px] uppercase font-black px-2 py-0.5 border ${activeTab === 'chats' ? 'bg-primary text-black border-white' : 'text-muted-foreground border-transparent hover:text-white'}`}
                >
                   Sesi Chat ({savedChats.length})
                </button>
             </div>

             {activeTab === 'places' ? (
                <div className="space-y-3">
                   {favorites.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground font-mono text-xs opacity-50 uppercase tracking-widest">
                         Belum ada tempat favorit bre. <br/> Kasih ❤️ di detail tempatnya!
                      </div>
                   ) : (
                      favorites.map((place) => (
                        <button 
                          key={place.id}
                          onClick={() => {
                              setSelectedPlaces([place]);
                              setActivePlace(place);
                          }}
                          className="w-full text-left p-3 border-2 border-white hover:border-primary transition-colors group flex gap-3 bg-card"
                        >
                          <div className="w-12 h-12 border border-white/20 overflow-hidden shrink-0">
                             <img src={place.photoUri} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <h4 className="font-heading uppercase font-bold text-sm truncate text-white group-hover:text-primary">{place.displayName || place.name}</h4>
                             <p className="text-[10px] text-muted-foreground truncate font-mono">{place.address}</p>
                          </div>
                        </button>
                      ))
                   )}
                </div>
             ) : (
                <div className="space-y-3">
                   {savedChats.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground font-mono text-xs opacity-50 uppercase tracking-widest">
                         Belum ada sesi chat disave bre. <br/> Klik icon 💾 di chat!
                      </div>
                   ) : (
                      savedChats.map((chat) => (
                        <div key={chat.id} className="relative group">
                          <button 
                            onClick={() => {
                                setMessages(chat.messages);
                                setView("chat");
                            }}
                            className="w-full text-left p-3 border-2 border-white hover:border-primary transition-colors flex gap-3 bg-card"
                          >
                            <div className="w-10 h-10 border border-white/20 flex items-center justify-center shrink-0 bg-black text-primary">
                               <MessageSquare size={20} />
                            </div>
                            <div className="flex-1 min-w-0 pr-8">
                               <h4 className="font-heading uppercase font-bold text-[11px] truncate text-white">{chat.title}</h4>
                               <p className="text-[9px] text-muted-foreground font-mono">{new Date(chat.timestamp).toLocaleDateString()}</p>
                            </div>
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-black/40 text-muted-foreground hover:text-red-500 transition-colors"
                          >
                             <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                   )}
                </div>
             )}
          </div>
        )}
      </div>

      {view === 'chat' && (
        <div className="p-4 border-t-4 border-white bg-background space-y-3">
          {!isLoading && messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {MOOD_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip.prompt)}
                  className="px-2 py-1 bg-black border border-white/20 text-[9px] uppercase tracking-wider text-muted-foreground hover:border-primary hover:text-primary transition-all active:scale-95"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}
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
      )}
    </div>
  );
}
