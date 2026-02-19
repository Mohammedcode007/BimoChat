import { Audio } from "expo-av";

let currentSound: Audio.Sound | null = null;

export const playNewSound = async (
  uri: string,
  onStatus: (status: any) => void
) => {

  if (currentSound) {
    await currentSound.stopAsync();
    await currentSound.unloadAsync();
    currentSound = null;
  }

  const { sound } = await Audio.Sound.createAsync(
    { uri },
    { shouldPlay: true },
    onStatus
  );

  currentSound = sound;
  return sound;
};
