'use strict';


const child_process = require('child_process');
const fs = require('fs');
const process = require('process');


const get_gha_input = (name) => { return process.env[`INPUT_${name.toUpperCase()}`]; };


const git_commit = ({author, email, commit_message, files_list}) => {
  try {
    if (files_list) {
      return child_process.execSync(
        `git commit -c "user.name ${author}" -c "user.email ${email}" commit -m "${commit_message}" ${files_list.join(' ')}`,
        {encoding: 'utf8'}
      );
    } else {
      return child_process.execSync(
        `git commit -c "user.name ${author}" -c "user.email ${email}" commit -m "${commit_message}"`,
        {encoding: 'utf8'}
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


let author = 'gha-utilities';
if (get_gha_input('author')) {
  author = get_gha_input('author');
}

let email = 'actions@github.com';
if (get_gha_input('email')) {
  email = get_gha_input('email');
}


const commit_results = git_commit({author, email, commit_message, files_list});
console.log(`commit_results -> ${commit_results}`);
