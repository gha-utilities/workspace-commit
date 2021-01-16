#!/usr/bin/env node


'use strict';


const child_process = require('child_process');
const fs = require('fs');
const process = require('process');


/**
 * @function get_gha_input
 * @param {string} name
 * @return {string?}
 */
const get_gha_input = (name) => {
  return process.env[`INPUT_${name.toUpperCase()}`];
};


/**
 * @function get_git_config
 * @param {string} key
 * @return {string?}
 */
const get_git_config = (key) => {
  try {
    return child_process.execSync(`git config ${key}`, { encoding: 'utf8' });
  } catch (error) {
    const error_message = [
      `Error attempting to get: git config ${key}`,
      `Status code -> ${error.status}`,
      `Error message -> ${error.message}`,
      `Standard error -> ${error.stderr}`,
      `Standard out -> ${error.stdout}`,
    ];

    console.error(error_message.join('\n'));
    throw error;
  }
};


/**
 * @function set_git_config
 * @param {string} key
 * @param {string} value
 */
const set_git_config = (key, value) => {
  try {
    return child_process.execSync(`git config ${key} ${value}`, { encoding: 'utf8' });
  } catch (error) {
    const error_message = [
      `Error attempting to set: git config ${key} ${value}`,
      `Status code -> ${e.status}`,
      `Error message -> ${e.message}`,
      `Standard error -> ${e.stderr}`,
      `Standard out -> ${e.stdout}`,
    ];

    console.error(error_message.join('\n'));
    throw error;
  }
};


/**
 * @function git_commit
 * @param {string} obj.commit_message
 * @param {string[]} obj.files_list
 */
const git_commit = ({commit_message, files_list}) => {
  try {
    if (files_list) {
      return child_process.execSync(
        `git commit -m "${commit_message}" "${files_list.join(' ')}"`,
        { encoding: 'utf8' },
      );
    } else {
      return child_process.execSync(
        `git commit commit -m "${commit_message}"`,
        { encoding: 'utf8' },
      );
    }
  } catch (e) {
    const error_message = [
      'Error attempting to commit...',
      `Status code -> ${e.status}`,
      `Error message -> ${e.message}`,
      `Standard error -> ${e.stderr}`,
      `Standard out -> ${e.stdout}`,
      ''
    ];

    console.error(error_message.join('\n'));
    throw e;
  }
};


const actor = process.env.GITHUB_ACTOR;
const repository = process.env.GITHUB_REPOSITORY.split('/')[1];

if (actor === undefined || repository === undefined) {
  const error_message = ['Environment variable `GITHUB_ACTOR` or `GITHUB_REPOSITORY` is undefined',
                         'Please ensure that you are testing with something like...',
                         '  GITHUB_ACTOR="your-name" GITHUB_REPOSITORY="repo-name" node index.js',
                         '',
                         '... hint if errors about undefined Inputs then pop, try...',
                         '  GITHUB_ACTOR=your-name\\',
                         '  node index.js',
                         '',
  ];

  throw new ReferenceError(error_message.join('\n'));
}


const error_message__base = ['Please check that your Workflow file looks similar to...'];

const gha_example = ['  - name: Workspace Commit',
                     '    uses: gha-utilities/workspace-commit@master',
                     '    with:',
];


const commit_message = get_gha_input('message');
if (!commit_message) {
  const error_message = ['No commit message provided!',
                         ...error_message__base,
                         ...gha_example,
                         '      commit: Adds or alters files',
                         ''
  ];

  throw new ReferenceError(error_message.join('\n'));
}


const staged_files = child_process.execSync('git diff --name-only --cached', {encoding: 'utf8'});
if (!staged_files) {
  const error_message = ['No files staged to commit!',
                         'Please stage changes before attempting to commit, eg...',
                         '  git add README.md some-script.ext etc',
                         '',
  ];

  throw new ReferenceError(error_message.join('\n'));
}


const input_paths = get_gha_input('paths');

const files_list = [];

staged_files.split(/\r?\n/).forEach((path) => {
  if (path) {
    if (get_gha_input('all')) {
      files_list.push(path);

    } else if (!input_paths) {
      const error_message = [
        'No files or directories provided!',
        ...error_message__base,
        ...gha_example,
        '      paths: |',
        '        README.md',
        '        index.js',
        '        etc',
        ''
      ];
      throw new ReferenceError(error_message.join('\n'));

    } else if (input_paths.includes(path)) {
      files_list.push(path);

    } else {
      console.warn(`Skipping un-staged file -> ${path}`);
    }
  }
});


/**
 * Set git config user.name
 */
let commit_author = 'gha-utilities';
const git_config__user_name = get_git_config('user.name');
let git_config__user_name__was_set = false;
if (![undefined, '', '\n'].includes(git_config__user_name)) {
  git_config__user_name__was_set = true;
  commit_author = git_config__user_name;
}

const action_config__author = get_gha_input('author');
if (action_config__author !== undefined) {
  commit_author = action_config__author;
}

set_git_config('user.name', commit_author);


/**
 * Set git config user.email
 */
let commit_email = 'actions@github.com';
const git_config__user_email = get_git_config('user.email');
let git_config__user_email__was_set = false;
if (![undefined, '', '\n'].includes(git_config__user_email)) {
  git_config__user_email__was_set = true;
  commit_email = git_config__user_email;
}

const action_config__email = get_gha_input('email');
if (action_config__email !== undefined) {
  commit_email = action_config__email;
}

set_git_config('user.email', commit_email);


/**
 * Do the git commit
 */
const commit_results = git_commit({commit_message, files_list});
console.log(`commit_results -> ${commit_results}`);


/**
 * Revert git config user.name
 */
if (git_config__user_name__was_set) {
  set_git_config('user.name', git_config__user_name);
}

/**
 * Revert git config user.name
 */
if (git_config__user_email__was_set) {
  set_git_config('user.email', git_config__user_email);
}

