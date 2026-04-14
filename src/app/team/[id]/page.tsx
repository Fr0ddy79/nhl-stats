import { getTeams, getStandings } from "@/lib/nhl-api";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  try {
    const { teams } = await getTeams();
    return teams.map((t) => ({ id: String(t.id) }));
  } catch {
    return [];
  }
}

export default async function TeamPage({ params }: PageProps) {
  const { id } = await params;
  const teamId = Number(id);

  const [{ teams }, standings] = await Promise.all([getTeams(), getStandings()]);

  const team = teams.find((t) => t.id === teamId);
  const record = standings.find((r) => r.team.id === teamId);

  if (!team) {
    return (
      <main style={{ padding: "2rem", fontFamily: "system-ui", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Team not found</h1>
        <p style={{ color: "#666" }}>ID: {teamId}</p>
      </main>
    );
  }

  const { leagueRecord } = record ?? { leagueRecord: { wins: 0, losses: 0, ot: 0 } };
  const gp = record?.gamesPlayed ?? 0;
  const pts = record?.points ?? 0;
  const ptPct = record?.pointPercentage ?? ".000";
  const gf = record?.goalsFor ?? 0;
  const ga = record?.goalsAgainst ?? 0;
  const gd = gf - ga;
  const streak = record?.streak;

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui", maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <a href="/" style={{ color: "#0066cc", textDecoration: "none", fontSize: "0.875rem" }}>
          ← Back to NHL Stats
        </a>
      </div>

      <header style={{ marginBottom: "2rem", borderBottom: "1px solid #eee", paddingBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>{team.name}</h1>
            <p style={{ color: "#666", margin: "0.25rem 0 0" }}>
              {team.venue.city} &bull; {team.conference.name} &bull; {team.division.name}
            </p>
          </div>
        </div>
        {team.officialSiteUrl && (
          <p style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
            <a href={team.officialSiteUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#0066cc" }}>
              Official Site
            </a>
          </p>
        )}
      </header>

      {/* Record */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#444", marginBottom: "1rem" }}>
          {new Date().getFullYear()} Regular Season Record
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "0.75rem" }}>
          {[
            { label: "Games Played", value: gp },
            { label: "Wins", value: leagueRecord.wins, color: "#111" },
            { label: "Losses", value: leagueRecord.losses, color: "#444" },
            { label: "Overtime", value: leagueRecord.ot, color: "#888" },
            { label: "Points", value: pts, color: "#0066cc" },
            { label: "Point %", value: ptPct, color: "#0066cc" },
            { label: "Goals For", value: gf },
            { label: "Goals Against", value: ga },
            { label: "Goal Diff", value: gd > 0 ? `+${gd}` : gd, color: gd > 0 ? "green" : gd < 0 ? "red" : "#444" },
          ].map(({ label, value, color = "#111" }) => (
            <div key={label} style={{ background: "#f8f8f8", borderRadius: "8px", padding: "0.875rem 1rem" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: "0.7rem", color: "#888", marginTop: "0.25rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
            </div>
          ))}
        </div>

        {streak && streak.streakNumber > 0 && (
          <div style={{ marginTop: "0.75rem", padding: "0.5rem 0.875rem", background: streak.streakType === "wins" ? "#f0f7ff" : "#fff5f5", borderRadius: "6px", display: "inline-flex", gap: "0.5rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>{streak.streakCode}</span>
            <span style={{ fontSize: "0.75rem", color: "#666" }}>{streak.streakType === "wins" ? "game winning streak" : "game losing streak"}</span>
          </div>
        )}
      </section>

      {/* Team Info */}
      <section>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#444", marginBottom: "1rem" }}>
          Team Info
        </h2>
        <div style={{ background: "#f8f8f8", borderRadius: "8px", padding: "1.25rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.875rem" }}>
          {[
            ["Abbreviation", team.abbreviation],
            ["Location", team.locationName],
            ["Venue", team.venue.name],
            ["First Season", team.firstYearOfPlay],
            ["Division", team.division.name],
            ["Conference", team.conference.name],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "contents" }}>
              <span style={{ color: "#888", fontWeight: 500 }}>{label}</span>
              <span style={{ fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
