import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button, ButtonGroup, Gutter, Text } from 'src/components';
import { useAuthContext } from 'src/features/authentication';
import { SignInModal } from 'src/features/sign-in-modal';
import {
  getMatchInFirebase,
  MatchType,
  setMatchInFirebase,
} from 'src/models/match-model';
import {
  getUserDataFromFirebase,
  setUserMatchInFirebase,
} from 'src/models/user-model';
import { UserSessionType } from 'src/services/auth-service';

export function InvitationPage() {
  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
  const { currentUser, status } = useAuthContext();
  const [match, setMatch] = useState<MatchType | null>(null);
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const [gameHost, setGameHost] = useState<UserSessionType | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  // Matches are only readable by signed in users
  useEffect(() => {
    setSignInModalOpen(status === 'unauthenticated');

    if (matchId && status === 'authenticated') {
      getMatchInFirebase(matchId)
        .then(setMatch)
        .catch((e) => console.error('InvitationPage::ERROR', e));
    }
  }, [matchId, status]);

  useEffect(() => {
    if (match?.hostId) {
      getUserDataFromFirebase(match.hostId)
        .then(setGameHost)
        .catch((e) => console.error('InvitationPage::ERROR', e));
    }
  }, [match?.hostId]);

  // Already joined (or it's the host's own invitation)
  useEffect(() => {
    if (match?.guestId || (match?.hostId && match.hostId === currentUser?.id)) {
      navigate(`/multi-player/${matchId}`);
    }
  }, [match?.guestId, match?.hostId, currentUser?.id, matchId, navigate]);

  async function onJoinBattle() {
    if (!matchId || !match?.hostId) return;

    if (!currentUser?.id) {
      setSignInModalOpen(true);
      return;
    }

    const matchData = {
      matchId,
      hostId: match.hostId,
      hostName: gameHost?.name || '',
      guestId: currentUser.id,
      guestName: currentUser.name || '',
      createdAt: match.createdAt || Date.now(),
    };

    setIsJoining(true);

    try {
      // The guest must be set first: the database rules only allow the guest
      // to write in the host matches list once it's part of the match.
      await setMatchInFirebase({ id: matchId, guestId: currentUser.id });
      await Promise.all([
        setUserMatchInFirebase(match.hostId, matchData),
        setUserMatchInFirebase(currentUser.id, matchData),
      ]);

      navigate(`/multi-player/${matchId}`);
    } catch (e) {
      console.error('InvitationPage::ERROR: could not join the match', e);
      alert('Ops! It was not possible to join this battle.');
    } finally {
      setIsJoining(false);
    }
  }

  return (
    <>
      <SignInModal
        open={signInModalOpen}
        onClose={() => setSignInModalOpen(false)}
      />
      <Gutter size="xxl">
        <Gutter direction="vertical" size="xxl" className="text-center">
          <Text>
            You're invited to a battle with {gameHost?.name}. Wanna join the
            game?
          </Text>
        </Gutter>
        <div className="text-center">
          <ButtonGroup>
            <Button onClick={() => navigate('/')}>Nope</Button>
            <Button
              kind="primary"
              onClick={onJoinBattle}
              disabled={!match?.hostId || isJoining}
            >
              Join battle
            </Button>
          </ButtonGroup>
        </div>
      </Gutter>
    </>
  );
}
