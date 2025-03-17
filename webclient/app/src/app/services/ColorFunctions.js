
class ColorFunctions {

    generateDistinctColors(n) {
        const colors = [];
        // Use golden ratio to help spread the hues evenly
        const goldenRatio = 0.618033988749895;
        let hue = Math.random(); // Start at random hue

        for (let i = 0; i < n; i++) {
            hue = (hue + goldenRatio) % 1; // Use golden ratio to increment hue

            // Convert HSV to RGB
            // Using fixed Saturation (100%) and Value (100%) for vibrant colors
            const rgb = this.hsvToRgb(hue, 1, 1);

            // Scale to your desired range (0-100 in this case)
            colors.push([
                Math.round(rgb[0] * 100),
                Math.round(rgb[1] * 100),
                Math.round(rgb[2] * 100)
            ]);
        }

        return colors;
    }

    hsvToRgb(h, s, v) {
        let r, g, b;
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }

        return [r, g, b];
    }
}

export default ColorFunctions;