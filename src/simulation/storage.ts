import {isGame} from './engine.ts';
import type {Game} from './types.ts';
export const SAVE_KEY='republica-save-v1';
export function loadGame():{game:Game|null;warning:string}{try{const raw=localStorage.getItem(SAVE_KEY);if(!raw)return{game:null,warning:''};const g:unknown=JSON.parse(raw);return isGame(g)?{game:g,warning:''}:{game:null,warning:'O save anterior não é compatível. Você pode iniciar um novo mandato.'};}catch{return{game:null,warning:'Não foi possível ler o progresso neste navegador.'};}}
export function saveGame(g:Game){try{localStorage.setItem(SAVE_KEY,JSON.stringify(g));return true;}catch{return false;}}
