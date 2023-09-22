import { createRoot } from "react-dom/client";
import App from "@src/pages/content/src/ContentScriptApp/App";
import refreshOnUpdate from "virtual:reload-on-update-in-view";
import {
  ROOT_ID,
  SECOND_ROOT_ID,
  SECOND_SHADOW_ROOT_ID,
  SHADOW_ROOT_ID,
} from "@pages/content/src/ContentScriptApp/constant/elementId";
import SideApp from "./SideApp";

refreshOnUpdate("pages/content/src/ContentScriptApp");

const root = document.createElement("div");
root.id = ROOT_ID;

document.body.append(root);

const renderIn = document.createElement("div");
renderIn.id = SHADOW_ROOT_ID;

const shadow = root.attachShadow({ mode: "open" });
shadow.appendChild(renderIn);

createRoot(renderIn).render(<App />);

const rcnt = document.querySelector(`#rcnt`);

const rhs = document.querySelector(`#rhs`);

// youtube
const secondary = document.querySelector(`#secondary`);

const root2 = document.createElement("div");
root2.id = SECOND_ROOT_ID;
root2.style.display = "flex";
root2.style.flexDirection = "column";
root2.style.flex = "1";
root2.style.height = "fit-content";
root2.style.overflow = "hidden";
root2.style.borderRadius = "8px";
root2.style.boxShadow = "rgba(0, 0, 0, 0.1) 0px 0px 8px 0px";
root2.style.margin = "20px 0";

// 현재 페이지가 youtube일 경우
// 현재 주소 먼저 가져오기
const url = window.location.href;

// 현재 주소가 youtube일 경우
if (url.includes("youtube")) {
  if (secondary) {
    // youtube의 secondary에 root2를 넣어준다.
    secondary.prepend(root2);
  }
}

if (url.includes("google")) {
  // 현재 주소가 google일 경우
  if (rcnt) {
    root2.style.position = "relative";
    if (rhs) {
      rhs.prepend(root2);
    } else {
      rcnt.append(root2);
    }
  }
}

const renderIn2 = document.createElement("div");
renderIn2.id = SECOND_SHADOW_ROOT_ID;

const shadow2 = root2.attachShadow({ mode: "open" });
shadow2.appendChild(renderIn2);

createRoot(renderIn2).render(<SideApp />);
