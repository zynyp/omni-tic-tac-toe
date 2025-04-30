import { createMemo, createSignal, For, onCleanup, onMount, type Signal } from "solid-js";
import { animate } from "animejs";

import { Dice, Grid, GRID_HEIGHT, GRID_WIDTH } from "./components";
import { Tile, TileNames, TileSources, type Turn } from "./types";

// TODO: fix sizing and placement issues on mobile (dont use justify-items-center, content-center, etc)
const MAX_TILES: Record<Tile, number> = {
    [Tile.None]: 0,
    
    [Tile.Circle]: 4,
    [Tile.Cross]: 4,

    [Tile.Defender]: 2
};

export default function Game() {
    let info!: HTMLDivElement;
    let currentTurnText!: HTMLHeadingElement;

    let startPlayingText!: HTMLParagraphElement;
    const [hasNotPlayed, setHasNotPlayed] = createSignal(true);

    const tiles: Record<Tile, Signal<[number, number][]>> = {
        [Tile.None]: createSignal<[number, number][]>([]),

        [Tile.Circle]: createSignal<[number, number][]>([]),
        [Tile.Cross]: createSignal<[number, number][]>([]),

        [Tile.Defender]: createSignal<[number, number][]>([])
    };

    const [allowPlacing, setAllowPlacing] = createSignal(false);
    const [selectedTile, setSelectedTile] = createSignal<[number, number] | null>(null);

    const [currentTurn, setCurrentTurn] = createSignal(Tile.None);

    const [turnHistory, setTurnHistory] = createSignal<(Turn & { credits: number; })[]>([]);
    const [turnActionIdx, setTurnActionIdx] = createSignal(-1);

    const [credits, setCredits] = createSignal(0);
    const [diceFace, setDiceFace] = createSignal(1);

    const [rollDice, setRollDice] = createSignal(false);
    const [diceRollSteps, setDiceRollSteps] = createSignal(0);

    const currentTiles = createMemo(() => {
        const currentTiles: Tile[][] = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(Tile.None));

        for (const tileType in tiles) {
            const tile = +tileType as Tile;

            const [coords] = tiles[tile];
            for (const [x, y] of coords()) currentTiles[y][x] = tile;
        }

        for (const { tile, x, y } of turnHistory().slice(0, turnActionIdx() + 1)) currentTiles[y][x] = tile;        

        return currentTiles;
    });

    const cleanupController = new AbortController();
    onMount(() => {
        animate(startPlayingText, {
            rotate: {
                from: "-2deg",
                to: "2deg",

                ease: "inOutQuad"
            },

            loop: true,
            alternate: true
        });

        window.addEventListener("click", onWindowClick, cleanupController);
        function onWindowClick({ target }: MouseEvent) {
            if (target instanceof HTMLAnchorElement) return;

            animate(info, {
                opacity: {
                    to: 0.0,
                    ease: "inOutQuad"
                },

                loop: 1,
                alternate: true,

                onUpdate({ backwards }) {
                    backwards && setHasNotPlayed(false);
                }
            });

            animate(currentTurnText, {
                height: {
                    to: (matchMedia("(width < 48rem)").matches && matchMedia("(height >= 48rem)").matches) || (matchMedia("(width >= 48rem)").matches && matchMedia("(height < 48rem)").matches) ? "2rem" : "1rem",
                    ease: "outQuad"
                },

                opacity: {
                    to: 1.0,

                    ease: "outQuad",
                    delay: 300
                },
            });

            endTurn();
            window.removeEventListener("click", onWindowClick);
        }
    });

    onCleanup(() => cleanupController.abort());

    function getTile(tileX: number, tileY: number): Tile {
        for (const tileType in tiles) {
            const tile = +tileType as Tile;

            if (tiles[tile][0]().findIndex(([x, y]) => x === tileX && y === tileY) < 0) continue;
            return tile;
        }

        return Tile.None;
    }

    function endTurn() {
        if (rollDice()) return;
        setAllowPlacing(false);

        setCurrentTurn(currentTurn() === Tile.Circle ? Tile.Cross : Tile.Circle);
        
        let coordsAdded: [number, number][] = [];
        for (const { tile, x, y } of [...turnHistory()].reverse()) !coordsAdded.some(([tileX, tileY]) => tileX === x && tileY === y) && tiles[tile][1]([...tiles[tile][0](), [x, y]]) && coordsAdded.push([x, y]);

        setTurnHistory([]);
        setTurnActionIdx(-1);

        // TODO: validate and check tiles
        if (true) {}

        setRollDice(true);
        setDiceRollSteps(0);
    }

    function updateTurnActionIdx(turnActionIdx: number) {
        setTurnActionIdx(turnActionIdx);
        if (turnActionIdx < 0) return;

        let currentCredits: number = diceFace();
        for (const { credits } of turnHistory().slice(0, turnActionIdx + 1)) currentCredits += credits;
    
        setCredits(currentCredits);
    }

    function onGridPlace(x: number, y: number) {
        if (!allowPlacing()) return;
        
        if (getTile(x, y) === Tile.None) {
            let tile = Tile.None;
            let creditChange: number = 0;

            switch (currentTiles()[y][x]) {
                case currentTurn(): 
                case Tile.Defender: {
                    tile = currentTiles()[y][x] === Tile.Defender ? Tile.None : Tile.Defender;
                    creditChange = 1;
                    
                    break;
                }

                default: {
                    const isPlacingDefender = credits() < 2;

                    tile = isPlacingDefender ? Tile.Defender : currentTurn();
                    creditChange = +isPlacingDefender - 2;
                }
            }

            setCredits(credits() + creditChange);
            if (credits() < 0) {
                setCredits(0);
                return;
            }

            const turn: Turn & { credits: number; } = { tile, x, y, credits: creditChange };

            setTurnHistory([...turnHistory().slice(0, turnActionIdx() + 1), turn]);
            setTurnActionIdx(turnActionIdx() + 1);
        }
    }

    function onDiceRollEnd(face: number) {
        setAllowPlacing(true);

        setCredits(face);
        setDiceFace(face);

        setRollDice(false);
    }

    return (
        <>
            <div class="flex flex-col justify-center items-center w-full h-min">
                <h2 ref={currentTurnText} class="h-0 text-xl md:text-2xl h-md:text-2xl font-bold text-center align-middle opacity-0">It's <img class="inline-block mx-1" src={TileSources[currentTurn()]} alt={TileNames[currentTurn()]} width={30} />'s Turn!</h2>
                <Grid tiles={currentTiles} currentTurn={currentTurn} credits={credits} allowPlacing={allowPlacing} onPlace={onGridPlace} />
            </div>

            <div ref={info} class={`flex flex-col justify-end md:justify-center items-center pt-2 md:mr-40 md:w-120 ${hasNotPlayed() ? "gap-4" : "gap-2 md:gap-6 h-mdlg:gap-8"}`}>
                {
                    hasNotPlayed()
                    ? (
                        <>
                            <div class="flex flex-row gap-2 mb-6">
                                <For each={[Tile.Circle, Tile.Cross, Tile.Defender]}>
                                    {(tile) => <img src={TileSources[tile]} alt={TileNames[tile]} width={48} />}
                                </For>
                            </div>

                            <p ref={startPlayingText} class="mx-1 w-fit h-12 text-xl font-bold text-center">Click anywhere on the screen to start playing!</p>
                        </>
                    )
                    : (
                        <>
                            <div class="flex flex-row md:order-1 gap-2 justify-center">
                                <img class={`transition-[margin,_width] duration-200 ${turnActionIdx() > 0 ? "not-hover:m-1 hover:w-11" : "opacity-60"}`} src="images/undo-arrow.svg" alt="Undo" width={36} draggable="false" tabIndex={-1 + +(turnActionIdx() > 0)} role="button" aria-disabled={turnActionIdx() <= 0} onclick={() => updateTurnActionIdx(Math.max(turnActionIdx() - 1, -1))} />
                                <img class={`transition-[margin,_width] duration-200 ${Math.max(turnActionIdx(), turnHistory().length) < 1 ? "opacity-60" : "not-hover:m-1 hover:w-11"}`} src="images/redo-arrow.svg" alt="Redo" width={36} draggable="false" tabIndex={-(Math.max(turnActionIdx(), turnHistory().length) < 1)} role="button" aria-disabled={Math.max(turnActionIdx(), turnHistory().length) < 1} onclick={() => updateTurnActionIdx(Math.min(turnActionIdx() + 1, turnHistory().length - 1))} />
                            </div>
                            
                            <div class="flex flex-row gap-18 justify-center items-end">
                                <div class="flex flex-col justify-center">
                                    <div class="flex flex-col items-center h-20">
                                        <h3 class="text-xl font-bold">Credits</h3>
                                        <p class="text-lg font-semibold">{rollDice() ? ".".repeat(diceRollSteps()) : credits()}</p>
                                    </div>

                                    <button class={`w-40 h-14 text-xl font-bold text-white rounded-full outline-none focus:ring-2 ring-offset-2 hover:brightness-90 transition duration-200 ${rollDice() ? "bg-neutral-500 ring-neutral-500" : "bg-blue-500 ring-blue-500"}`} disabled={rollDice()} tabIndex={-rollDice()} onclick={endTurn} onpointerup={({ target }) => (target as HTMLButtonElement).blur()}>End Turn</button>
                                </div>

                                <Dice doRoll={rollDice} onRollStep={() => setDiceRollSteps(diceRollSteps() + 1)} onRollEnd={onDiceRollEnd} />
                            </div>
                        </>
                    )
                }
            </div>
        </>
    );
}