import { DownloadIcon } from "@/components/icons";
import { Button } from "@/components/ui";

type Props = { saving: boolean; onSave: () => void };

export const SaveImageButton = ({ saving, onSave }: Props) => (
  <div className="space-y-2">
    <div className="text-base font-extrabold">画像で保存</div>
    <Button onClick={onSave} disabled={saving}>
      <span className="inline-flex items-center justify-center gap-2">
        <DownloadIcon />
        {saving ? "保存中…" : "対戦表"}
      </span>
    </Button>
  </div>
);
