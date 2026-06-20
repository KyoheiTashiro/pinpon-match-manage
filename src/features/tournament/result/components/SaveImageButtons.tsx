import { DownloadIcon } from "@/components/icons";
import { Button } from "@/components/ui";
import { DISPLAY_MODE, useResult } from "@/features/tournament/result/hooks";
import type { MatchResultRow } from "@/features/tournament/result/hooks";

type DisplayMode = (typeof DISPLAY_MODE)[keyof typeof DISPLAY_MODE];

type Props = {
  mode: DisplayMode;
  main: ReturnType<typeof useResult>["main"];
  allMatches: ReturnType<typeof useResult>["allMatches"];
  isSaving: boolean;
  selectedMatch: MatchResultRow | null;
  graphMatches: MatchResultRow[];
};

export const SaveImageButtons = ({
  mode,
  main,
  allMatches,
  isSaving,
  selectedMatch,
  graphMatches,
}: Props) =>
  mode === DISPLAY_MODE.TABLE ? (
    <div className="space-y-2 sm:max-w-md">
      <div className="text-base font-extrabold">画像で保存</div>
      <Button
        className="w-fit"
        onClick={() => {
          void main.save();
        }}
        disabled={isSaving}
      >
        <span className="inline-flex items-center justify-center gap-2">
          <DownloadIcon />
          {main.saving ? "保存中…" : "点数表"}
        </span>
      </Button>
    </div>
  ) : (
    <div className="space-y-2 sm:max-w-md">
      <div className="text-base font-extrabold">画像で保存</div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          className="w-fit"
          onClick={() => {
            if (selectedMatch) {
              void main.save();
            }
          }}
          disabled={isSaving || !selectedMatch}
        >
          <span className="inline-flex items-center justify-center gap-2">
            <DownloadIcon />
            {main.saving ? "保存中…" : "表示中の対戦"}
          </span>
        </Button>
        <Button
          className="w-fit"
          onClick={() => {
            void allMatches.save();
          }}
          disabled={isSaving || graphMatches.length === 0}
        >
          <span className="inline-flex items-center justify-center gap-2">
            <DownloadIcon />
            {allMatches.saving ? "保存中…" : "全ての対戦"}
          </span>
        </Button>
      </div>
    </div>
  );
