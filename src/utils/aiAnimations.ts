// Animation utilities for AI trading assistant

/**
 * Smoothly moves the AI cursor to a target element
 */
export function moveCursorTo(
    cursorElement: HTMLElement,
    targetElement: HTMLElement
): void {
    const rect = targetElement.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    cursorElement.style.transform = `translate(${x}px, ${y}px)`;
}

/**
 * Types text into an input field character by character (human-like)
 */
export async function typeLikeHuman(
    inputElement: HTMLInputElement | HTMLSelectElement,
    text: string,
    delayMs: number = 120
): Promise<void> {
    if (inputElement instanceof HTMLInputElement) {
        inputElement.value = "";
        inputElement.focus();

        for (const char of text) {
            inputElement.value += char;
            // Trigger input event for React
            const event = new Event("input", { bubbles: true });
            inputElement.dispatchEvent(event);
            await sleep(delayMs);
        }
    }
}

/**
 * Highlights an element with a glowing effect
 */
export function highlightElement(
    element: HTMLElement,
    duration: number = 2000,
    color: string = "#4ade80"
): () => void {
    const originalBoxShadow = element.style.boxShadow;
    const originalTransition = element.style.transition;

    element.style.transition = "box-shadow 0.3s ease";
    element.style.boxShadow = `0 0 0 3px ${color}40, 0 0 20px ${color}60`;

    // Add pulse animation
    element.classList.add("ai-highlight-pulse");

    const cleanup = () => {
        element.style.boxShadow = originalBoxShadow;
        element.style.transition = originalTransition;
        element.classList.remove("ai-highlight-pulse");
    };

    if (duration > 0) {
        setTimeout(cleanup, duration);
    }

    return cleanup;
}

/**
 * Async sleep utility
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Scrolls an element into view smoothly
 */
export function scrollIntoView(element: HTMLElement): void {
    element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
    });
}

/**
 * Gets the center position of an element
 */
export function getElementCenter(element: HTMLElement): { x: number; y: number } {
    const rect = element.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
    };
}
