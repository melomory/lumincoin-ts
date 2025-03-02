export type RouteType = {
  route: string;
  title?: string;
  filePathPage?: string;
  useLayout?: string;
  load?(): void;
};
