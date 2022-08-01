import { createWriteStream, rm } from "fs";
import { Canvas, createCanvas } from 'canvas';
import fs from 'fs';
import { basename, dirname, join, parse, resolve } from "path";
import sharp from "sharp";
import { promisify } from "util";
import { Readable } from "stream";

export type Options = {
	squareSize?: number,
	squareGap?: number,
	padding?: number,
	squareColor?: string,
	textColor?: string,
	borderColor?: string | null,
	borderWidth?: number,
	output?: string,
	format?: "png" | "webp"
}

const defaultOptions: Required<Options> = {
	squareSize: 50,
	squareGap: 5,
	padding: 4,
	squareColor: "white",
	textColor: "black",
	borderColor: "black",
	borderWidth: 2,
	output: join(process.cwd(), "output.png"),
	format: "png"
}

export type Square = null | string | { 
	letter: string, 
	squareColor?: string, 
	textColor?: string,
	borderColor?: string,
	borderWidth?: number
}

const max = (nums: Array<number>) => {
	return nums.reduce((acc, curr) => acc < curr ? curr : acc, -Infinity);
}

const writeStreamToFile = async (file: string, stream: Readable): Promise<void> => {
	const writeStream = createWriteStream(resolve(process.cwd(), file));
	stream.pipe(writeStream);
	await new Promise(resolve => writeStream.on('finish', resolve));
}

const writeOutputFile = async (canvas: Canvas, output: string, format: Options["format"]): Promise<void> => {
	const outputPath = resolve(process.cwd(), output);
	switch(format) {
		case "webp": {
			const tmpPath = resolve(process.cwd(), join(dirname(output), `${basename(output)}.tmp`));
			console.log("writing to tmp file", tmpPath);
			await writeStreamToFile(tmpPath, canvas.createPNGStream())
			console.log("writing to output file", outputPath);
			await sharp(tmpPath).webp().toFile(outputPath);
			await promisify(rm)(tmpPath);
			console.log("removed tmp file", tmpPath)
			break;
		}
		case "png": 
		default: {
			console.log("writing to output file", outputPath);
			return await writeStreamToFile(outputPath, canvas.createPNGStream())
		}
	}
}

export default async (grid: Square[][], options: Options = {}) => {
	const { 
		squareSize, 
		squareGap, 
		padding,
		textColor,
		borderColor,
		squareColor,
		borderWidth,
		output,
		format
	}: Required<Options> = { ...defaultOptions, ...options };

	const gridWidth = Math.max(max(grid.map(r => r.length)), 0);
	const gridHeight = grid.length;

	const imageWidth = padding * 2 
	+ gridWidth * squareSize
	+ (gridWidth - 1) * squareGap;
	const imageHeight = padding * 2
	+ gridHeight * squareSize
	+ (gridHeight - 1) * squareGap;
	const canvas = createCanvas(imageWidth, imageHeight)

	const ctx = canvas.getContext('2d');
	ctx.font = (squareSize * 0.8) + "px Helvetica Neue"

	ctx.beginPath();
	ctx.fillStyle = 'white';
	ctx.fillRect(0, 0, imageWidth, imageHeight);
	
	const getSquareColor = (square: Square): string => {
		if (!square) return squareColor;
		if (typeof square === "string") return squareColor;
		return square.squareColor ?? squareColor;
	}
	
	const getTextColor = (square: Square): string => {
		if (!square) return textColor;
		if (typeof square === "string") return textColor;
		return square.textColor ?? textColor;
	}

	const getBorderColor = (square: Square): string | null => {
		if (!square) return borderColor;
		if (typeof square === "string") return borderColor;
		return square.borderColor ?? borderColor;
	}

	const getBorderWidth = (square: Square): number => {
		if (!square) return borderWidth;
		if (typeof square === "string") return borderWidth;
		return square.borderWidth ?? borderWidth;
	}

	const drawSquare = (row: number, square: number, content: Square) => {
		const x = padding + (squareGap + squareSize) * square;
		const y = padding + (squareGap + squareSize) * row;

		const color = getBorderColor(content);
		if (color) {
			ctx.strokeStyle = color;
			ctx.lineWidth = getBorderWidth(content)
			ctx.strokeRect(x, y, squareSize, squareSize);
		}

		ctx.fillStyle = getSquareColor(content);
		ctx.fillRect(x, y, squareSize, squareSize);

		if (!content) return;
		ctx.textAlign ='center'; 
		ctx.textBaseline = 'middle';

		ctx.fillStyle = getTextColor(content);
		const char = typeof content === "string" ? content : content.letter;
		ctx.fillText(char, 
			x + squareSize / 2,
			y + squareSize / 2);
	};

	for (let y = 0; y < grid.length; y++) {
		const row = grid[y];
		for(let x = 0; x < row.length; x++) {
			const square = row[x];
			drawSquare(y, x, square);
		}
	}

	await writeOutputFile(canvas, output, format)
}
