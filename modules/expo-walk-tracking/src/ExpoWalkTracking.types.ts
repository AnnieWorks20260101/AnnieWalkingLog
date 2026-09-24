export type WalkCoordinate = {
  latitude: number;
  longitude: number;
};

export type WalkPoopMark = WalkCoordinate & {
  petId?: string;
};

export type WalkCustomMark = WalkCoordinate & {
  icon: string;
  buttonId: string;
  petId?: string;
};

export type WalkSessionSnapshot = {
  route: WalkCoordinate[];
  poops: WalkPoopMark[];
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
  /** Hex color for notification / Live Activity text, e.g. #FFFFFF */
  textColorHex?: string;
  /** Pet id attached to marks recorded from notification / Live Activity */
  activePetId?: string;
  /** JSON array of `{ id, name }` for B2 active-pet display / cycling */
  walkPetsJson?: string;
  /** Localized prefix for active pet label, e.g. "いま: " */
  activePetLabelPrefix?: string;
  distanceIntervalMeters?: number;
};

export type ExpoWalkTrackingModuleEvents = Record<string, never>;
