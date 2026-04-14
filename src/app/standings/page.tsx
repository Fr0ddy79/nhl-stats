import { getStandings } from "@/lib/nhl-api";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StandingsPage() {
  const standings = await getStandings();

  const divisions = standings.reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (acc: Record<string, any[]>, team) => {
      const div = team.division?.name ?? "Other";
      if (!acc[div]) acc[div] = [];
      acc[div].push(team);
      return acc;
    },
    {}
  );

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/" style={{ color: "#0066cc", textDecoration: "none", fontSize: "0.875rem" }}>
          ← Back to NHL Stats
        </Link>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: "0.75rem 0 0" }}>
          NHL Standings — {new Date().getFullYear()} Season
        </h1>
        <p style={{ color: "#666", margin: "0.25rem 0 0", fontSize: "0.875rem" }}>
          Eastern and Western Conference standings
        </p>
      </div>

      {Object.entries(divisions)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([divName, teams]) => (
          <section key={divName} style={{ marginBottom: "2.5rem" }}>
            <h2
              style={{
                fontSize: "0.8rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#444",
                borderBottom: "2px solid #eee",
                paddingBottom: "0.5rem",
                marginBottom: "0.75rem",
              }}
            >
              {divName}
            </h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", minWidth: "700px" }}>
                <thead>
                  <tr style={{ background: "#f5f5f5" }}>
                    {["#", "Team", "GP", "W", "L", "OT", "PTS", "P%", "GF", "GA", "GD", "STRK"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "0.5rem 0.75rem",
                          textAlign: "center",
                          fontWeight: 700,
                          fontSize: "0.65rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "#666",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {teams.map((t: any, i: number) => {
                    const gd = (t.goalsFor ?? 0) - (t.goalsAgainst ?? 0);
                    const streak = t.streak?.streakCode ?? "—";
                    return (
                      <tr
                        key={t.team.id}
                        style={{ borderBottom: "1px solid #f0f0f0", background: i === 0 ? "#fafffe" : undefined }}
                      >
                        <td style={{ padding: "0.6rem 0.75rem", textAlign: "center", color: "#888", fontSize: "0.75rem" }}>
                          {i + 1}
                        </td>
                        <td style={{ padding: "0.6rem 0.75rem" }}>
                          <Link
                            href={`/team/${t.team.id}`}
                            style={{ color: "#111", textDecoration: "none", fontWeight: 600, whiteSpace: "nowrap" }}
                          >
                            {t.team.name}
                          </Link>
                        </td>
                        {[
                          t.gamesPlayed,
                          t.wins,
                          t.losses,
                          t.otLosses,
                          t.points,
                          Number(t.pointPercentage).toFixed(3),
                          t.goalsFor,
                          t.goalsAgainst,
                          gd > 0 ? `+${gd}` : gd,
                          streak,
                        ].map((val, j) => (
                          <td
                            key={j}
                            style={{
                              padding: "0.6rem 0.75rem",
                              textAlign: "center",
                              fontWeight: j === 4 ? 800 : 500,
                              color: j === 4 ? "#0066cc" : j === 8 ? (gd > 0 ? "green" : gd < 0 ? "red" : "#444") : "#111",
                              fontSize: j === 9 ? "0.75rem" : "0.8rem",
                            }}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
    </main>
  );
}
