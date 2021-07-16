import { Keystone } from '@keystonejs/keystone';
import { injectable } from 'tsyringe';
import { scopes, scopesToRoles } from '../../auth/scope-role-utils';

const resolveUsername = function (user: any) {
  for (const nm of ['preferred_username', 'clientId']) {
    if (nm in user) {
      return user[nm];
    }
  }
  return null;
};
@injectable()
export class KeystoneService {
  private keystone: any;
  constructor(private _keystone: any) {
    this.keystone = _keystone;
  }

  public context(): Keystone {
    return this.keystone;
  }

  public sudo(): any {
    return this.keystone.createContext({ skipAccessControl: true });
  }

  public createContext(request: any): any {
    const _scopes = scopes(request.user.scope);
    const identity = {
      id: null,
      username: resolveUsername(request.user),
      namespace: request.params.ns,
      roles: scopesToRoles(_scopes),
      scopes: _scopes,
      userId: null,
    } as any;
    const ctx = this.keystone.createContext({
      skipAccessControl: true,
      authentication: { item: identity },
    });
    ctx.req = request;
    return ctx;
  }

  public executeGraphQL({ context, query, variables }: any) {
    return this.keystone.executeGraphQL({ context, query, variables });
  }
}
