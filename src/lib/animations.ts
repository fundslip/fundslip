// Minimal, purposeful animations only.
// This is a financial product — motion should feel solid, not bouncy.

export const ease = [0.25, 0.1, 0.25, 1] as const;

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease } },
};

export const buttonHover = {
  y: -1,
  transition: { duration: 0.15, ease },
};

export const buttonTap = {
  scale: 0.98,
  transition: { duration: 0.1 },
};
