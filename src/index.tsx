import { render } from "solid-js/web";
import "./style.css";

import Game from "./Game";

const root = document.getElementById("game")!;
render(() => <Game />, root);