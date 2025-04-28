import { createSignal, For, onMount, type Signal } from "solid-js";
import { animate } from "animejs";

import { Dice, Grid } from "./components";
import { Tile, TileNames, TileSources } from "./types";

export default function Game() {
    let info!: HTMLDivElement;
    let currentTurnText!: HTMLHeadingElement;

    let startPlayingText!: HTMLParagraphElement;
    const [hasNotPlayed, setHasNotPlayed] = createSignal(true);

    const tiles = Array(5).fill(null).map<Signal<Tile>[]>(() => Array(5).fill(null).map(() => createSignal<Tile>(Tile.None)));
    const [currentTurn, setCurrentTurn] = createSignal(Tile.None);
    const [allowPlacing, setAllowPlacing] = createSignal(false);

    const [credits, setCredits] = createSignal(0);
    const [rollDice, setRollDice] = createSignal(true);

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

        window.addEventListener("click", onWindowClick);
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
                    if (!backwards) return;
                    
                    setHasNotPlayed(false);
                }
            });

            animate(currentTurnText, {
                height: {
                    to: "2rem",
                    ease: "outQuad"
                },

                opacity: {
                    to: 1.0,

                    ease: "outQuad",
                    delay: 300
                },
            })

            setCurrentTurn(Tile.Circle);
            window.removeEventListener("click", onWindowClick);
        }
    });

    function onGridPlace(x: number, y: number) {
        if (!allowPlacing()) return;

        tiles[y][x][1](currentTurn());
        setCurrentTurn(currentTurn() === Tile.Circle ? Tile.Cross : Tile.Circle);
    }

    function onDiceRoll(face: number) {
        setAllowPlacing(true);
        setCredits(face);

        setRollDice(false);
    }

    return (
        <>
            <div class="h-min">
                <h2 ref={currentTurnText} class="h-0 text-2xl font-bold text-center align-middle opacity-0">It's <img class="inline-block" src={TileSources[currentTurn()]} alt={TileNames[currentTurn()]} width={30} />'s Turn!</h2>
                <Grid tiles={tiles} onPlace={onGridPlace} />
            </div>

            <div ref={info} class={`h-60 ${hasNotPlayed() ? "justify-items-center content-end" : "flex flex-row gap-6 justify-center items-end"}`}>
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
                            <div class="w-40 h-40">this is stupid, but uhh you have {rollDice() ? "???" : credits()} credits...</div>
                            <Dice doRoll={rollDice} onRollEnd={onDiceRoll} />
                        </>
                    )
                }
            </div>
        </>
    );
}