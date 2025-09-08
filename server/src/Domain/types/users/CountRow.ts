import { RowDataPacket } from "mysql2";

export type CountRow = RowDataPacket & { count: number };