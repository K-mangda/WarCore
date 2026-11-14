// GENERATED FILE - do not edit. Source: tools/build_web_data.py from docs/rea/*.json (see nativeDataMeta).
export type MapFlag='Forest'|'Desert'|'Hell'|'Graveyard';
export interface NativeEnemy {name:string;enemy:string;hp:number;damage:number;speed:number;xp:number;creditCost:number;minStage:number;canSpawnAfterTime:number;maps:MapFlag[];isFlying:boolean;canBeElite:boolean;specialAttacks:number;source:string;}
export interface NativeTimelineEvent {event:'MiniBoss'|'Swarm'|'AddEnemyCard';enemies:string[];timeMinutes:number;duration:number;}
export interface NativeStage {name:string;stageTime:number;checkNewEnemyInterval:number;startEnemies:string[];minibosses:string[];boss:string|null;events:NativeTimelineEvent[];source:string;}
export interface NativeStatModifier {stat:string;op:'Addition'|'Multiplication'|'Flat';value:number;}
export interface NativeTome {tome:string;description:string;stat:string;op:'Addition'|'Multiplication'|'Flat';value:number;source:string;}
export interface NativeWeapon {weapon:string;damage:number;endCooldown:number;burstTime:number;minBurstInterval:number;projectiles:number;upgradePerLevel:NativeStatModifier[];source:string;}
export const nativeDataMeta={
 "generatedBy": "tools/build_web_data.py",
 "generatedOn": "2026-11-14",
 "dumpCsSha256": "4a8ae0ac2aee45c6e956c0fc464e77a83dab22bb896fb960ed3242b18ca4d163",
 "metadataSha256": "17b506a77616b943b414b9a42d35e3acbdaf71eec5dc6c470fc4da338010d550",
 "evidenceDocs": [
  "docs/REA_GAME_DATA_FINDINGS.md",
  "docs/REA_RUNTIME_SYSTEMS.md",
  "docs/REA_PROGRESSION_FINDINGS.md"
 ],
 "tiers": "Values are serialized (V). Formulas combining them are documented per module and may be inferred (I)."
} as const;
export const nativeEnemies:NativeEnemy[]=[
 {
  "name": "SkeletonArmored",
  "enemy": "ArmoredSkeleton",
  "hp": 30,
  "damage": 25,
  "speed": 4.0,
  "xp": 1,
  "creditCost": 1.5,
  "minStage": 0,
  "canSpawnAfterTime": 90.0,
  "maps": [
   "Forest",
   "Graveyard"
  ],
  "isFlying": false,
  "canBeElite": true,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8038"
 },
 {
  "name": "SkeletonArmoredDusty",
  "enemy": "ArmoredSkeletonDusty",
  "hp": 25,
  "damage": 16,
  "speed": 4.5,
  "xp": 1,
  "creditCost": 3.0,
  "minStage": 0,
  "canSpawnAfterTime": 90.0,
  "maps": [
   "Desert"
  ],
  "isFlying": false,
  "canBeElite": true,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8004"
 },
 {
  "name": "Bandit",
  "enemy": "Bandit",
  "hp": 11000,
  "damage": 50,
  "speed": 10.0,
  "xp": 1,
  "creditCost": 40.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [],
  "isFlying": false,
  "canBeElite": false,
  "specialAttacks": 1,
  "source": "sharedassets1.assets#8032"
 },
 {
  "name": "Bee",
  "enemy": "Bee",
  "hp": 10,
  "damage": 15,
  "speed": 6.5,
  "xp": 1,
  "creditCost": 1.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [
   "Forest"
  ],
  "isFlying": true,
  "canBeElite": true,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#7991"
 },
 {
  "name": "BoomerSpider",
  "enemy": "BoomerSpider",
  "hp": 18,
  "damage": 30,
  "speed": 6.0,
  "xp": 1,
  "creditCost": 1.5,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [
   "Forest"
  ],
  "isFlying": false,
  "canBeElite": true,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#7992"
 },
 {
  "name": "Bush",
  "enemy": "Bush",
  "hp": 10000,
  "damage": 45,
  "speed": 8.5,
  "xp": 1,
  "creditCost": 40.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [],
  "isFlying": false,
  "canBeElite": false,
  "specialAttacks": 1,
  "source": "sharedassets1.assets#8033"
 },
 {
  "name": "CactusShooter",
  "enemy": "CactusShooter",
  "hp": 15,
  "damage": 30,
  "speed": 5.0,
  "xp": 1,
  "creditCost": 1.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [
   "Desert"
  ],
  "isFlying": false,
  "canBeElite": true,
  "specialAttacks": 1,
  "source": "sharedassets1.assets#7993"
 },
 {
  "name": "Miniboss_SkeletonKing",
  "enemy": "CalciumDad",
  "hp": 320,
  "damage": 40,
  "speed": 8.0,
  "xp": 1,
  "creditCost": 40.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [
   "Graveyard"
  ],
  "isFlying": false,
  "canBeElite": true,
  "specialAttacks": 3,
  "source": "sharedassets1.assets#8028"
 },
 {
  "name": "EntStage1",
  "enemy": "Ent1",
  "hp": 9000,
  "damage": 40,
  "speed": 7.0,
  "xp": 1,
  "creditCost": 40.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [],
  "isFlying": false,
  "canBeElite": false,
  "specialAttacks": 5,
  "source": "sharedassets1.assets#8008"
 },
 {
  "name": "EntStage2",
  "enemy": "Ent2",
  "hp": 8000,
  "damage": 40,
  "speed": 7.0,
  "xp": 1,
  "creditCost": 40.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [],
  "isFlying": false,
  "canBeElite": false,
  "specialAttacks": 5,
  "source": "sharedassets1.assets#8009"
 },
 {
  "name": "EntStage3",
  "enemy": "Ent3",
  "hp": 10000,
  "damage": 22,
  "speed": 3.0,
  "xp": 1,
  "creditCost": 40.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [],
  "isFlying": false,
  "canBeElite": false,
  "specialAttacks": 5,
  "source": "sharedassets1.assets#8010"
 },
 {
  "name": "FrogBlue",
  "enemy": "FrogBlue",
  "hp": 1000,
  "damage": 1,
  "speed": 9.5,
  "xp": 1,
  "creditCost": 99.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [],
  "isFlying": false,
  "canBeElite": false,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8034"
 },
 {
  "name": "FrogGreen",
  "enemy": "FrogGreen",
  "hp": 1000,
  "damage": 1,
  "speed": 9.0,
  "xp": 1,
  "creditCost": 99.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [],
  "isFlying": false,
  "canBeElite": false,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8035"
 },
 {
  "name": "FrogRed",
  "enemy": "FrogRed",
  "hp": 1000,
  "damage": 1,
  "speed": 10.0,
  "xp": 1,
  "creditCost": 99.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [],
  "isFlying": false,
  "canBeElite": false,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8036"
 },
 {
  "name": "Ghost",
  "enemy": "Ghost",
  "hp": 10,
  "damage": 10,
  "speed": 6.0,
  "xp": 1,
  "creditCost": 1.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [
   "Graveyard"
  ],
  "isFlying": true,
  "canBeElite": true,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8011"
 },
 {
  "name": "GhostGrave1",
  "enemy": "GhostGrave1",
  "hp": 1100,
  "damage": 20,
  "speed": 7.0,
  "xp": 1,
  "creditCost": 1.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [],
  "isFlying": true,
  "canBeElite": false,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8020"
 },
 {
  "name": "GhostGrave2",
  "enemy": "GhostGrave2",
  "hp": 2250,
  "damage": 25,
  "speed": 7.0,
  "xp": 1,
  "creditCost": 1.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [],
  "isFlying": true,
  "canBeElite": false,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8021"
 },
 {
  "name": "GhostGrave3",
  "enemy": "GhostGrave3",
  "hp": 5500,
  "damage": 30,
  "speed": 7.0,
  "xp": 1,
  "creditCost": 1.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [],
  "isFlying": true,
  "canBeElite": false,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8022"
 },
 {
  "name": "GhostGrave4",
  "enemy": "GhostGrave4",
  "hp": 9000,
  "damage": 35,
  "speed": 7.0,
  "xp": 1,
  "creditCost": 1.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [],
  "isFlying": true,
  "canBeElite": false,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8023"
 },
 {
  "name": "GhostInvincible",
  "enemy": "GhostInvincible",
  "hp": 2147483647,
  "damage": 2147483647,
  "speed": 6.5,
  "xp": 1,
  "creditCost": 1.5,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [],
  "isFlying": true,
  "canBeElite": false,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8024"
 },
 {
  "name": "GhostKingData",
  "enemy": "GhostKing",
  "hp": 500000,
  "damage": 40,
  "speed": 10.0,
  "xp": 1,
  "creditCost": 40.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [],
  "isFlying": true,
  "canBeElite": false,
  "specialAttacks": 3,
  "source": "sharedassets1.assets#8025"
 },
 {
  "name": "GhostPurple",
  "enemy": "GhostPurple",
  "hp": 40,
  "damage": 20,
  "speed": 8.0,
  "xp": 1,
  "creditCost": 1.5,
  "minStage": 0,
  "canSpawnAfterTime": 420.0,
  "maps": [
   "Graveyard"
  ],
  "isFlying": true,
  "canBeElite": true,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8013"
 },
 {
  "name": "GhostRed",
  "enemy": "GhostRed",
  "hp": 100,
  "damage": 30,
  "speed": 10.0,
  "xp": 1,
  "creditCost": 1.5,
  "minStage": 0,
  "canSpawnAfterTime": 720.0,
  "maps": [
   "Graveyard"
  ],
  "isFlying": true,
  "canBeElite": true,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8014"
 },
 {
  "name": "Miniboss_Ghostham",
  "enemy": "Ghostham",
  "hp": 320,
  "damage": 45,
  "speed": 6.5,
  "xp": 1,
  "creditCost": 40.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [
   "Graveyard"
  ],
  "isFlying": true,
  "canBeElite": false,
  "specialAttacks": 3,
  "source": "sharedassets1.assets#8027"
 },
 {
  "name": "Ghoul",
  "enemy": "Ghoul",
  "hp": 9,
  "damage": 12,
  "speed": 9.0,
  "xp": 1,
  "creditCost": 1.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [
   "Forest",
   "Graveyard"
  ],
  "isFlying": false,
  "canBeElite": true,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8015"
 },
 {
  "name": "GoblinWeak",
  "enemy": "Goblin",
  "hp": 7,
  "damage": 15,
  "speed": 5.0,
  "xp": 1,
  "creditCost": 1.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [
   "Forest"
  ],
  "isFlying": false,
  "canBeElite": true,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8018"
 },
 {
  "name": "GoblinStrong",
  "enemy": "GoblinStrong",
  "hp": 15,
  "damage": 25,
  "speed": 5.5,
  "xp": 1,
  "creditCost": 1.25,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [
   "Forest"
  ],
  "isFlying": false,
  "canBeElite": true,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8016"
 },
 {
  "name": "GoblinTank",
  "enemy": "GoblinTank",
  "hp": 40,
  "damage": 30,
  "speed": 5.0,
  "xp": 1,
  "creditCost": 2.0,
  "minStage": 0,
  "canSpawnAfterTime": 180.0,
  "maps": [
   "Forest"
  ],
  "isFlying": false,
  "canBeElite": true,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8017"
 },
 {
  "name": "SkeletonGold",
  "enemy": "GoldenSkeleton",
  "hp": 50,
  "damage": 25,
  "speed": 6.0,
  "xp": 1,
  "creditCost": 10.0,
  "minStage": -1,
  "canSpawnAfterTime": 0.0,
  "maps": [],
  "isFlying": false,
  "canBeElite": false,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8039"
 },
 {
  "name": "Golem",
  "enemy": "Golem",
  "hp": 20,
  "damage": 20,
  "speed": 5.0,
  "xp": 1,
  "creditCost": 1.5,
  "minStage": 0,
  "canSpawnAfterTime": 90.0,
  "maps": [
   "Forest"
  ],
  "isFlying": false,
  "canBeElite": true,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8019"
 },
 {
  "name": "GhostGreater",
  "enemy": "GreaterGhost",
  "hp": 20,
  "damage": 13,
  "speed": 7.0,
  "xp": 1,
  "creditCost": 1.5,
  "minStage": 0,
  "canSpawnAfterTime": 180.0,
  "maps": [
   "Graveyard"
  ],
  "isFlying": true,
  "canBeElite": true,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8012"
 },
 {
  "name": "Head",
  "enemy": "Head",
  "hp": 12,
  "damage": 8,
  "speed": 7.0,
  "xp": 1,
  "creditCost": 1.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [
   "Graveyard"
  ],
  "isFlying": true,
  "canBeElite": true,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8026"
 },
 {
  "name": "Miniboss_Golem",
  "enemy": "MinibossGolem",
  "hp": 250,
  "damage": 40,
  "speed": 6.0,
  "xp": 1,
  "creditCost": 40.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [
   "Forest"
  ],
  "isFlying": false,
  "canBeElite": true,
  "specialAttacks": 2,
  "source": "sharedassets1.assets#8030"
 },
 {
  "name": "Miniboss_Desert_Golem",
  "enemy": "MinibossGolemSand",
  "hp": 250,
  "damage": 40,
  "speed": 6.0,
  "xp": 1,
  "creditCost": 40.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [
   "Desert"
  ],
  "isFlying": false,
  "canBeElite": true,
  "specialAttacks": 2,
  "source": "sharedassets1.assets#7994"
 },
 {
  "name": "Miniboss_Pig",
  "enemy": "MinibossPig",
  "hp": 250,
  "damage": 40,
  "speed": 6.0,
  "xp": 1,
  "creditCost": 40.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [
   "Forest"
  ],
  "isFlying": false,
  "canBeElite": true,
  "specialAttacks": 3,
  "source": "sharedassets1.assets#8031"
 },
 {
  "name": "Miniboss_Scorpion",
  "enemy": "MinibossScorpion",
  "hp": 250,
  "damage": 35,
  "speed": 7.0,
  "xp": 1,
  "creditCost": 40.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [
   "Desert"
  ],
  "isFlying": false,
  "canBeElite": true,
  "specialAttacks": 3,
  "source": "sharedassets1.assets#7995"
 },
 {
  "name": "Mummy",
  "enemy": "Mummy",
  "hp": 8,
  "damage": 13,
  "speed": 5.5,
  "xp": 1,
  "creditCost": 1.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [
   "Desert"
  ],
  "isFlying": false,
  "canBeElite": true,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#7996"
 },
 {
  "name": "MummyAncient",
  "enemy": "MummyAncient",
  "hp": 70,
  "damage": 40,
  "speed": 5.0,
  "xp": 1,
  "creditCost": 2.5,
  "minStage": 0,
  "canSpawnAfterTime": 360.0,
  "maps": [
   "Desert"
  ],
  "isFlying": false,
  "canBeElite": true,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#7997"
 },
 {
  "name": "MummyTank",
  "enemy": "MummyTank",
  "hp": 45,
  "damage": 30,
  "speed": 5.0,
  "xp": 1,
  "creditCost": 2.0,
  "minStage": 0,
  "canSpawnAfterTime": 180.0,
  "maps": [
   "Desert"
  ],
  "isFlying": false,
  "canBeElite": true,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#7998"
 },
 {
  "name": "Pharaoh1",
  "enemy": "Pharaoh1",
  "hp": 8000,
  "damage": 40,
  "speed": 7.0,
  "xp": 1,
  "creditCost": 40.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [],
  "isFlying": false,
  "canBeElite": false,
  "specialAttacks": 4,
  "source": "sharedassets1.assets#7999"
 },
 {
  "name": "Pharaoh2",
  "enemy": "Pharaoh2",
  "hp": 8000,
  "damage": 40,
  "speed": 7.0,
  "xp": 1,
  "creditCost": 40.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [],
  "isFlying": false,
  "canBeElite": false,
  "specialAttacks": 4,
  "source": "sharedassets1.assets#8000"
 },
 {
  "name": "Pharaoh3",
  "enemy": "Pharaoh3",
  "hp": 8000,
  "damage": 40,
  "speed": 3.0,
  "xp": 1,
  "creditCost": 40.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [],
  "isFlying": false,
  "canBeElite": false,
  "specialAttacks": 4,
  "source": "sharedassets1.assets#8001"
 },
 {
  "name": "Scorpion",
  "enemy": "Scorpion",
  "hp": 16,
  "damage": 20,
  "speed": 7.0,
  "xp": 1,
  "creditCost": 1.2,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [
   "Desert"
  ],
  "isFlying": false,
  "canBeElite": true,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8002"
 },
 {
  "name": "ScorpionBig",
  "enemy": "ScorpionMedium",
  "hp": 30,
  "damage": 30,
  "speed": 6.5,
  "xp": 1,
  "creditCost": 1.1,
  "minStage": 0,
  "canSpawnAfterTime": 180.0,
  "maps": [
   "Desert"
  ],
  "isFlying": false,
  "canBeElite": true,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8003"
 },
 {
  "name": "Skeleton",
  "enemy": "Skeleton",
  "hp": 20,
  "damage": 20,
  "speed": 5.5,
  "xp": 1,
  "creditCost": 1.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [
   "Forest",
   "Graveyard"
  ],
  "isFlying": false,
  "canBeElite": true,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8037"
 },
 {
  "name": "SkeletonDusty",
  "enemy": "SkeletonDusty",
  "hp": 16,
  "damage": 22,
  "speed": 6.5,
  "xp": 1,
  "creditCost": 2.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [
   "Desert"
  ],
  "isFlying": false,
  "canBeElite": true,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8005"
 },
 {
  "name": "Slime",
  "enemy": "Slime",
  "hp": 6,
  "damage": 8,
  "speed": 6.5,
  "xp": 1,
  "creditCost": 0.75,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [
   "Forest"
  ],
  "isFlying": false,
  "canBeElite": true,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8041"
 },
 {
  "name": "_Test",
  "enemy": "Test",
  "hp": 15,
  "damage": 20,
  "speed": 7.0,
  "xp": 1,
  "creditCost": 4.0,
  "minStage": -1,
  "canSpawnAfterTime": 0.0,
  "maps": [],
  "isFlying": false,
  "canBeElite": true,
  "specialAttacks": 1,
  "source": "sharedassets1.assets#8042"
 },
 {
  "name": "_Test2",
  "enemy": "Test2",
  "hp": 2147483647,
  "damage": 9999,
  "speed": 0.0,
  "xp": 1,
  "creditCost": 4.0,
  "minStage": -1,
  "canSpawnAfterTime": 0.0,
  "maps": [],
  "isFlying": false,
  "canBeElite": true,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8043"
 },
 {
  "name": "Tumblebone",
  "enemy": "Tumblebone",
  "hp": 7,
  "damage": 9,
  "speed": 11.0,
  "xp": 1,
  "creditCost": 1.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.03,
  "maps": [
   "Desert"
  ],
  "isFlying": false,
  "canBeElite": true,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8006"
 },
 {
  "name": "Wisp",
  "enemy": "Wisp",
  "hp": 8,
  "damage": 13,
  "speed": 7.5,
  "xp": 1,
  "creditCost": 1.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [
   "Desert"
  ],
  "isFlying": true,
  "canBeElite": true,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8007"
 },
 {
  "name": "SkeletonXp",
  "enemy": "XpSkeleton",
  "hp": 50,
  "damage": 25,
  "speed": 6.0,
  "xp": 1,
  "creditCost": 10.0,
  "minStage": -1,
  "canSpawnAfterTime": 0.0,
  "maps": [],
  "isFlying": false,
  "canBeElite": false,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8040"
 },
 {
  "name": "Zombie",
  "enemy": "Zombie",
  "hp": 12,
  "damage": 20,
  "speed": 6.5,
  "xp": 1,
  "creditCost": 1.0,
  "minStage": 0,
  "canSpawnAfterTime": 0.0,
  "maps": [
   "Graveyard"
  ],
  "isFlying": false,
  "canBeElite": true,
  "specialAttacks": 0,
  "source": "sharedassets1.assets#8029"
 }
];
export const nativeStages:NativeStage[]=[
 {
  "name": "StageDesert1",
  "stageTime": 600.0,
  "checkNewEnemyInterval": 60.0,
  "startEnemies": [
   "Mummy"
  ],
  "minibosses": [
   "MinibossGolemSand",
   "MinibossScorpion"
  ],
  "boss": "Pharaoh1",
  "events": [
   {
    "event": "MiniBoss",
    "enemies": [
     "MinibossScorpion",
     "MinibossGolemSand"
    ],
    "timeMinutes": 3.0,
    "duration": 30.0
   },
   {
    "event": "Swarm",
    "enemies": [
     "Mummy"
    ],
    "timeMinutes": 4.0,
    "duration": 30.0
   },
   {
    "event": "Swarm",
    "enemies": [
     "Scorpion"
    ],
    "timeMinutes": 7.0,
    "duration": 30.0
   },
   {
    "event": "MiniBoss",
    "enemies": [
     "MinibossGolem",
     "MinibossPig"
    ],
    "timeMinutes": 8.0,
    "duration": 60.0
   }
  ],
  "source": "sharedassets1.assets#8154"
 },
 {
  "name": "StageDesert2",
  "stageTime": 540.0,
  "checkNewEnemyInterval": 60.0,
  "startEnemies": [
   "Mummy"
  ],
  "minibosses": [
   "MinibossGolemSand",
   "MinibossScorpion"
  ],
  "boss": "Pharaoh2",
  "events": [
   {
    "event": "MiniBoss",
    "enemies": [
     "MinibossGolem",
     "MinibossPig"
    ],
    "timeMinutes": 2.0,
    "duration": 30.0
   },
   {
    "event": "Swarm",
    "enemies": [
     "Mummy"
    ],
    "timeMinutes": 3.0,
    "duration": 30.0
   },
   {
    "event": "Swarm",
    "enemies": [
     "Scorpion"
    ],
    "timeMinutes": 6.0,
    "duration": 30.0
   },
   {
    "event": "MiniBoss",
    "enemies": [
     "MinibossGolem",
     "MinibossPig"
    ],
    "timeMinutes": 7.0,
    "duration": 30.0
   }
  ],
  "source": "sharedassets1.assets#8155"
 },
 {
  "name": "StageDesert3",
  "stageTime": 480.0,
  "checkNewEnemyInterval": 60.0,
  "startEnemies": [
   "Mummy"
  ],
  "minibosses": [
   "MinibossGolemSand",
   "MinibossScorpion"
  ],
  "boss": "Pharaoh3",
  "events": [
   {
    "event": "MiniBoss",
    "enemies": [
     "MinibossGolem",
     "MinibossPig"
    ],
    "timeMinutes": 1.5,
    "duration": 30.0
   },
   {
    "event": "Swarm",
    "enemies": [
     "Mummy"
    ],
    "timeMinutes": 2.5,
    "duration": 30.0
   },
   {
    "event": "Swarm",
    "enemies": [
     "Scorpion"
    ],
    "timeMinutes": 4.0,
    "duration": 30.0
   },
   {
    "event": "MiniBoss",
    "enemies": [
     "MinibossGolem",
     "MinibossPig"
    ],
    "timeMinutes": 5.0,
    "duration": 30.0
   }
  ],
  "source": "sharedassets1.assets#8156"
 },
 {
  "name": "StageDungeon",
  "stageTime": 600.0,
  "checkNewEnemyInterval": 60.0,
  "startEnemies": [
   "Slime"
  ],
  "minibosses": [],
  "boss": null,
  "events": [
   {
    "event": "MiniBoss",
    "enemies": [
     "Slime",
     "GreaterGhost"
    ],
    "timeMinutes": 3.0,
    "duration": 30.0
   },
   {
    "event": "Swarm",
    "enemies": [
     "Golem"
    ],
    "timeMinutes": 4.0,
    "duration": 30.0
   },
   {
    "event": "Swarm",
    "enemies": [
     "GoldenSkeleton"
    ],
    "timeMinutes": 7.0,
    "duration": 30.0
   },
   {
    "event": "MiniBoss",
    "enemies": [
     "Slime",
     "GreaterGhost"
    ],
    "timeMinutes": 8.0,
    "duration": 60.0
   }
  ],
  "source": "sharedassets1.assets#8158"
 },
 {
  "name": "StageForest1",
  "stageTime": 600.0,
  "checkNewEnemyInterval": 60.0,
  "startEnemies": [
   "Goblin"
  ],
  "minibosses": [
   "MinibossGolem",
   "MinibossPig"
  ],
  "boss": "EntStage1",
  "events": [
   {
    "event": "MiniBoss",
    "enemies": [
     "MinibossGolem",
     "MinibossPig"
    ],
    "timeMinutes": 3.0,
    "duration": 30.0
   },
   {
    "event": "Swarm",
    "enemies": [
     "Goblin"
    ],
    "timeMinutes": 4.0,
    "duration": 30.0
   },
   {
    "event": "Swarm",
    "enemies": [
     "GoblinStrong"
    ],
    "timeMinutes": 7.0,
    "duration": 30.0
   },
   {
    "event": "MiniBoss",
    "enemies": [
     "MinibossGolem",
     "MinibossPig"
    ],
    "timeMinutes": 8.0,
    "duration": 30.0
   }
  ],
  "source": "sharedassets1.assets#8163"
 },
 {
  "name": "StageForest2",
  "stageTime": 540.0,
  "checkNewEnemyInterval": 60.0,
  "startEnemies": [
   "Goblin"
  ],
  "minibosses": [
   "MinibossGolem",
   "MinibossPig"
  ],
  "boss": "EntStage2",
  "events": [
   {
    "event": "MiniBoss",
    "enemies": [
     "Golem",
     "MinibossPig"
    ],
    "timeMinutes": 2.0,
    "duration": 15.0
   },
   {
    "event": "Swarm",
    "enemies": [
     "Goblin"
    ],
    "timeMinutes": 3.0,
    "duration": 30.0
   },
   {
    "event": "Swarm",
    "enemies": [
     "GoblinStrong"
    ],
    "timeMinutes": 6.0,
    "duration": 30.0
   },
   {
    "event": "MiniBoss",
    "enemies": [
     "MinibossPig",
     "MinibossGolem"
    ],
    "timeMinutes": 7.0,
    "duration": 45.0
   }
  ],
  "source": "sharedassets1.assets#8164"
 },
 {
  "name": "StageForest3",
  "stageTime": 480.0,
  "checkNewEnemyInterval": 60.0,
  "startEnemies": [
   "Goblin"
  ],
  "minibosses": [
   "MinibossGolem",
   "MinibossPig"
  ],
  "boss": "EntStage3",
  "events": [
   {
    "event": "MiniBoss",
    "enemies": [
     "MinibossGolem",
     "MinibossPig"
    ],
    "timeMinutes": 1.5,
    "duration": 30.0
   },
   {
    "event": "Swarm",
    "enemies": [
     "Goblin"
    ],
    "timeMinutes": 2.5,
    "duration": 30.0
   },
   {
    "event": "Swarm",
    "enemies": [
     "GoblinStrong"
    ],
    "timeMinutes": 4.0,
    "duration": 30.0
   },
   {
    "event": "MiniBoss",
    "enemies": [
     "MinibossPig",
     "MinibossGolem"
    ],
    "timeMinutes": 5.0,
    "duration": 45.0
   }
  ],
  "source": "sharedassets1.assets#8165"
 },
 {
  "name": "StageGraveyard",
  "stageTime": 960.0,
  "checkNewEnemyInterval": 60.0,
  "startEnemies": [
   "Ghost"
  ],
  "minibosses": [
   "CalciumDad",
   "Ghostham"
  ],
  "boss": "EntStage1",
  "events": [
   {
    "event": "MiniBoss",
    "enemies": [],
    "timeMinutes": 3.0,
    "duration": 30.0
   },
   {
    "event": "Swarm",
    "enemies": [
     "Ghost"
    ],
    "timeMinutes": 4.0,
    "duration": 30.0
   },
   {
    "event": "MiniBoss",
    "enemies": [],
    "timeMinutes": 7.0,
    "duration": 30.0
   },
   {
    "event": "Swarm",
    "enemies": [
     "GreaterGhost"
    ],
    "timeMinutes": 8.0,
    "duration": 30.0
   },
   {
    "event": "MiniBoss",
    "enemies": [],
    "timeMinutes": 10.0,
    "duration": 30.0
   },
   {
    "event": "Swarm",
    "enemies": [
     "GhostPurple"
    ],
    "timeMinutes": 11.0,
    "duration": 30.0
   },
   {
    "event": "MiniBoss",
    "enemies": [],
    "timeMinutes": 13.0,
    "duration": 30.0
   },
   {
    "event": "Swarm",
    "enemies": [
     "GhostRed"
    ],
    "timeMinutes": 14.0,
    "duration": 30.0
   }
  ],
  "source": "sharedassets1.assets#8168"
 },
 {
  "name": "StageHell1",
  "stageTime": 600.0,
  "checkNewEnemyInterval": 60.0,
  "startEnemies": [
   "Goblin"
  ],
  "minibosses": [],
  "boss": "EntStage1",
  "events": [
   {
    "event": "MiniBoss",
    "enemies": [
     "MinibossGolem",
     "MinibossPig"
    ],
    "timeMinutes": 3.0,
    "duration": 30.0
   },
   {
    "event": "Swarm",
    "enemies": [
     "Goblin"
    ],
    "timeMinutes": 4.0,
    "duration": 30.0
   },
   {
    "event": "Swarm",
    "enemies": [
     "GoblinStrong"
    ],
    "timeMinutes": 7.0,
    "duration": 30.0
   },
   {
    "event": "MiniBoss",
    "enemies": [
     "MinibossGolem",
     "MinibossPig"
    ],
    "timeMinutes": 8.0,
    "duration": 60.0
   }
  ],
  "source": "sharedassets1.assets#8170"
 }
];
export const nativeTomes:NativeTome[]=[
 {
  "tome": "Agility",
  "description": "Increases movement speed",
  "stat": "MoveSpeedMultiplier",
  "op": "Addition",
  "value": 0.15,
  "source": "sharedassets1.assets#8551"
 },
 {
  "tome": "Armor",
  "description": "Decreases incoming damage",
  "stat": "Armor",
  "op": "Flat",
  "value": 0.12,
  "source": "sharedassets1.assets#8552"
 },
 {
  "tome": "Attraction",
  "description": "Increases pickup range",
  "stat": "PickupRange",
  "op": "Addition",
  "value": 0.75,
  "source": "sharedassets1.assets#8553"
 },
 {
  "tome": "Balance",
  "description": "Gain +2% in every stat",
  "stat": "MaxHealth",
  "op": "Addition",
  "value": 0.0,
  "source": "sharedassets1.assets#8554"
 },
 {
  "tome": "Blood",
  "description": "Increases lifesteal",
  "stat": "Lifesteal",
  "op": "Flat",
  "value": 0.1,
  "source": "sharedassets1.assets#8555"
 },
 {
  "tome": "Chaos",
  "description": "Boost a random stat",
  "stat": "MaxHealth",
  "op": "Addition",
  "value": 0.0,
  "source": "sharedassets1.assets#8556"
 },
 {
  "tome": "Cooldown",
  "description": "Increases Attack Speed",
  "stat": "AttackSpeed",
  "op": "Addition",
  "value": 0.075,
  "source": "sharedassets1.assets#8557"
 },
 {
  "tome": "Cursed",
  "description": "Increases Difficulty",
  "stat": "Difficulty",
  "op": "Flat",
  "value": 0.035,
  "source": "sharedassets1.assets#8558"
 },
 {
  "tome": "Damage",
  "description": "Increases damage",
  "stat": "DamageMultiplier",
  "op": "Multiplication",
  "value": 0.08,
  "source": "sharedassets1.assets#8559"
 },
 {
  "tome": "Duration",
  "description": "Increases Attack Duration",
  "stat": "DurationMultiplier",
  "op": "Addition",
  "value": 0.15,
  "source": "sharedassets1.assets#8560"
 },
 {
  "tome": "Evasion",
  "description": "Increases Evasion",
  "stat": "Evasion",
  "op": "Flat",
  "value": 0.1,
  "source": "sharedassets1.assets#8561"
 },
 {
  "tome": "Gambler",
  "description": "Boost a random stat",
  "stat": "MaxHealth",
  "op": "Addition",
  "value": 0.0,
  "source": "sharedassets1.assets#8562"
 },
 {
  "tome": "Golden",
  "description": "Increases Gold received",
  "stat": "GoldIncreaseMultiplier",
  "op": "Addition",
  "value": 0.12,
  "source": "sharedassets1.assets#8563"
 },
 {
  "tome": "Health",
  "description": "Increases Max HP",
  "stat": "MaxHealth",
  "op": "Flat",
  "value": 25.0,
  "source": "sharedassets1.assets#8564"
 },
 {
  "tome": "Hoarder",
  "description": "Get a random item",
  "stat": "MaxHealth",
  "op": "Addition",
  "value": 0.0,
  "source": "sharedassets1.assets#8565"
 },
 {
  "tome": "Knockback",
  "description": "Increases Knockback",
  "stat": "KnockbackMultiplier",
  "op": "Addition",
  "value": 0.2,
  "source": "sharedassets1.assets#8566"
 },
 {
  "tome": "Luck",
  "description": "Increases Luck",
  "stat": "Luck",
  "op": "Flat",
  "value": 0.08,
  "source": "sharedassets1.assets#8567"
 },
 {
  "tome": "Precision",
  "description": "Increases Crit Chance",
  "stat": "CritChance",
  "op": "Flat",
  "value": 0.07,
  "source": "sharedassets1.assets#8568"
 },
 {
  "tome": "ProjectileSpeed",
  "description": "Increases Projectile Speed",
  "stat": "ProjectileSpeedMultiplier",
  "op": "Addition",
  "value": 0.15,
  "source": "sharedassets1.assets#8569"
 },
 {
  "tome": "Quantity",
  "description": "Increases Projectile Quantity",
  "stat": "Projectiles",
  "op": "Flat",
  "value": 1.0,
  "source": "sharedassets1.assets#8570"
 },
 {
  "tome": "Regeneration",
  "description": "Increases Health Regeneration",
  "stat": "HealthRegen",
  "op": "Flat",
  "value": 40.0,
  "source": "sharedassets1.assets#8571"
 },
 {
  "tome": "Shield",
  "description": "Increases Max Shield",
  "stat": "Shield",
  "op": "Flat",
  "value": 25.0,
  "source": "sharedassets1.assets#8572"
 },
 {
  "tome": "Silver",
  "description": "Increases Silver received",
  "stat": "SilverIncreaseMultiplier",
  "op": "Addition",
  "value": 0.12,
  "source": "sharedassets1.assets#8573"
 },
 {
  "tome": "Size",
  "description": "Increases Attack- & Projectiles Size",
  "stat": "SizeMultiplier",
  "op": "Addition",
  "value": 0.1,
  "source": "sharedassets1.assets#8574"
 },
 {
  "tome": "Thorns",
  "description": "Increases Thorns damage",
  "stat": "Thorns",
  "op": "Flat",
  "value": 15.0,
  "source": "sharedassets1.assets#8575"
 },
 {
  "tome": "Xp",
  "description": "Increases XP received",
  "stat": "XpIncreaseMultiplier",
  "op": "Addition",
  "value": 0.07,
  "source": "sharedassets1.assets#8576"
 }
];
export const nativeWeapons:NativeWeapon[]=[
 {
  "weapon": "Aegis",
  "damage": 10.0,
  "endCooldown": 1.5,
  "burstTime": 0.0,
  "minBurstInterval": 0.0,
  "projectiles": 2,
  "upgradePerLevel": [
   {
    "stat": "SizeMultiplier",
    "op": "Addition",
    "value": 0.15
   },
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 2.0
   },
   {
    "stat": "KnockbackMultiplier",
    "op": "Addition",
    "value": 0.25
   },
   {
    "stat": "Projectiles",
    "op": "Flat",
    "value": 1.0
   }
  ],
  "source": "sharedassets1.assets#8606"
 },
 {
  "weapon": "Aura",
  "damage": 6.0,
  "endCooldown": 0.3,
  "burstTime": 0.0,
  "minBurstInterval": 0.0,
  "projectiles": 0,
  "upgradePerLevel": [
   {
    "stat": "SizeMultiplier",
    "op": "Addition",
    "value": 0.14
   },
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 1.4
   }
  ],
  "source": "sharedassets1.assets#8607"
 },
 {
  "weapon": "Axe",
  "damage": 6.0,
  "endCooldown": 1.4,
  "burstTime": 0.0,
  "minBurstInterval": 0.0,
  "projectiles": 2,
  "upgradePerLevel": [
   {
    "stat": "SizeMultiplier",
    "op": "Addition",
    "value": 0.1
   },
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 1.5
   },
   {
    "stat": "Projectiles",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "DurationMultiplier",
    "op": "Addition",
    "value": 0.1
   }
  ],
  "source": "sharedassets1.assets#8608"
 },
 {
  "weapon": "Bananarang",
  "damage": 9.0,
  "endCooldown": 0.8,
  "burstTime": 0.9,
  "minBurstInterval": 0.1,
  "projectiles": 1,
  "upgradePerLevel": [
   {
    "stat": "SizeMultiplier",
    "op": "Addition",
    "value": 0.14
   },
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 2.0
   },
   {
    "stat": "Projectiles",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "ProjectileSpeedMultiplier",
    "op": "Addition",
    "value": 0.1
   }
  ],
  "source": "sharedassets1.assets#8609"
 },
 {
  "weapon": "BlackHole",
  "damage": 4.5,
  "endCooldown": 1.0,
  "burstTime": 1.5,
  "minBurstInterval": 0.5,
  "projectiles": 1,
  "upgradePerLevel": [
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 1.25
   },
   {
    "stat": "Projectiles",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "SizeMultiplier",
    "op": "Addition",
    "value": 0.13
   },
   {
    "stat": "DurationMultiplier",
    "op": "Flat",
    "value": 0.12
   }
  ],
  "source": "sharedassets1.assets#8610"
 },
 {
  "weapon": "BloodMagic",
  "damage": 9.0,
  "endCooldown": 1.5,
  "burstTime": 0.02,
  "minBurstInterval": 0.02,
  "projectiles": 1,
  "upgradePerLevel": [
   {
    "stat": "SizeMultiplier",
    "op": "Addition",
    "value": 0.15
   },
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 1.5
   },
   {
    "stat": "Projectiles",
    "op": "Flat",
    "value": 1.0
   }
  ],
  "source": "sharedassets1.assets#8611"
 },
 {
  "weapon": "BluetoothDagger",
  "damage": 9.0,
  "endCooldown": 0.5,
  "burstTime": 1.1,
  "minBurstInterval": 0.02,
  "projectiles": 1,
  "upgradePerLevel": [
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 2.0
   },
   {
    "stat": "Projectiles",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "ProjectileBounces",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "ProjectileSpeedMultiplier",
    "op": "Addition",
    "value": 0.15
   }
  ],
  "source": "sharedassets1.assets#8635"
 },
 {
  "weapon": "Bone",
  "damage": 11.0,
  "endCooldown": 0.4,
  "burstTime": 1.0,
  "minBurstInterval": 0.1,
  "projectiles": 1,
  "upgradePerLevel": [
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 2.5
   },
   {
    "stat": "Projectiles",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "ProjectileSpeedMultiplier",
    "op": "Flat",
    "value": 0.2
   },
   {
    "stat": "ProjectileBounces",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "CritChance",
    "op": "Flat",
    "value": 0.12
   },
   {
    "stat": "CritDamage",
    "op": "Flat",
    "value": 0.25
   }
  ],
  "source": "sharedassets1.assets#8612"
 },
 {
  "weapon": "Bow",
  "damage": 9.0,
  "endCooldown": 0.92,
  "burstTime": 0.0,
  "minBurstInterval": 0.0,
  "projectiles": 1,
  "upgradePerLevel": [
   {
    "stat": "ProjectileSpeedMultiplier",
    "op": "Addition",
    "value": 0.2
   },
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 1.75
   },
   {
    "stat": "Projectiles",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "SizeMultiplier",
    "op": "Flat",
    "value": 0.15
   },
   {
    "stat": "CritChance",
    "op": "Flat",
    "value": 0.08
   },
   {
    "stat": "CritDamage",
    "op": "Flat",
    "value": 0.18
   }
  ],
  "source": "sharedassets1.assets#8613"
 },
 {
  "weapon": "Chunkers",
  "damage": 12.0,
  "endCooldown": 1.5,
  "burstTime": 0.0,
  "minBurstInterval": 0.0,
  "projectiles": 3,
  "upgradePerLevel": [
   {
    "stat": "SizeMultiplier",
    "op": "Addition",
    "value": 0.2
   },
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 3.0
   },
   {
    "stat": "KnockbackMultiplier",
    "op": "Addition",
    "value": 0.25
   },
   {
    "stat": "Projectiles",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "ProjectileSpeedMultiplier",
    "op": "Flat",
    "value": 0.35
   }
  ],
  "source": "sharedassets1.assets#8614"
 },
 {
  "weapon": "CorruptSword",
  "damage": 12.0,
  "endCooldown": 0.8,
  "burstTime": 0.8,
  "minBurstInterval": 0.14,
  "projectiles": 1,
  "upgradePerLevel": [
   {
    "stat": "SizeMultiplier",
    "op": "Addition",
    "value": 0.15
   },
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 2.0
   },
   {
    "stat": "Projectiles",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "ProjectileSpeedMultiplier",
    "op": "Flat",
    "value": 4.0
   }
  ],
  "source": "sharedassets1.assets#8615"
 },
 {
  "weapon": "Dexecutioner",
  "damage": 9.0,
  "endCooldown": 0.8,
  "burstTime": 0.8,
  "minBurstInterval": 0.04,
  "projectiles": 1,
  "upgradePerLevel": [
   {
    "stat": "SizeMultiplier",
    "op": "Addition",
    "value": 0.2
   },
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 2.0
   },
   {
    "stat": "Projectiles",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "CritChance",
    "op": "Flat",
    "value": 0.05
   }
  ],
  "source": "sharedassets1.assets#8616"
 },
 {
  "weapon": "Dice",
  "damage": 0.0,
  "endCooldown": 0.5,
  "burstTime": 1.0,
  "minBurstInterval": 0.15,
  "projectiles": 1,
  "upgradePerLevel": [
   {
    "stat": "ProjectileSpeedMultiplier",
    "op": "Flat",
    "value": 0.2
   },
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 2.0
   },
   {
    "stat": "Projectiles",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "SizeMultiplier",
    "op": "Addition",
    "value": 0.15
   },
   {
    "stat": "CritChance",
    "op": "Flat",
    "value": 0.1
   },
   {
    "stat": "CritDamage",
    "op": "Flat",
    "value": 0.2
   }
  ],
  "source": "sharedassets1.assets#8617"
 },
 {
  "weapon": "DragonsBreath",
  "damage": 16.0,
  "endCooldown": 2.0,
  "burstTime": 0.0,
  "minBurstInterval": 0.0,
  "projectiles": 0,
  "upgradePerLevel": [
   {
    "stat": "SizeMultiplier",
    "op": "Addition",
    "value": 0.15
   },
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 4.0
   },
   {
    "stat": "DurationMultiplier",
    "op": "Flat",
    "value": 0.2
   }
  ],
  "source": "sharedassets1.assets#8618"
 },
 {
  "weapon": "FireStaff",
  "damage": 10.0,
  "endCooldown": 0.5,
  "burstTime": 1.0,
  "minBurstInterval": 0.15,
  "projectiles": 1,
  "upgradePerLevel": [
   {
    "stat": "ProjectileSpeedMultiplier",
    "op": "Addition",
    "value": 0.2
   },
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 2.5
   },
   {
    "stat": "Projectiles",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "SizeMultiplier",
    "op": "Addition",
    "value": 0.16
   }
  ],
  "source": "sharedassets1.assets#8619"
 },
 {
  "weapon": "Flamewalker",
  "damage": 5.0,
  "endCooldown": 0.0,
  "burstTime": 1.0,
  "minBurstInterval": 0.1,
  "projectiles": 1,
  "upgradePerLevel": [
   {
    "stat": "SizeMultiplier",
    "op": "Addition",
    "value": 0.15
   },
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 2.0
   },
   {
    "stat": "Projectiles",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "DurationMultiplier",
    "op": "Addition",
    "value": 0.12
   }
  ],
  "source": "sharedassets1.assets#8620"
 },
 {
  "weapon": "Frostwalker",
  "damage": 9.0,
  "endCooldown": 1.25,
  "burstTime": 0.0,
  "minBurstInterval": 0.0,
  "projectiles": 0,
  "upgradePerLevel": [
   {
    "stat": "SizeMultiplier",
    "op": "Addition",
    "value": 0.1
   },
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 2.0
   },
   {
    "stat": "DurationMultiplier",
    "op": "Flat",
    "value": 0.12
   }
  ],
  "source": "sharedassets1.assets#8621"
 },
 {
  "weapon": "HeroSword",
  "damage": 11.0,
  "endCooldown": 0.75,
  "burstTime": 0.75,
  "minBurstInterval": 0.15,
  "projectiles": 1,
  "upgradePerLevel": [
   {
    "stat": "SizeMultiplier",
    "op": "Addition",
    "value": 0.15
   },
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 2.0
   },
   {
    "stat": "Projectiles",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "ProjectileSpeedMultiplier",
    "op": "Flat",
    "value": 4.0
   }
  ],
  "source": "sharedassets1.assets#8622"
 },
 {
  "weapon": "Katana",
  "damage": 11.0,
  "endCooldown": 0.4,
  "burstTime": 0.5,
  "minBurstInterval": 0.02,
  "projectiles": 1,
  "upgradePerLevel": [
   {
    "stat": "SizeMultiplier",
    "op": "Addition",
    "value": 0.2
   },
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 2.2
   },
   {
    "stat": "Projectiles",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "CritChance",
    "op": "Flat",
    "value": 0.08
   },
   {
    "stat": "CritDamage",
    "op": "Flat",
    "value": 0.2
   }
  ],
  "source": "sharedassets1.assets#8623"
 },
 {
  "weapon": "LightningStaff",
  "damage": 7.0,
  "endCooldown": 1.1,
  "burstTime": 0.3,
  "minBurstInterval": 0.04,
  "projectiles": 1,
  "upgradePerLevel": [
   {
    "stat": "SizeMultiplier",
    "op": "Addition",
    "value": 0.2
   },
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 2.0
   },
   {
    "stat": "Projectiles",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "ProjectileBounces",
    "op": "Flat",
    "value": 1.0
   }
  ],
  "source": "sharedassets1.assets#8624"
 },
 {
  "weapon": "Mine",
  "damage": 10.0,
  "endCooldown": 1.0,
  "burstTime": 1.0,
  "minBurstInterval": 0.25,
  "projectiles": 1,
  "upgradePerLevel": [
   {
    "stat": "SizeMultiplier",
    "op": "Addition",
    "value": 0.15
   },
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 3.0
   },
   {
    "stat": "Projectiles",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "DurationMultiplier",
    "op": "Flat",
    "value": 0.4
   }
  ],
  "source": "sharedassets1.assets#8625"
 },
 {
  "weapon": "PoisonFlask",
  "damage": 1.0,
  "endCooldown": 0.8,
  "burstTime": 1.0,
  "minBurstInterval": 0.2,
  "projectiles": 1,
  "upgradePerLevel": [
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 0.5
   },
   {
    "stat": "Projectiles",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "SizeMultiplier",
    "op": "Addition",
    "value": 0.15
   },
   {
    "stat": "DurationMultiplier",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "ProjectileSpeedMultiplier",
    "op": "Flat",
    "value": 2.0
   }
  ],
  "source": "sharedassets1.assets#8626"
 },
 {
  "weapon": "Revolver",
  "damage": 5.0,
  "endCooldown": 1.4,
  "burstTime": 1.1,
  "minBurstInterval": 0.02,
  "projectiles": 6,
  "upgradePerLevel": [
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 2.5
   },
   {
    "stat": "Projectiles",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "CritChance",
    "op": "Flat",
    "value": 0.1
   },
   {
    "stat": "CritDamage",
    "op": "Flat",
    "value": 0.2
   },
   {
    "stat": "ProjectileBounces",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "ProjectileSpeedMultiplier",
    "op": "Addition",
    "value": 0.2
   }
  ],
  "source": "sharedassets1.assets#8627"
 },
 {
  "weapon": "Rockets",
  "damage": 11.0,
  "endCooldown": 0.3,
  "burstTime": 1.0,
  "minBurstInterval": 0.1,
  "projectiles": 1,
  "upgradePerLevel": [
   {
    "stat": "ProjectileSpeedMultiplier",
    "op": "Addition",
    "value": 0.2
   },
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 2.0
   },
   {
    "stat": "Projectiles",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "CritChance",
    "op": "Flat",
    "value": 0.08
   }
  ],
  "source": "sharedassets1.assets#8630"
 },
 {
  "weapon": "Scythe",
  "damage": 11.0,
  "endCooldown": 0.85,
  "burstTime": 1.5,
  "minBurstInterval": 0.1,
  "projectiles": 1,
  "upgradePerLevel": [
   {
    "stat": "SizeMultiplier",
    "op": "Addition",
    "value": 0.12
   },
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 1.5
   },
   {
    "stat": "Projectiles",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "KnockbackMultiplier",
    "op": "Addition",
    "value": 0.15
   }
  ],
  "source": "sharedassets1.assets#8628"
 },
 {
  "weapon": "Shotgun",
  "damage": 9.0,
  "endCooldown": 1.0,
  "burstTime": 1.0,
  "minBurstInterval": 0.25,
  "projectiles": 1,
  "upgradePerLevel": [
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 3.0
   },
   {
    "stat": "Projectiles",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "SizeMultiplier",
    "op": "Addition",
    "value": 0.15
   },
   {
    "stat": "CritChance",
    "op": "Flat",
    "value": 0.1
   },
   {
    "stat": "CritDamage",
    "op": "Flat",
    "value": 0.2
   }
  ],
  "source": "sharedassets1.assets#8629"
 },
 {
  "weapon": "Sniper",
  "damage": 22.0,
  "endCooldown": 1.0,
  "burstTime": 1.0,
  "minBurstInterval": 0.3,
  "projectiles": 1,
  "upgradePerLevel": [
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 4.0
   },
   {
    "stat": "Projectiles",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "SizeMultiplier",
    "op": "Addition",
    "value": 0.13
   }
  ],
  "source": "sharedassets1.assets#8631"
 },
 {
  "weapon": "SpaceNoodle",
  "damage": 10.0,
  "endCooldown": 1.0,
  "burstTime": 0.0,
  "minBurstInterval": 0.0,
  "projectiles": 0,
  "upgradePerLevel": [
   {
    "stat": "SizeMultiplier",
    "op": "Addition",
    "value": 0.2
   },
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 2.0
   },
   {
    "stat": "DurationMultiplier",
    "op": "Flat",
    "value": 0.2
   }
  ],
  "source": "sharedassets1.assets#8632"
 },
 {
  "weapon": "Sword",
  "damage": 11.0,
  "endCooldown": 0.75,
  "burstTime": 0.5,
  "minBurstInterval": 0.1,
  "projectiles": 1,
  "upgradePerLevel": [
   {
    "stat": "SizeMultiplier",
    "op": "Addition",
    "value": 0.2
   },
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 2.0
   },
   {
    "stat": "Projectiles",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "KnockbackMultiplier",
    "op": "Addition",
    "value": 0.25
   }
  ],
  "source": "sharedassets1.assets#8633"
 },
 {
  "weapon": "Tornado",
  "damage": 8.0,
  "endCooldown": 0.8,
  "burstTime": 1.0,
  "minBurstInterval": 0.1,
  "projectiles": 1,
  "upgradePerLevel": [
   {
    "stat": "ProjectileSpeedMultiplier",
    "op": "Addition",
    "value": 0.2
   },
   {
    "stat": "DamageMultiplier",
    "op": "Flat",
    "value": 2.0
   },
   {
    "stat": "Projectiles",
    "op": "Flat",
    "value": 1.0
   },
   {
    "stat": "KnockbackMultiplier",
    "op": "Addition",
    "value": 0.2
   },
   {
    "stat": "SizeMultiplier",
    "op": "Addition",
    "value": 0.14
   }
  ],
  "source": "sharedassets1.assets#8634"
 }
];
