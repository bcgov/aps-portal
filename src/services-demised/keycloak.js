
const fetch = require('node-fetch')

const checkStatus = require('./checkStatus')

const clientTemplate = require('./keycloak/client-template.json')

module.exports = {
    getKeycloakSession: async function (issuer, clientId, clientSecret) {
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);
    
        const response = await fetch(`${issuer}/protocol/openid-connect/token`, {
            method: 'post',
            body:    params,
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        })
        .then(checkStatus)
        .then(res => res.json())
        console.log(JSON.stringify(response, null, 3));
        return response['access_token']
    },

    tokenExchange: async function (issuer, clientId, clientSecret, subjectToken) {
        const params = new URLSearchParams();
        params.append('grant_type', 'urn:ietf:params:oauth:grant-type:token-exchange');
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);
        params.append('subject_token', subjectToken);
    
        const response = await fetch(`${issuer}/protocol/openid-connect/token`, {
            method: 'post',
            body:    params,
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        })
        .then(checkStatus)
        .then(res => res.json())
        console.log(JSON.stringify(response, null, 3));
        return response['access_token']
    },  

    getRequestingPartyToken: async function (issuer, clientId, clientSecret, subjectToken, resourceId) {
        const basicAuth = Buffer.from(clientId + ":" + clientSecret, 'utf-8').toString('base64')
        const params = new URLSearchParams();
        params.append('grant_type', 'urn:ietf:params:oauth:grant-type:uma-ticket');
        params.append('client_id', clientId);
        // params.append('client_secret', clientSecret);
        params.append('subject_token', subjectToken);
        params.append('audience', clientId);
        params.append('permission', resourceId);
    
        const response = await fetch(`${issuer}/protocol/openid-connect/token`, {
            method: 'post',
            body:    params,
            headers: { 
                'Authorization': `Basic ${basicAuth}`,
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        })
        .then(checkStatus)
        .then(res => res.json())
        console.log(JSON.stringify(response, null, 3));
        return response['access_token']
    },  

    clientRegistration: async function (issuer, accessToken, clientId, clientSecret, enabled=false) {
        const body = Object.assign(JSON.parse(JSON.stringify(clientTemplate)), {
            enabled: enabled,
            clientId: clientId,
            secret: clientSecret
        })
        const headers = { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin': '',
        }
        accessToken != null && (headers['Authorization'] = 'bearer ' + accessToken)

        console.log(JSON.stringify(body, null, 4))

        console.log("CALLING "+`${issuer}/clients-registrations/default`);
        const response = await fetch(`${issuer}/clients-registrations/default`, {
            method: 'post',
            body:    JSON.stringify(body),
            headers: headers
        })
        .then(checkStatus)
        .then(res => res.json())
        console.log(JSON.stringify(response, null, 3));
        return {
            id: response['id'],
            clientId: response['clientId'],
            clientSecret: clientSecret,
            registrationAccessToken: response['registrationAccessToken']
        }
    },

    updateClientRegistration: async function (issuer, accessToken, clientId, vars) {
        const headers = { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin': '',
        }
        accessToken != null && (headers['Authorization'] = 'bearer ' + accessToken)

        console.log("UPDATING " + `${issuer}/clients-registrations/default/${clientId}`)

        console.log(JSON.stringify(vars, null, 4))

        vars['clientId'] = clientId
        
        const response = await fetch(`${issuer}/clients-registrations/default/${clientId}`, {
            method: 'put',
            body:    JSON.stringify(vars),
            headers: headers
        })
        .then(checkStatus)
        .then(res => res.json())
        console.log(JSON.stringify(response, null, 3));
        return {
            id: response['id'],
            clientId: response['clientId'],
            enabled: response['enabled'],
        }
    },

    deleteClientRegistration: async function (issuer, accessToken, clientId) {
        const headers = { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin': '',
        }
        accessToken != null && (headers['Authorization'] = 'bearer ' + accessToken)

        await fetch(`${issuer}/clients-registrations/default/${clientId}`, {
            method: 'delete',
            headers: headers
        })
        .then(checkStatus)
    },    
    
    getOpenidFromDiscovery: async function (url) {
        return fetch(url, {
            method: 'get',
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(checkStatus)
        .then(res => res.json())
        .catch (() => {
            return null
        })
    }
}
