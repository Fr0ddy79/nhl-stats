import { getGameFeed } from "@/lib/nhl-api";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return [];
}

export default async function GamePage({ params }: PageProps) {
  const { id } = await params;
  const gamePk = Number(id);

  let game: Awaited<ReturnType<typeof getGameFeed>>;
  try {
    game = await getGameFeed(gamePk);
  } catch {
    return (
      <main style={{ padding: "2rem", fontFamily: "system-ui", maxWidth: "800px", margin: "0 auto" }}>
        <a href="/" style={{ color: "#0066cc", textDecoration: "none", fontSize: "0.875rem" }}>← Back</a>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "1rem" }}>Game not found</h1>
        <p style={{ color: "#666" }}>ID: {gamePk}</p>
      </main>
    );
  }

  const away = game.teams.away;
  const home = game.teams.home;
  const state = game.status.abstractGameState;
  const ls = game.linescore;
  const isLive = state === "Live";

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui", maxWidth: "900px", margin: "0 auto" }}>
      {/* Back */}
      <div style={{ marginBottom: "1.5rem" }}>
        <a href="/" style={{ color: "#0066cc", textDecoration: "none", fontSize: "0.875rem" }}>← Back to NHL Stats</a>
      </div>

      {/* Header */}
      <header style={{ textAlign: "center", marginBottom: "2rem", padding: "1.5rem", background: "#f8f8f8", borderRadius: "12px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "1.5rem" }}>
          {/* Away */}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800 }}>{away.team.abbreviation}</div>
            <div style={{ color: "#666", fontSize: "0.875rem" }}>{away.team.locationName}</div>
            <div style={{ fontSize: "0.8rem", color: "#888", marginTop: "0.25rem" }}>
              {away.leagueRecord.wins}-{away.leagueRecord.losses}-{away.leagueRecord.ot}
            </div>
          </div>

          {/* Score */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", fontWeight: 900, lineHeight: 1 }}>
              {away.score} <span style={{ color: "#ccc", fontSize: "2rem" }}>@</span> {home.score}
            </div>
            <div style={{ marginTop: "0.5rem", fontSize: "0.875rem", fontWeight: 700, color: isLive ? "#cc0000" : "#444" }}>
              {state === "Final" ? "FINAL" : isLive ? `LIVE — ${ls?.periodTime ?? ""}` : new Date(game.gameDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </div>
            {isLive && ls?.currentPeriod && (
              <div style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "#888" }}>
                {ls.periodTime} — {ls.currentPeriod === 5 ? "OT" : ls.currentPeriod === 6 ? "SO" : `Period ${ls.currentPeriod}`}
              </div>
            )}
          </div>

          {/* Home */}
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800 }}>{home.team.abbreviation}</div>
            <div style={{ color: "#666", fontSize: "0.875rem" }}>{home.team.locationName}</div>
            <div style={{ fontSize: "0.8rem", color: "#888", marginTop: "0.25rem" }}>
              {home.leagueRecord.wins}-{home.leagueRecord.losses}-{home.leagueRecord.ot}
            </div>
          </div>
        </div>
      </header>

      {/* Period by Period */}
      {ls?.periods && ls.periods.length > 0 && (
        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#444", marginBottom: "1rem" }}>
            Period by Period
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th style={{ padding: "0.5rem 1rem", textAlign: "left", fontWeight: 700, textTransform: "uppercase", fontSize: "0.7rem", color: "#888" }}>Team</th>
                  {ls.periods.map((p, i) => (
                    <th key={i} style={{ padding: "0.5rem 1rem", textAlign: "center", fontWeight: 700, textTransform: "uppercase", fontSize: "0.7rem", color: "#888" }}>
                      {p.ordinalNum}
                    </th>
                  ))}
                  <th style={{ padding: "0.5rem 1rem", textAlign: "center", fontWeight: 700, textTransform: "uppercase", fontSize: "0.7rem", color: "#888" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {[{ team: away.team.abbreviation, goals: ls.periods.map((p) => p.away.goals), total: away.score, color: "#111" },
                  { team: home.team.abbreviation, goals: ls.periods.map((p) => p.home.goals), total: home.score, color: "#111" }].map((row) => (
                  <tr key={row.team} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "0.5rem 1rem", fontWeight: 700 }}>{row.team}</td>
                    {row.goals.map((g, i) => (
                      <td key={i} style={{ padding: "0.5rem 1rem", textAlign: "center" }}>{g}</td>
                    ))}
                    <td style={{ padding: "0.5rem 1rem", textAlign: "center", fontWeight: 800 }}>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Shots on Goal */}
          <div style={{ marginTop: "1rem" }}>
            <h3 style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#888", marginBottom: "0.5rem" }}>Shots on Goal</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", maxWidth: "400px" }}>
              {[{ team: away.team.abbreviation, shots: ls.periods.map((p) => p.away.shotsOnGoal) },
               { team: home.team.abbreviation, shots: ls.periods.map((p) => p.home.shotsOnGoal) }].map(({ team, shots }) => (
                <div key={team} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, width: "2.5rem" }}>{team}</span>
                  <div style={{ flex: 1, height: "6px", background: "#eee", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(shots.reduce((a, b) => a + b, 0) / 50) * 100}%`, background: "#0066cc", borderRadius: "3px" }} />
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "#666", width: "2rem", textAlign: "right" }}>{shots.reduce((a, b) => a + b, 0)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stars */}
      {game.decisions && (
        <section>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#444", marginBottom: "1rem" }}>
            Three Stars
          </h2>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {[game.decisions.firstStar, game.decisions.secondStar, game.decisions.thirdStar].map((star, i) => (
              <div key={i} style={{ flex: 1, minWidth: "140px", background: "#f8f8f8", borderRadius: "8px", padding: "0.875rem", textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>{["🥇", "🥈", "🥉"][i]}</div>
                <div style={{ fontWeight: 800, fontSize: "0.9rem" }}>{star.fullName}</div>
                <div style={{ color: "#888", fontSize: "0.75rem", textTransform: "uppercase" }}>#{star.id}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Metadata */}
      <section style={{ marginTop: "2rem", padding: "1rem", background: "#f8f8f8", borderRadius: "8px", fontSize: "0.8rem", color: "#888" }}>
        <strong>Game ID:</strong> {gamePk} &nbsp;&bull;&nbsp; <strong>Type:</strong> {game.gameType === "R" ? "Regular Season" : game.gameType === "P" ? "Playoffs" : "All-Star"} &nbsp;&bull;&nbsp; <strong>Season:</strong> {game.season}
      </section>
    </main>
  );
}
