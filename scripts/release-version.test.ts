import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// git, as the script sees it: the latest tag, the tags on HEAD and the log
const repo = vi.hoisted(() => ({
  lastTag: null as string | null,
  headTags: [] as string[],
  commits: [] as { sha: string; subject: string; body?: string }[],
  calls: [] as string[][],
}));

vi.mock('node:child_process', () => ({
  execFileSync: (_cmd: string, args: string[]) => {
    repo.calls.push(args);
    if (args[0] === 'describe') {
      if (!repo.lastTag) throw new Error('No names found');
      return `${repo.lastTag}\n`;
    }
    if (args[0] === 'tag') return repo.headTags.join('\n') + '\n';
    return repo.commits
      .map((c) => `${c.sha}\x1f${c.subject}\x1f${c.body ?? ''}\x1e`)
      .join('\n');
  },
}));

import {
  bumpFor,
  highestTag,
  main,
  nextVersion,
  releaseNotes,
} from './release-version.mjs';

const commit = (subject: string, body = '', sha = 'abcdef1234567') => ({
  sha,
  subject,
  body,
});

let dir: string;

beforeEach(() => {
  repo.lastTag = null;
  repo.headTags = [];
  repo.commits = [];
  repo.calls = [];
  dir = mkdtempSync(join(tmpdir(), 'release-'));
  vi.spyOn(console, 'log').mockImplementation(() => {});
  delete process.env.GITHUB_OUTPUT;
});

afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe('bumpFor', () => {
  it.each([
    [['fix: a', 'docs: b'], 'patch'],
    [['chore: a', 'Merge branch x', 'no type at all'], 'patch'],
    [['fix: a', 'feat: b'], 'minor'],
    [['feat(chat): b'], 'minor'],
    [['FEAT: shouted'], 'minor'],
    [['feat!: b'], 'major'],
    [['refactor(rules)!: b'], 'major'],
  ])('%j → %s', (subjects, bump) => {
    expect(bumpFor(subjects.map((s) => commit(s)))).toBe(bump);
  });

  it('reads a BREAKING CHANGE footer', () => {
    expect(bumpFor([commit('fix: a', 'Why.\n\nBREAKING CHANGE: gone')])).toBe(
      'major'
    );
    expect(bumpFor([commit('fix: a', 'BREAKING-CHANGE: gone')])).toBe('major');
  });

  it('is a patch with no commits', () => {
    expect(bumpFor([])).toBe('patch');
  });
});

describe('nextVersion', () => {
  it('starts from package.json before the first tag', () => {
    expect(nextVersion(null, '1.0.0', [commit('feat: a')])).toBe('1.0.0');
    expect(nextVersion(null, 'v2.3.4', [])).toBe('2.3.4');
    expect(nextVersion('not-a-tag', '1.0.0', [])).toBe('1.0.0');
  });

  it('refuses a package.json version that is not one', () => {
    expect(() => nextVersion(null, '1.0', [])).toThrow('Not a version: 1.0');
  });

  it('bumps from the last tag', () => {
    expect(nextVersion('v1.2.3', '1.0.0', [commit('fix: a')])).toBe('1.2.4');
    expect(nextVersion('v1.2.3', '1.0.0', [commit('feat: a')])).toBe('1.3.0');
    expect(nextVersion('v1.2.3', '1.0.0', [commit('feat!: a')])).toBe('2.0.0');
  });
});

describe('highestTag', () => {
  it('picks the highest release tag, by number', () => {
    expect(highestTag(['v1.9.0', 'v1.10.0', 'v1.2.3'])).toBe('v1.10.0');
    expect(highestTag(['v1.0.0', 'v2.0.0', 'v1.5.5'])).toBe('v2.0.0');
    expect(highestTag(['v1.0.1', 'v1.0.10', 'v1.0.2'])).toBe('v1.0.10');
  });

  it('ignores tags that are not releases', () => {
    expect(highestTag(['v1.0.0-beta', 'latest'])).toBeNull();
    expect(highestTag([])).toBeNull();
  });
});

describe('releaseNotes', () => {
  it('opens the first release', () => {
    expect(releaseNotes(null, [commit('feat: a')])).toBe(
      'The first versioned release of Bat Hunter.\n'
    );
  });

  it('says when nothing changed', () => {
    expect(releaseNotes('v1.0.0', [])).toBe('No changes since v1.0.0.\n');
  });

  it('groups the commits by kind, each once', () => {
    const notes = releaseNotes('v1.0.0', [
      commit('feat!: new rules', '', '1111111aaaa'),
      commit('feat(chat): emoji', '', '2222222bbbb'),
      commit('fix: crosshair', '', '3333333cccc'),
      commit('docs: readme', '', '4444444dddd'),
    ]);

    expect(notes).toBe(
      [
        '## Breaking changes\n\n- feat!: new rules (1111111)\n',
        '## Features\n\n- feat(chat): emoji (2222222)\n',
        '## Fixes\n\n- fix: crosshair (3333333)\n',
        '## Other changes\n\n- docs: readme (4444444)\n',
      ].join('\n')
    );
  });

  it('leaves out the empty sections', () => {
    expect(releaseNotes('v1.0.0', [commit('fix: a', '', '5555555eeee')])).toBe(
      '## Fixes\n\n- fix: a (5555555)\n'
    );
  });
});

describe('main', () => {
  const outputFile = () => join(dir, 'output');
  const notesFile = () => join(dir, 'notes.md');
  const read = (path: string) => readFileSync(path, 'utf8');

  it('the first release: package.json version, all the history', () => {
    process.env.GITHUB_OUTPUT = outputFile();
    repo.commits = [commit('feat: a')];

    expect(main(['--notes', notesFile()])).toBe('1.0.0');
    expect(read(outputFile())).toBe('version=1.0.0\nreleased=false\n');
    expect(read(notesFile())).toBe(
      'The first versioned release of Bat Hunter.\n'
    );
    expect(repo.calls).toContainEqual([
      'log',
      '--no-merges',
      '--format=%H%x1f%s%x1f%b%x1e',
      'HEAD',
    ]);
  });

  it('the next release: the commits since the last tag, merges left out', () => {
    process.env.GITHUB_OUTPUT = outputFile();
    repo.lastTag = 'v1.2.3';
    repo.commits = [commit('feat: a', '', '6666666ffff')];

    expect(main(['--notes', notesFile()])).toBe('1.3.0');
    expect(read(outputFile())).toBe('version=1.3.0\nreleased=false\n');
    expect(read(notesFile())).toBe('## Features\n\n- feat: a (6666666)\n');
    expect(repo.calls).toContainEqual([
      'log',
      '--no-merges',
      '--format=%H%x1f%s%x1f%b%x1e',
      'v1.2.3..HEAD',
    ]);
  });

  it('a commit already released keeps its version', () => {
    process.env.GITHUB_OUTPUT = outputFile();
    repo.lastTag = 'v1.3.0';
    repo.headTags = ['v1.2.9', 'v1.3.0'];

    expect(main(['--notes', notesFile()])).toBe('1.3.0');
    expect(read(outputFile())).toBe('version=1.3.0\nreleased=true\n');
    expect(read(notesFile())).toBe('Already released as v1.3.0.\n');
    expect(repo.calls.some((args) => args[0] === 'log')).toBe(false);
  });

  it('a PR preview is the next version with -pr.N, never released', () => {
    repo.lastTag = 'v1.3.0';
    repo.headTags = ['v1.3.0'];
    repo.commits = [commit('fix: a')];

    expect(main(['--pr', '12'])).toBe('1.3.1-pr.12');
    expect(repo.calls.some((args) => args[0] === 'tag')).toBe(false);
    expect(console.log).toHaveBeenCalledWith('1.3.1-pr.12');
  });

  it('runs on its own from the command line', async () => {
    const argv = process.argv;
    // The real path: in a test file Vite rewrites new URL(..., import.meta.url)
    process.argv = ['node', join(process.cwd(), 'scripts/release-version.mjs')];

    vi.resetModules();
    await import('./release-version.mjs');
    process.argv = argv;

    expect(console.log).toHaveBeenCalledWith('1.0.0');
  });

  it('does nothing on import without a script path', async () => {
    const argv = process.argv;
    process.argv = ['node'];

    vi.resetModules();
    await import('./release-version.mjs');
    process.argv = argv;

    expect(console.log).not.toHaveBeenCalled();
  });
});
