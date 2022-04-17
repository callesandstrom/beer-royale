export interface Environment {
  production: boolean;
  gameType: 'Beer' | 'Wine';
  historyDisabled: boolean;
}

export const environment: Environment = {
  production: false,
  gameType: 'Beer',
  historyDisabled: false,
};
