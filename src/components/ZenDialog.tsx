interface ZenDialogProps {
  onClose: () => void;
}

const zenMessages = [
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

export function ZenDialog({ onClose }: ZenDialogProps) {
  const message = zenMessages[Math.floor(Math.random() * zenMessages.length)];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal zen-modal" onClick={(e) => e.stopPropagation()}>
        <div className="zen-icon">🧘‍♀️</div>
        <p className="zen-message">{message}</p>
        <button className="btn-primary" onClick={onClose}>
          Continue
        </button>
      </div>
    </div>
  );
}