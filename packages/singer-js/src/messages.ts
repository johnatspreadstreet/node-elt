export const stateMessage = (value) => ({
  type: 'STATE',
  value,
});

export const writeMessage = (message) => {
  process.stdout.write(JSON.stringify(message));
};

export const writeState = (value) => {
  writeMessage(stateMessage(value));
};
