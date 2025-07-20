import { Audio } from "expo-av";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type AudioContextType = {
  playLoopingMusic: () => Promise<void>;
  stopMusic: () => Promise<void>;
  musicEnabled: boolean;
  setMusicEnabled: (value: boolean) => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(true);

  const playLoopingMusic = async () => {
    if (!musicEnabled) return; // 🔇 respect global setting
    if (soundRef.current) return; // already playing

    const { sound } = await Audio.Sound.createAsync(
      require("../assets/music/spook.mp3"),
      {
        shouldPlay: true,
        isLooping: true,
        volume: 1,
      }
    );

    soundRef.current = sound;
    await sound.playAsync();
  };

  const stopMusic = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopMusic(); // cleanup
    };
  }, []);

  return (
    <AudioContext.Provider
      value={{ playLoopingMusic, stopMusic, musicEnabled, setMusicEnabled }}
    >
      {children}
    </AudioContext.Provider>
  );
};
