const BASE_URL = "https://api.base44.ai";

export async function base44Client(endpoint, payload = {}) {
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Base44 API Error: ${res.status}`);
  }

  return res.json();
}