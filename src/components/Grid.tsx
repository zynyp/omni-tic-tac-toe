import { For, type Accessor } from "solid-js";
import { Howl } from "howler";

import { Tile as TileType } from "../types";

import Tile from "./Tile";

export const GRID_WIDTH: number = 5;
export const GRID_HEIGHT: number = 5;

const placeHowler = new Howl({
    src: "sounds/place.mp3",
    volume: 0.8
});

placeHowler.load();

export default function Grid(props: GridProps) {
    const { tiles, tileCount, currentTurn, credits, allowPlacing, onPlace = () => {} } = props;

    return (
        <div class="grid place-items-center p-4 w-full h-full">
            <div class="relative w-full not-h-md:max-w-60 not-h-md:md:max-w-80 not-h-md:lg:max-w-100 h-full not-md:max-h-60 not-md:h-md:max-h-80 not-md:h-lg:max-h-100">
                <table class="flex flex-col justify-center">
                        <For each={Array(GRID_HEIGHT)}>
                            {(_, y) => (
                                <tr class="flex flex-row">
                                    <For each={Array(GRID_WIDTH)}>
                                        {(_, x) => <Tile tile={() => tiles()[y()][x()]} tileCount={tileCount} currentTurn={currentTurn} credits={credits} allowPlacing={allowPlacing} isHidden={(x() === 0 || x() === GRID_WIDTH - 1) && (y() === 0 || y() === GRID_HEIGHT - 1)} onclick={() => onPlace(x(), y())} />}
                                    </For>
                                </tr>
                            )}
                        </For>
                </table>
                <img class="absolute top-0 left-0 -z-10 pointer-events-none" src="images/grid.svg" alt="Tile Grid" width={400} draggable="false" role="presentation" aria-hidden="true" />
            </div>
        </div>
    );
}

export interface GridProps {
    tiles: Accessor<TileType[][]>;
    tileCount: Accessor<Record<TileType, number>>;

    currentTurn: Accessor<TileType>;

    allowPlacing: Accessor<boolean>;
    credits: Accessor<number>;

    onPlace?: (x: number, y: number) => any;
}