
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";
import { toast } from "sonner";
import { playSound, stopSound, unlockAudio, canPlayAudio, preloadSounds, playSoundByEventType } from "@/services/notificationService";
import { useSettings } from "@/contexts/SettingsContext";

interface SoundTesterProps {
  soundType: string;
  volume: number;
  isMuted: boolean;
  audioPermissionGranted: boolean;
  setAudioPermissionGranted: React.Dispatch<React.SetStateAction<boolean>>;
  formValues: any; // To get form values
}

const SoundTester = ({ 
  soundType, 
  volume, 
  isMuted, 
  audioPermissionGranted,
  setAudioPermissionGranted,
  formValues
}: SoundTesterProps) => {
  const [isPlayingSound, setIsPlayingSound] = useState<string | null>(null);
  const { settings } = useSettings();

  const handleSoundPreview = (soundKey: "notificationSound" | "alertSound" | "podiumSound" | "firstPlaceSound") => {
    // Parar qualquer som em reprodução
    stopSound();
    
    if (isMuted) {
      toast.warning("O som está mutado. Clique no botão de volume para ativar.");
      return;
    }
    
    console.log(`Testing sound: ${soundKey} -> ${formValues[soundKey]} with volume: ${volume}`);
    
    setIsPlayingSound(soundKey);
    
    // Tentar desbloquear o áudio primeiro (crucial para iOS/Safari)
    unlockAudio();
    
    // Preload sounds
    preloadSounds();
    
    // Map sound key to event type
    const eventTypeMap: Record<string, "notification" | "alert" | "podium" | "firstPlace"> = {
      notificationSound: "notification",
      alertSound: "alert",
      podiumSound: "podium", 
      firstPlaceSound: "firstPlace"
    };
    
    const eventType = eventTypeMap[soundKey];
    
    // Use the current form values as temporary settings
    const tempSettings = {
      ...settings,
      soundVolume: volume,  // Use the current volume slider value
      ...formValues,        // Override with current form values
    };
    
    // Use playSoundByEventType to respect the configured sound type and volume
    const success = playSoundByEventType(eventType, tempSettings);
    
    // Set timeout to update UI state
    setTimeout(() => setIsPlayingSound(null), 3000);
    
    if (!success) {
      if (!audioPermissionGranted) {
        toast.warning(
          "Para permitir reprodução de áudio, interaja com a página primeiro.",
          { duration: 5000 }
        );
        
        // Add one-time click handler to try again on interaction
        const handleInteraction = () => {
          unlockAudio();
          preloadSounds();
          playSoundByEventType(eventType, tempSettings);
          setAudioPermissionGranted(true);
          document.removeEventListener('click', handleInteraction);
        };
        
        document.addEventListener('click', handleInteraction, { once: true });
      } else {
        toast.error(
          "Não foi possível reproduzir o som. Verifique as configurações do seu navegador.",
          { duration: 5000 }
        );
      }
    } else {
      toast.success(`Som de ${getSoundLabel(soundKey)} reproduzido`);
      setAudioPermissionGranted(true);
    }
  };

  const getSoundLabel = (key: string): string => {
    switch(key) {
      case "notificationSound": return "Novo Atendimento";
      case "alertSound": return "Alerta de Atraso";
      case "podiumSound": return "Entrada no Pódio";
      case "firstPlaceSound": return "Primeiro Lugar";
      default: return "teste";
    }
  };

  return (
    <div className="pt-2">
      <p className="text-sm mb-2">Testar Sons:</p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSoundPreview("notificationSound")}
          disabled={isMuted || isPlayingSound !== null}
          className="relative"
          size="sm"
        >
          {isPlayingSound === "notificationSound" ? (
            <>Tocando... <span className="animate-ping absolute right-2">🔊</span></>
          ) : (
            <>Atendimento <Play className="h-3 w-3 ml-1" /></>
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSoundPreview("alertSound")}
          disabled={isMuted || isPlayingSound !== null}
          className="relative"
          size="sm"
        >
          {isPlayingSound === "alertSound" ? (
            <>Tocando... <span className="animate-ping absolute right-2">🔊</span></>
          ) : (
            <>Alerta <Play className="h-3 w-3 ml-1" /></>
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSoundPreview("podiumSound")}
          disabled={isMuted || isPlayingSound !== null}
          className="relative"
          size="sm"
        >
          {isPlayingSound === "podiumSound" ? (
            <>Tocando... <span className="animate-ping absolute right-2">🔊</span></>
          ) : (
            <>Pódio <Play className="h-3 w-3 ml-1" /></>
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSoundPreview("firstPlaceSound")}
          disabled={isMuted || isPlayingSound !== null}
          className="relative"
          size="sm"
        >
          {isPlayingSound === "firstPlaceSound" ? (
            <>Tocando... <span className="animate-ping absolute right-2">🔊</span></>
          ) : (
            <>1º Lugar <Play className="h-3 w-3 ml-1" /></>
          )}
        </Button>
        
        {isPlayingSound && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              stopSound();
              setIsPlayingSound(null);
            }}
            size="sm"
          >
            <Square className="h-3 w-3 mr-1" /> Parar
          </Button>
        )}
      </div>
    </div>
  );
};

export default SoundTester;
