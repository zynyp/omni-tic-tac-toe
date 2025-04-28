import { createSignal, For } from "solid-js";
import { Occupant } from "../types";

export default function Grid() {
    const [state, setState] = createSignal<Occupant[][]>(Array(5).fill(null).map(() => Array(5).fill(Occupant.None)), { equals: false });
    function updateState(x: number, y: number) {
        const newState = state();
        newState[y][x] = +Object.keys(Occupant)[Math.random() * 4 | 0] as Occupant;
        
        setState(newState);
    }

    function getSrc(x: number, y: number): string {
        const occupant = state()[y][x];
        switch (occupant) {
            case Occupant.None: return "";

            case Occupant.Circle: return "/tiles/circle.svg";
            case Occupant.Cross: return "/tiles/cross.svg";

            case Occupant.Defender: return "/tiles/defender.svg";
        }
    }

    function getAlt(x: number, y: number): string {
        const occupant = state()[y][x];
        switch (occupant) {
            case Occupant.None: return "";

            case Occupant.Circle: return "Circle Tile";
            case Occupant.Cross: return "Cross Tile";

            case Occupant.Defender: return "Defender Tile";
        }
    }

    return (
        <div class="w-full h-full justify-items-center content-center">
            <div class="relative w-full h-full max-w-100 max-h-100">
                <img class="absolute top-0 left-0 pointer-events-none" src="grid.svg" alt="Tile Grid" width={400} draggable="false" role="presentation" aria-hidden="true" />
                <table class="flex flex-col  justify-center">
                        <For each={Array(5)}>
                            {(_, y) => (
                                <tr class="flex flex-row">
                                    <For each={Array(5)}>
                                        {(_, x) => {
                                            if ((x() === 0 || x() === 4) && (y() === 0 || y() === 4)) return <div class="aspect-square w-full h-full"></div>;
                                            
                                            return (
                                                <button class="aspect-square justify-items-center content-center w-full bg-white" onclick={() => updateState(x(), y())}>
                                                    {state()[y()][x()] === Occupant.None ? <div class="aspect-square w-full"></div> : <img class="aspect-square" src={getSrc(x(), y())} alt={getAlt(x(), y())} width={64} />}
                                                </button>
                                            );
                                        }}
                                    </For>
                                </tr>
                            )}
                        </For>                
                </table>
            </div>
        </div>
    );
}