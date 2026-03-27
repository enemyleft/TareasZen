import { Trans as Translation } from "@lingui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { msg } from "@lingui/core/macro";
import monk from "../assets/monk3.png";

interface ZenDialogProps {
  onClose: () => void;
  type: "task" | "periodic";
}

const taskMessages = [
  msg`Well done. Take a deep breath.`,
  msg`Great work. How about a short walk?`,
  msg`Task complete. Stretch your shoulders.`,
  msg`Nice! Time for a sip of water.`,
  msg`Done. Look out the window for a moment.`,
  msg`Accomplished. Roll your neck gently.`,
  msg`Finished. Close your eyes for 10 seconds.`,
  msg`Complete. Stand up and stretch.`,
  msg`Good job. Take three slow breaths.`,
  msg`Success. Rest your eyes from the screen.`,
  msg`Well done. Wiggle your fingers and toes.`,
  msg`Great. How about a cup of tea?`,
  msg`Done. Notice how you're sitting right now.`,
  msg`Completed. Give yourself a moment of stillness.`,
  msg`Nice work. Let your shoulders drop.`,
];

const periodicMessages = [
  msg`Time for a short break. Stand up and stretch.`,
  msg`Pause for a moment. Take three deep breaths.`,
  msg`How about a quick walk?`,
  msg`Rest your eyes. Look at something far away.`,
  msg`Roll your shoulders and relax your jaw.`,
  msg`Time to hydrate. Get a glass of water.`,
  msg`Take a mindful minute. How are you feeling?`,
  msg`Stretch your hands and wrists.`,
  msg`Look away from the screen for 20 seconds.`,
  msg`Check your posture. Sit up straight.`,
  msg`Time for a micro-break. Breathe slowly.`,
  msg`Relax your face muscles. Unclench your jaw.`,
  msg`How about some fresh air?`,
  msg`Give your mind a moment of rest.`,
  msg`Notice your breathing. Slow it down.`,
];

export function ZenDialog({ onClose, type }: ZenDialogProps) {
  const { t } = useLingui();
  const messages = type === "task" ? taskMessages : periodicMessages;
  const message = messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="modal-overlay">
      <div className="modal zen-modal" onClick={(e) => e.stopPropagation()}>
        <div className="zen-icon">
          <img src={monk} alt={t`Zen Monk`} width="200" height="200"/>
        </div>
        <p className="zen-message"><Translation id={message.id} /></p>
        <button className="btn-primary" onClick={onClose}>
          <Trans>
            Continue
          </Trans>
        </button>
      </div>
    </div>
  );
}


