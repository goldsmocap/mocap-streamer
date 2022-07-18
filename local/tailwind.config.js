const { reduceEachLeadingCommentRange } = require("typescript");

module.exports = {
  content: ["./packages/renderer/src/**/*.{html,js,ts,vue}"],

  plugins: [require("daisyui")],

  daisyui: {
    styled: true,
    themes: [ {
      mytheme: {
      
      "primary": "#CCFF00",

      "primarymuted": "#DCDD3F",
              
      "secondary": "#FF007B",
              
      "accent": "#4200D9",
              
      "neutral": "#393939",
              
      "base-100": "#d9d9d9",
              
      "info": "#0CB8F2",
              
      "success": "#6EE866",
              
      "warning": "#FFEC1C",
              
      "error": "#FF4921",

      //Design Decisions

      "--rounded-box": "0rem", // border radius rounded-box utility class, used in card and other large boxes
      "--rounded-btn": "0rem", // border radius rounded-btn utility class, used in buttons and similar element
      "--rounded-badge": "0rem", // border radius rounded-badge utility class, used in badges and similar
      "--animation-btn": "0.25s", // duration of animation when you click on button
      "--animation-input": "0.2s", // duration of animation for inputs like checkbox, toggle, radio, etc
      "--btn-text-case": "uppercase", // set default text transform for buttons
      "--btn-focus-scale": "0.95", // scale transform of button when you focus on it
      "--border-btn": "1px", // border width of buttons
      "--tab-border": "1px", // border width of tabs
      "--tab-radius": "0.5rem", // border radius of tabs
      "--text": "red", 
      "--table": "0rem",
      // "--btn":"red",
    },
    },

    ],
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    prefix: "",
    darkTheme: "dark",
  },
};
