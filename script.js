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
let username = localStorage.getItem("username");

if (!username) {
  username = prompt("Enter Your Name:");
  if (username.length > 16) {
    alert("Username maksimal 16 karakter");
    location.reload();
  } else {
    localStorage.setItem("username", username);
  }
}
const scoreEl = document.getElementById("score");
const btn = document.getElementById("tapBtn");

/* =========================
   TAP HANDLER
========================= */
let resetTimeout = null;

btn.addEventListener("click", async () => {
  score++;
  scoreEl.textContent = `Tap Score: ${score}`;

  btn.style.backgroundImage = "url('assets/hit.png')";

  const r = Math.floor(Math.random() * 3) + 1;
  new Audio(`assets/hitfx/hit${r}.mp3`).play();

  clearTimeout(resetTimeout);
  resetTimeout = setTimeout(() => {
    btn.style.backgroundImage = "url('assets/idle.png')";
  }, 120);

  await saveScore();
});

/* =========================
   SAVE SCORE (RPC)
========================= */
async function saveScore() {
  console.log("Saving score for:", username);

  const { error } = await sb.rpc("increment_score", {
    uname: username
  });

  if (error) {
    console.error("Save error:", error);
    return;
  }

  loadLeaderboard();
}

/* =========================
   LOAD LEADERBOARD
========================= */
async function loadLeaderboard() {
  const { data, error } = await sb
    .from("leaderboard")
    .select("*")
    .order("score", { ascending: false })
    .limit(10);

  if (error) {
    console.error(error);
    return;
  }

  const list = document.getElementById("leaderboardList");
  list.innerHTML = "";

  data.forEach((row, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${row.username} — ${row.score}`;
    list.appendChild(li);
  });
}

loadLeaderboard();