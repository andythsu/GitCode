# GitCode

## What is GitCode?

GitCode is a chrome extension that automatically pushes your code to GitHub when you pass all tests on a Leetcode problem.

## Why GitCode?

### Background

I was one of the contributors to the opensource project [Leethub](https://github.com/QasimWani/LeetHub). However, it appears that the original owner is not updating the extension as regularly and frequently as before. Consequently, there are many unresolved issues and pending PRs. Since the repo is not as active as before, I've decided to create my own extension that builds upon the foundation of LeetHub. Additionally, due to the radical change in the workflow, GitCode is more resilient to any code changes that Leetcode might introduce.

### Motivation

1. Recruiters _want_ to see your contributions to the Open Source community, be it through side projects, solving algorithms/data-structures, or contributing to existing OS projects.
   As of now, GitHub is developers' #1 portfolio. GitCode just makes it much easier (autonomous) to keep track of progress and contributions on the largest network of engineering community, GitHub.
2. There's no easy way of accessing your leetcode problems in one place!
   Moreover, pushing code manually to GitHub from Leetcode is very time consuming. So, why not just automate it entirely without spending a SINGLE additional second on it?

### Roadmap

The objective of GitCode not only pushes Leetcode solutions to Github, but also pushes solutions from other platforms to Github. Ultimately, Github should be our only source of portfolio, allowing us to conveniently access ALL of our solutions in one place.

## Discord

Join our [Discord channel](https://discord.gg/QrujRsZdcB) for discussions and opportunities to contribute.

## Local development

### Prerequisites

- [node + npm](https://nodejs.org/) (Current Version)

### Install

```
npm install
```

### Build

```
npm run build
```

### Build in watch mode

```
npm run watch
```

## Load extension to chrome

Load `dist` directory
