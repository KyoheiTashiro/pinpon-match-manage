import { Button, InfoModal } from "@/components/ui";
import { FontSizeToggle } from "@/features/home/components/FontSizeToggle";

type Props = {
  open: boolean;
  onClose: () => void;
  confirmReset: boolean;
  askReset: () => void;
  doReset: () => void;
  cancelReset: () => void;
};

export const SettingsModal = ({
  open,
  onClose,
  confirmReset,
  askReset,
  doReset,
  cancelReset,
}: Props) => (
  <InfoModal open={open} title="設定" onClose={onClose}>
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-2">
        <span className="text-base font-bold">文字サイズ</span>
        <FontSizeToggle />
      </div>
      <div className="border-line flex flex-col items-start gap-2 border-t-2 pt-6">
        <span className="text-base font-bold">データ管理</span>
        {confirmReset ? (
          <div className="border-danger flex flex-col gap-3 rounded-xl border-2 p-4">
            <p className="text-base">
              全ての大会・参加者・対戦結果を削除します。取り消せません。本当に削除しますか?
            </p>
            <div className="flex gap-3">
              <Button variant="danger" onClick={doReset}>
                全て消す
              </Button>
              <Button variant="secondary" onClick={cancelReset}>
                やめる
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="danger" onClick={askReset}>
            データ初期化
          </Button>
        )}
      </div>
    </div>
  </InfoModal>
);
