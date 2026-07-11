const GRAPH = "https://graph.microsoft.com/v1.0";

/**
 * Fetch a Graph endpoint with retry on throttling (429) and transient 5xx.
 * `path` may be a relative path ("/sites/...") or a full @odata.nextLink URL.
 */
export async function graphFetch<T = unknown>(
  accessToken: string,
  path: string,
  maxRetries = 4,
): Promise<T> {
  const url = path.startsWith("https://") ? path : `${GRAPH}${path}`;
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (res.status === 429 || res.status === 503) {
      if (attempt >= maxRetries) throw new Error(`Graph throttled: ${url}`);
      const retryAfter = Number(res.headers.get("Retry-After") ?? "2");
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      continue;
    }
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Graph ${res.status} on ${url}: ${body.slice(0, 500)}`);
    }
    return (await res.json()) as T;
  }
}

/** Follow @odata.nextLink pagination and return all values. */
export async function graphGetAll<T = unknown>(
  accessToken: string,
  path: string,
): Promise<T[]> {
  const out: T[] = [];
  let next: string | undefined = path;
  while (next) {
    const page: { value: T[]; "@odata.nextLink"?: string } = await graphFetch(
      accessToken,
      next,
    );
    out.push(...page.value);
    next = page["@odata.nextLink"];
  }
  return out;
}

interface BatchRequest {
  id: string;
  url: string; // relative Graph path, e.g. "/drives/{d}/items/{i}/permissions"
}
interface BatchResponse<T> {
  id: string;
  status: number;
  body?: { value?: T[]; error?: unknown };
}

/**
 * Run GET requests through Graph's $batch endpoint (max 20 per call).
 * Returns a map of request id → array body (the `value` of each response).
 * Sub-requests that throttle (429) are retried in a follow-up batch.
 */
export async function graphBatchGet<T = unknown>(
  accessToken: string,
  requests: BatchRequest[],
  maxRetries = 3,
): Promise<Map<string, T[]>> {
  const results = new Map<string, T[]>();
  let pending = requests;

  for (let attempt = 0; attempt <= maxRetries && pending.length; attempt++) {
    const retry: BatchRequest[] = [];
    for (let i = 0; i < pending.length; i += 20) {
      const chunk = pending.slice(i, i + 20);
      const res = await fetch(`${GRAPH}/$batch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: chunk.map((r) => ({ id: r.id, method: "GET", url: r.url })),
        }),
      });
      if (res.status === 429 || res.status === 503) {
        const wait = Number(res.headers.get("Retry-After") ?? "3");
        await new Promise((r) => setTimeout(r, wait * 1000));
        retry.push(...chunk);
        continue;
      }
      if (!res.ok) throw new Error(`Graph $batch ${res.status}: ${await res.text()}`);
      const json = (await res.json()) as { responses: BatchResponse<T>[] };
      for (const r of json.responses) {
        if (r.status === 429 || r.status === 503) {
          const req = chunk.find((c) => c.id === r.id);
          if (req) retry.push(req);
        } else if (r.status >= 200 && r.status < 300) {
          results.set(r.id, r.body?.value ?? []);
        } else {
          results.set(r.id, []); // 403/404 etc. — treat as no readable perms
        }
      }
    }
    pending = retry;
    if (pending.length) await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
  }
  return results;
}
