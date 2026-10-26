import { Button } from 'src/components/button';
import { ButtonGroup } from 'src/components/button-group';
import { NavLink } from 'react-router';
import { useI18n } from 'src/i18n';

export function SinglePlayerDashboardActions({
  buttonsDisabled,
  onCleanBats,
}: {
  buttonsDisabled: boolean;
  onCleanBats: () => void;
}) {
  const { t } = useI18n();

  return (
    <section>
      <ButtonGroup flex>
        <NavLink to={'/'}>
          <Button kind="tertiary" disabled={buttonsDisabled}>
            {t.single.close}
          </Button>
        </NavLink>
        <Button
          kind="tertiary"
          disabled={buttonsDisabled}
          onClick={onCleanBats}
        >
          {t.single.cleanBats}
        </Button>
      </ButtonGroup>
    </section>
  );
}
