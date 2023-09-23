import packageJson from "./package.json";

/**
 * After changing, please reload the extension at `chrome://extensions`
 */
const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: "__MSG_extensionName__",
  default_locale: "ko",
  version: packageJson.version,
  description: "__MSG_extensionDescription__",
  options_ui: {
    page: "src/pages/options/index.html",
    open_in_tab: true,
  },
  background: {
    service_worker: "src/pages/background/index.js",
    type: "module",
  },
  action: {
    default_popup: "src/pages/popup/index.html",
    default_icon: {
      34: "icon-34.png",
      128: "icon-128.png",
    },
    default_title: "__MSG_extensionName__",
  },
  permissions: ["storage"],
  icons: {
    "34": "icon-34.png",
    "128": "icon-128.png",
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*", "<all_urls>"],
      js: ["src/pages/content/index.js"],
      css: ["assets/css/contentStyle.chunk.css"],
    },
  ],
  web_accessible_resources: [
    {
      resources: [
        "assets/js/*.js",
        "assets/css/*.css",
        "assets/images/*.png",
        "assets/images/*.svg",
        "icon-128.png",
        "icon-34.png",
        "checky-hand-big.svg",
        "checky-hand.svg",
        "checky-hand.png",
        "checky-hand-2.png",
        "checky-hand-64.png",
        "src/assets/images/*.png",
        "src/assets/images/*.svg",
      ],
      matches: ["*://*/*"],
    },
  ],
  commands: {
    toggle: {
      suggested_key: {
        // 컨트롤과 시프트 그리고 콤마를 누르면 토글 기능이 실행됩니다.
        default: "Ctrl+Shift+6",
        mac: "Command+Shift+6",
      },
      description: "Toggle feature",
    },
  },
  externally_connectable: {
    matches: ["*://*.google.com/*"],
  },
};

export default manifest;
