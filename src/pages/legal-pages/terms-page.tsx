import { NavLink } from 'react-router';
import {
  CONTROLLER_NAME,
  MIN_MULTIPLAYER_AGE,
  PRIVACY_CONTACT,
} from 'src/services/legal-service';
import { LegalPage } from './_legal-page';

const mail = <a href={`mailto:${PRIVACY_CONTACT}`}>{PRIVACY_CONTACT}</a>;

export function TermsPage() {
  return (
    <LegalPage
      title={{ pt: 'Termos de Uso', en: 'Terms of Use' }}
      content={{ pt: <TermsPt />, en: <TermsEn /> }}
    />
  );
}

function TermsPt() {
  return (
    <>
      <p>
        Ao jogar o Bat Hunter, você concorda com estes termos. Leia também a{' '}
        <NavLink to="/privacy">Política de Privacidade</NavLink>, que explica
        como tratamos seus dados.
      </p>

      <h2>O jogo</h2>
      <p>
        O Bat Hunter é um jogo gratuito, mantido por {CONTROLLER_NAME}, sem fins
        comerciais. Ele é oferecido como está, sem garantia de disponibilidade,
        e pode mudar ou ser encerrado a qualquer momento.
      </p>

      <h2>Conta e idade mínima</h2>
      <ul>
        <li>
          O jogo sozinho não precisa de conta. O multiplayer exige entrar com
          uma conta Google.
        </li>
        <li>
          O multiplayer é para maiores de {MIN_MULTIPLAYER_AGE} anos. Ao entrar,
          você declara ter pelo menos essa idade.
        </li>
        <li>Você é responsável pelo que acontece na sua conta.</li>
      </ul>

      <h2>Regras do chat e do multiplayer</h2>
      <ul>
        <li>
          Respeite o oponente: nada de ofensas, ameaças, assédio ou
          discriminação.
        </li>
        <li>
          Não envie dados pessoais seus ou de outras pessoas, como telefone,
          endereço ou documentos.
        </li>
        <li>Nada de spam, links maliciosos ou conteúdo ilegal.</li>
        <li>
          Use o botão de denúncia ao lado de uma mensagem, ou escreva para{' '}
          {mail}, para relatar abusos.
        </li>
      </ul>
      <p>
        Podemos remover mensagens, partidas ou contas que desrespeitem estes
        termos.
      </p>

      <h2>Trapaça</h2>
      <p>
        Alterar o jogo ou chamar o banco de dados por fora para mudar placares
        estraga a diversão dos outros. Contas que fizerem isso podem ser
        removidas.
      </p>

      <h2>Marca e conteúdo</h2>
      <p>
        O nome, a marca, a arte e o código do Bat Hunter pertencem a{' '}
        {CONTROLLER_NAME}. As mensagens que você escreve continuam suas.
      </p>

      <h2>Responsabilidade</h2>
      <p>
        Na medida permitida pela lei, não respondemos por perdas causadas por
        indisponibilidade do jogo, por conteúdo enviado por outros jogadores ou
        por serviços de terceiros, como o login do Google.
      </p>

      <h2>Lei aplicável e contato</h2>
      <p>
        Estes termos seguem a lei brasileira. Dúvidas, pedidos e denúncias:{' '}
        {mail}.
      </p>
    </>
  );
}

function TermsEn() {
  return (
    <>
      <p>
        By playing Bat Hunter you agree to these terms. Please also read the{' '}
        <NavLink to="/privacy">Privacy Policy</NavLink>, which explains how we
        handle your data.
      </p>

      <h2>The game</h2>
      <p>
        Bat Hunter is a free, non-commercial game run by {CONTROLLER_NAME}. It
        is provided as is, with no availability guarantee, and may change or end
        at any time.
      </p>

      <h2>Account and minimum age</h2>
      <ul>
        <li>
          Playing alone needs no account. Multiplayer requires a Google account.
        </li>
        <li>
          Multiplayer is for people aged {MIN_MULTIPLAYER_AGE} and over. By
          signing in you confirm you are at least that age.
        </li>
        <li>You are responsible for what happens in your account.</li>
      </ul>

      <h2>Chat and multiplayer rules</h2>
      <ul>
        <li>
          Respect your opponent: no insults, threats, harassment or
          discrimination.
        </li>
        <li>
          Do not share personal data, yours or anyone else's, such as phone
          numbers, addresses or documents.
        </li>
        <li>No spam, malicious links or illegal content.</li>
        <li>
          Use the report button next to a message, or write to {mail}, to report
          abuse.
        </li>
      </ul>
      <p>We may remove messages, matches or accounts that break these terms.</p>

      <h2>Cheating</h2>
      <p>
        Changing the game or calling the database directly to change scores
        spoils the fun for others. Accounts that do it may be removed.
      </p>

      <h2>Brand and content</h2>
      <p>
        The Bat Hunter name, brand, art and code belong to {CONTROLLER_NAME}.
        The messages you write remain yours.
      </p>

      <h2>Liability</h2>
      <p>
        To the extent the law allows, we are not liable for losses caused by the
        game being unavailable, by content sent by other players or by
        third-party services such as Google sign-in.
      </p>

      <h2>Governing law and contact</h2>
      <p>
        These terms are governed by Brazilian law. Questions, requests and
        reports: {mail}.
      </p>
    </>
  );
}
