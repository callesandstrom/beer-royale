export interface Environment {
  production: boolean;
  gameType: 'Beer' | 'Wine';
}

export const environment: Environment = {
  production: false,
  gameType: 'Beer'
};
