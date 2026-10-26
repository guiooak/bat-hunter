import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Avatar,
  Button,
  ButtonGroup,
  Card,
  Divider,
  GameClock,
  GamePanel,
  GamePanelStat,
  Gutter,
  Input,
  Modal,
  ScoreChip,
  SegmentedControl,
  Table,
  Text,
  TextArea,
  Title,
} from 'src/components';
import { Gap } from 'src/components/gap';
import { GuestStatus } from 'src/components/guest-status';
import { ProfileSection } from 'src/components/profile-section';

describe('basic components', () => {
  it('Avatar shows the photo or a default', () => {
    const { container, rerender } = render(<Avatar src="me.png" />);
    expect(container.querySelector('img')).toHaveAttribute('src', 'me.png');

    rerender(<Avatar />);
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      '/images/user-sm.jpg'
    );
  });

  it('Button has a kind, a click and a disabled state', async () => {
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Go</Button>);
    const button = screen.getByRole('button', { name: 'Go' });

    expect(button).toHaveClass('bh-button--secondary');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalled();

    rerender(
      <Button kind="primary" disabled>
        Go
      </Button>
    );
    expect(button).toHaveClass('bh-button--primary');
    expect(button).toBeDisabled();
  });

  it('ButtonGroup can stretch', () => {
    const { container, rerender } = render(<ButtonGroup>a</ButtonGroup>);
    expect(container.firstChild).not.toHaveClass('bh-button-group--flex');

    rerender(<ButtonGroup flex>a</ButtonGroup>);
    expect(container.firstChild).toHaveClass('bh-button-group--flex');
  });

  it('Card, Divider and Input render', () => {
    render(
      <Card id="c" className="extra">
        <Divider />
        <Input name="url" value="x" readOnly />
      </Card>
    );

    expect(document.getElementById('c')).toHaveClass('bh-card', 'extra');
    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('x');
  });

  it('Gap maps its options to classes', () => {
    const { container, rerender } = render(<Gap>a</Gap>);
    expect(container.firstChild).toHaveClass(
      'bh-gap',
      'bh-gap--size-sm',
      'bh-gap--align-start',
      'bh-gap--justify-normal'
    );

    rerender(
      <Gap
        vertical
        wrap
        fullWidth
        fullHeight
        size="xl"
        align="center"
        justify="center"
        className="x"
      >
        a
      </Gap>
    );
    expect(container.firstChild).toHaveClass(
      'x',
      'bh-gap--vertical',
      'bh-gap--wrap',
      'bh-gap--full-width',
      'bh-gap--full-height',
      'bh-gap--size-xl'
    );
  });

  it.each([
    ['all', { padding: '8px' }],
    ['vertical', { paddingTop: '8px', paddingBottom: '8px' }],
    ['horizontal', { paddingLeft: '8px', paddingRight: '8px' }],
    ['top', { paddingTop: '8px' }],
    ['bottom', { paddingBottom: '8px' }],
    ['left', { paddingLeft: '8px' }],
    ['right', { paddingRight: '8px' }],
  ] as const)('Gutter %s', (direction, style) => {
    const { container } = render(<Gutter direction={direction}>a</Gutter>);

    expect(container.firstChild).toHaveStyle({ display: 'block', ...style });
  });

  it('Gutter can be external and fit its content', () => {
    const { container } = render(
      <Gutter external fit size="xl" className="g">
        a
      </Gutter>
    );

    expect(container.firstChild).toHaveStyle({
      display: 'inline-block',
      margin: '32px',
    });
    expect(container.firstChild).toHaveClass('bh-gutter', 'g');
  });

  it('Text maps its options to classes', () => {
    const { container, rerender } = render(<Text>a</Text>);
    expect(container.firstChild).toHaveClass(
      'bh-text__size--md',
      'bh-text__weight--light'
    );
    expect(container.firstChild).not.toHaveClass('bh-text--block');

    rerender(
      <Text secondary align="center" size="xl" weight="bold" className="t">
        a
      </Text>
    );
    expect(container.firstChild).toHaveClass(
      't',
      'bh-text--secondary',
      'bh-text--block',
      'bh-text__align--center'
    );

    rerender(<Text block>a</Text>);
    expect(container.firstChild).toHaveClass('bh-text--block');
  });

  it.each(['h1', 'h2', 'h3', 'h4'] as const)('Title %s', (size) => {
    render(<Title size={size}>Hi</Title>);

    expect(screen.getByRole('heading', { name: 'Hi' }).tagName).toBe(
      size.toUpperCase()
    );
  });

  it('Title is an h2 by default, can be centered and ignores unknown sizes', () => {
    const { container, rerender } = render(
      <Title center weight="bold" className="x">
        Hi
      </Title>
    );
    expect(container.querySelector('h2')).toHaveClass(
      'x',
      'bh-title--center',
      'bh-title-weight--bold'
    );

    rerender(<Title size={'h5' as 'h1'}>Hi</Title>);
    expect(container).toBeEmptyDOMElement();
  });

  it('Table renders headers and rows', () => {
    render(
      <Table headers={['A', 'B']} className="t">
        <tr>
          <td>1</td>
          <td>2</td>
        </tr>
      </Table>
    );

    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    expect(screen.getByRole('table')).toHaveClass('bh-table', 't');
  });

  it('ProfileSection shows a photo and a name', () => {
    render(<ProfileSection image="p.png" name="Bia" />);

    expect(screen.getByText('Bia')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'p.png');
  });
});

describe('GameClock', () => {
  it('shows the label while stopped, the time while running', () => {
    const { container, rerender } = render(
      <GameClock countdownTime={0} label="Get Ready!" />
    );
    expect(container).toHaveTextContent('Get Ready!');

    rerender(<GameClock countdownTime={30} />);
    expect(container).toHaveTextContent('30s');
    expect(container.firstChild).not.toHaveClass('bh-game-clock--danger');

    rerender(<GameClock countdownTime={10} />);
    expect(container.firstChild).toHaveClass('bh-game-clock--danger');
  });

  it('has an empty label by default', () => {
    const { container } = render(<GameClock countdownTime={0} />);

    expect(container).toHaveTextContent('');
  });
});

describe('GuestStatus', () => {
  it('is offline without a recent pulse', () => {
    const { container, rerender } = render(<GuestStatus />);
    expect(container).toHaveTextContent('offline');

    rerender(<GuestStatus lastPulseAt={Date.now() - 6 * 60 * 1000} />);
    expect(container).toHaveTextContent('offline');
  });

  it('is online or away with a recent pulse', () => {
    const { container, rerender } = render(
      <GuestStatus lastPulseAt={Date.now()} />
    );
    expect(container).toHaveTextContent('online');

    rerender(<GuestStatus lastPulseAt={Date.now()} away />);
    expect(container).toHaveTextContent('away');
  });
});

describe('ScoreChip', () => {
  it('shows name, status, kills, points and accuracy', () => {
    render(
      <ScoreChip
        name="Bia"
        status={<span>online</span>}
        killCounter={7}
        finalScore={560}
        accuracy={80}
        className="c"
      />
    );

    expect(screen.getByText('Bia')).toBeInTheDocument();
    expect(screen.getByText('online')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('560 pts · 80%')).toBeInTheDocument();
  });
});

describe('GamePanel', () => {
  it('toggles the controls on phones', async () => {
    const { container } = render(
      <GamePanel
        summary={<GamePanelStat label="Kills" value={3} />}
        className="p"
      >
        <p>controls</p>
      </GamePanel>
    );
    const panel = container.firstChild;

    expect(screen.getByText('Kills')).toBeInTheDocument();
    expect(panel).toHaveClass('bh-game-panel', 'p');
    expect(panel).not.toHaveClass('bh-game-panel--open');

    await userEvent.click(screen.getByRole('button', { name: 'Controls' }));
    expect(panel).toHaveClass('bh-game-panel--open');

    await userEvent.click(screen.getByRole('button', { name: 'Hide' }));
    expect(panel).not.toHaveClass('bh-game-panel--open');
  });
});

describe('Modal', () => {
  it('renders nothing while closed', () => {
    const { container } = render(<Modal open={false}>body</Modal>);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows header, body and footer, and closes by button, overlay or Escape', async () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal open onClose={onClose} header="Title" footer="Foot" className="m">
        body
      </Modal>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Foot')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('m', 'bh-modal');

    await userEvent.click(screen.getByRole('button', { name: '✕' }));
    await userEvent.click(container.querySelector('.bh-modal__overlay')!);
    fireEvent.keyUp(window, { key: 'a' });
    fireEvent.keyUp(window, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('can ignore clicks on the overlay, and works without onClose', async () => {
    const onClose = vi.fn();
    const { container, rerender } = render(
      <Modal open onClose={onClose} preventOverlayClosing>
        body
      </Modal>
    );

    await userEvent.click(container.querySelector('.bh-modal__overlay')!);
    expect(onClose).not.toHaveBeenCalled();
    expect(container.querySelector('header')).toBeNull();
    expect(container.querySelector('footer')).toBeNull();

    rerender(<Modal open>body</Modal>);
    await userEvent.click(container.querySelector('.bh-modal__overlay')!);
    fireEvent.keyUp(window, { key: 'Escape' });
  });
});

describe('TextArea', () => {
  it('reports changes and submits on Enter only', async () => {
    const onChange = vi.fn();
    const onReturn = vi.fn();
    render(
      <TextArea
        name="chat"
        className="c"
        onChange={onChange}
        onReturn={onReturn}
      />
    );
    const box = screen.getByRole('textbox');

    await userEvent.type(box, 'hi');
    expect(onChange).toHaveBeenLastCalledWith('hi');

    await userEvent.type(box, '{Shift>}{Enter}{/Shift}');
    fireEvent.keyDown(box, { key: 'a' });
    fireEvent.keyDown(box, { key: 'Enter', isComposing: true });
    expect(onReturn).not.toHaveBeenCalled();

    fireEvent.keyDown(box, { key: 'Enter' });
    expect(onReturn).toHaveBeenCalledTimes(1);
  });

  it('works without handlers', () => {
    render(<TextArea name="chat" disabled readOnly placeholder="p" />);
    const box = screen.getByPlaceholderText('p');

    fireEvent.keyDown(box, { key: 'Enter' });
    fireEvent.change(box, { target: { value: 'x' } });
    expect(box).toBeDisabled();
  });
});

describe('SegmentedControl', () => {
  const options = [
    { value: 'easy', label: 'Easy' },
    { value: 'hard', label: 'Hard' },
  ] as const;

  it('is a radio group that changes on click and with the arrows', async () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        label="Difficulty"
        options={[...options]}
        value="easy"
        onChange={onChange}
      />
    );
    const [easy, hard] = screen.getAllByRole('radio');

    expect(
      screen.getByRole('radiogroup', { name: 'Difficulty' })
    ).toBeInTheDocument();
    expect(easy).toBeChecked();
    expect(easy).toHaveAttribute('tabindex', '0');
    expect(hard).toHaveAttribute('tabindex', '-1');

    await userEvent.click(easy);
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.click(hard);
    expect(onChange).toHaveBeenLastCalledWith('hard');

    fireEvent.keyDown(easy, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('hard');
    fireEvent.keyDown(easy, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith('hard');
    fireEvent.keyDown(hard, { key: 'ArrowDown' });
    expect(onChange).toHaveBeenLastCalledWith('easy');
    fireEvent.keyDown(hard, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenLastCalledWith('easy');
    expect(document.activeElement).toBe(easy);

    onChange.mockClear();
    fireEvent.keyDown(easy, { key: 'Tab' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('can be small, with the label for screen readers only', () => {
    render(
      <SegmentedControl
        label="Language"
        hideLabel
        size="sm"
        options={[{ value: 'en', label: 'EN', ariaLabel: 'English' }]}
        value="en"
      />
    );

    expect(screen.getByText('Language')).toHaveClass(
      'bh-segmented__label--hidden'
    );
    expect(screen.getByRole('radio', { name: 'English' })).toHaveTextContent(
      'EN'
    );
    expect(
      screen.getByRole('radiogroup', { name: 'Language' }).parentElement
    ).toHaveClass('bh-segmented--sm');
  });

  it('works without onChange', async () => {
    render(<SegmentedControl label="L" options={[...options]} value="easy" />);

    await userEvent.click(screen.getAllByRole('radio')[1]);
    fireEvent.keyDown(screen.getAllByRole('radio')[0], { key: 'ArrowRight' });
  });

  it('shows only the value when read-only, with an optional note', () => {
    const { rerender } = render(
      <SegmentedControl
        label="Difficulty"
        options={[...options]}
        value="hard"
        readOnly
        note="Host picks"
      />
    );

    expect(screen.queryByRole('radio')).toBeNull();
    expect(screen.getByText('Hard')).toBeInTheDocument();
    expect(screen.getByText('Host picks')).toBeInTheDocument();

    rerender(
      <SegmentedControl
        label="L"
        options={[...options]}
        value={'x' as 'easy'}
        readOnly
      />
    );
    expect(screen.queryByText('Host picks')).toBeNull();
  });
});
