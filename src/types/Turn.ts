import type { Tile } from "./Tile";

export interface Turn {
    tile: Tile;
    
    x: number;
    y: number;
}