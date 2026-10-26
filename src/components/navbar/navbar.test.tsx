import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ME, renderWithContext } from 'src/test/render';
import { Navbar } from '.';
import { DropdownPopover } from '../dropdown-popover';

describe('Navbar', () => {
  it('offers sign in to guests', () => {
    renderWithContext(<Navbar />, { currentUser: null });

    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/login'
    );
    expect(screen.getByAltText('Bat Hunter')).toBeInTheDocument();
  });

  it('greets the player and links to their pages', () => {
    renderWithContext(<Navbar />);

    expect(screen.getByText(`Hi ${ME.firstName}!`)).toBeInTheDocument();
    for (const name of ['Matches', 'My data', 'Privacy', 'Sign out']) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument();
    }
    expect(screen.getAllByRole('img')[1]).toHaveAttribute('src', ME.picture);
  });
});

describe('DropdownPopover', () => {
  function setup() {
    renderWithContext(
      <div>
        <DropdownPopover trigger={<span>Menu</span>}>
          <a href="#x">Item</a>
        </DropdownPopover>
        <p>outside</p>
      </div>
    );
    const trigger = screen.getByRole('button', { name: 'Menu' });
    const root = trigger.parentElement!;
    return { trigger, root };
  }

  it('opens and closes with a click or tap on the trigger', async () => {
    const { trigger, root } = setup();

    await userEvent.click(trigger);
    expect(root).toHaveClass('dropdown-popover--open');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(trigger);
    expect(root).not.toHaveClass('dropdown-popover--open');
  });

  it('opens with Enter or Space, not other keys', () => {
    const { trigger, root } = setup();

    fireEvent.keyDown(trigger, { key: 'a' });
    expect(root).not.toHaveClass('dropdown-popover--open');
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(root).toHaveClass('dropdown-popover--open');
    fireEvent.keyDown(trigger, { key: ' ' });
    expect(root).not.toHaveClass('dropdown-popover--open');
  });

  it('closes on a pointer outside or after choosing an item', async () => {
    const { trigger, root } = setup();

    await userEvent.click(trigger);
    fireEvent.pointerDown(screen.getByText('Item'));
    expect(root).toHaveClass('dropdown-popover--open');
    fireEvent.pointerDown(screen.getByText('outside'));
    expect(root).not.toHaveClass('dropdown-popover--open');

    await userEvent.click(trigger);
    await userEvent.click(screen.getByText('Item'));
    expect(root).not.toHaveClass('dropdown-popover--open');
  });
});
