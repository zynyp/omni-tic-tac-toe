export enum Tile {
    None,

    Circle,
    Cross,

    Defender
}

export const TileNames: Record<Tile, string> = {
    [Tile.None]: "Nil",

    [Tile.Circle]: "Circle",
    [Tile.Cross]: "Cross",

    [Tile.Defender]: "Defender"
};

export const TileSources: Record<Tile, string> = {
    [Tile.None]: "",

    [Tile.Circle]: "images/tiles/circle.svg",
    [Tile.Cross]: "images/tiles/cross.svg",

    [Tile.Defender]: "images/tiles/defender.svg"
};