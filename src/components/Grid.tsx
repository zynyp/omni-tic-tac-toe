import { createMemo, For, type Accessor } from "solid-js";
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
    const { tiles, tileCount, selectedTile, currentTurn, credits, allowPlacing, onPlace = () => {} } = props;

    function isSelected(x: number, y: number) {
        const isNotSelected = selectedTile() === null;
        if (isNotSelected) return false;
        
        const [selectedX, selectedY] = selectedTile()!;
        return selectedX === x && selectedY === y;
    }

    const selectedTileType = createMemo(() => {
        if (selectedTile() === null) return null;
        const [selectedX, selectedY] = selectedTile()!;

        return tiles()[selectedY][selectedX];
    });

    return (
        <div class="grid place-items-center p-4 w-full h-full">
            <div class="relative w-full not-h-md:max-w-60 not-h-md:md:max-w-80 not-h-md:lg:max-w-100 h-full not-md:max-h-60 not-md:h-md:max-h-80 not-md:h-lg:max-h-100">
                <table class="flex flex-col justify-center">
                        <For each={Array(GRID_HEIGHT)}>
                            {(_, y) => (
                                <tr class="flex flex-row">
                                    <For each={Array(GRID_WIDTH)}>
                                        {(_, x) => <Tile tile={() => tiles()[y()][x()]} tileCount={tileCount} selectedTile={selectedTileType} currentTurn={currentTurn} credits={credits} allowPlacing={() => allowPlacing() && selectedTile() === null} isSelected={() => isSelected(x(), y())} isHidden={(x() === 0 || x() === GRID_WIDTH - 1) && (y() === 0 || y() === GRID_HEIGHT - 1)} onclick={() => onPlace(x(), y())} />}
                                    </For>
                                </tr>
                            )}
                        </For>
                </table>
                <img class="absolute top-0 left-0 -z-10 pointer-events-none" src="images/grid.svg" alt="Tile Grid" width={400} draggable={false} role="presentation" aria-hidden="true" />
            </div>
        </div>
    );
}

export interface GridProps {
    tiles: Accessor<TileType[][]>;
    tileCount: Accessor<Record<TileType, number>>;
    selectedTile: Accessor<[number, number] | null>;

    currentTurn: Accessor<TileType>;

    allowPlacing: Accessor<boolean>;
    credits: Accessor<number>;

    onPlace?: (x: number, y: number) => any;
}

export const GRID_MATCHES: [[number, number], [number, number], [number, number]][] = [
    [[1, 0], [2, 0], [3, 0]],
    [[1, 1], [2, 1], [3, 1]],
    [[1, 2], [2, 2], [3, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    [[3, 0], [3, 1], [3, 2]],
    [[1, 0], [2, 1], [3, 2]],
    [[3, 0], [2, 1], [1, 2]],

    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    [[0, 3], [1, 3], [2, 3]],
    [[0, 1], [0, 2], [0, 3]],
    [[1, 1], [1, 2], [1, 3]],
    [[2, 1], [2, 2], [2, 3]],
    [[0, 1], [1, 2], [2, 3]],
    [[2, 1], [1, 2], [0, 3]],

    [[1, 1], [2, 1], [3, 1]],
    [[1, 2], [2, 2], [3, 2]],
    [[1, 3], [2, 3], [3, 3]],
    [[1, 1], [1, 2], [1, 3]],
    [[2, 1], [2, 2], [2, 3]],
    [[3, 1], [3, 2], [3, 3]],
    [[1, 1], [2, 2], [3, 3]],
    [[3, 1], [2, 2], [1, 3]],

    [[2, 1], [3, 1], [4, 1]],
    [[2, 2], [3, 2], [4, 2]],
    [[2, 3], [3, 3], [4, 3]],
    [[2, 1], [2, 2], [2, 3]],
    [[3, 1], [3, 2], [3, 3]],
    [[4, 1], [4, 2], [4, 3]],
    [[2, 1], [3, 2], [4, 3]],
    [[4, 1], [3, 2], [2, 3]],

    [[1, 2], [2, 2], [3, 2]],
    [[1, 3], [2, 3], [3, 3]],
    [[1, 4], [2, 4], [3, 4]],
    [[1, 2], [1, 3], [1, 4]],
    [[2, 2], [2, 3], [2, 4]],
    [[3, 2], [3, 3], [3, 4]],
    [[1, 2], [2, 3], [3, 4]],
    [[3, 2], [2, 3], [1, 4]]
];