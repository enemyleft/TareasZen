import monk from "../assets/monk3.png";

interface ZenDialogProps {
  onClose: () => void;
  type: "task" | "periodic";
}

const taskMessages = [
  "Well done. Take a deep breath.",
  "Great work. How about a short walk?",
  "Task complete. Stretch your shoulders.",
  "Nice! Time for a sip of water.",
  "Done. Look out the window for a moment.",
  "Accomplished. Roll your neck gently.",
  "Finished. Close your eyes for 10 seconds.",
  "Complete. Stand up and stretch.",
  "Good job. Take three slow breaths.",
  "Success. Rest your eyes from the screen.",
  "Well done. Wiggle your fingers and toes.",
  "Great. How about a cup of tea?",
  "Done. Notice how you're sitting right now.",
  "Completed. Give yourself a moment of stillness.",
  "Nice work. Let your shoulders drop.",
];

const periodicMessages = [
  "Time for a short break. Stand up and stretch.",
  "Pause for a moment. Take three deep breaths.",
  "How about a quick walk?",
  "Rest your eyes. Look at something far away.",
  "Roll your shoulders and relax your jaw.",
  "Time to hydrate. Get a glass of water.",
  "Take a mindful minute. How are you feeling?",
  "Stretch your hands and wrists.",
  "Look away from the screen for 20 seconds.",
  "Check your posture. Sit up straight.",
  "Time for a micro-break. Breathe slowly.",
  "Relax your face muscles. Unclench your jaw.",
  "How about some fresh air?",
  "Give your mind a moment of rest.",
  "Notice your breathing. Slow it down.",
];

export function ZenDialog({ onClose, type }: ZenDialogProps) {
  const messages = type === "task" ? taskMessages : periodicMessages;
  const message = messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="modal-overlay">
      <div className="modal zen-modal" onClick={(e) => e.stopPropagation()}>
        <div className="zen-icon">
          <img src={monk} alt="Zen Monk" width="200" height="200"/>
        </div>
        <p className="zen-message">{message}</p>
        <button className="btn-primary" onClick={onClose}>
          Continue
        </button>
      </div>
    </div>
  );
}


