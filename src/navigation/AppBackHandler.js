import { useContext, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { NavigationRefContext } from './NavigationRefContext';
import { handleAppBackPress } from './appBackNavigation';

/** Android ハードウェア戻るボタン */
export default function AppBackHandler() {
  const navigationRef = useContext(NavigationRefContext);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!navigationRef) {
        return false;
      }
      return handleAppBackPress(navigationRef);
    });

    return () => subscription.remove();
  }, [navigationRef]);

  return null;
}
