import { getTeams, getTeamRoster } from "@/lib/nhl-api";
import Link from "next/link";

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

export default async function TeamRosterPage({ params }: PageProps) {
  const { id } = await params;
  const teamId = Number(id);

  const [{ teams }, roster] = await Promise.all([getTeams(), getTeamRoster(teamId)]);
  const team = teams.find((t) => t.id === teamId);

  const byPosition: Record<string, typeof roster> = {};
  for (const p of roster) {
    if (!byPosition[p.position]) byPosition[p.position] = [];
    byPosition[p.position].push(p);
  }
  const positionOrder = ["Forward", "Defense", "Goaltender", "Defenseman", "Goalie"];
  const sortedPositions = Object.keys(byPosition).sort(
    (a, b) => positionOrder.indexOf(a) - positionOrder.indexOf(b)
  );

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/" style={{ color: "#0066cc", textDecoration: "none", fontSize: "0.875rem" }}>
          ← NHL Stats
        </Link>
        {team && (
          <Link
            href={`/team/${teamId}`}
            style={{ color: "#0066cc", textDecoration: "none", fontSize: "0.875rem", marginLeft: "1rem" }}
          >
            ← {team.name}
          </Link>
        )}
        <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: "0.75rem 0 0" }}>
          {team ? `${team.name} Roster` : `Team ${teamId} Roster`}
        </h1>
        <p style={{ color: "#666", margin: "0.25rem 0 0", fontSize: "0.875rem" }}>
          {roster.length} players
        </p>
      </div>

      {sortedPositions.map((pos) => (
        <section key={pos} style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "0.8rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#444",
              borderBottom: "2px solid #0066cc",
              paddingBottom: "0.4rem",
              marginBottom: "0.75rem",
            }}
          >
            {pos}
          </h2>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {byPosition[pos].map((p) => (
              <Link
                key={p.playerId}
                href={`/players/${p.playerId}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.875rem",
                  padding: "0.75rem 1rem",
                  background: "#fafafa",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                  textDecoration: "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f7ff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fafafa")}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "#0066cc",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: "0.8rem",
                    flexShrink: 0,
                  }}
                >
                  {p.jerseyNumber}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: "#111", fontSize: "0.95rem" }}>{p.fullName}</div>
                  <div style={{ color: "#666", fontSize: "0.75rem" }}>{p.positionType}</div>
                </div>
                <div style={{ color: "#aaa", fontSize: "1rem" }}>→</div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <p style={{ color: "#aaa", fontSize: "0.8rem", fontStyle: "italic", marginTop: "2rem" }}>
        Data powered by the NHL official API.
      </p>
    </main>
  );
}
