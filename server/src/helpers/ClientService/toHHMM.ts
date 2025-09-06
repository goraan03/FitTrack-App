import { pad2 } from "./pad2";

export function toHHMM(d: Date) { return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }