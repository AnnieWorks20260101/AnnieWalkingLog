export type WalkCoordinate = {
  latitude: number;
  longitude: number;
};

export type WalkCustomMark = WalkCoordinate & {
  icon: string;
  buttonId: string;
};

export type WalkSessionSnapshot = {
  route: WalkCoordinate[];
  poops: WalkCoordinate[];
  customMarks: WalkCustomMark[];
  isTracking: boolean;
  startTimeMs?: number;
};

export type WalkTrackingStartOptions = {
  title: string;
  body: string;
  poopLabel: string;
  customLabel: string;
  customButtonId: string;
  customIcon: string;
  distanceIntervalMeters?: number;
};

export type ExpoWalkTrackingModuleEvents = Record<string, never>;
