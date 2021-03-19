// import "@/styles/index.scss";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/antd.css";
import { createApp } from "vue";
import App from "./App.vue";

const app = createApp(App);
app.use(Antd);
app.mount("#app");
