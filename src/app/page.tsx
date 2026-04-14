import { getDateSchedule, getStandings } from "@/lib/nhl-api";

export const dynamic = "force-dynamic";

async function getData() {
  const today = new Date().toISOString().split("T")[0];
  const [schedule, standings] = await Promise.all([
    getDateSchedule(today),
    getStandings(),
  ]);
  return { schedule, standings };
}

export default async function HomePage() {
  const { schedule, standings } = await getData();
  const games = schedule.games ?? [];

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: "1100px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem", borderBottom: "1px solid #eee", paddingBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>
              NHL Stats
            </h1>
            <p style={{ color: "#666", margin: "0.25rem 0 0", fontSize: "0.875rem" }}>
              Live schedule, standings &amp; team data &mdash; Powered by NHL official API
            </p>
          </div>
          <nav style={{ display: "flex", gap: "1rem", fontSize: "0.875rem" }}>
            <a href="/players" style={{ color: "#0066cc", textDecoration: "none", fontWeight: 600 }}>Players</a>
            <a href="/standings" style={{ color: "#0066cc", textDecoration: "none", fontWeight: 600 }}>Standings</a>
          </nav>
        </div>
      </header>

      {/* ── Today&apos;s Games ── */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#444" }}>
          {games.length > 0 ? `${schedule.date} — ${games.length} Game${games.length !== 1 ? "s" : ""}` : "No Games Today"}
        </h2>
        {games.length === 0 ? (
          <p style={{ color: "#888" }}>No games scheduled for today. Check back on a game day.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {games.map((game) => {
              const away = game.teams.away;
              const home = game.teams.home;
              const state = game.status.abstractGameState;
              const isPre = state === "Preview";
              return (
                <div
                  key={game.gamePk}
                  style={{
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    padding: "1rem 1.25rem",
                    display: "grid",
                    gridTemplateColumns: "1fr auto 1fr",
                    alignItems: "center",
                    gap: "1rem",
                    background: state === "Live" ? "#f0f7ff" : "#fafafa",
                  }}
                >
                  {/* Away Team */}
                  <div style={{ textAlign: "right" }}>
                    <a href={`/team/${away.team.id}`} style={{ fontWeight: 700, fontSize: "1rem", color: "#111", textDecoration: "none" }}>{away.team.abbreviation}</a>
                    <div style={{ color: "#666", fontSize: "0.8rem" }}>{away.team.locationName}</div>
                  </div>

                  {/* Score / VS */}
                  <div style={{ textAlign: "center" }}>
                    {isPre ? (
                      <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#888", padding: "0.25rem 0.75rem", border: "1px solid #ddd", borderRadius: "4px" }}>
                        {new Date(game.gameDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" })}
                      </div>
                    ) : (
                      <>
                        <span style={{ fontWeight: 800, fontSize: "1.5rem" }}>{away.score}</span>
                        <span style={{ color: "#ccc", margin: "0 0.5rem" }}>@</span>
                        <span style={{ fontWeight: 800, fontSize: "1.5rem" }}>{home.score}</span>
                      </>
                    )}
                    <div style={{ fontSize: "0.7rem", color: "#888", marginTop: "0.125rem" }}>
                      {state === "Final" ? "FINAL" : state === "Live" ? "LIVE" : game.status.detailedState}
                    </div>
                  </div>

                  {/* Home Team */}
                  <div style={{ textAlign: "left" }}>
                    <a href={`/team/${home.team.id}`} style={{ fontWeight: 700, fontSize: "1rem", color: "#111", textDecoration: "none" }}>{home.team.abbreviation}</a>
                    <div style={{ color: "#666", fontSize: "0.8rem" }}>{home.team.locationName}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Standings ── */}
      <section>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#444" }}>
          {new Date().getFullYear()} Standings
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                {["#", "Team", "GP", "W", "L", "OT", "PTS", "GF", "GA", "GD", "P%"].map((h) => (
                  <th key={h} style={{ padding: "0.5rem 0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#555", borderBottom: "2px solid #ddd", whiteSpace: "nowrap", textAlign: "center" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(standings ?? []).map((rec, i) => {
                const gp = rec.gamesPlayed;
                const gd = rec.goalsFor - rec.goalsAgainst;
                return (
                  <tr key={rec.team.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={{ padding: "0.4rem 0.75rem", textAlign: "center", color: "#aaa", fontSize: "0.7rem" }}>{i + 1}</td>
                    <td style={{ padding: "0.4rem 0.75rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                      <a href={`/team/${rec.team.id}`} style={{ color: "#111", textDecoration: "none" }}>{rec.team.name}</a>
                    </td>
                    <td style={{ padding: "0.4rem 0.75rem", textAlign: "center" }}>{rec.gamesPlayed}</td>
                    <td style={{ padding: "0.4rem 0.75rem", textAlign: "center", fontWeight: 600 }}>{rec.wins}</td>
                    <td style={{ padding: "0.4rem 0.75rem", textAlign: "center" }}>{rec.losses}</td>
                    <td style={{ padding: "0.4rem 0.75rem", textAlign: "center", color: "#888" }}>{rec.otLosses}</td>
                    <td style={{ padding: "0.4rem 0.75rem", textAlign: "center", fontWeight: 800 }}>{rec.points}</td>
                    <td style={{ padding: "0.4rem 0.75rem", textAlign: "center" }}>{rec.goalsFor}</td>
                    <td style={{ padding: "0.4rem 0.75rem", textAlign: "center" }}>{rec.goalsAgainst}</td>
                    <td style={{ padding: "0.4rem 0.75rem", textAlign: "center", color: gd > 0 ? "green" : gd < 0 ? "red" : "#888" }}>
                      {gd > 0 ? `+${gd}` : gd}
                    </td>
                    <td style={{ padding: "0.4rem 0.75rem", textAlign: "center", color: "#555" }}>{rec.pointPercentage}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
