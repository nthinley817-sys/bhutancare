/* ===== HOSPITALS PAGE JS ===== */

document.addEventListener("DOMContentLoaded", function () {
  requireAuth();
  updateCount(6, 6);
});

function filterHospitals() {
  const query = (document.getElementById("hospSearch")?.value || "").toLowerCase().trim();
  const cards = Array.from(document.querySelectorAll(".hosp-card"));
  const grid  = document.getElementById("hospGrid");

  if (!query) {
    clearFilters();
    return;
  }

  const matched   = [];
  const unmatched = [];

  cards.forEach(card => {
    const fullText = [card.dataset.name, card.dataset.location, card.dataset.type].join(" ").toLowerCase();
    const words    = query.split(" ").filter(w => w.length > 0);
    const isMatch  = words.every(w => fullText.includes(w));
    if (isMatch) matched.push(card);
    else unmatched.push(card);
  });

  // Rebuild grid: matched first (centered), then unmatched dimmed
  grid.innerHTML = "";

  if (matched.length > 0) {
    // Wrap matched in a centered highlight row
    const matchRow = document.createElement("div");
    matchRow.style.cssText = "grid-column:1/-1;display:flex;flex-wrap:wrap;gap:20px;justify-content:center;margin-bottom:8px";

    const label = document.createElement("div");
    label.style.cssText = "width:100%;font-size:13px;font-weight:600;color:var(--green-main);margin-bottom:4px";
    label.innerHTML = "<i class=\"fa-solid fa-circle-check\"></i> " + matched.length + " hospital" + (matched.length > 1 ? "s" : "") + " found";
    matchRow.appendChild(label);

    matched.forEach(card => {
      card.style.outline   = "2px solid var(--green-main)";
      card.style.boxShadow = "0 0 0 4px rgba(45,134,83,0.15)";
      card.style.opacity   = "1";
      card.style.width     = matched.length === 1 ? "420px" : "calc(33% - 14px)";
      card.style.animation = "fadeInCard 0.4s ease both";
      matchRow.appendChild(card);
    });
    grid.appendChild(matchRow);

    // Divider
    if (unmatched.length > 0) {
      const divider = document.createElement("div");
      divider.style.cssText = "grid-column:1/-1;border-top:1px dashed var(--border);margin:8px 0;padding-top:12px;font-size:12px;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.05em";
      divider.textContent = "Other Hospitals";
      grid.appendChild(divider);
    }
  }

  unmatched.forEach(card => {
    card.style.outline   = "none";
    card.style.boxShadow = "";
    card.style.opacity   = "0.5";
    card.style.width     = "";
    card.style.animation = "";
    grid.appendChild(card);
  });

  // No results
  const noResults = document.getElementById("noResults");
  if (noResults) noResults.style.display = matched.length === 0 ? "block" : "none";

  // Scroll to matched
  if (matched.length > 0) {
    setTimeout(() => matched[0].scrollIntoView({ behavior: "smooth", block: "center" }), 150);
  }

  updateCount(matched.length, cards.length);
}

function updateCount(visible, total) {
  const counter = document.getElementById("hospCount");
  if (!counter) return;
  const query = document.getElementById("hospSearch")?.value || "";
  if (!query) {
    counter.textContent = "Showing all " + total + " hospitals across Bhutan";
    counter.style.color = "";
  } else if (visible === 0) {
    counter.textContent = "No hospitals found — try \"Thimphu\", \"Paro\", \"district\"";
    counter.style.color = "var(--red)";
  } else {
    counter.textContent = "Found " + visible + " matching hospital" + (visible > 1 ? "s" : "");
    counter.style.color = "var(--green-main)";
  }
}

function clearFilters() {
  const s = document.getElementById("hospSearch");
  if (s) s.value = "";
  const grid  = document.getElementById("hospGrid");
  const cards = Array.from(document.querySelectorAll(".hosp-card"));

  // Re-append all cards in original order
  cards.forEach(card => {
    card.style.outline   = "none";
    card.style.boxShadow = "";
    card.style.opacity   = "1";
    card.style.width     = "";
    card.style.animation = "";
    grid.appendChild(card);
  });

  // Remove any label/divider elements
  Array.from(grid.children).forEach(child => {
    if (!child.classList.contains("hosp-card")) child.remove();
  });

  const noResults = document.getElementById("noResults");
  if (noResults) noResults.style.display = "none";
  const counter = document.getElementById("hospCount");
  if (counter) counter.style.color = "";
  updateCount(6, 6);
}
