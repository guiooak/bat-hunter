import { Button } from 'src/components/button';
import { ButtonGroup } from 'src/components/button-group';
import { NavLink } from 'react-router';

export function SinglePlayerDashboardActions({
  buttonsDisabled,
  onCleanBats,
}: {
  buttonsDisabled: boolean;
  onCleanBats: () => void;
}) {
  return (
    <section>
      <ButtonGroup flex>
        <NavLink to={'/'}>
          <Button kind="tertiary" disabled={buttonsDisabled}>
            Close
          </Button>
        </NavLink>
        <Button
          kind="tertiary"
          disabled={buttonsDisabled}
          onClick={onCleanBats}
        >
          Clean Bats
        </Button>
      </ButtonGroup>
    </section>
  );
}
