import { Dimensions, Platform } from 'react-native';

export function isIphoneX() {
  const dim = Dimensions.get('window');
  const platformTypeExceptIphoneX = Platform.OS === 'ios' ? 25 : 0;
  if ((isIPhoneXSize(dim) || isIPhoneXrSize(dim)) && Platform.OS === 'ios') {
    return 44;
  }
  return platformTypeExceptIphoneX;
}

export function isIPhoneXSize(dim) {
  return dim.height === 812 || dim.width === 812;
}

export function isIPhoneXrSize(dim) {
  return dim.height === 896 || dim.width === 896;
}

export function isThisIPhoneX() {
  let data;
  const dim = Dimensions.get('window');
  if (dim.height > 811) {
    data = true;
  } else {
    data = false;
  }
  return data;
}
