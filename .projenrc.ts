import { awscdk, ReleasableCommits } from 'projen';
import { GithubCredentials } from 'projen/lib/github';
import { AppPermission } from 'projen/lib/github/workflows-model';
import {
  TrailingComma,
  UpgradeDependenciesSchedule,
} from 'projen/lib/javascript';
import { ReleaseTrigger } from 'projen/lib/release';

const project = new awscdk.AwsCdkConstructLibrary({
  author: 'JumpToTheCloud',
  authorAddress: 'antonio.marquez@jumptothecloud.tech',
  cdkVersion: '2.232.2',
  constructsVersion: '10.4.2',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.9.0',
  name: '@jttc/aws-ipam',
  projenrcTs: true,
  repositoryUrl: 'git@github.com:JumpToTheCloud/aws-ipam.git',
  keywords: [
    'aws',
    'cdk',
    'ipam',
    'ipam pool',
    'ipam scope',
    'ipam allocation',
  ],
  prettier: true,
  prettierOptions: {
    settings: {
      trailingComma: TrailingComma.ES5,
      singleQuote: true,
      bracketSpacing: true,
      semi: true,
    },
  },
  autoMerge: false,
  mergify: false,
  autoApproveUpgrades: true,
  autoApproveOptions: {},
  release: true,
  releaseTrigger: ReleaseTrigger.workflowDispatch(),
  releasableCommits: ReleasableCommits.featuresAndFixes(),
  depsUpgrade: true,
  depsUpgradeOptions: {
    workflowOptions: {
      schedule: UpgradeDependenciesSchedule.WEEKLY,
    },
  },
  majorVersion: 1,
  prerelease: 'beta',
  jestOptions: {
    jestConfig: {
      verbose: true,
    },
  },
  githubOptions: {
    projenCredentials: GithubCredentials.fromApp({
      permissions: {
        pullRequests: AppPermission.WRITE,
        contents: AppPermission.WRITE,
      },
    }),
    pullRequestLintOptions: {
      semanticTitleOptions: {
        types: [
          'feat',
          'fix',
          'chore',
          'docs',
          'style',
          'refactor',
          'test',
          'revert',
          'ci',
        ],
      },
    },
  },
  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  devDeps: [
    'commitizen',
    'cz-customizable',
    'jest-runner-groups',
    'jest-runner',
    'jest-docblock',
  ],
  packageName: '@jttc/aws-ipam',
});

project.addTask('commit', {
  description:
    'Commit changes with conventional commits prompts provided by Commitizen',
  steps: [
    {
      exec: './node_modules/cz-customizable/standalone.js',
      receiveArgs: false,
      say: 'committing changes',
    },
  ],
});

const unitTest = project.addTask('test:unit', {
  description: 'Unit Tests',
  steps: [
    {
      exec: 'jest --group=unit',
      say: 'Unit Tests',
      receiveArgs: true,
    },
  ],
});

project.addTask('test:snapshot', {
  description: 'Snapshots Tests',
  steps: [
    {
      exec: 'jest --group=snapshot --collectCoverage=false',
      say: 'Snapshots Tests',
      receiveArgs: true,
    },
  ],
});

project.addTask('test:snapshot:update', {
  description: 'Update snapshots',
  steps: [
    {
      exec: 'jest --updateSnapshot --collectCoverage=false',
      say: 'Updating snapshots',
      receiveArgs: true,
    },
  ],
});

const testTask = project.tasks.tryFind('test');
const eslintTask = project.tasks.tryFind('eslint');

if (testTask && eslintTask) {
  testTask.reset();
  testTask.spawn(unitTest);
  testTask.spawn(eslintTask);
}

project.synth();
