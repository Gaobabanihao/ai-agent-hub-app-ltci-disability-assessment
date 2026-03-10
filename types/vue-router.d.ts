import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
    icon?: string;
    requiresAuth?: boolean;
    permissions?: string[];
    roles?: string[];
    keepAlive?: boolean;
    hidden?: boolean;
    order?: number;
  }
}
