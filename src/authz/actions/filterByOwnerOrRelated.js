/*
This one is for Applications that an API Owner can see.

They should be able to see their own applications, and the
Applications that have made a Request for Access to a PackageEnvironment
that they are associated with by namespace.
*/
const { filterByOwner } = require('./filterByUser')

const actionFilterByOwnerOrRelated = (context, value) => {
    const namespace = context['user']['namespace']
    return { OR: [ filterByOwner(context, value) ] }
}

module.exports = actionFilterByOwnerOrRelated