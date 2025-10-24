/**
 * Global state management composables for ICJIA InfoNet
 * Uses Nuxt's built-in useState composable for reactive global state
 * @module composables/states
 */

/**
 * Counter state composable
 * Provides a global counter that can be incremented/decremented across components
 * @returns {Ref<number>} Reactive counter state initialized to 0
 * @example
 * const counter = useCounter();
 * counter.value++; // Increment counter
 */
export const useCounter = () => useState<number>("counter", () => 0);

/**
 * Color state composable
 * Manages global color preference for theming
 * @returns {Ref<string>} Reactive color state initialized to "pink"
 * @example
 * const color = useColor();
 * color.value = "blue"; // Change theme color
 */
export const useColor = () => useState<string>("color", () => "pink");

/**
 * Navigation toggle state composable
 * Controls visibility of navigation drawer/sidebar across the application
 * @returns {Ref<boolean>} Reactive boolean state for nav visibility (default: false)
 * @example
 * const navToggle = useNavToggle();
 * navToggle.value = true; // Show navigation
 */
export const useNavToggle = () => useState<boolean>("nav", () => false);

/**
 * Simple counter with initial value
 * Creates a counter state with a custom starting value
 * @param {number} val - Initial value for the counter
 * @returns {Ref<number>} Reactive counter state initialized to provided value
 * @example
 * const counter = useSimpleCounter(10);
 * console.log(counter.value); // 10
 */
export const useSimpleCounter = (val: number) =>
  useState<number>("test", () => val);

/**
 * Translation toggle state composable
 * Controls whether translation mode is enabled for the application
 * @returns {Ref<boolean>} Reactive boolean state for translation mode (default: false)
 * @example
 * const translateToggle = useTranslateToggle();
 * translateToggle.value = true; // Enable translation
 */
export const useTranslateToggle = () =>
  useState<boolean>("translate", () => false);
