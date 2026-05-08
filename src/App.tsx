import { PlaceProvider } from "./PlaceContext";
import ChatInterface from "./components/ChatInterface";
import MapComponent from "./components/MapComponent";
import PlaceDetails from "./components/PlaceDetails";
import { APIProvider } from "@vis.gl/react-google-maps";

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || "";
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export default function App() {
  if (!hasValidKey) {
     return (
       <div className="flex items-center justify-center min-h-screen bg-background text-foreground font-mono text-sm">
         <div className="text-center max-w-lg p-8 border-4 border-white bg-card shadow-[12px_12px_0_0_#fff]">
           <h2 className="text-2xl font-heading uppercase font-bold mb-4">API Key Required</h2>
           <p className="mb-2 text-left">Gue butuh Google Maps API Key biar bisa jalan, bre.</p>
           <ul className="text-left space-y-2 opacity-80 list-disc list-inside mt-4">
             <li>Click <strong>Settings</strong> (⚙️ gear icon, top-right)</li>
             <li>Select <strong>Secrets</strong></li>
             <li>Add <code>GOOGLE_MAPS_PLATFORM_KEY</code> and paste the key</li>
           </ul>
         </div>
       </div>
     );
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <PlaceProvider>
        <main className="flex flex-col md:flex-row h-screen w-full bg-background overflow-hidden selection:bg-primary selection:text-black text-foreground">
          {/* Chat Sidebar */}
          <section className="w-full md:w-[400px] lg:w-[450px] shrink-0 h-[50vh] md:h-full relative z-10 flex flex-col">
            <ChatInterface />
          </section>

          {/* Map Area */}
          <section className="flex-1 relative h-[50vh] md:h-full border-t-4 md:border-t-0 md:border-l-4 border-white bg-black">
            <MapComponent />
            <PlaceDetails />
          </section>
        </main>
      </PlaceProvider>
    </APIProvider>
  );
}
