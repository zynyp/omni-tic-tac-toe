import { createMemo, type Accessor, type JSX } from "solid-js";
import { TileSources, Tile as TileType } from "../types";

export const MAX_TILES: Record<TileType, number> = {
    [TileType.None]: Infinity,
    
    [TileType.Circle]: 4,
    [TileType.Cross]: 4,

    [TileType.Defender]: 2
};

export default function Tile(props: TileProps & JSX.HTMLAttributes<HTMLButtonElement>) {
    let button!: HTMLButtonElement;

    const { tile, tileCount, currentTurn, credits, allowPlacing, isHidden = false, onclick } = props;
    const alt = createMemo<string>(() => {
        switch (tile()) {
            case TileType.None: return "No Tile";
    
            case TileType.Circle: return "Circle Tile";
            case TileType.Cross: return "Cross Tile";
    
            case TileType.Defender: return "Defender Tile";
        }
    });

    const placingTile = createMemo(() => 
        tile() === TileType.None
            ? credits() === 1
                ? TileType.Defender
                : currentTurn()
            : tile()
    );

    const canBeFocused = createMemo(() => document.hasFocus());
    
    return (
        isHidden
            ? <div class="aspect-square w-full"></div>
            : (
                <button ref={button} class={`aspect-square grid place-items-center w-full outline-none ${tile() === TileType.None ? "opacity-0" : ""} ${
                    allowPlacing() && tile() === TileType.None && credits() > 0 && tileCount()[placingTile()] < MAX_TILES[placingTile()]
                        ? canBeFocused()
                            ? "focus:opacity-50"
                            : "hover:opacity-50"
                        : ""
                }`} onclick={onclick} onpointerenter={() => button.focus()} onpointerleave={() => button.blur()}>
                    <img class="w-10 md:not-h-md:w-12 lg:not-h-md:w-14 not-md:h-md:w-12 not-md:h-lg:w-14" src={TileSources[placingTile()]} alt={alt()} width={56} draggable="false" />
                </button>
            )
    );
}

export interface TileProps {
    tile: Accessor<TileType>;
    tileCount: Accessor<Record<TileType, number>>;

    currentTurn: Accessor<TileType>;

    credits: Accessor<number>;
    allowPlacing: Accessor<boolean>;

    isHidden?: boolean;
}