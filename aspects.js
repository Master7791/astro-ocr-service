const PLANETS = [
  { key: "Sun", aliases: ["sun", "sole"] },
  { key: "Moon", aliases: ["moon", "luna"] },
  { key: "Mercury", aliases: ["mercury", "mercurio"] },
  { key: "Venus", aliases: ["venus", "venere"] },
  { key: "Mars", aliases: ["mars", "marte"] },
  { key: "Jupiter", aliases: ["jupiter", "giove"] },
  { key: "Saturn", aliases: ["saturn", "saturno"] },
  { key: "Uranus", aliases: ["uranus", "urano"] },
  { key: "Neptune", aliases: ["neptune", "nettuno"] },
  { key: "Pluto", aliases: ["pluto"] }
];

const ASPECTS = [
  { key: "Conjunction", aliases: ["conjunction", "conjunct", "congiunzione", "congiunto"] },
  { key: "Opposition", aliases: ["opposition", "opp", "opposite", "opposizione"] },
  { key: "Trine", aliases: ["trine", "trigono"] },
  { key: "Square", aliases: ["square", "quadratura"] },
  { key: "Sextile", aliases: ["sextile", "sestile"] }
];

function findPlanetToken(token) {
  const t = token.toLowerCase();
  for (const p of PLANETS) {
    if (p.aliases.includes(t)) return p.key;
  }
  return null;
}

function findAspectToken(token) {
  const t = token.toLowerCase();
  for (const a of ASPECTS) {
    if (a.aliases.includes(t)) return a.key;
  }
  return null;
}

// Estrae aspetti da una riga tipo:
// "Sun trine Moon", "Sole trigono Luna", "Mercury opp Uranus"
export function extractAspectsFromText(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const results = [];

  for (const line of lines) {
    // normalizza separatori
    const cleaned = line
      .replace(/[•·]/g, " ")
      .replace(/[()]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const tokens = cleaned.split(" ").filter(Boolean);

    // cerchiamo pattern: planet aspect planet (anche con parole in mezzo)
    for (let i = 0; i < tokens.length; i++) {
      const p1 = findPlanetToken(tokens[i]);
      if (!p1) continue;

      for (let j = i + 1; j < Math.min(i + 6, tokens.length); j++) {
        const asp = findAspectToken(tokens[j]);
        if (!asp) continue;

        for (let k = j + 1; k < Math.min(j + 6, tokens.length); k++) {
          const p2 = findPlanetToken(tokens[k]);
          if (!p2) continue;

          results.push({
            planet1: p1,
            aspect: asp,
            planet2: p2,
            source: line
          });

          // evita duplicati multipli sulla stessa riga
          i = tokens.length;
          break;
        }
      }
    }
  }

  // Dedup base
  const uniq = [];
  const seen = new Set();
  for (const r of results) {
    const key = `${r.planet1}-${r.aspect}-${r.planet2}-${r.source}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniq.push(r);
    }
  }
  return uniq;
}
