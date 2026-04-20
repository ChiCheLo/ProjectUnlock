import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "../views/LoginPage.vue";
import HomePage from "../views/HomePage.vue";
import KnowledgeTree from "../views/KnowledgeTree.vue";
import LeaderboardPage from "../views/LeaderboardPage.vue";
import SeaTurtleSoup from "../views/SeaTurtleSoup.vue";
import ChatRoom from "../views/ChatRoom.vue";

const routes = [
  { path: "/login", name: "login", component: LoginPage },
  { path: "/KnowledgeTree", name: "knowledgetree", component: KnowledgeTree },
  { path: "/leaderboard", name: "leaderboard", component: LeaderboardPage },
  { path: "/sea-turtle-soup", name: "seaturtlesoup", component: SeaTurtleSoup },
  { path: "/sea-turtle-soup/:domain", name: "seaturtlesoup-domain", component: ChatRoom },
  { path: "/", name: "homepage", component: HomePage },
  { path: "/:catchAll(.*)", redirect: "/login" },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router
