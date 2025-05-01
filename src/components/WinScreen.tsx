import { createEffect, onMount, type Signal } from "solid-js";
import { Tile, TileNames, TileSources } from "../types";
import { animate } from "animejs";

export default function WinScreen(props: WinScreenProps) {
    let dialog!: HTMLDialogElement;
    let container!: HTMLDivElement;
    
    const {
        winnerSignal: [winner, setWinner],
        isShowingSignal: [isShowing, setIsShowing],

        onRestart = () => {}
    } = props;

    onMount(() => {
        animate(dialog, {
            opacity: {
                to: 1.0,
                ease: "outQuad"
            },

            duration: 800
        });

        animate(container, {
            y: {
                from: "-2rem",
                to: 0,

                ease: "outQuad"
            }
        });
    });

    createEffect(() => {
        if (isShowing()) return;
        animate(dialog, {
            opacity: {
                to: 0.0,
                ease: "outQuad"
            },

            duration: 800,
            onComplete() {
                setWinner(Tile.None);
            }
        });

        animate(container, {
            y: {
                to: "-2rem",
                ease: "inQuad"
            }
        });

        onRestart();
    });

    return (
        <dialog ref={dialog} class="grid absolute top-0 left-0 place-items-center w-full h-full bg-[#00000040] opacity-0">
            <div ref={container} class="flex flex-col gap-6 items-center pt-6 pb-4 mx-4 my-12 w-full max-w-80 bg-white rounded-2xl">
                <h2 class="text-xl md:text-2xl h-md:text-2xl font-bold text-center align-middle"><img class="inline-block mx-1" src={TileSources[winner()]} alt={TileNames[winner()]} width={30} /> wins!</h2>
                <button class="w-48 h-14 bg-blue-500 text-xl font-bold text-white rounded-full outline-none focus:ring-2 ring-blue-500 ring-offset-2 hover:brightness-90 transition duration-200" onclick={() => setIsShowing(false)} onpointerup={({ target }) => (target as HTMLButtonElement).blur()}>Restart Game</button>
            </div>
        </dialog>
    );
}

export interface WinScreenProps {
    winnerSignal: Signal<Tile>;
    isShowingSignal: Signal<boolean>;

    onRestart?: () => any;
}