import { useCachedPromise } from "@raycast/utils";

export interface Bufo {
  id: string;
  fileType: "png" | "gif";
  tags: string[];
}

export interface BufoData {
  tags: string[];
  bufos: Bufo[];
}

export function thumbUrl(b: Bufo): string {
  return `https://bufo.fun/smolBufos/${b.id}.${b.fileType}`;
}

export function fullUrl(b: Bufo): string {
  return `https://bufo.fun/bufos/${b.id}.${b.fileType}`;
}

/** Turn a kebab-case id into a Title Case label, e.g. "happy-bufo" → "Happy Bufo" */
export function humanize(id: string): string {
  return id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function useBufos(): { bufos: Bufo[]; isLoading: boolean; error: Error | undefined } {
  const { data, isLoading, error } = useCachedPromise(
    async () => {
      const res = await fetch("https://bufo.fun/bufo-data.json");
      if (!res.ok) throw new Error(`Failed to fetch bufo manifest: ${res.status}`);
      return (await res.json()) as BufoData;
    },
    [],
    { keepPreviousData: true },
  );

  return { bufos: data?.bufos ?? [], isLoading, error };
}
