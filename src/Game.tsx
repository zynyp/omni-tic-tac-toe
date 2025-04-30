import { createMemo, createSignal, For, onCleanup, onMount, type Signal } from "solid-js";
import { animate } from "animejs";

import { Dice, Grid, GRID_HEIGHT, GRID_MATCHES, GRID_WIDTH, MAX_TILES, WinScreen } from "./components";
import { Tile, TileNames, TileSources, type Turn } from "./types";

export default function Game() {
    let info!: HTMLDivElement;
    let currentTurnText!: HTMLHeadingElement;

    let startPlayingText!: HTMLParagraphElement;

    let keyZ!: HTMLElement;
    let keyX!: HTMLElement;

    let spaceBar!: HTMLElement;

    const tiles: Record<Tile, Signal<[number, number][]>> = {
        [Tile.None]: createSignal<[number, number][]>([]),

        [Tile.Circle]: createSignal<[number, number][]>([]),
        [Tile.Cross]: createSignal<[number, number][]>([]),

        [Tile.Defender]: createSignal<[number, number][]>([])
    };

    const tileCount = createMemo(() => {
        const tileCount = {} as Record<Tile, number>;
        for (const tileType in tiles) {
            const tile = +tileType as Tile;
            tileCount[tile] = tiles[tile][0]().length;
        } 
        
        return tileCount;
    });

    const [hasNotPlayed, setHasNotPlayed] = createSignal(true);

    const [allowPlacing, setAllowPlacing] = createSignal(false);
    const [selectedTile, setSelectedTile] = createSignal<[number, number] | null>(null);

    const [currentTurn, setCurrentTurn] = createSignal(Tile.None);

    const [turnHistory, setTurnHistory] = createSignal<GameTurn[]>([]);
    const [turnActionIdx, setTurnActionIdx] = createSignal(-1);

    const [credits, setCredits] = createSignal(0);
    const [diceFace, setDiceFace] = createSignal(1);

    const winnerSignal = createSignal(Tile.None);
    const [winner, setWinner] = winnerSignal;

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

    const isOnLargeScreen = createMemo(() => (matchMedia("(width < 48rem)").matches && matchMedia("(height >= 48rem)").matches) || (matchMedia("(width >= 48rem)").matches && matchMedia("(height < 48rem)").matches));

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
                    to: isOnLargeScreen() ? "2rem" : "1.5rem",
                    ease: "outQuad"
                },

                opacity: {
                    to: 1.0,

                    ease: "outQuad",
                    delay: 300
                },
            });

            restartGame();
            window.removeEventListener("click", onWindowClick);
        }

        window.addEventListener("keydown", ({ code }) => {
            switch (code) {
                case "KeyZ": {
                    updateTurnActionIdx(turnActionIdx() - 1);
                    break;
                }

                case "KeyX": {
                    updateTurnActionIdx(turnActionIdx() + 1);
                    break;
                }

                case "Space": {
                    endTurn();
                    break;
                }
            }
        }, cleanupController);

        window.addEventListener("resize", () => currentTurnText.style.height = isOnLargeScreen() ? "2rem" : "1.5rem", cleanupController);
    });

    onCleanup(() => cleanupController.abort());

    function restartGame() {
        if (rollDice()) return;
        setAllowPlacing(false);

        for (const tile in tiles) tiles[+tile as Tile][1]([]);

        setCurrentTurn(Tile.Circle);
        setTurnHistory([]);
        setTurnActionIdx(-1);

        setRollDice(true);
        setDiceRollSteps(0);
    }

    function endTurn() {
        if (rollDice()) return;
        setAllowPlacing(false);

        for (const { tile, x, y } of turnHistory().slice(0, turnActionIdx() + 1)) {
            if (tile !== Tile.None) {
                tiles[tile][1]([...tiles[tile][0](), [x, y]]);
                continue;
            }

            for (const tileType in tiles) {
                const tile = +tileType as Tile;
                if (tiles[tile][0]().some(([tileX, tileY]) => tileX === x && tileY === y)) tiles[tile][1](tiles[tile][0]().filter(([tileX, tileY]) => tileX !== x || tileY !== y));
            }
        }

        setTurnHistory([]);
        setTurnActionIdx(-1);

        for (const tile of [Tile.Circle, Tile.Cross]) {
            const coords = [...tiles[tile][0]()];
            if (coords.length < 1) continue;

            // check if there are any valid matches
            if (GRID_MATCHES.some((match) => match.every(([x, y]) => coords.some(([coordsX, coordsY]) => coordsX === x && coordsY === y)))) {
                setWinner(tile);
                return;
            } 
        }

        setCurrentTurn(currentTurn() === Tile.Circle ? Tile.Cross : Tile.Circle);

        setRollDice(true);
        setDiceRollSteps(0);
    }

    function getTile(tileX: number, tileY: number): Tile {
        for (const tileType in tiles) {
            const tile = +tileType as Tile;

            if (tiles[tile][0]().findIndex(([x, y]) => x === tileX && y === tileY) < 0) continue;
            return tile;
        }

        return Tile.None;
    }

    function updateTurnActionIdx(newTurnActionIdx: number) {
        newTurnActionIdx = Math.max(-1, Math.min(newTurnActionIdx, turnHistory().length - 1));
        
        const prevTurnActionIdx = turnActionIdx();
        if (newTurnActionIdx < prevTurnActionIdx && prevTurnActionIdx > 1) {
            if (turnHistory()[newTurnActionIdx].credits === 0) newTurnActionIdx--; else if (turnHistory()[newTurnActionIdx + 1].credits === 0) newTurnActionIdx++;
        }

        setTurnActionIdx(newTurnActionIdx);

        let currentCredits: number = diceFace();
        for (const { credits } of turnHistory().slice(0, newTurnActionIdx + 1)) currentCredits += credits;
    
        setCredits(currentCredits);
    }

    function animateKeyIn(key: AnimatedKey) {
        switch (key) {
            case AnimatedKey.Z: {
                animate(keyZ, {
                    x: {
                        to: -28,
                        ease: "outQuad"
                    },

                    opacity: {
                        to: 1.0,
                        ease: "outQuad"
                    }
                });

                break;
            }

            case AnimatedKey.X: {
                animate(keyX, {
                    x: {
                        to: 28,
                        ease: "outQuad"
                    },

                    opacity: {
                        to: 1.0,
                        ease: "outQuad"
                    }
                });

                break;
            }

            case AnimatedKey.Spacebar: {
                animate(spaceBar, {
                    y: {
                        to: 28,
                        ease: "outQuad"
                    },
                    
                    opacity: {
                        to: 1.0,
                        ease: "outQuad"
                    }
                });

                break;
            }
        }
    }

    function animateKeyOut(key: AnimatedKey) {
        switch (key) {
            case AnimatedKey.Z: {
                animate(keyZ, {
                    x: {
                        to: 0,
                        ease: "inQuad"
                    },

                    opacity: {
                        to: 0.0,
                        ease: "inQuad"
                    },

                    duration: 500
                });

                break;
            }

            case AnimatedKey.X: {
                animate(keyX, {
                    x: {
                        to: 0,
                        ease: "inQuad"
                    },

                    opacity: {
                        to: 0.0,
                        ease: "inQuad"
                    },

                    duration: 500
                });

                break;
            }

            case AnimatedKey.Spacebar: {
                animate(spaceBar, {
                    y: {
                        to: 0,
                        ease: "inQuad"
                    },

                    opacity: {
                        to: 0.0,
                        ease: "inQuad"
                    },

                    duration: 500
                });

                break;
            }
        }
    }

    function onGridPlace(x: number, y: number) {
        if (!allowPlacing()) return;

        const currentTile = getTile(x, y);
        
        // if the tile is empty when starting the turn
        if (currentTile === Tile.None && selectedTile() === null) {
            let tile = Tile.None;
            let creditChange: number = 0;

            switch (currentTiles()[y][x]) {
                case currentTurn(): 
                case Tile.Defender: {
                    const noConvertingToDefender = tileCount()[Tile.Defender] >= MAX_TILES[Tile.Defender];

                    tile = currentTiles()[y][x] === Tile.Defender || noConvertingToDefender ? Tile.None : Tile.Defender;
                    creditChange = 1 + +noConvertingToDefender;
                    
                    break;
                }

                default: {
                    const isPlacingDefender = credits() < 2;

                    tile = isPlacingDefender ? Tile.Defender : currentTurn();
                    creditChange = +isPlacingDefender - 2;
                }
            }

            if (tileCount()[tile] >= MAX_TILES[tile]) return;

            setCredits(credits() + creditChange);
            if (credits() < 0) {
                setCredits(0);
                return;
            }

            const turn: GameTurn = { tile, x, y, credits: creditChange };

            setTurnHistory([...turnHistory().slice(0, turnActionIdx() + 1), turn]);
            setTurnActionIdx(turnActionIdx() + 1);

            return;
        }

        if (credits() <= 0) return;

        // when there is a tile selected
        if (selectedTile() !== null) {
            if (currentTile === Tile.None) {
                const [selectedX, selectedY] = selectedTile()!;

                const creditChange = -2 + +(getTile(selectedX, selectedY) === Tile.Defender);
                const turns: GameTurn[] = [
                    {
                        tile: Tile.None,

                        x: selectedX,
                        y: selectedY,

                        credits: creditChange
                    },
                    {
                        tile: getTile(selectedX, selectedY),

                        x,
                        y,

                        credits: 0
                    }
                ];

                setCredits(credits() + creditChange);

                // TODO: restrict with direct setting of tiles.

                setTurnHistory([...turnHistory().slice(0, turnActionIdx() + 1), ...turns]);
                setTurnActionIdx(turnActionIdx() + 2);
            }
            
            setSelectedTile(null);
            return;
        }

        // if tile is an opponent tile
        if (currentTile !== currentTurn() && currentTile !== Tile.Defender && credits() >= 3) {
            const turn: GameTurn = {
                tile: Tile.None,

                x,
                y,
                
                credits: -3
            };

            setCredits(credits() - 3);

            setTurnHistory([...turnHistory().slice(0, turnActionIdx() + 1), turn]);
            setTurnActionIdx(turnActionIdx() + 1);

            return;
        }
        
        // if no tile is selected
        setSelectedTile([x, y]);
    }

    function onDiceRollEnd(face: number) {
        setAllowPlacing(true);

        setCredits(face);
        setDiceFace(face);

        setRollDice(false);
    }

    return (
        <>
            <section class="flex flex-col justify-center items-center w-full h-min">
                <h2 ref={currentTurnText} class="h-0 text-xl md:text-2xl h-md:text-2xl font-bold text-center align-middle opacity-0">It's <img class="inline-block mx-1" src={TileSources[currentTurn()]} alt={TileNames[currentTurn()]} width={30} />'s Turn!</h2>
                <Grid tiles={currentTiles} tileCount={tileCount} selectedTile={selectedTile} currentTurn={currentTurn} credits={credits} allowPlacing={allowPlacing} onPlace={onGridPlace} />
            </section>

            <section ref={info} class={`flex flex-col justify-end md:justify-center items-center pt-2 md:mr-40 md:w-120 ${hasNotPlayed() ? "gap-4" : "gap-2 md:gap-6 h-mdlg:gap-8"}`}>
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
                            <section class="flex relative flex-row md:order-1 gap-2 justify-center">
                                <kbd ref={keyZ} class="absolute top-1/2 left-0 -z-10 brightness-80 opacity-0 -translate-y-1/2">
                                    <img src="images/keys/z.svg" alt="Spacebar" width={24} />
                                </kbd>
                                <img class={`transition-[margin,_width] duration-200 ${turnActionIdx() >= 0 ? "not-hover:m-1 hover:w-11" : "m-1 opacity-60"}`} src="images/undo-arrow.svg" alt="Undo" width={36} draggable="false" tabIndex={-(turnActionIdx() < 0)} role="button" aria-disabled={turnActionIdx() < 0} onclick={() => updateTurnActionIdx(turnActionIdx() - 1)} onpointerenter={() => animateKeyIn(AnimatedKey.Z)} onpointerleave={() => animateKeyOut(AnimatedKey.Z)} />
                                
                                <img class={`transition-[margin,_width] duration-200 ${turnActionIdx() < turnHistory().length - 1 ? "not-hover:m-1 hover:w-11" : "m-1 opacity-60"}`} src="images/redo-arrow.svg" alt="Redo" width={36} draggable="false" tabIndex={-(turnActionIdx() >= turnHistory().length - 1)} role="button" aria-disabled={turnActionIdx() >= turnHistory().length - 1} onclick={() => updateTurnActionIdx(turnActionIdx() + 1)} onpointerenter={() => animateKeyIn(AnimatedKey.X)} onpointerleave={() => animateKeyOut(AnimatedKey.X)} />
                                <kbd ref={keyX} class="absolute top-1/2 right-0 -z-10 brightness-80 opacity-0 -translate-y-1/2">
                                    <img src="images/keys/x.svg" alt="Spacebar" width={24} />
                                </kbd>
                            </section>
                            
                            <div class="flex flex-row gap-18 justify-center items-end">
                                <section class="flex relative flex-col justify-center">
                                    <div class="flex flex-col items-center h-20">
                                        <h3 class="text-xl font-bold">Credits</h3>
                                        <p class="text-lg font-semibold">{rollDice() ? ".".repeat(diceRollSteps()) : credits()}</p>
                                    </div>

                                    <button class={`w-40 h-14 text-xl font-bold text-white rounded-full outline-none focus:ring-2 ring-offset-2 hover:brightness-90 transition duration-200 ${rollDice() ? "bg-neutral-500 ring-neutral-500" : "bg-blue-500 ring-blue-500"}`} disabled={rollDice()} tabIndex={-rollDice()} onclick={endTurn} onpointerup={({ target }) => (target as HTMLButtonElement).blur()} onpointerenter={() => animateKeyIn(AnimatedKey.Spacebar)} onpointerleave={() => animateKeyOut(AnimatedKey.Spacebar)}>End Turn</button>
                                    <kbd ref={spaceBar} class="absolute bottom-0 left-1/2 -z-10 brightness-80 opacity-0 -translate-x-1/2">
                                        <img src="images/keys/spacebar.svg" alt="Spacebar" width={40} />
                                    </kbd>
                                </section>

                                <Dice doRoll={rollDice} onRollStep={() => setDiceRollSteps(diceRollSteps() + 1)} onRollEnd={onDiceRollEnd} />
                            </div>
                        </>
                    )
                }
            </section>

            {winner() !== Tile.None && <WinScreen winnerSignal={winnerSignal} onRestart={restartGame} />}
        </>
    );
}

interface GameTurn extends Turn { credits: number; }
enum AnimatedKey {
    Z,
    X,

    Spacebar
}