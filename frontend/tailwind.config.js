/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/_layout.tsx", "./components/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
         primary: "#1DA1F2", // Twitter Blue
  secondary: "#14171A", // Dark Gray
  background: "#ffffff", // White
  text: "#14171A", // Dark Gray
  secondaryText: "#657786", // Light Gray
  border: "#E1E8ED", // Light Gray
  success: "#17BF63", // Green
  danger: "#E0245E", // Red
  lightGray: "#AAB8C2", // Light Gray for icons
  extraLightGray: "#F5F8FA", // Extra Light Gray for backgrounds
      },
    },
  },
  plugins: [],
}