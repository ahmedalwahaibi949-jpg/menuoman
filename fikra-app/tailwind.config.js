/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#071426", 800: "#0B1D36", 700: "#102848", 600: "#1A3A63" },
        teal: { DEFAULT: "#00D6C5", 600: "#00B3A5", 700: "#008F84", soft: "#E3FAF7" },
        paper: "#F7F8F5", mist: "#ECEFEA", ink: "#0B1522", slate: "#5B6676"
      },
      fontFamily: {
        display: ["Sora", "Tajawal", "system-ui", "sans-serif"],
        body: ["Manrope", "Tajawal", "system-ui", "sans-serif"]
      },
      boxShadow: { glow: "0 0 40px -8px rgba(0,214,197,.55)", card: "0 1px 2px rgba(7,20,38,.05), 0 18px 40px -22px rgba(7,20,38,.28)" },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        rise: { from: { opacity: "0", transform: "translateY(18px)" }, to: { opacity: "1", transform: "none" } },
        draw: { to: { strokeDashoffset: "0" } },
        pulseDot: { "0%,100%": { opacity: ".35" }, "50%": { opacity: "1" } },
        grow: { from: { transform: "scaleY(.15)" }, to: { transform: "scaleY(1)" } },
        slide: { from: { transform: "translateX(-100%)" }, to: { transform: "translateX(100%)" } }
      },
      animation: { float: "float 7s ease-in-out infinite", rise: "rise .7s cubic-bezier(.2,.7,.2,1) both", pulseDot: "pulseDot 2.4s ease-in-out infinite" }
    }
  },
  plugins: []
};
