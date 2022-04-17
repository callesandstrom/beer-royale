import { Attack, LeaderboardItem, Player, Round } from '../models';
import { groupBy } from '../utilities';

const weapons = ['Eldboll', 'Kokosnöt', 'Regnbågsvätska', 'Fiskben', 'Rent gift', 'Majskolv', 'Häxvrål', 'Batong', 'Späckhuggare', 'Pulver', 'Ett mapp', 'Örfil', 'Trollstav', 'Mossa', 'Smör', 'Sin röst'];

export const getLeaderboard = (players: Player[]) => {
  const sortedPlayers = [...players].sort((a, b) => b.hp - a.hp || (b.diedAtRound ?? 0) - (a.diedAtRound ?? 0));
  const groups = groupBy(sortedPlayers, x => `${x.hp}-${x.diedAtRound ?? 0}`);

  return Object.keys(groups).reduce<LeaderboardItem[]>((acc, cur) => [...acc, ...groups[cur].map(x => ({ ...x, position: acc.length + 1 }))], []);
}

export const calculateRound = (rounds: Round[], players: Player[]): { rounds: Round[], players: Player[] } => {
  const roundNumber = rounds.length + 1;
  const attacks: Attack[] = [];

  let updatedPlayers = [...players];

  players.filter(x => x.hp > 0).forEach(player => {
    const enemies = updatedPlayers.filter(x => x.hp > 0).filter(x => x.name !== player.name);
    const enemy = enemies[Math.floor(Math.random() * enemies.length)];

    if (!enemy) {
      attacks.push({ playerName: player.name, enemyName: '', newEnemyHp: 0, weapon: '', damage: 0, isCriticalHit: false, isDeathblow: false });
      return;
    }

    const weapon = weapons[Math.floor(Math.random() * weapons.length)];
    const damage = Math.floor(Math.random() * 10) + 1;
    const isCriticalHit = Math.random() * 100 > 95;
    const finalDamage = isCriticalHit ? damage * 3 : damage;
    const newEnemyHp = Math.max(0, enemy.hp - finalDamage);
    const isDeathblow = newEnemyHp === 0;

    updatedPlayers = [
      ...updatedPlayers.filter(x => x.name !== enemy.name),
      { ...enemy, ...{ hp: newEnemyHp, diedAtRound: isDeathblow ? roundNumber : null } }
    ];

    attacks.push({ playerName: player.name, enemyName: enemy.name, newEnemyHp, weapon, damage: finalDamage, isCriticalHit, isDeathblow });
  });

  return {
    rounds: [...rounds, { number: roundNumber, attacks }],
    players: updatedPlayers
  };
}
