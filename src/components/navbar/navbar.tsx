import { NavLink } from 'react-router';
import './navbar.scss';
import { Avatar, DropdownPopover } from 'src/components';
import { useAuthContext } from 'src/features/authentication';
import { LanguagePicker } from 'src/features/language-picker';
import { useI18n } from 'src/i18n';
import logoUrl from '../../../brand/logo/logo-horizontal-dark.svg';

export function Navbar() {
  const { currentUser } = useAuthContext();
  const { t } = useI18n();
  const isValidCurrentUser = currentUser?.id;

  // Greeted only when signed in; Google may give no first name
  const name = currentUser?.firstName || t.nav.player;
  const picture = isValidCurrentUser
    ? currentUser.picture
    : '/images/user-sm.jpg';

  return (
    <div className="bh-navbar">
      <div className="bh-navbar__left">
        <NavLink to="/">
          {/* eslint-disable-next-line no-restricted-syntax -- the brand name is the same in every language */}
          <img className="bh-navbar-logo" src={logoUrl} alt="Bat Hunter" />
        </NavLink>
      </div>
      <div className="bh-navbar__right">
        <LanguagePicker />
        {isValidCurrentUser ? (
          <DropdownPopover
            trigger={
              <div className="bh-navbar__user-info">
                <div className="bh-navbar__greetings">
                  {t.nav.greeting(name)}
                </div>
                <Avatar src={picture} />
              </div>
            }
          >
            <NavLink to="/matches" className="dropdown-popover__item">
              {t.nav.matches}
            </NavLink>
            <NavLink to="/account" className="dropdown-popover__item">
              {t.nav.myData}
            </NavLink>
            <NavLink to="/privacy" className="dropdown-popover__item">
              {t.nav.privacy}
            </NavLink>
            <NavLink to="/logout" className="dropdown-popover__item">
              {t.nav.signOut}
            </NavLink>
          </DropdownPopover>
        ) : (
          <NavLink to="/login" className="bh-navbar__sign-in">
            {t.nav.signIn}
          </NavLink>
        )}
      </div>
    </div>
  );
}
