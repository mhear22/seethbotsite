/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment:
        'Circular dependencies make modules impossible to reason about or extract in isolation.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment:
        'Modules nothing depends on are dead weight — delete them or wire them in. ' +
        'Vue workspaces are excluded: dependency-cruiser cannot parse .vue SFC imports, so anything imported only from a component would be a false positive.',
      from: {
        orphan: true,
        pathNot: [
          '^(frontend|apps/[^/]+/frontend)/',
          '\\.vue$',
          '\\.d\\.ts$',
          '(^|/)\\.[^/]+\\.(cjs|mjs|js|json)$',
          '(^|/)(test|tests|__mocks__|fixtures|e2e)/',
          '\\.(test|spec)\\.[cm]?[jt]s$',
          '(^|/)(main|index|seed|cli)\\.[cm]?[jt]s$',
          '(^|/)scripts/',
        ],
      },
      to: {},
    },
    {
      name: 'not-to-test',
      severity: 'error',
      comment: 'Production code must not depend on test files.',
      from: {
        pathNot: [
          '\\.(test|spec)\\.[cm]?[jt]s$',
          '(^|/)(test|tests|test-utils|__mocks__|fixtures|e2e)/',
          '(^|/)(test-setup|test-support)\\.[cm]?[jt]s$',
        ],
      },
      to: {
        path: [
          '\\.(test|spec)\\.[cm]?[jt]s$',
          '(^|/)(test|tests|test-utils|__mocks__)/',
          '(^|/)test-setup\\.[cm]?[jt]s$',
        ],
      },
    },
    {
      name: 'no-cross-app-imports',
      severity: 'error',
      comment:
        'The apps under apps/ are standalone; they must not reach into each other or into the main site.',
      from: { path: '^apps/([^/]+)/' },
      to: { path: '^(backend|frontend|apps)/', pathNot: ['^apps/$1/'] },
    },
    {
      name: 'no-duplicate-dep-types',
      severity: 'warn',
      comment: 'A package should appear in only one dependency bucket of a package.json.',
      from: {},
      to: { moreThanOneDependencyType: true, dependencyTypesNot: ['type-only'] },
    },
  ],
  options: {
    doNotFollow: { path: ['node_modules'] },
    exclude: {
      path: [
        'node_modules',
        '\\.d\\.ts$',
        '(^|/)dist/',
        '(^|/)coverage/',
        'backend/mech-webdist',
        'backend/public',
        'frontend/public',
        'frontend/assets',
        'src/types/openapi\\.ts$',
      ],
    },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types', 'typings'],
    },
    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
};
