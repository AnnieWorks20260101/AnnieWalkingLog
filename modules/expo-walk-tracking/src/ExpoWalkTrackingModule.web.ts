import { registerWebModule, NativeModule } from 'expo';

// ExpoWalkTrackingModule is not available on the web platform.
class ExpoWalkTrackingModule extends NativeModule<{}> {}

export default registerWebModule(ExpoWalkTrackingModule, 'ExpoWalkTrackingModule');
