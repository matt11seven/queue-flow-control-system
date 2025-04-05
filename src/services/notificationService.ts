
// Sound options with preloaded audio files
const soundOptions = {
  notification: "/sounds/notification.mp3",
  alert: "/sounds/alert.mp3",
  beep: "/sounds/beep.mp3",
};

// Initialize audio context and elements
let audio: HTMLAudioElement | null = null;
let notificationInterval: NodeJS.Timeout | null = null;

// Preload sounds for better performance
const preloadSounds = () => {
  Object.values(soundOptions).forEach(soundUrl => {
    const tempAudio = new Audio(soundUrl);
    tempAudio.preload = "auto";
  });
};

// Try to preload sounds on module import
try {
  preloadSounds();
} catch (error) {
  console.warn("Could not preload sounds:", error);
}

export const playSound = (soundType: string = "notification", volume: number = 0.5, loop: boolean = false) => {
  try {
    if (audio) {
      stopSound();
    }

    // Get the correct sound URL or fallback to notification
    const soundUrl = soundOptions[soundType as keyof typeof soundOptions] || soundOptions.notification;
    
    // Create new audio instance
    audio = new Audio(soundUrl);
    audio.volume = Math.max(0, Math.min(1, volume)); // Ensure volume is between 0 and 1
    audio.loop = loop;
    
    console.log(`Playing sound: ${soundType}, volume: ${volume}, loop: ${loop}, url: ${soundUrl}`);
    
    // Use promise with user interaction context
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error("Error playing sound:", error);
        if (error.name === "NotAllowedError") {
          console.warn("Audio playback was prevented by browser. User interaction is required first.");
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error("Failed to play sound:", error);
    return false;
  }
};

export const stopSound = () => {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    audio = null;
    console.log("Sound stopped");
    return true;
  }
  return false;
};

// Set up a repeating notification
export const startAlertNotification = (soundType: string, volume: number, intervalSeconds: number = 10) => {
  // First play immediately
  playSound(soundType, volume, false);
  
  // Then set up interval
  if (notificationInterval) {
    clearInterval(notificationInterval);
  }
  
  notificationInterval = setInterval(() => {
    playSound(soundType, volume, false);
  }, intervalSeconds * 1000);
  
  console.log(`Started alert notification with sound: ${soundType}, volume: ${volume}, interval: ${intervalSeconds}s`);
  return true;
};

export const stopAlertNotification = () => {
  stopSound();
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
    console.log("Alert notification stopped");
    return true;
  }
  return false;
};

// Request permission for browser notifications
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
    return false;
  }
  
  if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  
  return Notification.permission === "granted";
};

// Send a browser notification
export const sendBrowserNotification = (title: string, options?: NotificationOptions) => {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return false;
  }
  
  try {
    new Notification(title, options);
    return true;
  } catch (error) {
    console.error("Error sending notification:", error);
    return false;
  }
};
