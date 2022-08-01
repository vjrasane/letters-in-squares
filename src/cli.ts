#!/usr/bin/env node

import yargs from "yargs";
import wordle from "./wordle";
import { join } from "path";
import { oneOf } from "decoders";

yargs
	.scriptName("letters-in-squares")
	.usage("$0 <cmd> [options]")
	.command("wordle", "Render wordle image", (yargs) => yargs
		.option("word", {
			alias: "w",
			describe: "Wordle secret word",
			demandOption: true,
			type: "string"
		})
		.option("guess", {
			alias: "g",
			describe: "Wordle guess",
			type: "array",
			demandOption: true
		})
		.option("output", {
			alias: "o",
			describe: "Output file",
			type: "string",
			default: join(process.cwd(), "output.png")
		})
		.option("size", {
			describe: "Square size",
			type: "number",
			default: 25
		})
		.option("padding", {
			describe: "Image padding",
			type: "number",
			default: 3
		})
		.option("gap", {
			describe: "Grid gap",
			type: "number",
			default: 3
		})
		.option("format", {
			alias: "f",
			describe: "Output format",
			type: "string",
			default: "png"
		}),
		(argv) => wordle(argv.word, argv.guess.map(v => `${v}`), 
			{ output: argv.output, 
				squareSize: argv.size,
				squareGap: argv.gap,
				padding: argv.padding,
				format: oneOf(["png", "webp"]).value(argv.format)
			}
		)
	)
	.demandCommand()
	.help()
	.argv;

