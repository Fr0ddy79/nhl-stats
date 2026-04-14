import { getPlayerInfo, getPlayerStats } from "@/lib/nhl-api";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatBirthDate(dateStr: string): string {
  if (!dateStr) return "Unknown";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function heightToInches(height: string): string {
  if (!height || !height.includes("-")) return height ?? "Unknown";
  const [feet, inches] = height.split("-").map(Number);
  return `${feet * 12 + inches} in (${height})`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSeasonStat(statsData: any) {
  const arr = Array.isArray(statsData) ? statsData : [];
  // Structure: statsData[0].stats[0].stat contains the season stats
  const wrapper = arr[0];
  if (!wrapper) return undefined;
  const statsArr = Array.isArray(wrapper.stats) ? wrapper.stats : [];
  return statsArr[0]?.stat;
}

export default async function PlayerPage({ params }: PageProps) {
  const { id } = await params;
  const playerId = Number(id);

  const [infoData, statsData] = await Promise.all([
    getPlayerInfo(playerId),
    getPlayerStats(playerId),
  ]);

  const player = infoData?.[0];
  const seasonStat = getSeasonStat(statsData);

  if (!player) {
    return (
      <main style={{ padding: "2rem", fontFamily: "system-ui", maxWidth: "800px", margin: "0 auto" }}>
        <Link href="/players" style={{ color: "#0066cc", textDecoration: "none", fontSize: "0.875rem" }}>
          ← Back to Player Search
        </Link>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "1rem" }}>Player not found</h1>
        <p style={{ color: "#666" }}>ID: {playerId}</p>
      </main>
    );
  }

  const teamName = seasonStat?.team?.name ?? player.primaryPosition?.name ?? "";
  const teamId = seasonStat?.team?.id ?? 0;

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: "900px", margin: "0 auto" }}>
      {/* Back nav */}
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/players" style={{ color: "#0066cc", textDecoration: "none", fontSize: "0.875rem" }}>
          ← Player Search
        </Link>
      </div>

      {/* Player header */}
      <header style={{ marginBottom: "2rem", borderBottom: "1px solid #eee", paddingBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #0066cc, #003d7a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 900,
            fontSize: "1.75rem",
            flexShrink: 0,
          }}>
            {player.primaryNumber || player.primaryPosition?.abbreviation || "?"}
          </div>
          <div>
            <h1 style={{ fontSize: "2.25rem", fontWeight: 800, margin: 0 }}>{player.fullName}</h1>
            <p style={{ color: "#666", margin: "0.3rem 0 0", fontSize: "1rem" }}>
              {player.primaryNumber ? `#${player.primaryNumber} · ` : ""}
              {player.primaryPosition?.name}
              {player.shootsCatches ? ` · Shoots: ${player.shootsCatches}` : ""}
            </p>
            {teamName && teamId > 0 && (
              <p style={{ margin: "0.3rem 0 0", fontSize: "0.875rem" }}>
                <Link href={`/team/${teamId}`} style={{ color: "#0066cc", textDecoration: "none", fontWeight: 600 }}>
                  {teamName}
                </Link>
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Bio grid */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#555", marginBottom: "1rem" }}>
          Player Bio
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.75rem" }}>
          {[
            { label: "Birth Date", value: formatBirthDate(player.birthDate) },
            { label: "Birthplace", value: [player.birthCity, player.birthStateProvince, player.birthCountry].filter(Boolean).join(", ") || "Unknown" },
            { label: "Height", value: heightToInches(player.height) },
            { label: "Weight", value: player.weight ? `${player.weight} lbs` : "Unknown" },
            { label: "Position", value: player.primaryPosition?.name || "Unknown" },
            { label: "Shoots/Catches", value: player.shootsCatches || "Unknown" },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "#f9f9f9", border: "1px solid #eee", borderRadius: "8px", padding: "0.75rem 1rem" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#aaa", marginBottom: "0.25rem" }}>{label}</div>
              <div style={{ fontSize: "0.9rem", fontWeight: 500, color: "#111" }}>{value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Season Stats */}
      {seasonStat && seasonStat.games != null && (
        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#555", marginBottom: "1rem" }}>
            {new Date().getFullYear()} Season Stats
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
              <tbody>
                <tr>
                  {[
                    { label: "GP", value: seasonStat.games },
                    { label: "G", value: seasonStat.goals },
                    { label: "A", value: seasonStat.assists },
                    { label: "PTS", value: seasonStat.points },
                    { label: "+/-", value: seasonStat.plusMinus },
                    { label: "PPG", value: seasonStat.powerPlayGoals },
                    { label: "SHG", value: seasonStat.shortHandedGoals },
                    { label: "GWG", value: seasonStat.gameWinningGoals },
                    { label: "SOG", value: seasonStat.shots },
                    { label: "S%", value: seasonStat.shotPct != null ? `${Number(seasonStat.shotPct).toFixed(1)}%` : "-" },
                    { label: "PIM", value: seasonStat.penaltyMinutes ?? 0 },
                    { label: "TOI/G", value: (seasonStat.timeOnIce as string) || "-" },
                  ].map(({ label, value }) => (
                    <td key={label} style={{ padding: "0.6rem 0.75rem", textAlign: "center", borderBottom: "1px solid #eee" }}>
                      <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#111" }}>{value ?? "-"}</div>
                      <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "#aaa", letterSpacing: "0.04em" }}>{label}</div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p style={{ color: "#aaa", fontSize: "0.8rem", fontStyle: "italic" }}>
        Career totals coming soon. Data powered by the NHL official API.
      </p>
    </main>
  );
}
