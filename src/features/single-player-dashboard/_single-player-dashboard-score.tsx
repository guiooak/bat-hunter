import { Button, ButtonGroup, ScoreSummary } from 'src/components';
import { useI18n } from 'src/i18n';

type Props = {
  killCounter: number;
  finalScore: number;
  accuracy: number;
  resetDisabled: boolean;
  sendBatDisabled: boolean;
  sendBatHidden: boolean;
  onCreateBat: () => void;
  onResetScore: () => void;
};

export function SinglePlayerDashboardScore({
  killCounter,
  finalScore,
  accuracy,
  resetDisabled,
  sendBatDisabled,
  sendBatHidden,
  onCreateBat,
  onResetScore,
}: Props) {
  const { t } = useI18n();

  return (
    <div>
      <ScoreSummary
        title={t.game.yourScore}
        killCounter={killCounter}
        finalScore={finalScore}
        accuracy={accuracy}
      />
      <br />
      <ButtonGroup flex>
        <Button kind="tertiary" disabled={resetDisabled} onClick={onResetScore}>
          {t.single.reset}
        </Button>
        {/* Bats come on their own during a challenge */}
        {!sendBatHidden && (
          <Button
            kind="primary"
            disabled={sendBatDisabled}
            onClick={onCreateBat}
          >
            {t.single.sendBats}
          </Button>
        )}
      </ButtonGroup>
    </div>
  );
}
