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

// const root = document.createElement("div");
// root.id = ROOT_ID;

// document.body.append(root);

// const renderIn = document.createElement("div");
// renderIn.id = SHADOW_ROOT_ID;

// const shadow = root.attachShadow({ mode: "open" });
// shadow.appendChild(renderIn);

// createRoot(renderIn).render(<App />);

const rcnt = document.querySelector(`#rcnt`);

const rhs = document.querySelector(`#rhs`);

// youtube
const secondary = document.querySelector(`#secondary`);

// naver
const sub_pack = document.querySelector(`#sub_pack`);

// daum or nate
const mAside = document.querySelector(`#mAside`);

// zum
const aside = document.querySelector(`#aside`);

// yahoo
const right = document.querySelector(`#right`);

const root2 = document.createElement("div");
root2.id = ROOT_ID;
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
    root2.style.minWidth = "372px";
    root2.style.width = "372px";
    // youtube의 secondary에 root2를 넣어준다.
    secondary.prepend(root2);
  } else {
    const primary = document.querySelector(`#primary`);

    if (primary) {
      // primary의 부모에 생성한 div를 넣어준다.

      const parent = primary.parentNode;
      const div = document.createElement("div");
      div.id = "secondary";
      div.style.display = "flex";
      div.style.flexDirection = "column";
      div.style.minWidth = "372px";
      div.style.width = "372px";
      div.style.flex = "1";
      div.append(root2);
      parent?.appendChild(div);
    }
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

if (url.includes("naver")) {
  // 현재 주소가 naver일 경우
  if (sub_pack) {
    root2.style.position = "relative";
    sub_pack.prepend(root2);
  }
}

if (url.includes("daum")) {
  // 현재 주소가 daum일 경우
  if (mAside) {
    root2.style.position = "relative";
    mAside.prepend(root2);
  }
}

if (url.includes("nate")) {
  // 현재 주소가 nate일 경우
  if (mAside) {
    root2.style.position = "relative";
    mAside.prepend(root2);
  }
}

if (url.includes("zum")) {
  // 현재 주소가 zum일 경우
  if (aside) {
    root2.style.position = "relative";
    aside.prepend(root2);
  }
}

if (url.includes("yahoo")) {
  // 현재 주소가 yahoo일 경우
  if (right) {
    root2.style.position = "relative";
    right.prepend(root2);
  }
}

const renderIn2 = document.createElement("div");
renderIn2.id = SHADOW_ROOT_ID;

const shadow2 = root2.attachShadow({ mode: "open" });
shadow2.appendChild(renderIn2);

createRoot(renderIn2).render(<SideApp />);
