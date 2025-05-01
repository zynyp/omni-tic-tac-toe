import { createMemo, type Accessor, type JSX } from "solid-js";
import { TileNames, TileSources, Tile as TileType } from "../types";

export const MAX_TILES: Record<TileType, number> = {
    [TileType.None]: Infinity,
    
    [TileType.Circle]: 4,
    [TileType.Cross]: 4,

    [TileType.Defender]: 2
};

export default function Tile(props: TileProps & JSX.HTMLAttributes<HTMLButtonElement>) {
    let button!: HTMLButtonElement;

    const { tile, tileCount, selectedTile, currentTurn, credits, allowPlacing, isSelected, isHidden = false, onclick } = props;

    const placingTile = createMemo(() => 
        tile() === TileType.None
            ? selectedTile() !== null
                ? selectedTile()! : 
            credits() === 1
                ? TileType.Defender
                : currentTurn()
            : tile()
    );

    const canBeFocused = createMemo(() => document.hasFocus());
    
    return (
        isHidden
            ? <div class="aspect-square w-full"></div>
            : (
                <button ref={button} class={`aspect-square grid relative place-items-center w-full outline-none ${tile() === TileType.None ? "opacity-0" : ""} ${tile() === TileType.None && credits() > 0 && (selectedTile() !== null || (allowPlacing() && tileCount()[placingTile()] < MAX_TILES[placingTile()])) ? canBeFocused() ? "focus:opacity-50" : "hover:opacity-50" : ""}`} tabindex={-1 + +allowPlacing()} onclick={onclick} onpointerenter={() => button.focus()} onpointerleave={() => button.blur()}>
                    <img class="w-10 md:not-h-md:w-12 lg:not-h-md:w-14 not-md:h-md:w-12 not-md:h-lg:w-14" src={TileSources[placingTile()]} alt={`${isSelected() ? "Selected" : ""} ${TileNames[tile()]} Tile`} width={56} draggable={false} />
                    {isSelected() && <img class="absolute top-1/2 left-1/2 w-5 md:not-h-md:w-7 lg:not-h-md:w-9 not-md:h-md:w-7 not-md:h-lg:w-9 -translate-1/2" src="images/selected-shadow.svg" alt={`${TileNames[tile()]} Tile Selected`} width={36} draggable={false} />} 
                </button>
            )
    );
}

export interface TileProps {
    tile: Accessor<TileType>;
    tileCount: Accessor<Record<TileType, number>>;
    selectedTile: Accessor<TileType | null>;

    currentTurn: Accessor<TileType>;

    credits: Accessor<number>;
    allowPlacing: Accessor<boolean>;

    isSelected: Accessor<boolean>;
    isHidden: boolean;
}