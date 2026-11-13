/** Exported names/portraits only. Playability describes the current web runtime. */
export interface CharacterEntry {id:string;name:string;portrait:string|null;playable:boolean;}
export const characters:readonly CharacterEntry[]=[
 {
  "id": "fox",
  "name": "Fox",
  "portrait": "characters/fox/portrait.png",
  "playable": true
 },
 {
  "id": "amog",
  "name": "Amog",
  "portrait": "characters/amog/portrait.png",
  "playable": false
 },
 {
  "id": "athena",
  "name": "Athena",
  "portrait": "characters/athena/portrait.png",
  "playable": false
 },
 {
  "id": "bandit",
  "name": "Bandit",
  "portrait": "characters/bandit/portrait.png",
  "playable": false
 },
 {
  "id": "birdo",
  "name": "Birdo",
  "portrait": "characters/birdo/portrait.png",
  "playable": false
 },
 {
  "id": "bush",
  "name": "Bush",
  "portrait": "characters/bush/portrait.png",
  "playable": false
 },
 {
  "id": "calcium",
  "name": "Calcium",
  "portrait": "characters/calcium/portrait.png",
  "playable": false
 },
 {
  "id": "chadwell",
  "name": "Chadwell",
  "portrait": "characters/chadwell/portrait.png",
  "playable": false
 },
 {
  "id": "clank",
  "name": "Clank",
  "portrait": "characters/clank/portrait.png",
  "playable": false
 },
 {
  "id": "dicehead",
  "name": "Dicehead",
  "portrait": "characters/dicehead/portrait.png",
  "playable": false
 },
 {
  "id": "knight",
  "name": "Knight",
  "portrait": "characters/knight/portrait.png",
  "playable": false
 },
 {
  "id": "megachad",
  "name": "Megachad",
  "portrait": "characters/megachad/portrait.png",
  "playable": false
 },
 {
  "id": "monke",
  "name": "Monke",
  "portrait": "characters/monke/portrait.png",
  "playable": false
 },
 {
  "id": "ninja",
  "name": "Ninja",
  "portrait": "characters/ninja/portrait.png",
  "playable": false
 },
 {
  "id": "noelle",
  "name": "Noelle",
  "portrait": "characters/noelle/portrait.png",
  "playable": false
 },
 {
  "id": "ogre",
  "name": "Ogre",
  "portrait": "characters/ogre/portrait.png",
  "playable": false
 },
 {
  "id": "roberto",
  "name": "Roberto",
  "portrait": "characters/roberto/portrait.png",
  "playable": false
 },
 {
  "id": "robinette",
  "name": "Robinette",
  "portrait": "characters/robinette/portrait.png",
  "playable": false
 },
 {
  "id": "spaceman",
  "name": "Spaceman",
  "portrait": "characters/spaceman/portrait.png",
  "playable": false
 },
 {
  "id": "tonymczoom",
  "name": "TonyMcZoom",
  "portrait": null,
  "playable": false
 },
 {
  "id": "vlad",
  "name": "Vlad",
  "portrait": "characters/vlad/portrait.png",
  "playable": false
 }
];
export const canPlayCharacter=(id:string)=>characters.some(character=>character.id===id&&character.playable);
