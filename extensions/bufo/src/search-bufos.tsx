import { Action, ActionPanel, Clipboard, Grid, Icon, Toast, getPreferenceValues, showToast } from "@raycast/api";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { type Bufo, humanize, thumbUrl, useBufos } from "./bufo-data";
import { downloadBufo } from "./download";

interface Preferences {
  defaultAction: "paste" | "copy" | "download";
  downloadDirectory: string;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function BufoActions({ bufo }: { bufo: Bufo }) {
  const { defaultAction, downloadDirectory } = getPreferenceValues<Preferences>();

  async function handlePaste() {
    const toast = await showToast({ style: Toast.Style.Animated, title: "Downloading bufo…" });
    try {
      const file = await downloadBufo(bufo);
      await Clipboard.paste({ file });
      toast.style = Toast.Style.Success;
      toast.title = "Pasted!";
    } catch (err) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to paste";
      toast.message = String(err);
    }
  }

  async function handleCopy() {
    const toast = await showToast({ style: Toast.Style.Animated, title: "Downloading bufo…" });
    try {
      const file = await downloadBufo(bufo);
      await Clipboard.copy({ file });
      toast.style = Toast.Style.Success;
      toast.title = "Copied!";
    } catch (err) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to copy";
      toast.message = String(err);
    }
  }

  async function handleDownload() {
    const toast = await showToast({ style: Toast.Style.Animated, title: "Downloading bufo…" });
    try {
      const file = await downloadBufo(bufo);
      // Resolve ~ in the download directory preference.
      const resolvedDir = downloadDirectory.startsWith("~")
        ? path.join(os.homedir(), downloadDirectory.slice(1))
        : downloadDirectory;
      await fs.mkdir(resolvedDir, { recursive: true });
      const dest = path.join(resolvedDir, `${bufo.id}.${bufo.fileType}`);
      await fs.copyFile(file, dest);
      toast.style = Toast.Style.Success;
      toast.title = "Saved!";
      toast.message = dest;
    } catch (err) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to download";
      toast.message = String(err);
    }
  }

  const pasteAction = <Action key="paste" title="Paste into App" icon={Icon.Clipboard} onAction={handlePaste} />;
  const copyAction = (
    <Action
      key="copy"
      title="Copy Image"
      icon={Icon.CopyClipboard}
      shortcut={{ modifiers: ["cmd"], key: "c" }}
      onAction={handleCopy}
    />
  );
  const downloadAction = (
    <Action
      key="download"
      title="Download to Disk"
      icon={Icon.Download}
      shortcut={{ modifiers: ["cmd", "shift"], key: "d" }}
      onAction={handleDownload}
    />
  );

  // Reorder so the preferred action is first (Enter key).
  const ordered =
    defaultAction === "copy"
      ? [copyAction, pasteAction, downloadAction]
      : defaultAction === "download"
        ? [downloadAction, pasteAction, copyAction]
        : [pasteAction, copyAction, downloadAction];

  return <ActionPanel>{ordered}</ActionPanel>;
}

// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------

export default function SearchBufos() {
  const { bufos, isLoading } = useBufos();

  return (
    <Grid
      columns={8}
      inset={Grid.Inset.Small}
      filtering
      searchBarPlaceholder="Search bufos…"
      isLoading={isLoading}
      fit={Grid.Fit.Contain}
    >
      {bufos.map((b) => (
        <Grid.Item
          key={`${b.id}.${b.fileType}`}
          content={{ source: thumbUrl(b), fallback: Icon.QuestionMark }}
          title={humanize(b.id)}
          keywords={[b.id, ...b.id.split("-"), ...b.tags]}
          actions={<BufoActions bufo={b} />}
        />
      ))}
    </Grid>
  );
}
