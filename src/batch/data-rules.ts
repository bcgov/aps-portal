export const metadata = {
  Organization: {
    query: 'allOrganizations',
    refKey: 'extForeignKey',
    sync: [
      'name',
      'sector',
      'title',
      'tags',
      'description',
      'orgUnits',
      'extSource',
      'extRecordHash',
    ],
    transformations: {
      tags: { name: 'toString' },
      orgUnits: {
        name: 'connectExclusiveList',
        list: 'OrganizationUnit',
        syncFirst: true,
      },
    },
  },
  OrganizationUnit: {
    query: 'allOrganizationUnits',
    refKey: 'extForeignKey',
    sync: [
      'name',
      'sector',
      'title',
      'tags',
      'description',
      'extSource',
      'extRecordHash',
    ],
    transformations: {
      tags: { name: 'toStringDefaultArray' },
    },
  },
  Dataset: {
    query: 'allDatasets',
    refKey: 'extForeignKey',
    sync: [
      'name',
      'sector',
      'license_title',
      'security_class',
      'view_audience',
      'download_audience',
      'record_publish_date',
      'notes',
      'title',
      'organization',
      'organizationUnit',
      'isInCatalog',
      'tags',
      'extSource',
      'extRecordHash',
    ],
    transformations: {
      tags: { name: 'toString' },
      organization: {
        name: 'connectOne',
        key: 'org',
        list: 'allOrganizations',
        refKey: 'extForeignKey',
      },
      organizationUnit: {
        name: 'connectOne',
        key: 'sub_org',
        list: 'allOrganizationUnits',
        refKey: 'extForeignKey',
      },
      isInCatalog: { name: 'alwaysTrue' },
    },
  },
  DraftDataset: {
    entity: 'Dataset',
    query: 'allDatasets',
    refKey: 'name',
    sync: [
      'name',
      'sector',
      'license_title',
      'security_class',
      'view_audience',
      'download_audience',
      'record_publish_date',
      'notes',
      'title',
      'organization',
      'organizationUnit',
      'isInCatalog',
      'tags',
    ],
    transformations: {
      tags: { name: 'toString' },
      organization: {
        name: 'connectOne',
        list: 'allOrganizations',
        refKey: 'name',
      },
      organizationUnit: {
        name: 'connectOne',
        list: 'allOrganizationUnits',
        refKey: 'name',
      },
      isInCatalog: { name: 'alwaysFalse' },
    },
  },
  Metric: {
    query: 'allMetrics',
    refKey: 'name',
    sync: ['query', 'day', 'metric', 'values'],
    transformations: {
      metric: { name: 'toString' },
      values: { name: 'toString' },
      service: {
        name: 'connectOne',
        key: 'metric.service',
        list: 'allGatewayServices',
        refKey: 'name',
      },
    },
  },
  Alert: {
    query: 'allAlerts',
    refKey: 'name',
    sync: ['name'],
    transformations: {},
  },
  Namespace: {
    query: 'allNamespaces',
    refKey: 'extRefId',
    sync: ['name'],
    transformations: {
      members: {
        name: 'connectExclusiveList',
        list: 'Member',
        syncFirst: true,
      },
    },
  },
  MemberRole: {
    query: 'allMemberRoles',
    refKey: 'extRefId',
    sync: ['role', 'user'],
    transformations: {
      user: {
        name: 'connectOne',
        key: 'metric.service',
        list: 'allUsers',
        refKey: 'name',
      },
    },
  },
  GatewayService: {
    query: 'allGatewayServices',
    refKey: 'extForeignKey',
    sync: [
      'name',
      'namespace',
      'host',
      'tags',
      'plugins',
      'extSource',
      'extRecordHash',
    ],
    hooks: ['handleNameChange'],
    transformations: {
      tags: { name: 'toStringDefaultArray' },
      namespace: { name: 'mapNamespace' },
      plugins: {
        name: 'connectExclusiveList',
        list: 'GatewayPlugin',
        syncFirst: true,
      },
      // routes: {name: "connectExclusiveList", list: "GatewayRoute", loadFirst: true}
    },
  },
  GatewayGroup: {
    query: 'allGatewayGroups',
    refKey: 'extForeignKey',
    sync: ['name', 'namespace', 'extSource', 'extRecordHash'],
    transformations: {},
  },
  GatewayRoute: {
    childOnly: false,
    query: 'allGatewayRoutes',
    refKey: 'extForeignKey',
    sync: [
      'name',
      'namespace',
      'methods',
      'paths',
      'hosts',
      'tags',
      'plugins',
      'extSource',
      'extRecordHash',
    ],
    hooks: ['handleNameChange'],
    transformations: {
      tags: { name: 'toStringDefaultArray' },
      methods: { name: 'toStringDefaultArray' },
      paths: { name: 'toStringDefaultArray' },
      hosts: { name: 'toStringDefaultArray' },
      namespace: { name: 'mapNamespace' },
      service: {
        name: 'connectOne',
        key: 'service.id',
        list: 'allGatewayServices',
        refKey: 'extForeignKey',
      },
      plugins: {
        name: 'connectExclusiveList',
        list: 'GatewayPlugin',
        syncFirst: true,
      },
    },
  },
  GatewayPlugin: {
    childOnly: true,
    query: 'allGatewayPlugins',
    refKey: 'extForeignKey',
    sync: ['name', 'tags', 'config', 'extSource', 'extRecordHash'],
    transformations: {
      tags: { name: 'toStringDefaultArray' },
      config: { name: 'toString' },
      service: {
        name: 'connectOne',
        key: 'service.id',
        list: 'allGatewayServices',
        refKey: 'extForeignKey',
      },
      route: {
        name: 'connectOne',
        key: 'route.id',
        list: 'allGatewayRoutes',
        refKey: 'extForeignKey',
      },
    },
  },
  GatewayConsumer: {
    query: 'allGatewayConsumers',
    refKey: 'extForeignKey',
    sync: [
      'username',
      'tags',
      'customId',
      'namespace',
      'aclGroups',
      'plugins',
      'extSource',
      'extRecordHash',
    ],
    transformations: {
      tags: { name: 'toStringDefaultArray' },
      aclGroups: { name: 'toStringDefaultArray' },
      namespace: { name: 'mapNamespace' },
      plugins: {
        name: 'connectExclusiveList',
        list: 'GatewayPlugin',
        syncFirst: true,
      },
    },
  },
  ServiceAccess: {
    query: 'allServiceAccesses',
    refKey: 'name',
    sync: ['active', 'aclEnabled', 'consumerType'],
    transformations: {
      application: {
        name: 'connectOne',
        list: 'allApplications',
        refKey: 'appId',
      },
      consumer: {
        name: 'connectOne',
        list: 'allGatewayConsumers',
        refKey: 'username',
      },
      productEnvironment: {
        name: 'connectOne',
        list: 'allEnvironments',
        refKey: 'appId',
      },
    },
  },
  Application: {
    query: 'allApplications',
    refKey: 'appId',
    sync: ['name', 'description'],
    transformations: {
      owner: { name: 'connectOne', list: 'allUsers', refKey: 'username' },
      organization: {
        name: 'connectOne',
        key: 'org',
        list: 'allOrganizations',
        refKey: 'name',
      },
      organizationUnit: {
        name: 'connectOne',
        key: 'sub_org',
        list: 'allOrganizationUnits',
        refKey: 'name',
      },
    },
  },
  Product: {
    query: 'allProducts',
    refKey: 'appId',
    sync: ['name', 'namespace'],
    transformations: {
      dataset: { name: 'connectOne', list: 'allDatasets', refKey: 'name' },
      environments: {
        name: 'connectExclusiveList',
        list: 'Environment',
        syncFirst: true,
      },
      organization: {
        name: 'connectOne',
        list: 'allOrganizations',
        refKey: 'name',
      },
      organizationUnit: {
        name: 'connectOne',
        list: 'allOrganizationUnits',
        refKey: 'name',
      },
    },
  },
  Environment: {
    query: 'allEnvironments',
    refKey: 'appId',
    sync: ['name', 'active', 'approval', 'flow', 'additionalDetailsToRequest'],
    transformations: {
      services: {
        name: 'connectMany',
        list: 'allGatewayServices',
        refKey: 'name',
      },
      legal: { name: 'connectOne', list: 'allLegals', refKey: 'reference' },
      credentialIssuer: {
        name: 'connectOne',
        list: 'allCredentialIssuers',
        refKey: 'name',
      },
    },
  },
  CredentialIssuer: {
    query: 'allCredentialIssuers',
    refKey: 'name',
    sync: [
      'name',
      'namespace',
      'description',
      'flow',
      'clientRegistration',
      'mode',
      'authPlugin',
      'clientAuthenticator',
      'instruction',
      'environmentDetails',
      'oidcDiscoveryUrl',
      'initialAccessToken',
      'clientId',
      'clientSecret',
      'clientRoles',
      'availableScopes',
      'resourceScopes',
      'resourceType',
      'resourceAccessScope',
      'apiKeyName',
      'owner',
    ],
    transformations: {
      availableScopes: { name: 'toStringDefaultArray' },
      resourceScopes: { name: 'toStringDefaultArray' },
      clientRoles: { name: 'toStringDefaultArray' },
      environmentDetails: { name: 'toString' },
      owner: { name: 'connectOne', list: 'allUsers', refKey: 'username' },
    },
  },
  Content: {
    query: 'allContents',
    refKey: 'externalLink',
    sync: [
      'title',
      'description',
      'content',
      'githubRepository',
      'readme',
      'order',
      'isPublic',
      'isComplete',
      'tags',
      'publishDate',
      'slug',
    ],
    transformations: {
      tags: { name: 'toStringDefaultArray' },
      namespace: { name: 'mapNamespace' },
    },
  },
  ContentBySlug: {
    entity: 'Content',
    query: 'allContents',
    refKey: 'slug',
    sync: [
      'externalLink',
      'title',
      'description',
      'content',
      'githubRepository',
      'readme',
      'order',
      'isPublic',
      'isComplete',
      'tags',
      'publishDate',
    ],
    transformations: {
      tags: { name: 'toStringDefaultArray' },
      namespace: { name: 'mapNamespace' },
    },
  },
  Legal: {
    query: 'allLegals',
    refKey: 'reference',
    sync: ['title', 'link', 'document', 'version', 'active'],
    transformations: {},
  },
  Activity: {
    query: 'allActivities',
    refKey: 'extRefId',
    sync: [
      'type',
      'name',
      'action',
      'result',
      'message',
      'refId',
      'namespace',
      'actor',
    ],
    transformations: {
      actor: { name: 'connectOne', list: 'allUsers', refKey: 'username' },
      blob: { name: 'connectOne', list: 'allBlobs', refKey: 'ref' },
    },
  },
  User: {
    query: 'allUsers',
    refKey: 'username',
    sync: ['name', 'username', 'email'],
    transformations: {},
  },
};
