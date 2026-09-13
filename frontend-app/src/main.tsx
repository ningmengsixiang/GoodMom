import React from "react";
import ReactDOM from "react-dom/client";
/* 样式顺序即优先级，不可调换（19.7）：
   ① Arco 原生 → ② gm.css（Token 与组件皮肤唯一源）→ ③ 应用布局 */
import "@arco-design/web-react/dist/css/arco.css";
import "@gm/gm.css";
import "./styles/index.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
