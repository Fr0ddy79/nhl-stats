"use client";

import { useState } from "react";

interface SearchResult {
  playerId: number;
  fullName: string;
  positionCode: string;
  positionName: string;
}

export default function PlayersPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await fetch(
        `https://statsapi.web.nhl.com/api/v1/people/search?names=${encodeURIComponent(query.trim())}`,
        { headers: { "User-Agent": "nhl-stats/1.0" } }
      );
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      const players: SearchResult[] = (data.people ?? []).map((p: {
        id: number;
        fullName: string;
        primaryPosition: { abbreviation: string; name: string };
      }) => ({
        playerId: p.id,
        fullName: p.fullName,
        positionCode: p.primaryPosition.abbreviation,
        positionName: p.primaryPosition.name,
      }));
      setResults(players.length > 0 ? players : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem", borderBottom: "1px solid #eee", paddingBottom: "1rem" }}>
        <a href="/" style={{ color: "#0066cc", textDecoration: "none", fontSize: "0.875rem" }}>
          ← Back to NHL Stats
        </a>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0.75rem 0 0" }}>Player Search</h1>
        <p style={{ color: "#666", margin: "0.25rem 0 0", fontSize: "0.875rem" }}>
          Search any NHL player by name
        </p>
      </header>

      <form onSubmit={handleSearch} style={{ marginBottom: "2rem", display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Connor McDavid, Auston Matthews, Sidney Crosby..."
          style={{
            flex: 1,
            padding: "0.625rem 0.875rem",
            fontSize: "0.95rem",
            border: "1px solid #ccc",
            borderRadius: "6px",
            outline: "none",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#0066cc")}
          onBlur={(e) => (e.target.style.borderColor = "#ccc")}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          style={{
            padding: "0.625rem 1.25rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            background: query.trim() ? "#0066cc" : "#ccc",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: query.trim() ? "pointer" : "not-allowed",
          }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && (
        <div style={{ color: "#dc2626", background: "#fef2f2", padding: "0.75rem 1rem", borderRadius: "6px", fontSize: "0.875rem", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {results !== null && (
        <section>
          {results.length === 0 ? (
            <p style={{ color: "#888", fontSize: "0.9rem" }}>
              No players found for &ldquo;{query}&rdquo;. Try a different spelling.
            </p>
          ) : (
            <>
              <p style={{ color: "#666", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
                {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
              </p>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {results.map((p) => (
                  <a
                    key={p.playerId}
                    href={`/players/${p.playerId}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem 1rem",
                      border: "1px solid #e5e5e5",
                      borderRadius: "8px",
                      textDecoration: "none",
                      background: "#fafafa",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f7ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fafafa")}
                  >
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "#0066cc",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "0.8rem",
                      flexShrink: 0,
                    }}>
                      {p.positionCode}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: "#111", fontSize: "0.95rem" }}>{p.fullName}</div>
                      <div style={{ color: "#666", fontSize: "0.75rem" }}>{p.positionName}</div>
                    </div>
                    <div style={{ color: "#aaa", fontSize: "1rem" }}>→</div>
                  </a>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {searched && results !== null && results.length === 0 && null}
    </main>
  );
}
