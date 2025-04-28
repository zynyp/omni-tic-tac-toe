import { createMemo, type Accessor, type JSX } from "solid-js"
import { TileSources, Tile as TileType } from "../types";

export default function Tile(props: TileProps & JSX.HTMLAttributes<HTMLButtonElement>) {
    const { tile, isHidden = false, onclick } = props;
    
    const alt = createMemo<string>(() => {
        switch (tile()) {
            case TileType.None: return "No Tile";
    
            case TileType.Circle: return "Circle Tile";
            case TileType.Cross: return "Cross Tile";
    
            case TileType.Defender: return "Defender Tile";
        }
    });
    
    return (
        isHidden
            ? <div class="aspect-square w-full"></div>
            : (
                <button class="aspect-square justify-items-center content-center w-full" onclick={onclick}>
                    {tile() === TileType.None ? <div class="aspect-square w-full"></div> : <img class="aspect-square" src={TileSources[tile()]} alt={alt()} width={56} draggable="false" />}
                </button>
            )
    );
}

export interface TileProps {
    tile: Accessor<TileType>;
    isHidden?: boolean;
}

