// The version a production deploy gets, from the commits since the last
// release. Runs in CI (.github/workflows/ci.yml, job `version`).
//
// Usage: node scripts/release-version.mjs [--pr <number>] [--notes <file>]
//
// Since the last `v*` tag, a breaking change (`feat!:`, or a
// `BREAKING CHANGE:` footer) bumps the major, any `feat` the minor and
// anything else the patch. Merge commits don't count: the commits they bring
// do. With no tag yet, the version is package.json's. A commit that is
// already tagged keeps its version, so running again on it releases nothing.
//
// Writes `version=…` and `released=true|false` to $GITHUB_OUTPUT, the
// release notes to the --notes file, and prints the version. See
// .ai/plans/versioned-releases.md.
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const HEADER = /^(\w+)(\([^)]*\))?(!)?:\s/;
const BREAKING_FOOTER = /^BREAKING[ -]CHANGE:/m;
const SEMVER = /^v?(\d+)\.(\d+)\.(\d+)$/;

// The type of a Conventional Commit subject (`feat`, `fix`...), or null
function typeOf(subject) {
  return HEADER.exec(subject)?.[1].toLowerCase() ?? null;
}

function isBreaking(commit) {
  return (
    HEADER.exec(commit.subject)?.[3] === '!' ||
    BREAKING_FOOTER.test(commit.body)
  );
}

// The largest bump any of the commits asks for
export function bumpFor(commits) {
  if (commits.some(isBreaking)) return 'major';

  return commits.some((commit) => typeOf(commit.subject) === 'feat')
    ? 'minor'
    : 'patch';
}

// The version after the `last` tag (v1.2.3), or `base` before the first one
export function nextVersion(last, base, commits) {
  const match = SEMVER.exec(last ?? '');

  if (!match) {
    if (!SEMVER.test(base)) throw new Error(`Not a version: ${base}`);
    return base.replace(/^v/, '');
  }

  const [major, minor, patch] = match.slice(1).map(Number);

  switch (bumpFor(commits)) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

// The highest release tag (vX.Y.Z) of a list, or null
export function highestTag(tags) {
  const releases = tags.filter((tag) => SEMVER.test(tag));
  const parts = (tag) => SEMVER.exec(tag).slice(1).map(Number);

  releases.sort((a, b) => {
    const [x, y] = [parts(a), parts(b)];
    return y[0] - x[0] || y[1] - x[1] || y[2] - x[2];
  });

  return releases[0] ?? null;
}

const SECTIONS = [
  ['Breaking changes', isBreaking],
  ['Features', (commit) => typeOf(commit.subject) === 'feat'],
  ['Fixes', (commit) => typeOf(commit.subject) === 'fix'],
  ['Other changes', () => true],
];

// Markdown for the GitHub Release: the commits, newest first, by kind
export function releaseNotes(last, commits) {
  if (!last) return 'The first versioned release of Bat Hunter.\n';
  if (commits.length === 0) return `No changes since ${last}.\n`;

  const left = new Set(commits);
  const parts = [];

  for (const [title, matches] of SECTIONS) {
    const picked = [...left].filter(matches);
    if (picked.length === 0) continue;

    picked.forEach((commit) => left.delete(commit));
    const lines = picked.map(
      (commit) => `- ${commit.subject} (${commit.sha.slice(0, 7)})`
    );
    parts.push(`## ${title}\n\n${lines.join('\n')}\n`);
  }

  return parts.join('\n');
}

// -- CLI --

function git(...args) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function lastTag() {
  try {
    // Fails, quietly, until the first release is tagged
    return git('describe', '--tags', '--abbrev=0', '--match', 'v[0-9]*').trim();
  } catch {
    return null;
  }
}

function tagsOnHead() {
  return git('tag', '--points-at', 'HEAD', '--list', 'v[0-9]*')
    .split('\n')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function commitsSince(tag) {
  const range = tag ? [`${tag}..HEAD`] : ['HEAD'];

  return git('log', '--no-merges', '--format=%H%x1f%s%x1f%b%x1e', ...range)
    .split('\x1e')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [sha, subject, body = ''] = entry.split('\x1f');
      return { sha, subject, body };
    });
}

function option(args, name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

export function main(args) {
  const pr = option(args, '--pr');
  // A preview is never released, so only main reuses an existing tag
  const released = pr ? null : highestTag(tagsOnHead());
  const last = lastTag();
  const commits = released ? [] : commitsSince(last);
  const { version: base } = JSON.parse(readFileSync('package.json', 'utf8'));
  const release = released
    ? released.slice(1)
    : nextVersion(last, base, commits);
  const version = pr ? `${release}-pr.${pr}` : release;

  const notes = option(args, '--notes');
  if (notes) {
    writeFileSync(
      notes,
      released
        ? `Already released as ${released}.\n`
        : releaseNotes(last, commits)
    );
  }

  const output = process.env.GITHUB_OUTPUT;
  if (output) {
    appendFileSync(
      output,
      `version=${version}\nreleased=${Boolean(released)}\n`
    );
  }

  console.log(version);
  return version;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main(process.argv.slice(2));
}
