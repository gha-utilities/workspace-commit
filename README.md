## GHA Workspace Commit
[heading__title]:
  #gha-workspace-commit
  "&#x2B06; Top of ReadMe File"


JavaScript wrapper runs `child_process.execSync("git commit ...")` on GitHub Actions


## [![Byte size of workspace-commit][badge__master__workspace_commit__source_code]][workspace_commit__master__source_code] [![Open Issues][badge__issues__workspace_commit]][issues__workspace_commit] [![Open Pull Requests][badge__pulls__workspace_commit]][pulls__workspace_commit] [![Latest commits][badge__commits__workspace_commit__master]][commits__workspace_commit__master]


------


#### Table of Contents


- [:arrow_up: Top of ReadMe File][heading__title]

- [:building_construction: Requirements][heading__requirements]

- [:zap: Quick Start][heading__quick_start]

- [&#x1F5D2; Notes][notes]

- [:card_index: Attribution][heading__attribution]

- [:balance_scale: License][heading__license]


------



## Requirements
[heading__requirements]:
  #requirements
  "&#x1F3D7; What is needed prior to making use of this repository"


Access to GitHub Actions if using on GitHub, or manually assigning environment variables prior to running `npm test`.


___


## Quick Start
[heading__quick_start]:
  #quick-start
  "&#9889; Perhaps as easy as one, 2.0,..."


Reference the code of this repository within your own `workflow`...


```YAML
on:
  push:
    branches:
      - src-pages

jobs:
  jekyll_build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout source branch for building Pages
        uses: actions/checkout@v1
        with:
          ref: src-pages
          fetch-depth: 10

      - name: Make build destination directory
        run: mkdir -vp ~/www/repository-name

      - name: Jekyll Build
        uses: gha-utilities/jekyll-build@v0.0.1
        with:
          jekyll_github_token: ${{ secrets.JEKYLL_GITHUB_TOKEN }}
          source: ./
          destination: ~/www/repository-name

      - name: Checkout branch for Pull Requesting to GitHub Pages
        uses: actions/checkout@v1
        with:
          ref: pr-pages
          fetch-depth: 1
          submodules: true

      - name: Copy built site files into Git branch
        run: cp -r ~/www/repository-name ./

      - name: Add changes to Git tracking
        run: git add -A .

      - name: Commit changes
        with: gha-utilities/workspace-commit@v0.0.2
          message: Updates compiled site files
          all: true

      - name: Push changes
        uses: ad-m/github-push-action@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          branch: pr-pages

      - name: Initialize Pull Request
        uses: gha-utilities/init-pull-request@v0.0.2
        with:
          pull_request_token: ${{ secrets.GITHUB_TOKEN }}
          head: pr-pages
          base: gh-pages
          title: 'Updates site files from latest Actions build'
          body: >
            Perhaps a multi-line description
            about latest features and such.
```


___


## Notes
[notes]:
  #notes
  "&#x1F5D2; Additional notes and links that may be worth clicking in the future"


This Action is intended for committing _local_ Workspace repository changes, and does **not** assume that an immediate push is wanted; Pull Requests are certainly welcomed if bugs are found, or more commit related Inputs translation are desired.


------


The commit author default user name of `gha-utilities` and email of `actions@github.com`, may be modified within your Workflows as well as selecting a subset of staged paths to commit...


```YAML
      - name: Workspace Commit
        uses: gha-utilities/workspace-commit@v0.0.2
        with:
          paths: |
            README.md
            index.js
            etc
          message: Updates compiled site files
          author: ${{ github.author }}
          email: name@example.com
```


... At which point running `git commit` directly from a Workflow without this action may be shorter for one-line commit messages...


```YAML
      - name: Commit Changes
        run: |
          git -c "user.name ${{ github.actor }}"\
              -c "user.email name@example.com"\
              README.md\
              index.js\
              etc\
              commit "_message_"
```


------


Multi-line commit messages are possible from Workflow file(s), and _should_ also allow for environment variables...


```YAML
      - name: Workspace Commit
        uses: gha-utilities/workspace-commit@v0.0.2
        env:
          COMMIT_MESSAGE_FOOTER: This commit was applied automatically from an Action
        with:
          all: true
          message: >
            Updates compiled site files

            ${COMMIT_MESSAGE_FOOTER}


```

___


## Attribution
[heading__attribution]:
  #attribution
  "&#x1F4C7; Resources that where helpful in building this project so far."


- [GitHub -- `@actions/github`](https://github.com/actions/toolkit/tree/master/packages/github)

- [GitHub -- `@actions/core`](https://github.com/actions/toolkit/tree/master/packages/core)

- [GitHub -- `peter-evans/create-pull-request`](https://github.com/peter-evans/create-pull-request)

- [GitHub -- `ad-m/github-push-action`](https://github.com/ad-m/github-push-action)

- [GitHub -- Creating a JavaScript Action](https://help.github.com/en/articles/creating-a-javascript-action#commit-and-push-your-action-to-github), specifically the `commit-and-push-your-action-to-github` section that states dependencies must be checked into Git tracking.

- [GitHub -- Workflow syntax for GitHub actions](https://help.github.com/en/articles/workflow-syntax-for-github-actions)

- [StackOverflow -- GitHub Actions share Workspace Artifacts between jobs](https://stackoverflow.com/questions/57498605)


___


## License
[heading__license]:
  #license
  "&#x2696; Legal bits of Open Source software"


Legal bits of Open Source software. Note the following license does **not** necessarily apply to any dependencies of this repository.


```
Workspace Commit GitHub Actions documentation
Copyright (C) 2019  S0AndS0

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation; version 3 of the License.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```



[badge__commits__workspace_commit__master]:
  https://img.shields.io/github/last-commit/gha-utilities/workspace-commit/master.svg

[commits__workspace_commit__master]:
  https://github.com/gha-utilities/workspace-commit/commits/master
  "&#x1F4DD; History of changes on this branch"


[workspace_commit__community]:
  https://github.com/gha-utilities/workspace-commit/community
  "&#x1F331; Dedicated to functioning code"


[badge__issues__workspace_commit]:
  https://img.shields.io/github/issues/gha-utilities/workspace-commit.svg

[issues__workspace_commit]:
  https://github.com/gha-utilities/workspace-commit/issues
  "&#x2622; Search for and _bump_ existing issues or open new issues for project maintainer to address."


[badge__pulls__workspace_commit]:
  https://img.shields.io/github/issues-pr/gha-utilities/workspace-commit.svg

[pulls__workspace_commit]:
  https://github.com/gha-utilities/workspace-commit/pulls
  "&#x1F3D7; Pull Request friendly, though please check the Community guidelines"


[badge__master__workspace_commit__source_code]:
  https://img.shields.io/github/repo-size/gha-utilities/workspace-commit

[workspace_commit__master__source_code]:
  https://github.com/gha-utilities/workspace-commit
  "&#x2328; Project source code!"
