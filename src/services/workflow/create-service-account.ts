
import { registerClient, findClient } from './client-credentials'
import {v4 as uuidv4} from 'uuid'
import {
    lookupProductEnvironmentServicesBySlug,
    lookupCredentialIssuerById,
    markActiveTheServiceAccess,
    addServiceAccess
} from '../keystone'
import { KongConsumerService } from '../kong'
import { AddClientConsumer } from './add-client-consumer'
import { NewCredential, RequestControls } from './types'
import { IssuerEnvironmentConfig, getIssuerEnvironmentConfig } from './types'
import { KeycloakClientRegistrationService, KeycloakTokenService, getOpenidFromIssuer } from '../keycloak'
import { Logger } from '../../logger'

const logger = Logger('wf.CreateSvcAcct')

export const CreateServiceAccount = async (context: any, productEnvironmentSlug: any, namespace: any, existingClientId?: string) : Promise<NewCredential> => {

    const productEnvironment = await lookupProductEnvironmentServicesBySlug(context, productEnvironmentSlug)

    const application : any = null
//    const application = await lookupApplication(context, requestDetails.application.id)

    const extraIdentifier = uuidv4().replace(/-/g,'').toUpperCase().substr(0, 12)
    const newClientId = ('sa-' + namespace + '-' + productEnvironment.appId + '-' + extraIdentifier).toLowerCase()

    const client = existingClientId != null ? 
        await findClient(context, productEnvironment.name, productEnvironment.credentialIssuer.id, existingClientId) : 
        await registerClient (context, productEnvironment.name, productEnvironment.credentialIssuer.id, newClientId)
    logger.debug("Using client %j", client)

    const clientId = client.client.clientId
    const nickname = client.client.clientId

    const kongApi = new KongConsumerService(process.env.KONG_URL)
    const consumer = await kongApi.createKongConsumer (nickname, clientId)
    const consumerPK = await AddClientConsumer (context, nickname, clientId, consumer.id)

    const credentialReference = {
        id: client.client.id,
        clientId: client.client.clientId,
    }

    //await linkServiceAccessToRequest (context, serviceAccessId, requestDetails.id)

    const backToUser : NewCredential = {
        flow: productEnvironment.flow,
        clientId: client.client.clientId,
        clientSecret: client.client.clientSecret,
        tokenEndpoint: client.openid.token_endpoint
    }

    //updatedItem['credential'] = JSON.stringify(backToUser)
    logger.debug("Back to user %j", backToUser)
    /*
        {
            "flow": "client-credentials",
            "clientId": "sa-abc-42da4f15-xxxx",
            "clientSecret": "xxxx",
            "tokenEndpoint": "https://auth/auth/realms/realm/protocol/openid-connect/token"
        }   
    */   

    // Create a ServiceAccess record
    const consumerType = 'client'
    const aclEnabled = (productEnvironment.flow == 'kong-api-key-acl')
    const serviceAccessId = await addServiceAccess(context, clientId, false, aclEnabled, consumerType, credentialReference, null, consumerPK, productEnvironment, application, namespace)

    //const clientId = requestDetails.serviceAccess.consumer.customId

    // Find the credential issuer and based on its type, go do the appropriate action
    const issuer = await lookupCredentialIssuerById(context, productEnvironment.credentialIssuer.id)

    const issuerEnvConfig: IssuerEnvironmentConfig = getIssuerEnvironmentConfig(issuer, productEnvironment.name)

    const openid = await getOpenidFromIssuer(issuerEnvConfig.issuerUrl)

    // token is NULL if 'iat'
    // token is retrieved from doing a /token login using the provided client ID and secret if 'managed'
    // issuer.initialAccessToken if 'iat'
    const token = issuerEnvConfig.clientRegistration == 'anonymous' ? null : (issuerEnvConfig.clientRegistration == 'managed' ? await new KeycloakTokenService(openid.issuer).getKeycloakSession(issuerEnvConfig.clientId, issuerEnvConfig.clientSecret) : issuerEnvConfig.initialAccessToken)

    const controls: RequestControls = JSON.parse('{"defaultClientScopes": []}')
    //const defaultClientScopes = controls.defaultClientScopes;
    
    const kcClientService = new KeycloakClientRegistrationService(openid.issuer, null)
    await kcClientService.updateClientRegistration (token, clientId, {clientId, enabled: true})

    // // https://dev.oidc.gov.bc.ca/auth/realms/xtmke7ky
    // console.log("S = "+openid.issuer.indexOf('/realms'))
    // const baseUrl = openid.issuer.substr(0, openid.issuer.indexOf('/realms'))
    // const realm = openid.issuer.substr(openid.issuer.lastIndexOf('/')+1)
    // console.log("B="+baseUrl+", R="+realm)

    // // Only valid for 'managed' client registration
    // const kcadminApi = new KeycloakClientService(baseUrl, realm)
    await kcClientService.login(issuerEnvConfig.clientId, issuerEnvConfig.clientSecret)

    // Sync Scopes
    await kcClientService.syncAndApply (clientId, controls.defaultClientScopes, [])

    await markActiveTheServiceAccess (context, serviceAccessId)    

    return backToUser
}