if (!crazyPixels) {
	var crazyPixels = {}
}

crazyPixels = {

	canvas: null,
	iteration: 0,
	interval_id: null,

	colorEnum: {
		RED: 1,
		GREEN: 2,
		BLUE: 3
	},

	config: {
		width: 50,
		height: 50,
		scale: 5,		

		selfCount: -1,
		otherCount: 1,		

		edgeNoise: true,		
		chaosFactor: 1,
		
		addToMin: 1,
		subtractFromMax: 1,

		shadowArray: true,
		
		scrandomize: true,
		randScrand: false,

		scanDirection: {
			x_min: 0,
			x_max: 50,
			d_x: 1,
			y_min: 0,
			y_max: 50,
			d_y: 1
		},

		interval: 30,
		skipFrames: true
	},

	init: function(canvasName) {
		crazyPixels.canvas = document.getElementById(canvasName)
		crazyPixels.config.width = canvas.width;
		crazyPixels.config.height = canvas.height;

		crazyPixels.config.width /= crazyPixels.config.scale;
		crazyPixels.config.height /= crazyPixels.config.scale;

		crazyPixels.config.scanDirection = crazyPixels.getScanSettings(0);

		crazyPixels.array = new Array(crazyPixels.config.width);

		for (var x = 0; x < crazyPixels.config.width; x++) {
			crazyPixels.array[x] = new Array(crazyPixels.config.height);

			for (var y = 0; y < crazyPixels.config.height; y++) {
				crazyPixels.array[x][y] = Math.floor(Math.random() * (3)) + 1;
			}
		}
		crazyPixels.start_animation();
	},

	printStats: function() {
		print("Width: " + crazyPixels.config.width)
		print("Height: " + crazyPixels.config.height)
		print("Scale: " + crazyPixels.config.scale)
		print("Iteration: " + crazyPixels.iteration)
	},

	paint: function() {
		if (crazyPixels.canvas.getContext && (!crazyPixels.config.skipFrames || crazyPixels.iteration % 2 == 0)) {
			var context = crazyPixels.canvas.getContext("2d")
			context.clearRect(0, 0, canvas.width, canvas.height);
			for (var x = 0; x < crazyPixels.array.length; x++) {
				for (var y = 0; y < crazyPixels.array[x].length; y++) {
					if (crazyPixels.array[x][y] == crazyPixels.colorEnum.RED) {
						context.fillStyle = "rgb(200,0,0)";
					} else if (crazyPixels.array[x][y] == crazyPixels.colorEnum.GREEN) {
						context.fillStyle = "rgb(0,200,0)";
					} else if (crazyPixels.array[x][y] == crazyPixels.colorEnum.BLUE) {
						context.fillStyle = "rgb(0,0,200)";
					} else {
						context.fillStyle = "rgb(100,100,100)";
					}
					context.fillRect (x * crazyPixels.config.scale, y * crazyPixels.config.scale, crazyPixels.config.scale, crazyPixels.config.scale);
				}
			}		
		}
	},

	transform: function() {

		var tempArray = [];

		for (var x = 0; x < crazyPixels.config.width; x++) {
			tempArray[x] = [];
			for (var y = 0; y < crazyPixels.config.height; y++) {
				tempArray[x][y] = 0;
			}
		}

		if (crazyPixels.config.scrandomize) {
			if (crazyPixels.config.randScrand) {
				crazyPixels.config.scanDirection = crazyPixels.getScanSettings(Math.floor(Math.random() * 3));
			} else {
				crazyPixels.config.scanDirection = crazyPixels.getScanSettings(crazyPixels.iteration % 4);
			}
		}

		for (var x = crazyPixels.config.scanDirection.x_min; x != crazyPixels.config.scanDirection.x_max; x += crazyPixels.config.scanDirection.d_x) {
			for (var y = crazyPixels.config.scanDirection.y_min; y != crazyPixels.config.scanDirection.y_max; y += crazyPixels.config.scanDirection.d_y) {
				var tally = []
				tally[crazyPixels.colorEnum.RED] = 0;
				tally[crazyPixels.colorEnum.GREEN] = 0;
				tally[crazyPixels.colorEnum.BLUE] = 0;
				var exceptionCount = 0;

				try { tally[crazyPixels.array[x-1][y-1]] += crazyPixels.config.otherCount; } catch (e) { exceptionCount++ }
				try { tally[crazyPixels.array[x-1][y]] += crazyPixels.config.otherCount; } catch (e) { exceptionCount++ }
				try { tally[crazyPixels.array[x-1][y+1]] += crazyPixels.config.otherCount; } catch (e) { exceptionCount++ }
				
				try { tally[crazyPixels.array[x][y-1]] += crazyPixels.config.otherCount; } catch (e) { exceptionCount++ }
				tally[crazyPixels.array[x][y]] += crazyPixels.config.selfCount;
				try { tally[crazyPixels.array[x][y+1]] += crazyPixels.config.otherCount; } catch (e) { exceptionCount++ }

				try { tally[crazyPixels.array[x+1][y-1]] += crazyPixels.config.otherCount; } catch (e) { exceptionCount++ }
				try { tally[crazyPixels.array[x+1][y]] += crazyPixels.config.otherCount; } catch (e) { exceptionCount++ }
				try { tally[crazyPixels.array[x+1][y+1]] += crazyPixels.config.otherCount; } catch (e) { exceptionCount++ }
				
				// count missed edges as random "others"
				if (exceptionCount > 0 && crazyPixels.config.edgeNoise) {
					tally[Math.floor(Math.random() * (3)) + 1] += crazyPixels.config.otherCount * exceptionCount;					
				}

				if (crazyPixels.config.chaosFactor) {
					tally[Math.floor(Math.random() * (3)) + 1] += crazyPixels.config.chaosFactor;
				}

				//figure out the highest tally, not the index, but the count itself
				var highestTally = 0;
				for (var i = 0; i < tally; i++) {
					if (tally[i] > highestTally) {
						highestTally = tally[i];
					}
				}

				for (var i = 0; i < tally.length; i++) {
					if (tally[i] < highestTally) {
						tally[i] += crazyPixels.config.addToMin;
					} else if (tally[i] >= highestTally) {
						tally[i] -= crazyPixels.config.subtractFromMax;
					}
				}

				for (var i = 0; i < tally.length; i++) {
					if (tally[i] > highestTally) {
						highestTally = tally[i];
					}
				}

				//console.log(tally)

				var maxIndexes = []
				for (var i = 0; i < tally.length; i++) {
					if (tally[i] == highestTally) { maxIndexes.push(i) }
				}

				//console.log(maxIndexes)

				var newColor = 0;
				if (maxIndexes.length == 0 || maxIndexes.length == 3) {
					newColor = Math.floor(Math.random() * 3) + 1
				} else if (maxIndexes.length == 1) {
					newColor = maxIndexes[0];
				} else {
					if ((maxIndexes.indexOf(crazyPixels.colorEnum.RED)) != -1 && (maxIndexes.indexOf(crazyPixels.colorEnum.GREEN) != -1)) {
						newColor = crazyPixels.colorEnum.GREEN;
					} else if (maxIndexes.indexOf(crazyPixels.colorEnum.GREEN) != -1
						&& maxIndexes.indexOf(crazyPixels.colorEnum.BLUE) != -1) {
						newColor = crazyPixels.colorEnum.BLUE;
					} else if (maxIndexes.indexOf(crazyPixels.colorEnum.BLUE) != -1
						&& maxIndexes.indexOf(crazyPixels.colorEnum.RED) != -1) {
						newColor = crazyPixels.colorEnum.RED;
					} else {
						newColor = Math.floor(Math.random() * 3) + 1;
						console.log("WHOOPS. RANDOM!")
					}
				}	

				//console.log("Winner: " + newColor);

				/*
				print("Tally: R" + tally[crazyPixels.colorEnum.RED] 
					+ ", G" + tally[crazyPixels.colorEnum.GREEN] 
					+ ", B" + tally[crazyPixels.colorEnum.BLUE])
				print ("Winner: (0/R/G/B)" + newColor)
				*/
				if (crazyPixels.config.shadowArray) {
					tempArray[x][y] = newColor;
				} else {
					crazyPixels.array[x][y] = newColor;
				}
			}
		}
		if (crazyPixels.config.shadowArray) { crazyPixels.array = tempArray.slice(); }
		crazyPixels.iteration++;
	},

	// there are essentially 4 ways we can scan the array, top to bottom and left to right, etc.
	getScanSettings: function(i) {
		var ret = {}
		if (i == 0) {
			ret = {
				x_min: 0,
				x_max: crazyPixels.config.width,
				d_x: 1,
				y_min: 0,
				y_max: crazyPixels.config.height,
				d_y: 1
			}
		} else if (i == 1) {
			ret = {
				x_min: crazyPixels.config.width - 1,
				x_max: -1,
				d_x: -1,
				y_min: 0,
				y_max: crazyPixels.config.height,
				d_y: 1
			}
		} else if (i == 2) {
			ret = {
				x_min: 0,
				x_max: crazyPixels.config.width,
				d_x: 1,
				y_min: crazyPixels.config.height - 1,
				y_max: -1,
				d_y: -1
			}
		} else {
			ret = {
				x_min: crazyPixels.config.width - 1,
				x_max: -1,
				d_x: -1,
				y_min: crazyPixels.config.height - 1,
				y_max: -1,
				d_y: -1
			}
		}
		return ret;
	},

	start_animation: function() {
		if (!crazyPixels.interval_id) {
			crazyPixels.interval_id = window.setInterval(function() {
				crazyPixels.transform();
				crazyPixels.paint();
			}, crazyPixels.config.interval);
		}
	},

	stop_animation: function() {
		if (crazyPixels.interval_id) {
			window.clearInterval(crazyPixels.interval_id);
			crazyPixels.interval_id = null;
		}
	},

	restart_animation: function() {
		crazyPixels.stop_animation();
		crazyPixels.init(crazyPixels.canvas.id);
	}
}