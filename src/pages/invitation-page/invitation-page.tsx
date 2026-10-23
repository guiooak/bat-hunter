import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button, ButtonGroup, Gutter, Text } from 'src/components';
import { useAuthContext } from 'src/features/authentication';
import { SignInModal } from 'src/features/sign-in-modal';
import {
  getInvitationFromFirebase,
  InvitationType,
  joinMatchInFirebase,
} from 'src/models/match-model';
import {
  getPublicProfileFromFirebase,
  PublicProfileType,
  setUserMatchInFirebase,
} from 'src/models/user-model';

export function InvitationPage() {
  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
  const { currentUser, status } = useAuthContext();
  const [match, setMatch] = useState<InvitationType | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const [gameHost, setGameHost] = useState<PublicProfileType | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  // Invitations are only readable by signed in users. The match itself is
  // private to its players, so the guest reads only the invitation.
  useEffect(() => {
    setSignInModalOpen(status === 'unauthenticated');

    if (matchId && status === 'authenticated') {
      getInvitationFromFirebase(matchId)
        .then((invitation) => {
          setMatch(invitation);
          setIsLoaded(true);
        })
        .catch((e) => console.error('InvitationPage::ERROR', e));
    }
  }, [matchId, status]);

  useEffect(() => {
    if (match?.hostId) {
      getPublicProfileFromFirebase(match.hostId)
        .then(setGameHost)
        .catch((e) => console.error('InvitationPage::ERROR', e));
    }
  }, [match?.hostId]);

  const isPlayer = Boolean(
    currentUser?.id &&
      (match?.hostId === currentUser.id || match?.guestId === currentUser.id)
  );
  // Two other people already play this match
  const isPrivate = Boolean(match?.guestId && !isPlayer);
  const isMissing = isLoaded && !match?.hostId;
  const isClosed = isPrivate || isMissing;

  // Already joined (or it's the host's own invitation)
  useEffect(() => {
    if (isPlayer) navigate(`/multi-player/${matchId}`, { replace: true });
  }, [isPlayer, matchId, navigate]);

  async function onJoinBattle() {
    if (!matchId || !match?.hostId) return;

    if (!currentUser?.id) {
      setSignInModalOpen(true);
      return;
    }

    const matchData = {
      matchId,
      hostId: match.hostId,
      hostName: gameHost?.firstName || '',
      guestId: currentUser.id,
      guestName: currentUser.firstName || '',
      createdAt: match.createdAt || Date.now(),
    };

    setIsJoining(true);

    try {
      // The guest must be set first: the database rules only allow the guest
      // to write in the host matches list once it's part of the match.
      await joinMatchInFirebase(matchId, currentUser.id);
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
            {isMissing
              ? 'This invitation does not exist (or the match was removed).'
              : isPrivate
                ? 'This match already has two players, and its games and chat are private to them.'
                : `You're invited to a battle with ${gameHost?.firstName || '…'}. Wanna join the game?`}
          </Text>
        </Gutter>
        <div className="text-center">
          <ButtonGroup>
            <Button onClick={() => navigate('/')}>
              {isClosed ? 'Back home' : 'Nope'}
            </Button>
            {!isClosed && (
              <Button
                kind="primary"
                onClick={onJoinBattle}
                disabled={!match?.hostId || isJoining}
              >
                Join battle
              </Button>
            )}
          </ButtonGroup>
        </div>
      </Gutter>
    </>
  );
}
