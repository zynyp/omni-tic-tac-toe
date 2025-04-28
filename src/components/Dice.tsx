import { createEffect, createSignal, on, onMount, type Accessor } from "solid-js";
import { animate } from "animejs";

import { Howl } from "howler";

const stepHowler = new Howl({
    src: "sounds/dice-step.mp3",
    volume: 0.8
});

const rollHowler = new Howl({
    src: "sounds/dice-roll.mp3",
    volume: 0.8
});

stepHowler.load();
rollHowler.load();

export default function Dice(props: DiceProps) {
    const { doRoll, onRollEnd: endRoll = () => {} } = props;

    let dice!: HTMLImageElement;
    let shadow!: HTMLImageElement;

    const [face, setFace] = createSignal(1);
    const [isRolling, setIsRolling] = createSignal(false);

    createEffect(on(doRoll, (doRoll) => doRoll && roll()));
    onMount(roll);

    function roll() {
        if (isRolling()) return;
        setIsRolling(true);

        animate(dice, {
            keyframes: [
                {
                    y: {
                        to: -36,
                        ease: "outQuad"
                    }
                },
                {
                    y: {
                        to: 0,
                        ease: "inQuad"
                    }
                }
            ],

            loop: 3,
            duration: 500,

            onComplete() {
                setIsRolling(false);

                updateFace();
                endRoll(face());

                rollHowler.seek(0.1);
                rollHowler.rate(Math.random() * 0.4 + 0.8);
                
                rollHowler.play();
            },

            onLoop() {
                updateFace();
                stepHowler.play();
            }
        });

        animate(shadow, {
            keyframes: [
                {
                    scale: {
                        to: 0.6,
                        ease: "outQuad"
                    },

                    opacity: {
                        to: 0.4,
                        ease: "outQuad"
                    }
                },
                {
                    scale: {
                        to: 1.0,
                        ease: "inQuad",
                    },

                    opacity: {
                        to: 0.8,
                        ease: "inQuad"
                    }
                }
            ],

            loop: 3,
            duration: 500
        });

        function updateFace() {
            let prevFace = face();
            do setFace(Math.random() * 4 + 1 | 0); while (face() === prevFace);
        }
    }

    return (
        <div class="flex flex-col items-center h-36" role="button">
            <img ref={dice} src={`images/dices/${face()}.svg`} alt={`Dice Face ${face()}`} width={64} draggable="false" />
            <img ref={shadow} class="-z-10 opacity-80 origin-center -translate-y-3" src="images/dice-shadow.svg" alt="" width={68} draggable="false" role="presentation" aria-hidden="true" />

            <img class="-z-20 origin-center -translate-y-12" src="images/dice-pillar.svg" alt="Dice Pillar" width={80} draggable="false" role="presentation" aria-hidden="true" />
        </div>
    );
}

export interface DiceProps {
    doRoll: Accessor<boolean>;
    onRollEnd?: (face: number) => any;
}