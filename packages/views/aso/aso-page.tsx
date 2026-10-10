"use client";

import { useState } from "react";
import { ExternalLink, RotateCw, TrendingUp } from "lucide-react";
import { buttonVariants } from "@multica/ui/components/ui/button";
import { cn } from "@multica/ui/lib/utils";
import { useT } from "../i18n";
import {
  CollectionPageHeader,
  CollectionPageHeaderAction,
  CollectionPageState,
} from "../layout/collection-page";

/** Used by the platform layers when no ASO address is configured. */
export const DEFAULT_ASO_URL = "http://localhost:3001";

/**
 * Normalize the configured ASO address. Only absolute http(s) URLs are
 * embeddable; anything else is treated as not configured rather than handed
 * to the frame.
 */
export function resolveAsoUrl(src: string | null | undefined): string | null {
  const trimmed = src?.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

// The embedded app keeps its own origin and navigation, but may not navigate
// the Multica window itself (no allow-top-navigation).
const FRAME_SANDBOX = [
  "allow-scripts",
  "allow-same-origin",
  "allow-forms",
  "allow-popups",
  "allow-popups-to-escape-sandbox",
  "allow-downloads",
  "allow-modals",
].join(" ");

export interface AsoPageProps {
  /** Address of the ASO app, for example `http://localhost:3001`. */
  src: string | null | undefined;
}

/**
 * Workspace page that hosts the team's ASO app, including its own side menu,
 * inside Multica. The address is supplied by the platform layer (web: the
 * `ASO_URL` server variable; desktop: `VITE_ASO_URL` at build time).
 */
export function AsoPage({ src }: AsoPageProps) {
  const { t } = useT("layout");
  const url = resolveAsoUrl(src);
  // Remounting is the reliable reload for a cross-origin document, whose
  // location the host page cannot touch.
  const [frameKey, setFrameKey] = useState(0);
  const title = t(($) => $.nav.aso);
  const openLabel = t(($) => $.aso.open_in_new_tab);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <CollectionPageHeader
        icon={TrendingUp}
        title={title}
        actions={
          url ? (
            <>
              <CollectionPageHeaderAction
                icon={RotateCw}
                label={t(($) => $.aso.refresh)}
                onClick={() => setFrameKey((key) => key + 1)}
              />
              {/* A real link, not a Button: it navigates, so middle-click and
                  "Copy link" work and assistive tech announces it as a link.
                  Geometry mirrors CollectionPageHeaderAction beside it. */}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={openLabel}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "h-8 w-8 gap-1 px-0 md:w-auto md:px-2.5",
                )}
              >
                <ExternalLink aria-hidden="true" className="size-3.5" />
                <span className="hidden md:inline">{openLabel}</span>
              </a>
            </>
          ) : null
        }
      />
      {url ? (
        <iframe
          key={frameKey}
          src={url}
          title={title}
          sandbox={FRAME_SANDBOX}
          allow="clipboard-read; clipboard-write"
          referrerPolicy="no-referrer"
          className="min-h-0 w-full flex-1 border-0 bg-background"
        />
      ) : (
        <CollectionPageState
          role="status"
          icon={TrendingUp}
          title={t(($) => $.aso.not_configured_title)}
          description={t(($) => $.aso.not_configured_body)}
        />
      )}
    </div>
  );
}
