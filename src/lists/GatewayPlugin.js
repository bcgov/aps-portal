const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { externallySourced } = require('../components/ExternalSource')

const { byTracking, atTracking } = require('@keystonejs/list-plugins')

const { EnforcementPoint } = require('../authz/enforcement')

module.exports = {
  fields: {
    name: {
        type: Text,
        isRequired: true,
    },
    // kongPluginId: {
    //     type: Text,
    //     isRequired: false,
    // },
    namespace: {
        type: Text,
        isRequired: false,
        adminConfig: {
            isReadOnly: true
        }
    },
    tags: {
        type: Text,
        isRequired: true,
        adminConfig: {
            isReadOnly: false
        }
    },
    config: {
        type: Text,
        isRequired: true,
    },
    service: { type: Relationship, ref: 'GatewayService', many: false },
    route: { type: Relationship, ref: 'GatewayRoute', many: false }
  },
  access: EnforcementPoint,
  plugins: [
    externallySourced(),
    atTracking()
  ]
}
