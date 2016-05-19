(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


var GridSampler = {};

GridSampler.checkAndNudgePoints=function( image,  points)
		{
			var width = image.width;
			var height = image.height;
			// Check and nudge points from start until we see some that are OK:
			var nudged = true;
			for (var offset = 0; offset < points.length && nudged; offset += 2)
			{
				var x = Math.floor (points[offset]);
				var y = Math.floor( points[offset + 1]);
				if (x < - 1 || x > width || y < - 1 || y > height)
				{
					throw "Error.checkAndNudgePoints ";
				}
				nudged = false;
				if (x == - 1)
				{
					points[offset] = 0.0;
					nudged = true;
				}
				else if (x == width)
				{
					points[offset] = width - 1;
					nudged = true;
				}
				if (y == - 1)
				{
					points[offset + 1] = 0.0;
					nudged = true;
				}
				else if (y == height)
				{
					points[offset + 1] = height - 1;
					nudged = true;
				}
			}
			// Check and nudge points from end:
			nudged = true;
			for (var offset = points.length - 2; offset >= 0 && nudged; offset -= 2)
			{
				var x = Math.floor( points[offset]);
				var y = Math.floor( points[offset + 1]);
				if (x < - 1 || x > width || y < - 1 || y > height)
				{
					throw "Error.checkAndNudgePoints ";
				}
				nudged = false;
				if (x == - 1)
				{
					points[offset] = 0.0;
					nudged = true;
				}
				else if (x == width)
				{
					points[offset] = width - 1;
					nudged = true;
				}
				if (y == - 1)
				{
					points[offset + 1] = 0.0;
					nudged = true;
				}
				else if (y == height)
				{
					points[offset + 1] = height - 1;
					nudged = true;
				}
			}
		}



GridSampler.sampleGrid3=function( image,  dimension,  transform)
		{
			var bits = new BitMatrix(dimension);
			var points = new Array(dimension << 1);
			for (var y = 0; y < dimension; y++)
			{
				var max = points.length;
				var iValue =  y + 0.5;
				for (var x = 0; x < max; x += 2)
				{
					points[x] =  (x >> 1) + 0.5;
					points[x + 1] = iValue;
				}
				transform.transformPoints1(points);
				// Quick check to see if points transformed to something inside the image;
				// sufficient to check the endpoints
				GridSampler.checkAndNudgePoints(image, points);
				try
				{
					for (var x = 0; x < max; x += 2)
					{
						var xpoint = (Math.floor( points[x]) * 4) + (Math.floor( points[x + 1]) * image.width * 4);
						var bit = image.data[Math.floor( points[x])+ image.width* Math.floor( points[x + 1])];
						//bits[x >> 1][ y]=bit;
						if(bit)
							bits.set_Renamed(x >> 1, y);
					}
				}
				catch ( aioobe)
				{
					// This feels wrong, but, sometimes if the finder patterns are misidentified, the resulting
					// transform gets "twisted" such that it maps a straight line of points to a set of points
					// whose endpoints are in bounds, but others are not. There is probably some mathematical
					// way to detect this about the transformation that I don't know yet.
					// This results in an ugly runtime exception despite our clever checks above -- can't have
					// that. We could check each point's coordinates but that feels duplicative. We settle for
					// catching and wrapping ArrayIndexOutOfBoundsException.
					throw "Error.checkAndNudgePoints";
				}
			}
			return bits;
		}

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/



function ECB(count,  dataCodewords)
{
	this.count = count;
	this.dataCodewords = dataCodewords;

	Object.defineProperty(this,"Count", { get: function()
	{
		return this.count;
	}});
	Object.defineProperty(this,"DataCodewords", { get: function()
	{
		return this.dataCodewords;
	}});
}

function ECBlocks( ecCodewordsPerBlock,  ecBlocks1,  ecBlocks2)
{
	this.ecCodewordsPerBlock = ecCodewordsPerBlock;
	if(ecBlocks2)
		this.ecBlocks = new Array(ecBlocks1, ecBlocks2);
	else
		this.ecBlocks = new Array(ecBlocks1);

	Object.defineProperty(this,"ECCodewordsPerBlock", { get: function()
	{
		return this.ecCodewordsPerBlock;
	}});

	Object.defineProperty(this,"TotalECCodewords", { get: function()
	{
		return  this.ecCodewordsPerBlock * this.NumBlocks;
	}});

	Object.defineProperty(this,"NumBlocks", { get: function()
	{
		var total = 0;
		for (var i = 0; i < this.ecBlocks.length; i++)
		{
			total += this.ecBlocks[i].length;
		}
		return total;
	}});

	this.getECBlocks=function()
			{
				return this.ecBlocks;
			}
}

function Version( versionNumber,  alignmentPatternCenters,  ecBlocks1,  ecBlocks2,  ecBlocks3,  ecBlocks4)
{
	this.versionNumber = versionNumber;
	this.alignmentPatternCenters = alignmentPatternCenters;
	this.ecBlocks = new Array(ecBlocks1, ecBlocks2, ecBlocks3, ecBlocks4);

	var total = 0;
	var ecCodewords = ecBlocks1.ECCodewordsPerBlock;
	var ecbArray = ecBlocks1.getECBlocks();
	for (var i = 0; i < ecbArray.length; i++)
	{
		var ecBlock = ecbArray[i];
		total += ecBlock.Count * (ecBlock.DataCodewords + ecCodewords);
	}
	this.totalCodewords = total;

	Object.defineProperty(this,"VersionNumber", { get: function()
	{
		return  this.versionNumber;
	}});

	Object.defineProperty(this,"AlignmentPatternCenters", { get: function()
	{
		return  this.alignmentPatternCenters;
	}});
	Object.defineProperty(this,"TotalCodewords", { get: function()
	{
		return  this.totalCodewords;
	}});
	Object.defineProperty(this,"DimensionForVersion", { get: function()
	{
		return  17 + 4 * this.versionNumber;
	}});

	this.buildFunctionPattern=function()
		{
			var dimension = this.DimensionForVersion;
			var bitMatrix = new BitMatrix(dimension);

			// Top left finder pattern + separator + format
			bitMatrix.setRegion(0, 0, 9, 9);
			// Top right finder pattern + separator + format
			bitMatrix.setRegion(dimension - 8, 0, 8, 9);
			// Bottom left finder pattern + separator + format
			bitMatrix.setRegion(0, dimension - 8, 9, 8);

			// Alignment patterns
			var max = this.alignmentPatternCenters.length;
			for (var x = 0; x < max; x++)
			{
				var i = this.alignmentPatternCenters[x] - 2;
				for (var y = 0; y < max; y++)
				{
					if ((x == 0 && (y == 0 || y == max - 1)) || (x == max - 1 && y == 0))
					{
						// No alignment patterns near the three finder paterns
						continue;
					}
					bitMatrix.setRegion(this.alignmentPatternCenters[y] - 2, i, 5, 5);
				}
			}

			// Vertical timing pattern
			bitMatrix.setRegion(6, 9, 1, dimension - 17);
			// Horizontal timing pattern
			bitMatrix.setRegion(9, 6, dimension - 17, 1);

			if (this.versionNumber > 6)
			{
				// Version info, top right
				bitMatrix.setRegion(dimension - 11, 0, 3, 6);
				// Version info, bottom left
				bitMatrix.setRegion(0, dimension - 11, 6, 3);
			}

			return bitMatrix;
		}
	this.getECBlocksForLevel=function( ecLevel)
	{
		return this.ecBlocks[ecLevel.ordinal()];
	}
}

Version.VERSION_DECODE_INFO = new Array(0x07C94, 0x085BC, 0x09A99, 0x0A4D3, 0x0BBF6, 0x0C762, 0x0D847, 0x0E60D, 0x0F928, 0x10B78, 0x1145D, 0x12A17, 0x13532, 0x149A6, 0x15683, 0x168C9, 0x177EC, 0x18EC4, 0x191E1, 0x1AFAB, 0x1B08E, 0x1CC1A, 0x1D33F, 0x1ED75, 0x1F250, 0x209D5, 0x216F0, 0x228BA, 0x2379F, 0x24B0B, 0x2542E, 0x26A64, 0x27541, 0x28C69);

Version.VERSIONS = buildVersions();

Version.getVersionForNumber=function( versionNumber)
{
	if (versionNumber < 1 || versionNumber > 40)
	{
		throw "ArgumentException";
	}
	return Version.VERSIONS[versionNumber - 1];
}

Version.getProvisionalVersionForDimension=function(dimension)
{
	if (dimension % 4 != 1)
	{
		throw "Error getProvisionalVersionForDimension";
	}
	try
	{
		return Version.getVersionForNumber((dimension - 17) >> 2);
	}
	catch ( iae)
	{
		throw "Error getVersionForNumber";
	}
}

Version.decodeVersionInformation=function( versionBits)
{
	var bestDifference = 0xffffffff;
	var bestVersion = 0;
	for (var i = 0; i < Version.VERSION_DECODE_INFO.length; i++)
	{
		var targetVersion = Version.VERSION_DECODE_INFO[i];
		// Do the version info bits match exactly? done.
		if (targetVersion == versionBits)
		{
			return this.getVersionForNumber(i + 7);
		}
		// Otherwise see if this is the closest to a real version info bit string
		// we have seen so far
		var bitsDifference = FormatInformation.numBitsDiffering(versionBits, targetVersion);
		if (bitsDifference < bestDifference)
		{
			bestVersion = i + 7;
			bestDifference = bitsDifference;
		}
	}
	// We can tolerate up to 3 bits of error since no two version info codewords will
	// differ in less than 4 bits.
	if (bestDifference <= 3)
	{
		return this.getVersionForNumber(bestVersion);
	}
	// If we didn't find a close enough match, fail
	return null;
}

function buildVersions()
{
	return new Array(new Version(1, new Array(), new ECBlocks(7, new ECB(1, 19)), new ECBlocks(10, new ECB(1, 16)), new ECBlocks(13, new ECB(1, 13)), new ECBlocks(17, new ECB(1, 9))),
	new Version(2, new Array(6, 18), new ECBlocks(10, new ECB(1, 34)), new ECBlocks(16, new ECB(1, 28)), new ECBlocks(22, new ECB(1, 22)), new ECBlocks(28, new ECB(1, 16))),
	new Version(3, new Array(6, 22), new ECBlocks(15, new ECB(1, 55)), new ECBlocks(26, new ECB(1, 44)), new ECBlocks(18, new ECB(2, 17)), new ECBlocks(22, new ECB(2, 13))),
	new Version(4, new Array(6, 26), new ECBlocks(20, new ECB(1, 80)), new ECBlocks(18, new ECB(2, 32)), new ECBlocks(26, new ECB(2, 24)), new ECBlocks(16, new ECB(4, 9))),
	new Version(5, new Array(6, 30), new ECBlocks(26, new ECB(1, 108)), new ECBlocks(24, new ECB(2, 43)), new ECBlocks(18, new ECB(2, 15), new ECB(2, 16)), new ECBlocks(22, new ECB(2, 11), new ECB(2, 12))),
	new Version(6, new Array(6, 34), new ECBlocks(18, new ECB(2, 68)), new ECBlocks(16, new ECB(4, 27)), new ECBlocks(24, new ECB(4, 19)), new ECBlocks(28, new ECB(4, 15))),
	new Version(7, new Array(6, 22, 38), new ECBlocks(20, new ECB(2, 78)), new ECBlocks(18, new ECB(4, 31)), new ECBlocks(18, new ECB(2, 14), new ECB(4, 15)), new ECBlocks(26, new ECB(4, 13), new ECB(1, 14))),
	new Version(8, new Array(6, 24, 42), new ECBlocks(24, new ECB(2, 97)), new ECBlocks(22, new ECB(2, 38), new ECB(2, 39)), new ECBlocks(22, new ECB(4, 18), new ECB(2, 19)), new ECBlocks(26, new ECB(4, 14), new ECB(2, 15))),
	new Version(9, new Array(6, 26, 46), new ECBlocks(30, new ECB(2, 116)), new ECBlocks(22, new ECB(3, 36), new ECB(2, 37)), new ECBlocks(20, new ECB(4, 16), new ECB(4, 17)), new ECBlocks(24, new ECB(4, 12), new ECB(4, 13))),
	new Version(10, new Array(6, 28, 50), new ECBlocks(18, new ECB(2, 68), new ECB(2, 69)), new ECBlocks(26, new ECB(4, 43), new ECB(1, 44)), new ECBlocks(24, new ECB(6, 19), new ECB(2, 20)), new ECBlocks(28, new ECB(6, 15), new ECB(2, 16))),
	new Version(11, new Array(6, 30, 54), new ECBlocks(20, new ECB(4, 81)), new ECBlocks(30, new ECB(1, 50), new ECB(4, 51)), new ECBlocks(28, new ECB(4, 22), new ECB(4, 23)), new ECBlocks(24, new ECB(3, 12), new ECB(8, 13))),
	new Version(12, new Array(6, 32, 58), new ECBlocks(24, new ECB(2, 92), new ECB(2, 93)), new ECBlocks(22, new ECB(6, 36), new ECB(2, 37)), new ECBlocks(26, new ECB(4, 20), new ECB(6, 21)), new ECBlocks(28, new ECB(7, 14), new ECB(4, 15))),
	new Version(13, new Array(6, 34, 62), new ECBlocks(26, new ECB(4, 107)), new ECBlocks(22, new ECB(8, 37), new ECB(1, 38)), new ECBlocks(24, new ECB(8, 20), new ECB(4, 21)), new ECBlocks(22, new ECB(12, 11), new ECB(4, 12))),
	new Version(14, new Array(6, 26, 46, 66), new ECBlocks(30, new ECB(3, 115), new ECB(1, 116)), new ECBlocks(24, new ECB(4, 40), new ECB(5, 41)), new ECBlocks(20, new ECB(11, 16), new ECB(5, 17)), new ECBlocks(24, new ECB(11, 12), new ECB(5, 13))),
	new Version(15, new Array(6, 26, 48, 70), new ECBlocks(22, new ECB(5, 87), new ECB(1, 88)), new ECBlocks(24, new ECB(5, 41), new ECB(5, 42)), new ECBlocks(30, new ECB(5, 24), new ECB(7, 25)), new ECBlocks(24, new ECB(11, 12), new ECB(7, 13))),
	new Version(16, new Array(6, 26, 50, 74), new ECBlocks(24, new ECB(5, 98), new ECB(1, 99)), new ECBlocks(28, new ECB(7, 45), new ECB(3, 46)), new ECBlocks(24, new ECB(15, 19), new ECB(2, 20)), new ECBlocks(30, new ECB(3, 15), new ECB(13, 16))),
	new Version(17, new Array(6, 30, 54, 78), new ECBlocks(28, new ECB(1, 107), new ECB(5, 108)), new ECBlocks(28, new ECB(10, 46), new ECB(1, 47)), new ECBlocks(28, new ECB(1, 22), new ECB(15, 23)), new ECBlocks(28, new ECB(2, 14), new ECB(17, 15))),
	new Version(18, new Array(6, 30, 56, 82), new ECBlocks(30, new ECB(5, 120), new ECB(1, 121)), new ECBlocks(26, new ECB(9, 43), new ECB(4, 44)), new ECBlocks(28, new ECB(17, 22), new ECB(1, 23)), new ECBlocks(28, new ECB(2, 14), new ECB(19, 15))),
	new Version(19, new Array(6, 30, 58, 86), new ECBlocks(28, new ECB(3, 113), new ECB(4, 114)), new ECBlocks(26, new ECB(3, 44), new ECB(11, 45)), new ECBlocks(26, new ECB(17, 21), new ECB(4, 22)), new ECBlocks(26, new ECB(9, 13), new ECB(16, 14))),
	new Version(20, new Array(6, 34, 62, 90), new ECBlocks(28, new ECB(3, 107), new ECB(5, 108)), new ECBlocks(26, new ECB(3, 41), new ECB(13, 42)), new ECBlocks(30, new ECB(15, 24), new ECB(5, 25)), new ECBlocks(28, new ECB(15, 15), new ECB(10, 16))),
	new Version(21, new Array(6, 28, 50, 72, 94), new ECBlocks(28, new ECB(4, 116), new ECB(4, 117)), new ECBlocks(26, new ECB(17, 42)), new ECBlocks(28, new ECB(17, 22), new ECB(6, 23)), new ECBlocks(30, new ECB(19, 16), new ECB(6, 17))),
	new Version(22, new Array(6, 26, 50, 74, 98), new ECBlocks(28, new ECB(2, 111), new ECB(7, 112)), new ECBlocks(28, new ECB(17, 46)), new ECBlocks(30, new ECB(7, 24), new ECB(16, 25)), new ECBlocks(24, new ECB(34, 13))),
	new Version(23, new Array(6, 30, 54, 74, 102), new ECBlocks(30, new ECB(4, 121), new ECB(5, 122)), new ECBlocks(28, new ECB(4, 47), new ECB(14, 48)), new ECBlocks(30, new ECB(11, 24), new ECB(14, 25)), new ECBlocks(30, new ECB(16, 15), new ECB(14, 16))),
	new Version(24, new Array(6, 28, 54, 80, 106), new ECBlocks(30, new ECB(6, 117), new ECB(4, 118)), new ECBlocks(28, new ECB(6, 45), new ECB(14, 46)), new ECBlocks(30, new ECB(11, 24), new ECB(16, 25)), new ECBlocks(30, new ECB(30, 16), new ECB(2, 17))),
	new Version(25, new Array(6, 32, 58, 84, 110), new ECBlocks(26, new ECB(8, 106), new ECB(4, 107)), new ECBlocks(28, new ECB(8, 47), new ECB(13, 48)), new ECBlocks(30, new ECB(7, 24), new ECB(22, 25)), new ECBlocks(30, new ECB(22, 15), new ECB(13, 16))),
	new Version(26, new Array(6, 30, 58, 86, 114), new ECBlocks(28, new ECB(10, 114), new ECB(2, 115)), new ECBlocks(28, new ECB(19, 46), new ECB(4, 47)), new ECBlocks(28, new ECB(28, 22), new ECB(6, 23)), new ECBlocks(30, new ECB(33, 16), new ECB(4, 17))),
	new Version(27, new Array(6, 34, 62, 90, 118), new ECBlocks(30, new ECB(8, 122), new ECB(4, 123)), new ECBlocks(28, new ECB(22, 45), new ECB(3, 46)), new ECBlocks(30, new ECB(8, 23), new ECB(26, 24)), new ECBlocks(30, new ECB(12, 15), 		new ECB(28, 16))),
	new Version(28, new Array(6, 26, 50, 74, 98, 122), new ECBlocks(30, new ECB(3, 117), new ECB(10, 118)), new ECBlocks(28, new ECB(3, 45), new ECB(23, 46)), new ECBlocks(30, new ECB(4, 24), new ECB(31, 25)), new ECBlocks(30, new ECB(11, 15), new ECB(31, 16))),
	new Version(29, new Array(6, 30, 54, 78, 102, 126), new ECBlocks(30, new ECB(7, 116), new ECB(7, 117)), new ECBlocks(28, new ECB(21, 45), new ECB(7, 46)), new ECBlocks(30, new ECB(1, 23), new ECB(37, 24)), new ECBlocks(30, new ECB(19, 15), new ECB(26, 16))),
	new Version(30, new Array(6, 26, 52, 78, 104, 130), new ECBlocks(30, new ECB(5, 115), new ECB(10, 116)), new ECBlocks(28, new ECB(19, 47), new ECB(10, 48)), new ECBlocks(30, new ECB(15, 24), new ECB(25, 25)), new ECBlocks(30, new ECB(23, 15), new ECB(25, 16))),
	new Version(31, new Array(6, 30, 56, 82, 108, 134), new ECBlocks(30, new ECB(13, 115), new ECB(3, 116)), new ECBlocks(28, new ECB(2, 46), new ECB(29, 47)), new ECBlocks(30, new ECB(42, 24), new ECB(1, 25)), new ECBlocks(30, new ECB(23, 15), new ECB(28, 16))),
	new Version(32, new Array(6, 34, 60, 86, 112, 138), new ECBlocks(30, new ECB(17, 115)), new ECBlocks(28, new ECB(10, 46), new ECB(23, 47)), new ECBlocks(30, new ECB(10, 24), new ECB(35, 25)), new ECBlocks(30, new ECB(19, 15), new ECB(35, 16))),
	new Version(33, new Array(6, 30, 58, 86, 114, 142), new ECBlocks(30, new ECB(17, 115), new ECB(1, 116)), new ECBlocks(28, new ECB(14, 46), new ECB(21, 47)), new ECBlocks(30, new ECB(29, 24), new ECB(19, 25)), new ECBlocks(30, new ECB(11, 15), new ECB(46, 16))),
	new Version(34, new Array(6, 34, 62, 90, 118, 146), new ECBlocks(30, new ECB(13, 115), new ECB(6, 116)), new ECBlocks(28, new ECB(14, 46), new ECB(23, 47)), new ECBlocks(30, new ECB(44, 24), new ECB(7, 25)), new ECBlocks(30, new ECB(59, 16), new ECB(1, 17))),
	new Version(35, new Array(6, 30, 54, 78, 102, 126, 150), new ECBlocks(30, new ECB(12, 121), new ECB(7, 122)), new ECBlocks(28, new ECB(12, 47), new ECB(26, 48)), new ECBlocks(30, new ECB(39, 24), new ECB(14, 25)),new ECBlocks(30, new ECB(22, 15), new ECB(41, 16))),
	new Version(36, new Array(6, 24, 50, 76, 102, 128, 154), new ECBlocks(30, new ECB(6, 121), new ECB(14, 122)), new ECBlocks(28, new ECB(6, 47), new ECB(34, 48)), new ECBlocks(30, new ECB(46, 24), new ECB(10, 25)), new ECBlocks(30, new ECB(2, 15), new ECB(64, 16))),
	new Version(37, new Array(6, 28, 54, 80, 106, 132, 158), new ECBlocks(30, new ECB(17, 122), new ECB(4, 123)), new ECBlocks(28, new ECB(29, 46), new ECB(14, 47)), new ECBlocks(30, new ECB(49, 24), new ECB(10, 25)), new ECBlocks(30, new ECB(24, 15), new ECB(46, 16))),
	new Version(38, new Array(6, 32, 58, 84, 110, 136, 162), new ECBlocks(30, new ECB(4, 122), new ECB(18, 123)), new ECBlocks(28, new ECB(13, 46), new ECB(32, 47)), new ECBlocks(30, new ECB(48, 24), new ECB(14, 25)), new ECBlocks(30, new ECB(42, 15), new ECB(32, 16))),
	new Version(39, new Array(6, 26, 54, 82, 110, 138, 166), new ECBlocks(30, new ECB(20, 117), new ECB(4, 118)), new ECBlocks(28, new ECB(40, 47), new ECB(7, 48)), new ECBlocks(30, new ECB(43, 24), new ECB(22, 25)), new ECBlocks(30, new ECB(10, 15), new ECB(67, 16))),
	new Version(40, new Array(6, 30, 58, 86, 114, 142, 170), new ECBlocks(30, new ECB(19, 118), new ECB(6, 119)), new ECBlocks(28, new ECB(18, 47), new ECB(31, 48)), new ECBlocks(30, new ECB(34, 24), new ECB(34, 25)), new ECBlocks(30, new ECB(20, 15), new ECB(61, 16))));
}

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


function PerspectiveTransform( a11,  a21,  a31,  a12,  a22,  a32,  a13,  a23,  a33)
{
	this.a11 = a11;
	this.a12 = a12;
	this.a13 = a13;
	this.a21 = a21;
	this.a22 = a22;
	this.a23 = a23;
	this.a31 = a31;
	this.a32 = a32;
	this.a33 = a33;
	this.transformPoints1=function( points)
		{
			var max = points.length;
			var a11 = this.a11;
			var a12 = this.a12;
			var a13 = this.a13;
			var a21 = this.a21;
			var a22 = this.a22;
			var a23 = this.a23;
			var a31 = this.a31;
			var a32 = this.a32;
			var a33 = this.a33;
			for (var i = 0; i < max; i += 2)
			{
				var x = points[i];
				var y = points[i + 1];
				var denominator = a13 * x + a23 * y + a33;
				points[i] = (a11 * x + a21 * y + a31) / denominator;
				points[i + 1] = (a12 * x + a22 * y + a32) / denominator;
			}
		}
	this. transformPoints2=function(xValues, yValues)
		{
			var n = xValues.length;
			for (var i = 0; i < n; i++)
			{
				var x = xValues[i];
				var y = yValues[i];
				var denominator = this.a13 * x + this.a23 * y + this.a33;
				xValues[i] = (this.a11 * x + this.a21 * y + this.a31) / denominator;
				yValues[i] = (this.a12 * x + this.a22 * y + this.a32) / denominator;
			}
		}

	this.buildAdjoint=function()
		{
			// Adjoint is the transpose of the cofactor matrix:
			return new PerspectiveTransform(this.a22 * this.a33 - this.a23 * this.a32, this.a23 * this.a31 - this.a21 * this.a33, this.a21 * this.a32 - this.a22 * this.a31, this.a13 * this.a32 - this.a12 * this.a33, this.a11 * this.a33 - this.a13 * this.a31, this.a12 * this.a31 - this.a11 * this.a32, this.a12 * this.a23 - this.a13 * this.a22, this.a13 * this.a21 - this.a11 * this.a23, this.a11 * this.a22 - this.a12 * this.a21);
		}
	this.times=function( other)
		{
			return new PerspectiveTransform(this.a11 * other.a11 + this.a21 * other.a12 + this.a31 * other.a13, this.a11 * other.a21 + this.a21 * other.a22 + this.a31 * other.a23, this.a11 * other.a31 + this.a21 * other.a32 + this.a31 * other.a33, this.a12 * other.a11 + this.a22 * other.a12 + this.a32 * other.a13, this.a12 * other.a21 + this.a22 * other.a22 + this.a32 * other.a23, this.a12 * other.a31 + this.a22 * other.a32 + this.a32 * other.a33, this.a13 * other.a11 + this.a23 * other.a12 +this.a33 * other.a13, this.a13 * other.a21 + this.a23 * other.a22 + this.a33 * other.a23, this.a13 * other.a31 + this.a23 * other.a32 + this.a33 * other.a33);
		}

}

PerspectiveTransform.quadrilateralToQuadrilateral=function( x0,  y0,  x1,  y1,  x2,  y2,  x3,  y3,  x0p,  y0p,  x1p,  y1p,  x2p,  y2p,  x3p,  y3p)
{

	var qToS = this.quadrilateralToSquare(x0, y0, x1, y1, x2, y2, x3, y3);
	var sToQ = this.squareToQuadrilateral(x0p, y0p, x1p, y1p, x2p, y2p, x3p, y3p);
	return sToQ.times(qToS);
}

PerspectiveTransform.squareToQuadrilateral=function( x0,  y0,  x1,  y1,  x2,  y2,  x3,  y3)
{
	 dy2 = y3 - y2;
	 dy3 = y0 - y1 + y2 - y3;
	if (dy2 == 0.0 && dy3 == 0.0)
	{
		return new PerspectiveTransform(x1 - x0, x2 - x1, x0, y1 - y0, y2 - y1, y0, 0.0, 0.0, 1.0);
	}
	else
	{
		 dx1 = x1 - x2;
		 dx2 = x3 - x2;
		 dx3 = x0 - x1 + x2 - x3;
		 dy1 = y1 - y2;
		 denominator = dx1 * dy2 - dx2 * dy1;
		 a13 = (dx3 * dy2 - dx2 * dy3) / denominator;
		 a23 = (dx1 * dy3 - dx3 * dy1) / denominator;
		return new PerspectiveTransform(x1 - x0 + a13 * x1, x3 - x0 + a23 * x3, x0, y1 - y0 + a13 * y1, y3 - y0 + a23 * y3, y0, a13, a23, 1.0);
	}
}

PerspectiveTransform.quadrilateralToSquare=function( x0,  y0,  x1,  y1,  x2,  y2,  x3,  y3)
{
	// Here, the adjoint serves as the inverse:
	return this.squareToQuadrilateral(x0, y0, x1, y1, x2, y2, x3, y3).buildAdjoint();
}

function DetectorResult(bits,  points)
{
	this.bits = bits;
	this.points = points;
}


function Detector(image)
{
	this.image=image;
	this.resultPointCallback = null;

	this.sizeOfBlackWhiteBlackRun=function( fromX,  fromY,  toX,  toY)
		{
			// Mild variant of Bresenham's algorithm;
			// see http://en.wikipedia.org/wiki/Bresenham's_line_algorithm
			var steep = Math.abs(toY - fromY) > Math.abs(toX - fromX);
			if (steep)
			{
				var temp = fromX;
				fromX = fromY;
				fromY = temp;
				temp = toX;
				toX = toY;
				toY = temp;
			}

			var dx = Math.abs(toX - fromX);
			var dy = Math.abs(toY - fromY);
			var error = - dx >> 1;
			var ystep = fromY < toY?1:- 1;
			var xstep = fromX < toX?1:- 1;
			var state = 0; // In black pixels, looking for white, first or second time
			for (var x = fromX, y = fromY; x != toX; x += xstep)
			{

				var realX = steep?y:x;
				var realY = steep?x:y;
				if (state == 1)
				{
					// In white pixels, looking for black
					if (this.image.data[realX + realY*image.width])
					{
						state++;
					}
				}
				else
				{
					if (!this.image.data[realX + realY*image.width])
					{
						state++;
					}
				}

				if (state == 3)
				{
					// Found black, white, black, and stumbled back onto white; done
					var diffX = x - fromX;
					var diffY = y - fromY;
					return  Math.sqrt( (diffX * diffX + diffY * diffY));
				}
				error += dy;
				if (error > 0)
				{
					if (y == toY)
					{
						break;
					}
					y += ystep;
					error -= dx;
				}
			}
			var diffX2 = toX - fromX;
			var diffY2 = toY - fromY;
			return  Math.sqrt( (diffX2 * diffX2 + diffY2 * diffY2));
		}


	this.sizeOfBlackWhiteBlackRunBothWays=function( fromX,  fromY,  toX,  toY)
		{

			var result = this.sizeOfBlackWhiteBlackRun(fromX, fromY, toX, toY);

			// Now count other way -- don't run off image though of course
			var scale = 1.0;
			var otherToX = fromX - (toX - fromX);
			if (otherToX < 0)
			{
				scale =  fromX /  (fromX - otherToX);
				otherToX = 0;
			}
			else if (otherToX >= image.width)
			{
				scale =  (image.width - 1 - fromX) /  (otherToX - fromX);
				otherToX = image.width - 1;
			}
			var otherToY = Math.floor (fromY - (toY - fromY) * scale);

			scale = 1.0;
			if (otherToY < 0)
			{
				scale =  fromY /  (fromY - otherToY);
				otherToY = 0;
			}
			else if (otherToY >= image.height)
			{
				scale =  (image.height - 1 - fromY) /  (otherToY - fromY);
				otherToY = image.height - 1;
			}
			otherToX = Math.floor (fromX + (otherToX - fromX) * scale);

			result += this.sizeOfBlackWhiteBlackRun(fromX, fromY, otherToX, otherToY);
			return result - 1.0; // -1 because we counted the middle pixel twice
		}



	this.calculateModuleSizeOneWay=function( pattern,  otherPattern)
		{
			var moduleSizeEst1 = this.sizeOfBlackWhiteBlackRunBothWays(Math.floor( pattern.X), Math.floor( pattern.Y), Math.floor( otherPattern.X), Math.floor(otherPattern.Y));
			var moduleSizeEst2 = this.sizeOfBlackWhiteBlackRunBothWays(Math.floor(otherPattern.X), Math.floor(otherPattern.Y), Math.floor( pattern.X), Math.floor(pattern.Y));
			if (isNaN(moduleSizeEst1))
			{
				return moduleSizeEst2 / 7.0;
			}
			if (isNaN(moduleSizeEst2))
			{
				return moduleSizeEst1 / 7.0;
			}
			// Average them, and divide by 7 since we've counted the width of 3 black modules,
			// and 1 white and 1 black module on either side. Ergo, divide sum by 14.
			return (moduleSizeEst1 + moduleSizeEst2) / 14.0;
		}


	this.calculateModuleSize=function( topLeft,  topRight,  bottomLeft)
		{
			// Take the average
			return (this.calculateModuleSizeOneWay(topLeft, topRight) + this.calculateModuleSizeOneWay(topLeft, bottomLeft)) / 2.0;
		}

	this.distance=function( pattern1,  pattern2)
	{
		xDiff = pattern1.X - pattern2.X;
		yDiff = pattern1.Y - pattern2.Y;
		return  Math.sqrt( (xDiff * xDiff + yDiff * yDiff));
	}
	this.computeDimension=function( topLeft,  topRight,  bottomLeft,  moduleSize)
		{

			var tltrCentersDimension = Math.round(this.distance(topLeft, topRight) / moduleSize);
			var tlblCentersDimension = Math.round(this.distance(topLeft, bottomLeft) / moduleSize);
			var dimension = ((tltrCentersDimension + tlblCentersDimension) >> 1) + 7;
			switch (dimension & 0x03)
			{

				// mod 4
				case 0:
					dimension++;
					break;
					// 1? do nothing

				case 2:
					dimension--;
					break;

				case 3:
					throw "Error";
				}
			return dimension;
		}

	this.findAlignmentInRegion=function( overallEstModuleSize,  estAlignmentX,  estAlignmentY,  allowanceFactor)
		{
			// Look for an alignment pattern (3 modules in size) around where it
			// should be
			var allowance = Math.floor (allowanceFactor * overallEstModuleSize);
			var alignmentAreaLeftX = Math.max(0, estAlignmentX - allowance);
			var alignmentAreaRightX = Math.min(image.width - 1, estAlignmentX + allowance);
			if (alignmentAreaRightX - alignmentAreaLeftX < overallEstModuleSize * 3)
			{
				throw "Error";
			}

			var alignmentAreaTopY = Math.max(0, estAlignmentY - allowance);
			var alignmentAreaBottomY = Math.min(image.height - 1, estAlignmentY + allowance);

			var alignmentFinder = new AlignmentPatternFinder(this.image, alignmentAreaLeftX, alignmentAreaTopY, alignmentAreaRightX - alignmentAreaLeftX, alignmentAreaBottomY - alignmentAreaTopY, overallEstModuleSize, this.resultPointCallback);
			return alignmentFinder.find();
		}

	this.createTransform=function( topLeft,  topRight,  bottomLeft, alignmentPattern, dimension)
		{
			var dimMinusThree =  dimension - 3.5;
			var bottomRightX;
			var bottomRightY;
			var sourceBottomRightX;
			var sourceBottomRightY;
			if (alignmentPattern != null)
			{
				bottomRightX = alignmentPattern.X;
				bottomRightY = alignmentPattern.Y;
				sourceBottomRightX = sourceBottomRightY = dimMinusThree - 3.0;
			}
			else
			{
				// Don't have an alignment pattern, just make up the bottom-right point
				bottomRightX = (topRight.X - topLeft.X) + bottomLeft.X;
				bottomRightY = (topRight.Y - topLeft.Y) + bottomLeft.Y;
				sourceBottomRightX = sourceBottomRightY = dimMinusThree;
			}

			var transform = PerspectiveTransform.quadrilateralToQuadrilateral(3.5, 3.5, dimMinusThree, 3.5, sourceBottomRightX, sourceBottomRightY, 3.5, dimMinusThree, topLeft.X, topLeft.Y, topRight.X, topRight.Y, bottomRightX, bottomRightY, bottomLeft.X, bottomLeft.Y);

			return transform;
		}

	this.sampleGrid=function( image,  transform,  dimension)
		{

			var sampler = GridSampler;
			return sampler.sampleGrid3(image, dimension, transform);
		}

	this.processFinderPatternInfo = function( info)
		{

			var topLeft = info.TopLeft;
			var topRight = info.TopRight;
			var bottomLeft = info.BottomLeft;

			var moduleSize = this.calculateModuleSize(topLeft, topRight, bottomLeft);
			if (moduleSize < 1.0)
			{
				throw "Error";
			}
			var dimension = this.computeDimension(topLeft, topRight, bottomLeft, moduleSize);
			var provisionalVersion = Version.getProvisionalVersionForDimension(dimension);
			var modulesBetweenFPCenters = provisionalVersion.DimensionForVersion - 7;

			var alignmentPattern = null;
			// Anything above version 1 has an alignment pattern
			if (provisionalVersion.AlignmentPatternCenters.length > 0)
			{

				// Guess where a "bottom right" finder pattern would have been
				var bottomRightX = topRight.X - topLeft.X + bottomLeft.X;
				var bottomRightY = topRight.Y - topLeft.Y + bottomLeft.Y;

				// Estimate that alignment pattern is closer by 3 modules
				// from "bottom right" to known top left location
				var correctionToTopLeft = 1.0 - 3.0 /  modulesBetweenFPCenters;
				var estAlignmentX = Math.floor (topLeft.X + correctionToTopLeft * (bottomRightX - topLeft.X));
				var estAlignmentY = Math.floor (topLeft.Y + correctionToTopLeft * (bottomRightY - topLeft.Y));

				// Kind of arbitrary -- expand search radius before giving up
				for (var i = 4; i <= 16; i <<= 1)
				{
					//try
					//{
						alignmentPattern = this.findAlignmentInRegion(moduleSize, estAlignmentX, estAlignmentY,  i);
						break;
					//}
					//catch (re)
					//{
						// try next round
					//}
				}
				// If we didn't find alignment pattern... well try anyway without it
			}

			var transform = this.createTransform(topLeft, topRight, bottomLeft, alignmentPattern, dimension);

			var bits = this.sampleGrid(this.image, transform, dimension);

			var points;
			if (alignmentPattern == null)
			{
				points = new Array(bottomLeft, topLeft, topRight);
			}
			else
			{
				points = new Array(bottomLeft, topLeft, topRight, alignmentPattern);
			}
			return new DetectorResult(bits, points);
		}



	this.detect=function()
	{
		var info =  new FinderPatternFinder().findFinderPattern(this.image);

		return this.processFinderPatternInfo(info);
	}
}

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


var FORMAT_INFO_MASK_QR = 0x5412;
var FORMAT_INFO_DECODE_LOOKUP = new Array(new Array(0x5412, 0x00), new Array(0x5125, 0x01), new Array(0x5E7C, 0x02), new Array(0x5B4B, 0x03), new Array(0x45F9, 0x04), new Array(0x40CE, 0x05), new Array(0x4F97, 0x06), new Array(0x4AA0, 0x07), new Array(0x77C4, 0x08), new Array(0x72F3, 0x09), new Array(0x7DAA, 0x0A), new Array(0x789D, 0x0B), new Array(0x662F, 0x0C), new Array(0x6318, 0x0D), new Array(0x6C41, 0x0E), new Array(0x6976, 0x0F), new Array(0x1689, 0x10), new Array(0x13BE, 0x11), new Array(0x1CE7, 0x12), new Array(0x19D0, 0x13), new Array(0x0762, 0x14), new Array(0x0255, 0x15), new Array(0x0D0C, 0x16), new Array(0x083B, 0x17), new Array(0x355F, 0x18), new Array(0x3068, 0x19), new Array(0x3F31, 0x1A), new Array(0x3A06, 0x1B), new Array(0x24B4, 0x1C), new Array(0x2183, 0x1D), new Array(0x2EDA, 0x1E), new Array(0x2BED, 0x1F));
var BITS_SET_IN_HALF_BYTE = new Array(0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4);


function FormatInformation(formatInfo)
{
	this.errorCorrectionLevel = ErrorCorrectionLevel.forBits((formatInfo >> 3) & 0x03);
	this.dataMask =  (formatInfo & 0x07);

	Object.defineProperty(this,"ErrorCorrectionLevel", { get: function()
	{
		return this.errorCorrectionLevel;
	}});
	Object.defineProperty(this,"DataMask", { get: function()
	{
		return this.dataMask;
	}});
	this.GetHashCode=function()
	{
		return (this.errorCorrectionLevel.ordinal() << 3) |  dataMask;
	}
	this.Equals=function( o)
	{
		var other =  o;
		return this.errorCorrectionLevel == other.errorCorrectionLevel && this.dataMask == other.dataMask;
	}
}

FormatInformation.numBitsDiffering=function( a,  b)
{
	a ^= b; // a now has a 1 bit exactly where its bit differs with b's
	// Count bits set quickly with a series of lookups:
	return BITS_SET_IN_HALF_BYTE[a & 0x0F] + BITS_SET_IN_HALF_BYTE[(URShift(a, 4) & 0x0F)] + BITS_SET_IN_HALF_BYTE[(URShift(a, 8) & 0x0F)] + BITS_SET_IN_HALF_BYTE[(URShift(a, 12) & 0x0F)] + BITS_SET_IN_HALF_BYTE[(URShift(a, 16) & 0x0F)] + BITS_SET_IN_HALF_BYTE[(URShift(a, 20) & 0x0F)] + BITS_SET_IN_HALF_BYTE[(URShift(a, 24) & 0x0F)] + BITS_SET_IN_HALF_BYTE[(URShift(a, 28) & 0x0F)];
}

FormatInformation.decodeFormatInformation=function( maskedFormatInfo)
{
	var formatInfo = FormatInformation.doDecodeFormatInformation(maskedFormatInfo);
	if (formatInfo != null)
	{
		return formatInfo;
	}
	// Should return null, but, some QR codes apparently
	// do not mask this info. Try again by actually masking the pattern
	// first
	return FormatInformation.doDecodeFormatInformation(maskedFormatInfo ^ FORMAT_INFO_MASK_QR);
}
FormatInformation.doDecodeFormatInformation=function( maskedFormatInfo)
{
	// Find the int in FORMAT_INFO_DECODE_LOOKUP with fewest bits differing
	var bestDifference = 0xffffffff;
	var bestFormatInfo = 0;
	for (var i = 0; i < FORMAT_INFO_DECODE_LOOKUP.length; i++)
	{
		var decodeInfo = FORMAT_INFO_DECODE_LOOKUP[i];
		var targetInfo = decodeInfo[0];
		if (targetInfo == maskedFormatInfo)
		{
			// Found an exact match
			return new FormatInformation(decodeInfo[1]);
		}
		var bitsDifference = this.numBitsDiffering(maskedFormatInfo, targetInfo);
		if (bitsDifference < bestDifference)
		{
			bestFormatInfo = decodeInfo[1];
			bestDifference = bitsDifference;
		}
	}
	// Hamming distance of the 32 masked codes is 7, by construction, so <= 3 bits
	// differing means we found a match
	if (bestDifference <= 3)
	{
		return new FormatInformation(bestFormatInfo);
	}
	return null;
}



/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


function ErrorCorrectionLevel(ordinal,  bits, name)
{
	this.ordinal_Renamed_Field = ordinal;
	this.bits = bits;
	this.name = name;
	Object.defineProperty(this,"Bits", { get: function()
	{
		return this.bits;
	}});
	Object.defineProperty(this,"Name", { get: function()
	{
		return this.name;
	}});
	this.ordinal=function()
	{
		return this.ordinal_Renamed_Field;
	}
}

ErrorCorrectionLevel.forBits=function( bits)
{
	if (bits < 0 || bits >= FOR_BITS.length)
	{
		throw "ArgumentException";
	}
	return FOR_BITS[bits];
}

var FOR_BITS = new Array(
	new ErrorCorrectionLevel(1, 0x00, "M"),
	new ErrorCorrectionLevel(0, 0x01, "L"),
	new ErrorCorrectionLevel(3, 0x02, "H"),
	new ErrorCorrectionLevel(2, 0x03, "Q")
);

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


function BitMatrix( width,  height)
{
	if(!height)
		height=width;
	if (width < 1 || height < 1)
	{
		throw "Both dimensions must be greater than 0";
	}
	this.width = width;
	this.height = height;
	var rowSize = width >> 5;
	if ((width & 0x1f) != 0)
	{
		rowSize++;
	}
	this.rowSize = rowSize;
	this.bits = new Array(rowSize * height);
	for(var i=0;i<this.bits.length;i++)
		this.bits[i]=0;

	Object.defineProperty(this,"Width", { get: function()
	{
		return this.width;
	}});
	Object.defineProperty(this,"Height", { get: function()
	{
		return this.height;
	}});
	Object.defineProperty(this,"Dimension", { get: function()
	{
		if (this.width != this.height)
		{
			throw "Can't call getDimension() on a non-square matrix";
		}
		return this.width;
	}});

	this.get_Renamed=function( x,  y)
		{
			var offset = y * this.rowSize + (x >> 5);
			return ((URShift(this.bits[offset], (x & 0x1f))) & 1) != 0;
		}
	this.set_Renamed=function( x,  y)
		{
			var offset = y * this.rowSize + (x >> 5);
			this.bits[offset] |= 1 << (x & 0x1f);
		}
	this.flip=function( x,  y)
		{
			var offset = y * this.rowSize + (x >> 5);
			this.bits[offset] ^= 1 << (x & 0x1f);
		}
	this.clear=function()
		{
			var max = this.bits.length;
			for (var i = 0; i < max; i++)
			{
				this.bits[i] = 0;
			}
		}
	this.setRegion=function( left,  top,  width,  height)
		{
			if (top < 0 || left < 0)
			{
				throw "Left and top must be nonnegative";
			}
			if (height < 1 || width < 1)
			{
				throw "Height and width must be at least 1";
			}
			var right = left + width;
			var bottom = top + height;
			if (bottom > this.height || right > this.width)
			{
				throw "The region must fit inside the matrix";
			}
			for (var y = top; y < bottom; y++)
			{
				var offset = y * this.rowSize;
				for (var x = left; x < right; x++)
				{
					this.bits[offset + (x >> 5)] |= 1 << (x & 0x1f);
				}
			}
		}
}

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


function DataBlock(numDataCodewords,  codewords)
{
	this.numDataCodewords = numDataCodewords;
	this.codewords = codewords;

	Object.defineProperty(this,"NumDataCodewords", { get: function()
	{
		return this.numDataCodewords;
	}});
	Object.defineProperty(this,"Codewords", { get: function()
	{
		return this.codewords;
	}});
}

DataBlock.getDataBlocks=function(rawCodewords,  version,  ecLevel)
{

	if (rawCodewords.length != version.TotalCodewords)
	{
		throw "ArgumentException";
	}

	// Figure out the number and size of data blocks used by this version and
	// error correction level
	var ecBlocks = version.getECBlocksForLevel(ecLevel);

	// First count the total number of data blocks
	var totalBlocks = 0;
	var ecBlockArray = ecBlocks.getECBlocks();
	for (var i = 0; i < ecBlockArray.length; i++)
	{
		totalBlocks += ecBlockArray[i].Count;
	}

	// Now establish DataBlocks of the appropriate size and number of data codewords
	var result = new Array(totalBlocks);
	var numResultBlocks = 0;
	for (var j = 0; j < ecBlockArray.length; j++)
	{
		var ecBlock = ecBlockArray[j];
		for (var i = 0; i < ecBlock.Count; i++)
		{
			var numDataCodewords = ecBlock.DataCodewords;
			var numBlockCodewords = ecBlocks.ECCodewordsPerBlock + numDataCodewords;
			result[numResultBlocks++] = new DataBlock(numDataCodewords, new Array(numBlockCodewords));
		}
	}

	// All blocks have the same amount of data, except that the last n
	// (where n may be 0) have 1 more byte. Figure out where these start.
	var shorterBlocksTotalCodewords = result[0].codewords.length;
	var longerBlocksStartAt = result.length - 1;
	while (longerBlocksStartAt >= 0)
	{
		var numCodewords = result[longerBlocksStartAt].codewords.length;
		if (numCodewords == shorterBlocksTotalCodewords)
		{
			break;
		}
		longerBlocksStartAt--;
	}
	longerBlocksStartAt++;

	var shorterBlocksNumDataCodewords = shorterBlocksTotalCodewords - ecBlocks.ECCodewordsPerBlock;
	// The last elements of result may be 1 element longer;
	// first fill out as many elements as all of them have
	var rawCodewordsOffset = 0;
	for (var i = 0; i < shorterBlocksNumDataCodewords; i++)
	{
		for (var j = 0; j < numResultBlocks; j++)
		{
			result[j].codewords[i] = rawCodewords[rawCodewordsOffset++];
		}
	}
	// Fill out the last data block in the longer ones
	for (var j = longerBlocksStartAt; j < numResultBlocks; j++)
	{
		result[j].codewords[shorterBlocksNumDataCodewords] = rawCodewords[rawCodewordsOffset++];
	}
	// Now add in error correction blocks
	var max = result[0].codewords.length;
	for (var i = shorterBlocksNumDataCodewords; i < max; i++)
	{
		for (var j = 0; j < numResultBlocks; j++)
		{
			var iOffset = j < longerBlocksStartAt?i:i + 1;
			result[j].codewords[iOffset] = rawCodewords[rawCodewordsOffset++];
		}
	}
	return result;
}

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


function BitMatrixParser(bitMatrix)
{
	var dimension = bitMatrix.Dimension;
	if (dimension < 21 || (dimension & 0x03) != 1)
	{
		throw "Error BitMatrixParser";
	}
	this.bitMatrix = bitMatrix;
	this.parsedVersion = null;
	this.parsedFormatInfo = null;

	this.copyBit=function( i,  j,  versionBits)
	{
		return this.bitMatrix.get_Renamed(i, j)?(versionBits << 1) | 0x1:versionBits << 1;
	}

	this.readFormatInformation=function()
	{
			if (this.parsedFormatInfo != null)
			{
				return this.parsedFormatInfo;
			}

			// Read top-left format info bits
			var formatInfoBits = 0;
			for (var i = 0; i < 6; i++)
			{
				formatInfoBits = this.copyBit(i, 8, formatInfoBits);
			}
			// .. and skip a bit in the timing pattern ...
			formatInfoBits = this.copyBit(7, 8, formatInfoBits);
			formatInfoBits = this.copyBit(8, 8, formatInfoBits);
			formatInfoBits = this.copyBit(8, 7, formatInfoBits);
			// .. and skip a bit in the timing pattern ...
			for (var j = 5; j >= 0; j--)
			{
				formatInfoBits = this.copyBit(8, j, formatInfoBits);
			}

			this.parsedFormatInfo = FormatInformation.decodeFormatInformation(formatInfoBits);
			if (this.parsedFormatInfo != null)
			{
				return this.parsedFormatInfo;
			}

			// Hmm, failed. Try the top-right/bottom-left pattern
			var dimension = this.bitMatrix.Dimension;
			formatInfoBits = 0;
			var iMin = dimension - 8;
			for (var i = dimension - 1; i >= iMin; i--)
			{
				formatInfoBits = this.copyBit(i, 8, formatInfoBits);
			}
			for (var j = dimension - 7; j < dimension; j++)
			{
				formatInfoBits = this.copyBit(8, j, formatInfoBits);
			}

			this.parsedFormatInfo = FormatInformation.decodeFormatInformation(formatInfoBits);
			if (this.parsedFormatInfo != null)
			{
				return this.parsedFormatInfo;
			}
			throw "Error readFormatInformation";
	}
	this.readVersion=function()
		{

			if (this.parsedVersion != null)
			{
				return this.parsedVersion;
			}

			var dimension = this.bitMatrix.Dimension;

			var provisionalVersion = (dimension - 17) >> 2;
			if (provisionalVersion <= 6)
			{
				return Version.getVersionForNumber(provisionalVersion);
			}

			// Read top-right version info: 3 wide by 6 tall
			var versionBits = 0;
			var ijMin = dimension - 11;
			for (var j = 5; j >= 0; j--)
			{
				for (var i = dimension - 9; i >= ijMin; i--)
				{
					versionBits = this.copyBit(i, j, versionBits);
				}
			}

			this.parsedVersion = Version.decodeVersionInformation(versionBits);
			if (this.parsedVersion != null && this.parsedVersion.DimensionForVersion == dimension)
			{
				return this.parsedVersion;
			}

			// Hmm, failed. Try bottom left: 6 wide by 3 tall
			versionBits = 0;
			for (var i = 5; i >= 0; i--)
			{
				for (var j = dimension - 9; j >= ijMin; j--)
				{
					versionBits = this.copyBit(i, j, versionBits);
				}
			}

			this.parsedVersion = Version.decodeVersionInformation(versionBits);
			if (this.parsedVersion != null && this.parsedVersion.DimensionForVersion == dimension)
			{
				return this.parsedVersion;
			}
			throw "Error readVersion";
		}
	this.readCodewords=function()
		{

			var formatInfo = this.readFormatInformation();
			var version = this.readVersion();

			// Get the data mask for the format used in this QR Code. This will exclude
			// some bits from reading as we wind through the bit matrix.
			var dataMask = DataMask.forReference( formatInfo.DataMask);
			var dimension = this.bitMatrix.Dimension;
			dataMask.unmaskBitMatrix(this.bitMatrix, dimension);

			var functionPattern = version.buildFunctionPattern();

			var readingUp = true;
			var result = new Array(version.TotalCodewords);
			var resultOffset = 0;
			var currentByte = 0;
			var bitsRead = 0;
			// Read columns in pairs, from right to left
			for (var j = dimension - 1; j > 0; j -= 2)
			{
				if (j == 6)
				{
					// Skip whole column with vertical alignment pattern;
					// saves time and makes the other code proceed more cleanly
					j--;
				}
				// Read alternatingly from bottom to top then top to bottom
				for (var count = 0; count < dimension; count++)
				{
					var i = readingUp?dimension - 1 - count:count;
					for (var col = 0; col < 2; col++)
					{
						// Ignore bits covered by the function pattern
						if (!functionPattern.get_Renamed(j - col, i))
						{
							// Read a bit
							bitsRead++;
							currentByte <<= 1;
							if (this.bitMatrix.get_Renamed(j - col, i))
							{
								currentByte |= 1;
							}
							// If we've made a whole byte, save it off
							if (bitsRead == 8)
							{
								result[resultOffset++] =  currentByte;
								bitsRead = 0;
								currentByte = 0;
							}
						}
					}
				}
				readingUp ^= true; // readingUp = !readingUp; // switch directions
			}
			if (resultOffset != version.TotalCodewords)
			{
				throw "Error readCodewords";
			}
			return result;
		}
}

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


var DataMask = {};

DataMask.forReference = function(reference)
{
	if (reference < 0 || reference > 7)
	{
		throw "System.ArgumentException";
	}
	return DataMask.DATA_MASKS[reference];
}

function DataMask000()
{
	this.unmaskBitMatrix=function(bits,  dimension)
	{
		for (var i = 0; i < dimension; i++)
		{
			for (var j = 0; j < dimension; j++)
			{
				if (this.isMasked(i, j))
				{
					bits.flip(j, i);
				}
			}
		}
	}
	this.isMasked=function( i,  j)
	{
		return ((i + j) & 0x01) == 0;
	}
}

function DataMask001()
{
	this.unmaskBitMatrix=function(bits,  dimension)
	{
		for (var i = 0; i < dimension; i++)
		{
			for (var j = 0; j < dimension; j++)
			{
				if (this.isMasked(i, j))
				{
					bits.flip(j, i);
				}
			}
		}
	}
	this.isMasked=function( i,  j)
	{
		return (i & 0x01) == 0;
	}
}

function DataMask010()
{
	this.unmaskBitMatrix=function(bits,  dimension)
	{
		for (var i = 0; i < dimension; i++)
		{
			for (var j = 0; j < dimension; j++)
			{
				if (this.isMasked(i, j))
				{
					bits.flip(j, i);
				}
			}
		}
	}
	this.isMasked=function( i,  j)
	{
		return j % 3 == 0;
	}
}

function DataMask011()
{
	this.unmaskBitMatrix=function(bits,  dimension)
	{
		for (var i = 0; i < dimension; i++)
		{
			for (var j = 0; j < dimension; j++)
			{
				if (this.isMasked(i, j))
				{
					bits.flip(j, i);
				}
			}
		}
	}
	this.isMasked=function( i,  j)
	{
		return (i + j) % 3 == 0;
	}
}

function DataMask100()
{
	this.unmaskBitMatrix=function(bits,  dimension)
	{
		for (var i = 0; i < dimension; i++)
		{
			for (var j = 0; j < dimension; j++)
			{
				if (this.isMasked(i, j))
				{
					bits.flip(j, i);
				}
			}
		}
	}
	this.isMasked=function( i,  j)
	{
		return (((URShift(i, 1)) + (j / 3)) & 0x01) == 0;
	}
}

function DataMask101()
{
	this.unmaskBitMatrix=function(bits,  dimension)
	{
		for (var i = 0; i < dimension; i++)
		{
			for (var j = 0; j < dimension; j++)
			{
				if (this.isMasked(i, j))
				{
					bits.flip(j, i);
				}
			}
		}
	}
	this.isMasked=function( i,  j)
	{
		var temp = i * j;
		return (temp & 0x01) + (temp % 3) == 0;
	}
}

function DataMask110()
{
	this.unmaskBitMatrix=function(bits,  dimension)
	{
		for (var i = 0; i < dimension; i++)
		{
			for (var j = 0; j < dimension; j++)
			{
				if (this.isMasked(i, j))
				{
					bits.flip(j, i);
				}
			}
		}
	}
	this.isMasked=function( i,  j)
	{
		var temp = i * j;
		return (((temp & 0x01) + (temp % 3)) & 0x01) == 0;
	}
}
function DataMask111()
{
	this.unmaskBitMatrix=function(bits,  dimension)
	{
		for (var i = 0; i < dimension; i++)
		{
			for (var j = 0; j < dimension; j++)
			{
				if (this.isMasked(i, j))
				{
					bits.flip(j, i);
				}
			}
		}
	}
	this.isMasked=function( i,  j)
	{
		return ((((i + j) & 0x01) + ((i * j) % 3)) & 0x01) == 0;
	}
}

DataMask.DATA_MASKS = new Array(new DataMask000(), new DataMask001(), new DataMask010(), new DataMask011(), new DataMask100(), new DataMask101(), new DataMask110(), new DataMask111());


/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


function ReedSolomonDecoder(field)
{
	this.field = field;
	this.decode=function(received,  twoS)
	{
			var poly = new GF256Poly(this.field, received);
			var syndromeCoefficients = new Array(twoS);
			for(var i=0;i<syndromeCoefficients.length;i++)syndromeCoefficients[i]=0;
			var dataMatrix = false;//this.field.Equals(GF256.DATA_MATRIX_FIELD);
			var noError = true;
			for (var i = 0; i < twoS; i++)
			{
				// Thanks to sanfordsquires for this fix:
				var eval = poly.evaluateAt(this.field.exp(dataMatrix?i + 1:i));
				syndromeCoefficients[syndromeCoefficients.length - 1 - i] = eval;
				if (eval != 0)
				{
					noError = false;
				}
			}
			if (noError)
			{
				return ;
			}
			var syndrome = new GF256Poly(this.field, syndromeCoefficients);
			var sigmaOmega = this.runEuclideanAlgorithm(this.field.buildMonomial(twoS, 1), syndrome, twoS);
			var sigma = sigmaOmega[0];
			var omega = sigmaOmega[1];
			var errorLocations = this.findErrorLocations(sigma);
			var errorMagnitudes = this.findErrorMagnitudes(omega, errorLocations, dataMatrix);
			for (var i = 0; i < errorLocations.length; i++)
			{
				var position = received.length - 1 - this.field.log(errorLocations[i]);
				if (position < 0)
				{
					throw "ReedSolomonException Bad error location";
				}
				received[position] = GF256.addOrSubtract(received[position], errorMagnitudes[i]);
			}
	}

	this.runEuclideanAlgorithm=function( a,  b,  R)
		{
			// Assume a's degree is >= b's
			if (a.Degree < b.Degree)
			{
				var temp = a;
				a = b;
				b = temp;
			}

			var rLast = a;
			var r = b;
			var sLast = this.field.One;
			var s = this.field.Zero;
			var tLast = this.field.Zero;
			var t = this.field.One;

			// Run Euclidean algorithm until r's degree is less than R/2
			while (r.Degree >= Math.floor(R / 2))
			{
				var rLastLast = rLast;
				var sLastLast = sLast;
				var tLastLast = tLast;
				rLast = r;
				sLast = s;
				tLast = t;

				// Divide rLastLast by rLast, with quotient in q and remainder in r
				if (rLast.Zero)
				{
					// Oops, Euclidean algorithm already terminated?
					throw "r_{i-1} was zero";
				}
				r = rLastLast;
				var q = this.field.Zero;
				var denominatorLeadingTerm = rLast.getCoefficient(rLast.Degree);
				var dltInverse = this.field.inverse(denominatorLeadingTerm);
				while (r.Degree >= rLast.Degree && !r.Zero)
				{
					var degreeDiff = r.Degree - rLast.Degree;
					var scale = this.field.multiply(r.getCoefficient(r.Degree), dltInverse);
					q = q.addOrSubtract(this.field.buildMonomial(degreeDiff, scale));
					r = r.addOrSubtract(rLast.multiplyByMonomial(degreeDiff, scale));
					//r.EXE();
				}

				s = q.multiply1(sLast).addOrSubtract(sLastLast);
				t = q.multiply1(tLast).addOrSubtract(tLastLast);
			}

			var sigmaTildeAtZero = t.getCoefficient(0);
			if (sigmaTildeAtZero == 0)
			{
				throw "ReedSolomonException sigmaTilde(0) was zero";
			}

			var inverse = this.field.inverse(sigmaTildeAtZero);
			var sigma = t.multiply2(inverse);
			var omega = r.multiply2(inverse);
			return new Array(sigma, omega);
		}
	this.findErrorLocations=function( errorLocator)
		{
			// This is a direct application of Chien's search
			var numErrors = errorLocator.Degree;
			if (numErrors == 1)
			{
				// shortcut
				return new Array(errorLocator.getCoefficient(1));
			}
			var result = new Array(numErrors);
			var e = 0;
			for (var i = 1; i < 256 && e < numErrors; i++)
			{
				if (errorLocator.evaluateAt(i) == 0)
				{
					result[e] = this.field.inverse(i);
					e++;
				}
			}
			if (e != numErrors)
			{
				throw "Error locator degree does not match number of roots";
			}
			return result;
		}
	this.findErrorMagnitudes=function( errorEvaluator,  errorLocations,  dataMatrix)
		{
			// This is directly applying Forney's Formula
			var s = errorLocations.length;
			var result = new Array(s);
			for (var i = 0; i < s; i++)
			{
				var xiInverse = this.field.inverse(errorLocations[i]);
				var denominator = 1;
				for (var j = 0; j < s; j++)
				{
					if (i != j)
					{
						denominator = this.field.multiply(denominator, GF256.addOrSubtract(1, this.field.multiply(errorLocations[j], xiInverse)));
					}
				}
				result[i] = this.field.multiply(errorEvaluator.evaluateAt(xiInverse), this.field.inverse(denominator));
				// Thanks to sanfordsquires for this fix:
				if (dataMatrix)
				{
					result[i] = this.field.multiply(result[i], xiInverse);
				}
			}
			return result;
		}
}

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


function GF256Poly(field,  coefficients)
{
	if (coefficients == null || coefficients.length == 0)
	{
		throw "System.ArgumentException";
	}
	this.field = field;
	var coefficientsLength = coefficients.length;
	if (coefficientsLength > 1 && coefficients[0] == 0)
	{
		// Leading term must be non-zero for anything except the constant polynomial "0"
		var firstNonZero = 1;
		while (firstNonZero < coefficientsLength && coefficients[firstNonZero] == 0)
		{
			firstNonZero++;
		}
		if (firstNonZero == coefficientsLength)
		{
			this.coefficients = field.Zero.coefficients;
		}
		else
		{
			this.coefficients = new Array(coefficientsLength - firstNonZero);
			for(var i=0;i<this.coefficients.length;i++)this.coefficients[i]=0;
			//Array.Copy(coefficients, firstNonZero, this.coefficients, 0, this.coefficients.length);
			for(var ci=0;ci<this.coefficients.length;ci++)this.coefficients[ci]=coefficients[firstNonZero+ci];
		}
	}
	else
	{
		this.coefficients = coefficients;
	}

	Object.defineProperty(this,"Zero", { get: function()
	{
		return this.coefficients[0] == 0;
	}});
	Object.defineProperty(this,"Degree", { get: function()
	{
		return this.coefficients.length - 1;
	}});
	Object.defineProperty(this,"Coefficients", { get: function()
	{
		return this.coefficients;
	}});

	this.getCoefficient=function( degree)
	{
		return this.coefficients[this.coefficients.length - 1 - degree];
	}

	this.evaluateAt=function( a)
	{
		if (a == 0)
		{
			// Just return the x^0 coefficient
			return this.getCoefficient(0);
		}
		var size = this.coefficients.length;
		if (a == 1)
		{
			// Just the sum of the coefficients
			var result = 0;
			for (var i = 0; i < size; i++)
			{
				result = GF256.addOrSubtract(result, this.coefficients[i]);
			}
			return result;
		}
		var result2 = this.coefficients[0];
		for (var i = 1; i < size; i++)
		{
			result2 = GF256.addOrSubtract(this.field.multiply(a, result2), this.coefficients[i]);
		}
		return result2;
	}

	this.addOrSubtract=function( other)
		{
			if (this.field != other.field)
			{
				throw "GF256Polys do not have same GF256 field";
			}
			if (this.Zero)
			{
				return other;
			}
			if (other.Zero)
			{
				return this;
			}

			var smallerCoefficients = this.coefficients;
			var largerCoefficients = other.coefficients;
			if (smallerCoefficients.length > largerCoefficients.length)
			{
				var temp = smallerCoefficients;
				smallerCoefficients = largerCoefficients;
				largerCoefficients = temp;
			}
			var sumDiff = new Array(largerCoefficients.length);
			var lengthDiff = largerCoefficients.length - smallerCoefficients.length;
			// Copy high-order terms only found in higher-degree polynomial's coefficients
			//Array.Copy(largerCoefficients, 0, sumDiff, 0, lengthDiff);
			for(var ci=0;ci<lengthDiff;ci++)sumDiff[ci]=largerCoefficients[ci];

			for (var i = lengthDiff; i < largerCoefficients.length; i++)
			{
				sumDiff[i] = GF256.addOrSubtract(smallerCoefficients[i - lengthDiff], largerCoefficients[i]);
			}

			return new GF256Poly(field, sumDiff);
	}
	this.multiply1=function( other)
		{
			if (this.field!=other.field)
			{
				throw "GF256Polys do not have same GF256 field";
			}
			if (this.Zero || other.Zero)
			{
				return this.field.Zero;
			}
			var aCoefficients = this.coefficients;
			var aLength = aCoefficients.length;
			var bCoefficients = other.coefficients;
			var bLength = bCoefficients.length;
			var product = new Array(aLength + bLength - 1);
			for (var i = 0; i < aLength; i++)
			{
				var aCoeff = aCoefficients[i];
				for (var j = 0; j < bLength; j++)
				{
					product[i + j] = GF256.addOrSubtract(product[i + j], this.field.multiply(aCoeff, bCoefficients[j]));
				}
			}
			return new GF256Poly(this.field, product);
		}
	this.multiply2=function( scalar)
		{
			if (scalar == 0)
			{
				return this.field.Zero;
			}
			if (scalar == 1)
			{
				return this;
			}
			var size = this.coefficients.length;
			var product = new Array(size);
			for (var i = 0; i < size; i++)
			{
				product[i] = this.field.multiply(this.coefficients[i], scalar);
			}
			return new GF256Poly(this.field, product);
		}
	this.multiplyByMonomial=function( degree,  coefficient)
		{
			if (degree < 0)
			{
				throw "System.ArgumentException";
			}
			if (coefficient == 0)
			{
				return this.field.Zero;
			}
			var size = this.coefficients.length;
			var product = new Array(size + degree);
			for(var i=0;i<product.length;i++)product[i]=0;
			for (var i = 0; i < size; i++)
			{
				product[i] = this.field.multiply(this.coefficients[i], coefficient);
			}
			return new GF256Poly(this.field, product);
		}
	this.divide=function( other)
		{
			if (this.field!=other.field)
			{
				throw "GF256Polys do not have same GF256 field";
			}
			if (other.Zero)
			{
				throw "Divide by 0";
			}

			var quotient = this.field.Zero;
			var remainder = this;

			var denominatorLeadingTerm = other.getCoefficient(other.Degree);
			var inverseDenominatorLeadingTerm = this.field.inverse(denominatorLeadingTerm);

			while (remainder.Degree >= other.Degree && !remainder.Zero)
			{
				var degreeDifference = remainder.Degree - other.Degree;
				var scale = this.field.multiply(remainder.getCoefficient(remainder.Degree), inverseDenominatorLeadingTerm);
				var term = other.multiplyByMonomial(degreeDifference, scale);
				var iterationQuotient = this.field.buildMonomial(degreeDifference, scale);
				quotient = quotient.addOrSubtract(iterationQuotient);
				remainder = remainder.addOrSubtract(term);
			}

			return new Array(quotient, remainder);
		}
}

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


function GF256( primitive)
{
	this.expTable = new Array(256);
	this.logTable = new Array(256);
	var x = 1;
	for (var i = 0; i < 256; i++)
	{
		this.expTable[i] = x;
		x <<= 1; // x = x * 2; we're assuming the generator alpha is 2
		if (x >= 0x100)
		{
			x ^= primitive;
		}
	}
	for (var i = 0; i < 255; i++)
	{
		this.logTable[this.expTable[i]] = i;
	}
	// logTable[0] == 0 but this should never be used
	var at0=new Array(1);at0[0]=0;
	this.zero = new GF256Poly(this, new Array(at0));
	var at1=new Array(1);at1[0]=1;
	this.one = new GF256Poly(this, new Array(at1));

	Object.defineProperty(this,"Zero", { get: function()
	{
		return this.zero;
	}});
	Object.defineProperty(this,"One", { get: function()
	{
		return this.one;
	}});
	this.buildMonomial=function( degree,  coefficient)
		{
			if (degree < 0)
			{
				throw "System.ArgumentException";
			}
			if (coefficient == 0)
			{
				return zero;
			}
			var coefficients = new Array(degree + 1);
			for(var i=0;i<coefficients.length;i++)coefficients[i]=0;
			coefficients[0] = coefficient;
			return new GF256Poly(this, coefficients);
		}
	this.exp=function( a)
		{
			return this.expTable[a];
		}
	this.log=function( a)
		{
			if (a == 0)
			{
				throw "System.ArgumentException";
			}
			return this.logTable[a];
		}
	this.inverse=function( a)
		{
			if (a == 0)
			{
				throw "System.ArithmeticException";
			}
			return this.expTable[255 - this.logTable[a]];
		}
	this.multiply=function( a,  b)
		{
			if (a == 0 || b == 0)
			{
				return 0;
			}
			if (a == 1)
			{
				return b;
			}
			if (b == 1)
			{
				return a;
			}
			return this.expTable[(this.logTable[a] + this.logTable[b]) % 255];
		}
}

GF256.QR_CODE_FIELD = new GF256(0x011D);
GF256.DATA_MATRIX_FIELD = new GF256(0x012D);

GF256.addOrSubtract=function( a,  b)
{
	return a ^ b;
}

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


var Decoder={};
Decoder.rsDecoder = new ReedSolomonDecoder(GF256.QR_CODE_FIELD);

Decoder.correctErrors=function( codewordBytes,  numDataCodewords)
{
	var numCodewords = codewordBytes.length;
	// First read into an array of ints
	var codewordsInts = new Array(numCodewords);
	for (var i = 0; i < numCodewords; i++)
	{
		codewordsInts[i] = codewordBytes[i] & 0xFF;
	}
	var numECCodewords = codewordBytes.length - numDataCodewords;
	try
	{
		Decoder.rsDecoder.decode(codewordsInts, numECCodewords);
		//var corrector = new ReedSolomon(codewordsInts, numECCodewords);
		//corrector.correct();
	}
	catch ( rse)
	{
		throw rse;
	}
	// Copy back into array of bytes -- only need to worry about the bytes that were data
	// We don't care about errors in the error-correction codewords
	for (var i = 0; i < numDataCodewords; i++)
	{
		codewordBytes[i] =  codewordsInts[i];
	}
}

Decoder.decode=function(bits)
{
	var parser = new BitMatrixParser(bits);
	var version = parser.readVersion();
	var ecLevel = parser.readFormatInformation().ErrorCorrectionLevel;

	// Read codewords
	var codewords = parser.readCodewords();

	// Separate into data blocks
	var dataBlocks = DataBlock.getDataBlocks(codewords, version, ecLevel);

	// Count total number of data bytes
	var totalBytes = 0;
	for (var i = 0; i < dataBlocks.length; i++)
	{
		totalBytes += dataBlocks[i].NumDataCodewords;
	}
	var resultBytes = new Array(totalBytes);
	var resultOffset = 0;

	// Error-correct and copy data blocks together into a stream of bytes
	for (var j = 0; j < dataBlocks.length; j++)
	{
		var dataBlock = dataBlocks[j];
		var codewordBytes = dataBlock.Codewords;
		var numDataCodewords = dataBlock.NumDataCodewords;
		Decoder.correctErrors(codewordBytes, numDataCodewords);
		for (var i = 0; i < numDataCodewords; i++)
		{
			resultBytes[resultOffset++] = codewordBytes[i];
		}
	}

	// Decode the contents of that stream of bytes
	var reader = new QRCodeDataBlockReader(resultBytes, version.VersionNumber, ecLevel.Bits);
	return reader;
	//return DecodedBitStreamParser.decode(resultBytes, version, ecLevel);
}

/*
   Copyright 2011 Lazar Laszlo (lazarsoft@gmail.com, www.lazarsoft.info)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

var qrcode = {};
qrcode.sizeOfDataLengthInfo =  [  [ 10, 9, 8, 8 ],  [ 12, 11, 16, 10 ],  [ 14, 13, 16, 12 ] ];

QrCode = function () {

this.imagedata = null;
this.width = 0;
this.height = 0;
this.qrCodeSymbol = null;
this.debug = false;

this.callback = null;

this.decode = function(src, data){

    var decode = (function() {

        try {
			this.result = this.process(this.imagedata);
        } catch (e) {
            this.result = "error decoding QR Code: " + e;
        }

		if (this.callback!=null) {

            this.callback(this.result);
        };

        return this.result;

    }).bind(this);

    /* decode from canvas #qr-canvas */
	if (src == undefined) {

		var canvas_qr = document.getElementById("qr-canvas");
		var context = canvas_qr.getContext('2d');

	    this.width = canvas_qr.width;
		this.height = canvas_qr.height;
		this.imagedata = context.getImageData(0, 0, this.width, this.height);

        decode();
	}

	/* decode from canvas canvas.context.getImageData */
    else if (src.width != undefined) {

		this.width=src.width
		this.height=src.height
		this.imagedata={ "data": data || src.data }
		this.imagedata.width=src.width
		this.imagedata.height=src.height

        decode();
	}

    /* decode from URL */
	else {

		var image = new Image();
		var _this = this

        image.onload = (function() {

			var canvas_qr = document.createElement('canvas');
			var context = canvas_qr.getContext('2d');
			var canvas_out = document.getElementById("out-canvas");

			if (canvas_out != null) {

                var outctx = canvas_out.getContext('2d');
                outctx.clearRect(0, 0, 320, 240);
				outctx.drawImage(image, 0, 0, 320, 240);
            }

			canvas_qr.width = image.width;
			canvas_qr.height = image.height;
            context.drawImage(image, 0, 0);
			this.width = image.width;
			this.height = image.height;

			try{
				this.imagedata = context.getImageData(0, 0, image.width, image.height);
			} catch(e) {
				this.result = "Cross domain image reading not supported in your browser! Save it to your computer then drag and drop the file!";
				if (this.callback!=null) return this.callback(this.result);
			}

            decode();

		}).bind(this);

		image.src = src;
	}
};

this.decode_utf8 = function ( s ) {

    return decodeURIComponent( escape( s ) );
}

this.process = function(imageData) {

	var start = new Date().getTime();

	var image = this.grayScaleToBitmap(this.grayscale(imageData));

	//var finderPatternInfo = new FinderPatternFinder().findFinderPattern(image);

	var detector = new Detector(image);

	var qRCodeMatrix = detector.detect();

	/*for (var y = 0; y < qRCodeMatrix.bits.Height; y++)
	{
		for (var x = 0; x < qRCodeMatrix.bits.Width; x++)
		{
			var point = (x * 4*2) + (y*2 * imageData.width * 4);
			imageData.data[point] = qRCodeMatrix.bits.get_Renamed(x,y)?0:0;
			imageData.data[point+1] = qRCodeMatrix.bits.get_Renamed(x,y)?0:0;
			imageData.data[point+2] = qRCodeMatrix.bits.get_Renamed(x,y)?255:0;
		}
	}*/

	var reader = Decoder.decode(qRCodeMatrix.bits);
	var data = reader.DataByte;
	var str="";
	for(var i=0;i<data.length;i++)
	{
		for(var j=0;j<data[i].length;j++)
			str+=String.fromCharCode(data[i][j]);
	}

	var end = new Date().getTime();
	var time = end - start;
	if (this.debug) {
		console.log('QR Code processing time (ms): ' + time);
	}

	return this.decode_utf8(str);
	//alert("Time:" + time + " Code: "+str);
}

this.getPixel = function(imageData, x,y){
	if (imageData.width < x) {
		throw "point error";
	}
	if (imageData.height < y) {
		throw "point error";
	}
	point = (x * 4) + (y * imageData.width * 4);
	p = (imageData.data[point]*33 + imageData.data[point + 1]*34 + imageData.data[point + 2]*33)/100;
	return p;
}

this.binarize = function(th){
	var ret = new Array(this.width*this.height);
	for (var y = 0; y < this.height; y++)
	{
		for (var x = 0; x < this.width; x++)
		{
			var gray = this.getPixel(x, y);

			ret[x+y*this.width] = gray<=th?true:false;
		}
	}
	return ret;
}

this.getMiddleBrightnessPerArea=function(imageData)
{
	var numSqrtArea = 4;
	//obtain middle brightness((min + max) / 2) per area
	var areaWidth = Math.floor(imageData.width / numSqrtArea);
	var areaHeight = Math.floor(imageData.height / numSqrtArea);
	var minmax = new Array(numSqrtArea);
	for (var i = 0; i < numSqrtArea; i++)
	{
		minmax[i] = new Array(numSqrtArea);
		for (var i2 = 0; i2 < numSqrtArea; i2++)
		{
			minmax[i][i2] = new Array(0,0);
		}
	}
	for (var ay = 0; ay < numSqrtArea; ay++)
	{
		for (var ax = 0; ax < numSqrtArea; ax++)
		{
			minmax[ax][ay][0] = 0xFF;
			for (var dy = 0; dy < areaHeight; dy++)
			{
				for (var dx = 0; dx < areaWidth; dx++)
				{
					var target = imageData.data[areaWidth * ax + dx+(areaHeight * ay + dy)*imageData.width];
					if (target < minmax[ax][ay][0])
						minmax[ax][ay][0] = target;
					if (target > minmax[ax][ay][1])
						minmax[ax][ay][1] = target;
				}
			}
			//minmax[ax][ay][0] = (minmax[ax][ay][0] + minmax[ax][ay][1]) / 2;
		}
	}
	var middle = new Array(numSqrtArea);
	for (var i3 = 0; i3 < numSqrtArea; i3++)
	{
		middle[i3] = new Array(numSqrtArea);
	}
	for (var ay = 0; ay < numSqrtArea; ay++)
	{
		for (var ax = 0; ax < numSqrtArea; ax++)
		{
			middle[ax][ay] = Math.floor((minmax[ax][ay][0] + minmax[ax][ay][1]) / 2);
			//Console.out.print(middle[ax][ay] + ",");
		}
		//Console.out.println("");
	}
	//Console.out.println("");

	return middle;
}

this.grayScaleToBitmap=function(grayScaleImageData)
{
	var middle = this.getMiddleBrightnessPerArea(grayScaleImageData);
	var sqrtNumArea = middle.length;
	var areaWidth = Math.floor(grayScaleImageData.width / sqrtNumArea);
	var areaHeight = Math.floor(grayScaleImageData.height / sqrtNumArea);

	for (var ay = 0; ay < sqrtNumArea; ay++)
	{
		for (var ax = 0; ax < sqrtNumArea; ax++)
		{
			for (var dy = 0; dy < areaHeight; dy++)
			{
				for (var dx = 0; dx < areaWidth; dx++)
				{
					grayScaleImageData.data[areaWidth * ax + dx+ (areaHeight * ay + dy)*grayScaleImageData.width] = (grayScaleImageData.data[areaWidth * ax + dx+ (areaHeight * ay + dy)*grayScaleImageData.width] < middle[ax][ay])?true:false;
				}
			}
		}
	}
	return grayScaleImageData;
}

this.grayscale = function(imageData){
	var ret = new Array(imageData.width*imageData.height);

	for (var y = 0; y < imageData.height; y++)
	{
		for (var x = 0; x < imageData.width; x++)
		{
			var gray = this.getPixel(imageData, x, y);

			ret[x+y*imageData.width] = gray;
		}
	}

	return {
		height: imageData.height,
		width: imageData.width,
		data: ret
	};
}

  }

function URShift( number,  bits)
{
	if (number >= 0)
		return number >> bits;
	else
		return (number >> bits) + (2 << ~bits);
}

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


var MIN_SKIP = 3;
var MAX_MODULES = 57;
var INTEGER_MATH_SHIFT = 8;
var CENTER_QUORUM = 2;

qrcode.orderBestPatterns=function(patterns)
		{

			function distance( pattern1,  pattern2)
			{
				xDiff = pattern1.X - pattern2.X;
				yDiff = pattern1.Y - pattern2.Y;
				return  Math.sqrt( (xDiff * xDiff + yDiff * yDiff));
			}

			/// <summary> Returns the z component of the cross product between vectors BC and BA.</summary>
			function crossProductZ( pointA,  pointB,  pointC)
			{
				var bX = pointB.x;
				var bY = pointB.y;
				return ((pointC.x - bX) * (pointA.y - bY)) - ((pointC.y - bY) * (pointA.x - bX));
			}


			// Find distances between pattern centers
			var zeroOneDistance = distance(patterns[0], patterns[1]);
			var oneTwoDistance = distance(patterns[1], patterns[2]);
			var zeroTwoDistance = distance(patterns[0], patterns[2]);

			var pointA, pointB, pointC;
			// Assume one closest to other two is B; A and C will just be guesses at first
			if (oneTwoDistance >= zeroOneDistance && oneTwoDistance >= zeroTwoDistance)
			{
				pointB = patterns[0];
				pointA = patterns[1];
				pointC = patterns[2];
			}
			else if (zeroTwoDistance >= oneTwoDistance && zeroTwoDistance >= zeroOneDistance)
			{
				pointB = patterns[1];
				pointA = patterns[0];
				pointC = patterns[2];
			}
			else
			{
				pointB = patterns[2];
				pointA = patterns[0];
				pointC = patterns[1];
			}

			// Use cross product to figure out whether A and C are correct or flipped.
			// This asks whether BC x BA has a positive z component, which is the arrangement
			// we want for A, B, C. If it's negative, then we've got it flipped around and
			// should swap A and C.
			if (crossProductZ(pointA, pointB, pointC) < 0.0)
			{
				var temp = pointA;
				pointA = pointC;
				pointC = temp;
			}

			patterns[0] = pointA;
			patterns[1] = pointB;
			patterns[2] = pointC;
		}


function FinderPattern(posX, posY,  estimatedModuleSize)
{
	this.x=posX;
	this.y=posY;
	this.count = 1;
	this.estimatedModuleSize = estimatedModuleSize;

	Object.defineProperty(this,"EstimatedModuleSize", { get: function()
	{
		return this.estimatedModuleSize;
	}});
	Object.defineProperty(this,"Count", { get: function()
	{
		return this.count;
	}});
	Object.defineProperty(this,"X", { get: function()
	{
		return this.x;
	}});
	Object.defineProperty(this,"Y", { get: function()
	{
		return this.y;
	}});
	this.incrementCount = function()
	{
		this.count++;
	}
	this.aboutEquals=function( moduleSize,  i,  j)
		{
			if (Math.abs(i - this.y) <= moduleSize && Math.abs(j - this.x) <= moduleSize)
			{
				var moduleSizeDiff = Math.abs(moduleSize - this.estimatedModuleSize);
				return moduleSizeDiff <= 1.0 || moduleSizeDiff / this.estimatedModuleSize <= 1.0;
			}
			return false;
		}

}

function FinderPatternInfo(patternCenters)
{
	this.bottomLeft = patternCenters[0];
	this.topLeft = patternCenters[1];
	this.topRight = patternCenters[2];
	Object.defineProperty(this,"BottomLeft", { get: function()
	{
		return this.bottomLeft;
	}});
	Object.defineProperty(this,"TopLeft", { get: function()
	{
		return this.topLeft;
	}});
	Object.defineProperty(this,"TopRight", { get: function()
	{
		return this.topRight;
	}});
}

function FinderPatternFinder()
{
	this.image=null;
	this.possibleCenters = [];
	this.hasSkipped = false;
	this.crossCheckStateCount = new Array(0,0,0,0,0);
	this.resultPointCallback = null;

	Object.defineProperty(this,"CrossCheckStateCount", { get: function()
	{
		this.crossCheckStateCount[0] = 0;
		this.crossCheckStateCount[1] = 0;
		this.crossCheckStateCount[2] = 0;
		this.crossCheckStateCount[3] = 0;
		this.crossCheckStateCount[4] = 0;
		return this.crossCheckStateCount;
	}});

	this.foundPatternCross=function( stateCount)
		{
			var totalModuleSize = 0;
			for (var i = 0; i < 5; i++)
			{
				var count = stateCount[i];
				if (count == 0)
				{
					return false;
				}
				totalModuleSize += count;
			}
			if (totalModuleSize < 7)
			{
				return false;
			}
			var moduleSize = Math.floor((totalModuleSize << INTEGER_MATH_SHIFT) / 7);
			var maxVariance = Math.floor(moduleSize / 2);
			// Allow less than 50% variance from 1-1-3-1-1 proportions
			return Math.abs(moduleSize - (stateCount[0] << INTEGER_MATH_SHIFT)) < maxVariance && Math.abs(moduleSize - (stateCount[1] << INTEGER_MATH_SHIFT)) < maxVariance && Math.abs(3 * moduleSize - (stateCount[2] << INTEGER_MATH_SHIFT)) < 3 * maxVariance && Math.abs(moduleSize - (stateCount[3] << INTEGER_MATH_SHIFT)) < maxVariance && Math.abs(moduleSize - (stateCount[4] << INTEGER_MATH_SHIFT)) < maxVariance;
		}
	this.centerFromEnd=function( stateCount,  end)
		{
			return  (end - stateCount[4] - stateCount[3]) - stateCount[2] / 2.0;
		}
	this.crossCheckVertical=function( startI,  centerJ,  maxCount,  originalStateCountTotal)
		{
			var image = this.image;

			var maxI = image.height;
			var stateCount = this.CrossCheckStateCount;

			// Start counting up from center
			var i = startI;
			while (i >= 0 && image.data[centerJ + i*image.width])
			{
				stateCount[2]++;
				i--;
			}
			if (i < 0)
			{
				return NaN;
			}
			while (i >= 0 && !image.data[centerJ +i*image.width] && stateCount[1] <= maxCount)
			{
				stateCount[1]++;
				i--;
			}
			// If already too many modules in this state or ran off the edge:
			if (i < 0 || stateCount[1] > maxCount)
			{
				return NaN;
			}
			while (i >= 0 && image.data[centerJ + i*image.width] && stateCount[0] <= maxCount)
			{
				stateCount[0]++;
				i--;
			}
			if (stateCount[0] > maxCount)
			{
				return NaN;
			}

			// Now also count down from center
			i = startI + 1;
			while (i < maxI && image.data[centerJ +i*image.width])
			{
				stateCount[2]++;
				i++;
			}
			if (i == maxI)
			{
				return NaN;
			}
			while (i < maxI && !image.data[centerJ + i*image.width] && stateCount[3] < maxCount)
			{
				stateCount[3]++;
				i++;
			}
			if (i == maxI || stateCount[3] >= maxCount)
			{
				return NaN;
			}
			while (i < maxI && image.data[centerJ + i*image.width] && stateCount[4] < maxCount)
			{
				stateCount[4]++;
				i++;
			}
			if (stateCount[4] >= maxCount)
			{
				return NaN;
			}

			// If we found a finder-pattern-like section, but its size is more than 40% different than
			// the original, assume it's a false positive
			var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
			if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal)
			{
				return NaN;
			}

			return this.foundPatternCross(stateCount)?this.centerFromEnd(stateCount, i):NaN;
		}
	this.crossCheckHorizontal=function( startJ,  centerI,  maxCount, originalStateCountTotal)
		{
			var image = this.image;

			var maxJ = image.width;
			var stateCount = this.CrossCheckStateCount;

			var j = startJ;
			while (j >= 0 && image.data[j+ centerI*image.width])
			{
				stateCount[2]++;
				j--;
			}
			if (j < 0)
			{
				return NaN;
			}
			while (j >= 0 && !image.data[j+ centerI*image.width] && stateCount[1] <= maxCount)
			{
				stateCount[1]++;
				j--;
			}
			if (j < 0 || stateCount[1] > maxCount)
			{
				return NaN;
			}
			while (j >= 0 && image.data[j+ centerI*image.width] && stateCount[0] <= maxCount)
			{
				stateCount[0]++;
				j--;
			}
			if (stateCount[0] > maxCount)
			{
				return NaN;
			}

			j = startJ + 1;
			while (j < maxJ && image.data[j+ centerI*image.width])
			{
				stateCount[2]++;
				j++;
			}
			if (j == maxJ)
			{
				return NaN;
			}
			while (j < maxJ && !image.data[j+ centerI*image.width] && stateCount[3] < maxCount)
			{
				stateCount[3]++;
				j++;
			}
			if (j == maxJ || stateCount[3] >= maxCount)
			{
				return NaN;
			}
			while (j < maxJ && image.data[j+ centerI*image.width] && stateCount[4] < maxCount)
			{
				stateCount[4]++;
				j++;
			}
			if (stateCount[4] >= maxCount)
			{
				return NaN;
			}

			// If we found a finder-pattern-like section, but its size is significantly different than
			// the original, assume it's a false positive
			var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
			if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= originalStateCountTotal)
			{
				return NaN;
			}

			return this.foundPatternCross(stateCount)?this.centerFromEnd(stateCount, j):NaN;
		}
	this.handlePossibleCenter=function( stateCount,  i,  j)
		{
			var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
			var centerJ = this.centerFromEnd(stateCount, j); //float
			var centerI = this.crossCheckVertical(i, Math.floor( centerJ), stateCount[2], stateCountTotal); //float
			if (!isNaN(centerI))
			{
				// Re-cross check
				centerJ = this.crossCheckHorizontal(Math.floor( centerJ), Math.floor( centerI), stateCount[2], stateCountTotal);
				if (!isNaN(centerJ))
				{
					var estimatedModuleSize =   stateCountTotal / 7.0;
					var found = false;
					var max = this.possibleCenters.length;
					for (var index = 0; index < max; index++)
					{
						var center = this.possibleCenters[index];
						// Look for about the same center and module size:
						if (center.aboutEquals(estimatedModuleSize, centerI, centerJ))
						{
							center.incrementCount();
							found = true;
							break;
						}
					}
					if (!found)
					{
						var point = new FinderPattern(centerJ, centerI, estimatedModuleSize);
						this.possibleCenters.push(point);
						if (this.resultPointCallback != null)
						{
							this.resultPointCallback.foundPossibleResultPoint(point);
						}
					}
					return true;
				}
			}
			return false;
		}

	this.selectBestPatterns=function()
		{

			var startSize = this.possibleCenters.length;
			if (startSize < 3)
			{
				// Couldn't find enough finder patterns
				throw "Couldn't find enough finder patterns:"+startSize+" patterns found";
			}

			// Filter outlier possibilities whose module size is too different
			if (startSize > 3)
			{
				// But we can only afford to do so if we have at least 4 possibilities to choose from
				var totalModuleSize = 0.0;
                var square = 0.0;
				for (var i = 0; i < startSize; i++)
				{
					//totalModuleSize +=  this.possibleCenters[i].EstimatedModuleSize;
                    var	centerValue=this.possibleCenters[i].EstimatedModuleSize;
					totalModuleSize += centerValue;
					square += (centerValue * centerValue);
				}
				var average = totalModuleSize /  startSize;
                this.possibleCenters.sort(function(center1,center2) {
				      var dA=Math.abs(center2.EstimatedModuleSize - average);
				      var dB=Math.abs(center1.EstimatedModuleSize - average);
				      if (dA < dB) {
						return (-1);
				      } else if (dA == dB) {
						return 0;
				      } else {
						return 1;
				      }
					});

				var stdDev = Math.sqrt(square / startSize - average * average);
				var limit = Math.max(0.2 * average, stdDev);
				for (var i = 0; i < this.possibleCenters.length && this.possibleCenters.length > 3; i++)
				{
					var pattern =  this.possibleCenters[i];
					//if (Math.abs(pattern.EstimatedModuleSize - average) > 0.2 * average)
                    if (Math.abs(pattern.EstimatedModuleSize - average) > limit)
					{
						this.possibleCenters.splice(i, 1);
						i--;
					}
				}
			}

			if (this.possibleCenters.length > 3)
			{
				// Throw away all but those first size candidate points we found.
				this.possibleCenters.sort(function(a, b){
				          if (a.count > b.count){return -1;}
				          if (a.count < b.count){return 1;}
				          return 0;
				});
			}

			return new Array( this.possibleCenters[0],  this.possibleCenters[1],  this.possibleCenters[2]);
		}

	this.findRowSkip=function()
		{
			var max = this.possibleCenters.length;
			if (max <= 1)
			{
				return 0;
			}
			var firstConfirmedCenter = null;
			for (var i = 0; i < max; i++)
			{
				var center =  this.possibleCenters[i];
				if (center.Count >= CENTER_QUORUM)
				{
					if (firstConfirmedCenter == null)
					{
						firstConfirmedCenter = center;
					}
					else
					{
						// We have two confirmed centers
						// How far down can we skip before resuming looking for the next
						// pattern? In the worst case, only the difference between the
						// difference in the x / y coordinates of the two centers.
						// This is the case where you find top left last.
						this.hasSkipped = true;
						return Math.floor ((Math.abs(firstConfirmedCenter.X - center.X) - Math.abs(firstConfirmedCenter.Y - center.Y)) / 2);
					}
				}
			}
			return 0;
		}

	this.haveMultiplyConfirmedCenters=function()
		{
			var confirmedCount = 0;
			var totalModuleSize = 0.0;
			var max = this.possibleCenters.length;
			for (var i = 0; i < max; i++)
			{
				var pattern =  this.possibleCenters[i];
				if (pattern.Count >= CENTER_QUORUM)
				{
					confirmedCount++;
					totalModuleSize += pattern.EstimatedModuleSize;
				}
			}
			if (confirmedCount < 3)
			{
				return false;
			}
			// OK, we have at least 3 confirmed centers, but, it's possible that one is a "false positive"
			// and that we need to keep looking. We detect this by asking if the estimated module sizes
			// vary too much. We arbitrarily say that when the total deviation from average exceeds
			// 5% of the total module size estimates, it's too much.
			var average = totalModuleSize / max;
			var totalDeviation = 0.0;
			for (var i = 0; i < max; i++)
			{
				pattern = this.possibleCenters[i];
				totalDeviation += Math.abs(pattern.EstimatedModuleSize - average);
			}
			return totalDeviation <= 0.05 * totalModuleSize;
		}

	this.findFinderPattern = function(image){
		var tryHarder = false;
		this.image=image;
		var maxI = image.height;
		var maxJ = image.width;
		var iSkip = Math.floor((3 * maxI) / (4 * MAX_MODULES));
		if (iSkip < MIN_SKIP || tryHarder)
		{
				iSkip = MIN_SKIP;
		}

		var done = false;
		var stateCount = new Array(5);
		for (var i = iSkip - 1; i < maxI && !done; i += iSkip)
		{
			// Get a row of black/white values
			stateCount[0] = 0;
			stateCount[1] = 0;
			stateCount[2] = 0;
			stateCount[3] = 0;
			stateCount[4] = 0;
			var currentState = 0;
			for (var j = 0; j < maxJ; j++)
			{
				if (image.data[j+i*image.width] )
				{
					// Black pixel
					if ((currentState & 1) == 1)
					{
						// Counting white pixels
						currentState++;
					}
					stateCount[currentState]++;
				}
				else
				{
					// White pixel
					if ((currentState & 1) == 0)
					{
						// Counting black pixels
						if (currentState == 4)
						{
							// A winner?
							if (this.foundPatternCross(stateCount))
							{
								// Yes
								var confirmed = this.handlePossibleCenter(stateCount, i, j);
								if (confirmed)
								{
									// Start examining every other line. Checking each line turned out to be too
									// expensive and didn't improve performance.
									iSkip = 2;
									if (this.hasSkipped)
									{
										done = this.haveMultiplyConfirmedCenters();
									}
									else
									{
										var rowSkip = this.findRowSkip();
										if (rowSkip > stateCount[2])
										{
											// Skip rows between row of lower confirmed center
											// and top of presumed third confirmed center
											// but back up a bit to get a full chance of detecting
											// it, entire width of center of finder pattern

											// Skip by rowSkip, but back off by stateCount[2] (size of last center
											// of pattern we saw) to be conservative, and also back off by iSkip which
											// is about to be re-added
											i += rowSkip - stateCount[2] - iSkip;
											j = maxJ - 1;
										}
									}
								}
								else
								{
									// Advance to next black pixel
									do
									{
										j++;
									}
									while (j < maxJ && !image.data[j + i*image.width]);
									j--; // back up to that last white pixel
								}
								// Clear state to start looking again
								currentState = 0;
								stateCount[0] = 0;
								stateCount[1] = 0;
								stateCount[2] = 0;
								stateCount[3] = 0;
								stateCount[4] = 0;
							}
							else
							{
								// No, shift counts back by two
								stateCount[0] = stateCount[2];
								stateCount[1] = stateCount[3];
								stateCount[2] = stateCount[4];
								stateCount[3] = 1;
								stateCount[4] = 0;
								currentState = 3;
							}
						}
						else
						{
							stateCount[++currentState]++;
						}
					}
					else
					{
						// Counting white pixels
						stateCount[currentState]++;
					}
				}
			}
			if (this.foundPatternCross(stateCount))
			{
				var confirmed = this.handlePossibleCenter(stateCount, i, maxJ);
				if (confirmed)
				{
					iSkip = stateCount[0];
					if (this.hasSkipped)
					{
						// Found a third one
						done = haveMultiplyConfirmedCenters();
					}
				}
			}
		}

		var patternInfo = this.selectBestPatterns();
		qrcode.orderBestPatterns(patternInfo);

		return new FinderPatternInfo(patternInfo);
	};
}

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


function AlignmentPattern(posX, posY,  estimatedModuleSize)
{
	this.x=posX;
	this.y=posY;
	this.count = 1;
	this.estimatedModuleSize = estimatedModuleSize;

	Object.defineProperty(this,"EstimatedModuleSize", { get: function()
	{
		return this.estimatedModuleSize;
	}});
	Object.defineProperty(this,"Count", { get: function()
	{
		return this.count;
	}});
	Object.defineProperty(this,"X", { get: function()
	{
		return Math.floor(this.x);
	}});
	Object.defineProperty(this,"Y", { get: function()
	{
		return Math.floor(this.y);
	}});
	this.incrementCount = function()
	{
		this.count++;
	}
	this.aboutEquals=function( moduleSize,  i,  j)
		{
			if (Math.abs(i - this.y) <= moduleSize && Math.abs(j - this.x) <= moduleSize)
			{
				var moduleSizeDiff = Math.abs(moduleSize - this.estimatedModuleSize);
				return moduleSizeDiff <= 1.0 || moduleSizeDiff / this.estimatedModuleSize <= 1.0;
			}
			return false;
		}

}

function AlignmentPatternFinder( image,  startX,  startY,  width,  height,  moduleSize,  resultPointCallback)
{
	this.image = image;
	this.possibleCenters = new Array();
	this.startX = startX;
	this.startY = startY;
	this.width = width;
	this.height = height;
	this.moduleSize = moduleSize;
	this.crossCheckStateCount = new Array(0,0,0);
	this.resultPointCallback = resultPointCallback;

	this.centerFromEnd=function(stateCount,  end)
		{
			return  (end - stateCount[2]) - stateCount[1] / 2.0;
		}
	this.foundPatternCross = function(stateCount)
		{
			var moduleSize = this.moduleSize;
			var maxVariance = moduleSize / 2.0;
			for (var i = 0; i < 3; i++)
			{
				if (Math.abs(moduleSize - stateCount[i]) >= maxVariance)
				{
					return false;
				}
			}
			return true;
		}

	this.crossCheckVertical=function( startI,  centerJ,  maxCount,  originalStateCountTotal)
		{
			var image = this.image;

			var maxI = image.height;
			var stateCount = this.crossCheckStateCount;
			stateCount[0] = 0;
			stateCount[1] = 0;
			stateCount[2] = 0;

			// Start counting up from center
			var i = startI;
			while (i >= 0 && image.data[centerJ + i*image.width] && stateCount[1] <= maxCount)
			{
				stateCount[1]++;
				i--;
			}
			// If already too many modules in this state or ran off the edge:
			if (i < 0 || stateCount[1] > maxCount)
			{
				return NaN;
			}
			while (i >= 0 && !image.data[centerJ + i*image.width] && stateCount[0] <= maxCount)
			{
				stateCount[0]++;
				i--;
			}
			if (stateCount[0] > maxCount)
			{
				return NaN;
			}

			// Now also count down from center
			i = startI + 1;
			while (i < maxI && image.data[centerJ + i*image.width] && stateCount[1] <= maxCount)
			{
				stateCount[1]++;
				i++;
			}
			if (i == maxI || stateCount[1] > maxCount)
			{
				return NaN;
			}
			while (i < maxI && !image.data[centerJ + i*image.width] && stateCount[2] <= maxCount)
			{
				stateCount[2]++;
				i++;
			}
			if (stateCount[2] > maxCount)
			{
				return NaN;
			}

			var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];
			if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal)
			{
				return NaN;
			}

			return this.foundPatternCross(stateCount)?this.centerFromEnd(stateCount, i):NaN;
		}

	this.handlePossibleCenter=function( stateCount,  i,  j)
		{
			var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];
			var centerJ = this.centerFromEnd(stateCount, j);
			var centerI = this.crossCheckVertical(i, Math.floor (centerJ), 2 * stateCount[1], stateCountTotal);
			if (!isNaN(centerI))
			{
				var estimatedModuleSize = (stateCount[0] + stateCount[1] + stateCount[2]) / 3.0;
				var max = this.possibleCenters.length;
				for (var index = 0; index < max; index++)
				{
					var center =  this.possibleCenters[index];
					// Look for about the same center and module size:
					if (center.aboutEquals(estimatedModuleSize, centerI, centerJ))
					{
						return new AlignmentPattern(centerJ, centerI, estimatedModuleSize);
					}
				}
				// Hadn't found this before; save it
				var point = new AlignmentPattern(centerJ, centerI, estimatedModuleSize);
				this.possibleCenters.push(point);
				if (this.resultPointCallback != null)
				{
					this.resultPointCallback.foundPossibleResultPoint(point);
				}
			}
			return null;
		}

	this.find = function()
	{
			var startX = this.startX;
			var height = this.height;
			var maxJ = startX + width;
			var middleI = startY + (height >> 1);
			// We are looking for black/white/black modules in 1:1:1 ratio;
			// this tracks the number of black/white/black modules seen so far
			var stateCount = new Array(0,0,0);
			for (var iGen = 0; iGen < height; iGen++)
			{
				// Search from middle outwards
				var i = middleI + ((iGen & 0x01) == 0?((iGen + 1) >> 1):- ((iGen + 1) >> 1));
				stateCount[0] = 0;
				stateCount[1] = 0;
				stateCount[2] = 0;
				var j = startX;
				// Burn off leading white pixels before anything else; if we start in the middle of
				// a white run, it doesn't make sense to count its length, since we don't know if the
				// white run continued to the left of the start point
				while (j < maxJ && !image.data[j + image.width* i])
				{
					j++;
				}
				var currentState = 0;
				while (j < maxJ)
				{
					if (image.data[j + i*image.width])
					{
						// Black pixel
						if (currentState == 1)
						{
							// Counting black pixels
							stateCount[currentState]++;
						}
						else
						{
							// Counting white pixels
							if (currentState == 2)
							{
								// A winner?
								if (this.foundPatternCross(stateCount))
								{
									// Yes
									var confirmed = this.handlePossibleCenter(stateCount, i, j);
									if (confirmed != null)
									{
										return confirmed;
									}
								}
								stateCount[0] = stateCount[2];
								stateCount[1] = 1;
								stateCount[2] = 0;
								currentState = 1;
							}
							else
							{
								stateCount[++currentState]++;
							}
						}
					}
					else
					{
						// White pixel
						if (currentState == 1)
						{
							// Counting black pixels
							currentState++;
						}
						stateCount[currentState]++;
					}
					j++;
				}
				if (this.foundPatternCross(stateCount))
				{
					var confirmed = this.handlePossibleCenter(stateCount, i, maxJ);
					if (confirmed != null)
					{
						return confirmed;
					}
				}
			}

			// Hmm, nothing we saw was observed and confirmed twice. If we had
			// any guess at all, return it.
			if (!(this.possibleCenters.length == 0))
			{
				return  this.possibleCenters[0];
			}

			throw "Couldn't find enough alignment patterns";
		}

}

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


function QRCodeDataBlockReader(blocks,  version,  numErrorCorrectionCode)
{
	this.blockPointer = 0;
	this.bitPointer = 7;
	this.dataLength = 0;
	this.blocks = blocks;
	this.numErrorCorrectionCode = numErrorCorrectionCode;
	if (version <= 9)
		this.dataLengthMode = 0;
	else if (version >= 10 && version <= 26)
		this.dataLengthMode = 1;
	else if (version >= 27 && version <= 40)
		this.dataLengthMode = 2;

	this.getNextBits = function( numBits)
		{
			var bits = 0;
			if (numBits < this.bitPointer + 1)
			{
				// next word fits into current data block
				var mask = 0;
				for (var i = 0; i < numBits; i++)
				{
					mask += (1 << i);
				}
				mask <<= (this.bitPointer - numBits + 1);

				bits = (this.blocks[this.blockPointer] & mask) >> (this.bitPointer - numBits + 1);
				this.bitPointer -= numBits;
				return bits;
			}
			else if (numBits < this.bitPointer + 1 + 8)
			{
				// next word crosses 2 data blocks
				var mask1 = 0;
				for (var i = 0; i < this.bitPointer + 1; i++)
				{
					mask1 += (1 << i);
				}
				bits = (this.blocks[this.blockPointer] & mask1) << (numBits - (this.bitPointer + 1));
                this.blockPointer++;
				bits += ((this.blocks[this.blockPointer]) >> (8 - (numBits - (this.bitPointer + 1))));

				this.bitPointer = this.bitPointer - numBits % 8;
				if (this.bitPointer < 0)
				{
					this.bitPointer = 8 + this.bitPointer;
				}
				return bits;
			}
			else if (numBits < this.bitPointer + 1 + 16)
			{
				// next word crosses 3 data blocks
				var mask1 = 0; // mask of first block
				var mask3 = 0; // mask of 3rd block
				//bitPointer + 1 : number of bits of the 1st block
				//8 : number of the 2nd block (note that use already 8bits because next word uses 3 data blocks)
				//numBits - (bitPointer + 1 + 8) : number of bits of the 3rd block
				for (var i = 0; i < this.bitPointer + 1; i++)
				{
					mask1 += (1 << i);
				}
				var bitsFirstBlock = (this.blocks[this.blockPointer] & mask1) << (numBits - (this.bitPointer + 1));
				this.blockPointer++;

				var bitsSecondBlock = this.blocks[this.blockPointer] << (numBits - (this.bitPointer + 1 + 8));
				this.blockPointer++;

				for (var i = 0; i < numBits - (this.bitPointer + 1 + 8); i++)
				{
					mask3 += (1 << i);
				}
				mask3 <<= 8 - (numBits - (this.bitPointer + 1 + 8));
				var bitsThirdBlock = (this.blocks[this.blockPointer] & mask3) >> (8 - (numBits - (this.bitPointer + 1 + 8)));

				bits = bitsFirstBlock + bitsSecondBlock + bitsThirdBlock;
				this.bitPointer = this.bitPointer - (numBits - 8) % 8;
				if (this.bitPointer < 0)
				{
					this.bitPointer = 8 + this.bitPointer;
				}
				return bits;
			}
			else
			{
				return 0;
			}
		}
	this.NextMode=function()
	{
		if ((this.blockPointer > this.blocks.length - this.numErrorCorrectionCode - 2))
			return 0;
		else
			return this.getNextBits(4);
	}
	this.getDataLength=function( modeIndicator)
		{
			var index = 0;
			while (true)
			{
				if ((modeIndicator >> index) == 1)
					break;
				index++;
			}

			return this.getNextBits(qrcode.sizeOfDataLengthInfo[this.dataLengthMode][index]);
		}
	this.getRomanAndFigureString=function( dataLength)
		{
			var length = dataLength;
			var intData = 0;
			var strData = "";
			var tableRomanAndFigure = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ' ', '$', '%', '*', '+', '-', '.', '/', ':');
			do
			{
				if (length > 1)
				{
					intData = this.getNextBits(11);
					var firstLetter = Math.floor(intData / 45);
					var secondLetter = intData % 45;
					strData += tableRomanAndFigure[firstLetter];
					strData += tableRomanAndFigure[secondLetter];
					length -= 2;
				}
				else if (length == 1)
				{
					intData = this.getNextBits(6);
					strData += tableRomanAndFigure[intData];
					length -= 1;
				}
			}
			while (length > 0);

			return strData;
		}
	this.getFigureString=function( dataLength)
		{
			var length = dataLength;
			var intData = 0;
			var strData = "";
			do
			{
				if (length >= 3)
				{
					intData = this.getNextBits(10);
					if (intData < 100)
						strData += "0";
					if (intData < 10)
						strData += "0";
					length -= 3;
				}
				else if (length == 2)
				{
					intData = this.getNextBits(7);
					if (intData < 10)
						strData += "0";
					length -= 2;
				}
				else if (length == 1)
				{
					intData = this.getNextBits(4);
					length -= 1;
				}
				strData += intData;
			}
			while (length > 0);

			return strData;
		}
	this.get8bitByteArray=function( dataLength)
		{
			var length = dataLength;
			var intData = 0;
			var output = new Array();

			do
			{
				intData = this.getNextBits(8);
				output.push( intData);
				length--;
			}
			while (length > 0);
			return output;
		}
    this.getKanjiString=function( dataLength)
		{
			var length = dataLength;
			var intData = 0;
			var unicodeString = "";
			do
			{
				intData = getNextBits(13);
				var lowerByte = intData % 0xC0;
				var higherByte = intData / 0xC0;

				var tempWord = (higherByte << 8) + lowerByte;
				var shiftjisWord = 0;
				if (tempWord + 0x8140 <= 0x9FFC)
				{
					// between 8140 - 9FFC on Shift_JIS character set
					shiftjisWord = tempWord + 0x8140;
				}
				else
				{
					// between E040 - EBBF on Shift_JIS character set
					shiftjisWord = tempWord + 0xC140;
				}

				//var tempByte = new Array(0,0);
				//tempByte[0] = (sbyte) (shiftjisWord >> 8);
				//tempByte[1] = (sbyte) (shiftjisWord & 0xFF);
				//unicodeString += new String(SystemUtils.ToCharArray(SystemUtils.ToByteArray(tempByte)));
                unicodeString += String.fromCharCode(shiftjisWord);
				length--;
			}
			while (length > 0);


			return unicodeString;
		}

	Object.defineProperty(this,"DataByte", { get: function()
	{
		var output = new Array();
		var MODE_NUMBER = 1;
	    var MODE_ROMAN_AND_NUMBER = 2;
	    var MODE_8BIT_BYTE = 4;
	    var MODE_KANJI = 8;
		do
					{
						var mode = this.NextMode();
						//canvas.println("mode: " + mode);
						if (mode == 0)
						{
							if (output.length > 0)
								break;
							else
								throw "Empty data block";
						}
						//if (mode != 1 && mode != 2 && mode != 4 && mode != 8)
						//	break;
						//}
						if (mode != MODE_NUMBER && mode != MODE_ROMAN_AND_NUMBER && mode != MODE_8BIT_BYTE && mode != MODE_KANJI)
						{
							/*					canvas.println("Invalid mode: " + mode);
							mode = guessMode(mode);
							canvas.println("Guessed mode: " + mode); */
							throw "Invalid mode: " + mode + " in (block:" + this.blockPointer + " bit:" + this.bitPointer + ")";
						}
						dataLength = this.getDataLength(mode);
						if (dataLength < 1)
							throw "Invalid data length: " + dataLength;
						//canvas.println("length: " + dataLength);
						switch (mode)
						{

							case MODE_NUMBER:
								//canvas.println("Mode: Figure");
								var temp_str = this.getFigureString(dataLength);
								var ta = new Array(temp_str.length);
								for(var j=0;j<temp_str.length;j++)
									ta[j]=temp_str.charCodeAt(j);
								output.push(ta);
								break;

							case MODE_ROMAN_AND_NUMBER:
								//canvas.println("Mode: Roman&Figure");
								var temp_str = this.getRomanAndFigureString(dataLength);
								var ta = new Array(temp_str.length);
								for(var j=0;j<temp_str.length;j++)
									ta[j]=temp_str.charCodeAt(j);
								output.push(ta );
								//output.Write(SystemUtils.ToByteArray(temp_sbyteArray2), 0, temp_sbyteArray2.length);
								break;

							case MODE_8BIT_BYTE:
								//canvas.println("Mode: 8bit Byte");
								//sbyte[] temp_sbyteArray3;
								var temp_sbyteArray3 = this.get8bitByteArray(dataLength);
								output.push(temp_sbyteArray3);
								//output.Write(SystemUtils.ToByteArray(temp_sbyteArray3), 0, temp_sbyteArray3.length);
								break;

							case MODE_KANJI:
								//canvas.println("Mode: Kanji");
								//sbyte[] temp_sbyteArray4;
								//temp_sbyteArray4 = SystemUtils.ToSByteArray(SystemUtils.ToByteArray(getKanjiString(dataLength)));
								//output.Write(SystemUtils.ToByteArray(temp_sbyteArray4), 0, temp_sbyteArray4.length);
                                var temp_str = this.getKanjiString(dataLength);
								output.push(temp_str);
								break;
							}
						//
						//canvas.println("DataLength: " + dataLength);
					}
					while (true);
		return output;
	}});
}

module.exports=QrCode;

},{}],2:[function(require,module,exports){
var QRCodeReader = require('qrcode-reader');

var video  = document.getElementById('camera');
var canvas = document.getElementById('qr-canvas');
var ctx    = canvas.getContext('2d');

// Temporary hack, set to roomba computer.
// Robot does not have rossserver.
var ros = new ROSLIB.Ros({
    url : 'wss://roomba.cs.washington.edu:9090'
});

ros.on('error', function(err) {
    console.log(err);
});

ros.on('connection', function() {
    console.log('Connected to websocket server.');
});

var qr_code_topic = new ROSLIB.Topic({
    ros : ros,
    name : '/jeeves_qr_code',
    messageType : 'jeeves/Order'
});

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

if (navigator.getUserMedia) {
    navigator.getUserMedia({video: true}, handleVideo, videoError);
}

function handleVideo(stream) {
    video.src = window.URL.createObjectURL(stream);
}

function videoError(e) {
    console.log(e);
}

var reader = new QRCodeReader();
reader.callback = function (res) {
  if (!res.startsWith('error')) {
    console.log(res);
    var data = res.split(',');
    if (data.length == 4) {
        var name = data[0];
        var phone = data[1];
        var location = data[2];
        var foodType = data[3];
        console.log(res);
        console.log(name);
        console.log(location);
        console.log(foodType);
        var order = new ROSLIB.Message({
            name : name,
            phone_number: phone,
            location: location,
            food_type: foodType
        });
        qr_code_topic.publish(order);
      }
  }
  else {
    console.log(res);
  }
};

video.addEventListener('play', function () {
    var $this = this; //cache
    width = video.clientWidth;
    height = video.clientHeight;
    canvas.width = width;
    canvas.height = height;
    (function loop() {
        if (!$this.paused && !$this.ended) {
            ctx.drawImage($this, 0, 0);
            setTimeout(loop, 1000 / 30); // drawing at 30fps
            reader.decode();
        }
    })();
}, 0);

function qr_callback(res) {
}

},{"qrcode-reader":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcXJjb2RlLXJlYWRlci9kaXN0L2luZGV4LmpzIiwiL2hvbWUvY3NlL2RzaWx2YV9oYWdnZXJfbWF0aHVyL2plZXZlcy9zY3JpcHRzL1FSY2FwdHVyZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNydEhBLElBQUksWUFBWSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQzs7QUFFNUMsSUFBSSxLQUFLLElBQUksUUFBUSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMvQyxJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ2xELElBQUksR0FBRyxNQUFNLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXJDLDBDQUEwQztBQUMxQyxrQ0FBa0M7QUFDbEMsSUFBSSxHQUFHLEdBQUcsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ3JCLEdBQUcsR0FBRyxxQ0FBcUM7QUFDL0MsQ0FBQyxDQUFDLENBQUM7O0FBRUgsR0FBRyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxHQUFHLEVBQUU7SUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyQixDQUFDLENBQUMsQ0FBQzs7QUFFSCxHQUFHLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxXQUFXO0lBQzVCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztBQUNsRCxDQUFDLENBQUMsQ0FBQzs7QUFFSCxJQUFJLGFBQWEsR0FBRyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDakMsR0FBRyxHQUFHLEdBQUc7SUFDVCxJQUFJLEdBQUcsaUJBQWlCO0lBQ3hCLFdBQVcsR0FBRyxjQUFjO0FBQ2hDLENBQUMsQ0FBQyxDQUFDOztBQUVILFNBQVMsQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDLFlBQVksSUFBSSxTQUFTLENBQUMsa0JBQWtCLElBQUksU0FBUyxDQUFDLGVBQWUsSUFBSSxTQUFTLENBQUMsY0FBYyxJQUFJLFNBQVMsQ0FBQyxhQUFhLENBQUM7O0FBRXBLLElBQUksU0FBUyxDQUFDLFlBQVksRUFBRTtJQUN4QixTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNuRSxDQUFDOztBQUVELFNBQVMsV0FBVyxDQUFDLE1BQU0sRUFBRTtJQUN6QixLQUFLLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ25ELENBQUM7O0FBRUQsU0FBUyxVQUFVLENBQUMsQ0FBQyxFQUFFO0lBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkIsQ0FBQzs7QUFFRCxJQUFJLE1BQU0sR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO0FBQ2hDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsVUFBVSxHQUFHLEVBQUU7RUFDL0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7SUFDNUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqQixJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzFCLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7UUFDbEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25CLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdEIsSUFBSSxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDO1lBQzNCLElBQUksR0FBRyxJQUFJO1lBQ1gsWUFBWSxFQUFFLEtBQUs7WUFDbkIsUUFBUSxFQUFFLFFBQVE7WUFDbEIsU0FBUyxFQUFFLFFBQVE7U0FDdEIsQ0FBQyxDQUFDO1FBQ0gsYUFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUM5QjtHQUNKO09BQ0k7SUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQ2xCO0FBQ0gsQ0FBQyxDQUFDOztBQUVGLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsWUFBWTtJQUN2QyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDakIsS0FBSyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7SUFDMUIsTUFBTSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUM7SUFDNUIsTUFBTSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDckIsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDdkIsQ0FBQyxTQUFTLElBQUksR0FBRztRQUNiLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRTtZQUMvQixHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0IsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDNUIsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ25CO0tBQ0osR0FBRyxDQUFDO0FBQ1QsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUVOLFNBQVMsV0FBVyxDQUFDLEdBQUcsRUFBRTtDQUN6QiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxuICBQb3J0ZWQgdG8gSmF2YVNjcmlwdCBieSBMYXphciBMYXN6bG8gMjAxMVxuXG4gIGxhemFyc29mdEBnbWFpbC5jb20sIHd3dy5sYXphcnNvZnQuaW5mb1xuXG4qL1xuXG4vKlxuKlxuKiBDb3B5cmlnaHQgMjAwNyBaWGluZyBhdXRob3JzXG4qXG4qIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4qIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4qXG4qICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4qXG4qIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cblxudmFyIEdyaWRTYW1wbGVyID0ge307XG5cbkdyaWRTYW1wbGVyLmNoZWNrQW5kTnVkZ2VQb2ludHM9ZnVuY3Rpb24oIGltYWdlLCAgcG9pbnRzKVxuXHRcdHtcblx0XHRcdHZhciB3aWR0aCA9IGltYWdlLndpZHRoO1xuXHRcdFx0dmFyIGhlaWdodCA9IGltYWdlLmhlaWdodDtcblx0XHRcdC8vIENoZWNrIGFuZCBudWRnZSBwb2ludHMgZnJvbSBzdGFydCB1bnRpbCB3ZSBzZWUgc29tZSB0aGF0IGFyZSBPSzpcblx0XHRcdHZhciBudWRnZWQgPSB0cnVlO1xuXHRcdFx0Zm9yICh2YXIgb2Zmc2V0ID0gMDsgb2Zmc2V0IDwgcG9pbnRzLmxlbmd0aCAmJiBudWRnZWQ7IG9mZnNldCArPSAyKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgeCA9IE1hdGguZmxvb3IgKHBvaW50c1tvZmZzZXRdKTtcblx0XHRcdFx0dmFyIHkgPSBNYXRoLmZsb29yKCBwb2ludHNbb2Zmc2V0ICsgMV0pO1xuXHRcdFx0XHRpZiAoeCA8IC0gMSB8fCB4ID4gd2lkdGggfHwgeSA8IC0gMSB8fCB5ID4gaGVpZ2h0KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dGhyb3cgXCJFcnJvci5jaGVja0FuZE51ZGdlUG9pbnRzIFwiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG51ZGdlZCA9IGZhbHNlO1xuXHRcdFx0XHRpZiAoeCA9PSAtIDEpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRwb2ludHNbb2Zmc2V0XSA9IDAuMDtcblx0XHRcdFx0XHRudWRnZWQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKHggPT0gd2lkdGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRwb2ludHNbb2Zmc2V0XSA9IHdpZHRoIC0gMTtcblx0XHRcdFx0XHRudWRnZWQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh5ID09IC0gMSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHBvaW50c1tvZmZzZXQgKyAxXSA9IDAuMDtcblx0XHRcdFx0XHRudWRnZWQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKHkgPT0gaGVpZ2h0KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cG9pbnRzW29mZnNldCArIDFdID0gaGVpZ2h0IC0gMTtcblx0XHRcdFx0XHRudWRnZWQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvLyBDaGVjayBhbmQgbnVkZ2UgcG9pbnRzIGZyb20gZW5kOlxuXHRcdFx0bnVkZ2VkID0gdHJ1ZTtcblx0XHRcdGZvciAodmFyIG9mZnNldCA9IHBvaW50cy5sZW5ndGggLSAyOyBvZmZzZXQgPj0gMCAmJiBudWRnZWQ7IG9mZnNldCAtPSAyKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgeCA9IE1hdGguZmxvb3IoIHBvaW50c1tvZmZzZXRdKTtcblx0XHRcdFx0dmFyIHkgPSBNYXRoLmZsb29yKCBwb2ludHNbb2Zmc2V0ICsgMV0pO1xuXHRcdFx0XHRpZiAoeCA8IC0gMSB8fCB4ID4gd2lkdGggfHwgeSA8IC0gMSB8fCB5ID4gaGVpZ2h0KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dGhyb3cgXCJFcnJvci5jaGVja0FuZE51ZGdlUG9pbnRzIFwiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG51ZGdlZCA9IGZhbHNlO1xuXHRcdFx0XHRpZiAoeCA9PSAtIDEpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRwb2ludHNbb2Zmc2V0XSA9IDAuMDtcblx0XHRcdFx0XHRudWRnZWQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKHggPT0gd2lkdGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRwb2ludHNbb2Zmc2V0XSA9IHdpZHRoIC0gMTtcblx0XHRcdFx0XHRudWRnZWQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh5ID09IC0gMSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHBvaW50c1tvZmZzZXQgKyAxXSA9IDAuMDtcblx0XHRcdFx0XHRudWRnZWQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKHkgPT0gaGVpZ2h0KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cG9pbnRzW29mZnNldCArIDFdID0gaGVpZ2h0IC0gMTtcblx0XHRcdFx0XHRudWRnZWQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cblxuR3JpZFNhbXBsZXIuc2FtcGxlR3JpZDM9ZnVuY3Rpb24oIGltYWdlLCAgZGltZW5zaW9uLCAgdHJhbnNmb3JtKVxuXHRcdHtcblx0XHRcdHZhciBiaXRzID0gbmV3IEJpdE1hdHJpeChkaW1lbnNpb24pO1xuXHRcdFx0dmFyIHBvaW50cyA9IG5ldyBBcnJheShkaW1lbnNpb24gPDwgMSk7XG5cdFx0XHRmb3IgKHZhciB5ID0gMDsgeSA8IGRpbWVuc2lvbjsgeSsrKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgbWF4ID0gcG9pbnRzLmxlbmd0aDtcblx0XHRcdFx0dmFyIGlWYWx1ZSA9ICB5ICsgMC41O1xuXHRcdFx0XHRmb3IgKHZhciB4ID0gMDsgeCA8IG1heDsgeCArPSAyKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cG9pbnRzW3hdID0gICh4ID4+IDEpICsgMC41O1xuXHRcdFx0XHRcdHBvaW50c1t4ICsgMV0gPSBpVmFsdWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0dHJhbnNmb3JtLnRyYW5zZm9ybVBvaW50czEocG9pbnRzKTtcblx0XHRcdFx0Ly8gUXVpY2sgY2hlY2sgdG8gc2VlIGlmIHBvaW50cyB0cmFuc2Zvcm1lZCB0byBzb21ldGhpbmcgaW5zaWRlIHRoZSBpbWFnZTtcblx0XHRcdFx0Ly8gc3VmZmljaWVudCB0byBjaGVjayB0aGUgZW5kcG9pbnRzXG5cdFx0XHRcdEdyaWRTYW1wbGVyLmNoZWNrQW5kTnVkZ2VQb2ludHMoaW1hZ2UsIHBvaW50cyk7XG5cdFx0XHRcdHRyeVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Zm9yICh2YXIgeCA9IDA7IHggPCBtYXg7IHggKz0gMilcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR2YXIgeHBvaW50ID0gKE1hdGguZmxvb3IoIHBvaW50c1t4XSkgKiA0KSArIChNYXRoLmZsb29yKCBwb2ludHNbeCArIDFdKSAqIGltYWdlLndpZHRoICogNCk7XG5cdFx0XHRcdFx0XHR2YXIgYml0ID0gaW1hZ2UuZGF0YVtNYXRoLmZsb29yKCBwb2ludHNbeF0pKyBpbWFnZS53aWR0aCogTWF0aC5mbG9vciggcG9pbnRzW3ggKyAxXSldO1xuXHRcdFx0XHRcdFx0Ly9iaXRzW3ggPj4gMV1bIHldPWJpdDtcblx0XHRcdFx0XHRcdGlmKGJpdClcblx0XHRcdFx0XHRcdFx0Yml0cy5zZXRfUmVuYW1lZCh4ID4+IDEsIHkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRjYXRjaCAoIGFpb29iZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIFRoaXMgZmVlbHMgd3JvbmcsIGJ1dCwgc29tZXRpbWVzIGlmIHRoZSBmaW5kZXIgcGF0dGVybnMgYXJlIG1pc2lkZW50aWZpZWQsIHRoZSByZXN1bHRpbmdcblx0XHRcdFx0XHQvLyB0cmFuc2Zvcm0gZ2V0cyBcInR3aXN0ZWRcIiBzdWNoIHRoYXQgaXQgbWFwcyBhIHN0cmFpZ2h0IGxpbmUgb2YgcG9pbnRzIHRvIGEgc2V0IG9mIHBvaW50c1xuXHRcdFx0XHRcdC8vIHdob3NlIGVuZHBvaW50cyBhcmUgaW4gYm91bmRzLCBidXQgb3RoZXJzIGFyZSBub3QuIFRoZXJlIGlzIHByb2JhYmx5IHNvbWUgbWF0aGVtYXRpY2FsXG5cdFx0XHRcdFx0Ly8gd2F5IHRvIGRldGVjdCB0aGlzIGFib3V0IHRoZSB0cmFuc2Zvcm1hdGlvbiB0aGF0IEkgZG9uJ3Qga25vdyB5ZXQuXG5cdFx0XHRcdFx0Ly8gVGhpcyByZXN1bHRzIGluIGFuIHVnbHkgcnVudGltZSBleGNlcHRpb24gZGVzcGl0ZSBvdXIgY2xldmVyIGNoZWNrcyBhYm92ZSAtLSBjYW4ndCBoYXZlXG5cdFx0XHRcdFx0Ly8gdGhhdC4gV2UgY291bGQgY2hlY2sgZWFjaCBwb2ludCdzIGNvb3JkaW5hdGVzIGJ1dCB0aGF0IGZlZWxzIGR1cGxpY2F0aXZlLiBXZSBzZXR0bGUgZm9yXG5cdFx0XHRcdFx0Ly8gY2F0Y2hpbmcgYW5kIHdyYXBwaW5nIEFycmF5SW5kZXhPdXRPZkJvdW5kc0V4Y2VwdGlvbi5cblx0XHRcdFx0XHR0aHJvdyBcIkVycm9yLmNoZWNrQW5kTnVkZ2VQb2ludHNcIjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGJpdHM7XG5cdFx0fVxuXG4vKlxuICBQb3J0ZWQgdG8gSmF2YVNjcmlwdCBieSBMYXphciBMYXN6bG8gMjAxMVxuXG4gIGxhemFyc29mdEBnbWFpbC5jb20sIHd3dy5sYXphcnNvZnQuaW5mb1xuXG4qL1xuXG4vKlxuKlxuKiBDb3B5cmlnaHQgMjAwNyBaWGluZyBhdXRob3JzXG4qXG4qIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4qIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4qXG4qICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4qXG4qIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cblxuXG5mdW5jdGlvbiBFQ0IoY291bnQsICBkYXRhQ29kZXdvcmRzKVxue1xuXHR0aGlzLmNvdW50ID0gY291bnQ7XG5cdHRoaXMuZGF0YUNvZGV3b3JkcyA9IGRhdGFDb2Rld29yZHM7XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJDb3VudFwiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuY291bnQ7XG5cdH19KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJEYXRhQ29kZXdvcmRzXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5kYXRhQ29kZXdvcmRzO1xuXHR9fSk7XG59XG5cbmZ1bmN0aW9uIEVDQmxvY2tzKCBlY0NvZGV3b3Jkc1BlckJsb2NrLCAgZWNCbG9ja3MxLCAgZWNCbG9ja3MyKVxue1xuXHR0aGlzLmVjQ29kZXdvcmRzUGVyQmxvY2sgPSBlY0NvZGV3b3Jkc1BlckJsb2NrO1xuXHRpZihlY0Jsb2NrczIpXG5cdFx0dGhpcy5lY0Jsb2NrcyA9IG5ldyBBcnJheShlY0Jsb2NrczEsIGVjQmxvY2tzMik7XG5cdGVsc2Vcblx0XHR0aGlzLmVjQmxvY2tzID0gbmV3IEFycmF5KGVjQmxvY2tzMSk7XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJFQ0NvZGV3b3Jkc1BlckJsb2NrXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5lY0NvZGV3b3Jkc1BlckJsb2NrO1xuXHR9fSk7XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJUb3RhbEVDQ29kZXdvcmRzXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gIHRoaXMuZWNDb2Rld29yZHNQZXJCbG9jayAqIHRoaXMuTnVtQmxvY2tzO1xuXHR9fSk7XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJOdW1CbG9ja3NcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHZhciB0b3RhbCA9IDA7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVjQmxvY2tzLmxlbmd0aDsgaSsrKVxuXHRcdHtcblx0XHRcdHRvdGFsICs9IHRoaXMuZWNCbG9ja3NbaV0ubGVuZ3RoO1xuXHRcdH1cblx0XHRyZXR1cm4gdG90YWw7XG5cdH19KTtcblxuXHR0aGlzLmdldEVDQmxvY2tzPWZ1bmN0aW9uKClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuZWNCbG9ja3M7XG5cdFx0XHR9XG59XG5cbmZ1bmN0aW9uIFZlcnNpb24oIHZlcnNpb25OdW1iZXIsICBhbGlnbm1lbnRQYXR0ZXJuQ2VudGVycywgIGVjQmxvY2tzMSwgIGVjQmxvY2tzMiwgIGVjQmxvY2tzMywgIGVjQmxvY2tzNClcbntcblx0dGhpcy52ZXJzaW9uTnVtYmVyID0gdmVyc2lvbk51bWJlcjtcblx0dGhpcy5hbGlnbm1lbnRQYXR0ZXJuQ2VudGVycyA9IGFsaWdubWVudFBhdHRlcm5DZW50ZXJzO1xuXHR0aGlzLmVjQmxvY2tzID0gbmV3IEFycmF5KGVjQmxvY2tzMSwgZWNCbG9ja3MyLCBlY0Jsb2NrczMsIGVjQmxvY2tzNCk7XG5cblx0dmFyIHRvdGFsID0gMDtcblx0dmFyIGVjQ29kZXdvcmRzID0gZWNCbG9ja3MxLkVDQ29kZXdvcmRzUGVyQmxvY2s7XG5cdHZhciBlY2JBcnJheSA9IGVjQmxvY2tzMS5nZXRFQ0Jsb2NrcygpO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGVjYkFycmF5Lmxlbmd0aDsgaSsrKVxuXHR7XG5cdFx0dmFyIGVjQmxvY2sgPSBlY2JBcnJheVtpXTtcblx0XHR0b3RhbCArPSBlY0Jsb2NrLkNvdW50ICogKGVjQmxvY2suRGF0YUNvZGV3b3JkcyArIGVjQ29kZXdvcmRzKTtcblx0fVxuXHR0aGlzLnRvdGFsQ29kZXdvcmRzID0gdG90YWw7XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJWZXJzaW9uTnVtYmVyXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gIHRoaXMudmVyc2lvbk51bWJlcjtcblx0fX0pO1xuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiQWxpZ25tZW50UGF0dGVybkNlbnRlcnNcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiAgdGhpcy5hbGlnbm1lbnRQYXR0ZXJuQ2VudGVycztcblx0fX0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIlRvdGFsQ29kZXdvcmRzXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gIHRoaXMudG90YWxDb2Rld29yZHM7XG5cdH19KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJEaW1lbnNpb25Gb3JWZXJzaW9uXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gIDE3ICsgNCAqIHRoaXMudmVyc2lvbk51bWJlcjtcblx0fX0pO1xuXG5cdHRoaXMuYnVpbGRGdW5jdGlvblBhdHRlcm49ZnVuY3Rpb24oKVxuXHRcdHtcblx0XHRcdHZhciBkaW1lbnNpb24gPSB0aGlzLkRpbWVuc2lvbkZvclZlcnNpb247XG5cdFx0XHR2YXIgYml0TWF0cml4ID0gbmV3IEJpdE1hdHJpeChkaW1lbnNpb24pO1xuXG5cdFx0XHQvLyBUb3AgbGVmdCBmaW5kZXIgcGF0dGVybiArIHNlcGFyYXRvciArIGZvcm1hdFxuXHRcdFx0Yml0TWF0cml4LnNldFJlZ2lvbigwLCAwLCA5LCA5KTtcblx0XHRcdC8vIFRvcCByaWdodCBmaW5kZXIgcGF0dGVybiArIHNlcGFyYXRvciArIGZvcm1hdFxuXHRcdFx0Yml0TWF0cml4LnNldFJlZ2lvbihkaW1lbnNpb24gLSA4LCAwLCA4LCA5KTtcblx0XHRcdC8vIEJvdHRvbSBsZWZ0IGZpbmRlciBwYXR0ZXJuICsgc2VwYXJhdG9yICsgZm9ybWF0XG5cdFx0XHRiaXRNYXRyaXguc2V0UmVnaW9uKDAsIGRpbWVuc2lvbiAtIDgsIDksIDgpO1xuXG5cdFx0XHQvLyBBbGlnbm1lbnQgcGF0dGVybnNcblx0XHRcdHZhciBtYXggPSB0aGlzLmFsaWdubWVudFBhdHRlcm5DZW50ZXJzLmxlbmd0aDtcblx0XHRcdGZvciAodmFyIHggPSAwOyB4IDwgbWF4OyB4KyspXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBpID0gdGhpcy5hbGlnbm1lbnRQYXR0ZXJuQ2VudGVyc1t4XSAtIDI7XG5cdFx0XHRcdGZvciAodmFyIHkgPSAwOyB5IDwgbWF4OyB5KyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoKHggPT0gMCAmJiAoeSA9PSAwIHx8IHkgPT0gbWF4IC0gMSkpIHx8ICh4ID09IG1heCAtIDEgJiYgeSA9PSAwKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyBObyBhbGlnbm1lbnQgcGF0dGVybnMgbmVhciB0aGUgdGhyZWUgZmluZGVyIHBhdGVybnNcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRiaXRNYXRyaXguc2V0UmVnaW9uKHRoaXMuYWxpZ25tZW50UGF0dGVybkNlbnRlcnNbeV0gLSAyLCBpLCA1LCA1KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBWZXJ0aWNhbCB0aW1pbmcgcGF0dGVyblxuXHRcdFx0Yml0TWF0cml4LnNldFJlZ2lvbig2LCA5LCAxLCBkaW1lbnNpb24gLSAxNyk7XG5cdFx0XHQvLyBIb3Jpem9udGFsIHRpbWluZyBwYXR0ZXJuXG5cdFx0XHRiaXRNYXRyaXguc2V0UmVnaW9uKDksIDYsIGRpbWVuc2lvbiAtIDE3LCAxKTtcblxuXHRcdFx0aWYgKHRoaXMudmVyc2lvbk51bWJlciA+IDYpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIFZlcnNpb24gaW5mbywgdG9wIHJpZ2h0XG5cdFx0XHRcdGJpdE1hdHJpeC5zZXRSZWdpb24oZGltZW5zaW9uIC0gMTEsIDAsIDMsIDYpO1xuXHRcdFx0XHQvLyBWZXJzaW9uIGluZm8sIGJvdHRvbSBsZWZ0XG5cdFx0XHRcdGJpdE1hdHJpeC5zZXRSZWdpb24oMCwgZGltZW5zaW9uIC0gMTEsIDYsIDMpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gYml0TWF0cml4O1xuXHRcdH1cblx0dGhpcy5nZXRFQ0Jsb2Nrc0ZvckxldmVsPWZ1bmN0aW9uKCBlY0xldmVsKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuZWNCbG9ja3NbZWNMZXZlbC5vcmRpbmFsKCldO1xuXHR9XG59XG5cblZlcnNpb24uVkVSU0lPTl9ERUNPREVfSU5GTyA9IG5ldyBBcnJheSgweDA3Qzk0LCAweDA4NUJDLCAweDA5QTk5LCAweDBBNEQzLCAweDBCQkY2LCAweDBDNzYyLCAweDBEODQ3LCAweDBFNjBELCAweDBGOTI4LCAweDEwQjc4LCAweDExNDVELCAweDEyQTE3LCAweDEzNTMyLCAweDE0OUE2LCAweDE1NjgzLCAweDE2OEM5LCAweDE3N0VDLCAweDE4RUM0LCAweDE5MUUxLCAweDFBRkFCLCAweDFCMDhFLCAweDFDQzFBLCAweDFEMzNGLCAweDFFRDc1LCAweDFGMjUwLCAweDIwOUQ1LCAweDIxNkYwLCAweDIyOEJBLCAweDIzNzlGLCAweDI0QjBCLCAweDI1NDJFLCAweDI2QTY0LCAweDI3NTQxLCAweDI4QzY5KTtcblxuVmVyc2lvbi5WRVJTSU9OUyA9IGJ1aWxkVmVyc2lvbnMoKTtcblxuVmVyc2lvbi5nZXRWZXJzaW9uRm9yTnVtYmVyPWZ1bmN0aW9uKCB2ZXJzaW9uTnVtYmVyKVxue1xuXHRpZiAodmVyc2lvbk51bWJlciA8IDEgfHwgdmVyc2lvbk51bWJlciA+IDQwKVxuXHR7XG5cdFx0dGhyb3cgXCJBcmd1bWVudEV4Y2VwdGlvblwiO1xuXHR9XG5cdHJldHVybiBWZXJzaW9uLlZFUlNJT05TW3ZlcnNpb25OdW1iZXIgLSAxXTtcbn1cblxuVmVyc2lvbi5nZXRQcm92aXNpb25hbFZlcnNpb25Gb3JEaW1lbnNpb249ZnVuY3Rpb24oZGltZW5zaW9uKVxue1xuXHRpZiAoZGltZW5zaW9uICUgNCAhPSAxKVxuXHR7XG5cdFx0dGhyb3cgXCJFcnJvciBnZXRQcm92aXNpb25hbFZlcnNpb25Gb3JEaW1lbnNpb25cIjtcblx0fVxuXHR0cnlcblx0e1xuXHRcdHJldHVybiBWZXJzaW9uLmdldFZlcnNpb25Gb3JOdW1iZXIoKGRpbWVuc2lvbiAtIDE3KSA+PiAyKTtcblx0fVxuXHRjYXRjaCAoIGlhZSlcblx0e1xuXHRcdHRocm93IFwiRXJyb3IgZ2V0VmVyc2lvbkZvck51bWJlclwiO1xuXHR9XG59XG5cblZlcnNpb24uZGVjb2RlVmVyc2lvbkluZm9ybWF0aW9uPWZ1bmN0aW9uKCB2ZXJzaW9uQml0cylcbntcblx0dmFyIGJlc3REaWZmZXJlbmNlID0gMHhmZmZmZmZmZjtcblx0dmFyIGJlc3RWZXJzaW9uID0gMDtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBWZXJzaW9uLlZFUlNJT05fREVDT0RFX0lORk8ubGVuZ3RoOyBpKyspXG5cdHtcblx0XHR2YXIgdGFyZ2V0VmVyc2lvbiA9IFZlcnNpb24uVkVSU0lPTl9ERUNPREVfSU5GT1tpXTtcblx0XHQvLyBEbyB0aGUgdmVyc2lvbiBpbmZvIGJpdHMgbWF0Y2ggZXhhY3RseT8gZG9uZS5cblx0XHRpZiAodGFyZ2V0VmVyc2lvbiA9PSB2ZXJzaW9uQml0cylcblx0XHR7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRWZXJzaW9uRm9yTnVtYmVyKGkgKyA3KTtcblx0XHR9XG5cdFx0Ly8gT3RoZXJ3aXNlIHNlZSBpZiB0aGlzIGlzIHRoZSBjbG9zZXN0IHRvIGEgcmVhbCB2ZXJzaW9uIGluZm8gYml0IHN0cmluZ1xuXHRcdC8vIHdlIGhhdmUgc2VlbiBzbyBmYXJcblx0XHR2YXIgYml0c0RpZmZlcmVuY2UgPSBGb3JtYXRJbmZvcm1hdGlvbi5udW1CaXRzRGlmZmVyaW5nKHZlcnNpb25CaXRzLCB0YXJnZXRWZXJzaW9uKTtcblx0XHRpZiAoYml0c0RpZmZlcmVuY2UgPCBiZXN0RGlmZmVyZW5jZSlcblx0XHR7XG5cdFx0XHRiZXN0VmVyc2lvbiA9IGkgKyA3O1xuXHRcdFx0YmVzdERpZmZlcmVuY2UgPSBiaXRzRGlmZmVyZW5jZTtcblx0XHR9XG5cdH1cblx0Ly8gV2UgY2FuIHRvbGVyYXRlIHVwIHRvIDMgYml0cyBvZiBlcnJvciBzaW5jZSBubyB0d28gdmVyc2lvbiBpbmZvIGNvZGV3b3JkcyB3aWxsXG5cdC8vIGRpZmZlciBpbiBsZXNzIHRoYW4gNCBiaXRzLlxuXHRpZiAoYmVzdERpZmZlcmVuY2UgPD0gMylcblx0e1xuXHRcdHJldHVybiB0aGlzLmdldFZlcnNpb25Gb3JOdW1iZXIoYmVzdFZlcnNpb24pO1xuXHR9XG5cdC8vIElmIHdlIGRpZG4ndCBmaW5kIGEgY2xvc2UgZW5vdWdoIG1hdGNoLCBmYWlsXG5cdHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBidWlsZFZlcnNpb25zKClcbntcblx0cmV0dXJuIG5ldyBBcnJheShuZXcgVmVyc2lvbigxLCBuZXcgQXJyYXkoKSwgbmV3IEVDQmxvY2tzKDcsIG5ldyBFQ0IoMSwgMTkpKSwgbmV3IEVDQmxvY2tzKDEwLCBuZXcgRUNCKDEsIDE2KSksIG5ldyBFQ0Jsb2NrcygxMywgbmV3IEVDQigxLCAxMykpLCBuZXcgRUNCbG9ja3MoMTcsIG5ldyBFQ0IoMSwgOSkpKSxcblx0bmV3IFZlcnNpb24oMiwgbmV3IEFycmF5KDYsIDE4KSwgbmV3IEVDQmxvY2tzKDEwLCBuZXcgRUNCKDEsIDM0KSksIG5ldyBFQ0Jsb2NrcygxNiwgbmV3IEVDQigxLCAyOCkpLCBuZXcgRUNCbG9ja3MoMjIsIG5ldyBFQ0IoMSwgMjIpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDEsIDE2KSkpLFxuXHRuZXcgVmVyc2lvbigzLCBuZXcgQXJyYXkoNiwgMjIpLCBuZXcgRUNCbG9ja3MoMTUsIG5ldyBFQ0IoMSwgNTUpKSwgbmV3IEVDQmxvY2tzKDI2LCBuZXcgRUNCKDEsIDQ0KSksIG5ldyBFQ0Jsb2NrcygxOCwgbmV3IEVDQigyLCAxNykpLCBuZXcgRUNCbG9ja3MoMjIsIG5ldyBFQ0IoMiwgMTMpKSksXG5cdG5ldyBWZXJzaW9uKDQsIG5ldyBBcnJheSg2LCAyNiksIG5ldyBFQ0Jsb2NrcygyMCwgbmV3IEVDQigxLCA4MCkpLCBuZXcgRUNCbG9ja3MoMTgsIG5ldyBFQ0IoMiwgMzIpKSwgbmV3IEVDQmxvY2tzKDI2LCBuZXcgRUNCKDIsIDI0KSksIG5ldyBFQ0Jsb2NrcygxNiwgbmV3IEVDQig0LCA5KSkpLFxuXHRuZXcgVmVyc2lvbig1LCBuZXcgQXJyYXkoNiwgMzApLCBuZXcgRUNCbG9ja3MoMjYsIG5ldyBFQ0IoMSwgMTA4KSksIG5ldyBFQ0Jsb2NrcygyNCwgbmV3IEVDQigyLCA0MykpLCBuZXcgRUNCbG9ja3MoMTgsIG5ldyBFQ0IoMiwgMTUpLCBuZXcgRUNCKDIsIDE2KSksIG5ldyBFQ0Jsb2NrcygyMiwgbmV3IEVDQigyLCAxMSksIG5ldyBFQ0IoMiwgMTIpKSksXG5cdG5ldyBWZXJzaW9uKDYsIG5ldyBBcnJheSg2LCAzNCksIG5ldyBFQ0Jsb2NrcygxOCwgbmV3IEVDQigyLCA2OCkpLCBuZXcgRUNCbG9ja3MoMTYsIG5ldyBFQ0IoNCwgMjcpKSwgbmV3IEVDQmxvY2tzKDI0LCBuZXcgRUNCKDQsIDE5KSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQig0LCAxNSkpKSxcblx0bmV3IFZlcnNpb24oNywgbmV3IEFycmF5KDYsIDIyLCAzOCksIG5ldyBFQ0Jsb2NrcygyMCwgbmV3IEVDQigyLCA3OCkpLCBuZXcgRUNCbG9ja3MoMTgsIG5ldyBFQ0IoNCwgMzEpKSwgbmV3IEVDQmxvY2tzKDE4LCBuZXcgRUNCKDIsIDE0KSwgbmV3IEVDQig0LCAxNSkpLCBuZXcgRUNCbG9ja3MoMjYsIG5ldyBFQ0IoNCwgMTMpLCBuZXcgRUNCKDEsIDE0KSkpLFxuXHRuZXcgVmVyc2lvbig4LCBuZXcgQXJyYXkoNiwgMjQsIDQyKSwgbmV3IEVDQmxvY2tzKDI0LCBuZXcgRUNCKDIsIDk3KSksIG5ldyBFQ0Jsb2NrcygyMiwgbmV3IEVDQigyLCAzOCksIG5ldyBFQ0IoMiwgMzkpKSwgbmV3IEVDQmxvY2tzKDIyLCBuZXcgRUNCKDQsIDE4KSwgbmV3IEVDQigyLCAxOSkpLCBuZXcgRUNCbG9ja3MoMjYsIG5ldyBFQ0IoNCwgMTQpLCBuZXcgRUNCKDIsIDE1KSkpLFxuXHRuZXcgVmVyc2lvbig5LCBuZXcgQXJyYXkoNiwgMjYsIDQ2KSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDIsIDExNikpLCBuZXcgRUNCbG9ja3MoMjIsIG5ldyBFQ0IoMywgMzYpLCBuZXcgRUNCKDIsIDM3KSksIG5ldyBFQ0Jsb2NrcygyMCwgbmV3IEVDQig0LCAxNiksIG5ldyBFQ0IoNCwgMTcpKSwgbmV3IEVDQmxvY2tzKDI0LCBuZXcgRUNCKDQsIDEyKSwgbmV3IEVDQig0LCAxMykpKSxcblx0bmV3IFZlcnNpb24oMTAsIG5ldyBBcnJheSg2LCAyOCwgNTApLCBuZXcgRUNCbG9ja3MoMTgsIG5ldyBFQ0IoMiwgNjgpLCBuZXcgRUNCKDIsIDY5KSksIG5ldyBFQ0Jsb2NrcygyNiwgbmV3IEVDQig0LCA0MyksIG5ldyBFQ0IoMSwgNDQpKSwgbmV3IEVDQmxvY2tzKDI0LCBuZXcgRUNCKDYsIDE5KSwgbmV3IEVDQigyLCAyMCkpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoNiwgMTUpLCBuZXcgRUNCKDIsIDE2KSkpLFxuXHRuZXcgVmVyc2lvbigxMSwgbmV3IEFycmF5KDYsIDMwLCA1NCksIG5ldyBFQ0Jsb2NrcygyMCwgbmV3IEVDQig0LCA4MSkpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMSwgNTApLCBuZXcgRUNCKDQsIDUxKSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQig0LCAyMiksIG5ldyBFQ0IoNCwgMjMpKSwgbmV3IEVDQmxvY2tzKDI0LCBuZXcgRUNCKDMsIDEyKSwgbmV3IEVDQig4LCAxMykpKSxcblx0bmV3IFZlcnNpb24oMTIsIG5ldyBBcnJheSg2LCAzMiwgNTgpLCBuZXcgRUNCbG9ja3MoMjQsIG5ldyBFQ0IoMiwgOTIpLCBuZXcgRUNCKDIsIDkzKSksIG5ldyBFQ0Jsb2NrcygyMiwgbmV3IEVDQig2LCAzNiksIG5ldyBFQ0IoMiwgMzcpKSwgbmV3IEVDQmxvY2tzKDI2LCBuZXcgRUNCKDQsIDIwKSwgbmV3IEVDQig2LCAyMSkpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoNywgMTQpLCBuZXcgRUNCKDQsIDE1KSkpLFxuXHRuZXcgVmVyc2lvbigxMywgbmV3IEFycmF5KDYsIDM0LCA2MiksIG5ldyBFQ0Jsb2NrcygyNiwgbmV3IEVDQig0LCAxMDcpKSwgbmV3IEVDQmxvY2tzKDIyLCBuZXcgRUNCKDgsIDM3KSwgbmV3IEVDQigxLCAzOCkpLCBuZXcgRUNCbG9ja3MoMjQsIG5ldyBFQ0IoOCwgMjApLCBuZXcgRUNCKDQsIDIxKSksIG5ldyBFQ0Jsb2NrcygyMiwgbmV3IEVDQigxMiwgMTEpLCBuZXcgRUNCKDQsIDEyKSkpLFxuXHRuZXcgVmVyc2lvbigxNCwgbmV3IEFycmF5KDYsIDI2LCA0NiwgNjYpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMywgMTE1KSwgbmV3IEVDQigxLCAxMTYpKSwgbmV3IEVDQmxvY2tzKDI0LCBuZXcgRUNCKDQsIDQwKSwgbmV3IEVDQig1LCA0MSkpLCBuZXcgRUNCbG9ja3MoMjAsIG5ldyBFQ0IoMTEsIDE2KSwgbmV3IEVDQig1LCAxNykpLCBuZXcgRUNCbG9ja3MoMjQsIG5ldyBFQ0IoMTEsIDEyKSwgbmV3IEVDQig1LCAxMykpKSxcblx0bmV3IFZlcnNpb24oMTUsIG5ldyBBcnJheSg2LCAyNiwgNDgsIDcwKSwgbmV3IEVDQmxvY2tzKDIyLCBuZXcgRUNCKDUsIDg3KSwgbmV3IEVDQigxLCA4OCkpLCBuZXcgRUNCbG9ja3MoMjQsIG5ldyBFQ0IoNSwgNDEpLCBuZXcgRUNCKDUsIDQyKSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQig1LCAyNCksIG5ldyBFQ0IoNywgMjUpKSwgbmV3IEVDQmxvY2tzKDI0LCBuZXcgRUNCKDExLCAxMiksIG5ldyBFQ0IoNywgMTMpKSksXG5cdG5ldyBWZXJzaW9uKDE2LCBuZXcgQXJyYXkoNiwgMjYsIDUwLCA3NCksIG5ldyBFQ0Jsb2NrcygyNCwgbmV3IEVDQig1LCA5OCksIG5ldyBFQ0IoMSwgOTkpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDcsIDQ1KSwgbmV3IEVDQigzLCA0NikpLCBuZXcgRUNCbG9ja3MoMjQsIG5ldyBFQ0IoMTUsIDE5KSwgbmV3IEVDQigyLCAyMCkpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMywgMTUpLCBuZXcgRUNCKDEzLCAxNikpKSxcblx0bmV3IFZlcnNpb24oMTcsIG5ldyBBcnJheSg2LCAzMCwgNTQsIDc4KSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDEsIDEwNyksIG5ldyBFQ0IoNSwgMTA4KSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigxMCwgNDYpLCBuZXcgRUNCKDEsIDQ3KSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigxLCAyMiksIG5ldyBFQ0IoMTUsIDIzKSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigyLCAxNCksIG5ldyBFQ0IoMTcsIDE1KSkpLFxuXHRuZXcgVmVyc2lvbigxOCwgbmV3IEFycmF5KDYsIDMwLCA1NiwgODIpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoNSwgMTIwKSwgbmV3IEVDQigxLCAxMjEpKSwgbmV3IEVDQmxvY2tzKDI2LCBuZXcgRUNCKDksIDQzKSwgbmV3IEVDQig0LCA0NCkpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMTcsIDIyKSwgbmV3IEVDQigxLCAyMykpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMiwgMTQpLCBuZXcgRUNCKDE5LCAxNSkpKSxcblx0bmV3IFZlcnNpb24oMTksIG5ldyBBcnJheSg2LCAzMCwgNTgsIDg2KSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDMsIDExMyksIG5ldyBFQ0IoNCwgMTE0KSksIG5ldyBFQ0Jsb2NrcygyNiwgbmV3IEVDQigzLCA0NCksIG5ldyBFQ0IoMTEsIDQ1KSksIG5ldyBFQ0Jsb2NrcygyNiwgbmV3IEVDQigxNywgMjEpLCBuZXcgRUNCKDQsIDIyKSksIG5ldyBFQ0Jsb2NrcygyNiwgbmV3IEVDQig5LCAxMyksIG5ldyBFQ0IoMTYsIDE0KSkpLFxuXHRuZXcgVmVyc2lvbigyMCwgbmV3IEFycmF5KDYsIDM0LCA2MiwgOTApLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMywgMTA3KSwgbmV3IEVDQig1LCAxMDgpKSwgbmV3IEVDQmxvY2tzKDI2LCBuZXcgRUNCKDMsIDQxKSwgbmV3IEVDQigxMywgNDIpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDE1LCAyNCksIG5ldyBFQ0IoNSwgMjUpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDE1LCAxNSksIG5ldyBFQ0IoMTAsIDE2KSkpLFxuXHRuZXcgVmVyc2lvbigyMSwgbmV3IEFycmF5KDYsIDI4LCA1MCwgNzIsIDk0KSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDQsIDExNiksIG5ldyBFQ0IoNCwgMTE3KSksIG5ldyBFQ0Jsb2NrcygyNiwgbmV3IEVDQigxNywgNDIpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDE3LCAyMiksIG5ldyBFQ0IoNiwgMjMpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDE5LCAxNiksIG5ldyBFQ0IoNiwgMTcpKSksXG5cdG5ldyBWZXJzaW9uKDIyLCBuZXcgQXJyYXkoNiwgMjYsIDUwLCA3NCwgOTgpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMiwgMTExKSwgbmV3IEVDQig3LCAxMTIpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDE3LCA0NikpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoNywgMjQpLCBuZXcgRUNCKDE2LCAyNSkpLCBuZXcgRUNCbG9ja3MoMjQsIG5ldyBFQ0IoMzQsIDEzKSkpLFxuXHRuZXcgVmVyc2lvbigyMywgbmV3IEFycmF5KDYsIDMwLCA1NCwgNzQsIDEwMiksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQig0LCAxMjEpLCBuZXcgRUNCKDUsIDEyMikpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoNCwgNDcpLCBuZXcgRUNCKDE0LCA0OCkpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMTEsIDI0KSwgbmV3IEVDQigxNCwgMjUpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDE2LCAxNSksIG5ldyBFQ0IoMTQsIDE2KSkpLFxuXHRuZXcgVmVyc2lvbigyNCwgbmV3IEFycmF5KDYsIDI4LCA1NCwgODAsIDEwNiksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQig2LCAxMTcpLCBuZXcgRUNCKDQsIDExOCkpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoNiwgNDUpLCBuZXcgRUNCKDE0LCA0NikpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMTEsIDI0KSwgbmV3IEVDQigxNiwgMjUpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDMwLCAxNiksIG5ldyBFQ0IoMiwgMTcpKSksXG5cdG5ldyBWZXJzaW9uKDI1LCBuZXcgQXJyYXkoNiwgMzIsIDU4LCA4NCwgMTEwKSwgbmV3IEVDQmxvY2tzKDI2LCBuZXcgRUNCKDgsIDEwNiksIG5ldyBFQ0IoNCwgMTA3KSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQig4LCA0NyksIG5ldyBFQ0IoMTMsIDQ4KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQig3LCAyNCksIG5ldyBFQ0IoMjIsIDI1KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigyMiwgMTUpLCBuZXcgRUNCKDEzLCAxNikpKSxcblx0bmV3IFZlcnNpb24oMjYsIG5ldyBBcnJheSg2LCAzMCwgNTgsIDg2LCAxMTQpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMTAsIDExNCksIG5ldyBFQ0IoMiwgMTE1KSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigxOSwgNDYpLCBuZXcgRUNCKDQsIDQ3KSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigyOCwgMjIpLCBuZXcgRUNCKDYsIDIzKSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigzMywgMTYpLCBuZXcgRUNCKDQsIDE3KSkpLFxuXHRuZXcgVmVyc2lvbigyNywgbmV3IEFycmF5KDYsIDM0LCA2MiwgOTAsIDExOCksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQig4LCAxMjIpLCBuZXcgRUNCKDQsIDEyMykpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMjIsIDQ1KSwgbmV3IEVDQigzLCA0NikpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoOCwgMjMpLCBuZXcgRUNCKDI2LCAyNCkpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMTIsIDE1KSwgXHRcdG5ldyBFQ0IoMjgsIDE2KSkpLFxuXHRuZXcgVmVyc2lvbigyOCwgbmV3IEFycmF5KDYsIDI2LCA1MCwgNzQsIDk4LCAxMjIpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMywgMTE3KSwgbmV3IEVDQigxMCwgMTE4KSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigzLCA0NSksIG5ldyBFQ0IoMjMsIDQ2KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQig0LCAyNCksIG5ldyBFQ0IoMzEsIDI1KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigxMSwgMTUpLCBuZXcgRUNCKDMxLCAxNikpKSxcblx0bmV3IFZlcnNpb24oMjksIG5ldyBBcnJheSg2LCAzMCwgNTQsIDc4LCAxMDIsIDEyNiksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQig3LCAxMTYpLCBuZXcgRUNCKDcsIDExNykpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMjEsIDQ1KSwgbmV3IEVDQig3LCA0NikpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMSwgMjMpLCBuZXcgRUNCKDM3LCAyNCkpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMTksIDE1KSwgbmV3IEVDQigyNiwgMTYpKSksXG5cdG5ldyBWZXJzaW9uKDMwLCBuZXcgQXJyYXkoNiwgMjYsIDUyLCA3OCwgMTA0LCAxMzApLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoNSwgMTE1KSwgbmV3IEVDQigxMCwgMTE2KSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigxOSwgNDcpLCBuZXcgRUNCKDEwLCA0OCkpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMTUsIDI0KSwgbmV3IEVDQigyNSwgMjUpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDIzLCAxNSksIG5ldyBFQ0IoMjUsIDE2KSkpLFxuXHRuZXcgVmVyc2lvbigzMSwgbmV3IEFycmF5KDYsIDMwLCA1NiwgODIsIDEwOCwgMTM0KSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDEzLCAxMTUpLCBuZXcgRUNCKDMsIDExNikpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMiwgNDYpLCBuZXcgRUNCKDI5LCA0NykpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoNDIsIDI0KSwgbmV3IEVDQigxLCAyNSkpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMjMsIDE1KSwgbmV3IEVDQigyOCwgMTYpKSksXG5cdG5ldyBWZXJzaW9uKDMyLCBuZXcgQXJyYXkoNiwgMzQsIDYwLCA4NiwgMTEyLCAxMzgpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMTcsIDExNSkpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMTAsIDQ2KSwgbmV3IEVDQigyMywgNDcpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDEwLCAyNCksIG5ldyBFQ0IoMzUsIDI1KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigxOSwgMTUpLCBuZXcgRUNCKDM1LCAxNikpKSxcblx0bmV3IFZlcnNpb24oMzMsIG5ldyBBcnJheSg2LCAzMCwgNTgsIDg2LCAxMTQsIDE0MiksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigxNywgMTE1KSwgbmV3IEVDQigxLCAxMTYpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDE0LCA0NiksIG5ldyBFQ0IoMjEsIDQ3KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigyOSwgMjQpLCBuZXcgRUNCKDE5LCAyNSkpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMTEsIDE1KSwgbmV3IEVDQig0NiwgMTYpKSksXG5cdG5ldyBWZXJzaW9uKDM0LCBuZXcgQXJyYXkoNiwgMzQsIDYyLCA5MCwgMTE4LCAxNDYpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMTMsIDExNSksIG5ldyBFQ0IoNiwgMTE2KSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigxNCwgNDYpLCBuZXcgRUNCKDIzLCA0NykpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoNDQsIDI0KSwgbmV3IEVDQig3LCAyNSkpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoNTksIDE2KSwgbmV3IEVDQigxLCAxNykpKSxcblx0bmV3IFZlcnNpb24oMzUsIG5ldyBBcnJheSg2LCAzMCwgNTQsIDc4LCAxMDIsIDEyNiwgMTUwKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDEyLCAxMjEpLCBuZXcgRUNCKDcsIDEyMikpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMTIsIDQ3KSwgbmV3IEVDQigyNiwgNDgpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDM5LCAyNCksIG5ldyBFQ0IoMTQsIDI1KSksbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDIyLCAxNSksIG5ldyBFQ0IoNDEsIDE2KSkpLFxuXHRuZXcgVmVyc2lvbigzNiwgbmV3IEFycmF5KDYsIDI0LCA1MCwgNzYsIDEwMiwgMTI4LCAxNTQpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoNiwgMTIxKSwgbmV3IEVDQigxNCwgMTIyKSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQig2LCA0NyksIG5ldyBFQ0IoMzQsIDQ4KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQig0NiwgMjQpLCBuZXcgRUNCKDEwLCAyNSkpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMiwgMTUpLCBuZXcgRUNCKDY0LCAxNikpKSxcblx0bmV3IFZlcnNpb24oMzcsIG5ldyBBcnJheSg2LCAyOCwgNTQsIDgwLCAxMDYsIDEzMiwgMTU4KSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDE3LCAxMjIpLCBuZXcgRUNCKDQsIDEyMykpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMjksIDQ2KSwgbmV3IEVDQigxNCwgNDcpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDQ5LCAyNCksIG5ldyBFQ0IoMTAsIDI1KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigyNCwgMTUpLCBuZXcgRUNCKDQ2LCAxNikpKSxcblx0bmV3IFZlcnNpb24oMzgsIG5ldyBBcnJheSg2LCAzMiwgNTgsIDg0LCAxMTAsIDEzNiwgMTYyKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDQsIDEyMiksIG5ldyBFQ0IoMTgsIDEyMykpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMTMsIDQ2KSwgbmV3IEVDQigzMiwgNDcpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDQ4LCAyNCksIG5ldyBFQ0IoMTQsIDI1KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQig0MiwgMTUpLCBuZXcgRUNCKDMyLCAxNikpKSxcblx0bmV3IFZlcnNpb24oMzksIG5ldyBBcnJheSg2LCAyNiwgNTQsIDgyLCAxMTAsIDEzOCwgMTY2KSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDIwLCAxMTcpLCBuZXcgRUNCKDQsIDExOCkpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoNDAsIDQ3KSwgbmV3IEVDQig3LCA0OCkpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoNDMsIDI0KSwgbmV3IEVDQigyMiwgMjUpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDEwLCAxNSksIG5ldyBFQ0IoNjcsIDE2KSkpLFxuXHRuZXcgVmVyc2lvbig0MCwgbmV3IEFycmF5KDYsIDMwLCA1OCwgODYsIDExNCwgMTQyLCAxNzApLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMTksIDExOCksIG5ldyBFQ0IoNiwgMTE5KSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigxOCwgNDcpLCBuZXcgRUNCKDMxLCA0OCkpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMzQsIDI0KSwgbmV3IEVDQigzNCwgMjUpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDIwLCAxNSksIG5ldyBFQ0IoNjEsIDE2KSkpKTtcbn1cblxuLypcbiAgUG9ydGVkIHRvIEphdmFTY3JpcHQgYnkgTGF6YXIgTGFzemxvIDIwMTFcblxuICBsYXphcnNvZnRAZ21haWwuY29tLCB3d3cubGF6YXJzb2Z0LmluZm9cblxuKi9cblxuLypcbipcbiogQ29weXJpZ2h0IDIwMDcgWlhpbmcgYXV0aG9yc1xuKlxuKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4qIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuKlxuKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuKlxuKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4qIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4qIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5cbmZ1bmN0aW9uIFBlcnNwZWN0aXZlVHJhbnNmb3JtKCBhMTEsICBhMjEsICBhMzEsICBhMTIsICBhMjIsICBhMzIsICBhMTMsICBhMjMsICBhMzMpXG57XG5cdHRoaXMuYTExID0gYTExO1xuXHR0aGlzLmExMiA9IGExMjtcblx0dGhpcy5hMTMgPSBhMTM7XG5cdHRoaXMuYTIxID0gYTIxO1xuXHR0aGlzLmEyMiA9IGEyMjtcblx0dGhpcy5hMjMgPSBhMjM7XG5cdHRoaXMuYTMxID0gYTMxO1xuXHR0aGlzLmEzMiA9IGEzMjtcblx0dGhpcy5hMzMgPSBhMzM7XG5cdHRoaXMudHJhbnNmb3JtUG9pbnRzMT1mdW5jdGlvbiggcG9pbnRzKVxuXHRcdHtcblx0XHRcdHZhciBtYXggPSBwb2ludHMubGVuZ3RoO1xuXHRcdFx0dmFyIGExMSA9IHRoaXMuYTExO1xuXHRcdFx0dmFyIGExMiA9IHRoaXMuYTEyO1xuXHRcdFx0dmFyIGExMyA9IHRoaXMuYTEzO1xuXHRcdFx0dmFyIGEyMSA9IHRoaXMuYTIxO1xuXHRcdFx0dmFyIGEyMiA9IHRoaXMuYTIyO1xuXHRcdFx0dmFyIGEyMyA9IHRoaXMuYTIzO1xuXHRcdFx0dmFyIGEzMSA9IHRoaXMuYTMxO1xuXHRcdFx0dmFyIGEzMiA9IHRoaXMuYTMyO1xuXHRcdFx0dmFyIGEzMyA9IHRoaXMuYTMzO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXg7IGkgKz0gMilcblx0XHRcdHtcblx0XHRcdFx0dmFyIHggPSBwb2ludHNbaV07XG5cdFx0XHRcdHZhciB5ID0gcG9pbnRzW2kgKyAxXTtcblx0XHRcdFx0dmFyIGRlbm9taW5hdG9yID0gYTEzICogeCArIGEyMyAqIHkgKyBhMzM7XG5cdFx0XHRcdHBvaW50c1tpXSA9IChhMTEgKiB4ICsgYTIxICogeSArIGEzMSkgLyBkZW5vbWluYXRvcjtcblx0XHRcdFx0cG9pbnRzW2kgKyAxXSA9IChhMTIgKiB4ICsgYTIyICogeSArIGEzMikgLyBkZW5vbWluYXRvcjtcblx0XHRcdH1cblx0XHR9XG5cdHRoaXMuIHRyYW5zZm9ybVBvaW50czI9ZnVuY3Rpb24oeFZhbHVlcywgeVZhbHVlcylcblx0XHR7XG5cdFx0XHR2YXIgbiA9IHhWYWx1ZXMubGVuZ3RoO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBuOyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdHZhciB4ID0geFZhbHVlc1tpXTtcblx0XHRcdFx0dmFyIHkgPSB5VmFsdWVzW2ldO1xuXHRcdFx0XHR2YXIgZGVub21pbmF0b3IgPSB0aGlzLmExMyAqIHggKyB0aGlzLmEyMyAqIHkgKyB0aGlzLmEzMztcblx0XHRcdFx0eFZhbHVlc1tpXSA9ICh0aGlzLmExMSAqIHggKyB0aGlzLmEyMSAqIHkgKyB0aGlzLmEzMSkgLyBkZW5vbWluYXRvcjtcblx0XHRcdFx0eVZhbHVlc1tpXSA9ICh0aGlzLmExMiAqIHggKyB0aGlzLmEyMiAqIHkgKyB0aGlzLmEzMikgLyBkZW5vbWluYXRvcjtcblx0XHRcdH1cblx0XHR9XG5cblx0dGhpcy5idWlsZEFkam9pbnQ9ZnVuY3Rpb24oKVxuXHRcdHtcblx0XHRcdC8vIEFkam9pbnQgaXMgdGhlIHRyYW5zcG9zZSBvZiB0aGUgY29mYWN0b3IgbWF0cml4OlxuXHRcdFx0cmV0dXJuIG5ldyBQZXJzcGVjdGl2ZVRyYW5zZm9ybSh0aGlzLmEyMiAqIHRoaXMuYTMzIC0gdGhpcy5hMjMgKiB0aGlzLmEzMiwgdGhpcy5hMjMgKiB0aGlzLmEzMSAtIHRoaXMuYTIxICogdGhpcy5hMzMsIHRoaXMuYTIxICogdGhpcy5hMzIgLSB0aGlzLmEyMiAqIHRoaXMuYTMxLCB0aGlzLmExMyAqIHRoaXMuYTMyIC0gdGhpcy5hMTIgKiB0aGlzLmEzMywgdGhpcy5hMTEgKiB0aGlzLmEzMyAtIHRoaXMuYTEzICogdGhpcy5hMzEsIHRoaXMuYTEyICogdGhpcy5hMzEgLSB0aGlzLmExMSAqIHRoaXMuYTMyLCB0aGlzLmExMiAqIHRoaXMuYTIzIC0gdGhpcy5hMTMgKiB0aGlzLmEyMiwgdGhpcy5hMTMgKiB0aGlzLmEyMSAtIHRoaXMuYTExICogdGhpcy5hMjMsIHRoaXMuYTExICogdGhpcy5hMjIgLSB0aGlzLmExMiAqIHRoaXMuYTIxKTtcblx0XHR9XG5cdHRoaXMudGltZXM9ZnVuY3Rpb24oIG90aGVyKVxuXHRcdHtcblx0XHRcdHJldHVybiBuZXcgUGVyc3BlY3RpdmVUcmFuc2Zvcm0odGhpcy5hMTEgKiBvdGhlci5hMTEgKyB0aGlzLmEyMSAqIG90aGVyLmExMiArIHRoaXMuYTMxICogb3RoZXIuYTEzLCB0aGlzLmExMSAqIG90aGVyLmEyMSArIHRoaXMuYTIxICogb3RoZXIuYTIyICsgdGhpcy5hMzEgKiBvdGhlci5hMjMsIHRoaXMuYTExICogb3RoZXIuYTMxICsgdGhpcy5hMjEgKiBvdGhlci5hMzIgKyB0aGlzLmEzMSAqIG90aGVyLmEzMywgdGhpcy5hMTIgKiBvdGhlci5hMTEgKyB0aGlzLmEyMiAqIG90aGVyLmExMiArIHRoaXMuYTMyICogb3RoZXIuYTEzLCB0aGlzLmExMiAqIG90aGVyLmEyMSArIHRoaXMuYTIyICogb3RoZXIuYTIyICsgdGhpcy5hMzIgKiBvdGhlci5hMjMsIHRoaXMuYTEyICogb3RoZXIuYTMxICsgdGhpcy5hMjIgKiBvdGhlci5hMzIgKyB0aGlzLmEzMiAqIG90aGVyLmEzMywgdGhpcy5hMTMgKiBvdGhlci5hMTEgKyB0aGlzLmEyMyAqIG90aGVyLmExMiArdGhpcy5hMzMgKiBvdGhlci5hMTMsIHRoaXMuYTEzICogb3RoZXIuYTIxICsgdGhpcy5hMjMgKiBvdGhlci5hMjIgKyB0aGlzLmEzMyAqIG90aGVyLmEyMywgdGhpcy5hMTMgKiBvdGhlci5hMzEgKyB0aGlzLmEyMyAqIG90aGVyLmEzMiArIHRoaXMuYTMzICogb3RoZXIuYTMzKTtcblx0XHR9XG5cbn1cblxuUGVyc3BlY3RpdmVUcmFuc2Zvcm0ucXVhZHJpbGF0ZXJhbFRvUXVhZHJpbGF0ZXJhbD1mdW5jdGlvbiggeDAsICB5MCwgIHgxLCAgeTEsICB4MiwgIHkyLCAgeDMsICB5MywgIHgwcCwgIHkwcCwgIHgxcCwgIHkxcCwgIHgycCwgIHkycCwgIHgzcCwgIHkzcClcbntcblxuXHR2YXIgcVRvUyA9IHRoaXMucXVhZHJpbGF0ZXJhbFRvU3F1YXJlKHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIsIHgzLCB5Myk7XG5cdHZhciBzVG9RID0gdGhpcy5zcXVhcmVUb1F1YWRyaWxhdGVyYWwoeDBwLCB5MHAsIHgxcCwgeTFwLCB4MnAsIHkycCwgeDNwLCB5M3ApO1xuXHRyZXR1cm4gc1RvUS50aW1lcyhxVG9TKTtcbn1cblxuUGVyc3BlY3RpdmVUcmFuc2Zvcm0uc3F1YXJlVG9RdWFkcmlsYXRlcmFsPWZ1bmN0aW9uKCB4MCwgIHkwLCAgeDEsICB5MSwgIHgyLCAgeTIsICB4MywgIHkzKVxue1xuXHQgZHkyID0geTMgLSB5Mjtcblx0IGR5MyA9IHkwIC0geTEgKyB5MiAtIHkzO1xuXHRpZiAoZHkyID09IDAuMCAmJiBkeTMgPT0gMC4wKVxuXHR7XG5cdFx0cmV0dXJuIG5ldyBQZXJzcGVjdGl2ZVRyYW5zZm9ybSh4MSAtIHgwLCB4MiAtIHgxLCB4MCwgeTEgLSB5MCwgeTIgLSB5MSwgeTAsIDAuMCwgMC4wLCAxLjApO1xuXHR9XG5cdGVsc2Vcblx0e1xuXHRcdCBkeDEgPSB4MSAtIHgyO1xuXHRcdCBkeDIgPSB4MyAtIHgyO1xuXHRcdCBkeDMgPSB4MCAtIHgxICsgeDIgLSB4Mztcblx0XHQgZHkxID0geTEgLSB5Mjtcblx0XHQgZGVub21pbmF0b3IgPSBkeDEgKiBkeTIgLSBkeDIgKiBkeTE7XG5cdFx0IGExMyA9IChkeDMgKiBkeTIgLSBkeDIgKiBkeTMpIC8gZGVub21pbmF0b3I7XG5cdFx0IGEyMyA9IChkeDEgKiBkeTMgLSBkeDMgKiBkeTEpIC8gZGVub21pbmF0b3I7XG5cdFx0cmV0dXJuIG5ldyBQZXJzcGVjdGl2ZVRyYW5zZm9ybSh4MSAtIHgwICsgYTEzICogeDEsIHgzIC0geDAgKyBhMjMgKiB4MywgeDAsIHkxIC0geTAgKyBhMTMgKiB5MSwgeTMgLSB5MCArIGEyMyAqIHkzLCB5MCwgYTEzLCBhMjMsIDEuMCk7XG5cdH1cbn1cblxuUGVyc3BlY3RpdmVUcmFuc2Zvcm0ucXVhZHJpbGF0ZXJhbFRvU3F1YXJlPWZ1bmN0aW9uKCB4MCwgIHkwLCAgeDEsICB5MSwgIHgyLCAgeTIsICB4MywgIHkzKVxue1xuXHQvLyBIZXJlLCB0aGUgYWRqb2ludCBzZXJ2ZXMgYXMgdGhlIGludmVyc2U6XG5cdHJldHVybiB0aGlzLnNxdWFyZVRvUXVhZHJpbGF0ZXJhbCh4MCwgeTAsIHgxLCB5MSwgeDIsIHkyLCB4MywgeTMpLmJ1aWxkQWRqb2ludCgpO1xufVxuXG5mdW5jdGlvbiBEZXRlY3RvclJlc3VsdChiaXRzLCAgcG9pbnRzKVxue1xuXHR0aGlzLmJpdHMgPSBiaXRzO1xuXHR0aGlzLnBvaW50cyA9IHBvaW50cztcbn1cblxuXG5mdW5jdGlvbiBEZXRlY3RvcihpbWFnZSlcbntcblx0dGhpcy5pbWFnZT1pbWFnZTtcblx0dGhpcy5yZXN1bHRQb2ludENhbGxiYWNrID0gbnVsbDtcblxuXHR0aGlzLnNpemVPZkJsYWNrV2hpdGVCbGFja1J1bj1mdW5jdGlvbiggZnJvbVgsICBmcm9tWSwgIHRvWCwgIHRvWSlcblx0XHR7XG5cdFx0XHQvLyBNaWxkIHZhcmlhbnQgb2YgQnJlc2VuaGFtJ3MgYWxnb3JpdGhtO1xuXHRcdFx0Ly8gc2VlIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQnJlc2VuaGFtJ3NfbGluZV9hbGdvcml0aG1cblx0XHRcdHZhciBzdGVlcCA9IE1hdGguYWJzKHRvWSAtIGZyb21ZKSA+IE1hdGguYWJzKHRvWCAtIGZyb21YKTtcblx0XHRcdGlmIChzdGVlcClcblx0XHRcdHtcblx0XHRcdFx0dmFyIHRlbXAgPSBmcm9tWDtcblx0XHRcdFx0ZnJvbVggPSBmcm9tWTtcblx0XHRcdFx0ZnJvbVkgPSB0ZW1wO1xuXHRcdFx0XHR0ZW1wID0gdG9YO1xuXHRcdFx0XHR0b1ggPSB0b1k7XG5cdFx0XHRcdHRvWSA9IHRlbXA7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBkeCA9IE1hdGguYWJzKHRvWCAtIGZyb21YKTtcblx0XHRcdHZhciBkeSA9IE1hdGguYWJzKHRvWSAtIGZyb21ZKTtcblx0XHRcdHZhciBlcnJvciA9IC0gZHggPj4gMTtcblx0XHRcdHZhciB5c3RlcCA9IGZyb21ZIDwgdG9ZPzE6LSAxO1xuXHRcdFx0dmFyIHhzdGVwID0gZnJvbVggPCB0b1g/MTotIDE7XG5cdFx0XHR2YXIgc3RhdGUgPSAwOyAvLyBJbiBibGFjayBwaXhlbHMsIGxvb2tpbmcgZm9yIHdoaXRlLCBmaXJzdCBvciBzZWNvbmQgdGltZVxuXHRcdFx0Zm9yICh2YXIgeCA9IGZyb21YLCB5ID0gZnJvbVk7IHggIT0gdG9YOyB4ICs9IHhzdGVwKVxuXHRcdFx0e1xuXG5cdFx0XHRcdHZhciByZWFsWCA9IHN0ZWVwP3k6eDtcblx0XHRcdFx0dmFyIHJlYWxZID0gc3RlZXA/eDp5O1xuXHRcdFx0XHRpZiAoc3RhdGUgPT0gMSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIEluIHdoaXRlIHBpeGVscywgbG9va2luZyBmb3IgYmxhY2tcblx0XHRcdFx0XHRpZiAodGhpcy5pbWFnZS5kYXRhW3JlYWxYICsgcmVhbFkqaW1hZ2Uud2lkdGhdKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHN0YXRlKys7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmICghdGhpcy5pbWFnZS5kYXRhW3JlYWxYICsgcmVhbFkqaW1hZ2Uud2lkdGhdKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHN0YXRlKys7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHN0YXRlID09IDMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBGb3VuZCBibGFjaywgd2hpdGUsIGJsYWNrLCBhbmQgc3R1bWJsZWQgYmFjayBvbnRvIHdoaXRlOyBkb25lXG5cdFx0XHRcdFx0dmFyIGRpZmZYID0geCAtIGZyb21YO1xuXHRcdFx0XHRcdHZhciBkaWZmWSA9IHkgLSBmcm9tWTtcblx0XHRcdFx0XHRyZXR1cm4gIE1hdGguc3FydCggKGRpZmZYICogZGlmZlggKyBkaWZmWSAqIGRpZmZZKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZXJyb3IgKz0gZHk7XG5cdFx0XHRcdGlmIChlcnJvciA+IDApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoeSA9PSB0b1kpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHkgKz0geXN0ZXA7XG5cdFx0XHRcdFx0ZXJyb3IgLT0gZHg7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHZhciBkaWZmWDIgPSB0b1ggLSBmcm9tWDtcblx0XHRcdHZhciBkaWZmWTIgPSB0b1kgLSBmcm9tWTtcblx0XHRcdHJldHVybiAgTWF0aC5zcXJ0KCAoZGlmZlgyICogZGlmZlgyICsgZGlmZlkyICogZGlmZlkyKSk7XG5cdFx0fVxuXG5cblx0dGhpcy5zaXplT2ZCbGFja1doaXRlQmxhY2tSdW5Cb3RoV2F5cz1mdW5jdGlvbiggZnJvbVgsICBmcm9tWSwgIHRvWCwgIHRvWSlcblx0XHR7XG5cblx0XHRcdHZhciByZXN1bHQgPSB0aGlzLnNpemVPZkJsYWNrV2hpdGVCbGFja1J1bihmcm9tWCwgZnJvbVksIHRvWCwgdG9ZKTtcblxuXHRcdFx0Ly8gTm93IGNvdW50IG90aGVyIHdheSAtLSBkb24ndCBydW4gb2ZmIGltYWdlIHRob3VnaCBvZiBjb3Vyc2Vcblx0XHRcdHZhciBzY2FsZSA9IDEuMDtcblx0XHRcdHZhciBvdGhlclRvWCA9IGZyb21YIC0gKHRvWCAtIGZyb21YKTtcblx0XHRcdGlmIChvdGhlclRvWCA8IDApXG5cdFx0XHR7XG5cdFx0XHRcdHNjYWxlID0gIGZyb21YIC8gIChmcm9tWCAtIG90aGVyVG9YKTtcblx0XHRcdFx0b3RoZXJUb1ggPSAwO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAob3RoZXJUb1ggPj0gaW1hZ2Uud2lkdGgpXG5cdFx0XHR7XG5cdFx0XHRcdHNjYWxlID0gIChpbWFnZS53aWR0aCAtIDEgLSBmcm9tWCkgLyAgKG90aGVyVG9YIC0gZnJvbVgpO1xuXHRcdFx0XHRvdGhlclRvWCA9IGltYWdlLndpZHRoIC0gMTtcblx0XHRcdH1cblx0XHRcdHZhciBvdGhlclRvWSA9IE1hdGguZmxvb3IgKGZyb21ZIC0gKHRvWSAtIGZyb21ZKSAqIHNjYWxlKTtcblxuXHRcdFx0c2NhbGUgPSAxLjA7XG5cdFx0XHRpZiAob3RoZXJUb1kgPCAwKVxuXHRcdFx0e1xuXHRcdFx0XHRzY2FsZSA9ICBmcm9tWSAvICAoZnJvbVkgLSBvdGhlclRvWSk7XG5cdFx0XHRcdG90aGVyVG9ZID0gMDtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKG90aGVyVG9ZID49IGltYWdlLmhlaWdodClcblx0XHRcdHtcblx0XHRcdFx0c2NhbGUgPSAgKGltYWdlLmhlaWdodCAtIDEgLSBmcm9tWSkgLyAgKG90aGVyVG9ZIC0gZnJvbVkpO1xuXHRcdFx0XHRvdGhlclRvWSA9IGltYWdlLmhlaWdodCAtIDE7XG5cdFx0XHR9XG5cdFx0XHRvdGhlclRvWCA9IE1hdGguZmxvb3IgKGZyb21YICsgKG90aGVyVG9YIC0gZnJvbVgpICogc2NhbGUpO1xuXG5cdFx0XHRyZXN1bHQgKz0gdGhpcy5zaXplT2ZCbGFja1doaXRlQmxhY2tSdW4oZnJvbVgsIGZyb21ZLCBvdGhlclRvWCwgb3RoZXJUb1kpO1xuXHRcdFx0cmV0dXJuIHJlc3VsdCAtIDEuMDsgLy8gLTEgYmVjYXVzZSB3ZSBjb3VudGVkIHRoZSBtaWRkbGUgcGl4ZWwgdHdpY2Vcblx0XHR9XG5cblxuXG5cdHRoaXMuY2FsY3VsYXRlTW9kdWxlU2l6ZU9uZVdheT1mdW5jdGlvbiggcGF0dGVybiwgIG90aGVyUGF0dGVybilcblx0XHR7XG5cdFx0XHR2YXIgbW9kdWxlU2l6ZUVzdDEgPSB0aGlzLnNpemVPZkJsYWNrV2hpdGVCbGFja1J1bkJvdGhXYXlzKE1hdGguZmxvb3IoIHBhdHRlcm4uWCksIE1hdGguZmxvb3IoIHBhdHRlcm4uWSksIE1hdGguZmxvb3IoIG90aGVyUGF0dGVybi5YKSwgTWF0aC5mbG9vcihvdGhlclBhdHRlcm4uWSkpO1xuXHRcdFx0dmFyIG1vZHVsZVNpemVFc3QyID0gdGhpcy5zaXplT2ZCbGFja1doaXRlQmxhY2tSdW5Cb3RoV2F5cyhNYXRoLmZsb29yKG90aGVyUGF0dGVybi5YKSwgTWF0aC5mbG9vcihvdGhlclBhdHRlcm4uWSksIE1hdGguZmxvb3IoIHBhdHRlcm4uWCksIE1hdGguZmxvb3IocGF0dGVybi5ZKSk7XG5cdFx0XHRpZiAoaXNOYU4obW9kdWxlU2l6ZUVzdDEpKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gbW9kdWxlU2l6ZUVzdDIgLyA3LjA7XG5cdFx0XHR9XG5cdFx0XHRpZiAoaXNOYU4obW9kdWxlU2l6ZUVzdDIpKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gbW9kdWxlU2l6ZUVzdDEgLyA3LjA7XG5cdFx0XHR9XG5cdFx0XHQvLyBBdmVyYWdlIHRoZW0sIGFuZCBkaXZpZGUgYnkgNyBzaW5jZSB3ZSd2ZSBjb3VudGVkIHRoZSB3aWR0aCBvZiAzIGJsYWNrIG1vZHVsZXMsXG5cdFx0XHQvLyBhbmQgMSB3aGl0ZSBhbmQgMSBibGFjayBtb2R1bGUgb24gZWl0aGVyIHNpZGUuIEVyZ28sIGRpdmlkZSBzdW0gYnkgMTQuXG5cdFx0XHRyZXR1cm4gKG1vZHVsZVNpemVFc3QxICsgbW9kdWxlU2l6ZUVzdDIpIC8gMTQuMDtcblx0XHR9XG5cblxuXHR0aGlzLmNhbGN1bGF0ZU1vZHVsZVNpemU9ZnVuY3Rpb24oIHRvcExlZnQsICB0b3BSaWdodCwgIGJvdHRvbUxlZnQpXG5cdFx0e1xuXHRcdFx0Ly8gVGFrZSB0aGUgYXZlcmFnZVxuXHRcdFx0cmV0dXJuICh0aGlzLmNhbGN1bGF0ZU1vZHVsZVNpemVPbmVXYXkodG9wTGVmdCwgdG9wUmlnaHQpICsgdGhpcy5jYWxjdWxhdGVNb2R1bGVTaXplT25lV2F5KHRvcExlZnQsIGJvdHRvbUxlZnQpKSAvIDIuMDtcblx0XHR9XG5cblx0dGhpcy5kaXN0YW5jZT1mdW5jdGlvbiggcGF0dGVybjEsICBwYXR0ZXJuMilcblx0e1xuXHRcdHhEaWZmID0gcGF0dGVybjEuWCAtIHBhdHRlcm4yLlg7XG5cdFx0eURpZmYgPSBwYXR0ZXJuMS5ZIC0gcGF0dGVybjIuWTtcblx0XHRyZXR1cm4gIE1hdGguc3FydCggKHhEaWZmICogeERpZmYgKyB5RGlmZiAqIHlEaWZmKSk7XG5cdH1cblx0dGhpcy5jb21wdXRlRGltZW5zaW9uPWZ1bmN0aW9uKCB0b3BMZWZ0LCAgdG9wUmlnaHQsICBib3R0b21MZWZ0LCAgbW9kdWxlU2l6ZSlcblx0XHR7XG5cblx0XHRcdHZhciB0bHRyQ2VudGVyc0RpbWVuc2lvbiA9IE1hdGgucm91bmQodGhpcy5kaXN0YW5jZSh0b3BMZWZ0LCB0b3BSaWdodCkgLyBtb2R1bGVTaXplKTtcblx0XHRcdHZhciB0bGJsQ2VudGVyc0RpbWVuc2lvbiA9IE1hdGgucm91bmQodGhpcy5kaXN0YW5jZSh0b3BMZWZ0LCBib3R0b21MZWZ0KSAvIG1vZHVsZVNpemUpO1xuXHRcdFx0dmFyIGRpbWVuc2lvbiA9ICgodGx0ckNlbnRlcnNEaW1lbnNpb24gKyB0bGJsQ2VudGVyc0RpbWVuc2lvbikgPj4gMSkgKyA3O1xuXHRcdFx0c3dpdGNoIChkaW1lbnNpb24gJiAweDAzKVxuXHRcdFx0e1xuXG5cdFx0XHRcdC8vIG1vZCA0XG5cdFx0XHRcdGNhc2UgMDpcblx0XHRcdFx0XHRkaW1lbnNpb24rKztcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHQvLyAxPyBkbyBub3RoaW5nXG5cblx0XHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRcdGRpbWVuc2lvbi0tO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgMzpcblx0XHRcdFx0XHR0aHJvdyBcIkVycm9yXCI7XG5cdFx0XHRcdH1cblx0XHRcdHJldHVybiBkaW1lbnNpb247XG5cdFx0fVxuXG5cdHRoaXMuZmluZEFsaWdubWVudEluUmVnaW9uPWZ1bmN0aW9uKCBvdmVyYWxsRXN0TW9kdWxlU2l6ZSwgIGVzdEFsaWdubWVudFgsICBlc3RBbGlnbm1lbnRZLCAgYWxsb3dhbmNlRmFjdG9yKVxuXHRcdHtcblx0XHRcdC8vIExvb2sgZm9yIGFuIGFsaWdubWVudCBwYXR0ZXJuICgzIG1vZHVsZXMgaW4gc2l6ZSkgYXJvdW5kIHdoZXJlIGl0XG5cdFx0XHQvLyBzaG91bGQgYmVcblx0XHRcdHZhciBhbGxvd2FuY2UgPSBNYXRoLmZsb29yIChhbGxvd2FuY2VGYWN0b3IgKiBvdmVyYWxsRXN0TW9kdWxlU2l6ZSk7XG5cdFx0XHR2YXIgYWxpZ25tZW50QXJlYUxlZnRYID0gTWF0aC5tYXgoMCwgZXN0QWxpZ25tZW50WCAtIGFsbG93YW5jZSk7XG5cdFx0XHR2YXIgYWxpZ25tZW50QXJlYVJpZ2h0WCA9IE1hdGgubWluKGltYWdlLndpZHRoIC0gMSwgZXN0QWxpZ25tZW50WCArIGFsbG93YW5jZSk7XG5cdFx0XHRpZiAoYWxpZ25tZW50QXJlYVJpZ2h0WCAtIGFsaWdubWVudEFyZWFMZWZ0WCA8IG92ZXJhbGxFc3RNb2R1bGVTaXplICogMylcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgXCJFcnJvclwiO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgYWxpZ25tZW50QXJlYVRvcFkgPSBNYXRoLm1heCgwLCBlc3RBbGlnbm1lbnRZIC0gYWxsb3dhbmNlKTtcblx0XHRcdHZhciBhbGlnbm1lbnRBcmVhQm90dG9tWSA9IE1hdGgubWluKGltYWdlLmhlaWdodCAtIDEsIGVzdEFsaWdubWVudFkgKyBhbGxvd2FuY2UpO1xuXG5cdFx0XHR2YXIgYWxpZ25tZW50RmluZGVyID0gbmV3IEFsaWdubWVudFBhdHRlcm5GaW5kZXIodGhpcy5pbWFnZSwgYWxpZ25tZW50QXJlYUxlZnRYLCBhbGlnbm1lbnRBcmVhVG9wWSwgYWxpZ25tZW50QXJlYVJpZ2h0WCAtIGFsaWdubWVudEFyZWFMZWZ0WCwgYWxpZ25tZW50QXJlYUJvdHRvbVkgLSBhbGlnbm1lbnRBcmVhVG9wWSwgb3ZlcmFsbEVzdE1vZHVsZVNpemUsIHRoaXMucmVzdWx0UG9pbnRDYWxsYmFjayk7XG5cdFx0XHRyZXR1cm4gYWxpZ25tZW50RmluZGVyLmZpbmQoKTtcblx0XHR9XG5cblx0dGhpcy5jcmVhdGVUcmFuc2Zvcm09ZnVuY3Rpb24oIHRvcExlZnQsICB0b3BSaWdodCwgIGJvdHRvbUxlZnQsIGFsaWdubWVudFBhdHRlcm4sIGRpbWVuc2lvbilcblx0XHR7XG5cdFx0XHR2YXIgZGltTWludXNUaHJlZSA9ICBkaW1lbnNpb24gLSAzLjU7XG5cdFx0XHR2YXIgYm90dG9tUmlnaHRYO1xuXHRcdFx0dmFyIGJvdHRvbVJpZ2h0WTtcblx0XHRcdHZhciBzb3VyY2VCb3R0b21SaWdodFg7XG5cdFx0XHR2YXIgc291cmNlQm90dG9tUmlnaHRZO1xuXHRcdFx0aWYgKGFsaWdubWVudFBhdHRlcm4gIT0gbnVsbClcblx0XHRcdHtcblx0XHRcdFx0Ym90dG9tUmlnaHRYID0gYWxpZ25tZW50UGF0dGVybi5YO1xuXHRcdFx0XHRib3R0b21SaWdodFkgPSBhbGlnbm1lbnRQYXR0ZXJuLlk7XG5cdFx0XHRcdHNvdXJjZUJvdHRvbVJpZ2h0WCA9IHNvdXJjZUJvdHRvbVJpZ2h0WSA9IGRpbU1pbnVzVGhyZWUgLSAzLjA7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdC8vIERvbid0IGhhdmUgYW4gYWxpZ25tZW50IHBhdHRlcm4sIGp1c3QgbWFrZSB1cCB0aGUgYm90dG9tLXJpZ2h0IHBvaW50XG5cdFx0XHRcdGJvdHRvbVJpZ2h0WCA9ICh0b3BSaWdodC5YIC0gdG9wTGVmdC5YKSArIGJvdHRvbUxlZnQuWDtcblx0XHRcdFx0Ym90dG9tUmlnaHRZID0gKHRvcFJpZ2h0LlkgLSB0b3BMZWZ0LlkpICsgYm90dG9tTGVmdC5ZO1xuXHRcdFx0XHRzb3VyY2VCb3R0b21SaWdodFggPSBzb3VyY2VCb3R0b21SaWdodFkgPSBkaW1NaW51c1RocmVlO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgdHJhbnNmb3JtID0gUGVyc3BlY3RpdmVUcmFuc2Zvcm0ucXVhZHJpbGF0ZXJhbFRvUXVhZHJpbGF0ZXJhbCgzLjUsIDMuNSwgZGltTWludXNUaHJlZSwgMy41LCBzb3VyY2VCb3R0b21SaWdodFgsIHNvdXJjZUJvdHRvbVJpZ2h0WSwgMy41LCBkaW1NaW51c1RocmVlLCB0b3BMZWZ0LlgsIHRvcExlZnQuWSwgdG9wUmlnaHQuWCwgdG9wUmlnaHQuWSwgYm90dG9tUmlnaHRYLCBib3R0b21SaWdodFksIGJvdHRvbUxlZnQuWCwgYm90dG9tTGVmdC5ZKTtcblxuXHRcdFx0cmV0dXJuIHRyYW5zZm9ybTtcblx0XHR9XG5cblx0dGhpcy5zYW1wbGVHcmlkPWZ1bmN0aW9uKCBpbWFnZSwgIHRyYW5zZm9ybSwgIGRpbWVuc2lvbilcblx0XHR7XG5cblx0XHRcdHZhciBzYW1wbGVyID0gR3JpZFNhbXBsZXI7XG5cdFx0XHRyZXR1cm4gc2FtcGxlci5zYW1wbGVHcmlkMyhpbWFnZSwgZGltZW5zaW9uLCB0cmFuc2Zvcm0pO1xuXHRcdH1cblxuXHR0aGlzLnByb2Nlc3NGaW5kZXJQYXR0ZXJuSW5mbyA9IGZ1bmN0aW9uKCBpbmZvKVxuXHRcdHtcblxuXHRcdFx0dmFyIHRvcExlZnQgPSBpbmZvLlRvcExlZnQ7XG5cdFx0XHR2YXIgdG9wUmlnaHQgPSBpbmZvLlRvcFJpZ2h0O1xuXHRcdFx0dmFyIGJvdHRvbUxlZnQgPSBpbmZvLkJvdHRvbUxlZnQ7XG5cblx0XHRcdHZhciBtb2R1bGVTaXplID0gdGhpcy5jYWxjdWxhdGVNb2R1bGVTaXplKHRvcExlZnQsIHRvcFJpZ2h0LCBib3R0b21MZWZ0KTtcblx0XHRcdGlmIChtb2R1bGVTaXplIDwgMS4wKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBcIkVycm9yXCI7XG5cdFx0XHR9XG5cdFx0XHR2YXIgZGltZW5zaW9uID0gdGhpcy5jb21wdXRlRGltZW5zaW9uKHRvcExlZnQsIHRvcFJpZ2h0LCBib3R0b21MZWZ0LCBtb2R1bGVTaXplKTtcblx0XHRcdHZhciBwcm92aXNpb25hbFZlcnNpb24gPSBWZXJzaW9uLmdldFByb3Zpc2lvbmFsVmVyc2lvbkZvckRpbWVuc2lvbihkaW1lbnNpb24pO1xuXHRcdFx0dmFyIG1vZHVsZXNCZXR3ZWVuRlBDZW50ZXJzID0gcHJvdmlzaW9uYWxWZXJzaW9uLkRpbWVuc2lvbkZvclZlcnNpb24gLSA3O1xuXG5cdFx0XHR2YXIgYWxpZ25tZW50UGF0dGVybiA9IG51bGw7XG5cdFx0XHQvLyBBbnl0aGluZyBhYm92ZSB2ZXJzaW9uIDEgaGFzIGFuIGFsaWdubWVudCBwYXR0ZXJuXG5cdFx0XHRpZiAocHJvdmlzaW9uYWxWZXJzaW9uLkFsaWdubWVudFBhdHRlcm5DZW50ZXJzLmxlbmd0aCA+IDApXG5cdFx0XHR7XG5cblx0XHRcdFx0Ly8gR3Vlc3Mgd2hlcmUgYSBcImJvdHRvbSByaWdodFwiIGZpbmRlciBwYXR0ZXJuIHdvdWxkIGhhdmUgYmVlblxuXHRcdFx0XHR2YXIgYm90dG9tUmlnaHRYID0gdG9wUmlnaHQuWCAtIHRvcExlZnQuWCArIGJvdHRvbUxlZnQuWDtcblx0XHRcdFx0dmFyIGJvdHRvbVJpZ2h0WSA9IHRvcFJpZ2h0LlkgLSB0b3BMZWZ0LlkgKyBib3R0b21MZWZ0Llk7XG5cblx0XHRcdFx0Ly8gRXN0aW1hdGUgdGhhdCBhbGlnbm1lbnQgcGF0dGVybiBpcyBjbG9zZXIgYnkgMyBtb2R1bGVzXG5cdFx0XHRcdC8vIGZyb20gXCJib3R0b20gcmlnaHRcIiB0byBrbm93biB0b3AgbGVmdCBsb2NhdGlvblxuXHRcdFx0XHR2YXIgY29ycmVjdGlvblRvVG9wTGVmdCA9IDEuMCAtIDMuMCAvICBtb2R1bGVzQmV0d2VlbkZQQ2VudGVycztcblx0XHRcdFx0dmFyIGVzdEFsaWdubWVudFggPSBNYXRoLmZsb29yICh0b3BMZWZ0LlggKyBjb3JyZWN0aW9uVG9Ub3BMZWZ0ICogKGJvdHRvbVJpZ2h0WCAtIHRvcExlZnQuWCkpO1xuXHRcdFx0XHR2YXIgZXN0QWxpZ25tZW50WSA9IE1hdGguZmxvb3IgKHRvcExlZnQuWSArIGNvcnJlY3Rpb25Ub1RvcExlZnQgKiAoYm90dG9tUmlnaHRZIC0gdG9wTGVmdC5ZKSk7XG5cblx0XHRcdFx0Ly8gS2luZCBvZiBhcmJpdHJhcnkgLS0gZXhwYW5kIHNlYXJjaCByYWRpdXMgYmVmb3JlIGdpdmluZyB1cFxuXHRcdFx0XHRmb3IgKHZhciBpID0gNDsgaSA8PSAxNjsgaSA8PD0gMSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vdHJ5XG5cdFx0XHRcdFx0Ly97XG5cdFx0XHRcdFx0XHRhbGlnbm1lbnRQYXR0ZXJuID0gdGhpcy5maW5kQWxpZ25tZW50SW5SZWdpb24obW9kdWxlU2l6ZSwgZXN0QWxpZ25tZW50WCwgZXN0QWxpZ25tZW50WSwgIGkpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Ly99XG5cdFx0XHRcdFx0Ly9jYXRjaCAocmUpXG5cdFx0XHRcdFx0Ly97XG5cdFx0XHRcdFx0XHQvLyB0cnkgbmV4dCByb3VuZFxuXHRcdFx0XHRcdC8vfVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIElmIHdlIGRpZG4ndCBmaW5kIGFsaWdubWVudCBwYXR0ZXJuLi4uIHdlbGwgdHJ5IGFueXdheSB3aXRob3V0IGl0XG5cdFx0XHR9XG5cblx0XHRcdHZhciB0cmFuc2Zvcm0gPSB0aGlzLmNyZWF0ZVRyYW5zZm9ybSh0b3BMZWZ0LCB0b3BSaWdodCwgYm90dG9tTGVmdCwgYWxpZ25tZW50UGF0dGVybiwgZGltZW5zaW9uKTtcblxuXHRcdFx0dmFyIGJpdHMgPSB0aGlzLnNhbXBsZUdyaWQodGhpcy5pbWFnZSwgdHJhbnNmb3JtLCBkaW1lbnNpb24pO1xuXG5cdFx0XHR2YXIgcG9pbnRzO1xuXHRcdFx0aWYgKGFsaWdubWVudFBhdHRlcm4gPT0gbnVsbClcblx0XHRcdHtcblx0XHRcdFx0cG9pbnRzID0gbmV3IEFycmF5KGJvdHRvbUxlZnQsIHRvcExlZnQsIHRvcFJpZ2h0KTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0cG9pbnRzID0gbmV3IEFycmF5KGJvdHRvbUxlZnQsIHRvcExlZnQsIHRvcFJpZ2h0LCBhbGlnbm1lbnRQYXR0ZXJuKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBuZXcgRGV0ZWN0b3JSZXN1bHQoYml0cywgcG9pbnRzKTtcblx0XHR9XG5cblxuXG5cdHRoaXMuZGV0ZWN0PWZ1bmN0aW9uKClcblx0e1xuXHRcdHZhciBpbmZvID0gIG5ldyBGaW5kZXJQYXR0ZXJuRmluZGVyKCkuZmluZEZpbmRlclBhdHRlcm4odGhpcy5pbWFnZSk7XG5cblx0XHRyZXR1cm4gdGhpcy5wcm9jZXNzRmluZGVyUGF0dGVybkluZm8oaW5mbyk7XG5cdH1cbn1cblxuLypcbiAgUG9ydGVkIHRvIEphdmFTY3JpcHQgYnkgTGF6YXIgTGFzemxvIDIwMTFcblxuICBsYXphcnNvZnRAZ21haWwuY29tLCB3d3cubGF6YXJzb2Z0LmluZm9cblxuKi9cblxuLypcbipcbiogQ29weXJpZ2h0IDIwMDcgWlhpbmcgYXV0aG9yc1xuKlxuKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4qIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuKlxuKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuKlxuKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4qIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4qIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5cbnZhciBGT1JNQVRfSU5GT19NQVNLX1FSID0gMHg1NDEyO1xudmFyIEZPUk1BVF9JTkZPX0RFQ09ERV9MT09LVVAgPSBuZXcgQXJyYXkobmV3IEFycmF5KDB4NTQxMiwgMHgwMCksIG5ldyBBcnJheSgweDUxMjUsIDB4MDEpLCBuZXcgQXJyYXkoMHg1RTdDLCAweDAyKSwgbmV3IEFycmF5KDB4NUI0QiwgMHgwMyksIG5ldyBBcnJheSgweDQ1RjksIDB4MDQpLCBuZXcgQXJyYXkoMHg0MENFLCAweDA1KSwgbmV3IEFycmF5KDB4NEY5NywgMHgwNiksIG5ldyBBcnJheSgweDRBQTAsIDB4MDcpLCBuZXcgQXJyYXkoMHg3N0M0LCAweDA4KSwgbmV3IEFycmF5KDB4NzJGMywgMHgwOSksIG5ldyBBcnJheSgweDdEQUEsIDB4MEEpLCBuZXcgQXJyYXkoMHg3ODlELCAweDBCKSwgbmV3IEFycmF5KDB4NjYyRiwgMHgwQyksIG5ldyBBcnJheSgweDYzMTgsIDB4MEQpLCBuZXcgQXJyYXkoMHg2QzQxLCAweDBFKSwgbmV3IEFycmF5KDB4Njk3NiwgMHgwRiksIG5ldyBBcnJheSgweDE2ODksIDB4MTApLCBuZXcgQXJyYXkoMHgxM0JFLCAweDExKSwgbmV3IEFycmF5KDB4MUNFNywgMHgxMiksIG5ldyBBcnJheSgweDE5RDAsIDB4MTMpLCBuZXcgQXJyYXkoMHgwNzYyLCAweDE0KSwgbmV3IEFycmF5KDB4MDI1NSwgMHgxNSksIG5ldyBBcnJheSgweDBEMEMsIDB4MTYpLCBuZXcgQXJyYXkoMHgwODNCLCAweDE3KSwgbmV3IEFycmF5KDB4MzU1RiwgMHgxOCksIG5ldyBBcnJheSgweDMwNjgsIDB4MTkpLCBuZXcgQXJyYXkoMHgzRjMxLCAweDFBKSwgbmV3IEFycmF5KDB4M0EwNiwgMHgxQiksIG5ldyBBcnJheSgweDI0QjQsIDB4MUMpLCBuZXcgQXJyYXkoMHgyMTgzLCAweDFEKSwgbmV3IEFycmF5KDB4MkVEQSwgMHgxRSksIG5ldyBBcnJheSgweDJCRUQsIDB4MUYpKTtcbnZhciBCSVRTX1NFVF9JTl9IQUxGX0JZVEUgPSBuZXcgQXJyYXkoMCwgMSwgMSwgMiwgMSwgMiwgMiwgMywgMSwgMiwgMiwgMywgMiwgMywgMywgNCk7XG5cblxuZnVuY3Rpb24gRm9ybWF0SW5mb3JtYXRpb24oZm9ybWF0SW5mbylcbntcblx0dGhpcy5lcnJvckNvcnJlY3Rpb25MZXZlbCA9IEVycm9yQ29ycmVjdGlvbkxldmVsLmZvckJpdHMoKGZvcm1hdEluZm8gPj4gMykgJiAweDAzKTtcblx0dGhpcy5kYXRhTWFzayA9ICAoZm9ybWF0SW5mbyAmIDB4MDcpO1xuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiRXJyb3JDb3JyZWN0aW9uTGV2ZWxcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiB0aGlzLmVycm9yQ29ycmVjdGlvbkxldmVsO1xuXHR9fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiRGF0YU1hc2tcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiB0aGlzLmRhdGFNYXNrO1xuXHR9fSk7XG5cdHRoaXMuR2V0SGFzaENvZGU9ZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuICh0aGlzLmVycm9yQ29ycmVjdGlvbkxldmVsLm9yZGluYWwoKSA8PCAzKSB8ICBkYXRhTWFzaztcblx0fVxuXHR0aGlzLkVxdWFscz1mdW5jdGlvbiggbylcblx0e1xuXHRcdHZhciBvdGhlciA9ICBvO1xuXHRcdHJldHVybiB0aGlzLmVycm9yQ29ycmVjdGlvbkxldmVsID09IG90aGVyLmVycm9yQ29ycmVjdGlvbkxldmVsICYmIHRoaXMuZGF0YU1hc2sgPT0gb3RoZXIuZGF0YU1hc2s7XG5cdH1cbn1cblxuRm9ybWF0SW5mb3JtYXRpb24ubnVtQml0c0RpZmZlcmluZz1mdW5jdGlvbiggYSwgIGIpXG57XG5cdGEgXj0gYjsgLy8gYSBub3cgaGFzIGEgMSBiaXQgZXhhY3RseSB3aGVyZSBpdHMgYml0IGRpZmZlcnMgd2l0aCBiJ3Ncblx0Ly8gQ291bnQgYml0cyBzZXQgcXVpY2tseSB3aXRoIGEgc2VyaWVzIG9mIGxvb2t1cHM6XG5cdHJldHVybiBCSVRTX1NFVF9JTl9IQUxGX0JZVEVbYSAmIDB4MEZdICsgQklUU19TRVRfSU5fSEFMRl9CWVRFWyhVUlNoaWZ0KGEsIDQpICYgMHgwRildICsgQklUU19TRVRfSU5fSEFMRl9CWVRFWyhVUlNoaWZ0KGEsIDgpICYgMHgwRildICsgQklUU19TRVRfSU5fSEFMRl9CWVRFWyhVUlNoaWZ0KGEsIDEyKSAmIDB4MEYpXSArIEJJVFNfU0VUX0lOX0hBTEZfQllURVsoVVJTaGlmdChhLCAxNikgJiAweDBGKV0gKyBCSVRTX1NFVF9JTl9IQUxGX0JZVEVbKFVSU2hpZnQoYSwgMjApICYgMHgwRildICsgQklUU19TRVRfSU5fSEFMRl9CWVRFWyhVUlNoaWZ0KGEsIDI0KSAmIDB4MEYpXSArIEJJVFNfU0VUX0lOX0hBTEZfQllURVsoVVJTaGlmdChhLCAyOCkgJiAweDBGKV07XG59XG5cbkZvcm1hdEluZm9ybWF0aW9uLmRlY29kZUZvcm1hdEluZm9ybWF0aW9uPWZ1bmN0aW9uKCBtYXNrZWRGb3JtYXRJbmZvKVxue1xuXHR2YXIgZm9ybWF0SW5mbyA9IEZvcm1hdEluZm9ybWF0aW9uLmRvRGVjb2RlRm9ybWF0SW5mb3JtYXRpb24obWFza2VkRm9ybWF0SW5mbyk7XG5cdGlmIChmb3JtYXRJbmZvICE9IG51bGwpXG5cdHtcblx0XHRyZXR1cm4gZm9ybWF0SW5mbztcblx0fVxuXHQvLyBTaG91bGQgcmV0dXJuIG51bGwsIGJ1dCwgc29tZSBRUiBjb2RlcyBhcHBhcmVudGx5XG5cdC8vIGRvIG5vdCBtYXNrIHRoaXMgaW5mby4gVHJ5IGFnYWluIGJ5IGFjdHVhbGx5IG1hc2tpbmcgdGhlIHBhdHRlcm5cblx0Ly8gZmlyc3Rcblx0cmV0dXJuIEZvcm1hdEluZm9ybWF0aW9uLmRvRGVjb2RlRm9ybWF0SW5mb3JtYXRpb24obWFza2VkRm9ybWF0SW5mbyBeIEZPUk1BVF9JTkZPX01BU0tfUVIpO1xufVxuRm9ybWF0SW5mb3JtYXRpb24uZG9EZWNvZGVGb3JtYXRJbmZvcm1hdGlvbj1mdW5jdGlvbiggbWFza2VkRm9ybWF0SW5mbylcbntcblx0Ly8gRmluZCB0aGUgaW50IGluIEZPUk1BVF9JTkZPX0RFQ09ERV9MT09LVVAgd2l0aCBmZXdlc3QgYml0cyBkaWZmZXJpbmdcblx0dmFyIGJlc3REaWZmZXJlbmNlID0gMHhmZmZmZmZmZjtcblx0dmFyIGJlc3RGb3JtYXRJbmZvID0gMDtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBGT1JNQVRfSU5GT19ERUNPREVfTE9PS1VQLmxlbmd0aDsgaSsrKVxuXHR7XG5cdFx0dmFyIGRlY29kZUluZm8gPSBGT1JNQVRfSU5GT19ERUNPREVfTE9PS1VQW2ldO1xuXHRcdHZhciB0YXJnZXRJbmZvID0gZGVjb2RlSW5mb1swXTtcblx0XHRpZiAodGFyZ2V0SW5mbyA9PSBtYXNrZWRGb3JtYXRJbmZvKVxuXHRcdHtcblx0XHRcdC8vIEZvdW5kIGFuIGV4YWN0IG1hdGNoXG5cdFx0XHRyZXR1cm4gbmV3IEZvcm1hdEluZm9ybWF0aW9uKGRlY29kZUluZm9bMV0pO1xuXHRcdH1cblx0XHR2YXIgYml0c0RpZmZlcmVuY2UgPSB0aGlzLm51bUJpdHNEaWZmZXJpbmcobWFza2VkRm9ybWF0SW5mbywgdGFyZ2V0SW5mbyk7XG5cdFx0aWYgKGJpdHNEaWZmZXJlbmNlIDwgYmVzdERpZmZlcmVuY2UpXG5cdFx0e1xuXHRcdFx0YmVzdEZvcm1hdEluZm8gPSBkZWNvZGVJbmZvWzFdO1xuXHRcdFx0YmVzdERpZmZlcmVuY2UgPSBiaXRzRGlmZmVyZW5jZTtcblx0XHR9XG5cdH1cblx0Ly8gSGFtbWluZyBkaXN0YW5jZSBvZiB0aGUgMzIgbWFza2VkIGNvZGVzIGlzIDcsIGJ5IGNvbnN0cnVjdGlvbiwgc28gPD0gMyBiaXRzXG5cdC8vIGRpZmZlcmluZyBtZWFucyB3ZSBmb3VuZCBhIG1hdGNoXG5cdGlmIChiZXN0RGlmZmVyZW5jZSA8PSAzKVxuXHR7XG5cdFx0cmV0dXJuIG5ldyBGb3JtYXRJbmZvcm1hdGlvbihiZXN0Rm9ybWF0SW5mbyk7XG5cdH1cblx0cmV0dXJuIG51bGw7XG59XG5cblxuXG4vKlxuICBQb3J0ZWQgdG8gSmF2YVNjcmlwdCBieSBMYXphciBMYXN6bG8gMjAxMVxuXG4gIGxhemFyc29mdEBnbWFpbC5jb20sIHd3dy5sYXphcnNvZnQuaW5mb1xuXG4qL1xuXG4vKlxuKlxuKiBDb3B5cmlnaHQgMjAwNyBaWGluZyBhdXRob3JzXG4qXG4qIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4qIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4qXG4qICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4qXG4qIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cblxuZnVuY3Rpb24gRXJyb3JDb3JyZWN0aW9uTGV2ZWwob3JkaW5hbCwgIGJpdHMsIG5hbWUpXG57XG5cdHRoaXMub3JkaW5hbF9SZW5hbWVkX0ZpZWxkID0gb3JkaW5hbDtcblx0dGhpcy5iaXRzID0gYml0cztcblx0dGhpcy5uYW1lID0gbmFtZTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJCaXRzXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5iaXRzO1xuXHR9fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiTmFtZVwiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMubmFtZTtcblx0fX0pO1xuXHR0aGlzLm9yZGluYWw9ZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMub3JkaW5hbF9SZW5hbWVkX0ZpZWxkO1xuXHR9XG59XG5cbkVycm9yQ29ycmVjdGlvbkxldmVsLmZvckJpdHM9ZnVuY3Rpb24oIGJpdHMpXG57XG5cdGlmIChiaXRzIDwgMCB8fCBiaXRzID49IEZPUl9CSVRTLmxlbmd0aClcblx0e1xuXHRcdHRocm93IFwiQXJndW1lbnRFeGNlcHRpb25cIjtcblx0fVxuXHRyZXR1cm4gRk9SX0JJVFNbYml0c107XG59XG5cbnZhciBGT1JfQklUUyA9IG5ldyBBcnJheShcblx0bmV3IEVycm9yQ29ycmVjdGlvbkxldmVsKDEsIDB4MDAsIFwiTVwiKSxcblx0bmV3IEVycm9yQ29ycmVjdGlvbkxldmVsKDAsIDB4MDEsIFwiTFwiKSxcblx0bmV3IEVycm9yQ29ycmVjdGlvbkxldmVsKDMsIDB4MDIsIFwiSFwiKSxcblx0bmV3IEVycm9yQ29ycmVjdGlvbkxldmVsKDIsIDB4MDMsIFwiUVwiKVxuKTtcblxuLypcbiAgUG9ydGVkIHRvIEphdmFTY3JpcHQgYnkgTGF6YXIgTGFzemxvIDIwMTFcblxuICBsYXphcnNvZnRAZ21haWwuY29tLCB3d3cubGF6YXJzb2Z0LmluZm9cblxuKi9cblxuLypcbipcbiogQ29weXJpZ2h0IDIwMDcgWlhpbmcgYXV0aG9yc1xuKlxuKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4qIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuKlxuKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuKlxuKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4qIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4qIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5cbmZ1bmN0aW9uIEJpdE1hdHJpeCggd2lkdGgsICBoZWlnaHQpXG57XG5cdGlmKCFoZWlnaHQpXG5cdFx0aGVpZ2h0PXdpZHRoO1xuXHRpZiAod2lkdGggPCAxIHx8IGhlaWdodCA8IDEpXG5cdHtcblx0XHR0aHJvdyBcIkJvdGggZGltZW5zaW9ucyBtdXN0IGJlIGdyZWF0ZXIgdGhhbiAwXCI7XG5cdH1cblx0dGhpcy53aWR0aCA9IHdpZHRoO1xuXHR0aGlzLmhlaWdodCA9IGhlaWdodDtcblx0dmFyIHJvd1NpemUgPSB3aWR0aCA+PiA1O1xuXHRpZiAoKHdpZHRoICYgMHgxZikgIT0gMClcblx0e1xuXHRcdHJvd1NpemUrKztcblx0fVxuXHR0aGlzLnJvd1NpemUgPSByb3dTaXplO1xuXHR0aGlzLmJpdHMgPSBuZXcgQXJyYXkocm93U2l6ZSAqIGhlaWdodCk7XG5cdGZvcih2YXIgaT0wO2k8dGhpcy5iaXRzLmxlbmd0aDtpKyspXG5cdFx0dGhpcy5iaXRzW2ldPTA7XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJXaWR0aFwiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMud2lkdGg7XG5cdH19KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJIZWlnaHRcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiB0aGlzLmhlaWdodDtcblx0fX0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIkRpbWVuc2lvblwiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0aWYgKHRoaXMud2lkdGggIT0gdGhpcy5oZWlnaHQpXG5cdFx0e1xuXHRcdFx0dGhyb3cgXCJDYW4ndCBjYWxsIGdldERpbWVuc2lvbigpIG9uIGEgbm9uLXNxdWFyZSBtYXRyaXhcIjtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMud2lkdGg7XG5cdH19KTtcblxuXHR0aGlzLmdldF9SZW5hbWVkPWZ1bmN0aW9uKCB4LCAgeSlcblx0XHR7XG5cdFx0XHR2YXIgb2Zmc2V0ID0geSAqIHRoaXMucm93U2l6ZSArICh4ID4+IDUpO1xuXHRcdFx0cmV0dXJuICgoVVJTaGlmdCh0aGlzLmJpdHNbb2Zmc2V0XSwgKHggJiAweDFmKSkpICYgMSkgIT0gMDtcblx0XHR9XG5cdHRoaXMuc2V0X1JlbmFtZWQ9ZnVuY3Rpb24oIHgsICB5KVxuXHRcdHtcblx0XHRcdHZhciBvZmZzZXQgPSB5ICogdGhpcy5yb3dTaXplICsgKHggPj4gNSk7XG5cdFx0XHR0aGlzLmJpdHNbb2Zmc2V0XSB8PSAxIDw8ICh4ICYgMHgxZik7XG5cdFx0fVxuXHR0aGlzLmZsaXA9ZnVuY3Rpb24oIHgsICB5KVxuXHRcdHtcblx0XHRcdHZhciBvZmZzZXQgPSB5ICogdGhpcy5yb3dTaXplICsgKHggPj4gNSk7XG5cdFx0XHR0aGlzLmJpdHNbb2Zmc2V0XSBePSAxIDw8ICh4ICYgMHgxZik7XG5cdFx0fVxuXHR0aGlzLmNsZWFyPWZ1bmN0aW9uKClcblx0XHR7XG5cdFx0XHR2YXIgbWF4ID0gdGhpcy5iaXRzLmxlbmd0aDtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbWF4OyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdHRoaXMuYml0c1tpXSA9IDA7XG5cdFx0XHR9XG5cdFx0fVxuXHR0aGlzLnNldFJlZ2lvbj1mdW5jdGlvbiggbGVmdCwgIHRvcCwgIHdpZHRoLCAgaGVpZ2h0KVxuXHRcdHtcblx0XHRcdGlmICh0b3AgPCAwIHx8IGxlZnQgPCAwKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBcIkxlZnQgYW5kIHRvcCBtdXN0IGJlIG5vbm5lZ2F0aXZlXCI7XG5cdFx0XHR9XG5cdFx0XHRpZiAoaGVpZ2h0IDwgMSB8fCB3aWR0aCA8IDEpXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IFwiSGVpZ2h0IGFuZCB3aWR0aCBtdXN0IGJlIGF0IGxlYXN0IDFcIjtcblx0XHRcdH1cblx0XHRcdHZhciByaWdodCA9IGxlZnQgKyB3aWR0aDtcblx0XHRcdHZhciBib3R0b20gPSB0b3AgKyBoZWlnaHQ7XG5cdFx0XHRpZiAoYm90dG9tID4gdGhpcy5oZWlnaHQgfHwgcmlnaHQgPiB0aGlzLndpZHRoKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBcIlRoZSByZWdpb24gbXVzdCBmaXQgaW5zaWRlIHRoZSBtYXRyaXhcIjtcblx0XHRcdH1cblx0XHRcdGZvciAodmFyIHkgPSB0b3A7IHkgPCBib3R0b207IHkrKylcblx0XHRcdHtcblx0XHRcdFx0dmFyIG9mZnNldCA9IHkgKiB0aGlzLnJvd1NpemU7XG5cdFx0XHRcdGZvciAodmFyIHggPSBsZWZ0OyB4IDwgcmlnaHQ7IHgrKylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRoaXMuYml0c1tvZmZzZXQgKyAoeCA+PiA1KV0gfD0gMSA8PCAoeCAmIDB4MWYpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxufVxuXG4vKlxuICBQb3J0ZWQgdG8gSmF2YVNjcmlwdCBieSBMYXphciBMYXN6bG8gMjAxMVxuXG4gIGxhemFyc29mdEBnbWFpbC5jb20sIHd3dy5sYXphcnNvZnQuaW5mb1xuXG4qL1xuXG4vKlxuKlxuKiBDb3B5cmlnaHQgMjAwNyBaWGluZyBhdXRob3JzXG4qXG4qIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4qIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4qXG4qICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4qXG4qIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cblxuZnVuY3Rpb24gRGF0YUJsb2NrKG51bURhdGFDb2Rld29yZHMsICBjb2Rld29yZHMpXG57XG5cdHRoaXMubnVtRGF0YUNvZGV3b3JkcyA9IG51bURhdGFDb2Rld29yZHM7XG5cdHRoaXMuY29kZXdvcmRzID0gY29kZXdvcmRzO1xuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiTnVtRGF0YUNvZGV3b3Jkc1wiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMubnVtRGF0YUNvZGV3b3Jkcztcblx0fX0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIkNvZGV3b3Jkc1wiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuY29kZXdvcmRzO1xuXHR9fSk7XG59XG5cbkRhdGFCbG9jay5nZXREYXRhQmxvY2tzPWZ1bmN0aW9uKHJhd0NvZGV3b3JkcywgIHZlcnNpb24sICBlY0xldmVsKVxue1xuXG5cdGlmIChyYXdDb2Rld29yZHMubGVuZ3RoICE9IHZlcnNpb24uVG90YWxDb2Rld29yZHMpXG5cdHtcblx0XHR0aHJvdyBcIkFyZ3VtZW50RXhjZXB0aW9uXCI7XG5cdH1cblxuXHQvLyBGaWd1cmUgb3V0IHRoZSBudW1iZXIgYW5kIHNpemUgb2YgZGF0YSBibG9ja3MgdXNlZCBieSB0aGlzIHZlcnNpb24gYW5kXG5cdC8vIGVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcblx0dmFyIGVjQmxvY2tzID0gdmVyc2lvbi5nZXRFQ0Jsb2Nrc0ZvckxldmVsKGVjTGV2ZWwpO1xuXG5cdC8vIEZpcnN0IGNvdW50IHRoZSB0b3RhbCBudW1iZXIgb2YgZGF0YSBibG9ja3Ncblx0dmFyIHRvdGFsQmxvY2tzID0gMDtcblx0dmFyIGVjQmxvY2tBcnJheSA9IGVjQmxvY2tzLmdldEVDQmxvY2tzKCk7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZWNCbG9ja0FycmF5Lmxlbmd0aDsgaSsrKVxuXHR7XG5cdFx0dG90YWxCbG9ja3MgKz0gZWNCbG9ja0FycmF5W2ldLkNvdW50O1xuXHR9XG5cblx0Ly8gTm93IGVzdGFibGlzaCBEYXRhQmxvY2tzIG9mIHRoZSBhcHByb3ByaWF0ZSBzaXplIGFuZCBudW1iZXIgb2YgZGF0YSBjb2Rld29yZHNcblx0dmFyIHJlc3VsdCA9IG5ldyBBcnJheSh0b3RhbEJsb2Nrcyk7XG5cdHZhciBudW1SZXN1bHRCbG9ja3MgPSAwO1xuXHRmb3IgKHZhciBqID0gMDsgaiA8IGVjQmxvY2tBcnJheS5sZW5ndGg7IGorKylcblx0e1xuXHRcdHZhciBlY0Jsb2NrID0gZWNCbG9ja0FycmF5W2pdO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZWNCbG9jay5Db3VudDsgaSsrKVxuXHRcdHtcblx0XHRcdHZhciBudW1EYXRhQ29kZXdvcmRzID0gZWNCbG9jay5EYXRhQ29kZXdvcmRzO1xuXHRcdFx0dmFyIG51bUJsb2NrQ29kZXdvcmRzID0gZWNCbG9ja3MuRUNDb2Rld29yZHNQZXJCbG9jayArIG51bURhdGFDb2Rld29yZHM7XG5cdFx0XHRyZXN1bHRbbnVtUmVzdWx0QmxvY2tzKytdID0gbmV3IERhdGFCbG9jayhudW1EYXRhQ29kZXdvcmRzLCBuZXcgQXJyYXkobnVtQmxvY2tDb2Rld29yZHMpKTtcblx0XHR9XG5cdH1cblxuXHQvLyBBbGwgYmxvY2tzIGhhdmUgdGhlIHNhbWUgYW1vdW50IG9mIGRhdGEsIGV4Y2VwdCB0aGF0IHRoZSBsYXN0IG5cblx0Ly8gKHdoZXJlIG4gbWF5IGJlIDApIGhhdmUgMSBtb3JlIGJ5dGUuIEZpZ3VyZSBvdXQgd2hlcmUgdGhlc2Ugc3RhcnQuXG5cdHZhciBzaG9ydGVyQmxvY2tzVG90YWxDb2Rld29yZHMgPSByZXN1bHRbMF0uY29kZXdvcmRzLmxlbmd0aDtcblx0dmFyIGxvbmdlckJsb2Nrc1N0YXJ0QXQgPSByZXN1bHQubGVuZ3RoIC0gMTtcblx0d2hpbGUgKGxvbmdlckJsb2Nrc1N0YXJ0QXQgPj0gMClcblx0e1xuXHRcdHZhciBudW1Db2Rld29yZHMgPSByZXN1bHRbbG9uZ2VyQmxvY2tzU3RhcnRBdF0uY29kZXdvcmRzLmxlbmd0aDtcblx0XHRpZiAobnVtQ29kZXdvcmRzID09IHNob3J0ZXJCbG9ja3NUb3RhbENvZGV3b3Jkcylcblx0XHR7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdFx0bG9uZ2VyQmxvY2tzU3RhcnRBdC0tO1xuXHR9XG5cdGxvbmdlckJsb2Nrc1N0YXJ0QXQrKztcblxuXHR2YXIgc2hvcnRlckJsb2Nrc051bURhdGFDb2Rld29yZHMgPSBzaG9ydGVyQmxvY2tzVG90YWxDb2Rld29yZHMgLSBlY0Jsb2Nrcy5FQ0NvZGV3b3Jkc1BlckJsb2NrO1xuXHQvLyBUaGUgbGFzdCBlbGVtZW50cyBvZiByZXN1bHQgbWF5IGJlIDEgZWxlbWVudCBsb25nZXI7XG5cdC8vIGZpcnN0IGZpbGwgb3V0IGFzIG1hbnkgZWxlbWVudHMgYXMgYWxsIG9mIHRoZW0gaGF2ZVxuXHR2YXIgcmF3Q29kZXdvcmRzT2Zmc2V0ID0gMDtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzaG9ydGVyQmxvY2tzTnVtRGF0YUNvZGV3b3JkczsgaSsrKVxuXHR7XG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBudW1SZXN1bHRCbG9ja3M7IGorKylcblx0XHR7XG5cdFx0XHRyZXN1bHRbal0uY29kZXdvcmRzW2ldID0gcmF3Q29kZXdvcmRzW3Jhd0NvZGV3b3Jkc09mZnNldCsrXTtcblx0XHR9XG5cdH1cblx0Ly8gRmlsbCBvdXQgdGhlIGxhc3QgZGF0YSBibG9jayBpbiB0aGUgbG9uZ2VyIG9uZXNcblx0Zm9yICh2YXIgaiA9IGxvbmdlckJsb2Nrc1N0YXJ0QXQ7IGogPCBudW1SZXN1bHRCbG9ja3M7IGorKylcblx0e1xuXHRcdHJlc3VsdFtqXS5jb2Rld29yZHNbc2hvcnRlckJsb2Nrc051bURhdGFDb2Rld29yZHNdID0gcmF3Q29kZXdvcmRzW3Jhd0NvZGV3b3Jkc09mZnNldCsrXTtcblx0fVxuXHQvLyBOb3cgYWRkIGluIGVycm9yIGNvcnJlY3Rpb24gYmxvY2tzXG5cdHZhciBtYXggPSByZXN1bHRbMF0uY29kZXdvcmRzLmxlbmd0aDtcblx0Zm9yICh2YXIgaSA9IHNob3J0ZXJCbG9ja3NOdW1EYXRhQ29kZXdvcmRzOyBpIDwgbWF4OyBpKyspXG5cdHtcblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IG51bVJlc3VsdEJsb2NrczsgaisrKVxuXHRcdHtcblx0XHRcdHZhciBpT2Zmc2V0ID0gaiA8IGxvbmdlckJsb2Nrc1N0YXJ0QXQ/aTppICsgMTtcblx0XHRcdHJlc3VsdFtqXS5jb2Rld29yZHNbaU9mZnNldF0gPSByYXdDb2Rld29yZHNbcmF3Q29kZXdvcmRzT2Zmc2V0KytdO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG4vKlxuICBQb3J0ZWQgdG8gSmF2YVNjcmlwdCBieSBMYXphciBMYXN6bG8gMjAxMVxuXG4gIGxhemFyc29mdEBnbWFpbC5jb20sIHd3dy5sYXphcnNvZnQuaW5mb1xuXG4qL1xuXG4vKlxuKlxuKiBDb3B5cmlnaHQgMjAwNyBaWGluZyBhdXRob3JzXG4qXG4qIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4qIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4qXG4qICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4qXG4qIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cblxuZnVuY3Rpb24gQml0TWF0cml4UGFyc2VyKGJpdE1hdHJpeClcbntcblx0dmFyIGRpbWVuc2lvbiA9IGJpdE1hdHJpeC5EaW1lbnNpb247XG5cdGlmIChkaW1lbnNpb24gPCAyMSB8fCAoZGltZW5zaW9uICYgMHgwMykgIT0gMSlcblx0e1xuXHRcdHRocm93IFwiRXJyb3IgQml0TWF0cml4UGFyc2VyXCI7XG5cdH1cblx0dGhpcy5iaXRNYXRyaXggPSBiaXRNYXRyaXg7XG5cdHRoaXMucGFyc2VkVmVyc2lvbiA9IG51bGw7XG5cdHRoaXMucGFyc2VkRm9ybWF0SW5mbyA9IG51bGw7XG5cblx0dGhpcy5jb3B5Qml0PWZ1bmN0aW9uKCBpLCAgaiwgIHZlcnNpb25CaXRzKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuYml0TWF0cml4LmdldF9SZW5hbWVkKGksIGopPyh2ZXJzaW9uQml0cyA8PCAxKSB8IDB4MTp2ZXJzaW9uQml0cyA8PCAxO1xuXHR9XG5cblx0dGhpcy5yZWFkRm9ybWF0SW5mb3JtYXRpb249ZnVuY3Rpb24oKVxuXHR7XG5cdFx0XHRpZiAodGhpcy5wYXJzZWRGb3JtYXRJbmZvICE9IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB0aGlzLnBhcnNlZEZvcm1hdEluZm87XG5cdFx0XHR9XG5cblx0XHRcdC8vIFJlYWQgdG9wLWxlZnQgZm9ybWF0IGluZm8gYml0c1xuXHRcdFx0dmFyIGZvcm1hdEluZm9CaXRzID0gMDtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgNjsgaSsrKVxuXHRcdFx0e1xuXHRcdFx0XHRmb3JtYXRJbmZvQml0cyA9IHRoaXMuY29weUJpdChpLCA4LCBmb3JtYXRJbmZvQml0cyk7XG5cdFx0XHR9XG5cdFx0XHQvLyAuLiBhbmQgc2tpcCBhIGJpdCBpbiB0aGUgdGltaW5nIHBhdHRlcm4gLi4uXG5cdFx0XHRmb3JtYXRJbmZvQml0cyA9IHRoaXMuY29weUJpdCg3LCA4LCBmb3JtYXRJbmZvQml0cyk7XG5cdFx0XHRmb3JtYXRJbmZvQml0cyA9IHRoaXMuY29weUJpdCg4LCA4LCBmb3JtYXRJbmZvQml0cyk7XG5cdFx0XHRmb3JtYXRJbmZvQml0cyA9IHRoaXMuY29weUJpdCg4LCA3LCBmb3JtYXRJbmZvQml0cyk7XG5cdFx0XHQvLyAuLiBhbmQgc2tpcCBhIGJpdCBpbiB0aGUgdGltaW5nIHBhdHRlcm4gLi4uXG5cdFx0XHRmb3IgKHZhciBqID0gNTsgaiA+PSAwOyBqLS0pXG5cdFx0XHR7XG5cdFx0XHRcdGZvcm1hdEluZm9CaXRzID0gdGhpcy5jb3B5Qml0KDgsIGosIGZvcm1hdEluZm9CaXRzKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5wYXJzZWRGb3JtYXRJbmZvID0gRm9ybWF0SW5mb3JtYXRpb24uZGVjb2RlRm9ybWF0SW5mb3JtYXRpb24oZm9ybWF0SW5mb0JpdHMpO1xuXHRcdFx0aWYgKHRoaXMucGFyc2VkRm9ybWF0SW5mbyAhPSBudWxsKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5wYXJzZWRGb3JtYXRJbmZvO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBIbW0sIGZhaWxlZC4gVHJ5IHRoZSB0b3AtcmlnaHQvYm90dG9tLWxlZnQgcGF0dGVyblxuXHRcdFx0dmFyIGRpbWVuc2lvbiA9IHRoaXMuYml0TWF0cml4LkRpbWVuc2lvbjtcblx0XHRcdGZvcm1hdEluZm9CaXRzID0gMDtcblx0XHRcdHZhciBpTWluID0gZGltZW5zaW9uIC0gODtcblx0XHRcdGZvciAodmFyIGkgPSBkaW1lbnNpb24gLSAxOyBpID49IGlNaW47IGktLSlcblx0XHRcdHtcblx0XHRcdFx0Zm9ybWF0SW5mb0JpdHMgPSB0aGlzLmNvcHlCaXQoaSwgOCwgZm9ybWF0SW5mb0JpdHMpO1xuXHRcdFx0fVxuXHRcdFx0Zm9yICh2YXIgaiA9IGRpbWVuc2lvbiAtIDc7IGogPCBkaW1lbnNpb247IGorKylcblx0XHRcdHtcblx0XHRcdFx0Zm9ybWF0SW5mb0JpdHMgPSB0aGlzLmNvcHlCaXQoOCwgaiwgZm9ybWF0SW5mb0JpdHMpO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnBhcnNlZEZvcm1hdEluZm8gPSBGb3JtYXRJbmZvcm1hdGlvbi5kZWNvZGVGb3JtYXRJbmZvcm1hdGlvbihmb3JtYXRJbmZvQml0cyk7XG5cdFx0XHRpZiAodGhpcy5wYXJzZWRGb3JtYXRJbmZvICE9IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB0aGlzLnBhcnNlZEZvcm1hdEluZm87XG5cdFx0XHR9XG5cdFx0XHR0aHJvdyBcIkVycm9yIHJlYWRGb3JtYXRJbmZvcm1hdGlvblwiO1xuXHR9XG5cdHRoaXMucmVhZFZlcnNpb249ZnVuY3Rpb24oKVxuXHRcdHtcblxuXHRcdFx0aWYgKHRoaXMucGFyc2VkVmVyc2lvbiAhPSBudWxsKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5wYXJzZWRWZXJzaW9uO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgZGltZW5zaW9uID0gdGhpcy5iaXRNYXRyaXguRGltZW5zaW9uO1xuXG5cdFx0XHR2YXIgcHJvdmlzaW9uYWxWZXJzaW9uID0gKGRpbWVuc2lvbiAtIDE3KSA+PiAyO1xuXHRcdFx0aWYgKHByb3Zpc2lvbmFsVmVyc2lvbiA8PSA2KVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gVmVyc2lvbi5nZXRWZXJzaW9uRm9yTnVtYmVyKHByb3Zpc2lvbmFsVmVyc2lvbik7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFJlYWQgdG9wLXJpZ2h0IHZlcnNpb24gaW5mbzogMyB3aWRlIGJ5IDYgdGFsbFxuXHRcdFx0dmFyIHZlcnNpb25CaXRzID0gMDtcblx0XHRcdHZhciBpak1pbiA9IGRpbWVuc2lvbiAtIDExO1xuXHRcdFx0Zm9yICh2YXIgaiA9IDU7IGogPj0gMDsgai0tKVxuXHRcdFx0e1xuXHRcdFx0XHRmb3IgKHZhciBpID0gZGltZW5zaW9uIC0gOTsgaSA+PSBpak1pbjsgaS0tKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dmVyc2lvbkJpdHMgPSB0aGlzLmNvcHlCaXQoaSwgaiwgdmVyc2lvbkJpdHMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMucGFyc2VkVmVyc2lvbiA9IFZlcnNpb24uZGVjb2RlVmVyc2lvbkluZm9ybWF0aW9uKHZlcnNpb25CaXRzKTtcblx0XHRcdGlmICh0aGlzLnBhcnNlZFZlcnNpb24gIT0gbnVsbCAmJiB0aGlzLnBhcnNlZFZlcnNpb24uRGltZW5zaW9uRm9yVmVyc2lvbiA9PSBkaW1lbnNpb24pXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB0aGlzLnBhcnNlZFZlcnNpb247XG5cdFx0XHR9XG5cblx0XHRcdC8vIEhtbSwgZmFpbGVkLiBUcnkgYm90dG9tIGxlZnQ6IDYgd2lkZSBieSAzIHRhbGxcblx0XHRcdHZlcnNpb25CaXRzID0gMDtcblx0XHRcdGZvciAodmFyIGkgPSA1OyBpID49IDA7IGktLSlcblx0XHRcdHtcblx0XHRcdFx0Zm9yICh2YXIgaiA9IGRpbWVuc2lvbiAtIDk7IGogPj0gaWpNaW47IGotLSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZlcnNpb25CaXRzID0gdGhpcy5jb3B5Qml0KGksIGosIHZlcnNpb25CaXRzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnBhcnNlZFZlcnNpb24gPSBWZXJzaW9uLmRlY29kZVZlcnNpb25JbmZvcm1hdGlvbih2ZXJzaW9uQml0cyk7XG5cdFx0XHRpZiAodGhpcy5wYXJzZWRWZXJzaW9uICE9IG51bGwgJiYgdGhpcy5wYXJzZWRWZXJzaW9uLkRpbWVuc2lvbkZvclZlcnNpb24gPT0gZGltZW5zaW9uKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5wYXJzZWRWZXJzaW9uO1xuXHRcdFx0fVxuXHRcdFx0dGhyb3cgXCJFcnJvciByZWFkVmVyc2lvblwiO1xuXHRcdH1cblx0dGhpcy5yZWFkQ29kZXdvcmRzPWZ1bmN0aW9uKClcblx0XHR7XG5cblx0XHRcdHZhciBmb3JtYXRJbmZvID0gdGhpcy5yZWFkRm9ybWF0SW5mb3JtYXRpb24oKTtcblx0XHRcdHZhciB2ZXJzaW9uID0gdGhpcy5yZWFkVmVyc2lvbigpO1xuXG5cdFx0XHQvLyBHZXQgdGhlIGRhdGEgbWFzayBmb3IgdGhlIGZvcm1hdCB1c2VkIGluIHRoaXMgUVIgQ29kZS4gVGhpcyB3aWxsIGV4Y2x1ZGVcblx0XHRcdC8vIHNvbWUgYml0cyBmcm9tIHJlYWRpbmcgYXMgd2Ugd2luZCB0aHJvdWdoIHRoZSBiaXQgbWF0cml4LlxuXHRcdFx0dmFyIGRhdGFNYXNrID0gRGF0YU1hc2suZm9yUmVmZXJlbmNlKCBmb3JtYXRJbmZvLkRhdGFNYXNrKTtcblx0XHRcdHZhciBkaW1lbnNpb24gPSB0aGlzLmJpdE1hdHJpeC5EaW1lbnNpb247XG5cdFx0XHRkYXRhTWFzay51bm1hc2tCaXRNYXRyaXgodGhpcy5iaXRNYXRyaXgsIGRpbWVuc2lvbik7XG5cblx0XHRcdHZhciBmdW5jdGlvblBhdHRlcm4gPSB2ZXJzaW9uLmJ1aWxkRnVuY3Rpb25QYXR0ZXJuKCk7XG5cblx0XHRcdHZhciByZWFkaW5nVXAgPSB0cnVlO1xuXHRcdFx0dmFyIHJlc3VsdCA9IG5ldyBBcnJheSh2ZXJzaW9uLlRvdGFsQ29kZXdvcmRzKTtcblx0XHRcdHZhciByZXN1bHRPZmZzZXQgPSAwO1xuXHRcdFx0dmFyIGN1cnJlbnRCeXRlID0gMDtcblx0XHRcdHZhciBiaXRzUmVhZCA9IDA7XG5cdFx0XHQvLyBSZWFkIGNvbHVtbnMgaW4gcGFpcnMsIGZyb20gcmlnaHQgdG8gbGVmdFxuXHRcdFx0Zm9yICh2YXIgaiA9IGRpbWVuc2lvbiAtIDE7IGogPiAwOyBqIC09IDIpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChqID09IDYpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBTa2lwIHdob2xlIGNvbHVtbiB3aXRoIHZlcnRpY2FsIGFsaWdubWVudCBwYXR0ZXJuO1xuXHRcdFx0XHRcdC8vIHNhdmVzIHRpbWUgYW5kIG1ha2VzIHRoZSBvdGhlciBjb2RlIHByb2NlZWQgbW9yZSBjbGVhbmx5XG5cdFx0XHRcdFx0ai0tO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIFJlYWQgYWx0ZXJuYXRpbmdseSBmcm9tIGJvdHRvbSB0byB0b3AgdGhlbiB0b3AgdG8gYm90dG9tXG5cdFx0XHRcdGZvciAodmFyIGNvdW50ID0gMDsgY291bnQgPCBkaW1lbnNpb247IGNvdW50KyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2YXIgaSA9IHJlYWRpbmdVcD9kaW1lbnNpb24gLSAxIC0gY291bnQ6Y291bnQ7XG5cdFx0XHRcdFx0Zm9yICh2YXIgY29sID0gMDsgY29sIDwgMjsgY29sKyspXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly8gSWdub3JlIGJpdHMgY292ZXJlZCBieSB0aGUgZnVuY3Rpb24gcGF0dGVyblxuXHRcdFx0XHRcdFx0aWYgKCFmdW5jdGlvblBhdHRlcm4uZ2V0X1JlbmFtZWQoaiAtIGNvbCwgaSkpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdC8vIFJlYWQgYSBiaXRcblx0XHRcdFx0XHRcdFx0Yml0c1JlYWQrKztcblx0XHRcdFx0XHRcdFx0Y3VycmVudEJ5dGUgPDw9IDE7XG5cdFx0XHRcdFx0XHRcdGlmICh0aGlzLmJpdE1hdHJpeC5nZXRfUmVuYW1lZChqIC0gY29sLCBpKSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGN1cnJlbnRCeXRlIHw9IDE7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0Ly8gSWYgd2UndmUgbWFkZSBhIHdob2xlIGJ5dGUsIHNhdmUgaXQgb2ZmXG5cdFx0XHRcdFx0XHRcdGlmIChiaXRzUmVhZCA9PSA4KVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0cmVzdWx0W3Jlc3VsdE9mZnNldCsrXSA9ICBjdXJyZW50Qnl0ZTtcblx0XHRcdFx0XHRcdFx0XHRiaXRzUmVhZCA9IDA7XG5cdFx0XHRcdFx0XHRcdFx0Y3VycmVudEJ5dGUgPSAwO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJlYWRpbmdVcCBePSB0cnVlOyAvLyByZWFkaW5nVXAgPSAhcmVhZGluZ1VwOyAvLyBzd2l0Y2ggZGlyZWN0aW9uc1xuXHRcdFx0fVxuXHRcdFx0aWYgKHJlc3VsdE9mZnNldCAhPSB2ZXJzaW9uLlRvdGFsQ29kZXdvcmRzKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBcIkVycm9yIHJlYWRDb2Rld29yZHNcIjtcblx0XHRcdH1cblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxufVxuXG4vKlxuICBQb3J0ZWQgdG8gSmF2YVNjcmlwdCBieSBMYXphciBMYXN6bG8gMjAxMVxuXG4gIGxhemFyc29mdEBnbWFpbC5jb20sIHd3dy5sYXphcnNvZnQuaW5mb1xuXG4qL1xuXG4vKlxuKlxuKiBDb3B5cmlnaHQgMjAwNyBaWGluZyBhdXRob3JzXG4qXG4qIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4qIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4qXG4qICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4qXG4qIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cblxudmFyIERhdGFNYXNrID0ge307XG5cbkRhdGFNYXNrLmZvclJlZmVyZW5jZSA9IGZ1bmN0aW9uKHJlZmVyZW5jZSlcbntcblx0aWYgKHJlZmVyZW5jZSA8IDAgfHwgcmVmZXJlbmNlID4gNylcblx0e1xuXHRcdHRocm93IFwiU3lzdGVtLkFyZ3VtZW50RXhjZXB0aW9uXCI7XG5cdH1cblx0cmV0dXJuIERhdGFNYXNrLkRBVEFfTUFTS1NbcmVmZXJlbmNlXTtcbn1cblxuZnVuY3Rpb24gRGF0YU1hc2swMDAoKVxue1xuXHR0aGlzLnVubWFza0JpdE1hdHJpeD1mdW5jdGlvbihiaXRzLCAgZGltZW5zaW9uKVxuXHR7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkaW1lbnNpb247IGkrKylcblx0XHR7XG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGRpbWVuc2lvbjsgaisrKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAodGhpcy5pc01hc2tlZChpLCBqKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGJpdHMuZmxpcChqLCBpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHR0aGlzLmlzTWFza2VkPWZ1bmN0aW9uKCBpLCAgailcblx0e1xuXHRcdHJldHVybiAoKGkgKyBqKSAmIDB4MDEpID09IDA7XG5cdH1cbn1cblxuZnVuY3Rpb24gRGF0YU1hc2swMDEoKVxue1xuXHR0aGlzLnVubWFza0JpdE1hdHJpeD1mdW5jdGlvbihiaXRzLCAgZGltZW5zaW9uKVxuXHR7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkaW1lbnNpb247IGkrKylcblx0XHR7XG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGRpbWVuc2lvbjsgaisrKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAodGhpcy5pc01hc2tlZChpLCBqKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGJpdHMuZmxpcChqLCBpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHR0aGlzLmlzTWFza2VkPWZ1bmN0aW9uKCBpLCAgailcblx0e1xuXHRcdHJldHVybiAoaSAmIDB4MDEpID09IDA7XG5cdH1cbn1cblxuZnVuY3Rpb24gRGF0YU1hc2swMTAoKVxue1xuXHR0aGlzLnVubWFza0JpdE1hdHJpeD1mdW5jdGlvbihiaXRzLCAgZGltZW5zaW9uKVxuXHR7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkaW1lbnNpb247IGkrKylcblx0XHR7XG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGRpbWVuc2lvbjsgaisrKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAodGhpcy5pc01hc2tlZChpLCBqKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGJpdHMuZmxpcChqLCBpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHR0aGlzLmlzTWFza2VkPWZ1bmN0aW9uKCBpLCAgailcblx0e1xuXHRcdHJldHVybiBqICUgMyA9PSAwO1xuXHR9XG59XG5cbmZ1bmN0aW9uIERhdGFNYXNrMDExKClcbntcblx0dGhpcy51bm1hc2tCaXRNYXRyaXg9ZnVuY3Rpb24oYml0cywgIGRpbWVuc2lvbilcblx0e1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGltZW5zaW9uOyBpKyspXG5cdFx0e1xuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBkaW1lbnNpb247IGorKylcblx0XHRcdHtcblx0XHRcdFx0aWYgKHRoaXMuaXNNYXNrZWQoaSwgaikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRiaXRzLmZsaXAoaiwgaSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0dGhpcy5pc01hc2tlZD1mdW5jdGlvbiggaSwgIGopXG5cdHtcblx0XHRyZXR1cm4gKGkgKyBqKSAlIDMgPT0gMDtcblx0fVxufVxuXG5mdW5jdGlvbiBEYXRhTWFzazEwMCgpXG57XG5cdHRoaXMudW5tYXNrQml0TWF0cml4PWZ1bmN0aW9uKGJpdHMsICBkaW1lbnNpb24pXG5cdHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGRpbWVuc2lvbjsgaSsrKVxuXHRcdHtcblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgZGltZW5zaW9uOyBqKyspXG5cdFx0XHR7XG5cdFx0XHRcdGlmICh0aGlzLmlzTWFza2VkKGksIGopKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Yml0cy5mbGlwKGosIGkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHRoaXMuaXNNYXNrZWQ9ZnVuY3Rpb24oIGksICBqKVxuXHR7XG5cdFx0cmV0dXJuICgoKFVSU2hpZnQoaSwgMSkpICsgKGogLyAzKSkgJiAweDAxKSA9PSAwO1xuXHR9XG59XG5cbmZ1bmN0aW9uIERhdGFNYXNrMTAxKClcbntcblx0dGhpcy51bm1hc2tCaXRNYXRyaXg9ZnVuY3Rpb24oYml0cywgIGRpbWVuc2lvbilcblx0e1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGltZW5zaW9uOyBpKyspXG5cdFx0e1xuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBkaW1lbnNpb247IGorKylcblx0XHRcdHtcblx0XHRcdFx0aWYgKHRoaXMuaXNNYXNrZWQoaSwgaikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRiaXRzLmZsaXAoaiwgaSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0dGhpcy5pc01hc2tlZD1mdW5jdGlvbiggaSwgIGopXG5cdHtcblx0XHR2YXIgdGVtcCA9IGkgKiBqO1xuXHRcdHJldHVybiAodGVtcCAmIDB4MDEpICsgKHRlbXAgJSAzKSA9PSAwO1xuXHR9XG59XG5cbmZ1bmN0aW9uIERhdGFNYXNrMTEwKClcbntcblx0dGhpcy51bm1hc2tCaXRNYXRyaXg9ZnVuY3Rpb24oYml0cywgIGRpbWVuc2lvbilcblx0e1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGltZW5zaW9uOyBpKyspXG5cdFx0e1xuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBkaW1lbnNpb247IGorKylcblx0XHRcdHtcblx0XHRcdFx0aWYgKHRoaXMuaXNNYXNrZWQoaSwgaikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRiaXRzLmZsaXAoaiwgaSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0dGhpcy5pc01hc2tlZD1mdW5jdGlvbiggaSwgIGopXG5cdHtcblx0XHR2YXIgdGVtcCA9IGkgKiBqO1xuXHRcdHJldHVybiAoKCh0ZW1wICYgMHgwMSkgKyAodGVtcCAlIDMpKSAmIDB4MDEpID09IDA7XG5cdH1cbn1cbmZ1bmN0aW9uIERhdGFNYXNrMTExKClcbntcblx0dGhpcy51bm1hc2tCaXRNYXRyaXg9ZnVuY3Rpb24oYml0cywgIGRpbWVuc2lvbilcblx0e1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGltZW5zaW9uOyBpKyspXG5cdFx0e1xuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBkaW1lbnNpb247IGorKylcblx0XHRcdHtcblx0XHRcdFx0aWYgKHRoaXMuaXNNYXNrZWQoaSwgaikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRiaXRzLmZsaXAoaiwgaSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0dGhpcy5pc01hc2tlZD1mdW5jdGlvbiggaSwgIGopXG5cdHtcblx0XHRyZXR1cm4gKCgoKGkgKyBqKSAmIDB4MDEpICsgKChpICogaikgJSAzKSkgJiAweDAxKSA9PSAwO1xuXHR9XG59XG5cbkRhdGFNYXNrLkRBVEFfTUFTS1MgPSBuZXcgQXJyYXkobmV3IERhdGFNYXNrMDAwKCksIG5ldyBEYXRhTWFzazAwMSgpLCBuZXcgRGF0YU1hc2swMTAoKSwgbmV3IERhdGFNYXNrMDExKCksIG5ldyBEYXRhTWFzazEwMCgpLCBuZXcgRGF0YU1hc2sxMDEoKSwgbmV3IERhdGFNYXNrMTEwKCksIG5ldyBEYXRhTWFzazExMSgpKTtcblxuXG4vKlxuICBQb3J0ZWQgdG8gSmF2YVNjcmlwdCBieSBMYXphciBMYXN6bG8gMjAxMVxuXG4gIGxhemFyc29mdEBnbWFpbC5jb20sIHd3dy5sYXphcnNvZnQuaW5mb1xuXG4qL1xuXG4vKlxuKlxuKiBDb3B5cmlnaHQgMjAwNyBaWGluZyBhdXRob3JzXG4qXG4qIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4qIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4qXG4qICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4qXG4qIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cblxuZnVuY3Rpb24gUmVlZFNvbG9tb25EZWNvZGVyKGZpZWxkKVxue1xuXHR0aGlzLmZpZWxkID0gZmllbGQ7XG5cdHRoaXMuZGVjb2RlPWZ1bmN0aW9uKHJlY2VpdmVkLCAgdHdvUylcblx0e1xuXHRcdFx0dmFyIHBvbHkgPSBuZXcgR0YyNTZQb2x5KHRoaXMuZmllbGQsIHJlY2VpdmVkKTtcblx0XHRcdHZhciBzeW5kcm9tZUNvZWZmaWNpZW50cyA9IG5ldyBBcnJheSh0d29TKTtcblx0XHRcdGZvcih2YXIgaT0wO2k8c3luZHJvbWVDb2VmZmljaWVudHMubGVuZ3RoO2krKylzeW5kcm9tZUNvZWZmaWNpZW50c1tpXT0wO1xuXHRcdFx0dmFyIGRhdGFNYXRyaXggPSBmYWxzZTsvL3RoaXMuZmllbGQuRXF1YWxzKEdGMjU2LkRBVEFfTUFUUklYX0ZJRUxEKTtcblx0XHRcdHZhciBub0Vycm9yID0gdHJ1ZTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdHdvUzsgaSsrKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBUaGFua3MgdG8gc2FuZm9yZHNxdWlyZXMgZm9yIHRoaXMgZml4OlxuXHRcdFx0XHR2YXIgZXZhbCA9IHBvbHkuZXZhbHVhdGVBdCh0aGlzLmZpZWxkLmV4cChkYXRhTWF0cml4P2kgKyAxOmkpKTtcblx0XHRcdFx0c3luZHJvbWVDb2VmZmljaWVudHNbc3luZHJvbWVDb2VmZmljaWVudHMubGVuZ3RoIC0gMSAtIGldID0gZXZhbDtcblx0XHRcdFx0aWYgKGV2YWwgIT0gMClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG5vRXJyb3IgPSBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKG5vRXJyb3IpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiA7XG5cdFx0XHR9XG5cdFx0XHR2YXIgc3luZHJvbWUgPSBuZXcgR0YyNTZQb2x5KHRoaXMuZmllbGQsIHN5bmRyb21lQ29lZmZpY2llbnRzKTtcblx0XHRcdHZhciBzaWdtYU9tZWdhID0gdGhpcy5ydW5FdWNsaWRlYW5BbGdvcml0aG0odGhpcy5maWVsZC5idWlsZE1vbm9taWFsKHR3b1MsIDEpLCBzeW5kcm9tZSwgdHdvUyk7XG5cdFx0XHR2YXIgc2lnbWEgPSBzaWdtYU9tZWdhWzBdO1xuXHRcdFx0dmFyIG9tZWdhID0gc2lnbWFPbWVnYVsxXTtcblx0XHRcdHZhciBlcnJvckxvY2F0aW9ucyA9IHRoaXMuZmluZEVycm9yTG9jYXRpb25zKHNpZ21hKTtcblx0XHRcdHZhciBlcnJvck1hZ25pdHVkZXMgPSB0aGlzLmZpbmRFcnJvck1hZ25pdHVkZXMob21lZ2EsIGVycm9yTG9jYXRpb25zLCBkYXRhTWF0cml4KTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZXJyb3JMb2NhdGlvbnMubGVuZ3RoOyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBwb3NpdGlvbiA9IHJlY2VpdmVkLmxlbmd0aCAtIDEgLSB0aGlzLmZpZWxkLmxvZyhlcnJvckxvY2F0aW9uc1tpXSk7XG5cdFx0XHRcdGlmIChwb3NpdGlvbiA8IDApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0aHJvdyBcIlJlZWRTb2xvbW9uRXhjZXB0aW9uIEJhZCBlcnJvciBsb2NhdGlvblwiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJlY2VpdmVkW3Bvc2l0aW9uXSA9IEdGMjU2LmFkZE9yU3VidHJhY3QocmVjZWl2ZWRbcG9zaXRpb25dLCBlcnJvck1hZ25pdHVkZXNbaV0pO1xuXHRcdFx0fVxuXHR9XG5cblx0dGhpcy5ydW5FdWNsaWRlYW5BbGdvcml0aG09ZnVuY3Rpb24oIGEsICBiLCAgUilcblx0XHR7XG5cdFx0XHQvLyBBc3N1bWUgYSdzIGRlZ3JlZSBpcyA+PSBiJ3Ncblx0XHRcdGlmIChhLkRlZ3JlZSA8IGIuRGVncmVlKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgdGVtcCA9IGE7XG5cdFx0XHRcdGEgPSBiO1xuXHRcdFx0XHRiID0gdGVtcDtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHJMYXN0ID0gYTtcblx0XHRcdHZhciByID0gYjtcblx0XHRcdHZhciBzTGFzdCA9IHRoaXMuZmllbGQuT25lO1xuXHRcdFx0dmFyIHMgPSB0aGlzLmZpZWxkLlplcm87XG5cdFx0XHR2YXIgdExhc3QgPSB0aGlzLmZpZWxkLlplcm87XG5cdFx0XHR2YXIgdCA9IHRoaXMuZmllbGQuT25lO1xuXG5cdFx0XHQvLyBSdW4gRXVjbGlkZWFuIGFsZ29yaXRobSB1bnRpbCByJ3MgZGVncmVlIGlzIGxlc3MgdGhhbiBSLzJcblx0XHRcdHdoaWxlIChyLkRlZ3JlZSA+PSBNYXRoLmZsb29yKFIgLyAyKSlcblx0XHRcdHtcblx0XHRcdFx0dmFyIHJMYXN0TGFzdCA9IHJMYXN0O1xuXHRcdFx0XHR2YXIgc0xhc3RMYXN0ID0gc0xhc3Q7XG5cdFx0XHRcdHZhciB0TGFzdExhc3QgPSB0TGFzdDtcblx0XHRcdFx0ckxhc3QgPSByO1xuXHRcdFx0XHRzTGFzdCA9IHM7XG5cdFx0XHRcdHRMYXN0ID0gdDtcblxuXHRcdFx0XHQvLyBEaXZpZGUgckxhc3RMYXN0IGJ5IHJMYXN0LCB3aXRoIHF1b3RpZW50IGluIHEgYW5kIHJlbWFpbmRlciBpbiByXG5cdFx0XHRcdGlmIChyTGFzdC5aZXJvKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gT29wcywgRXVjbGlkZWFuIGFsZ29yaXRobSBhbHJlYWR5IHRlcm1pbmF0ZWQ/XG5cdFx0XHRcdFx0dGhyb3cgXCJyX3tpLTF9IHdhcyB6ZXJvXCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0ciA9IHJMYXN0TGFzdDtcblx0XHRcdFx0dmFyIHEgPSB0aGlzLmZpZWxkLlplcm87XG5cdFx0XHRcdHZhciBkZW5vbWluYXRvckxlYWRpbmdUZXJtID0gckxhc3QuZ2V0Q29lZmZpY2llbnQockxhc3QuRGVncmVlKTtcblx0XHRcdFx0dmFyIGRsdEludmVyc2UgPSB0aGlzLmZpZWxkLmludmVyc2UoZGVub21pbmF0b3JMZWFkaW5nVGVybSk7XG5cdFx0XHRcdHdoaWxlIChyLkRlZ3JlZSA+PSByTGFzdC5EZWdyZWUgJiYgIXIuWmVybylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZhciBkZWdyZWVEaWZmID0gci5EZWdyZWUgLSByTGFzdC5EZWdyZWU7XG5cdFx0XHRcdFx0dmFyIHNjYWxlID0gdGhpcy5maWVsZC5tdWx0aXBseShyLmdldENvZWZmaWNpZW50KHIuRGVncmVlKSwgZGx0SW52ZXJzZSk7XG5cdFx0XHRcdFx0cSA9IHEuYWRkT3JTdWJ0cmFjdCh0aGlzLmZpZWxkLmJ1aWxkTW9ub21pYWwoZGVncmVlRGlmZiwgc2NhbGUpKTtcblx0XHRcdFx0XHRyID0gci5hZGRPclN1YnRyYWN0KHJMYXN0Lm11bHRpcGx5QnlNb25vbWlhbChkZWdyZWVEaWZmLCBzY2FsZSkpO1xuXHRcdFx0XHRcdC8vci5FWEUoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHMgPSBxLm11bHRpcGx5MShzTGFzdCkuYWRkT3JTdWJ0cmFjdChzTGFzdExhc3QpO1xuXHRcdFx0XHR0ID0gcS5tdWx0aXBseTEodExhc3QpLmFkZE9yU3VidHJhY3QodExhc3RMYXN0KTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHNpZ21hVGlsZGVBdFplcm8gPSB0LmdldENvZWZmaWNpZW50KDApO1xuXHRcdFx0aWYgKHNpZ21hVGlsZGVBdFplcm8gPT0gMClcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgXCJSZWVkU29sb21vbkV4Y2VwdGlvbiBzaWdtYVRpbGRlKDApIHdhcyB6ZXJvXCI7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBpbnZlcnNlID0gdGhpcy5maWVsZC5pbnZlcnNlKHNpZ21hVGlsZGVBdFplcm8pO1xuXHRcdFx0dmFyIHNpZ21hID0gdC5tdWx0aXBseTIoaW52ZXJzZSk7XG5cdFx0XHR2YXIgb21lZ2EgPSByLm11bHRpcGx5MihpbnZlcnNlKTtcblx0XHRcdHJldHVybiBuZXcgQXJyYXkoc2lnbWEsIG9tZWdhKTtcblx0XHR9XG5cdHRoaXMuZmluZEVycm9yTG9jYXRpb25zPWZ1bmN0aW9uKCBlcnJvckxvY2F0b3IpXG5cdFx0e1xuXHRcdFx0Ly8gVGhpcyBpcyBhIGRpcmVjdCBhcHBsaWNhdGlvbiBvZiBDaGllbidzIHNlYXJjaFxuXHRcdFx0dmFyIG51bUVycm9ycyA9IGVycm9yTG9jYXRvci5EZWdyZWU7XG5cdFx0XHRpZiAobnVtRXJyb3JzID09IDEpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIHNob3J0Y3V0XG5cdFx0XHRcdHJldHVybiBuZXcgQXJyYXkoZXJyb3JMb2NhdG9yLmdldENvZWZmaWNpZW50KDEpKTtcblx0XHRcdH1cblx0XHRcdHZhciByZXN1bHQgPSBuZXcgQXJyYXkobnVtRXJyb3JzKTtcblx0XHRcdHZhciBlID0gMDtcblx0XHRcdGZvciAodmFyIGkgPSAxOyBpIDwgMjU2ICYmIGUgPCBudW1FcnJvcnM7IGkrKylcblx0XHRcdHtcblx0XHRcdFx0aWYgKGVycm9yTG9jYXRvci5ldmFsdWF0ZUF0KGkpID09IDApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXN1bHRbZV0gPSB0aGlzLmZpZWxkLmludmVyc2UoaSk7XG5cdFx0XHRcdFx0ZSsrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoZSAhPSBudW1FcnJvcnMpXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IFwiRXJyb3IgbG9jYXRvciBkZWdyZWUgZG9lcyBub3QgbWF0Y2ggbnVtYmVyIG9mIHJvb3RzXCI7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblx0dGhpcy5maW5kRXJyb3JNYWduaXR1ZGVzPWZ1bmN0aW9uKCBlcnJvckV2YWx1YXRvciwgIGVycm9yTG9jYXRpb25zLCAgZGF0YU1hdHJpeClcblx0XHR7XG5cdFx0XHQvLyBUaGlzIGlzIGRpcmVjdGx5IGFwcGx5aW5nIEZvcm5leSdzIEZvcm11bGFcblx0XHRcdHZhciBzID0gZXJyb3JMb2NhdGlvbnMubGVuZ3RoO1xuXHRcdFx0dmFyIHJlc3VsdCA9IG5ldyBBcnJheShzKTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgczsgaSsrKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgeGlJbnZlcnNlID0gdGhpcy5maWVsZC5pbnZlcnNlKGVycm9yTG9jYXRpb25zW2ldKTtcblx0XHRcdFx0dmFyIGRlbm9taW5hdG9yID0gMTtcblx0XHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBzOyBqKyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoaSAhPSBqKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGRlbm9taW5hdG9yID0gdGhpcy5maWVsZC5tdWx0aXBseShkZW5vbWluYXRvciwgR0YyNTYuYWRkT3JTdWJ0cmFjdCgxLCB0aGlzLmZpZWxkLm11bHRpcGx5KGVycm9yTG9jYXRpb25zW2pdLCB4aUludmVyc2UpKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJlc3VsdFtpXSA9IHRoaXMuZmllbGQubXVsdGlwbHkoZXJyb3JFdmFsdWF0b3IuZXZhbHVhdGVBdCh4aUludmVyc2UpLCB0aGlzLmZpZWxkLmludmVyc2UoZGVub21pbmF0b3IpKTtcblx0XHRcdFx0Ly8gVGhhbmtzIHRvIHNhbmZvcmRzcXVpcmVzIGZvciB0aGlzIGZpeDpcblx0XHRcdFx0aWYgKGRhdGFNYXRyaXgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXN1bHRbaV0gPSB0aGlzLmZpZWxkLm11bHRpcGx5KHJlc3VsdFtpXSwgeGlJbnZlcnNlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG59XG5cbi8qXG4gIFBvcnRlZCB0byBKYXZhU2NyaXB0IGJ5IExhemFyIExhc3psbyAyMDExXG5cbiAgbGF6YXJzb2Z0QGdtYWlsLmNvbSwgd3d3LmxhemFyc29mdC5pbmZvXG5cbiovXG5cbi8qXG4qXG4qIENvcHlyaWdodCAyMDA3IFpYaW5nIGF1dGhvcnNcbipcbiogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbipcbiogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbipcbiogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4qIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4qIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuXG5mdW5jdGlvbiBHRjI1NlBvbHkoZmllbGQsICBjb2VmZmljaWVudHMpXG57XG5cdGlmIChjb2VmZmljaWVudHMgPT0gbnVsbCB8fCBjb2VmZmljaWVudHMubGVuZ3RoID09IDApXG5cdHtcblx0XHR0aHJvdyBcIlN5c3RlbS5Bcmd1bWVudEV4Y2VwdGlvblwiO1xuXHR9XG5cdHRoaXMuZmllbGQgPSBmaWVsZDtcblx0dmFyIGNvZWZmaWNpZW50c0xlbmd0aCA9IGNvZWZmaWNpZW50cy5sZW5ndGg7XG5cdGlmIChjb2VmZmljaWVudHNMZW5ndGggPiAxICYmIGNvZWZmaWNpZW50c1swXSA9PSAwKVxuXHR7XG5cdFx0Ly8gTGVhZGluZyB0ZXJtIG11c3QgYmUgbm9uLXplcm8gZm9yIGFueXRoaW5nIGV4Y2VwdCB0aGUgY29uc3RhbnQgcG9seW5vbWlhbCBcIjBcIlxuXHRcdHZhciBmaXJzdE5vblplcm8gPSAxO1xuXHRcdHdoaWxlIChmaXJzdE5vblplcm8gPCBjb2VmZmljaWVudHNMZW5ndGggJiYgY29lZmZpY2llbnRzW2ZpcnN0Tm9uWmVyb10gPT0gMClcblx0XHR7XG5cdFx0XHRmaXJzdE5vblplcm8rKztcblx0XHR9XG5cdFx0aWYgKGZpcnN0Tm9uWmVybyA9PSBjb2VmZmljaWVudHNMZW5ndGgpXG5cdFx0e1xuXHRcdFx0dGhpcy5jb2VmZmljaWVudHMgPSBmaWVsZC5aZXJvLmNvZWZmaWNpZW50cztcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHRoaXMuY29lZmZpY2llbnRzID0gbmV3IEFycmF5KGNvZWZmaWNpZW50c0xlbmd0aCAtIGZpcnN0Tm9uWmVybyk7XG5cdFx0XHRmb3IodmFyIGk9MDtpPHRoaXMuY29lZmZpY2llbnRzLmxlbmd0aDtpKyspdGhpcy5jb2VmZmljaWVudHNbaV09MDtcblx0XHRcdC8vQXJyYXkuQ29weShjb2VmZmljaWVudHMsIGZpcnN0Tm9uWmVybywgdGhpcy5jb2VmZmljaWVudHMsIDAsIHRoaXMuY29lZmZpY2llbnRzLmxlbmd0aCk7XG5cdFx0XHRmb3IodmFyIGNpPTA7Y2k8dGhpcy5jb2VmZmljaWVudHMubGVuZ3RoO2NpKyspdGhpcy5jb2VmZmljaWVudHNbY2ldPWNvZWZmaWNpZW50c1tmaXJzdE5vblplcm8rY2ldO1xuXHRcdH1cblx0fVxuXHRlbHNlXG5cdHtcblx0XHR0aGlzLmNvZWZmaWNpZW50cyA9IGNvZWZmaWNpZW50cztcblx0fVxuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiWmVyb1wiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuY29lZmZpY2llbnRzWzBdID09IDA7XG5cdH19KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJEZWdyZWVcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiB0aGlzLmNvZWZmaWNpZW50cy5sZW5ndGggLSAxO1xuXHR9fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiQ29lZmZpY2llbnRzXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5jb2VmZmljaWVudHM7XG5cdH19KTtcblxuXHR0aGlzLmdldENvZWZmaWNpZW50PWZ1bmN0aW9uKCBkZWdyZWUpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5jb2VmZmljaWVudHNbdGhpcy5jb2VmZmljaWVudHMubGVuZ3RoIC0gMSAtIGRlZ3JlZV07XG5cdH1cblxuXHR0aGlzLmV2YWx1YXRlQXQ9ZnVuY3Rpb24oIGEpXG5cdHtcblx0XHRpZiAoYSA9PSAwKVxuXHRcdHtcblx0XHRcdC8vIEp1c3QgcmV0dXJuIHRoZSB4XjAgY29lZmZpY2llbnRcblx0XHRcdHJldHVybiB0aGlzLmdldENvZWZmaWNpZW50KDApO1xuXHRcdH1cblx0XHR2YXIgc2l6ZSA9IHRoaXMuY29lZmZpY2llbnRzLmxlbmd0aDtcblx0XHRpZiAoYSA9PSAxKVxuXHRcdHtcblx0XHRcdC8vIEp1c3QgdGhlIHN1bSBvZiB0aGUgY29lZmZpY2llbnRzXG5cdFx0XHR2YXIgcmVzdWx0ID0gMDtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2l6ZTsgaSsrKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXN1bHQgPSBHRjI1Ni5hZGRPclN1YnRyYWN0KHJlc3VsdCwgdGhpcy5jb2VmZmljaWVudHNbaV0pO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cdFx0dmFyIHJlc3VsdDIgPSB0aGlzLmNvZWZmaWNpZW50c1swXTtcblx0XHRmb3IgKHZhciBpID0gMTsgaSA8IHNpemU7IGkrKylcblx0XHR7XG5cdFx0XHRyZXN1bHQyID0gR0YyNTYuYWRkT3JTdWJ0cmFjdCh0aGlzLmZpZWxkLm11bHRpcGx5KGEsIHJlc3VsdDIpLCB0aGlzLmNvZWZmaWNpZW50c1tpXSk7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQyO1xuXHR9XG5cblx0dGhpcy5hZGRPclN1YnRyYWN0PWZ1bmN0aW9uKCBvdGhlcilcblx0XHR7XG5cdFx0XHRpZiAodGhpcy5maWVsZCAhPSBvdGhlci5maWVsZClcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgXCJHRjI1NlBvbHlzIGRvIG5vdCBoYXZlIHNhbWUgR0YyNTYgZmllbGRcIjtcblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLlplcm8pXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBvdGhlcjtcblx0XHRcdH1cblx0XHRcdGlmIChvdGhlci5aZXJvKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdGhpcztcblx0XHRcdH1cblxuXHRcdFx0dmFyIHNtYWxsZXJDb2VmZmljaWVudHMgPSB0aGlzLmNvZWZmaWNpZW50cztcblx0XHRcdHZhciBsYXJnZXJDb2VmZmljaWVudHMgPSBvdGhlci5jb2VmZmljaWVudHM7XG5cdFx0XHRpZiAoc21hbGxlckNvZWZmaWNpZW50cy5sZW5ndGggPiBsYXJnZXJDb2VmZmljaWVudHMubGVuZ3RoKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgdGVtcCA9IHNtYWxsZXJDb2VmZmljaWVudHM7XG5cdFx0XHRcdHNtYWxsZXJDb2VmZmljaWVudHMgPSBsYXJnZXJDb2VmZmljaWVudHM7XG5cdFx0XHRcdGxhcmdlckNvZWZmaWNpZW50cyA9IHRlbXA7XG5cdFx0XHR9XG5cdFx0XHR2YXIgc3VtRGlmZiA9IG5ldyBBcnJheShsYXJnZXJDb2VmZmljaWVudHMubGVuZ3RoKTtcblx0XHRcdHZhciBsZW5ndGhEaWZmID0gbGFyZ2VyQ29lZmZpY2llbnRzLmxlbmd0aCAtIHNtYWxsZXJDb2VmZmljaWVudHMubGVuZ3RoO1xuXHRcdFx0Ly8gQ29weSBoaWdoLW9yZGVyIHRlcm1zIG9ubHkgZm91bmQgaW4gaGlnaGVyLWRlZ3JlZSBwb2x5bm9taWFsJ3MgY29lZmZpY2llbnRzXG5cdFx0XHQvL0FycmF5LkNvcHkobGFyZ2VyQ29lZmZpY2llbnRzLCAwLCBzdW1EaWZmLCAwLCBsZW5ndGhEaWZmKTtcblx0XHRcdGZvcih2YXIgY2k9MDtjaTxsZW5ndGhEaWZmO2NpKyspc3VtRGlmZltjaV09bGFyZ2VyQ29lZmZpY2llbnRzW2NpXTtcblxuXHRcdFx0Zm9yICh2YXIgaSA9IGxlbmd0aERpZmY7IGkgPCBsYXJnZXJDb2VmZmljaWVudHMubGVuZ3RoOyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdHN1bURpZmZbaV0gPSBHRjI1Ni5hZGRPclN1YnRyYWN0KHNtYWxsZXJDb2VmZmljaWVudHNbaSAtIGxlbmd0aERpZmZdLCBsYXJnZXJDb2VmZmljaWVudHNbaV0pO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gbmV3IEdGMjU2UG9seShmaWVsZCwgc3VtRGlmZik7XG5cdH1cblx0dGhpcy5tdWx0aXBseTE9ZnVuY3Rpb24oIG90aGVyKVxuXHRcdHtcblx0XHRcdGlmICh0aGlzLmZpZWxkIT1vdGhlci5maWVsZClcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgXCJHRjI1NlBvbHlzIGRvIG5vdCBoYXZlIHNhbWUgR0YyNTYgZmllbGRcIjtcblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLlplcm8gfHwgb3RoZXIuWmVybylcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuZmllbGQuWmVybztcblx0XHRcdH1cblx0XHRcdHZhciBhQ29lZmZpY2llbnRzID0gdGhpcy5jb2VmZmljaWVudHM7XG5cdFx0XHR2YXIgYUxlbmd0aCA9IGFDb2VmZmljaWVudHMubGVuZ3RoO1xuXHRcdFx0dmFyIGJDb2VmZmljaWVudHMgPSBvdGhlci5jb2VmZmljaWVudHM7XG5cdFx0XHR2YXIgYkxlbmd0aCA9IGJDb2VmZmljaWVudHMubGVuZ3RoO1xuXHRcdFx0dmFyIHByb2R1Y3QgPSBuZXcgQXJyYXkoYUxlbmd0aCArIGJMZW5ndGggLSAxKTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYUxlbmd0aDsgaSsrKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgYUNvZWZmID0gYUNvZWZmaWNpZW50c1tpXTtcblx0XHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBiTGVuZ3RoOyBqKyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRwcm9kdWN0W2kgKyBqXSA9IEdGMjU2LmFkZE9yU3VidHJhY3QocHJvZHVjdFtpICsgal0sIHRoaXMuZmllbGQubXVsdGlwbHkoYUNvZWZmLCBiQ29lZmZpY2llbnRzW2pdKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBuZXcgR0YyNTZQb2x5KHRoaXMuZmllbGQsIHByb2R1Y3QpO1xuXHRcdH1cblx0dGhpcy5tdWx0aXBseTI9ZnVuY3Rpb24oIHNjYWxhcilcblx0XHR7XG5cdFx0XHRpZiAoc2NhbGFyID09IDApXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB0aGlzLmZpZWxkLlplcm87XG5cdFx0XHR9XG5cdFx0XHRpZiAoc2NhbGFyID09IDEpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB0aGlzO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHNpemUgPSB0aGlzLmNvZWZmaWNpZW50cy5sZW5ndGg7XG5cdFx0XHR2YXIgcHJvZHVjdCA9IG5ldyBBcnJheShzaXplKTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2l6ZTsgaSsrKVxuXHRcdFx0e1xuXHRcdFx0XHRwcm9kdWN0W2ldID0gdGhpcy5maWVsZC5tdWx0aXBseSh0aGlzLmNvZWZmaWNpZW50c1tpXSwgc2NhbGFyKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBuZXcgR0YyNTZQb2x5KHRoaXMuZmllbGQsIHByb2R1Y3QpO1xuXHRcdH1cblx0dGhpcy5tdWx0aXBseUJ5TW9ub21pYWw9ZnVuY3Rpb24oIGRlZ3JlZSwgIGNvZWZmaWNpZW50KVxuXHRcdHtcblx0XHRcdGlmIChkZWdyZWUgPCAwKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBcIlN5c3RlbS5Bcmd1bWVudEV4Y2VwdGlvblwiO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGNvZWZmaWNpZW50ID09IDApXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB0aGlzLmZpZWxkLlplcm87XG5cdFx0XHR9XG5cdFx0XHR2YXIgc2l6ZSA9IHRoaXMuY29lZmZpY2llbnRzLmxlbmd0aDtcblx0XHRcdHZhciBwcm9kdWN0ID0gbmV3IEFycmF5KHNpemUgKyBkZWdyZWUpO1xuXHRcdFx0Zm9yKHZhciBpPTA7aTxwcm9kdWN0Lmxlbmd0aDtpKyspcHJvZHVjdFtpXT0wO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzaXplOyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdHByb2R1Y3RbaV0gPSB0aGlzLmZpZWxkLm11bHRpcGx5KHRoaXMuY29lZmZpY2llbnRzW2ldLCBjb2VmZmljaWVudCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbmV3IEdGMjU2UG9seSh0aGlzLmZpZWxkLCBwcm9kdWN0KTtcblx0XHR9XG5cdHRoaXMuZGl2aWRlPWZ1bmN0aW9uKCBvdGhlcilcblx0XHR7XG5cdFx0XHRpZiAodGhpcy5maWVsZCE9b3RoZXIuZmllbGQpXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IFwiR0YyNTZQb2x5cyBkbyBub3QgaGF2ZSBzYW1lIEdGMjU2IGZpZWxkXCI7XG5cdFx0XHR9XG5cdFx0XHRpZiAob3RoZXIuWmVybylcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgXCJEaXZpZGUgYnkgMFwiO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcXVvdGllbnQgPSB0aGlzLmZpZWxkLlplcm87XG5cdFx0XHR2YXIgcmVtYWluZGVyID0gdGhpcztcblxuXHRcdFx0dmFyIGRlbm9taW5hdG9yTGVhZGluZ1Rlcm0gPSBvdGhlci5nZXRDb2VmZmljaWVudChvdGhlci5EZWdyZWUpO1xuXHRcdFx0dmFyIGludmVyc2VEZW5vbWluYXRvckxlYWRpbmdUZXJtID0gdGhpcy5maWVsZC5pbnZlcnNlKGRlbm9taW5hdG9yTGVhZGluZ1Rlcm0pO1xuXG5cdFx0XHR3aGlsZSAocmVtYWluZGVyLkRlZ3JlZSA+PSBvdGhlci5EZWdyZWUgJiYgIXJlbWFpbmRlci5aZXJvKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgZGVncmVlRGlmZmVyZW5jZSA9IHJlbWFpbmRlci5EZWdyZWUgLSBvdGhlci5EZWdyZWU7XG5cdFx0XHRcdHZhciBzY2FsZSA9IHRoaXMuZmllbGQubXVsdGlwbHkocmVtYWluZGVyLmdldENvZWZmaWNpZW50KHJlbWFpbmRlci5EZWdyZWUpLCBpbnZlcnNlRGVub21pbmF0b3JMZWFkaW5nVGVybSk7XG5cdFx0XHRcdHZhciB0ZXJtID0gb3RoZXIubXVsdGlwbHlCeU1vbm9taWFsKGRlZ3JlZURpZmZlcmVuY2UsIHNjYWxlKTtcblx0XHRcdFx0dmFyIGl0ZXJhdGlvblF1b3RpZW50ID0gdGhpcy5maWVsZC5idWlsZE1vbm9taWFsKGRlZ3JlZURpZmZlcmVuY2UsIHNjYWxlKTtcblx0XHRcdFx0cXVvdGllbnQgPSBxdW90aWVudC5hZGRPclN1YnRyYWN0KGl0ZXJhdGlvblF1b3RpZW50KTtcblx0XHRcdFx0cmVtYWluZGVyID0gcmVtYWluZGVyLmFkZE9yU3VidHJhY3QodGVybSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBuZXcgQXJyYXkocXVvdGllbnQsIHJlbWFpbmRlcik7XG5cdFx0fVxufVxuXG4vKlxuICBQb3J0ZWQgdG8gSmF2YVNjcmlwdCBieSBMYXphciBMYXN6bG8gMjAxMVxuXG4gIGxhemFyc29mdEBnbWFpbC5jb20sIHd3dy5sYXphcnNvZnQuaW5mb1xuXG4qL1xuXG4vKlxuKlxuKiBDb3B5cmlnaHQgMjAwNyBaWGluZyBhdXRob3JzXG4qXG4qIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4qIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4qXG4qICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4qXG4qIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cblxuZnVuY3Rpb24gR0YyNTYoIHByaW1pdGl2ZSlcbntcblx0dGhpcy5leHBUYWJsZSA9IG5ldyBBcnJheSgyNTYpO1xuXHR0aGlzLmxvZ1RhYmxlID0gbmV3IEFycmF5KDI1Nik7XG5cdHZhciB4ID0gMTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7IGkrKylcblx0e1xuXHRcdHRoaXMuZXhwVGFibGVbaV0gPSB4O1xuXHRcdHggPDw9IDE7IC8vIHggPSB4ICogMjsgd2UncmUgYXNzdW1pbmcgdGhlIGdlbmVyYXRvciBhbHBoYSBpcyAyXG5cdFx0aWYgKHggPj0gMHgxMDApXG5cdFx0e1xuXHRcdFx0eCBePSBwcmltaXRpdmU7XG5cdFx0fVxuXHR9XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgMjU1OyBpKyspXG5cdHtcblx0XHR0aGlzLmxvZ1RhYmxlW3RoaXMuZXhwVGFibGVbaV1dID0gaTtcblx0fVxuXHQvLyBsb2dUYWJsZVswXSA9PSAwIGJ1dCB0aGlzIHNob3VsZCBuZXZlciBiZSB1c2VkXG5cdHZhciBhdDA9bmV3IEFycmF5KDEpO2F0MFswXT0wO1xuXHR0aGlzLnplcm8gPSBuZXcgR0YyNTZQb2x5KHRoaXMsIG5ldyBBcnJheShhdDApKTtcblx0dmFyIGF0MT1uZXcgQXJyYXkoMSk7YXQxWzBdPTE7XG5cdHRoaXMub25lID0gbmV3IEdGMjU2UG9seSh0aGlzLCBuZXcgQXJyYXkoYXQxKSk7XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJaZXJvXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy56ZXJvO1xuXHR9fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiT25lXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5vbmU7XG5cdH19KTtcblx0dGhpcy5idWlsZE1vbm9taWFsPWZ1bmN0aW9uKCBkZWdyZWUsICBjb2VmZmljaWVudClcblx0XHR7XG5cdFx0XHRpZiAoZGVncmVlIDwgMClcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgXCJTeXN0ZW0uQXJndW1lbnRFeGNlcHRpb25cIjtcblx0XHRcdH1cblx0XHRcdGlmIChjb2VmZmljaWVudCA9PSAwKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gemVybztcblx0XHRcdH1cblx0XHRcdHZhciBjb2VmZmljaWVudHMgPSBuZXcgQXJyYXkoZGVncmVlICsgMSk7XG5cdFx0XHRmb3IodmFyIGk9MDtpPGNvZWZmaWNpZW50cy5sZW5ndGg7aSsrKWNvZWZmaWNpZW50c1tpXT0wO1xuXHRcdFx0Y29lZmZpY2llbnRzWzBdID0gY29lZmZpY2llbnQ7XG5cdFx0XHRyZXR1cm4gbmV3IEdGMjU2UG9seSh0aGlzLCBjb2VmZmljaWVudHMpO1xuXHRcdH1cblx0dGhpcy5leHA9ZnVuY3Rpb24oIGEpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHRoaXMuZXhwVGFibGVbYV07XG5cdFx0fVxuXHR0aGlzLmxvZz1mdW5jdGlvbiggYSlcblx0XHR7XG5cdFx0XHRpZiAoYSA9PSAwKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBcIlN5c3RlbS5Bcmd1bWVudEV4Y2VwdGlvblwiO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRoaXMubG9nVGFibGVbYV07XG5cdFx0fVxuXHR0aGlzLmludmVyc2U9ZnVuY3Rpb24oIGEpXG5cdFx0e1xuXHRcdFx0aWYgKGEgPT0gMClcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgXCJTeXN0ZW0uQXJpdGhtZXRpY0V4Y2VwdGlvblwiO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRoaXMuZXhwVGFibGVbMjU1IC0gdGhpcy5sb2dUYWJsZVthXV07XG5cdFx0fVxuXHR0aGlzLm11bHRpcGx5PWZ1bmN0aW9uKCBhLCAgYilcblx0XHR7XG5cdFx0XHRpZiAoYSA9PSAwIHx8IGIgPT0gMClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIDA7XG5cdFx0XHR9XG5cdFx0XHRpZiAoYSA9PSAxKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gYjtcblx0XHRcdH1cblx0XHRcdGlmIChiID09IDEpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBhO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRoaXMuZXhwVGFibGVbKHRoaXMubG9nVGFibGVbYV0gKyB0aGlzLmxvZ1RhYmxlW2JdKSAlIDI1NV07XG5cdFx0fVxufVxuXG5HRjI1Ni5RUl9DT0RFX0ZJRUxEID0gbmV3IEdGMjU2KDB4MDExRCk7XG5HRjI1Ni5EQVRBX01BVFJJWF9GSUVMRCA9IG5ldyBHRjI1NigweDAxMkQpO1xuXG5HRjI1Ni5hZGRPclN1YnRyYWN0PWZ1bmN0aW9uKCBhLCAgYilcbntcblx0cmV0dXJuIGEgXiBiO1xufVxuXG4vKlxuICBQb3J0ZWQgdG8gSmF2YVNjcmlwdCBieSBMYXphciBMYXN6bG8gMjAxMVxuXG4gIGxhemFyc29mdEBnbWFpbC5jb20sIHd3dy5sYXphcnNvZnQuaW5mb1xuXG4qL1xuXG4vKlxuKlxuKiBDb3B5cmlnaHQgMjAwNyBaWGluZyBhdXRob3JzXG4qXG4qIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4qIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4qXG4qICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4qXG4qIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cblxudmFyIERlY29kZXI9e307XG5EZWNvZGVyLnJzRGVjb2RlciA9IG5ldyBSZWVkU29sb21vbkRlY29kZXIoR0YyNTYuUVJfQ09ERV9GSUVMRCk7XG5cbkRlY29kZXIuY29ycmVjdEVycm9ycz1mdW5jdGlvbiggY29kZXdvcmRCeXRlcywgIG51bURhdGFDb2Rld29yZHMpXG57XG5cdHZhciBudW1Db2Rld29yZHMgPSBjb2Rld29yZEJ5dGVzLmxlbmd0aDtcblx0Ly8gRmlyc3QgcmVhZCBpbnRvIGFuIGFycmF5IG9mIGludHNcblx0dmFyIGNvZGV3b3Jkc0ludHMgPSBuZXcgQXJyYXkobnVtQ29kZXdvcmRzKTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBudW1Db2Rld29yZHM7IGkrKylcblx0e1xuXHRcdGNvZGV3b3Jkc0ludHNbaV0gPSBjb2Rld29yZEJ5dGVzW2ldICYgMHhGRjtcblx0fVxuXHR2YXIgbnVtRUNDb2Rld29yZHMgPSBjb2Rld29yZEJ5dGVzLmxlbmd0aCAtIG51bURhdGFDb2Rld29yZHM7XG5cdHRyeVxuXHR7XG5cdFx0RGVjb2Rlci5yc0RlY29kZXIuZGVjb2RlKGNvZGV3b3Jkc0ludHMsIG51bUVDQ29kZXdvcmRzKTtcblx0XHQvL3ZhciBjb3JyZWN0b3IgPSBuZXcgUmVlZFNvbG9tb24oY29kZXdvcmRzSW50cywgbnVtRUNDb2Rld29yZHMpO1xuXHRcdC8vY29ycmVjdG9yLmNvcnJlY3QoKTtcblx0fVxuXHRjYXRjaCAoIHJzZSlcblx0e1xuXHRcdHRocm93IHJzZTtcblx0fVxuXHQvLyBDb3B5IGJhY2sgaW50byBhcnJheSBvZiBieXRlcyAtLSBvbmx5IG5lZWQgdG8gd29ycnkgYWJvdXQgdGhlIGJ5dGVzIHRoYXQgd2VyZSBkYXRhXG5cdC8vIFdlIGRvbid0IGNhcmUgYWJvdXQgZXJyb3JzIGluIHRoZSBlcnJvci1jb3JyZWN0aW9uIGNvZGV3b3Jkc1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IG51bURhdGFDb2Rld29yZHM7IGkrKylcblx0e1xuXHRcdGNvZGV3b3JkQnl0ZXNbaV0gPSAgY29kZXdvcmRzSW50c1tpXTtcblx0fVxufVxuXG5EZWNvZGVyLmRlY29kZT1mdW5jdGlvbihiaXRzKVxue1xuXHR2YXIgcGFyc2VyID0gbmV3IEJpdE1hdHJpeFBhcnNlcihiaXRzKTtcblx0dmFyIHZlcnNpb24gPSBwYXJzZXIucmVhZFZlcnNpb24oKTtcblx0dmFyIGVjTGV2ZWwgPSBwYXJzZXIucmVhZEZvcm1hdEluZm9ybWF0aW9uKCkuRXJyb3JDb3JyZWN0aW9uTGV2ZWw7XG5cblx0Ly8gUmVhZCBjb2Rld29yZHNcblx0dmFyIGNvZGV3b3JkcyA9IHBhcnNlci5yZWFkQ29kZXdvcmRzKCk7XG5cblx0Ly8gU2VwYXJhdGUgaW50byBkYXRhIGJsb2Nrc1xuXHR2YXIgZGF0YUJsb2NrcyA9IERhdGFCbG9jay5nZXREYXRhQmxvY2tzKGNvZGV3b3JkcywgdmVyc2lvbiwgZWNMZXZlbCk7XG5cblx0Ly8gQ291bnQgdG90YWwgbnVtYmVyIG9mIGRhdGEgYnl0ZXNcblx0dmFyIHRvdGFsQnl0ZXMgPSAwO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGRhdGFCbG9ja3MubGVuZ3RoOyBpKyspXG5cdHtcblx0XHR0b3RhbEJ5dGVzICs9IGRhdGFCbG9ja3NbaV0uTnVtRGF0YUNvZGV3b3Jkcztcblx0fVxuXHR2YXIgcmVzdWx0Qnl0ZXMgPSBuZXcgQXJyYXkodG90YWxCeXRlcyk7XG5cdHZhciByZXN1bHRPZmZzZXQgPSAwO1xuXG5cdC8vIEVycm9yLWNvcnJlY3QgYW5kIGNvcHkgZGF0YSBibG9ja3MgdG9nZXRoZXIgaW50byBhIHN0cmVhbSBvZiBieXRlc1xuXHRmb3IgKHZhciBqID0gMDsgaiA8IGRhdGFCbG9ja3MubGVuZ3RoOyBqKyspXG5cdHtcblx0XHR2YXIgZGF0YUJsb2NrID0gZGF0YUJsb2Nrc1tqXTtcblx0XHR2YXIgY29kZXdvcmRCeXRlcyA9IGRhdGFCbG9jay5Db2Rld29yZHM7XG5cdFx0dmFyIG51bURhdGFDb2Rld29yZHMgPSBkYXRhQmxvY2suTnVtRGF0YUNvZGV3b3Jkcztcblx0XHREZWNvZGVyLmNvcnJlY3RFcnJvcnMoY29kZXdvcmRCeXRlcywgbnVtRGF0YUNvZGV3b3Jkcyk7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBudW1EYXRhQ29kZXdvcmRzOyBpKyspXG5cdFx0e1xuXHRcdFx0cmVzdWx0Qnl0ZXNbcmVzdWx0T2Zmc2V0KytdID0gY29kZXdvcmRCeXRlc1tpXTtcblx0XHR9XG5cdH1cblxuXHQvLyBEZWNvZGUgdGhlIGNvbnRlbnRzIG9mIHRoYXQgc3RyZWFtIG9mIGJ5dGVzXG5cdHZhciByZWFkZXIgPSBuZXcgUVJDb2RlRGF0YUJsb2NrUmVhZGVyKHJlc3VsdEJ5dGVzLCB2ZXJzaW9uLlZlcnNpb25OdW1iZXIsIGVjTGV2ZWwuQml0cyk7XG5cdHJldHVybiByZWFkZXI7XG5cdC8vcmV0dXJuIERlY29kZWRCaXRTdHJlYW1QYXJzZXIuZGVjb2RlKHJlc3VsdEJ5dGVzLCB2ZXJzaW9uLCBlY0xldmVsKTtcbn1cblxuLypcbiAgIENvcHlyaWdodCAyMDExIExhemFyIExhc3psbyAobGF6YXJzb2Z0QGdtYWlsLmNvbSwgd3d3LmxhemFyc29mdC5pbmZvKVxuXG4gICBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICAgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuICAgVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICAgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICAgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gICBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gICBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbnZhciBxcmNvZGUgPSB7fTtcbnFyY29kZS5zaXplT2ZEYXRhTGVuZ3RoSW5mbyA9ICBbICBbIDEwLCA5LCA4LCA4IF0sICBbIDEyLCAxMSwgMTYsIDEwIF0sICBbIDE0LCAxMywgMTYsIDEyIF0gXTtcblxuUXJDb2RlID0gZnVuY3Rpb24gKCkge1xuXG50aGlzLmltYWdlZGF0YSA9IG51bGw7XG50aGlzLndpZHRoID0gMDtcbnRoaXMuaGVpZ2h0ID0gMDtcbnRoaXMucXJDb2RlU3ltYm9sID0gbnVsbDtcbnRoaXMuZGVidWcgPSBmYWxzZTtcblxudGhpcy5jYWxsYmFjayA9IG51bGw7XG5cbnRoaXMuZGVjb2RlID0gZnVuY3Rpb24oc3JjLCBkYXRhKXtcblxuICAgIHZhciBkZWNvZGUgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdHJ5IHtcblx0XHRcdHRoaXMucmVzdWx0ID0gdGhpcy5wcm9jZXNzKHRoaXMuaW1hZ2VkYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5yZXN1bHQgPSBcImVycm9yIGRlY29kaW5nIFFSIENvZGU6IFwiICsgZTtcbiAgICAgICAgfVxuXG5cdFx0aWYgKHRoaXMuY2FsbGJhY2shPW51bGwpIHtcblxuICAgICAgICAgICAgdGhpcy5jYWxsYmFjayh0aGlzLnJlc3VsdCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0O1xuXG4gICAgfSkuYmluZCh0aGlzKTtcblxuICAgIC8qIGRlY29kZSBmcm9tIGNhbnZhcyAjcXItY2FudmFzICovXG5cdGlmIChzcmMgPT0gdW5kZWZpbmVkKSB7XG5cblx0XHR2YXIgY2FudmFzX3FyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJxci1jYW52YXNcIik7XG5cdFx0dmFyIGNvbnRleHQgPSBjYW52YXNfcXIuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHQgICAgdGhpcy53aWR0aCA9IGNhbnZhc19xci53aWR0aDtcblx0XHR0aGlzLmhlaWdodCA9IGNhbnZhc19xci5oZWlnaHQ7XG5cdFx0dGhpcy5pbWFnZWRhdGEgPSBjb250ZXh0LmdldEltYWdlRGF0YSgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG5cbiAgICAgICAgZGVjb2RlKCk7XG5cdH1cblxuXHQvKiBkZWNvZGUgZnJvbSBjYW52YXMgY2FudmFzLmNvbnRleHQuZ2V0SW1hZ2VEYXRhICovXG4gICAgZWxzZSBpZiAoc3JjLndpZHRoICE9IHVuZGVmaW5lZCkge1xuXG5cdFx0dGhpcy53aWR0aD1zcmMud2lkdGhcblx0XHR0aGlzLmhlaWdodD1zcmMuaGVpZ2h0XG5cdFx0dGhpcy5pbWFnZWRhdGE9eyBcImRhdGFcIjogZGF0YSB8fCBzcmMuZGF0YSB9XG5cdFx0dGhpcy5pbWFnZWRhdGEud2lkdGg9c3JjLndpZHRoXG5cdFx0dGhpcy5pbWFnZWRhdGEuaGVpZ2h0PXNyYy5oZWlnaHRcblxuICAgICAgICBkZWNvZGUoKTtcblx0fVxuXG4gICAgLyogZGVjb2RlIGZyb20gVVJMICovXG5cdGVsc2Uge1xuXG5cdFx0dmFyIGltYWdlID0gbmV3IEltYWdlKCk7XG5cdFx0dmFyIF90aGlzID0gdGhpc1xuXG4gICAgICAgIGltYWdlLm9ubG9hZCA9IChmdW5jdGlvbigpIHtcblxuXHRcdFx0dmFyIGNhbnZhc19xciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuXHRcdFx0dmFyIGNvbnRleHQgPSBjYW52YXNfcXIuZ2V0Q29udGV4dCgnMmQnKTtcblx0XHRcdHZhciBjYW52YXNfb3V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvdXQtY2FudmFzXCIpO1xuXG5cdFx0XHRpZiAoY2FudmFzX291dCAhPSBudWxsKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgb3V0Y3R4ID0gY2FudmFzX291dC5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICAgICAgICAgIG91dGN0eC5jbGVhclJlY3QoMCwgMCwgMzIwLCAyNDApO1xuXHRcdFx0XHRvdXRjdHguZHJhd0ltYWdlKGltYWdlLCAwLCAwLCAzMjAsIDI0MCk7XG4gICAgICAgICAgICB9XG5cblx0XHRcdGNhbnZhc19xci53aWR0aCA9IGltYWdlLndpZHRoO1xuXHRcdFx0Y2FudmFzX3FyLmhlaWdodCA9IGltYWdlLmhlaWdodDtcbiAgICAgICAgICAgIGNvbnRleHQuZHJhd0ltYWdlKGltYWdlLCAwLCAwKTtcblx0XHRcdHRoaXMud2lkdGggPSBpbWFnZS53aWR0aDtcblx0XHRcdHRoaXMuaGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0O1xuXG5cdFx0XHR0cnl7XG5cdFx0XHRcdHRoaXMuaW1hZ2VkYXRhID0gY29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgaW1hZ2Uud2lkdGgsIGltYWdlLmhlaWdodCk7XG5cdFx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdFx0dGhpcy5yZXN1bHQgPSBcIkNyb3NzIGRvbWFpbiBpbWFnZSByZWFkaW5nIG5vdCBzdXBwb3J0ZWQgaW4geW91ciBicm93c2VyISBTYXZlIGl0IHRvIHlvdXIgY29tcHV0ZXIgdGhlbiBkcmFnIGFuZCBkcm9wIHRoZSBmaWxlIVwiO1xuXHRcdFx0XHRpZiAodGhpcy5jYWxsYmFjayE9bnVsbCkgcmV0dXJuIHRoaXMuY2FsbGJhY2sodGhpcy5yZXN1bHQpO1xuXHRcdFx0fVxuXG4gICAgICAgICAgICBkZWNvZGUoKTtcblxuXHRcdH0pLmJpbmQodGhpcyk7XG5cblx0XHRpbWFnZS5zcmMgPSBzcmM7XG5cdH1cbn07XG5cbnRoaXMuZGVjb2RlX3V0ZjggPSBmdW5jdGlvbiAoIHMgKSB7XG5cbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KCBlc2NhcGUoIHMgKSApO1xufVxuXG50aGlzLnByb2Nlc3MgPSBmdW5jdGlvbihpbWFnZURhdGEpIHtcblxuXHR2YXIgc3RhcnQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuXHR2YXIgaW1hZ2UgPSB0aGlzLmdyYXlTY2FsZVRvQml0bWFwKHRoaXMuZ3JheXNjYWxlKGltYWdlRGF0YSkpO1xuXG5cdC8vdmFyIGZpbmRlclBhdHRlcm5JbmZvID0gbmV3IEZpbmRlclBhdHRlcm5GaW5kZXIoKS5maW5kRmluZGVyUGF0dGVybihpbWFnZSk7XG5cblx0dmFyIGRldGVjdG9yID0gbmV3IERldGVjdG9yKGltYWdlKTtcblxuXHR2YXIgcVJDb2RlTWF0cml4ID0gZGV0ZWN0b3IuZGV0ZWN0KCk7XG5cblx0Lypmb3IgKHZhciB5ID0gMDsgeSA8IHFSQ29kZU1hdHJpeC5iaXRzLkhlaWdodDsgeSsrKVxuXHR7XG5cdFx0Zm9yICh2YXIgeCA9IDA7IHggPCBxUkNvZGVNYXRyaXguYml0cy5XaWR0aDsgeCsrKVxuXHRcdHtcblx0XHRcdHZhciBwb2ludCA9ICh4ICogNCoyKSArICh5KjIgKiBpbWFnZURhdGEud2lkdGggKiA0KTtcblx0XHRcdGltYWdlRGF0YS5kYXRhW3BvaW50XSA9IHFSQ29kZU1hdHJpeC5iaXRzLmdldF9SZW5hbWVkKHgseSk/MDowO1xuXHRcdFx0aW1hZ2VEYXRhLmRhdGFbcG9pbnQrMV0gPSBxUkNvZGVNYXRyaXguYml0cy5nZXRfUmVuYW1lZCh4LHkpPzA6MDtcblx0XHRcdGltYWdlRGF0YS5kYXRhW3BvaW50KzJdID0gcVJDb2RlTWF0cml4LmJpdHMuZ2V0X1JlbmFtZWQoeCx5KT8yNTU6MDtcblx0XHR9XG5cdH0qL1xuXG5cdHZhciByZWFkZXIgPSBEZWNvZGVyLmRlY29kZShxUkNvZGVNYXRyaXguYml0cyk7XG5cdHZhciBkYXRhID0gcmVhZGVyLkRhdGFCeXRlO1xuXHR2YXIgc3RyPVwiXCI7XG5cdGZvcih2YXIgaT0wO2k8ZGF0YS5sZW5ndGg7aSsrKVxuXHR7XG5cdFx0Zm9yKHZhciBqPTA7ajxkYXRhW2ldLmxlbmd0aDtqKyspXG5cdFx0XHRzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoZGF0YVtpXVtqXSk7XG5cdH1cblxuXHR2YXIgZW5kID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdHZhciB0aW1lID0gZW5kIC0gc3RhcnQ7XG5cdGlmICh0aGlzLmRlYnVnKSB7XG5cdFx0Y29uc29sZS5sb2coJ1FSIENvZGUgcHJvY2Vzc2luZyB0aW1lIChtcyk6ICcgKyB0aW1lKTtcblx0fVxuXG5cdHJldHVybiB0aGlzLmRlY29kZV91dGY4KHN0cik7XG5cdC8vYWxlcnQoXCJUaW1lOlwiICsgdGltZSArIFwiIENvZGU6IFwiK3N0cik7XG59XG5cbnRoaXMuZ2V0UGl4ZWwgPSBmdW5jdGlvbihpbWFnZURhdGEsIHgseSl7XG5cdGlmIChpbWFnZURhdGEud2lkdGggPCB4KSB7XG5cdFx0dGhyb3cgXCJwb2ludCBlcnJvclwiO1xuXHR9XG5cdGlmIChpbWFnZURhdGEuaGVpZ2h0IDwgeSkge1xuXHRcdHRocm93IFwicG9pbnQgZXJyb3JcIjtcblx0fVxuXHRwb2ludCA9ICh4ICogNCkgKyAoeSAqIGltYWdlRGF0YS53aWR0aCAqIDQpO1xuXHRwID0gKGltYWdlRGF0YS5kYXRhW3BvaW50XSozMyArIGltYWdlRGF0YS5kYXRhW3BvaW50ICsgMV0qMzQgKyBpbWFnZURhdGEuZGF0YVtwb2ludCArIDJdKjMzKS8xMDA7XG5cdHJldHVybiBwO1xufVxuXG50aGlzLmJpbmFyaXplID0gZnVuY3Rpb24odGgpe1xuXHR2YXIgcmV0ID0gbmV3IEFycmF5KHRoaXMud2lkdGgqdGhpcy5oZWlnaHQpO1xuXHRmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspXG5cdHtcblx0XHRmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKylcblx0XHR7XG5cdFx0XHR2YXIgZ3JheSA9IHRoaXMuZ2V0UGl4ZWwoeCwgeSk7XG5cblx0XHRcdHJldFt4K3kqdGhpcy53aWR0aF0gPSBncmF5PD10aD90cnVlOmZhbHNlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmV0O1xufVxuXG50aGlzLmdldE1pZGRsZUJyaWdodG5lc3NQZXJBcmVhPWZ1bmN0aW9uKGltYWdlRGF0YSlcbntcblx0dmFyIG51bVNxcnRBcmVhID0gNDtcblx0Ly9vYnRhaW4gbWlkZGxlIGJyaWdodG5lc3MoKG1pbiArIG1heCkgLyAyKSBwZXIgYXJlYVxuXHR2YXIgYXJlYVdpZHRoID0gTWF0aC5mbG9vcihpbWFnZURhdGEud2lkdGggLyBudW1TcXJ0QXJlYSk7XG5cdHZhciBhcmVhSGVpZ2h0ID0gTWF0aC5mbG9vcihpbWFnZURhdGEuaGVpZ2h0IC8gbnVtU3FydEFyZWEpO1xuXHR2YXIgbWlubWF4ID0gbmV3IEFycmF5KG51bVNxcnRBcmVhKTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBudW1TcXJ0QXJlYTsgaSsrKVxuXHR7XG5cdFx0bWlubWF4W2ldID0gbmV3IEFycmF5KG51bVNxcnRBcmVhKTtcblx0XHRmb3IgKHZhciBpMiA9IDA7IGkyIDwgbnVtU3FydEFyZWE7IGkyKyspXG5cdFx0e1xuXHRcdFx0bWlubWF4W2ldW2kyXSA9IG5ldyBBcnJheSgwLDApO1xuXHRcdH1cblx0fVxuXHRmb3IgKHZhciBheSA9IDA7IGF5IDwgbnVtU3FydEFyZWE7IGF5KyspXG5cdHtcblx0XHRmb3IgKHZhciBheCA9IDA7IGF4IDwgbnVtU3FydEFyZWE7IGF4KyspXG5cdFx0e1xuXHRcdFx0bWlubWF4W2F4XVtheV1bMF0gPSAweEZGO1xuXHRcdFx0Zm9yICh2YXIgZHkgPSAwOyBkeSA8IGFyZWFIZWlnaHQ7IGR5KyspXG5cdFx0XHR7XG5cdFx0XHRcdGZvciAodmFyIGR4ID0gMDsgZHggPCBhcmVhV2lkdGg7IGR4KyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2YXIgdGFyZ2V0ID0gaW1hZ2VEYXRhLmRhdGFbYXJlYVdpZHRoICogYXggKyBkeCsoYXJlYUhlaWdodCAqIGF5ICsgZHkpKmltYWdlRGF0YS53aWR0aF07XG5cdFx0XHRcdFx0aWYgKHRhcmdldCA8IG1pbm1heFtheF1bYXldWzBdKVxuXHRcdFx0XHRcdFx0bWlubWF4W2F4XVtheV1bMF0gPSB0YXJnZXQ7XG5cdFx0XHRcdFx0aWYgKHRhcmdldCA+IG1pbm1heFtheF1bYXldWzFdKVxuXHRcdFx0XHRcdFx0bWlubWF4W2F4XVtheV1bMV0gPSB0YXJnZXQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vbWlubWF4W2F4XVtheV1bMF0gPSAobWlubWF4W2F4XVtheV1bMF0gKyBtaW5tYXhbYXhdW2F5XVsxXSkgLyAyO1xuXHRcdH1cblx0fVxuXHR2YXIgbWlkZGxlID0gbmV3IEFycmF5KG51bVNxcnRBcmVhKTtcblx0Zm9yICh2YXIgaTMgPSAwOyBpMyA8IG51bVNxcnRBcmVhOyBpMysrKVxuXHR7XG5cdFx0bWlkZGxlW2kzXSA9IG5ldyBBcnJheShudW1TcXJ0QXJlYSk7XG5cdH1cblx0Zm9yICh2YXIgYXkgPSAwOyBheSA8IG51bVNxcnRBcmVhOyBheSsrKVxuXHR7XG5cdFx0Zm9yICh2YXIgYXggPSAwOyBheCA8IG51bVNxcnRBcmVhOyBheCsrKVxuXHRcdHtcblx0XHRcdG1pZGRsZVtheF1bYXldID0gTWF0aC5mbG9vcigobWlubWF4W2F4XVtheV1bMF0gKyBtaW5tYXhbYXhdW2F5XVsxXSkgLyAyKTtcblx0XHRcdC8vQ29uc29sZS5vdXQucHJpbnQobWlkZGxlW2F4XVtheV0gKyBcIixcIik7XG5cdFx0fVxuXHRcdC8vQ29uc29sZS5vdXQucHJpbnRsbihcIlwiKTtcblx0fVxuXHQvL0NvbnNvbGUub3V0LnByaW50bG4oXCJcIik7XG5cblx0cmV0dXJuIG1pZGRsZTtcbn1cblxudGhpcy5ncmF5U2NhbGVUb0JpdG1hcD1mdW5jdGlvbihncmF5U2NhbGVJbWFnZURhdGEpXG57XG5cdHZhciBtaWRkbGUgPSB0aGlzLmdldE1pZGRsZUJyaWdodG5lc3NQZXJBcmVhKGdyYXlTY2FsZUltYWdlRGF0YSk7XG5cdHZhciBzcXJ0TnVtQXJlYSA9IG1pZGRsZS5sZW5ndGg7XG5cdHZhciBhcmVhV2lkdGggPSBNYXRoLmZsb29yKGdyYXlTY2FsZUltYWdlRGF0YS53aWR0aCAvIHNxcnROdW1BcmVhKTtcblx0dmFyIGFyZWFIZWlnaHQgPSBNYXRoLmZsb29yKGdyYXlTY2FsZUltYWdlRGF0YS5oZWlnaHQgLyBzcXJ0TnVtQXJlYSk7XG5cblx0Zm9yICh2YXIgYXkgPSAwOyBheSA8IHNxcnROdW1BcmVhOyBheSsrKVxuXHR7XG5cdFx0Zm9yICh2YXIgYXggPSAwOyBheCA8IHNxcnROdW1BcmVhOyBheCsrKVxuXHRcdHtcblx0XHRcdGZvciAodmFyIGR5ID0gMDsgZHkgPCBhcmVhSGVpZ2h0OyBkeSsrKVxuXHRcdFx0e1xuXHRcdFx0XHRmb3IgKHZhciBkeCA9IDA7IGR4IDwgYXJlYVdpZHRoOyBkeCsrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Z3JheVNjYWxlSW1hZ2VEYXRhLmRhdGFbYXJlYVdpZHRoICogYXggKyBkeCsgKGFyZWFIZWlnaHQgKiBheSArIGR5KSpncmF5U2NhbGVJbWFnZURhdGEud2lkdGhdID0gKGdyYXlTY2FsZUltYWdlRGF0YS5kYXRhW2FyZWFXaWR0aCAqIGF4ICsgZHgrIChhcmVhSGVpZ2h0ICogYXkgKyBkeSkqZ3JheVNjYWxlSW1hZ2VEYXRhLndpZHRoXSA8IG1pZGRsZVtheF1bYXldKT90cnVlOmZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBncmF5U2NhbGVJbWFnZURhdGE7XG59XG5cbnRoaXMuZ3JheXNjYWxlID0gZnVuY3Rpb24oaW1hZ2VEYXRhKXtcblx0dmFyIHJldCA9IG5ldyBBcnJheShpbWFnZURhdGEud2lkdGgqaW1hZ2VEYXRhLmhlaWdodCk7XG5cblx0Zm9yICh2YXIgeSA9IDA7IHkgPCBpbWFnZURhdGEuaGVpZ2h0OyB5KyspXG5cdHtcblx0XHRmb3IgKHZhciB4ID0gMDsgeCA8IGltYWdlRGF0YS53aWR0aDsgeCsrKVxuXHRcdHtcblx0XHRcdHZhciBncmF5ID0gdGhpcy5nZXRQaXhlbChpbWFnZURhdGEsIHgsIHkpO1xuXG5cdFx0XHRyZXRbeCt5KmltYWdlRGF0YS53aWR0aF0gPSBncmF5O1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB7XG5cdFx0aGVpZ2h0OiBpbWFnZURhdGEuaGVpZ2h0LFxuXHRcdHdpZHRoOiBpbWFnZURhdGEud2lkdGgsXG5cdFx0ZGF0YTogcmV0XG5cdH07XG59XG5cbiAgfVxuXG5mdW5jdGlvbiBVUlNoaWZ0KCBudW1iZXIsICBiaXRzKVxue1xuXHRpZiAobnVtYmVyID49IDApXG5cdFx0cmV0dXJuIG51bWJlciA+PiBiaXRzO1xuXHRlbHNlXG5cdFx0cmV0dXJuIChudW1iZXIgPj4gYml0cykgKyAoMiA8PCB+Yml0cyk7XG59XG5cbi8qXG4gIFBvcnRlZCB0byBKYXZhU2NyaXB0IGJ5IExhemFyIExhc3psbyAyMDExXG5cbiAgbGF6YXJzb2Z0QGdtYWlsLmNvbSwgd3d3LmxhemFyc29mdC5pbmZvXG5cbiovXG5cbi8qXG4qXG4qIENvcHlyaWdodCAyMDA3IFpYaW5nIGF1dGhvcnNcbipcbiogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbipcbiogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbipcbiogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4qIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4qIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuXG52YXIgTUlOX1NLSVAgPSAzO1xudmFyIE1BWF9NT0RVTEVTID0gNTc7XG52YXIgSU5URUdFUl9NQVRIX1NISUZUID0gODtcbnZhciBDRU5URVJfUVVPUlVNID0gMjtcblxucXJjb2RlLm9yZGVyQmVzdFBhdHRlcm5zPWZ1bmN0aW9uKHBhdHRlcm5zKVxuXHRcdHtcblxuXHRcdFx0ZnVuY3Rpb24gZGlzdGFuY2UoIHBhdHRlcm4xLCAgcGF0dGVybjIpXG5cdFx0XHR7XG5cdFx0XHRcdHhEaWZmID0gcGF0dGVybjEuWCAtIHBhdHRlcm4yLlg7XG5cdFx0XHRcdHlEaWZmID0gcGF0dGVybjEuWSAtIHBhdHRlcm4yLlk7XG5cdFx0XHRcdHJldHVybiAgTWF0aC5zcXJ0KCAoeERpZmYgKiB4RGlmZiArIHlEaWZmICogeURpZmYpKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8vIDxzdW1tYXJ5PiBSZXR1cm5zIHRoZSB6IGNvbXBvbmVudCBvZiB0aGUgY3Jvc3MgcHJvZHVjdCBiZXR3ZWVuIHZlY3RvcnMgQkMgYW5kIEJBLjwvc3VtbWFyeT5cblx0XHRcdGZ1bmN0aW9uIGNyb3NzUHJvZHVjdFooIHBvaW50QSwgIHBvaW50QiwgIHBvaW50Qylcblx0XHRcdHtcblx0XHRcdFx0dmFyIGJYID0gcG9pbnRCLng7XG5cdFx0XHRcdHZhciBiWSA9IHBvaW50Qi55O1xuXHRcdFx0XHRyZXR1cm4gKChwb2ludEMueCAtIGJYKSAqIChwb2ludEEueSAtIGJZKSkgLSAoKHBvaW50Qy55IC0gYlkpICogKHBvaW50QS54IC0gYlgpKTtcblx0XHRcdH1cblxuXG5cdFx0XHQvLyBGaW5kIGRpc3RhbmNlcyBiZXR3ZWVuIHBhdHRlcm4gY2VudGVyc1xuXHRcdFx0dmFyIHplcm9PbmVEaXN0YW5jZSA9IGRpc3RhbmNlKHBhdHRlcm5zWzBdLCBwYXR0ZXJuc1sxXSk7XG5cdFx0XHR2YXIgb25lVHdvRGlzdGFuY2UgPSBkaXN0YW5jZShwYXR0ZXJuc1sxXSwgcGF0dGVybnNbMl0pO1xuXHRcdFx0dmFyIHplcm9Ud29EaXN0YW5jZSA9IGRpc3RhbmNlKHBhdHRlcm5zWzBdLCBwYXR0ZXJuc1syXSk7XG5cblx0XHRcdHZhciBwb2ludEEsIHBvaW50QiwgcG9pbnRDO1xuXHRcdFx0Ly8gQXNzdW1lIG9uZSBjbG9zZXN0IHRvIG90aGVyIHR3byBpcyBCOyBBIGFuZCBDIHdpbGwganVzdCBiZSBndWVzc2VzIGF0IGZpcnN0XG5cdFx0XHRpZiAob25lVHdvRGlzdGFuY2UgPj0gemVyb09uZURpc3RhbmNlICYmIG9uZVR3b0Rpc3RhbmNlID49IHplcm9Ud29EaXN0YW5jZSlcblx0XHRcdHtcblx0XHRcdFx0cG9pbnRCID0gcGF0dGVybnNbMF07XG5cdFx0XHRcdHBvaW50QSA9IHBhdHRlcm5zWzFdO1xuXHRcdFx0XHRwb2ludEMgPSBwYXR0ZXJuc1syXTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHplcm9Ud29EaXN0YW5jZSA+PSBvbmVUd29EaXN0YW5jZSAmJiB6ZXJvVHdvRGlzdGFuY2UgPj0gemVyb09uZURpc3RhbmNlKVxuXHRcdFx0e1xuXHRcdFx0XHRwb2ludEIgPSBwYXR0ZXJuc1sxXTtcblx0XHRcdFx0cG9pbnRBID0gcGF0dGVybnNbMF07XG5cdFx0XHRcdHBvaW50QyA9IHBhdHRlcm5zWzJdO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRwb2ludEIgPSBwYXR0ZXJuc1syXTtcblx0XHRcdFx0cG9pbnRBID0gcGF0dGVybnNbMF07XG5cdFx0XHRcdHBvaW50QyA9IHBhdHRlcm5zWzFdO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBVc2UgY3Jvc3MgcHJvZHVjdCB0byBmaWd1cmUgb3V0IHdoZXRoZXIgQSBhbmQgQyBhcmUgY29ycmVjdCBvciBmbGlwcGVkLlxuXHRcdFx0Ly8gVGhpcyBhc2tzIHdoZXRoZXIgQkMgeCBCQSBoYXMgYSBwb3NpdGl2ZSB6IGNvbXBvbmVudCwgd2hpY2ggaXMgdGhlIGFycmFuZ2VtZW50XG5cdFx0XHQvLyB3ZSB3YW50IGZvciBBLCBCLCBDLiBJZiBpdCdzIG5lZ2F0aXZlLCB0aGVuIHdlJ3ZlIGdvdCBpdCBmbGlwcGVkIGFyb3VuZCBhbmRcblx0XHRcdC8vIHNob3VsZCBzd2FwIEEgYW5kIEMuXG5cdFx0XHRpZiAoY3Jvc3NQcm9kdWN0Wihwb2ludEEsIHBvaW50QiwgcG9pbnRDKSA8IDAuMClcblx0XHRcdHtcblx0XHRcdFx0dmFyIHRlbXAgPSBwb2ludEE7XG5cdFx0XHRcdHBvaW50QSA9IHBvaW50Qztcblx0XHRcdFx0cG9pbnRDID0gdGVtcDtcblx0XHRcdH1cblxuXHRcdFx0cGF0dGVybnNbMF0gPSBwb2ludEE7XG5cdFx0XHRwYXR0ZXJuc1sxXSA9IHBvaW50Qjtcblx0XHRcdHBhdHRlcm5zWzJdID0gcG9pbnRDO1xuXHRcdH1cblxuXG5mdW5jdGlvbiBGaW5kZXJQYXR0ZXJuKHBvc1gsIHBvc1ksICBlc3RpbWF0ZWRNb2R1bGVTaXplKVxue1xuXHR0aGlzLng9cG9zWDtcblx0dGhpcy55PXBvc1k7XG5cdHRoaXMuY291bnQgPSAxO1xuXHR0aGlzLmVzdGltYXRlZE1vZHVsZVNpemUgPSBlc3RpbWF0ZWRNb2R1bGVTaXplO1xuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiRXN0aW1hdGVkTW9kdWxlU2l6ZVwiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuZXN0aW1hdGVkTW9kdWxlU2l6ZTtcblx0fX0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIkNvdW50XCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5jb3VudDtcblx0fX0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIlhcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiB0aGlzLng7XG5cdH19KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJZXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy55O1xuXHR9fSk7XG5cdHRoaXMuaW5jcmVtZW50Q291bnQgPSBmdW5jdGlvbigpXG5cdHtcblx0XHR0aGlzLmNvdW50Kys7XG5cdH1cblx0dGhpcy5hYm91dEVxdWFscz1mdW5jdGlvbiggbW9kdWxlU2l6ZSwgIGksICBqKVxuXHRcdHtcblx0XHRcdGlmIChNYXRoLmFicyhpIC0gdGhpcy55KSA8PSBtb2R1bGVTaXplICYmIE1hdGguYWJzKGogLSB0aGlzLngpIDw9IG1vZHVsZVNpemUpXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBtb2R1bGVTaXplRGlmZiA9IE1hdGguYWJzKG1vZHVsZVNpemUgLSB0aGlzLmVzdGltYXRlZE1vZHVsZVNpemUpO1xuXHRcdFx0XHRyZXR1cm4gbW9kdWxlU2l6ZURpZmYgPD0gMS4wIHx8IG1vZHVsZVNpemVEaWZmIC8gdGhpcy5lc3RpbWF0ZWRNb2R1bGVTaXplIDw9IDEuMDtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cbn1cblxuZnVuY3Rpb24gRmluZGVyUGF0dGVybkluZm8ocGF0dGVybkNlbnRlcnMpXG57XG5cdHRoaXMuYm90dG9tTGVmdCA9IHBhdHRlcm5DZW50ZXJzWzBdO1xuXHR0aGlzLnRvcExlZnQgPSBwYXR0ZXJuQ2VudGVyc1sxXTtcblx0dGhpcy50b3BSaWdodCA9IHBhdHRlcm5DZW50ZXJzWzJdO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIkJvdHRvbUxlZnRcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiB0aGlzLmJvdHRvbUxlZnQ7XG5cdH19KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJUb3BMZWZ0XCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy50b3BMZWZ0O1xuXHR9fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiVG9wUmlnaHRcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiB0aGlzLnRvcFJpZ2h0O1xuXHR9fSk7XG59XG5cbmZ1bmN0aW9uIEZpbmRlclBhdHRlcm5GaW5kZXIoKVxue1xuXHR0aGlzLmltYWdlPW51bGw7XG5cdHRoaXMucG9zc2libGVDZW50ZXJzID0gW107XG5cdHRoaXMuaGFzU2tpcHBlZCA9IGZhbHNlO1xuXHR0aGlzLmNyb3NzQ2hlY2tTdGF0ZUNvdW50ID0gbmV3IEFycmF5KDAsMCwwLDAsMCk7XG5cdHRoaXMucmVzdWx0UG9pbnRDYWxsYmFjayA9IG51bGw7XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJDcm9zc0NoZWNrU3RhdGVDb3VudFwiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0dGhpcy5jcm9zc0NoZWNrU3RhdGVDb3VudFswXSA9IDA7XG5cdFx0dGhpcy5jcm9zc0NoZWNrU3RhdGVDb3VudFsxXSA9IDA7XG5cdFx0dGhpcy5jcm9zc0NoZWNrU3RhdGVDb3VudFsyXSA9IDA7XG5cdFx0dGhpcy5jcm9zc0NoZWNrU3RhdGVDb3VudFszXSA9IDA7XG5cdFx0dGhpcy5jcm9zc0NoZWNrU3RhdGVDb3VudFs0XSA9IDA7XG5cdFx0cmV0dXJuIHRoaXMuY3Jvc3NDaGVja1N0YXRlQ291bnQ7XG5cdH19KTtcblxuXHR0aGlzLmZvdW5kUGF0dGVybkNyb3NzPWZ1bmN0aW9uKCBzdGF0ZUNvdW50KVxuXHRcdHtcblx0XHRcdHZhciB0b3RhbE1vZHVsZVNpemUgPSAwO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCA1OyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBjb3VudCA9IHN0YXRlQ291bnRbaV07XG5cdFx0XHRcdGlmIChjb3VudCA9PSAwKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRvdGFsTW9kdWxlU2l6ZSArPSBjb3VudDtcblx0XHRcdH1cblx0XHRcdGlmICh0b3RhbE1vZHVsZVNpemUgPCA3KVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHR2YXIgbW9kdWxlU2l6ZSA9IE1hdGguZmxvb3IoKHRvdGFsTW9kdWxlU2l6ZSA8PCBJTlRFR0VSX01BVEhfU0hJRlQpIC8gNyk7XG5cdFx0XHR2YXIgbWF4VmFyaWFuY2UgPSBNYXRoLmZsb29yKG1vZHVsZVNpemUgLyAyKTtcblx0XHRcdC8vIEFsbG93IGxlc3MgdGhhbiA1MCUgdmFyaWFuY2UgZnJvbSAxLTEtMy0xLTEgcHJvcG9ydGlvbnNcblx0XHRcdHJldHVybiBNYXRoLmFicyhtb2R1bGVTaXplIC0gKHN0YXRlQ291bnRbMF0gPDwgSU5URUdFUl9NQVRIX1NISUZUKSkgPCBtYXhWYXJpYW5jZSAmJiBNYXRoLmFicyhtb2R1bGVTaXplIC0gKHN0YXRlQ291bnRbMV0gPDwgSU5URUdFUl9NQVRIX1NISUZUKSkgPCBtYXhWYXJpYW5jZSAmJiBNYXRoLmFicygzICogbW9kdWxlU2l6ZSAtIChzdGF0ZUNvdW50WzJdIDw8IElOVEVHRVJfTUFUSF9TSElGVCkpIDwgMyAqIG1heFZhcmlhbmNlICYmIE1hdGguYWJzKG1vZHVsZVNpemUgLSAoc3RhdGVDb3VudFszXSA8PCBJTlRFR0VSX01BVEhfU0hJRlQpKSA8IG1heFZhcmlhbmNlICYmIE1hdGguYWJzKG1vZHVsZVNpemUgLSAoc3RhdGVDb3VudFs0XSA8PCBJTlRFR0VSX01BVEhfU0hJRlQpKSA8IG1heFZhcmlhbmNlO1xuXHRcdH1cblx0dGhpcy5jZW50ZXJGcm9tRW5kPWZ1bmN0aW9uKCBzdGF0ZUNvdW50LCAgZW5kKVxuXHRcdHtcblx0XHRcdHJldHVybiAgKGVuZCAtIHN0YXRlQ291bnRbNF0gLSBzdGF0ZUNvdW50WzNdKSAtIHN0YXRlQ291bnRbMl0gLyAyLjA7XG5cdFx0fVxuXHR0aGlzLmNyb3NzQ2hlY2tWZXJ0aWNhbD1mdW5jdGlvbiggc3RhcnRJLCAgY2VudGVySiwgIG1heENvdW50LCAgb3JpZ2luYWxTdGF0ZUNvdW50VG90YWwpXG5cdFx0e1xuXHRcdFx0dmFyIGltYWdlID0gdGhpcy5pbWFnZTtcblxuXHRcdFx0dmFyIG1heEkgPSBpbWFnZS5oZWlnaHQ7XG5cdFx0XHR2YXIgc3RhdGVDb3VudCA9IHRoaXMuQ3Jvc3NDaGVja1N0YXRlQ291bnQ7XG5cblx0XHRcdC8vIFN0YXJ0IGNvdW50aW5nIHVwIGZyb20gY2VudGVyXG5cdFx0XHR2YXIgaSA9IHN0YXJ0STtcblx0XHRcdHdoaWxlIChpID49IDAgJiYgaW1hZ2UuZGF0YVtjZW50ZXJKICsgaSppbWFnZS53aWR0aF0pXG5cdFx0XHR7XG5cdFx0XHRcdHN0YXRlQ291bnRbMl0rKztcblx0XHRcdFx0aS0tO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGkgPCAwKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gTmFOO1xuXHRcdFx0fVxuXHRcdFx0d2hpbGUgKGkgPj0gMCAmJiAhaW1hZ2UuZGF0YVtjZW50ZXJKICtpKmltYWdlLndpZHRoXSAmJiBzdGF0ZUNvdW50WzFdIDw9IG1heENvdW50KVxuXHRcdFx0e1xuXHRcdFx0XHRzdGF0ZUNvdW50WzFdKys7XG5cdFx0XHRcdGktLTtcblx0XHRcdH1cblx0XHRcdC8vIElmIGFscmVhZHkgdG9vIG1hbnkgbW9kdWxlcyBpbiB0aGlzIHN0YXRlIG9yIHJhbiBvZmYgdGhlIGVkZ2U6XG5cdFx0XHRpZiAoaSA8IDAgfHwgc3RhdGVDb3VudFsxXSA+IG1heENvdW50KVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gTmFOO1xuXHRcdFx0fVxuXHRcdFx0d2hpbGUgKGkgPj0gMCAmJiBpbWFnZS5kYXRhW2NlbnRlckogKyBpKmltYWdlLndpZHRoXSAmJiBzdGF0ZUNvdW50WzBdIDw9IG1heENvdW50KVxuXHRcdFx0e1xuXHRcdFx0XHRzdGF0ZUNvdW50WzBdKys7XG5cdFx0XHRcdGktLTtcblx0XHRcdH1cblx0XHRcdGlmIChzdGF0ZUNvdW50WzBdID4gbWF4Q291bnQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBOYU47XG5cdFx0XHR9XG5cblx0XHRcdC8vIE5vdyBhbHNvIGNvdW50IGRvd24gZnJvbSBjZW50ZXJcblx0XHRcdGkgPSBzdGFydEkgKyAxO1xuXHRcdFx0d2hpbGUgKGkgPCBtYXhJICYmIGltYWdlLmRhdGFbY2VudGVySiAraSppbWFnZS53aWR0aF0pXG5cdFx0XHR7XG5cdFx0XHRcdHN0YXRlQ291bnRbMl0rKztcblx0XHRcdFx0aSsrO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGkgPT0gbWF4SSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIE5hTjtcblx0XHRcdH1cblx0XHRcdHdoaWxlIChpIDwgbWF4SSAmJiAhaW1hZ2UuZGF0YVtjZW50ZXJKICsgaSppbWFnZS53aWR0aF0gJiYgc3RhdGVDb3VudFszXSA8IG1heENvdW50KVxuXHRcdFx0e1xuXHRcdFx0XHRzdGF0ZUNvdW50WzNdKys7XG5cdFx0XHRcdGkrKztcblx0XHRcdH1cblx0XHRcdGlmIChpID09IG1heEkgfHwgc3RhdGVDb3VudFszXSA+PSBtYXhDb3VudClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIE5hTjtcblx0XHRcdH1cblx0XHRcdHdoaWxlIChpIDwgbWF4SSAmJiBpbWFnZS5kYXRhW2NlbnRlckogKyBpKmltYWdlLndpZHRoXSAmJiBzdGF0ZUNvdW50WzRdIDwgbWF4Q291bnQpXG5cdFx0XHR7XG5cdFx0XHRcdHN0YXRlQ291bnRbNF0rKztcblx0XHRcdFx0aSsrO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHN0YXRlQ291bnRbNF0gPj0gbWF4Q291bnQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBOYU47XG5cdFx0XHR9XG5cblx0XHRcdC8vIElmIHdlIGZvdW5kIGEgZmluZGVyLXBhdHRlcm4tbGlrZSBzZWN0aW9uLCBidXQgaXRzIHNpemUgaXMgbW9yZSB0aGFuIDQwJSBkaWZmZXJlbnQgdGhhblxuXHRcdFx0Ly8gdGhlIG9yaWdpbmFsLCBhc3N1bWUgaXQncyBhIGZhbHNlIHBvc2l0aXZlXG5cdFx0XHR2YXIgc3RhdGVDb3VudFRvdGFsID0gc3RhdGVDb3VudFswXSArIHN0YXRlQ291bnRbMV0gKyBzdGF0ZUNvdW50WzJdICsgc3RhdGVDb3VudFszXSArIHN0YXRlQ291bnRbNF07XG5cdFx0XHRpZiAoNSAqIE1hdGguYWJzKHN0YXRlQ291bnRUb3RhbCAtIG9yaWdpbmFsU3RhdGVDb3VudFRvdGFsKSA+PSAyICogb3JpZ2luYWxTdGF0ZUNvdW50VG90YWwpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBOYU47XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzLmZvdW5kUGF0dGVybkNyb3NzKHN0YXRlQ291bnQpP3RoaXMuY2VudGVyRnJvbUVuZChzdGF0ZUNvdW50LCBpKTpOYU47XG5cdFx0fVxuXHR0aGlzLmNyb3NzQ2hlY2tIb3Jpem9udGFsPWZ1bmN0aW9uKCBzdGFydEosICBjZW50ZXJJLCAgbWF4Q291bnQsIG9yaWdpbmFsU3RhdGVDb3VudFRvdGFsKVxuXHRcdHtcblx0XHRcdHZhciBpbWFnZSA9IHRoaXMuaW1hZ2U7XG5cblx0XHRcdHZhciBtYXhKID0gaW1hZ2Uud2lkdGg7XG5cdFx0XHR2YXIgc3RhdGVDb3VudCA9IHRoaXMuQ3Jvc3NDaGVja1N0YXRlQ291bnQ7XG5cblx0XHRcdHZhciBqID0gc3RhcnRKO1xuXHRcdFx0d2hpbGUgKGogPj0gMCAmJiBpbWFnZS5kYXRhW2orIGNlbnRlckkqaW1hZ2Uud2lkdGhdKVxuXHRcdFx0e1xuXHRcdFx0XHRzdGF0ZUNvdW50WzJdKys7XG5cdFx0XHRcdGotLTtcblx0XHRcdH1cblx0XHRcdGlmIChqIDwgMClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIE5hTjtcblx0XHRcdH1cblx0XHRcdHdoaWxlIChqID49IDAgJiYgIWltYWdlLmRhdGFbaisgY2VudGVySSppbWFnZS53aWR0aF0gJiYgc3RhdGVDb3VudFsxXSA8PSBtYXhDb3VudClcblx0XHRcdHtcblx0XHRcdFx0c3RhdGVDb3VudFsxXSsrO1xuXHRcdFx0XHRqLS07XG5cdFx0XHR9XG5cdFx0XHRpZiAoaiA8IDAgfHwgc3RhdGVDb3VudFsxXSA+IG1heENvdW50KVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gTmFOO1xuXHRcdFx0fVxuXHRcdFx0d2hpbGUgKGogPj0gMCAmJiBpbWFnZS5kYXRhW2orIGNlbnRlckkqaW1hZ2Uud2lkdGhdICYmIHN0YXRlQ291bnRbMF0gPD0gbWF4Q291bnQpXG5cdFx0XHR7XG5cdFx0XHRcdHN0YXRlQ291bnRbMF0rKztcblx0XHRcdFx0ai0tO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHN0YXRlQ291bnRbMF0gPiBtYXhDb3VudClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIE5hTjtcblx0XHRcdH1cblxuXHRcdFx0aiA9IHN0YXJ0SiArIDE7XG5cdFx0XHR3aGlsZSAoaiA8IG1heEogJiYgaW1hZ2UuZGF0YVtqKyBjZW50ZXJJKmltYWdlLndpZHRoXSlcblx0XHRcdHtcblx0XHRcdFx0c3RhdGVDb3VudFsyXSsrO1xuXHRcdFx0XHRqKys7XG5cdFx0XHR9XG5cdFx0XHRpZiAoaiA9PSBtYXhKKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gTmFOO1xuXHRcdFx0fVxuXHRcdFx0d2hpbGUgKGogPCBtYXhKICYmICFpbWFnZS5kYXRhW2orIGNlbnRlckkqaW1hZ2Uud2lkdGhdICYmIHN0YXRlQ291bnRbM10gPCBtYXhDb3VudClcblx0XHRcdHtcblx0XHRcdFx0c3RhdGVDb3VudFszXSsrO1xuXHRcdFx0XHRqKys7XG5cdFx0XHR9XG5cdFx0XHRpZiAoaiA9PSBtYXhKIHx8IHN0YXRlQ291bnRbM10gPj0gbWF4Q291bnQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBOYU47XG5cdFx0XHR9XG5cdFx0XHR3aGlsZSAoaiA8IG1heEogJiYgaW1hZ2UuZGF0YVtqKyBjZW50ZXJJKmltYWdlLndpZHRoXSAmJiBzdGF0ZUNvdW50WzRdIDwgbWF4Q291bnQpXG5cdFx0XHR7XG5cdFx0XHRcdHN0YXRlQ291bnRbNF0rKztcblx0XHRcdFx0aisrO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHN0YXRlQ291bnRbNF0gPj0gbWF4Q291bnQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBOYU47XG5cdFx0XHR9XG5cblx0XHRcdC8vIElmIHdlIGZvdW5kIGEgZmluZGVyLXBhdHRlcm4tbGlrZSBzZWN0aW9uLCBidXQgaXRzIHNpemUgaXMgc2lnbmlmaWNhbnRseSBkaWZmZXJlbnQgdGhhblxuXHRcdFx0Ly8gdGhlIG9yaWdpbmFsLCBhc3N1bWUgaXQncyBhIGZhbHNlIHBvc2l0aXZlXG5cdFx0XHR2YXIgc3RhdGVDb3VudFRvdGFsID0gc3RhdGVDb3VudFswXSArIHN0YXRlQ291bnRbMV0gKyBzdGF0ZUNvdW50WzJdICsgc3RhdGVDb3VudFszXSArIHN0YXRlQ291bnRbNF07XG5cdFx0XHRpZiAoNSAqIE1hdGguYWJzKHN0YXRlQ291bnRUb3RhbCAtIG9yaWdpbmFsU3RhdGVDb3VudFRvdGFsKSA+PSBvcmlnaW5hbFN0YXRlQ291bnRUb3RhbClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIE5hTjtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRoaXMuZm91bmRQYXR0ZXJuQ3Jvc3Moc3RhdGVDb3VudCk/dGhpcy5jZW50ZXJGcm9tRW5kKHN0YXRlQ291bnQsIGopOk5hTjtcblx0XHR9XG5cdHRoaXMuaGFuZGxlUG9zc2libGVDZW50ZXI9ZnVuY3Rpb24oIHN0YXRlQ291bnQsICBpLCAgailcblx0XHR7XG5cdFx0XHR2YXIgc3RhdGVDb3VudFRvdGFsID0gc3RhdGVDb3VudFswXSArIHN0YXRlQ291bnRbMV0gKyBzdGF0ZUNvdW50WzJdICsgc3RhdGVDb3VudFszXSArIHN0YXRlQ291bnRbNF07XG5cdFx0XHR2YXIgY2VudGVySiA9IHRoaXMuY2VudGVyRnJvbUVuZChzdGF0ZUNvdW50LCBqKTsgLy9mbG9hdFxuXHRcdFx0dmFyIGNlbnRlckkgPSB0aGlzLmNyb3NzQ2hlY2tWZXJ0aWNhbChpLCBNYXRoLmZsb29yKCBjZW50ZXJKKSwgc3RhdGVDb3VudFsyXSwgc3RhdGVDb3VudFRvdGFsKTsgLy9mbG9hdFxuXHRcdFx0aWYgKCFpc05hTihjZW50ZXJJKSlcblx0XHRcdHtcblx0XHRcdFx0Ly8gUmUtY3Jvc3MgY2hlY2tcblx0XHRcdFx0Y2VudGVySiA9IHRoaXMuY3Jvc3NDaGVja0hvcml6b250YWwoTWF0aC5mbG9vciggY2VudGVySiksIE1hdGguZmxvb3IoIGNlbnRlckkpLCBzdGF0ZUNvdW50WzJdLCBzdGF0ZUNvdW50VG90YWwpO1xuXHRcdFx0XHRpZiAoIWlzTmFOKGNlbnRlckopKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dmFyIGVzdGltYXRlZE1vZHVsZVNpemUgPSAgIHN0YXRlQ291bnRUb3RhbCAvIDcuMDtcblx0XHRcdFx0XHR2YXIgZm91bmQgPSBmYWxzZTtcblx0XHRcdFx0XHR2YXIgbWF4ID0gdGhpcy5wb3NzaWJsZUNlbnRlcnMubGVuZ3RoO1xuXHRcdFx0XHRcdGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBtYXg7IGluZGV4KyspXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dmFyIGNlbnRlciA9IHRoaXMucG9zc2libGVDZW50ZXJzW2luZGV4XTtcblx0XHRcdFx0XHRcdC8vIExvb2sgZm9yIGFib3V0IHRoZSBzYW1lIGNlbnRlciBhbmQgbW9kdWxlIHNpemU6XG5cdFx0XHRcdFx0XHRpZiAoY2VudGVyLmFib3V0RXF1YWxzKGVzdGltYXRlZE1vZHVsZVNpemUsIGNlbnRlckksIGNlbnRlckopKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjZW50ZXIuaW5jcmVtZW50Q291bnQoKTtcblx0XHRcdFx0XHRcdFx0Zm91bmQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKCFmb3VuZClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR2YXIgcG9pbnQgPSBuZXcgRmluZGVyUGF0dGVybihjZW50ZXJKLCBjZW50ZXJJLCBlc3RpbWF0ZWRNb2R1bGVTaXplKTtcblx0XHRcdFx0XHRcdHRoaXMucG9zc2libGVDZW50ZXJzLnB1c2gocG9pbnQpO1xuXHRcdFx0XHRcdFx0aWYgKHRoaXMucmVzdWx0UG9pbnRDYWxsYmFjayAhPSBudWxsKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHR0aGlzLnJlc3VsdFBvaW50Q2FsbGJhY2suZm91bmRQb3NzaWJsZVJlc3VsdFBvaW50KHBvaW50KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0dGhpcy5zZWxlY3RCZXN0UGF0dGVybnM9ZnVuY3Rpb24oKVxuXHRcdHtcblxuXHRcdFx0dmFyIHN0YXJ0U2l6ZSA9IHRoaXMucG9zc2libGVDZW50ZXJzLmxlbmd0aDtcblx0XHRcdGlmIChzdGFydFNpemUgPCAzKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBDb3VsZG4ndCBmaW5kIGVub3VnaCBmaW5kZXIgcGF0dGVybnNcblx0XHRcdFx0dGhyb3cgXCJDb3VsZG4ndCBmaW5kIGVub3VnaCBmaW5kZXIgcGF0dGVybnM6XCIrc3RhcnRTaXplK1wiIHBhdHRlcm5zIGZvdW5kXCI7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEZpbHRlciBvdXRsaWVyIHBvc3NpYmlsaXRpZXMgd2hvc2UgbW9kdWxlIHNpemUgaXMgdG9vIGRpZmZlcmVudFxuXHRcdFx0aWYgKHN0YXJ0U2l6ZSA+IDMpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIEJ1dCB3ZSBjYW4gb25seSBhZmZvcmQgdG8gZG8gc28gaWYgd2UgaGF2ZSBhdCBsZWFzdCA0IHBvc3NpYmlsaXRpZXMgdG8gY2hvb3NlIGZyb21cblx0XHRcdFx0dmFyIHRvdGFsTW9kdWxlU2l6ZSA9IDAuMDtcbiAgICAgICAgICAgICAgICB2YXIgc3F1YXJlID0gMC4wO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHN0YXJ0U2l6ZTsgaSsrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly90b3RhbE1vZHVsZVNpemUgKz0gIHRoaXMucG9zc2libGVDZW50ZXJzW2ldLkVzdGltYXRlZE1vZHVsZVNpemU7XG4gICAgICAgICAgICAgICAgICAgIHZhclx0Y2VudGVyVmFsdWU9dGhpcy5wb3NzaWJsZUNlbnRlcnNbaV0uRXN0aW1hdGVkTW9kdWxlU2l6ZTtcblx0XHRcdFx0XHR0b3RhbE1vZHVsZVNpemUgKz0gY2VudGVyVmFsdWU7XG5cdFx0XHRcdFx0c3F1YXJlICs9IChjZW50ZXJWYWx1ZSAqIGNlbnRlclZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR2YXIgYXZlcmFnZSA9IHRvdGFsTW9kdWxlU2l6ZSAvICBzdGFydFNpemU7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3NzaWJsZUNlbnRlcnMuc29ydChmdW5jdGlvbihjZW50ZXIxLGNlbnRlcjIpIHtcblx0XHRcdFx0ICAgICAgdmFyIGRBPU1hdGguYWJzKGNlbnRlcjIuRXN0aW1hdGVkTW9kdWxlU2l6ZSAtIGF2ZXJhZ2UpO1xuXHRcdFx0XHQgICAgICB2YXIgZEI9TWF0aC5hYnMoY2VudGVyMS5Fc3RpbWF0ZWRNb2R1bGVTaXplIC0gYXZlcmFnZSk7XG5cdFx0XHRcdCAgICAgIGlmIChkQSA8IGRCKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gKC0xKTtcblx0XHRcdFx0ICAgICAgfSBlbHNlIGlmIChkQSA9PSBkQikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIDA7XG5cdFx0XHRcdCAgICAgIH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gMTtcblx0XHRcdFx0ICAgICAgfVxuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHZhciBzdGREZXYgPSBNYXRoLnNxcnQoc3F1YXJlIC8gc3RhcnRTaXplIC0gYXZlcmFnZSAqIGF2ZXJhZ2UpO1xuXHRcdFx0XHR2YXIgbGltaXQgPSBNYXRoLm1heCgwLjIgKiBhdmVyYWdlLCBzdGREZXYpO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucG9zc2libGVDZW50ZXJzLmxlbmd0aCAmJiB0aGlzLnBvc3NpYmxlQ2VudGVycy5sZW5ndGggPiAzOyBpKyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2YXIgcGF0dGVybiA9ICB0aGlzLnBvc3NpYmxlQ2VudGVyc1tpXTtcblx0XHRcdFx0XHQvL2lmIChNYXRoLmFicyhwYXR0ZXJuLkVzdGltYXRlZE1vZHVsZVNpemUgLSBhdmVyYWdlKSA+IDAuMiAqIGF2ZXJhZ2UpXG4gICAgICAgICAgICAgICAgICAgIGlmIChNYXRoLmFicyhwYXR0ZXJuLkVzdGltYXRlZE1vZHVsZVNpemUgLSBhdmVyYWdlKSA+IGxpbWl0KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHRoaXMucG9zc2libGVDZW50ZXJzLnNwbGljZShpLCAxKTtcblx0XHRcdFx0XHRcdGktLTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKHRoaXMucG9zc2libGVDZW50ZXJzLmxlbmd0aCA+IDMpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIFRocm93IGF3YXkgYWxsIGJ1dCB0aG9zZSBmaXJzdCBzaXplIGNhbmRpZGF0ZSBwb2ludHMgd2UgZm91bmQuXG5cdFx0XHRcdHRoaXMucG9zc2libGVDZW50ZXJzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG5cdFx0XHRcdCAgICAgICAgICBpZiAoYS5jb3VudCA+IGIuY291bnQpe3JldHVybiAtMTt9XG5cdFx0XHRcdCAgICAgICAgICBpZiAoYS5jb3VudCA8IGIuY291bnQpe3JldHVybiAxO31cblx0XHRcdFx0ICAgICAgICAgIHJldHVybiAwO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG5ldyBBcnJheSggdGhpcy5wb3NzaWJsZUNlbnRlcnNbMF0sICB0aGlzLnBvc3NpYmxlQ2VudGVyc1sxXSwgIHRoaXMucG9zc2libGVDZW50ZXJzWzJdKTtcblx0XHR9XG5cblx0dGhpcy5maW5kUm93U2tpcD1mdW5jdGlvbigpXG5cdFx0e1xuXHRcdFx0dmFyIG1heCA9IHRoaXMucG9zc2libGVDZW50ZXJzLmxlbmd0aDtcblx0XHRcdGlmIChtYXggPD0gMSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIDA7XG5cdFx0XHR9XG5cdFx0XHR2YXIgZmlyc3RDb25maXJtZWRDZW50ZXIgPSBudWxsO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXg7IGkrKylcblx0XHRcdHtcblx0XHRcdFx0dmFyIGNlbnRlciA9ICB0aGlzLnBvc3NpYmxlQ2VudGVyc1tpXTtcblx0XHRcdFx0aWYgKGNlbnRlci5Db3VudCA+PSBDRU5URVJfUVVPUlVNKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKGZpcnN0Q29uZmlybWVkQ2VudGVyID09IG51bGwpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Zmlyc3RDb25maXJtZWRDZW50ZXIgPSBjZW50ZXI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyBXZSBoYXZlIHR3byBjb25maXJtZWQgY2VudGVyc1xuXHRcdFx0XHRcdFx0Ly8gSG93IGZhciBkb3duIGNhbiB3ZSBza2lwIGJlZm9yZSByZXN1bWluZyBsb29raW5nIGZvciB0aGUgbmV4dFxuXHRcdFx0XHRcdFx0Ly8gcGF0dGVybj8gSW4gdGhlIHdvcnN0IGNhc2UsIG9ubHkgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGVcblx0XHRcdFx0XHRcdC8vIGRpZmZlcmVuY2UgaW4gdGhlIHggLyB5IGNvb3JkaW5hdGVzIG9mIHRoZSB0d28gY2VudGVycy5cblx0XHRcdFx0XHRcdC8vIFRoaXMgaXMgdGhlIGNhc2Ugd2hlcmUgeW91IGZpbmQgdG9wIGxlZnQgbGFzdC5cblx0XHRcdFx0XHRcdHRoaXMuaGFzU2tpcHBlZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRyZXR1cm4gTWF0aC5mbG9vciAoKE1hdGguYWJzKGZpcnN0Q29uZmlybWVkQ2VudGVyLlggLSBjZW50ZXIuWCkgLSBNYXRoLmFicyhmaXJzdENvbmZpcm1lZENlbnRlci5ZIC0gY2VudGVyLlkpKSAvIDIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIDA7XG5cdFx0fVxuXG5cdHRoaXMuaGF2ZU11bHRpcGx5Q29uZmlybWVkQ2VudGVycz1mdW5jdGlvbigpXG5cdFx0e1xuXHRcdFx0dmFyIGNvbmZpcm1lZENvdW50ID0gMDtcblx0XHRcdHZhciB0b3RhbE1vZHVsZVNpemUgPSAwLjA7XG5cdFx0XHR2YXIgbWF4ID0gdGhpcy5wb3NzaWJsZUNlbnRlcnMubGVuZ3RoO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXg7IGkrKylcblx0XHRcdHtcblx0XHRcdFx0dmFyIHBhdHRlcm4gPSAgdGhpcy5wb3NzaWJsZUNlbnRlcnNbaV07XG5cdFx0XHRcdGlmIChwYXR0ZXJuLkNvdW50ID49IENFTlRFUl9RVU9SVU0pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25maXJtZWRDb3VudCsrO1xuXHRcdFx0XHRcdHRvdGFsTW9kdWxlU2l6ZSArPSBwYXR0ZXJuLkVzdGltYXRlZE1vZHVsZVNpemU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChjb25maXJtZWRDb3VudCA8IDMpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdC8vIE9LLCB3ZSBoYXZlIGF0IGxlYXN0IDMgY29uZmlybWVkIGNlbnRlcnMsIGJ1dCwgaXQncyBwb3NzaWJsZSB0aGF0IG9uZSBpcyBhIFwiZmFsc2UgcG9zaXRpdmVcIlxuXHRcdFx0Ly8gYW5kIHRoYXQgd2UgbmVlZCB0byBrZWVwIGxvb2tpbmcuIFdlIGRldGVjdCB0aGlzIGJ5IGFza2luZyBpZiB0aGUgZXN0aW1hdGVkIG1vZHVsZSBzaXplc1xuXHRcdFx0Ly8gdmFyeSB0b28gbXVjaC4gV2UgYXJiaXRyYXJpbHkgc2F5IHRoYXQgd2hlbiB0aGUgdG90YWwgZGV2aWF0aW9uIGZyb20gYXZlcmFnZSBleGNlZWRzXG5cdFx0XHQvLyA1JSBvZiB0aGUgdG90YWwgbW9kdWxlIHNpemUgZXN0aW1hdGVzLCBpdCdzIHRvbyBtdWNoLlxuXHRcdFx0dmFyIGF2ZXJhZ2UgPSB0b3RhbE1vZHVsZVNpemUgLyBtYXg7XG5cdFx0XHR2YXIgdG90YWxEZXZpYXRpb24gPSAwLjA7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1heDsgaSsrKVxuXHRcdFx0e1xuXHRcdFx0XHRwYXR0ZXJuID0gdGhpcy5wb3NzaWJsZUNlbnRlcnNbaV07XG5cdFx0XHRcdHRvdGFsRGV2aWF0aW9uICs9IE1hdGguYWJzKHBhdHRlcm4uRXN0aW1hdGVkTW9kdWxlU2l6ZSAtIGF2ZXJhZ2UpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRvdGFsRGV2aWF0aW9uIDw9IDAuMDUgKiB0b3RhbE1vZHVsZVNpemU7XG5cdFx0fVxuXG5cdHRoaXMuZmluZEZpbmRlclBhdHRlcm4gPSBmdW5jdGlvbihpbWFnZSl7XG5cdFx0dmFyIHRyeUhhcmRlciA9IGZhbHNlO1xuXHRcdHRoaXMuaW1hZ2U9aW1hZ2U7XG5cdFx0dmFyIG1heEkgPSBpbWFnZS5oZWlnaHQ7XG5cdFx0dmFyIG1heEogPSBpbWFnZS53aWR0aDtcblx0XHR2YXIgaVNraXAgPSBNYXRoLmZsb29yKCgzICogbWF4SSkgLyAoNCAqIE1BWF9NT0RVTEVTKSk7XG5cdFx0aWYgKGlTa2lwIDwgTUlOX1NLSVAgfHwgdHJ5SGFyZGVyKVxuXHRcdHtcblx0XHRcdFx0aVNraXAgPSBNSU5fU0tJUDtcblx0XHR9XG5cblx0XHR2YXIgZG9uZSA9IGZhbHNlO1xuXHRcdHZhciBzdGF0ZUNvdW50ID0gbmV3IEFycmF5KDUpO1xuXHRcdGZvciAodmFyIGkgPSBpU2tpcCAtIDE7IGkgPCBtYXhJICYmICFkb25lOyBpICs9IGlTa2lwKVxuXHRcdHtcblx0XHRcdC8vIEdldCBhIHJvdyBvZiBibGFjay93aGl0ZSB2YWx1ZXNcblx0XHRcdHN0YXRlQ291bnRbMF0gPSAwO1xuXHRcdFx0c3RhdGVDb3VudFsxXSA9IDA7XG5cdFx0XHRzdGF0ZUNvdW50WzJdID0gMDtcblx0XHRcdHN0YXRlQ291bnRbM10gPSAwO1xuXHRcdFx0c3RhdGVDb3VudFs0XSA9IDA7XG5cdFx0XHR2YXIgY3VycmVudFN0YXRlID0gMDtcblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgbWF4SjsgaisrKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoaW1hZ2UuZGF0YVtqK2kqaW1hZ2Uud2lkdGhdIClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIEJsYWNrIHBpeGVsXG5cdFx0XHRcdFx0aWYgKChjdXJyZW50U3RhdGUgJiAxKSA9PSAxKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIENvdW50aW5nIHdoaXRlIHBpeGVsc1xuXHRcdFx0XHRcdFx0Y3VycmVudFN0YXRlKys7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHN0YXRlQ291bnRbY3VycmVudFN0YXRlXSsrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIFdoaXRlIHBpeGVsXG5cdFx0XHRcdFx0aWYgKChjdXJyZW50U3RhdGUgJiAxKSA9PSAwKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIENvdW50aW5nIGJsYWNrIHBpeGVsc1xuXHRcdFx0XHRcdFx0aWYgKGN1cnJlbnRTdGF0ZSA9PSA0KVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHQvLyBBIHdpbm5lcj9cblx0XHRcdFx0XHRcdFx0aWYgKHRoaXMuZm91bmRQYXR0ZXJuQ3Jvc3Moc3RhdGVDb3VudCkpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHQvLyBZZXNcblx0XHRcdFx0XHRcdFx0XHR2YXIgY29uZmlybWVkID0gdGhpcy5oYW5kbGVQb3NzaWJsZUNlbnRlcihzdGF0ZUNvdW50LCBpLCBqKTtcblx0XHRcdFx0XHRcdFx0XHRpZiAoY29uZmlybWVkKVxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIFN0YXJ0IGV4YW1pbmluZyBldmVyeSBvdGhlciBsaW5lLiBDaGVja2luZyBlYWNoIGxpbmUgdHVybmVkIG91dCB0byBiZSB0b29cblx0XHRcdFx0XHRcdFx0XHRcdC8vIGV4cGVuc2l2ZSBhbmQgZGlkbid0IGltcHJvdmUgcGVyZm9ybWFuY2UuXG5cdFx0XHRcdFx0XHRcdFx0XHRpU2tpcCA9IDI7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAodGhpcy5oYXNTa2lwcGVkKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRkb25lID0gdGhpcy5oYXZlTXVsdGlwbHlDb25maXJtZWRDZW50ZXJzKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHZhciByb3dTa2lwID0gdGhpcy5maW5kUm93U2tpcCgpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAocm93U2tpcCA+IHN0YXRlQ291bnRbMl0pXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBTa2lwIHJvd3MgYmV0d2VlbiByb3cgb2YgbG93ZXIgY29uZmlybWVkIGNlbnRlclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vIGFuZCB0b3Agb2YgcHJlc3VtZWQgdGhpcmQgY29uZmlybWVkIGNlbnRlclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vIGJ1dCBiYWNrIHVwIGEgYml0IHRvIGdldCBhIGZ1bGwgY2hhbmNlIG9mIGRldGVjdGluZ1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vIGl0LCBlbnRpcmUgd2lkdGggb2YgY2VudGVyIG9mIGZpbmRlciBwYXR0ZXJuXG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBTa2lwIGJ5IHJvd1NraXAsIGJ1dCBiYWNrIG9mZiBieSBzdGF0ZUNvdW50WzJdIChzaXplIG9mIGxhc3QgY2VudGVyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gb2YgcGF0dGVybiB3ZSBzYXcpIHRvIGJlIGNvbnNlcnZhdGl2ZSwgYW5kIGFsc28gYmFjayBvZmYgYnkgaVNraXAgd2hpY2hcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBpcyBhYm91dCB0byBiZSByZS1hZGRlZFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGkgKz0gcm93U2tpcCAtIHN0YXRlQ291bnRbMl0gLSBpU2tpcDtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRqID0gbWF4SiAtIDE7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIEFkdmFuY2UgdG8gbmV4dCBibGFjayBwaXhlbFxuXHRcdFx0XHRcdFx0XHRcdFx0ZG9cblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aisrO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0d2hpbGUgKGogPCBtYXhKICYmICFpbWFnZS5kYXRhW2ogKyBpKmltYWdlLndpZHRoXSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRqLS07IC8vIGJhY2sgdXAgdG8gdGhhdCBsYXN0IHdoaXRlIHBpeGVsXG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdC8vIENsZWFyIHN0YXRlIHRvIHN0YXJ0IGxvb2tpbmcgYWdhaW5cblx0XHRcdFx0XHRcdFx0XHRjdXJyZW50U3RhdGUgPSAwO1xuXHRcdFx0XHRcdFx0XHRcdHN0YXRlQ291bnRbMF0gPSAwO1xuXHRcdFx0XHRcdFx0XHRcdHN0YXRlQ291bnRbMV0gPSAwO1xuXHRcdFx0XHRcdFx0XHRcdHN0YXRlQ291bnRbMl0gPSAwO1xuXHRcdFx0XHRcdFx0XHRcdHN0YXRlQ291bnRbM10gPSAwO1xuXHRcdFx0XHRcdFx0XHRcdHN0YXRlQ291bnRbNF0gPSAwO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdC8vIE5vLCBzaGlmdCBjb3VudHMgYmFjayBieSB0d29cblx0XHRcdFx0XHRcdFx0XHRzdGF0ZUNvdW50WzBdID0gc3RhdGVDb3VudFsyXTtcblx0XHRcdFx0XHRcdFx0XHRzdGF0ZUNvdW50WzFdID0gc3RhdGVDb3VudFszXTtcblx0XHRcdFx0XHRcdFx0XHRzdGF0ZUNvdW50WzJdID0gc3RhdGVDb3VudFs0XTtcblx0XHRcdFx0XHRcdFx0XHRzdGF0ZUNvdW50WzNdID0gMTtcblx0XHRcdFx0XHRcdFx0XHRzdGF0ZUNvdW50WzRdID0gMDtcblx0XHRcdFx0XHRcdFx0XHRjdXJyZW50U3RhdGUgPSAzO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHN0YXRlQ291bnRbKytjdXJyZW50U3RhdGVdKys7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyBDb3VudGluZyB3aGl0ZSBwaXhlbHNcblx0XHRcdFx0XHRcdHN0YXRlQ291bnRbY3VycmVudFN0YXRlXSsrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXMuZm91bmRQYXR0ZXJuQ3Jvc3Moc3RhdGVDb3VudCkpXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBjb25maXJtZWQgPSB0aGlzLmhhbmRsZVBvc3NpYmxlQ2VudGVyKHN0YXRlQ291bnQsIGksIG1heEopO1xuXHRcdFx0XHRpZiAoY29uZmlybWVkKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aVNraXAgPSBzdGF0ZUNvdW50WzBdO1xuXHRcdFx0XHRcdGlmICh0aGlzLmhhc1NraXBwZWQpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly8gRm91bmQgYSB0aGlyZCBvbmVcblx0XHRcdFx0XHRcdGRvbmUgPSBoYXZlTXVsdGlwbHlDb25maXJtZWRDZW50ZXJzKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dmFyIHBhdHRlcm5JbmZvID0gdGhpcy5zZWxlY3RCZXN0UGF0dGVybnMoKTtcblx0XHRxcmNvZGUub3JkZXJCZXN0UGF0dGVybnMocGF0dGVybkluZm8pO1xuXG5cdFx0cmV0dXJuIG5ldyBGaW5kZXJQYXR0ZXJuSW5mbyhwYXR0ZXJuSW5mbyk7XG5cdH07XG59XG5cbi8qXG4gIFBvcnRlZCB0byBKYXZhU2NyaXB0IGJ5IExhemFyIExhc3psbyAyMDExXG5cbiAgbGF6YXJzb2Z0QGdtYWlsLmNvbSwgd3d3LmxhemFyc29mdC5pbmZvXG5cbiovXG5cbi8qXG4qXG4qIENvcHlyaWdodCAyMDA3IFpYaW5nIGF1dGhvcnNcbipcbiogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbipcbiogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbipcbiogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4qIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4qIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuXG5mdW5jdGlvbiBBbGlnbm1lbnRQYXR0ZXJuKHBvc1gsIHBvc1ksICBlc3RpbWF0ZWRNb2R1bGVTaXplKVxue1xuXHR0aGlzLng9cG9zWDtcblx0dGhpcy55PXBvc1k7XG5cdHRoaXMuY291bnQgPSAxO1xuXHR0aGlzLmVzdGltYXRlZE1vZHVsZVNpemUgPSBlc3RpbWF0ZWRNb2R1bGVTaXplO1xuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiRXN0aW1hdGVkTW9kdWxlU2l6ZVwiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuZXN0aW1hdGVkTW9kdWxlU2l6ZTtcblx0fX0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIkNvdW50XCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5jb3VudDtcblx0fX0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIlhcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiBNYXRoLmZsb29yKHRoaXMueCk7XG5cdH19KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJZXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gTWF0aC5mbG9vcih0aGlzLnkpO1xuXHR9fSk7XG5cdHRoaXMuaW5jcmVtZW50Q291bnQgPSBmdW5jdGlvbigpXG5cdHtcblx0XHR0aGlzLmNvdW50Kys7XG5cdH1cblx0dGhpcy5hYm91dEVxdWFscz1mdW5jdGlvbiggbW9kdWxlU2l6ZSwgIGksICBqKVxuXHRcdHtcblx0XHRcdGlmIChNYXRoLmFicyhpIC0gdGhpcy55KSA8PSBtb2R1bGVTaXplICYmIE1hdGguYWJzKGogLSB0aGlzLngpIDw9IG1vZHVsZVNpemUpXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBtb2R1bGVTaXplRGlmZiA9IE1hdGguYWJzKG1vZHVsZVNpemUgLSB0aGlzLmVzdGltYXRlZE1vZHVsZVNpemUpO1xuXHRcdFx0XHRyZXR1cm4gbW9kdWxlU2l6ZURpZmYgPD0gMS4wIHx8IG1vZHVsZVNpemVEaWZmIC8gdGhpcy5lc3RpbWF0ZWRNb2R1bGVTaXplIDw9IDEuMDtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cbn1cblxuZnVuY3Rpb24gQWxpZ25tZW50UGF0dGVybkZpbmRlciggaW1hZ2UsICBzdGFydFgsICBzdGFydFksICB3aWR0aCwgIGhlaWdodCwgIG1vZHVsZVNpemUsICByZXN1bHRQb2ludENhbGxiYWNrKVxue1xuXHR0aGlzLmltYWdlID0gaW1hZ2U7XG5cdHRoaXMucG9zc2libGVDZW50ZXJzID0gbmV3IEFycmF5KCk7XG5cdHRoaXMuc3RhcnRYID0gc3RhcnRYO1xuXHR0aGlzLnN0YXJ0WSA9IHN0YXJ0WTtcblx0dGhpcy53aWR0aCA9IHdpZHRoO1xuXHR0aGlzLmhlaWdodCA9IGhlaWdodDtcblx0dGhpcy5tb2R1bGVTaXplID0gbW9kdWxlU2l6ZTtcblx0dGhpcy5jcm9zc0NoZWNrU3RhdGVDb3VudCA9IG5ldyBBcnJheSgwLDAsMCk7XG5cdHRoaXMucmVzdWx0UG9pbnRDYWxsYmFjayA9IHJlc3VsdFBvaW50Q2FsbGJhY2s7XG5cblx0dGhpcy5jZW50ZXJGcm9tRW5kPWZ1bmN0aW9uKHN0YXRlQ291bnQsICBlbmQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICAoZW5kIC0gc3RhdGVDb3VudFsyXSkgLSBzdGF0ZUNvdW50WzFdIC8gMi4wO1xuXHRcdH1cblx0dGhpcy5mb3VuZFBhdHRlcm5Dcm9zcyA9IGZ1bmN0aW9uKHN0YXRlQ291bnQpXG5cdFx0e1xuXHRcdFx0dmFyIG1vZHVsZVNpemUgPSB0aGlzLm1vZHVsZVNpemU7XG5cdFx0XHR2YXIgbWF4VmFyaWFuY2UgPSBtb2R1bGVTaXplIC8gMi4wO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChNYXRoLmFicyhtb2R1bGVTaXplIC0gc3RhdGVDb3VudFtpXSkgPj0gbWF4VmFyaWFuY2UpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHR0aGlzLmNyb3NzQ2hlY2tWZXJ0aWNhbD1mdW5jdGlvbiggc3RhcnRJLCAgY2VudGVySiwgIG1heENvdW50LCAgb3JpZ2luYWxTdGF0ZUNvdW50VG90YWwpXG5cdFx0e1xuXHRcdFx0dmFyIGltYWdlID0gdGhpcy5pbWFnZTtcblxuXHRcdFx0dmFyIG1heEkgPSBpbWFnZS5oZWlnaHQ7XG5cdFx0XHR2YXIgc3RhdGVDb3VudCA9IHRoaXMuY3Jvc3NDaGVja1N0YXRlQ291bnQ7XG5cdFx0XHRzdGF0ZUNvdW50WzBdID0gMDtcblx0XHRcdHN0YXRlQ291bnRbMV0gPSAwO1xuXHRcdFx0c3RhdGVDb3VudFsyXSA9IDA7XG5cblx0XHRcdC8vIFN0YXJ0IGNvdW50aW5nIHVwIGZyb20gY2VudGVyXG5cdFx0XHR2YXIgaSA9IHN0YXJ0STtcblx0XHRcdHdoaWxlIChpID49IDAgJiYgaW1hZ2UuZGF0YVtjZW50ZXJKICsgaSppbWFnZS53aWR0aF0gJiYgc3RhdGVDb3VudFsxXSA8PSBtYXhDb3VudClcblx0XHRcdHtcblx0XHRcdFx0c3RhdGVDb3VudFsxXSsrO1xuXHRcdFx0XHRpLS07XG5cdFx0XHR9XG5cdFx0XHQvLyBJZiBhbHJlYWR5IHRvbyBtYW55IG1vZHVsZXMgaW4gdGhpcyBzdGF0ZSBvciByYW4gb2ZmIHRoZSBlZGdlOlxuXHRcdFx0aWYgKGkgPCAwIHx8IHN0YXRlQ291bnRbMV0gPiBtYXhDb3VudClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIE5hTjtcblx0XHRcdH1cblx0XHRcdHdoaWxlIChpID49IDAgJiYgIWltYWdlLmRhdGFbY2VudGVySiArIGkqaW1hZ2Uud2lkdGhdICYmIHN0YXRlQ291bnRbMF0gPD0gbWF4Q291bnQpXG5cdFx0XHR7XG5cdFx0XHRcdHN0YXRlQ291bnRbMF0rKztcblx0XHRcdFx0aS0tO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHN0YXRlQ291bnRbMF0gPiBtYXhDb3VudClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIE5hTjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gTm93IGFsc28gY291bnQgZG93biBmcm9tIGNlbnRlclxuXHRcdFx0aSA9IHN0YXJ0SSArIDE7XG5cdFx0XHR3aGlsZSAoaSA8IG1heEkgJiYgaW1hZ2UuZGF0YVtjZW50ZXJKICsgaSppbWFnZS53aWR0aF0gJiYgc3RhdGVDb3VudFsxXSA8PSBtYXhDb3VudClcblx0XHRcdHtcblx0XHRcdFx0c3RhdGVDb3VudFsxXSsrO1xuXHRcdFx0XHRpKys7XG5cdFx0XHR9XG5cdFx0XHRpZiAoaSA9PSBtYXhJIHx8IHN0YXRlQ291bnRbMV0gPiBtYXhDb3VudClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIE5hTjtcblx0XHRcdH1cblx0XHRcdHdoaWxlIChpIDwgbWF4SSAmJiAhaW1hZ2UuZGF0YVtjZW50ZXJKICsgaSppbWFnZS53aWR0aF0gJiYgc3RhdGVDb3VudFsyXSA8PSBtYXhDb3VudClcblx0XHRcdHtcblx0XHRcdFx0c3RhdGVDb3VudFsyXSsrO1xuXHRcdFx0XHRpKys7XG5cdFx0XHR9XG5cdFx0XHRpZiAoc3RhdGVDb3VudFsyXSA+IG1heENvdW50KVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gTmFOO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgc3RhdGVDb3VudFRvdGFsID0gc3RhdGVDb3VudFswXSArIHN0YXRlQ291bnRbMV0gKyBzdGF0ZUNvdW50WzJdO1xuXHRcdFx0aWYgKDUgKiBNYXRoLmFicyhzdGF0ZUNvdW50VG90YWwgLSBvcmlnaW5hbFN0YXRlQ291bnRUb3RhbCkgPj0gMiAqIG9yaWdpbmFsU3RhdGVDb3VudFRvdGFsKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gTmFOO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGhpcy5mb3VuZFBhdHRlcm5Dcm9zcyhzdGF0ZUNvdW50KT90aGlzLmNlbnRlckZyb21FbmQoc3RhdGVDb3VudCwgaSk6TmFOO1xuXHRcdH1cblxuXHR0aGlzLmhhbmRsZVBvc3NpYmxlQ2VudGVyPWZ1bmN0aW9uKCBzdGF0ZUNvdW50LCAgaSwgIGopXG5cdFx0e1xuXHRcdFx0dmFyIHN0YXRlQ291bnRUb3RhbCA9IHN0YXRlQ291bnRbMF0gKyBzdGF0ZUNvdW50WzFdICsgc3RhdGVDb3VudFsyXTtcblx0XHRcdHZhciBjZW50ZXJKID0gdGhpcy5jZW50ZXJGcm9tRW5kKHN0YXRlQ291bnQsIGopO1xuXHRcdFx0dmFyIGNlbnRlckkgPSB0aGlzLmNyb3NzQ2hlY2tWZXJ0aWNhbChpLCBNYXRoLmZsb29yIChjZW50ZXJKKSwgMiAqIHN0YXRlQ291bnRbMV0sIHN0YXRlQ291bnRUb3RhbCk7XG5cdFx0XHRpZiAoIWlzTmFOKGNlbnRlckkpKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgZXN0aW1hdGVkTW9kdWxlU2l6ZSA9IChzdGF0ZUNvdW50WzBdICsgc3RhdGVDb3VudFsxXSArIHN0YXRlQ291bnRbMl0pIC8gMy4wO1xuXHRcdFx0XHR2YXIgbWF4ID0gdGhpcy5wb3NzaWJsZUNlbnRlcnMubGVuZ3RoO1xuXHRcdFx0XHRmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbWF4OyBpbmRleCsrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dmFyIGNlbnRlciA9ICB0aGlzLnBvc3NpYmxlQ2VudGVyc1tpbmRleF07XG5cdFx0XHRcdFx0Ly8gTG9vayBmb3IgYWJvdXQgdGhlIHNhbWUgY2VudGVyIGFuZCBtb2R1bGUgc2l6ZTpcblx0XHRcdFx0XHRpZiAoY2VudGVyLmFib3V0RXF1YWxzKGVzdGltYXRlZE1vZHVsZVNpemUsIGNlbnRlckksIGNlbnRlckopKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiBuZXcgQWxpZ25tZW50UGF0dGVybihjZW50ZXJKLCBjZW50ZXJJLCBlc3RpbWF0ZWRNb2R1bGVTaXplKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gSGFkbid0IGZvdW5kIHRoaXMgYmVmb3JlOyBzYXZlIGl0XG5cdFx0XHRcdHZhciBwb2ludCA9IG5ldyBBbGlnbm1lbnRQYXR0ZXJuKGNlbnRlckosIGNlbnRlckksIGVzdGltYXRlZE1vZHVsZVNpemUpO1xuXHRcdFx0XHR0aGlzLnBvc3NpYmxlQ2VudGVycy5wdXNoKHBvaW50KTtcblx0XHRcdFx0aWYgKHRoaXMucmVzdWx0UG9pbnRDYWxsYmFjayAhPSBudWxsKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dGhpcy5yZXN1bHRQb2ludENhbGxiYWNrLmZvdW5kUG9zc2libGVSZXN1bHRQb2ludChwb2ludCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHR0aGlzLmZpbmQgPSBmdW5jdGlvbigpXG5cdHtcblx0XHRcdHZhciBzdGFydFggPSB0aGlzLnN0YXJ0WDtcblx0XHRcdHZhciBoZWlnaHQgPSB0aGlzLmhlaWdodDtcblx0XHRcdHZhciBtYXhKID0gc3RhcnRYICsgd2lkdGg7XG5cdFx0XHR2YXIgbWlkZGxlSSA9IHN0YXJ0WSArIChoZWlnaHQgPj4gMSk7XG5cdFx0XHQvLyBXZSBhcmUgbG9va2luZyBmb3IgYmxhY2svd2hpdGUvYmxhY2sgbW9kdWxlcyBpbiAxOjE6MSByYXRpbztcblx0XHRcdC8vIHRoaXMgdHJhY2tzIHRoZSBudW1iZXIgb2YgYmxhY2svd2hpdGUvYmxhY2sgbW9kdWxlcyBzZWVuIHNvIGZhclxuXHRcdFx0dmFyIHN0YXRlQ291bnQgPSBuZXcgQXJyYXkoMCwwLDApO1xuXHRcdFx0Zm9yICh2YXIgaUdlbiA9IDA7IGlHZW4gPCBoZWlnaHQ7IGlHZW4rKylcblx0XHRcdHtcblx0XHRcdFx0Ly8gU2VhcmNoIGZyb20gbWlkZGxlIG91dHdhcmRzXG5cdFx0XHRcdHZhciBpID0gbWlkZGxlSSArICgoaUdlbiAmIDB4MDEpID09IDA/KChpR2VuICsgMSkgPj4gMSk6LSAoKGlHZW4gKyAxKSA+PiAxKSk7XG5cdFx0XHRcdHN0YXRlQ291bnRbMF0gPSAwO1xuXHRcdFx0XHRzdGF0ZUNvdW50WzFdID0gMDtcblx0XHRcdFx0c3RhdGVDb3VudFsyXSA9IDA7XG5cdFx0XHRcdHZhciBqID0gc3RhcnRYO1xuXHRcdFx0XHQvLyBCdXJuIG9mZiBsZWFkaW5nIHdoaXRlIHBpeGVscyBiZWZvcmUgYW55dGhpbmcgZWxzZTsgaWYgd2Ugc3RhcnQgaW4gdGhlIG1pZGRsZSBvZlxuXHRcdFx0XHQvLyBhIHdoaXRlIHJ1biwgaXQgZG9lc24ndCBtYWtlIHNlbnNlIHRvIGNvdW50IGl0cyBsZW5ndGgsIHNpbmNlIHdlIGRvbid0IGtub3cgaWYgdGhlXG5cdFx0XHRcdC8vIHdoaXRlIHJ1biBjb250aW51ZWQgdG8gdGhlIGxlZnQgb2YgdGhlIHN0YXJ0IHBvaW50XG5cdFx0XHRcdHdoaWxlIChqIDwgbWF4SiAmJiAhaW1hZ2UuZGF0YVtqICsgaW1hZ2Uud2lkdGgqIGldKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aisrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZhciBjdXJyZW50U3RhdGUgPSAwO1xuXHRcdFx0XHR3aGlsZSAoaiA8IG1heEopXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoaW1hZ2UuZGF0YVtqICsgaSppbWFnZS53aWR0aF0pXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly8gQmxhY2sgcGl4ZWxcblx0XHRcdFx0XHRcdGlmIChjdXJyZW50U3RhdGUgPT0gMSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly8gQ291bnRpbmcgYmxhY2sgcGl4ZWxzXG5cdFx0XHRcdFx0XHRcdHN0YXRlQ291bnRbY3VycmVudFN0YXRlXSsrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHQvLyBDb3VudGluZyB3aGl0ZSBwaXhlbHNcblx0XHRcdFx0XHRcdFx0aWYgKGN1cnJlbnRTdGF0ZSA9PSAyKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gQSB3aW5uZXI/XG5cdFx0XHRcdFx0XHRcdFx0aWYgKHRoaXMuZm91bmRQYXR0ZXJuQ3Jvc3Moc3RhdGVDb3VudCkpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gWWVzXG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgY29uZmlybWVkID0gdGhpcy5oYW5kbGVQb3NzaWJsZUNlbnRlcihzdGF0ZUNvdW50LCBpLCBqKTtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChjb25maXJtZWQgIT0gbnVsbClcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGNvbmZpcm1lZDtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0c3RhdGVDb3VudFswXSA9IHN0YXRlQ291bnRbMl07XG5cdFx0XHRcdFx0XHRcdFx0c3RhdGVDb3VudFsxXSA9IDE7XG5cdFx0XHRcdFx0XHRcdFx0c3RhdGVDb3VudFsyXSA9IDA7XG5cdFx0XHRcdFx0XHRcdFx0Y3VycmVudFN0YXRlID0gMTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRzdGF0ZUNvdW50WysrY3VycmVudFN0YXRlXSsrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyBXaGl0ZSBwaXhlbFxuXHRcdFx0XHRcdFx0aWYgKGN1cnJlbnRTdGF0ZSA9PSAxKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHQvLyBDb3VudGluZyBibGFjayBwaXhlbHNcblx0XHRcdFx0XHRcdFx0Y3VycmVudFN0YXRlKys7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRzdGF0ZUNvdW50W2N1cnJlbnRTdGF0ZV0rKztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aisrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh0aGlzLmZvdW5kUGF0dGVybkNyb3NzKHN0YXRlQ291bnQpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dmFyIGNvbmZpcm1lZCA9IHRoaXMuaGFuZGxlUG9zc2libGVDZW50ZXIoc3RhdGVDb3VudCwgaSwgbWF4Sik7XG5cdFx0XHRcdFx0aWYgKGNvbmZpcm1lZCAhPSBudWxsKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiBjb25maXJtZWQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIEhtbSwgbm90aGluZyB3ZSBzYXcgd2FzIG9ic2VydmVkIGFuZCBjb25maXJtZWQgdHdpY2UuIElmIHdlIGhhZFxuXHRcdFx0Ly8gYW55IGd1ZXNzIGF0IGFsbCwgcmV0dXJuIGl0LlxuXHRcdFx0aWYgKCEodGhpcy5wb3NzaWJsZUNlbnRlcnMubGVuZ3RoID09IDApKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gIHRoaXMucG9zc2libGVDZW50ZXJzWzBdO1xuXHRcdFx0fVxuXG5cdFx0XHR0aHJvdyBcIkNvdWxkbid0IGZpbmQgZW5vdWdoIGFsaWdubWVudCBwYXR0ZXJuc1wiO1xuXHRcdH1cblxufVxuXG4vKlxuICBQb3J0ZWQgdG8gSmF2YVNjcmlwdCBieSBMYXphciBMYXN6bG8gMjAxMVxuXG4gIGxhemFyc29mdEBnbWFpbC5jb20sIHd3dy5sYXphcnNvZnQuaW5mb1xuXG4qL1xuXG4vKlxuKlxuKiBDb3B5cmlnaHQgMjAwNyBaWGluZyBhdXRob3JzXG4qXG4qIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4qIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4qXG4qICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4qXG4qIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cblxuZnVuY3Rpb24gUVJDb2RlRGF0YUJsb2NrUmVhZGVyKGJsb2NrcywgIHZlcnNpb24sICBudW1FcnJvckNvcnJlY3Rpb25Db2RlKVxue1xuXHR0aGlzLmJsb2NrUG9pbnRlciA9IDA7XG5cdHRoaXMuYml0UG9pbnRlciA9IDc7XG5cdHRoaXMuZGF0YUxlbmd0aCA9IDA7XG5cdHRoaXMuYmxvY2tzID0gYmxvY2tzO1xuXHR0aGlzLm51bUVycm9yQ29ycmVjdGlvbkNvZGUgPSBudW1FcnJvckNvcnJlY3Rpb25Db2RlO1xuXHRpZiAodmVyc2lvbiA8PSA5KVxuXHRcdHRoaXMuZGF0YUxlbmd0aE1vZGUgPSAwO1xuXHRlbHNlIGlmICh2ZXJzaW9uID49IDEwICYmIHZlcnNpb24gPD0gMjYpXG5cdFx0dGhpcy5kYXRhTGVuZ3RoTW9kZSA9IDE7XG5cdGVsc2UgaWYgKHZlcnNpb24gPj0gMjcgJiYgdmVyc2lvbiA8PSA0MClcblx0XHR0aGlzLmRhdGFMZW5ndGhNb2RlID0gMjtcblxuXHR0aGlzLmdldE5leHRCaXRzID0gZnVuY3Rpb24oIG51bUJpdHMpXG5cdFx0e1xuXHRcdFx0dmFyIGJpdHMgPSAwO1xuXHRcdFx0aWYgKG51bUJpdHMgPCB0aGlzLmJpdFBvaW50ZXIgKyAxKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBuZXh0IHdvcmQgZml0cyBpbnRvIGN1cnJlbnQgZGF0YSBibG9ja1xuXHRcdFx0XHR2YXIgbWFzayA9IDA7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbnVtQml0czsgaSsrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bWFzayArPSAoMSA8PCBpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRtYXNrIDw8PSAodGhpcy5iaXRQb2ludGVyIC0gbnVtQml0cyArIDEpO1xuXG5cdFx0XHRcdGJpdHMgPSAodGhpcy5ibG9ja3NbdGhpcy5ibG9ja1BvaW50ZXJdICYgbWFzaykgPj4gKHRoaXMuYml0UG9pbnRlciAtIG51bUJpdHMgKyAxKTtcblx0XHRcdFx0dGhpcy5iaXRQb2ludGVyIC09IG51bUJpdHM7XG5cdFx0XHRcdHJldHVybiBiaXRzO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAobnVtQml0cyA8IHRoaXMuYml0UG9pbnRlciArIDEgKyA4KVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBuZXh0IHdvcmQgY3Jvc3NlcyAyIGRhdGEgYmxvY2tzXG5cdFx0XHRcdHZhciBtYXNrMSA9IDA7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5iaXRQb2ludGVyICsgMTsgaSsrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bWFzazEgKz0gKDEgPDwgaSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Yml0cyA9ICh0aGlzLmJsb2Nrc1t0aGlzLmJsb2NrUG9pbnRlcl0gJiBtYXNrMSkgPDwgKG51bUJpdHMgLSAodGhpcy5iaXRQb2ludGVyICsgMSkpO1xuICAgICAgICAgICAgICAgIHRoaXMuYmxvY2tQb2ludGVyKys7XG5cdFx0XHRcdGJpdHMgKz0gKCh0aGlzLmJsb2Nrc1t0aGlzLmJsb2NrUG9pbnRlcl0pID4+ICg4IC0gKG51bUJpdHMgLSAodGhpcy5iaXRQb2ludGVyICsgMSkpKSk7XG5cblx0XHRcdFx0dGhpcy5iaXRQb2ludGVyID0gdGhpcy5iaXRQb2ludGVyIC0gbnVtQml0cyAlIDg7XG5cdFx0XHRcdGlmICh0aGlzLmJpdFBvaW50ZXIgPCAwKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dGhpcy5iaXRQb2ludGVyID0gOCArIHRoaXMuYml0UG9pbnRlcjtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gYml0cztcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKG51bUJpdHMgPCB0aGlzLmJpdFBvaW50ZXIgKyAxICsgMTYpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIG5leHQgd29yZCBjcm9zc2VzIDMgZGF0YSBibG9ja3Ncblx0XHRcdFx0dmFyIG1hc2sxID0gMDsgLy8gbWFzayBvZiBmaXJzdCBibG9ja1xuXHRcdFx0XHR2YXIgbWFzazMgPSAwOyAvLyBtYXNrIG9mIDNyZCBibG9ja1xuXHRcdFx0XHQvL2JpdFBvaW50ZXIgKyAxIDogbnVtYmVyIG9mIGJpdHMgb2YgdGhlIDFzdCBibG9ja1xuXHRcdFx0XHQvLzggOiBudW1iZXIgb2YgdGhlIDJuZCBibG9jayAobm90ZSB0aGF0IHVzZSBhbHJlYWR5IDhiaXRzIGJlY2F1c2UgbmV4dCB3b3JkIHVzZXMgMyBkYXRhIGJsb2Nrcylcblx0XHRcdFx0Ly9udW1CaXRzIC0gKGJpdFBvaW50ZXIgKyAxICsgOCkgOiBudW1iZXIgb2YgYml0cyBvZiB0aGUgM3JkIGJsb2NrXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5iaXRQb2ludGVyICsgMTsgaSsrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bWFzazEgKz0gKDEgPDwgaSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFyIGJpdHNGaXJzdEJsb2NrID0gKHRoaXMuYmxvY2tzW3RoaXMuYmxvY2tQb2ludGVyXSAmIG1hc2sxKSA8PCAobnVtQml0cyAtICh0aGlzLmJpdFBvaW50ZXIgKyAxKSk7XG5cdFx0XHRcdHRoaXMuYmxvY2tQb2ludGVyKys7XG5cblx0XHRcdFx0dmFyIGJpdHNTZWNvbmRCbG9jayA9IHRoaXMuYmxvY2tzW3RoaXMuYmxvY2tQb2ludGVyXSA8PCAobnVtQml0cyAtICh0aGlzLmJpdFBvaW50ZXIgKyAxICsgOCkpO1xuXHRcdFx0XHR0aGlzLmJsb2NrUG9pbnRlcisrO1xuXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbnVtQml0cyAtICh0aGlzLmJpdFBvaW50ZXIgKyAxICsgOCk7IGkrKylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG1hc2szICs9ICgxIDw8IGkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG1hc2szIDw8PSA4IC0gKG51bUJpdHMgLSAodGhpcy5iaXRQb2ludGVyICsgMSArIDgpKTtcblx0XHRcdFx0dmFyIGJpdHNUaGlyZEJsb2NrID0gKHRoaXMuYmxvY2tzW3RoaXMuYmxvY2tQb2ludGVyXSAmIG1hc2szKSA+PiAoOCAtIChudW1CaXRzIC0gKHRoaXMuYml0UG9pbnRlciArIDEgKyA4KSkpO1xuXG5cdFx0XHRcdGJpdHMgPSBiaXRzRmlyc3RCbG9jayArIGJpdHNTZWNvbmRCbG9jayArIGJpdHNUaGlyZEJsb2NrO1xuXHRcdFx0XHR0aGlzLmJpdFBvaW50ZXIgPSB0aGlzLmJpdFBvaW50ZXIgLSAobnVtQml0cyAtIDgpICUgODtcblx0XHRcdFx0aWYgKHRoaXMuYml0UG9pbnRlciA8IDApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0aGlzLmJpdFBvaW50ZXIgPSA4ICsgdGhpcy5iaXRQb2ludGVyO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBiaXRzO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gMDtcblx0XHRcdH1cblx0XHR9XG5cdHRoaXMuTmV4dE1vZGU9ZnVuY3Rpb24oKVxuXHR7XG5cdFx0aWYgKCh0aGlzLmJsb2NrUG9pbnRlciA+IHRoaXMuYmxvY2tzLmxlbmd0aCAtIHRoaXMubnVtRXJyb3JDb3JyZWN0aW9uQ29kZSAtIDIpKVxuXHRcdFx0cmV0dXJuIDA7XG5cdFx0ZWxzZVxuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0TmV4dEJpdHMoNCk7XG5cdH1cblx0dGhpcy5nZXREYXRhTGVuZ3RoPWZ1bmN0aW9uKCBtb2RlSW5kaWNhdG9yKVxuXHRcdHtcblx0XHRcdHZhciBpbmRleCA9IDA7XG5cdFx0XHR3aGlsZSAodHJ1ZSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKChtb2RlSW5kaWNhdG9yID4+IGluZGV4KSA9PSAxKVxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRpbmRleCsrO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGhpcy5nZXROZXh0Qml0cyhxcmNvZGUuc2l6ZU9mRGF0YUxlbmd0aEluZm9bdGhpcy5kYXRhTGVuZ3RoTW9kZV1baW5kZXhdKTtcblx0XHR9XG5cdHRoaXMuZ2V0Um9tYW5BbmRGaWd1cmVTdHJpbmc9ZnVuY3Rpb24oIGRhdGFMZW5ndGgpXG5cdFx0e1xuXHRcdFx0dmFyIGxlbmd0aCA9IGRhdGFMZW5ndGg7XG5cdFx0XHR2YXIgaW50RGF0YSA9IDA7XG5cdFx0XHR2YXIgc3RyRGF0YSA9IFwiXCI7XG5cdFx0XHR2YXIgdGFibGVSb21hbkFuZEZpZ3VyZSA9IG5ldyBBcnJheSgnMCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOScsICdBJywgJ0InLCAnQycsICdEJywgJ0UnLCAnRicsICdHJywgJ0gnLCAnSScsICdKJywgJ0snLCAnTCcsICdNJywgJ04nLCAnTycsICdQJywgJ1EnLCAnUicsICdTJywgJ1QnLCAnVScsICdWJywgJ1cnLCAnWCcsICdZJywgJ1onLCAnICcsICckJywgJyUnLCAnKicsICcrJywgJy0nLCAnLicsICcvJywgJzonKTtcblx0XHRcdGRvXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChsZW5ndGggPiAxKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aW50RGF0YSA9IHRoaXMuZ2V0TmV4dEJpdHMoMTEpO1xuXHRcdFx0XHRcdHZhciBmaXJzdExldHRlciA9IE1hdGguZmxvb3IoaW50RGF0YSAvIDQ1KTtcblx0XHRcdFx0XHR2YXIgc2Vjb25kTGV0dGVyID0gaW50RGF0YSAlIDQ1O1xuXHRcdFx0XHRcdHN0ckRhdGEgKz0gdGFibGVSb21hbkFuZEZpZ3VyZVtmaXJzdExldHRlcl07XG5cdFx0XHRcdFx0c3RyRGF0YSArPSB0YWJsZVJvbWFuQW5kRmlndXJlW3NlY29uZExldHRlcl07XG5cdFx0XHRcdFx0bGVuZ3RoIC09IDI7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiAobGVuZ3RoID09IDEpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpbnREYXRhID0gdGhpcy5nZXROZXh0Qml0cyg2KTtcblx0XHRcdFx0XHRzdHJEYXRhICs9IHRhYmxlUm9tYW5BbmRGaWd1cmVbaW50RGF0YV07XG5cdFx0XHRcdFx0bGVuZ3RoIC09IDE7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHdoaWxlIChsZW5ndGggPiAwKTtcblxuXHRcdFx0cmV0dXJuIHN0ckRhdGE7XG5cdFx0fVxuXHR0aGlzLmdldEZpZ3VyZVN0cmluZz1mdW5jdGlvbiggZGF0YUxlbmd0aClcblx0XHR7XG5cdFx0XHR2YXIgbGVuZ3RoID0gZGF0YUxlbmd0aDtcblx0XHRcdHZhciBpbnREYXRhID0gMDtcblx0XHRcdHZhciBzdHJEYXRhID0gXCJcIjtcblx0XHRcdGRvXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChsZW5ndGggPj0gMylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGludERhdGEgPSB0aGlzLmdldE5leHRCaXRzKDEwKTtcblx0XHRcdFx0XHRpZiAoaW50RGF0YSA8IDEwMClcblx0XHRcdFx0XHRcdHN0ckRhdGEgKz0gXCIwXCI7XG5cdFx0XHRcdFx0aWYgKGludERhdGEgPCAxMClcblx0XHRcdFx0XHRcdHN0ckRhdGEgKz0gXCIwXCI7XG5cdFx0XHRcdFx0bGVuZ3RoIC09IDM7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiAobGVuZ3RoID09IDIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpbnREYXRhID0gdGhpcy5nZXROZXh0Qml0cyg3KTtcblx0XHRcdFx0XHRpZiAoaW50RGF0YSA8IDEwKVxuXHRcdFx0XHRcdFx0c3RyRGF0YSArPSBcIjBcIjtcblx0XHRcdFx0XHRsZW5ndGggLT0gMjtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChsZW5ndGggPT0gMSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGludERhdGEgPSB0aGlzLmdldE5leHRCaXRzKDQpO1xuXHRcdFx0XHRcdGxlbmd0aCAtPSAxO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHN0ckRhdGEgKz0gaW50RGF0YTtcblx0XHRcdH1cblx0XHRcdHdoaWxlIChsZW5ndGggPiAwKTtcblxuXHRcdFx0cmV0dXJuIHN0ckRhdGE7XG5cdFx0fVxuXHR0aGlzLmdldDhiaXRCeXRlQXJyYXk9ZnVuY3Rpb24oIGRhdGFMZW5ndGgpXG5cdFx0e1xuXHRcdFx0dmFyIGxlbmd0aCA9IGRhdGFMZW5ndGg7XG5cdFx0XHR2YXIgaW50RGF0YSA9IDA7XG5cdFx0XHR2YXIgb3V0cHV0ID0gbmV3IEFycmF5KCk7XG5cblx0XHRcdGRvXG5cdFx0XHR7XG5cdFx0XHRcdGludERhdGEgPSB0aGlzLmdldE5leHRCaXRzKDgpO1xuXHRcdFx0XHRvdXRwdXQucHVzaCggaW50RGF0YSk7XG5cdFx0XHRcdGxlbmd0aC0tO1xuXHRcdFx0fVxuXHRcdFx0d2hpbGUgKGxlbmd0aCA+IDApO1xuXHRcdFx0cmV0dXJuIG91dHB1dDtcblx0XHR9XG4gICAgdGhpcy5nZXRLYW5qaVN0cmluZz1mdW5jdGlvbiggZGF0YUxlbmd0aClcblx0XHR7XG5cdFx0XHR2YXIgbGVuZ3RoID0gZGF0YUxlbmd0aDtcblx0XHRcdHZhciBpbnREYXRhID0gMDtcblx0XHRcdHZhciB1bmljb2RlU3RyaW5nID0gXCJcIjtcblx0XHRcdGRvXG5cdFx0XHR7XG5cdFx0XHRcdGludERhdGEgPSBnZXROZXh0Qml0cygxMyk7XG5cdFx0XHRcdHZhciBsb3dlckJ5dGUgPSBpbnREYXRhICUgMHhDMDtcblx0XHRcdFx0dmFyIGhpZ2hlckJ5dGUgPSBpbnREYXRhIC8gMHhDMDtcblxuXHRcdFx0XHR2YXIgdGVtcFdvcmQgPSAoaGlnaGVyQnl0ZSA8PCA4KSArIGxvd2VyQnl0ZTtcblx0XHRcdFx0dmFyIHNoaWZ0amlzV29yZCA9IDA7XG5cdFx0XHRcdGlmICh0ZW1wV29yZCArIDB4ODE0MCA8PSAweDlGRkMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBiZXR3ZWVuIDgxNDAgLSA5RkZDIG9uIFNoaWZ0X0pJUyBjaGFyYWN0ZXIgc2V0XG5cdFx0XHRcdFx0c2hpZnRqaXNXb3JkID0gdGVtcFdvcmQgKyAweDgxNDA7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gYmV0d2VlbiBFMDQwIC0gRUJCRiBvbiBTaGlmdF9KSVMgY2hhcmFjdGVyIHNldFxuXHRcdFx0XHRcdHNoaWZ0amlzV29yZCA9IHRlbXBXb3JkICsgMHhDMTQwO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly92YXIgdGVtcEJ5dGUgPSBuZXcgQXJyYXkoMCwwKTtcblx0XHRcdFx0Ly90ZW1wQnl0ZVswXSA9IChzYnl0ZSkgKHNoaWZ0amlzV29yZCA+PiA4KTtcblx0XHRcdFx0Ly90ZW1wQnl0ZVsxXSA9IChzYnl0ZSkgKHNoaWZ0amlzV29yZCAmIDB4RkYpO1xuXHRcdFx0XHQvL3VuaWNvZGVTdHJpbmcgKz0gbmV3IFN0cmluZyhTeXN0ZW1VdGlscy5Ub0NoYXJBcnJheShTeXN0ZW1VdGlscy5Ub0J5dGVBcnJheSh0ZW1wQnl0ZSkpKTtcbiAgICAgICAgICAgICAgICB1bmljb2RlU3RyaW5nICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoc2hpZnRqaXNXb3JkKTtcblx0XHRcdFx0bGVuZ3RoLS07XG5cdFx0XHR9XG5cdFx0XHR3aGlsZSAobGVuZ3RoID4gMCk7XG5cblxuXHRcdFx0cmV0dXJuIHVuaWNvZGVTdHJpbmc7XG5cdFx0fVxuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiRGF0YUJ5dGVcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHZhciBvdXRwdXQgPSBuZXcgQXJyYXkoKTtcblx0XHR2YXIgTU9ERV9OVU1CRVIgPSAxO1xuXHQgICAgdmFyIE1PREVfUk9NQU5fQU5EX05VTUJFUiA9IDI7XG5cdCAgICB2YXIgTU9ERV84QklUX0JZVEUgPSA0O1xuXHQgICAgdmFyIE1PREVfS0FOSkkgPSA4O1xuXHRcdGRvXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dmFyIG1vZGUgPSB0aGlzLk5leHRNb2RlKCk7XG5cdFx0XHRcdFx0XHQvL2NhbnZhcy5wcmludGxuKFwibW9kZTogXCIgKyBtb2RlKTtcblx0XHRcdFx0XHRcdGlmIChtb2RlID09IDApXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmIChvdXRwdXQubGVuZ3RoID4gMClcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRcdHRocm93IFwiRW1wdHkgZGF0YSBibG9ja1wiO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Ly9pZiAobW9kZSAhPSAxICYmIG1vZGUgIT0gMiAmJiBtb2RlICE9IDQgJiYgbW9kZSAhPSA4KVxuXHRcdFx0XHRcdFx0Ly9cdGJyZWFrO1xuXHRcdFx0XHRcdFx0Ly99XG5cdFx0XHRcdFx0XHRpZiAobW9kZSAhPSBNT0RFX05VTUJFUiAmJiBtb2RlICE9IE1PREVfUk9NQU5fQU5EX05VTUJFUiAmJiBtb2RlICE9IE1PREVfOEJJVF9CWVRFICYmIG1vZGUgIT0gTU9ERV9LQU5KSSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0LypcdFx0XHRcdFx0Y2FudmFzLnByaW50bG4oXCJJbnZhbGlkIG1vZGU6IFwiICsgbW9kZSk7XG5cdFx0XHRcdFx0XHRcdG1vZGUgPSBndWVzc01vZGUobW9kZSk7XG5cdFx0XHRcdFx0XHRcdGNhbnZhcy5wcmludGxuKFwiR3Vlc3NlZCBtb2RlOiBcIiArIG1vZGUpOyAqL1xuXHRcdFx0XHRcdFx0XHR0aHJvdyBcIkludmFsaWQgbW9kZTogXCIgKyBtb2RlICsgXCIgaW4gKGJsb2NrOlwiICsgdGhpcy5ibG9ja1BvaW50ZXIgKyBcIiBiaXQ6XCIgKyB0aGlzLmJpdFBvaW50ZXIgKyBcIilcIjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGRhdGFMZW5ndGggPSB0aGlzLmdldERhdGFMZW5ndGgobW9kZSk7XG5cdFx0XHRcdFx0XHRpZiAoZGF0YUxlbmd0aCA8IDEpXG5cdFx0XHRcdFx0XHRcdHRocm93IFwiSW52YWxpZCBkYXRhIGxlbmd0aDogXCIgKyBkYXRhTGVuZ3RoO1xuXHRcdFx0XHRcdFx0Ly9jYW52YXMucHJpbnRsbihcImxlbmd0aDogXCIgKyBkYXRhTGVuZ3RoKTtcblx0XHRcdFx0XHRcdHN3aXRjaCAobW9kZSlcblx0XHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0XHRjYXNlIE1PREVfTlVNQkVSOlxuXHRcdFx0XHRcdFx0XHRcdC8vY2FudmFzLnByaW50bG4oXCJNb2RlOiBGaWd1cmVcIik7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIHRlbXBfc3RyID0gdGhpcy5nZXRGaWd1cmVTdHJpbmcoZGF0YUxlbmd0aCk7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIHRhID0gbmV3IEFycmF5KHRlbXBfc3RyLmxlbmd0aCk7XG5cdFx0XHRcdFx0XHRcdFx0Zm9yKHZhciBqPTA7ajx0ZW1wX3N0ci5sZW5ndGg7aisrKVxuXHRcdFx0XHRcdFx0XHRcdFx0dGFbal09dGVtcF9zdHIuY2hhckNvZGVBdChqKTtcblx0XHRcdFx0XHRcdFx0XHRvdXRwdXQucHVzaCh0YSk7XG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRcdFx0Y2FzZSBNT0RFX1JPTUFOX0FORF9OVU1CRVI6XG5cdFx0XHRcdFx0XHRcdFx0Ly9jYW52YXMucHJpbnRsbihcIk1vZGU6IFJvbWFuJkZpZ3VyZVwiKTtcblx0XHRcdFx0XHRcdFx0XHR2YXIgdGVtcF9zdHIgPSB0aGlzLmdldFJvbWFuQW5kRmlndXJlU3RyaW5nKGRhdGFMZW5ndGgpO1xuXHRcdFx0XHRcdFx0XHRcdHZhciB0YSA9IG5ldyBBcnJheSh0ZW1wX3N0ci5sZW5ndGgpO1xuXHRcdFx0XHRcdFx0XHRcdGZvcih2YXIgaj0wO2o8dGVtcF9zdHIubGVuZ3RoO2orKylcblx0XHRcdFx0XHRcdFx0XHRcdHRhW2pdPXRlbXBfc3RyLmNoYXJDb2RlQXQoaik7XG5cdFx0XHRcdFx0XHRcdFx0b3V0cHV0LnB1c2godGEgKTtcblx0XHRcdFx0XHRcdFx0XHQvL291dHB1dC5Xcml0ZShTeXN0ZW1VdGlscy5Ub0J5dGVBcnJheSh0ZW1wX3NieXRlQXJyYXkyKSwgMCwgdGVtcF9zYnl0ZUFycmF5Mi5sZW5ndGgpO1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0XHRcdGNhc2UgTU9ERV84QklUX0JZVEU6XG5cdFx0XHRcdFx0XHRcdFx0Ly9jYW52YXMucHJpbnRsbihcIk1vZGU6IDhiaXQgQnl0ZVwiKTtcblx0XHRcdFx0XHRcdFx0XHQvL3NieXRlW10gdGVtcF9zYnl0ZUFycmF5Mztcblx0XHRcdFx0XHRcdFx0XHR2YXIgdGVtcF9zYnl0ZUFycmF5MyA9IHRoaXMuZ2V0OGJpdEJ5dGVBcnJheShkYXRhTGVuZ3RoKTtcblx0XHRcdFx0XHRcdFx0XHRvdXRwdXQucHVzaCh0ZW1wX3NieXRlQXJyYXkzKTtcblx0XHRcdFx0XHRcdFx0XHQvL291dHB1dC5Xcml0ZShTeXN0ZW1VdGlscy5Ub0J5dGVBcnJheSh0ZW1wX3NieXRlQXJyYXkzKSwgMCwgdGVtcF9zYnl0ZUFycmF5My5sZW5ndGgpO1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0XHRcdGNhc2UgTU9ERV9LQU5KSTpcblx0XHRcdFx0XHRcdFx0XHQvL2NhbnZhcy5wcmludGxuKFwiTW9kZTogS2FuamlcIik7XG5cdFx0XHRcdFx0XHRcdFx0Ly9zYnl0ZVtdIHRlbXBfc2J5dGVBcnJheTQ7XG5cdFx0XHRcdFx0XHRcdFx0Ly90ZW1wX3NieXRlQXJyYXk0ID0gU3lzdGVtVXRpbHMuVG9TQnl0ZUFycmF5KFN5c3RlbVV0aWxzLlRvQnl0ZUFycmF5KGdldEthbmppU3RyaW5nKGRhdGFMZW5ndGgpKSk7XG5cdFx0XHRcdFx0XHRcdFx0Ly9vdXRwdXQuV3JpdGUoU3lzdGVtVXRpbHMuVG9CeXRlQXJyYXkodGVtcF9zYnl0ZUFycmF5NCksIDAsIHRlbXBfc2J5dGVBcnJheTQubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRlbXBfc3RyID0gdGhpcy5nZXRLYW5qaVN0cmluZyhkYXRhTGVuZ3RoKTtcblx0XHRcdFx0XHRcdFx0XHRvdXRwdXQucHVzaCh0ZW1wX3N0cik7XG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdC8vXG5cdFx0XHRcdFx0XHQvL2NhbnZhcy5wcmludGxuKFwiRGF0YUxlbmd0aDogXCIgKyBkYXRhTGVuZ3RoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0d2hpbGUgKHRydWUpO1xuXHRcdHJldHVybiBvdXRwdXQ7XG5cdH19KTtcbn1cblxubW9kdWxlLmV4cG9ydHM9UXJDb2RlO1xuIiwidmFyIFFSQ29kZVJlYWRlciA9IHJlcXVpcmUoJ3FyY29kZS1yZWFkZXInKTtcblxudmFyIHZpZGVvICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW1lcmEnKTtcbnZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncXItY2FudmFzJyk7XG52YXIgY3R4ICAgID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbi8vIFRlbXBvcmFyeSBoYWNrLCBzZXQgdG8gcm9vbWJhIGNvbXB1dGVyLlxuLy8gUm9ib3QgZG9lcyBub3QgaGF2ZSByb3Nzc2VydmVyLlxudmFyIHJvcyA9IG5ldyBST1NMSUIuUm9zKHtcbiAgICB1cmwgOiAnd3NzOi8vcm9vbWJhLmNzLndhc2hpbmd0b24uZWR1OjkwOTAnXG59KTtcblxucm9zLm9uKCdlcnJvcicsIGZ1bmN0aW9uKGVycikge1xuICAgIGNvbnNvbGUubG9nKGVycik7XG59KTtcblxucm9zLm9uKCdjb25uZWN0aW9uJywgZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ0Nvbm5lY3RlZCB0byB3ZWJzb2NrZXQgc2VydmVyLicpO1xufSk7XG5cbnZhciBxcl9jb2RlX3RvcGljID0gbmV3IFJPU0xJQi5Ub3BpYyh7XG4gICAgcm9zIDogcm9zLFxuICAgIG5hbWUgOiAnL2plZXZlc19xcl9jb2RlJyxcbiAgICBtZXNzYWdlVHlwZSA6ICdqZWV2ZXMvT3JkZXInXG59KTtcblxubmF2aWdhdG9yLmdldFVzZXJNZWRpYSA9IG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci5tc0dldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3Iub0dldFVzZXJNZWRpYTtcblxuaWYgKG5hdmlnYXRvci5nZXRVc2VyTWVkaWEpIHtcbiAgICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhKHt2aWRlbzogdHJ1ZX0sIGhhbmRsZVZpZGVvLCB2aWRlb0Vycm9yKTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlVmlkZW8oc3RyZWFtKSB7XG4gICAgdmlkZW8uc3JjID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwoc3RyZWFtKTtcbn1cblxuZnVuY3Rpb24gdmlkZW9FcnJvcihlKSB7XG4gICAgY29uc29sZS5sb2coZSk7XG59XG5cbnZhciByZWFkZXIgPSBuZXcgUVJDb2RlUmVhZGVyKCk7XG5yZWFkZXIuY2FsbGJhY2sgPSBmdW5jdGlvbiAocmVzKSB7XG4gIGlmICghcmVzLnN0YXJ0c1dpdGgoJ2Vycm9yJykpIHtcbiAgICBjb25zb2xlLmxvZyhyZXMpO1xuICAgIHZhciBkYXRhID0gcmVzLnNwbGl0KCcsJyk7XG4gICAgaWYgKGRhdGEubGVuZ3RoID09IDQpIHtcbiAgICAgICAgdmFyIG5hbWUgPSBkYXRhWzBdO1xuICAgICAgICB2YXIgcGhvbmUgPSBkYXRhWzFdO1xuICAgICAgICB2YXIgbG9jYXRpb24gPSBkYXRhWzJdO1xuICAgICAgICB2YXIgZm9vZFR5cGUgPSBkYXRhWzNdO1xuICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xuICAgICAgICBjb25zb2xlLmxvZyhuYW1lKTtcbiAgICAgICAgY29uc29sZS5sb2cobG9jYXRpb24pO1xuICAgICAgICBjb25zb2xlLmxvZyhmb29kVHlwZSk7XG4gICAgICAgIHZhciBvcmRlciA9IG5ldyBST1NMSUIuTWVzc2FnZSh7XG4gICAgICAgICAgICBuYW1lIDogbmFtZSxcbiAgICAgICAgICAgIHBob25lX251bWJlcjogcGhvbmUsXG4gICAgICAgICAgICBsb2NhdGlvbjogbG9jYXRpb24sXG4gICAgICAgICAgICBmb29kX3R5cGU6IGZvb2RUeXBlXG4gICAgICAgIH0pO1xuICAgICAgICBxcl9jb2RlX3RvcGljLnB1Ymxpc2gob3JkZXIpO1xuICAgICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gIH1cbn07XG5cbnZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ3BsYXknLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyICR0aGlzID0gdGhpczsgLy9jYWNoZVxuICAgIHdpZHRoID0gdmlkZW8uY2xpZW50V2lkdGg7XG4gICAgaGVpZ2h0ID0gdmlkZW8uY2xpZW50SGVpZ2h0O1xuICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgKGZ1bmN0aW9uIGxvb3AoKSB7XG4gICAgICAgIGlmICghJHRoaXMucGF1c2VkICYmICEkdGhpcy5lbmRlZCkge1xuICAgICAgICAgICAgY3R4LmRyYXdJbWFnZSgkdGhpcywgMCwgMCk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGxvb3AsIDEwMDAgLyAzMCk7IC8vIGRyYXdpbmcgYXQgMzBmcHNcbiAgICAgICAgICAgIHJlYWRlci5kZWNvZGUoKTtcbiAgICAgICAgfVxuICAgIH0pKCk7XG59LCAwKTtcblxuZnVuY3Rpb24gcXJfY2FsbGJhY2socmVzKSB7XG59XG4iXX0=
