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
   GET FLAG
========================= */
function countryToFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return "🏳️";

  const codePoints = [...countryCode.toUpperCase()].map(
    char => 127397 + char.charCodeAt()
  );

  return String.fromCodePoint(...codePoints);
}

/* =========================
   GAME STATE
========================= */
let score = 0;

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
   Get Country
============================ */
async function getCountry() {
  const cached = localStorage.getItem("countryData");
  if (cached) return JSON.parse(cached);

  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();

    const countryData = {
      code: data.country_code || "XX",
      name: data.country_name || "Unknown"
    };

    localStorage.setItem("countryData", JSON.stringify(countryData));
    return countryData;
  } catch {
    return { code: "XX", name: "Unknown" };
  }
}

/* =========================
   SAVE SCORE (RPC)
========================= */
async function saveScore() {
  const country = await getCountry();

  await sb.rpc("increment_country_score", {
    ctry: country.code
  });

  loadLeaderboard();
}

/* =========================
   LOAD LEADERBOARD
========================= */
let myCountry = {
  code: "XX",
  name: "Unknown"
};
(async function init() {
  myCountry = await getCountry();
  loadLeaderboard();
})();

async function loadLeaderboard() {
  const { data, error } = await sb
    .from("leaderboard_country")
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

    const flag = countryToFlagEmoji(row.country);

    const countryName =
      row.country === myCountry.code
        ? myCountry.name
        : row.country;

    li.innerHTML = `
      <span class="rank">#${i + 1}</span>
      <span class="flag">${flag}</span>
      <span class="country">${countryName}</span>
      <span class="score">${row.score}</span>
    `;

    if (row.country === myCountry.code) {
      li.style.border = "2px solid gold";
    }

    list.appendChild(li);
  });
}