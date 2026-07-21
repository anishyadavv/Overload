export type HistoryStackParamList = {
  RoutineHistory: undefined;
  RoutineSessions: { routineId: string; routineName: string };
  SessionDetail: { sessionId: string };
};

export type RootTabParamList = {
  Home: undefined;
  History: undefined;
  Plan: undefined;
  Progress: undefined;
};
