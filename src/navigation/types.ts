export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  CreateParcel: undefined;
  TrackParcel: { parcelId: string };
  Profile: undefined;
  Settings: undefined;
}; 