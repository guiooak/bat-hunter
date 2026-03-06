import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { Button, Gutter, Table, Text, Title } from 'src/components';
import { useAuthContext } from 'src/features/authentication';
import {
  getUserMatchesFromFirebase,
  UserMatchType,
} from 'src/models/user-model';
import './matches-page.scss';

export function MatchesPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuthContext();
  const [matches, setMatches] = useState<UserMatchType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.id) {
      alert('You must be signed in to view your matches.');
      navigate('/');
      return;
    }

    getUserMatchesFromFirebase(currentUser.id)
      .then((data) => {
        const sorted = data.sort((a, b) => a.createdAt - b.createdAt);
        setMatches(sorted);
      })
      .finally(() => setLoading(false));
  }, [currentUser?.id, navigate]);

  if (loading) {
    return (
      <div className="matches-page">
        <Gutter size="xxl" direction="vertical">
          <Text align="center" secondary block>
            Loading matches...
          </Text>
        </Gutter>
      </div>
    );
  }

  return (
    <div className="matches-page">
      <div className="matches-page-container">
        <Gutter size="lg" direction="bottom">
          <Title size="h1">My Matches</Title>
        </Gutter>

        {matches.length === 0 ? (
          <Gutter size="xxl" direction="vertical">
            <Text align="center" secondary block>
              No matches found.
            </Text>
          </Gutter>
        ) : (
          <Table headers={['Host', 'Guest', 'Created At', '']}>
            {matches.map((match) => (
              <tr key={match.matchId}>
                <td>{match.hostName}</td>
                <td>{match.guestName}</td>
                <td>{new Date(match.createdAt).toLocaleDateString()}</td>
                <td>
                  <Button
                    kind="primary"
                    onClick={() => navigate(`/multi-player/${match.matchId}`)}
                  >
                    Open
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        )}

        <NavLink to="/" className="matches-back-link">
          ← Home
        </NavLink>
      </div>
    </div>
  );
}
