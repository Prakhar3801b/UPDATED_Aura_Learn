/**
 * Aura_Learn Background - Vanta.js Edition
 * Uses Vanta.js Globe effect.
 */

document.addEventListener('DOMContentLoaded', () => {
    try {
        VANTA.GLOBE({
            el: "#vanta-canvas",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x007acc,     // Blue accent
            color2: 0xffffff,    // White secondary
            backgroundColor: 0x0e0e0e, // Dark background
            size: 1.00
        });
    } catch (e) {
        console.error("Vanta JS failed to load:", e);
    }
});
