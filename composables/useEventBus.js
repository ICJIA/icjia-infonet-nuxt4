import mitt from "mitt";

const emitter = mitt();

console.log("mitt loaded");

export const useEvent = emitter.emit;
export const useListen = emitter.on;

// How to use:
// fire an event
// useEvent('user:registered', { name: 'Chris'})

// capture
// useListen('user:registered', (user) => console.log(user))
