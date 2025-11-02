import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './blog/router';

// 导入全局样式（包含设计令牌、工具类等）
import './styles/index.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.mount('#app');
