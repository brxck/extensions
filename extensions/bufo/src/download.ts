import { environment } from "@raycast/api";
import fs from "fs/promises";
import path from "path";
import { fullUrl, type Bufo } from "./bufo-data";

/**
 * Download a bufo image to the extension's support directory and return the local file path.
 * Already-downloaded files are returned immediately (persistent cache).
 */
export async function downloadBufo(b: Bufo): Promise<string> {
  const dir = path.join(environment.supportPath, "bufos");
  await fs.mkdir(dir, { recursive: true });

  const target = path.join(dir, `${b.id}.${b.fileType}`);

  // Return cached file if it already exists.
  try {
    await fs.access(target);
    return target;
  } catch {
    // File does not exist — fall through to download.
  }

  const res = await fetch(fullUrl(b));
  if (!res.ok) throw new Error(`Failed to download bufo "${b.id}": ${res.status} ${res.statusText}`);

  const buf = new Uint8Array(await res.arrayBuffer());
  await fs.writeFile(target, buf);
  return target;
}
