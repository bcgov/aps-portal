import { Logger } from '../../logger'
import { AccessRequest, AccessRequestUpdateInput } from './types'

const assert = require('assert').strict;
const logger = Logger('keystone.access-req')

export async function lookupEnvironmentAndApplicationByAccessRequest (context: any, id: string) : Promise<AccessRequest> {
    const result = await context.executeGraphQL({
        query: `query GetSpecificEnvironment($id: ID!) {
                    AccessRequest(where: {id: $id}) {
                        id
                        controls
                        productEnvironment {
                            appId
                            id
                            name
                            flow
                            approval
                            credentialIssuer {
                                id
                            }
                            product {
                                namespace
                            }
                        }
                        application {
                            id
                            appId
                        }
                        serviceAccess {
                            id
                            consumer {
                                id
                                customId
                                extForeignKey
                            }
                        }
                    }
                }`,
        variables: { id: id },
    })
    logger.debug("Query [lookupEnvironmentAndApplicationByAccessRequest] result %j", result)
    return result.data.AccessRequest
}


export async function linkServiceAccessToRequest (context: any, serviceAccessId: string, requestId: string) : Promise<AccessRequest> {
    const result = await context.executeGraphQL({
        query: `mutation LinkServiceAccessToRequest($serviceAccessId: ID!, $requestId: ID!) {
                    updateAccessRequest(id: $requestId, data: { serviceAccess: { connect: { id: $serviceAccessId } } } ) {
                        id
                    }
                }`,
        variables: { serviceAccessId, requestId },
    })
    logger.debug("Mutation [linkServiceAccessToRequest] result %j", result)
    logger.debug("Linked Service Access %s to Access Request %s", serviceAccessId, requestId)

    assert.strictEqual('errors' in result, false, 'Error linking service access to request')
    return result.data.updateAccessRequest
}

export async function markAccessRequestAsNotIssued (context: any, requestId: string) : Promise<AccessRequest> {
    const result = await context.executeGraphQL({
        query: `mutation MarkRequestNotIssued($requestId: ID!) {
                    updateAccessRequest(id: $requestId, data: { isComplete: false, isIssued: false } ) {
                        id
                    }
                }`,
        variables: { requestId },
    })
    logger.debug("Mutation [markAccessRequestAsNotIssued] result %j", result)

    assert.strictEqual('errors' in result, false, 'Error marking request as not issued')
    return result.data.updateAccessRequest
}

export async function updateAccessRequestState (context: any, requestId: string, data: AccessRequestUpdateInput) : Promise<AccessRequest> {
    // { isComplete: false, isApproved: false, isIssued: false }
    const result = await context.executeGraphQL({
        query: `mutation MarkRequestNotIssued($requestId: ID!, $data: AccessRequestUpdateInput) {
                    updateAccessRequest(id: $requestId, data: $data ) {
                        id
                    }
                }`,
        variables: { requestId, data },
    })
    logger.debug("Mutation [markAccessRequestAsNotIssued] result %j", result)

    assert.strictEqual('errors' in result, false, 'Error marking request as not issued')
    return result.data.updateAccessRequest
}