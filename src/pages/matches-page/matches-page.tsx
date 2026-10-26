import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { Button, Gutter, Table, Text, Title } from 'src/components';
import { useAuthContext } from 'src/features/authentication';
import {
  getUserMatchesFromFirebase,
  UserMatchType,
} from 'src/models/user-model';
import { SignInModal } from 'src/features/sign-in-modal';
import { useI18n } from 'src/i18n';
import { REMOVED_PLAYER_NAME } from 'src/services/removed-player';
import './matches-page.scss';

export function MatchesPage() {
  const navigate = useNavigate();
  const { currentUser, status } = useAuthContext();
  const { t, formatDate } = useI18n();
  const [matches, setMatches] = useState<UserMatchType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.id) return;

    getUserMatchesFromFirebase(currentUser.id)
      .then((data) => {
        const sorted = data.sort((a, b) => a.createdAt - b.createdAt);
        setMatches(sorted);
      })
      .catch((e) => console.error('MatchesPage::ERROR: matches not loaded', e))
      .finally(() => setLoading(false));
  }, [currentUser?.id]);

  // A deleted player is stored as a marker, shown in the player's language
  const showName = (name: string) =>
    name === REMOVED_PLAYER_NAME ? t.player.removed : name;

  // Matches are only for signed-in players: closing the sign-in goes home
  if (status === 'unauthenticated') {
    return (
      <div className="matches-page">
        <SignInModal open onClose={() => navigate('/')} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="matches-page">
        <Gutter size="xxl" direction="vertical">
          <Text align="center" secondary block>
            {t.matches.loading}
          </Text>
        </Gutter>
      </div>
    );
  }

  return (
    <div className="matches-page">
      <div className="matches-page-container">
        <Gutter size="lg" direction="bottom">
          <Title size="h1">{t.matches.title}</Title>
        </Gutter>

        {matches.length === 0 ? (
          <Gutter size="xxl" direction="vertical">
            <Text align="center" secondary block>
              {t.matches.empty}
            </Text>
          </Gutter>
        ) : (
          <Table
            headers={[
              '#',
              t.matches.host,
              t.matches.guest,
              t.matches.createdAt,
              '',
            ]}
          >
            {matches.map((match, index) => (
              <tr key={match.matchId}>
                <td>{index + 1}</td>
                <td>{showName(match.hostName)}</td>
                <td>{showName(match.guestName)}</td>
                <td>{formatDate(match.createdAt)}</td>
                <td>
                  <Button
                    kind="primary"
                    onClick={() => navigate(`/multi-player/${match.matchId}`)}
                  >
                    {t.matches.open}
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        )}

        <NavLink to="/" className="matches-back-link">
          {t.common.backHome}
        </NavLink>
      </div>
    </div>
  );
}
