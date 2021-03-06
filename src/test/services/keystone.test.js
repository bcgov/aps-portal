import fetch from 'node-fetch'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

import keystone from '../../services/keystone';

describe("KeystoneJS", function() {

    const context = {
        executeGraphQL: (q) => {
            if (q.query.indexOf('GetSpecificEnvironment') != -1) {
                return {data: {allAccessRequests: [ { credentialReference: "", application: { appId: "APP-01"}, productEnvironment: { name: 'ENV-NAME', credentialIssuer: { id: 'ISSUER-01'} }} ] } }
            }
            if (q.query.indexOf('FindConsumerByUsername') != -1) {
                return {data: {allConsumers: [ { kongConsumerId: 'CONSUMER-001' } ] } }
            }
            if (q.query.indexOf('GetCredentialIssuerById') != -1) {
                return {data: {allCredentialIssuers: [ { name: 'ISSUER-001' } ] } }
            }
            if (q.query.indexOf('CreateNewConsumer') != -1) {
                return {data: {createConsumer: { id: 'CONSUMER-001' } } }
            }
            if (q.query.indexOf('UpdateConsumerInAccessRequest') != -1) {
                return {data: {updateAccessRequest: { id: 'REQUEST-001' } } }
            }
        }  
    }

    describe('test lookupEnvironmentAndApplicationByAccessRequest', function () {
        it('it should be successful', async function () {
            const result = await keystone.lookupEnvironmentAndApplicationByAccessRequest(context, 'ENV-ID-1')
            expect(result.productEnvironment.name).toBe('ENV-NAME')
        })
    })

    describe('test lookupKongConsumerIdByName', function () {
        it('it should be successful', async function () {
            const result = await keystone.lookupKongConsumerIdByName(context, 'ENV-ID-1')
            expect(result).toBe('CONSUMER-001')
        })
    })

    describe('test lookupCredentialIssuerById', function () {
        it('it should be successful', async function () {
            const result = await keystone.lookupCredentialIssuerById(context, 'ID-1')
            expect(result.name).toBe('ISSUER-001')
        })
    })

    // addKongConsumer
    describe('test addKongConsumer', function () {
        it('it should be successful', async function () {
            const result = await keystone.addKongConsumer(context, 'USERNAME-1', 'CONSUMER-ID')
            expect(result).toBe('CONSUMER-001')
        })
    })

    // linkConsumerToAccessRequest
    describe('test linkCredRefsToAccessRequest', function () {
        it('it should be successful', async function () {
            const result = await keystone.linkCredRefsToAccessRequest(context, 'REQUEST-01', {apiKey:"sss"})
            expect(result.id).toBe('REQUEST-001')
        })
    })
})