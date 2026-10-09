export const metricKeys = ['gdp','debt','inflation','employment','education','health','environment','approval','inequality','capacity'] as const;
export type Metric = typeof metricKeys[number];
export type Metrics = Record<Metric,number>;
export type Effect = Partial<Metrics>;
export interface Option {title:string; description:string; now:Effect; later:Effect; delay:number; mechanism:string; tag?:string}
export interface Decision {id:string; area:string; title:string; brief:string; options:Option[]}
export interface Profile {name:string; country:string; orientation:string}
export interface Pending {due:number; effect:Effect; source:string; mechanism:string}
export interface Entry {turn:number; title:string; text:string; kind:'decision'|'effect'|'event'; delta:Effect}
export interface Game {version:1; profile:Profile; turn:number; term:number; metrics:Metrics; initial:Metrics; pending:Pending[]; history:Entry[]; snapshots:Metrics[]; phase:'playing'|'election'|'finished'; vote:number|null; reelected:boolean; seed:number}
