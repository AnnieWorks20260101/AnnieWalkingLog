import { NativeModule, requireNativeModule } from 'expo';
import type {
  ExpoWalkTrackingModuleEvents,
  WalkSessionSnapshot,
  WalkTrackingStartOptions,
} from './ExpoWalkTracking.types';

declare class ExpoWalkTrackingModule extends NativeModule<ExpoWalkTrackingModuleEvents> {
  startWalkTracking(options: WalkTrackingStartOptions): Promise<void>;
  stopWalkTracking(): Promise<WalkSessionSnapshot>;
  getWalkSessionSnapshot(): Promise<WalkSessionSnapshot>;
  appendPoopMark(): Promise<WalkCoordinateResult>;
  appendCustomMark(): Promise<WalkCoordinateResult>;
  setLastKnownCoordinate(latitude: number, longitude: number): void;
  isWalkTrackingActive(): boolean;
}

type WalkCoordinateResult = {
  latitude: number;
  longitude: number;
};

export default requireNativeModule<ExpoWalkTrackingModule>('ExpoWalkTracking');
