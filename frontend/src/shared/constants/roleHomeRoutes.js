import { ROLES } from "./roles";

export const ROLE_HOME_ROUTE = {
  [ROLES.OWNER]: "/admin",
  [ROLES.ADMIN]: "/admin",
  [ROLES.EMPLOYEE]: "/admin",
  [ROLES.CLIENT]: "/dashboard",
};
