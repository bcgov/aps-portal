import { EvalAccessControl } from './common';
import { mergeWhereClause } from '@keystonejs/utils';
import { AliasConfig } from './types';
import { Logger } from '../../../logger';
import { EnforcementPoint } from '../../../authz/enforcement';

const logger = Logger('ext.itemQuery');

export const ItemQuery = (keystone: any, alias: AliasConfig) => {
  return {
    queries: [
      {
        schema: `${alias.gqlName}(where: ${alias.list}WhereInput): ${alias.list}`,
        resolver: async (
          item: any,
          args: any,
          context: any,
          info: any,
          other: any
        ) => {
          const a = keystone.getListByKey(alias.list);
          const gqlName = a.gqlNames.itemQueryName;
          const vars = mergeWhereClause(args, other.access);
          const noauthContext = keystone.createContext({
            skipAccessControl: true,
          });
          logger.debug(
            'item query %s %j %j %j %s',
            alias.list,
            args,
            other,
            vars,
            gqlName
          );
          return await a.itemQuery(vars, noauthContext, gqlName, info);
        },
        access: EnforcementPoint,
      },
    ],
  };
};
