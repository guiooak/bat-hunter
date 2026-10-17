import { NavLink } from 'react-router';
import './navbar.scss';
import { Avatar, DropdownPopover } from '@components';
import { useAuthContext } from 'src/features/authentication';
import logoUrl from '../../../brand/logo/logo-horizontal-dark.svg';

export function Navbar() {
  const { currentUser } = useAuthContext();
  const isValidCurrentUser = currentUser?.id;

  const name = isValidCurrentUser ? currentUser.firstName : 'guest';
  const picture = isValidCurrentUser
    ? currentUser.picture
    : '/images/user-sm.jpg';

  return (
    <div className="bh-navbar">
      <div className="bh-navbar__left">
        <NavLink to="/">
          <img className="bh-navbar-logo" src={logoUrl} alt="Bat Hunter" />
        </NavLink>
      </div>
      <div className="bh-navbar__right">
        {isValidCurrentUser ? (
          <DropdownPopover
            trigger={
              <div className="bh-navbar__user-info">
                <div className="bh-navbar__greetings">Hi {name}!</div>
                <Avatar src={picture} />
              </div>
            }
          >
            <NavLink to="/matches" className="dropdown-popover__item">
              Matches
            </NavLink>
            <NavLink to="/logout" className="dropdown-popover__item">
              Sign out
            </NavLink>
          </DropdownPopover>
        ) : (
          <NavLink to="/login" className="bh-navbar__sign-in">
            Sign in
          </NavLink>
        )}
      </div>
    </div>
  );
}
