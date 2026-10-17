import { SignInButton } from 'src/features/authentication/sign-in-button';
import { Gutter, Modal } from 'src/components';
import { Gap } from 'src/components/gap';

export function SignInModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      header="Come and play!"
      className="sign-in-modal"
      open={open}
      onClose={onClose}
    >
      <Gutter size="xxl">
        <Gap align="center" justify="center">
          <SignInButton onSuccess={onClose} />
        </Gap>
      </Gutter>
    </Modal>
  );
}
