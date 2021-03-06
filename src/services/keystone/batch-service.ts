import { Logger } from '../../logger';

const logger = Logger('ks.batch');

export class BatchService {
  private context: any;

  constructor(context: any) {
    this.context = context;
  }

  public async list(
    entity: string,
    query: any,
    refKey: string,
    eid: string,
    fields: string[]
  ) {
    logger.debug('[list] : %s :: %s == %s', query, refKey, eid);
    const result = await this.context.executeGraphQL({
      query: `query($id: String) {
              ${query}(where: { ${refKey} : $id }) {
                id, ${fields.join(',')}
              }
            }`,
      variables: { id: eid },
    });
    logger.debug('[lookup] RESULT %j', result);

    if (result['data'][query].length > 1) {
      throw Error(
        'Expecting zero or one rows ' + query + ' ' + refKey + ' ' + eid
      );
    }
    return result['data'][query].length == 0 ? null : result['data'][query][0];
  }

  public async lookup(
    query: string,
    refKey: string,
    eid: string,
    fields: string[]
  ) {
    logger.debug('[lookup] : %s :: %s == %s', query, refKey, eid);
    const result = await this.context.executeGraphQL({
      query: `query($id: String) {
              ${query}(where: { ${refKey} : $id }) {
                id, ${fields.join(',')}
              }
            }`,
      variables: { id: eid },
    });
    logger.debug('[lookup] RESULT %j', result);

    if (result['data'][query].length > 1) {
      throw Error(
        'Expecting zero or one rows ' + query + ' ' + refKey + ' ' + eid
      );
    }
    return result['data'][query].length == 0 ? null : result['data'][query][0];
  }

  public async create(entity: string, data: any) {
    logger.debug('[create] : (%s) %j', entity, data);
    const result = await this.context.executeGraphQL({
      query: `mutation ($data: ${entity}CreateInput) {
              create${entity}(data: $data) {
                id
              }
            }`,
      variables: { data },
    });
    logger.debug('[create] RESULT %j', result);

    return 'errors' in result ? null : result['data'][`create${entity}`].id;
  }

  public async update(entity: string, id: string, data: any): Promise<string> {
    logger.debug('[update] : %s %s', entity, id);
    const result = await this.context.executeGraphQL({
      query: `mutation ($id: ID!, $data: ${entity}UpdateInput) {
              update${entity}(id: $id, data: $data) {
                id
              }
            }`,
      variables: { id: id, data: data },
    });
    logger.debug('[update] RESULT %j', result);
    return 'errors' in result ? null : result['data'][`update${entity}`].id;
  }

  public async remove(entity: string, id: string): Promise<any> {
    logger.debug('[remove] : %s %s', entity, id);
    const result = await this.context.executeGraphQL({
      query: `mutation ($id: ID!) {
              delete${entity}(id: $id)
            }`,
      variables: { id: id },
    });
    logger.debug('[remove] RESULT %j', result);
    return 'errors' in result ? null : result['data'][`delete${entity}`];
  }
}
