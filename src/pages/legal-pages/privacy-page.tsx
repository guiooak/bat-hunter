import { NavLink } from 'react-router';
import {
  CONTROLLER_NAME,
  MIN_MULTIPLAYER_AGE,
  PRIVACY_CONTACT,
  RETENTION_DAYS,
} from 'src/services/legal-service';
import { LegalPage } from './_legal-page';

const mail = <a href={`mailto:${PRIVACY_CONTACT}`}>{PRIVACY_CONTACT}</a>;
const months = (days: number) => Math.round(days / 30);

export function PrivacyPage() {
  return (
    <LegalPage
      title={{ 'pt-BR': 'Política de Privacidade', 'en-US': 'Privacy Policy' }}
      content={{ 'pt-BR': <PrivacyPt />, 'en-US': <PrivacyEn /> }}
    />
  );
}

function PrivacyPt() {
  return (
    <>
      <p>
        O Bat Hunter é um jogo gratuito no navegador. Esta política explica
        quais dados pessoais ele trata, para quê, com quem são compartilhados e
        como você exerce seus direitos, conforme a Lei Geral de Proteção de
        Dados (Lei nº 13.709/2018, LGPD).
      </p>

      <h2>Resumo</h2>
      <ul>
        <li>
          Para jogar sozinho você não precisa entrar com conta e nada pessoal é
          guardado nos nossos servidores.
        </li>
        <li>
          O multiplayer exige entrar com Google. Guardamos só o primeiro nome, a
          foto, as partidas, os placares e as mensagens do chat.
        </li>
        <li>
          Não usamos analytics, publicidade nem cookies de rastreamento, e não
          vendemos dados.
        </li>
        <li>
          Você pode baixar seus dados e excluir sua conta a qualquer momento na
          página <NavLink to="/account">Meus dados</NavLink>.
        </li>
      </ul>

      <h2>Quem é o controlador</h2>
      <p>
        O controlador dos dados é {CONTROLLER_NAME}, responsável pelo Bat Hunter
        (https://bat-hunter-game.web.app). Para qualquer assunto sobre
        privacidade ou dados pessoais, escreva para {mail}. Esse é o canal de
        atendimento ao titular.
      </p>

      <h2>Quais dados tratamos e por quê</h2>
      <div className="legal-page__table">
        <table>
          <thead>
            <tr>
              <th>Dado</th>
              <th>Para quê</th>
              <th>Base legal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                Identificador da conta, primeiro nome e foto, vindos da sua
                conta Google
              </td>
              <td>Identificar você no multiplayer e mostrar seu oponente</td>
              <td>Execução de contrato (art. 7º, V)</td>
            </tr>
            <tr>
              <td>Idioma escolhido (português ou inglês), na sua conta</td>
              <td>Abrir o jogo no seu idioma em qualquer aparelho</td>
              <td>Execução de contrato (art. 7º, V)</td>
            </tr>
            <tr>
              <td>
                E-mail e dados de login guardados pelo Firebase Authentication
              </td>
              <td>Fazer o login. O jogo não lê nem mostra seu e-mail.</td>
              <td>Execução de contrato (art. 7º, V)</td>
            </tr>
            <tr>
              <td>
                Presença: online ou ausente, e o horário da última atividade
              </td>
              <td>
                Mostrar ao oponente se você está na partida. Só é publicada nas
                páginas de multiplayer.
              </td>
              <td>Legítimo interesse (art. 7º, IX)</td>
            </tr>
            <tr>
              <td>Partidas, placares e vencedores</td>
              <td>Placar ao vivo, histórico e lista de partidas</td>
              <td>Execução de contrato (art. 7º, V)</td>
            </tr>
            <tr>
              <td>Mensagens do chat</td>
              <td>Conversar com o oponente durante a partida</td>
              <td>Execução de contrato (art. 7º, V)</td>
            </tr>
            <tr>
              <td>
                Preferências (música ligada ou não, dificuldade, idioma), salvas
                no seu navegador
              </td>
              <td>Lembrar suas escolhas</td>
              <td>Necessárias ao funcionamento; não saem do seu aparelho</td>
            </tr>
            <tr>
              <td>
                Dados técnicos, como endereço IP e navegador, em cada acesso
              </td>
              <td>Entregar o site e manter a segurança</td>
              <td>Legítimo interesse (art. 7º, IX)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Quem vê seus dados</h2>
      <ul>
        <li>
          <strong>Seu oponente</strong> vê seu primeiro nome, sua foto, sua
          presença, seus placares e as mensagens trocadas naquela partida.
          Ninguém mais lê suas partidas, seu chat ou sua lista de partidas.
        </li>
        <li>
          <strong>O Google</strong> hospeda o jogo e os dados pelo Firebase
          (login, banco de dados e hospedagem), como operador, seguindo nossas
          instruções.
        </li>
        <li>
          Não vendemos nem compartilhamos dados com mais ninguém, salvo por
          obrigação legal ou ordem de autoridade.
        </li>
      </ul>

      <h2>Transferência internacional</h2>
      <p>
        Os servidores do Firebase ficam nos Estados Unidos. A transferência é
        feita com base nos termos de proteção de dados do Google Cloud, que
        trazem garantias de proteção para dados transferidos a partir do Brasil
        (art. 33 da LGPD).
      </p>

      <h2>Por quanto tempo guardamos</h2>
      <ul>
        <li>
          Mensagens do chat: {RETENTION_DAYS.chatMessages} dias após o envio.
        </li>
        <li>
          Partidas e placares: {months(RETENTION_DAYS.matches)} meses após a
          criação da partida.
        </li>
        <li>Convites nunca aceitos: {RETENTION_DAYS.unjoinedMatches} dias.</li>
        <li>
          Contas sem login por {months(RETENTION_DAYS.inactiveAccounts)} meses
          são excluídas, com todos os dados.
        </li>
        <li>
          Ao excluir sua conta, seus dados são apagados na hora. Nas partidas
          antigas, seu oponente continua vendo o próprio placar, e seu nome
          passa a aparecer como jogador removido.
        </li>
        <li>As preferências ficam no seu navegador até você limpá-las.</li>
      </ul>

      <h2>Seus direitos</h2>
      <p>Pelo art. 18 da LGPD, você pode pedir, a qualquer momento:</p>
      <ul>
        <li>confirmação de que tratamos seus dados e acesso a eles;</li>
        <li>correção de dados incompletos, inexatos ou desatualizados;</li>
        <li>
          anonimização, bloqueio ou eliminação de dados desnecessários ou
          tratados em desconformidade com a lei;
        </li>
        <li>portabilidade dos dados;</li>
        <li>eliminação dos dados e da conta;</li>
        <li>informação sobre com quem compartilhamos seus dados;</li>
        <li>oposição a um tratamento baseado em legítimo interesse.</li>
      </ul>
      <p>
        Na página <NavLink to="/account">Meus dados</NavLink> você vê o que está
        guardado, baixa uma cópia em JSON e exclui sua conta. O nome e a foto
        vêm da sua conta Google: para corrigi-los, altere-os lá e entre de novo
        no jogo. Para qualquer outro pedido, escreva para {mail}. Respondemos em
        até 15 dias. Você também pode peticionar à Autoridade Nacional de
        Proteção de Dados (ANPD).
      </p>

      <h2>Crianças e adolescentes</h2>
      <p>
        O multiplayer, que exige login, é para maiores de {MIN_MULTIPLAYER_AGE}{' '}
        anos. O jogo sozinho não trata dados pessoais e está aberto a todos. Se
        soubermos de uma conta de alguém com menos de {MIN_MULTIPLAYER_AGE}{' '}
        anos, ela será excluída. Pais e responsáveis podem pedir a exclusão pelo{' '}
        {mail}.
      </p>

      <h2>Segurança</h2>
      <p>
        O acesso aos dados é restrito por regras no banco: cada pessoa só lê o
        que é seu e as partidas de que participa. Toda comunicação usa HTTPS. Se
        houver um incidente de segurança que possa trazer risco ou dano
        relevante, avisaremos a ANPD e as pessoas afetadas, como manda a lei.
      </p>

      <h2>Cookies e armazenamento no navegador</h2>
      <p>
        Não usamos cookies de rastreamento nem de publicidade. O jogo guarda
        suas preferências no armazenamento local do navegador, e o Firebase
        guarda ali a sua sessão de login. Os dois são necessários para o jogo
        funcionar. As fontes são servidas pelo próprio site.
      </p>

      <h2>Mudanças nesta política</h2>
      <p>
        Quando esta política mudar, a data no topo será atualizada. Mudanças
        importantes serão avisadas no jogo.
      </p>
    </>
  );
}

function PrivacyEn() {
  return (
    <>
      <p>
        Bat Hunter is a free browser game. This policy explains which personal
        data it processes, why, who it is shared with and how you exercise your
        rights, under the Brazilian General Data Protection Law (Law
        13,709/2018, LGPD).
      </p>

      <h2>Summary</h2>
      <ul>
        <li>
          Playing alone needs no account, and nothing personal is stored on our
          servers.
        </li>
        <li>
          Multiplayer requires signing in with Google. We keep only your first
          name, photo, matches, scores and chat messages.
        </li>
        <li>
          No analytics, no ads, no tracking cookies, and we never sell data.
        </li>
        <li>
          You can download your data and delete your account at any time on the{' '}
          <NavLink to="/account">My data</NavLink> page.
        </li>
      </ul>

      <h2>Who the controller is</h2>
      <p>
        The data controller is {CONTROLLER_NAME}, who runs Bat Hunter
        (https://bat-hunter-game.web.app). For anything about privacy or
        personal data, write to {mail}. That is the data subject channel.
      </p>

      <h2>What we process and why</h2>
      <div className="legal-page__table">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Purpose</th>
              <th>Legal basis</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                Account ID, first name and photo, from your Google account
              </td>
              <td>Identify you in multiplayer and show your opponent</td>
              <td>Performance of a contract (art. 7, V)</td>
            </tr>
            <tr>
              <td>
                The language you picked (Portuguese or English), in your account
              </td>
              <td>Open the game in your language on any device</td>
              <td>Performance of a contract (art. 7, V)</td>
            </tr>
            <tr>
              <td>Email and sign-in data kept by Firebase Authentication</td>
              <td>Signing in. The game never reads or shows your email.</td>
              <td>Performance of a contract (art. 7, V)</td>
            </tr>
            <tr>
              <td>
                Presence: online or away, and the time of your last activity
              </td>
              <td>
                Show your opponent whether you are in the match. Published on
                the multiplayer pages only.
              </td>
              <td>Legitimate interest (art. 7, IX)</td>
            </tr>
            <tr>
              <td>Matches, scores and winners</td>
              <td>Live score, history and match list</td>
              <td>Performance of a contract (art. 7, V)</td>
            </tr>
            <tr>
              <td>Chat messages</td>
              <td>Talk to your opponent during the match</td>
              <td>Performance of a contract (art. 7, V)</td>
            </tr>
            <tr>
              <td>
                Preferences (music on or off, difficulty, language), stored in
                your browser
              </td>
              <td>Remember your choices</td>
              <td>Needed for the game to work; they never leave your device</td>
            </tr>
            <tr>
              <td>
                Technical data, such as IP address and browser, on each visit
              </td>
              <td>Deliver the site and keep it secure</td>
              <td>Legitimate interest (art. 7, IX)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Who sees your data</h2>
      <ul>
        <li>
          <strong>Your opponent</strong> sees your first name, photo, presence,
          scores and the messages exchanged in that match. Nobody else reads
          your matches, chat or match list.
        </li>
        <li>
          <strong>Google</strong> hosts the game and the data through Firebase
          (sign-in, database and hosting), as a processor following our
          instructions.
        </li>
        <li>
          We do not sell or share data with anyone else, except when required by
          law or by an authority.
        </li>
      </ul>

      <h2>International transfer</h2>
      <p>
        Firebase servers are in the United States. The transfer relies on the
        Google Cloud data protection terms, which provide safeguards for data
        transferred from Brazil (LGPD art. 33).
      </p>

      <h2>How long we keep it</h2>
      <ul>
        <li>
          Chat messages: {RETENTION_DAYS.chatMessages} days after sending.
        </li>
        <li>
          Matches and scores: {months(RETENTION_DAYS.matches)} months after the
          match is created.
        </li>
        <li>
          Invitations never accepted: {RETENTION_DAYS.unjoinedMatches} days.
        </li>
        <li>
          Accounts without a sign-in for{' '}
          {months(RETENTION_DAYS.inactiveAccounts)} months are deleted with all
          their data.
        </li>
        <li>
          When you delete your account, your data is erased right away. In past
          matches your opponent still sees their own score, and you show up as a
          removed player.
        </li>
        <li>Preferences stay in your browser until you clear them.</li>
      </ul>

      <h2>Your rights</h2>
      <p>Under LGPD art. 18 you may ask, at any time, for:</p>
      <ul>
        <li>confirmation that we process your data, and access to it;</li>
        <li>correction of incomplete, inaccurate or outdated data;</li>
        <li>
          anonymization, blocking or deletion of unnecessary data or data
          processed against the law;
        </li>
        <li>data portability;</li>
        <li>deletion of your data and account;</li>
        <li>information about who we share your data with;</li>
        <li>objection to processing based on legitimate interest.</li>
      </ul>
      <p>
        On the <NavLink to="/account">My data</NavLink> page you see what is
        stored, download a JSON copy and delete your account. Your name and
        photo come from your Google account: to correct them, change them there
        and sign in again. For anything else, write to {mail}. We answer within
        15 days. You may also petition the Brazilian Data Protection Authority
        (ANPD).
      </p>

      <h2>Children and teenagers</h2>
      <p>
        Multiplayer, which needs an account, is for people aged{' '}
        {MIN_MULTIPLAYER_AGE} and over. Playing alone processes no personal data
        and is open to everyone. If we learn that an account belongs to someone
        under {MIN_MULTIPLAYER_AGE}, it will be deleted. Parents and guardians
        can ask for deletion at {mail}.
      </p>

      <h2>Security</h2>
      <p>
        Access to the data is restricted by database rules: each person reads
        only what is theirs and the matches they play. All traffic uses HTTPS.
        If a security incident may bring relevant risk or harm, we will notify
        the ANPD and the people affected, as the law requires.
      </p>

      <h2>Cookies and browser storage</h2>
      <p>
        We use no tracking or advertising cookies. The game keeps your
        preferences in the browser's local storage, and Firebase keeps your
        sign-in session there. Both are needed for the game to work. Fonts are
        served by the site itself.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        When this policy changes, the date at the top is updated. Important
        changes will be announced in the game.
      </p>
    </>
  );
}
