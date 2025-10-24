/**
 * Event bus composable using mitt
 * Provides application-wide event emitter for component communication
 * @module composables/useEventBus
 * @see {@link https://github.com/developit/mitt|mitt documentation}
 */

import mitt from "mitt";

/**
 * Global event emitter instance
 * @type {Object}
 * @private
 */
const emitter = mitt();

console.log("mitt loaded");

/**
 * Emit an event to all listeners
 * @function useEvent
 * @param {string} eventName - Name of the event to emit
 * @param {*} data - Data to pass to event listeners
 * @example
 * // Emit a user registration event
 * useEvent('user:registered', { name: 'Chris', email: 'chris@example.com' })
 */
export const useEvent = emitter.emit;

/**
 * Listen for events emitted by useEvent
 * @function useListen
 * @param {string} eventName - Name of the event to listen for
 * @param {Function} callback - Function to call when event is emitted
 * @returns {Function} Unsubscribe function to remove listener
 * @example
 * // Listen for user registration events
 * useListen('user:registered', (user) => {
 *   console.log(`User registered: ${user.name}`);
 * });
 */
export const useListen = emitter.on;
