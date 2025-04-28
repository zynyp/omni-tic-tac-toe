import { For, type Signal } from "solid-js";
import { Howl } from "howler";

import { Tile as TileType } from "../types";

import Tile from "./Tile";

const placeHowler = new Howl({
    src: "sounds/place.mp3",
    volume: 0.8
});

placeHowler.load();

export default function Grid(props: GridProps) {
    const { tiles, onPlace = () => {} } = props;

    return (
        <div class="p-4 w-full h-full justify-items-center content-center">
            <div class="relative w-full h-full max-w-100 max-h-100">
                <img class="absolute top-0 left-0 pointer-events-none" src="images/grid.svg" alt="Tile Grid" width={400} draggable="false" role="presentation" aria-hidden="true" />
                <table class="flex flex-col justify-center">
                        <For each={Array(5)}>
                            {(_, y) => (
                                <tr class="flex flex-row">
                                    <For each={Array(5)}>
                                        {(_, x) => <Tile tile={tiles[y()][x()][0]} isHidden={(x() === 0 || x() === 4) && (y() === 0 || y() === 4)} onclick={() => onPlace(x(), y())} />}
                                    </For>
                                </tr>
                            )}
                        </For>                
                </table>
            </div>
        </div>
    );
}

export interface GridProps {
    tiles: Signal<TileType>[][];
    onPlace?: (x: number, y: number) => any;
}