/* =========================
   SUPABASE CONFIG
========================= */
const SUPABASE_URL = 'https://qqnmfjtsdqyjyqsiovjd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_AeDi45nGx1WsV1YtyT-guw_CSoDk10f';

const sb = window.supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);

/* =========================
   GAME STATE
========================= */
let score = 0;
const username = localStorage.getItem("username") ||
prompt("Masukkan username:");

localStorage.setItem("username", username);

const scoreEl = document.getElementById("score");
const btn = document.getElementById("tapBtn");

/* =========================
   TAP HANDLER
========================= */
let resetTimeout = null;

btn.addEventListener("click", () => {
  score++;
  scoreEl.textContent = `Tap Score: ${score}`;

  btn.style.backgroundImage = "url('assets/hit.png')";

  const r = Math.floor(Math.random() * 3) + 1;
  new Audio(`assets/hitfx/hit${r}.mp3`).play();

  clearTimeout(resetTimeout);
  resetTimeout = setTimeout(() => {
    btn.style.backgroundImage = "url('assets/idle.png')";
  }, 120);

  saveScore(); // ⬅️ PENTING
  console.log("Saving score for:", username);
});

/* =========================
   SAVE SCORE (UPSERT)
========================= */
async function saveScore() {
  console.log("Saving score for:", username);

  // 1️⃣ Coba UPDATE dulu
  const { data, error } = await supabase
    .from("leaderboard")
    .update({ score: supabase.rpc ? undefined : undefined })
    .eq("username", username)
    .select();

  // Cara benar pakai increment:
  const updateResult = await supabase.rpc("increment_score", {
    uname: username
  });

  if (updateResult.error) {
    console.error("RPC error:", updateResult.error);
  }

  loadLeaderboard();
}

/* =========================
   LOAD LEADERBOARD
========================= */
async function loadLeaderboard() {
const { data } = await sb
.from("leaderboard")
.select("*")
.order("score", { ascending: false })
.limit(10);

const list = document.getElementById("leaderboardList");
list.innerHTML = "";

data.forEach((row, i) => {
const li = document.createElement("li");
li.textContent = `${i + 1}. ${row.username} — ${row.score}`;
list.appendChild(li);
});
}

loadLeaderboard();