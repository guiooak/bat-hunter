import { SignInButton } from 'src/features/authentication/sign-in-button';
import { Gutter, Modal } from 'src/components';
import { Gap } from 'src/components/gap';
import { useI18n } from 'src/i18n';

export function SignInModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();

  return (
    <Modal
      header={t.signIn.modalTitle}
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
