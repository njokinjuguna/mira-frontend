// src/global.d.ts

declare global {
    interface Window {
      SpeechRecognition: typeof SpeechRecognition;
      webkitSpeechRecognition: typeof SpeechRecognition;
    }
  
    // If needed (for TS to accept SpeechRecognition)
    var SpeechRecognition: {
      prototype: SpeechRecognition;
      new (): SpeechRecognition;
    };
  
    var webkitSpeechRecognition: {
      prototype: SpeechRecognition;
      new (): SpeechRecognition;
    };
  }
  
  export {};
  
  