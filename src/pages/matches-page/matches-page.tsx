import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Table } from 'src/components';
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
        <div className="matches-loading">Loading matches...</div>
      </div>
    );
  }

  return (
    <div className="matches-page">
      <div className="matches-page-title">My Matches</div>

      {matches.length === 0 ? (
        <div className="matches-empty">No matches found.</div>
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
    </div>
  );
}
