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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcXJjb2RlLXJlYWRlci9kaXN0L2luZGV4LmpzIiwiL1VzZXJzL21rbWF0aHVyL0RvY3VtZW50cy9Db2RlL2plZXZlcy1yb2JvdC5naXRodWIuaW8vc2NyaXB0cy9RUmNhcHR1cmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcnRIQSxJQUFJLFlBQVksR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7O0FBRTVDLElBQUksS0FBSyxJQUFJLFFBQVEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDL0MsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNsRCxJQUFJLEdBQUcsTUFBTSxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVyQywwQ0FBMEM7QUFDMUMsa0NBQWtDO0FBQ2xDLElBQUksR0FBRyxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUNyQixHQUFHLEdBQUcscUNBQXFDO0FBQy9DLENBQUMsQ0FBQyxDQUFDOztBQUVILEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFNBQVMsR0FBRyxFQUFFO0lBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDckIsQ0FBQyxDQUFDLENBQUM7O0FBRUgsR0FBRyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsV0FBVztJQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7QUFDbEQsQ0FBQyxDQUFDLENBQUM7O0FBRUgsSUFBSSxhQUFhLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2pDLEdBQUcsR0FBRyxHQUFHO0lBQ1QsSUFBSSxHQUFHLGlCQUFpQjtJQUN4QixXQUFXLEdBQUcsY0FBYztBQUNoQyxDQUFDLENBQUMsQ0FBQzs7QUFFSCxTQUFTLENBQUMsWUFBWSxHQUFHLFNBQVMsQ0FBQyxZQUFZLElBQUksU0FBUyxDQUFDLGtCQUFrQixJQUFJLFNBQVMsQ0FBQyxlQUFlLElBQUksU0FBUyxDQUFDLGNBQWMsSUFBSSxTQUFTLENBQUMsYUFBYSxDQUFDOztBQUVwSyxJQUFJLFNBQVMsQ0FBQyxZQUFZLEVBQUU7SUFDeEIsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDbkUsQ0FBQzs7QUFFRCxTQUFTLFdBQVcsQ0FBQyxNQUFNLEVBQUU7SUFDekIsS0FBSyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNuRCxDQUFDOztBQUVELFNBQVMsVUFBVSxDQUFDLENBQUMsRUFBRTtJQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25CLENBQUM7O0FBRUQsSUFBSSxNQUFNLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztBQUNoQyxNQUFNLENBQUMsUUFBUSxHQUFHLFVBQVUsR0FBRyxFQUFFO0VBQy9CLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFO0lBQzVCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDakIsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMxQixJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1FBQ2xCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0QixPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RCLElBQUksS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQztZQUMzQixJQUFJLEdBQUcsSUFBSTtZQUNYLFlBQVksRUFBRSxLQUFLO1lBQ25CLFFBQVEsRUFBRSxRQUFRO1lBQ2xCLFNBQVMsRUFBRSxRQUFRO1NBQ3RCLENBQUMsQ0FBQztRQUNILGFBQWEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDOUI7R0FDSjtPQUNJO0lBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUNsQjtBQUNILENBQUMsQ0FBQzs7QUFFRixLQUFLLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLFlBQVk7SUFDdkMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQ2pCLEtBQUssR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO0lBQzFCLE1BQU0sR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFDO0lBQzVCLE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3JCLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3ZCLENBQUMsU0FBUyxJQUFJLEdBQUc7UUFDYixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUU7WUFDL0IsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNCLFVBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUNuQjtLQUNKLEdBQUcsQ0FBQztBQUNULENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFFTixTQUFTLFdBQVcsQ0FBQyxHQUFHLEVBQUU7Q0FDekIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcbiAgUG9ydGVkIHRvIEphdmFTY3JpcHQgYnkgTGF6YXIgTGFzemxvIDIwMTFcblxuICBsYXphcnNvZnRAZ21haWwuY29tLCB3d3cubGF6YXJzb2Z0LmluZm9cblxuKi9cblxuLypcbipcbiogQ29weXJpZ2h0IDIwMDcgWlhpbmcgYXV0aG9yc1xuKlxuKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4qIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuKlxuKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuKlxuKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4qIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4qIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5cbnZhciBHcmlkU2FtcGxlciA9IHt9O1xuXG5HcmlkU2FtcGxlci5jaGVja0FuZE51ZGdlUG9pbnRzPWZ1bmN0aW9uKCBpbWFnZSwgIHBvaW50cylcblx0XHR7XG5cdFx0XHR2YXIgd2lkdGggPSBpbWFnZS53aWR0aDtcblx0XHRcdHZhciBoZWlnaHQgPSBpbWFnZS5oZWlnaHQ7XG5cdFx0XHQvLyBDaGVjayBhbmQgbnVkZ2UgcG9pbnRzIGZyb20gc3RhcnQgdW50aWwgd2Ugc2VlIHNvbWUgdGhhdCBhcmUgT0s6XG5cdFx0XHR2YXIgbnVkZ2VkID0gdHJ1ZTtcblx0XHRcdGZvciAodmFyIG9mZnNldCA9IDA7IG9mZnNldCA8IHBvaW50cy5sZW5ndGggJiYgbnVkZ2VkOyBvZmZzZXQgKz0gMilcblx0XHRcdHtcblx0XHRcdFx0dmFyIHggPSBNYXRoLmZsb29yIChwb2ludHNbb2Zmc2V0XSk7XG5cdFx0XHRcdHZhciB5ID0gTWF0aC5mbG9vciggcG9pbnRzW29mZnNldCArIDFdKTtcblx0XHRcdFx0aWYgKHggPCAtIDEgfHwgeCA+IHdpZHRoIHx8IHkgPCAtIDEgfHwgeSA+IGhlaWdodClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRocm93IFwiRXJyb3IuY2hlY2tBbmROdWRnZVBvaW50cyBcIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRudWRnZWQgPSBmYWxzZTtcblx0XHRcdFx0aWYgKHggPT0gLSAxKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cG9pbnRzW29mZnNldF0gPSAwLjA7XG5cdFx0XHRcdFx0bnVkZ2VkID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmICh4ID09IHdpZHRoKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cG9pbnRzW29mZnNldF0gPSB3aWR0aCAtIDE7XG5cdFx0XHRcdFx0bnVkZ2VkID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoeSA9PSAtIDEpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRwb2ludHNbb2Zmc2V0ICsgMV0gPSAwLjA7XG5cdFx0XHRcdFx0bnVkZ2VkID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmICh5ID09IGhlaWdodClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHBvaW50c1tvZmZzZXQgKyAxXSA9IGhlaWdodCAtIDE7XG5cdFx0XHRcdFx0bnVkZ2VkID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gQ2hlY2sgYW5kIG51ZGdlIHBvaW50cyBmcm9tIGVuZDpcblx0XHRcdG51ZGdlZCA9IHRydWU7XG5cdFx0XHRmb3IgKHZhciBvZmZzZXQgPSBwb2ludHMubGVuZ3RoIC0gMjsgb2Zmc2V0ID49IDAgJiYgbnVkZ2VkOyBvZmZzZXQgLT0gMilcblx0XHRcdHtcblx0XHRcdFx0dmFyIHggPSBNYXRoLmZsb29yKCBwb2ludHNbb2Zmc2V0XSk7XG5cdFx0XHRcdHZhciB5ID0gTWF0aC5mbG9vciggcG9pbnRzW29mZnNldCArIDFdKTtcblx0XHRcdFx0aWYgKHggPCAtIDEgfHwgeCA+IHdpZHRoIHx8IHkgPCAtIDEgfHwgeSA+IGhlaWdodClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRocm93IFwiRXJyb3IuY2hlY2tBbmROdWRnZVBvaW50cyBcIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRudWRnZWQgPSBmYWxzZTtcblx0XHRcdFx0aWYgKHggPT0gLSAxKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cG9pbnRzW29mZnNldF0gPSAwLjA7XG5cdFx0XHRcdFx0bnVkZ2VkID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmICh4ID09IHdpZHRoKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cG9pbnRzW29mZnNldF0gPSB3aWR0aCAtIDE7XG5cdFx0XHRcdFx0bnVkZ2VkID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoeSA9PSAtIDEpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRwb2ludHNbb2Zmc2V0ICsgMV0gPSAwLjA7XG5cdFx0XHRcdFx0bnVkZ2VkID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmICh5ID09IGhlaWdodClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHBvaW50c1tvZmZzZXQgKyAxXSA9IGhlaWdodCAtIDE7XG5cdFx0XHRcdFx0bnVkZ2VkID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXG5cbkdyaWRTYW1wbGVyLnNhbXBsZUdyaWQzPWZ1bmN0aW9uKCBpbWFnZSwgIGRpbWVuc2lvbiwgIHRyYW5zZm9ybSlcblx0XHR7XG5cdFx0XHR2YXIgYml0cyA9IG5ldyBCaXRNYXRyaXgoZGltZW5zaW9uKTtcblx0XHRcdHZhciBwb2ludHMgPSBuZXcgQXJyYXkoZGltZW5zaW9uIDw8IDEpO1xuXHRcdFx0Zm9yICh2YXIgeSA9IDA7IHkgPCBkaW1lbnNpb247IHkrKylcblx0XHRcdHtcblx0XHRcdFx0dmFyIG1heCA9IHBvaW50cy5sZW5ndGg7XG5cdFx0XHRcdHZhciBpVmFsdWUgPSAgeSArIDAuNTtcblx0XHRcdFx0Zm9yICh2YXIgeCA9IDA7IHggPCBtYXg7IHggKz0gMilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHBvaW50c1t4XSA9ICAoeCA+PiAxKSArIDAuNTtcblx0XHRcdFx0XHRwb2ludHNbeCArIDFdID0gaVZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRyYW5zZm9ybS50cmFuc2Zvcm1Qb2ludHMxKHBvaW50cyk7XG5cdFx0XHRcdC8vIFF1aWNrIGNoZWNrIHRvIHNlZSBpZiBwb2ludHMgdHJhbnNmb3JtZWQgdG8gc29tZXRoaW5nIGluc2lkZSB0aGUgaW1hZ2U7XG5cdFx0XHRcdC8vIHN1ZmZpY2llbnQgdG8gY2hlY2sgdGhlIGVuZHBvaW50c1xuXHRcdFx0XHRHcmlkU2FtcGxlci5jaGVja0FuZE51ZGdlUG9pbnRzKGltYWdlLCBwb2ludHMpO1xuXHRcdFx0XHR0cnlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGZvciAodmFyIHggPSAwOyB4IDwgbWF4OyB4ICs9IDIpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dmFyIHhwb2ludCA9IChNYXRoLmZsb29yKCBwb2ludHNbeF0pICogNCkgKyAoTWF0aC5mbG9vciggcG9pbnRzW3ggKyAxXSkgKiBpbWFnZS53aWR0aCAqIDQpO1xuXHRcdFx0XHRcdFx0dmFyIGJpdCA9IGltYWdlLmRhdGFbTWF0aC5mbG9vciggcG9pbnRzW3hdKSsgaW1hZ2Uud2lkdGgqIE1hdGguZmxvb3IoIHBvaW50c1t4ICsgMV0pXTtcblx0XHRcdFx0XHRcdC8vYml0c1t4ID4+IDFdWyB5XT1iaXQ7XG5cdFx0XHRcdFx0XHRpZihiaXQpXG5cdFx0XHRcdFx0XHRcdGJpdHMuc2V0X1JlbmFtZWQoeCA+PiAxLCB5KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2F0Y2ggKCBhaW9vYmUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBUaGlzIGZlZWxzIHdyb25nLCBidXQsIHNvbWV0aW1lcyBpZiB0aGUgZmluZGVyIHBhdHRlcm5zIGFyZSBtaXNpZGVudGlmaWVkLCB0aGUgcmVzdWx0aW5nXG5cdFx0XHRcdFx0Ly8gdHJhbnNmb3JtIGdldHMgXCJ0d2lzdGVkXCIgc3VjaCB0aGF0IGl0IG1hcHMgYSBzdHJhaWdodCBsaW5lIG9mIHBvaW50cyB0byBhIHNldCBvZiBwb2ludHNcblx0XHRcdFx0XHQvLyB3aG9zZSBlbmRwb2ludHMgYXJlIGluIGJvdW5kcywgYnV0IG90aGVycyBhcmUgbm90LiBUaGVyZSBpcyBwcm9iYWJseSBzb21lIG1hdGhlbWF0aWNhbFxuXHRcdFx0XHRcdC8vIHdheSB0byBkZXRlY3QgdGhpcyBhYm91dCB0aGUgdHJhbnNmb3JtYXRpb24gdGhhdCBJIGRvbid0IGtub3cgeWV0LlxuXHRcdFx0XHRcdC8vIFRoaXMgcmVzdWx0cyBpbiBhbiB1Z2x5IHJ1bnRpbWUgZXhjZXB0aW9uIGRlc3BpdGUgb3VyIGNsZXZlciBjaGVja3MgYWJvdmUgLS0gY2FuJ3QgaGF2ZVxuXHRcdFx0XHRcdC8vIHRoYXQuIFdlIGNvdWxkIGNoZWNrIGVhY2ggcG9pbnQncyBjb29yZGluYXRlcyBidXQgdGhhdCBmZWVscyBkdXBsaWNhdGl2ZS4gV2Ugc2V0dGxlIGZvclxuXHRcdFx0XHRcdC8vIGNhdGNoaW5nIGFuZCB3cmFwcGluZyBBcnJheUluZGV4T3V0T2ZCb3VuZHNFeGNlcHRpb24uXG5cdFx0XHRcdFx0dGhyb3cgXCJFcnJvci5jaGVja0FuZE51ZGdlUG9pbnRzXCI7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBiaXRzO1xuXHRcdH1cblxuLypcbiAgUG9ydGVkIHRvIEphdmFTY3JpcHQgYnkgTGF6YXIgTGFzemxvIDIwMTFcblxuICBsYXphcnNvZnRAZ21haWwuY29tLCB3d3cubGF6YXJzb2Z0LmluZm9cblxuKi9cblxuLypcbipcbiogQ29weXJpZ2h0IDIwMDcgWlhpbmcgYXV0aG9yc1xuKlxuKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4qIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuKlxuKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuKlxuKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4qIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4qIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5cblxuZnVuY3Rpb24gRUNCKGNvdW50LCAgZGF0YUNvZGV3b3Jkcylcbntcblx0dGhpcy5jb3VudCA9IGNvdW50O1xuXHR0aGlzLmRhdGFDb2Rld29yZHMgPSBkYXRhQ29kZXdvcmRzO1xuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiQ291bnRcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiB0aGlzLmNvdW50O1xuXHR9fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiRGF0YUNvZGV3b3Jkc1wiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuZGF0YUNvZGV3b3Jkcztcblx0fX0pO1xufVxuXG5mdW5jdGlvbiBFQ0Jsb2NrcyggZWNDb2Rld29yZHNQZXJCbG9jaywgIGVjQmxvY2tzMSwgIGVjQmxvY2tzMilcbntcblx0dGhpcy5lY0NvZGV3b3Jkc1BlckJsb2NrID0gZWNDb2Rld29yZHNQZXJCbG9jaztcblx0aWYoZWNCbG9ja3MyKVxuXHRcdHRoaXMuZWNCbG9ja3MgPSBuZXcgQXJyYXkoZWNCbG9ja3MxLCBlY0Jsb2NrczIpO1xuXHRlbHNlXG5cdFx0dGhpcy5lY0Jsb2NrcyA9IG5ldyBBcnJheShlY0Jsb2NrczEpO1xuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiRUNDb2Rld29yZHNQZXJCbG9ja1wiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuZWNDb2Rld29yZHNQZXJCbG9jaztcblx0fX0pO1xuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiVG90YWxFQ0NvZGV3b3Jkc1wiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuICB0aGlzLmVjQ29kZXdvcmRzUGVyQmxvY2sgKiB0aGlzLk51bUJsb2Nrcztcblx0fX0pO1xuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiTnVtQmxvY2tzXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHR2YXIgdG90YWwgPSAwO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lY0Jsb2Nrcy5sZW5ndGg7IGkrKylcblx0XHR7XG5cdFx0XHR0b3RhbCArPSB0aGlzLmVjQmxvY2tzW2ldLmxlbmd0aDtcblx0XHR9XG5cdFx0cmV0dXJuIHRvdGFsO1xuXHR9fSk7XG5cblx0dGhpcy5nZXRFQ0Jsb2Nrcz1mdW5jdGlvbigpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB0aGlzLmVjQmxvY2tzO1xuXHRcdFx0fVxufVxuXG5mdW5jdGlvbiBWZXJzaW9uKCB2ZXJzaW9uTnVtYmVyLCAgYWxpZ25tZW50UGF0dGVybkNlbnRlcnMsICBlY0Jsb2NrczEsICBlY0Jsb2NrczIsICBlY0Jsb2NrczMsICBlY0Jsb2NrczQpXG57XG5cdHRoaXMudmVyc2lvbk51bWJlciA9IHZlcnNpb25OdW1iZXI7XG5cdHRoaXMuYWxpZ25tZW50UGF0dGVybkNlbnRlcnMgPSBhbGlnbm1lbnRQYXR0ZXJuQ2VudGVycztcblx0dGhpcy5lY0Jsb2NrcyA9IG5ldyBBcnJheShlY0Jsb2NrczEsIGVjQmxvY2tzMiwgZWNCbG9ja3MzLCBlY0Jsb2NrczQpO1xuXG5cdHZhciB0b3RhbCA9IDA7XG5cdHZhciBlY0NvZGV3b3JkcyA9IGVjQmxvY2tzMS5FQ0NvZGV3b3Jkc1BlckJsb2NrO1xuXHR2YXIgZWNiQXJyYXkgPSBlY0Jsb2NrczEuZ2V0RUNCbG9ja3MoKTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBlY2JBcnJheS5sZW5ndGg7IGkrKylcblx0e1xuXHRcdHZhciBlY0Jsb2NrID0gZWNiQXJyYXlbaV07XG5cdFx0dG90YWwgKz0gZWNCbG9jay5Db3VudCAqIChlY0Jsb2NrLkRhdGFDb2Rld29yZHMgKyBlY0NvZGV3b3Jkcyk7XG5cdH1cblx0dGhpcy50b3RhbENvZGV3b3JkcyA9IHRvdGFsO1xuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiVmVyc2lvbk51bWJlclwiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuICB0aGlzLnZlcnNpb25OdW1iZXI7XG5cdH19KTtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIkFsaWdubWVudFBhdHRlcm5DZW50ZXJzXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gIHRoaXMuYWxpZ25tZW50UGF0dGVybkNlbnRlcnM7XG5cdH19KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJUb3RhbENvZGV3b3Jkc1wiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuICB0aGlzLnRvdGFsQ29kZXdvcmRzO1xuXHR9fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiRGltZW5zaW9uRm9yVmVyc2lvblwiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuICAxNyArIDQgKiB0aGlzLnZlcnNpb25OdW1iZXI7XG5cdH19KTtcblxuXHR0aGlzLmJ1aWxkRnVuY3Rpb25QYXR0ZXJuPWZ1bmN0aW9uKClcblx0XHR7XG5cdFx0XHR2YXIgZGltZW5zaW9uID0gdGhpcy5EaW1lbnNpb25Gb3JWZXJzaW9uO1xuXHRcdFx0dmFyIGJpdE1hdHJpeCA9IG5ldyBCaXRNYXRyaXgoZGltZW5zaW9uKTtcblxuXHRcdFx0Ly8gVG9wIGxlZnQgZmluZGVyIHBhdHRlcm4gKyBzZXBhcmF0b3IgKyBmb3JtYXRcblx0XHRcdGJpdE1hdHJpeC5zZXRSZWdpb24oMCwgMCwgOSwgOSk7XG5cdFx0XHQvLyBUb3AgcmlnaHQgZmluZGVyIHBhdHRlcm4gKyBzZXBhcmF0b3IgKyBmb3JtYXRcblx0XHRcdGJpdE1hdHJpeC5zZXRSZWdpb24oZGltZW5zaW9uIC0gOCwgMCwgOCwgOSk7XG5cdFx0XHQvLyBCb3R0b20gbGVmdCBmaW5kZXIgcGF0dGVybiArIHNlcGFyYXRvciArIGZvcm1hdFxuXHRcdFx0Yml0TWF0cml4LnNldFJlZ2lvbigwLCBkaW1lbnNpb24gLSA4LCA5LCA4KTtcblxuXHRcdFx0Ly8gQWxpZ25tZW50IHBhdHRlcm5zXG5cdFx0XHR2YXIgbWF4ID0gdGhpcy5hbGlnbm1lbnRQYXR0ZXJuQ2VudGVycy5sZW5ndGg7XG5cdFx0XHRmb3IgKHZhciB4ID0gMDsgeCA8IG1heDsgeCsrKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgaSA9IHRoaXMuYWxpZ25tZW50UGF0dGVybkNlbnRlcnNbeF0gLSAyO1xuXHRcdFx0XHRmb3IgKHZhciB5ID0gMDsgeSA8IG1heDsgeSsrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKCh4ID09IDAgJiYgKHkgPT0gMCB8fCB5ID09IG1heCAtIDEpKSB8fCAoeCA9PSBtYXggLSAxICYmIHkgPT0gMCkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly8gTm8gYWxpZ25tZW50IHBhdHRlcm5zIG5lYXIgdGhlIHRocmVlIGZpbmRlciBwYXRlcm5zXG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Yml0TWF0cml4LnNldFJlZ2lvbih0aGlzLmFsaWdubWVudFBhdHRlcm5DZW50ZXJzW3ldIC0gMiwgaSwgNSwgNSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gVmVydGljYWwgdGltaW5nIHBhdHRlcm5cblx0XHRcdGJpdE1hdHJpeC5zZXRSZWdpb24oNiwgOSwgMSwgZGltZW5zaW9uIC0gMTcpO1xuXHRcdFx0Ly8gSG9yaXpvbnRhbCB0aW1pbmcgcGF0dGVyblxuXHRcdFx0Yml0TWF0cml4LnNldFJlZ2lvbig5LCA2LCBkaW1lbnNpb24gLSAxNywgMSk7XG5cblx0XHRcdGlmICh0aGlzLnZlcnNpb25OdW1iZXIgPiA2KVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBWZXJzaW9uIGluZm8sIHRvcCByaWdodFxuXHRcdFx0XHRiaXRNYXRyaXguc2V0UmVnaW9uKGRpbWVuc2lvbiAtIDExLCAwLCAzLCA2KTtcblx0XHRcdFx0Ly8gVmVyc2lvbiBpbmZvLCBib3R0b20gbGVmdFxuXHRcdFx0XHRiaXRNYXRyaXguc2V0UmVnaW9uKDAsIGRpbWVuc2lvbiAtIDExLCA2LCAzKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGJpdE1hdHJpeDtcblx0XHR9XG5cdHRoaXMuZ2V0RUNCbG9ja3NGb3JMZXZlbD1mdW5jdGlvbiggZWNMZXZlbClcblx0e1xuXHRcdHJldHVybiB0aGlzLmVjQmxvY2tzW2VjTGV2ZWwub3JkaW5hbCgpXTtcblx0fVxufVxuXG5WZXJzaW9uLlZFUlNJT05fREVDT0RFX0lORk8gPSBuZXcgQXJyYXkoMHgwN0M5NCwgMHgwODVCQywgMHgwOUE5OSwgMHgwQTREMywgMHgwQkJGNiwgMHgwQzc2MiwgMHgwRDg0NywgMHgwRTYwRCwgMHgwRjkyOCwgMHgxMEI3OCwgMHgxMTQ1RCwgMHgxMkExNywgMHgxMzUzMiwgMHgxNDlBNiwgMHgxNTY4MywgMHgxNjhDOSwgMHgxNzdFQywgMHgxOEVDNCwgMHgxOTFFMSwgMHgxQUZBQiwgMHgxQjA4RSwgMHgxQ0MxQSwgMHgxRDMzRiwgMHgxRUQ3NSwgMHgxRjI1MCwgMHgyMDlENSwgMHgyMTZGMCwgMHgyMjhCQSwgMHgyMzc5RiwgMHgyNEIwQiwgMHgyNTQyRSwgMHgyNkE2NCwgMHgyNzU0MSwgMHgyOEM2OSk7XG5cblZlcnNpb24uVkVSU0lPTlMgPSBidWlsZFZlcnNpb25zKCk7XG5cblZlcnNpb24uZ2V0VmVyc2lvbkZvck51bWJlcj1mdW5jdGlvbiggdmVyc2lvbk51bWJlcilcbntcblx0aWYgKHZlcnNpb25OdW1iZXIgPCAxIHx8IHZlcnNpb25OdW1iZXIgPiA0MClcblx0e1xuXHRcdHRocm93IFwiQXJndW1lbnRFeGNlcHRpb25cIjtcblx0fVxuXHRyZXR1cm4gVmVyc2lvbi5WRVJTSU9OU1t2ZXJzaW9uTnVtYmVyIC0gMV07XG59XG5cblZlcnNpb24uZ2V0UHJvdmlzaW9uYWxWZXJzaW9uRm9yRGltZW5zaW9uPWZ1bmN0aW9uKGRpbWVuc2lvbilcbntcblx0aWYgKGRpbWVuc2lvbiAlIDQgIT0gMSlcblx0e1xuXHRcdHRocm93IFwiRXJyb3IgZ2V0UHJvdmlzaW9uYWxWZXJzaW9uRm9yRGltZW5zaW9uXCI7XG5cdH1cblx0dHJ5XG5cdHtcblx0XHRyZXR1cm4gVmVyc2lvbi5nZXRWZXJzaW9uRm9yTnVtYmVyKChkaW1lbnNpb24gLSAxNykgPj4gMik7XG5cdH1cblx0Y2F0Y2ggKCBpYWUpXG5cdHtcblx0XHR0aHJvdyBcIkVycm9yIGdldFZlcnNpb25Gb3JOdW1iZXJcIjtcblx0fVxufVxuXG5WZXJzaW9uLmRlY29kZVZlcnNpb25JbmZvcm1hdGlvbj1mdW5jdGlvbiggdmVyc2lvbkJpdHMpXG57XG5cdHZhciBiZXN0RGlmZmVyZW5jZSA9IDB4ZmZmZmZmZmY7XG5cdHZhciBiZXN0VmVyc2lvbiA9IDA7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgVmVyc2lvbi5WRVJTSU9OX0RFQ09ERV9JTkZPLmxlbmd0aDsgaSsrKVxuXHR7XG5cdFx0dmFyIHRhcmdldFZlcnNpb24gPSBWZXJzaW9uLlZFUlNJT05fREVDT0RFX0lORk9baV07XG5cdFx0Ly8gRG8gdGhlIHZlcnNpb24gaW5mbyBiaXRzIG1hdGNoIGV4YWN0bHk/IGRvbmUuXG5cdFx0aWYgKHRhcmdldFZlcnNpb24gPT0gdmVyc2lvbkJpdHMpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0VmVyc2lvbkZvck51bWJlcihpICsgNyk7XG5cdFx0fVxuXHRcdC8vIE90aGVyd2lzZSBzZWUgaWYgdGhpcyBpcyB0aGUgY2xvc2VzdCB0byBhIHJlYWwgdmVyc2lvbiBpbmZvIGJpdCBzdHJpbmdcblx0XHQvLyB3ZSBoYXZlIHNlZW4gc28gZmFyXG5cdFx0dmFyIGJpdHNEaWZmZXJlbmNlID0gRm9ybWF0SW5mb3JtYXRpb24ubnVtQml0c0RpZmZlcmluZyh2ZXJzaW9uQml0cywgdGFyZ2V0VmVyc2lvbik7XG5cdFx0aWYgKGJpdHNEaWZmZXJlbmNlIDwgYmVzdERpZmZlcmVuY2UpXG5cdFx0e1xuXHRcdFx0YmVzdFZlcnNpb24gPSBpICsgNztcblx0XHRcdGJlc3REaWZmZXJlbmNlID0gYml0c0RpZmZlcmVuY2U7XG5cdFx0fVxuXHR9XG5cdC8vIFdlIGNhbiB0b2xlcmF0ZSB1cCB0byAzIGJpdHMgb2YgZXJyb3Igc2luY2Ugbm8gdHdvIHZlcnNpb24gaW5mbyBjb2Rld29yZHMgd2lsbFxuXHQvLyBkaWZmZXIgaW4gbGVzcyB0aGFuIDQgYml0cy5cblx0aWYgKGJlc3REaWZmZXJlbmNlIDw9IDMpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5nZXRWZXJzaW9uRm9yTnVtYmVyKGJlc3RWZXJzaW9uKTtcblx0fVxuXHQvLyBJZiB3ZSBkaWRuJ3QgZmluZCBhIGNsb3NlIGVub3VnaCBtYXRjaCwgZmFpbFxuXHRyZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gYnVpbGRWZXJzaW9ucygpXG57XG5cdHJldHVybiBuZXcgQXJyYXkobmV3IFZlcnNpb24oMSwgbmV3IEFycmF5KCksIG5ldyBFQ0Jsb2Nrcyg3LCBuZXcgRUNCKDEsIDE5KSksIG5ldyBFQ0Jsb2NrcygxMCwgbmV3IEVDQigxLCAxNikpLCBuZXcgRUNCbG9ja3MoMTMsIG5ldyBFQ0IoMSwgMTMpKSwgbmV3IEVDQmxvY2tzKDE3LCBuZXcgRUNCKDEsIDkpKSksXG5cdG5ldyBWZXJzaW9uKDIsIG5ldyBBcnJheSg2LCAxOCksIG5ldyBFQ0Jsb2NrcygxMCwgbmV3IEVDQigxLCAzNCkpLCBuZXcgRUNCbG9ja3MoMTYsIG5ldyBFQ0IoMSwgMjgpKSwgbmV3IEVDQmxvY2tzKDIyLCBuZXcgRUNCKDEsIDIyKSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigxLCAxNikpKSxcblx0bmV3IFZlcnNpb24oMywgbmV3IEFycmF5KDYsIDIyKSwgbmV3IEVDQmxvY2tzKDE1LCBuZXcgRUNCKDEsIDU1KSksIG5ldyBFQ0Jsb2NrcygyNiwgbmV3IEVDQigxLCA0NCkpLCBuZXcgRUNCbG9ja3MoMTgsIG5ldyBFQ0IoMiwgMTcpKSwgbmV3IEVDQmxvY2tzKDIyLCBuZXcgRUNCKDIsIDEzKSkpLFxuXHRuZXcgVmVyc2lvbig0LCBuZXcgQXJyYXkoNiwgMjYpLCBuZXcgRUNCbG9ja3MoMjAsIG5ldyBFQ0IoMSwgODApKSwgbmV3IEVDQmxvY2tzKDE4LCBuZXcgRUNCKDIsIDMyKSksIG5ldyBFQ0Jsb2NrcygyNiwgbmV3IEVDQigyLCAyNCkpLCBuZXcgRUNCbG9ja3MoMTYsIG5ldyBFQ0IoNCwgOSkpKSxcblx0bmV3IFZlcnNpb24oNSwgbmV3IEFycmF5KDYsIDMwKSwgbmV3IEVDQmxvY2tzKDI2LCBuZXcgRUNCKDEsIDEwOCkpLCBuZXcgRUNCbG9ja3MoMjQsIG5ldyBFQ0IoMiwgNDMpKSwgbmV3IEVDQmxvY2tzKDE4LCBuZXcgRUNCKDIsIDE1KSwgbmV3IEVDQigyLCAxNikpLCBuZXcgRUNCbG9ja3MoMjIsIG5ldyBFQ0IoMiwgMTEpLCBuZXcgRUNCKDIsIDEyKSkpLFxuXHRuZXcgVmVyc2lvbig2LCBuZXcgQXJyYXkoNiwgMzQpLCBuZXcgRUNCbG9ja3MoMTgsIG5ldyBFQ0IoMiwgNjgpKSwgbmV3IEVDQmxvY2tzKDE2LCBuZXcgRUNCKDQsIDI3KSksIG5ldyBFQ0Jsb2NrcygyNCwgbmV3IEVDQig0LCAxOSkpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoNCwgMTUpKSksXG5cdG5ldyBWZXJzaW9uKDcsIG5ldyBBcnJheSg2LCAyMiwgMzgpLCBuZXcgRUNCbG9ja3MoMjAsIG5ldyBFQ0IoMiwgNzgpKSwgbmV3IEVDQmxvY2tzKDE4LCBuZXcgRUNCKDQsIDMxKSksIG5ldyBFQ0Jsb2NrcygxOCwgbmV3IEVDQigyLCAxNCksIG5ldyBFQ0IoNCwgMTUpKSwgbmV3IEVDQmxvY2tzKDI2LCBuZXcgRUNCKDQsIDEzKSwgbmV3IEVDQigxLCAxNCkpKSxcblx0bmV3IFZlcnNpb24oOCwgbmV3IEFycmF5KDYsIDI0LCA0MiksIG5ldyBFQ0Jsb2NrcygyNCwgbmV3IEVDQigyLCA5NykpLCBuZXcgRUNCbG9ja3MoMjIsIG5ldyBFQ0IoMiwgMzgpLCBuZXcgRUNCKDIsIDM5KSksIG5ldyBFQ0Jsb2NrcygyMiwgbmV3IEVDQig0LCAxOCksIG5ldyBFQ0IoMiwgMTkpKSwgbmV3IEVDQmxvY2tzKDI2LCBuZXcgRUNCKDQsIDE0KSwgbmV3IEVDQigyLCAxNSkpKSxcblx0bmV3IFZlcnNpb24oOSwgbmV3IEFycmF5KDYsIDI2LCA0NiksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigyLCAxMTYpKSwgbmV3IEVDQmxvY2tzKDIyLCBuZXcgRUNCKDMsIDM2KSwgbmV3IEVDQigyLCAzNykpLCBuZXcgRUNCbG9ja3MoMjAsIG5ldyBFQ0IoNCwgMTYpLCBuZXcgRUNCKDQsIDE3KSksIG5ldyBFQ0Jsb2NrcygyNCwgbmV3IEVDQig0LCAxMiksIG5ldyBFQ0IoNCwgMTMpKSksXG5cdG5ldyBWZXJzaW9uKDEwLCBuZXcgQXJyYXkoNiwgMjgsIDUwKSwgbmV3IEVDQmxvY2tzKDE4LCBuZXcgRUNCKDIsIDY4KSwgbmV3IEVDQigyLCA2OSkpLCBuZXcgRUNCbG9ja3MoMjYsIG5ldyBFQ0IoNCwgNDMpLCBuZXcgRUNCKDEsIDQ0KSksIG5ldyBFQ0Jsb2NrcygyNCwgbmV3IEVDQig2LCAxOSksIG5ldyBFQ0IoMiwgMjApKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDYsIDE1KSwgbmV3IEVDQigyLCAxNikpKSxcblx0bmV3IFZlcnNpb24oMTEsIG5ldyBBcnJheSg2LCAzMCwgNTQpLCBuZXcgRUNCbG9ja3MoMjAsIG5ldyBFQ0IoNCwgODEpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDEsIDUwKSwgbmV3IEVDQig0LCA1MSkpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoNCwgMjIpLCBuZXcgRUNCKDQsIDIzKSksIG5ldyBFQ0Jsb2NrcygyNCwgbmV3IEVDQigzLCAxMiksIG5ldyBFQ0IoOCwgMTMpKSksXG5cdG5ldyBWZXJzaW9uKDEyLCBuZXcgQXJyYXkoNiwgMzIsIDU4KSwgbmV3IEVDQmxvY2tzKDI0LCBuZXcgRUNCKDIsIDkyKSwgbmV3IEVDQigyLCA5MykpLCBuZXcgRUNCbG9ja3MoMjIsIG5ldyBFQ0IoNiwgMzYpLCBuZXcgRUNCKDIsIDM3KSksIG5ldyBFQ0Jsb2NrcygyNiwgbmV3IEVDQig0LCAyMCksIG5ldyBFQ0IoNiwgMjEpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDcsIDE0KSwgbmV3IEVDQig0LCAxNSkpKSxcblx0bmV3IFZlcnNpb24oMTMsIG5ldyBBcnJheSg2LCAzNCwgNjIpLCBuZXcgRUNCbG9ja3MoMjYsIG5ldyBFQ0IoNCwgMTA3KSksIG5ldyBFQ0Jsb2NrcygyMiwgbmV3IEVDQig4LCAzNyksIG5ldyBFQ0IoMSwgMzgpKSwgbmV3IEVDQmxvY2tzKDI0LCBuZXcgRUNCKDgsIDIwKSwgbmV3IEVDQig0LCAyMSkpLCBuZXcgRUNCbG9ja3MoMjIsIG5ldyBFQ0IoMTIsIDExKSwgbmV3IEVDQig0LCAxMikpKSxcblx0bmV3IFZlcnNpb24oMTQsIG5ldyBBcnJheSg2LCAyNiwgNDYsIDY2KSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDMsIDExNSksIG5ldyBFQ0IoMSwgMTE2KSksIG5ldyBFQ0Jsb2NrcygyNCwgbmV3IEVDQig0LCA0MCksIG5ldyBFQ0IoNSwgNDEpKSwgbmV3IEVDQmxvY2tzKDIwLCBuZXcgRUNCKDExLCAxNiksIG5ldyBFQ0IoNSwgMTcpKSwgbmV3IEVDQmxvY2tzKDI0LCBuZXcgRUNCKDExLCAxMiksIG5ldyBFQ0IoNSwgMTMpKSksXG5cdG5ldyBWZXJzaW9uKDE1LCBuZXcgQXJyYXkoNiwgMjYsIDQ4LCA3MCksIG5ldyBFQ0Jsb2NrcygyMiwgbmV3IEVDQig1LCA4NyksIG5ldyBFQ0IoMSwgODgpKSwgbmV3IEVDQmxvY2tzKDI0LCBuZXcgRUNCKDUsIDQxKSwgbmV3IEVDQig1LCA0MikpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoNSwgMjQpLCBuZXcgRUNCKDcsIDI1KSksIG5ldyBFQ0Jsb2NrcygyNCwgbmV3IEVDQigxMSwgMTIpLCBuZXcgRUNCKDcsIDEzKSkpLFxuXHRuZXcgVmVyc2lvbigxNiwgbmV3IEFycmF5KDYsIDI2LCA1MCwgNzQpLCBuZXcgRUNCbG9ja3MoMjQsIG5ldyBFQ0IoNSwgOTgpLCBuZXcgRUNCKDEsIDk5KSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQig3LCA0NSksIG5ldyBFQ0IoMywgNDYpKSwgbmV3IEVDQmxvY2tzKDI0LCBuZXcgRUNCKDE1LCAxOSksIG5ldyBFQ0IoMiwgMjApKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDMsIDE1KSwgbmV3IEVDQigxMywgMTYpKSksXG5cdG5ldyBWZXJzaW9uKDE3LCBuZXcgQXJyYXkoNiwgMzAsIDU0LCA3OCksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigxLCAxMDcpLCBuZXcgRUNCKDUsIDEwOCkpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMTAsIDQ2KSwgbmV3IEVDQigxLCA0NykpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMSwgMjIpLCBuZXcgRUNCKDE1LCAyMykpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMiwgMTQpLCBuZXcgRUNCKDE3LCAxNSkpKSxcblx0bmV3IFZlcnNpb24oMTgsIG5ldyBBcnJheSg2LCAzMCwgNTYsIDgyKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDUsIDEyMCksIG5ldyBFQ0IoMSwgMTIxKSksIG5ldyBFQ0Jsb2NrcygyNiwgbmV3IEVDQig5LCA0MyksIG5ldyBFQ0IoNCwgNDQpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDE3LCAyMiksIG5ldyBFQ0IoMSwgMjMpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDIsIDE0KSwgbmV3IEVDQigxOSwgMTUpKSksXG5cdG5ldyBWZXJzaW9uKDE5LCBuZXcgQXJyYXkoNiwgMzAsIDU4LCA4NiksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigzLCAxMTMpLCBuZXcgRUNCKDQsIDExNCkpLCBuZXcgRUNCbG9ja3MoMjYsIG5ldyBFQ0IoMywgNDQpLCBuZXcgRUNCKDExLCA0NSkpLCBuZXcgRUNCbG9ja3MoMjYsIG5ldyBFQ0IoMTcsIDIxKSwgbmV3IEVDQig0LCAyMikpLCBuZXcgRUNCbG9ja3MoMjYsIG5ldyBFQ0IoOSwgMTMpLCBuZXcgRUNCKDE2LCAxNCkpKSxcblx0bmV3IFZlcnNpb24oMjAsIG5ldyBBcnJheSg2LCAzNCwgNjIsIDkwKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDMsIDEwNyksIG5ldyBFQ0IoNSwgMTA4KSksIG5ldyBFQ0Jsb2NrcygyNiwgbmV3IEVDQigzLCA0MSksIG5ldyBFQ0IoMTMsIDQyKSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigxNSwgMjQpLCBuZXcgRUNCKDUsIDI1KSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigxNSwgMTUpLCBuZXcgRUNCKDEwLCAxNikpKSxcblx0bmV3IFZlcnNpb24oMjEsIG5ldyBBcnJheSg2LCAyOCwgNTAsIDcyLCA5NCksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQig0LCAxMTYpLCBuZXcgRUNCKDQsIDExNykpLCBuZXcgRUNCbG9ja3MoMjYsIG5ldyBFQ0IoMTcsIDQyKSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigxNywgMjIpLCBuZXcgRUNCKDYsIDIzKSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigxOSwgMTYpLCBuZXcgRUNCKDYsIDE3KSkpLFxuXHRuZXcgVmVyc2lvbigyMiwgbmV3IEFycmF5KDYsIDI2LCA1MCwgNzQsIDk4KSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDIsIDExMSksIG5ldyBFQ0IoNywgMTEyKSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigxNywgNDYpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDcsIDI0KSwgbmV3IEVDQigxNiwgMjUpKSwgbmV3IEVDQmxvY2tzKDI0LCBuZXcgRUNCKDM0LCAxMykpKSxcblx0bmV3IFZlcnNpb24oMjMsIG5ldyBBcnJheSg2LCAzMCwgNTQsIDc0LCAxMDIpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoNCwgMTIxKSwgbmV3IEVDQig1LCAxMjIpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDQsIDQ3KSwgbmV3IEVDQigxNCwgNDgpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDExLCAyNCksIG5ldyBFQ0IoMTQsIDI1KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigxNiwgMTUpLCBuZXcgRUNCKDE0LCAxNikpKSxcblx0bmV3IFZlcnNpb24oMjQsIG5ldyBBcnJheSg2LCAyOCwgNTQsIDgwLCAxMDYpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoNiwgMTE3KSwgbmV3IEVDQig0LCAxMTgpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDYsIDQ1KSwgbmV3IEVDQigxNCwgNDYpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDExLCAyNCksIG5ldyBFQ0IoMTYsIDI1KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigzMCwgMTYpLCBuZXcgRUNCKDIsIDE3KSkpLFxuXHRuZXcgVmVyc2lvbigyNSwgbmV3IEFycmF5KDYsIDMyLCA1OCwgODQsIDExMCksIG5ldyBFQ0Jsb2NrcygyNiwgbmV3IEVDQig4LCAxMDYpLCBuZXcgRUNCKDQsIDEwNykpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoOCwgNDcpLCBuZXcgRUNCKDEzLCA0OCkpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoNywgMjQpLCBuZXcgRUNCKDIyLCAyNSkpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMjIsIDE1KSwgbmV3IEVDQigxMywgMTYpKSksXG5cdG5ldyBWZXJzaW9uKDI2LCBuZXcgQXJyYXkoNiwgMzAsIDU4LCA4NiwgMTE0KSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDEwLCAxMTQpLCBuZXcgRUNCKDIsIDExNSkpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMTksIDQ2KSwgbmV3IEVDQig0LCA0NykpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMjgsIDIyKSwgbmV3IEVDQig2LCAyMykpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMzMsIDE2KSwgbmV3IEVDQig0LCAxNykpKSxcblx0bmV3IFZlcnNpb24oMjcsIG5ldyBBcnJheSg2LCAzNCwgNjIsIDkwLCAxMTgpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoOCwgMTIyKSwgbmV3IEVDQig0LCAxMjMpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDIyLCA0NSksIG5ldyBFQ0IoMywgNDYpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDgsIDIzKSwgbmV3IEVDQigyNiwgMjQpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDEyLCAxNSksIFx0XHRuZXcgRUNCKDI4LCAxNikpKSxcblx0bmV3IFZlcnNpb24oMjgsIG5ldyBBcnJheSg2LCAyNiwgNTAsIDc0LCA5OCwgMTIyKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDMsIDExNyksIG5ldyBFQ0IoMTAsIDExOCkpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMywgNDUpLCBuZXcgRUNCKDIzLCA0NikpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoNCwgMjQpLCBuZXcgRUNCKDMxLCAyNSkpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMTEsIDE1KSwgbmV3IEVDQigzMSwgMTYpKSksXG5cdG5ldyBWZXJzaW9uKDI5LCBuZXcgQXJyYXkoNiwgMzAsIDU0LCA3OCwgMTAyLCAxMjYpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoNywgMTE2KSwgbmV3IEVDQig3LCAxMTcpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDIxLCA0NSksIG5ldyBFQ0IoNywgNDYpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDEsIDIzKSwgbmV3IEVDQigzNywgMjQpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDE5LCAxNSksIG5ldyBFQ0IoMjYsIDE2KSkpLFxuXHRuZXcgVmVyc2lvbigzMCwgbmV3IEFycmF5KDYsIDI2LCA1MiwgNzgsIDEwNCwgMTMwKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDUsIDExNSksIG5ldyBFQ0IoMTAsIDExNikpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMTksIDQ3KSwgbmV3IEVDQigxMCwgNDgpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDE1LCAyNCksIG5ldyBFQ0IoMjUsIDI1KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigyMywgMTUpLCBuZXcgRUNCKDI1LCAxNikpKSxcblx0bmV3IFZlcnNpb24oMzEsIG5ldyBBcnJheSg2LCAzMCwgNTYsIDgyLCAxMDgsIDEzNCksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigxMywgMTE1KSwgbmV3IEVDQigzLCAxMTYpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDIsIDQ2KSwgbmV3IEVDQigyOSwgNDcpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDQyLCAyNCksIG5ldyBFQ0IoMSwgMjUpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDIzLCAxNSksIG5ldyBFQ0IoMjgsIDE2KSkpLFxuXHRuZXcgVmVyc2lvbigzMiwgbmV3IEFycmF5KDYsIDM0LCA2MCwgODYsIDExMiwgMTM4KSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDE3LCAxMTUpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDEwLCA0NiksIG5ldyBFQ0IoMjMsIDQ3KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigxMCwgMjQpLCBuZXcgRUNCKDM1LCAyNSkpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMTksIDE1KSwgbmV3IEVDQigzNSwgMTYpKSksXG5cdG5ldyBWZXJzaW9uKDMzLCBuZXcgQXJyYXkoNiwgMzAsIDU4LCA4NiwgMTE0LCAxNDIpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMTcsIDExNSksIG5ldyBFQ0IoMSwgMTE2KSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigxNCwgNDYpLCBuZXcgRUNCKDIxLCA0NykpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMjksIDI0KSwgbmV3IEVDQigxOSwgMjUpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDExLCAxNSksIG5ldyBFQ0IoNDYsIDE2KSkpLFxuXHRuZXcgVmVyc2lvbigzNCwgbmV3IEFycmF5KDYsIDM0LCA2MiwgOTAsIDExOCwgMTQ2KSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDEzLCAxMTUpLCBuZXcgRUNCKDYsIDExNikpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMTQsIDQ2KSwgbmV3IEVDQigyMywgNDcpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDQ0LCAyNCksIG5ldyBFQ0IoNywgMjUpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDU5LCAxNiksIG5ldyBFQ0IoMSwgMTcpKSksXG5cdG5ldyBWZXJzaW9uKDM1LCBuZXcgQXJyYXkoNiwgMzAsIDU0LCA3OCwgMTAyLCAxMjYsIDE1MCksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigxMiwgMTIxKSwgbmV3IEVDQig3LCAxMjIpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDEyLCA0NyksIG5ldyBFQ0IoMjYsIDQ4KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigzOSwgMjQpLCBuZXcgRUNCKDE0LCAyNSkpLG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigyMiwgMTUpLCBuZXcgRUNCKDQxLCAxNikpKSxcblx0bmV3IFZlcnNpb24oMzYsIG5ldyBBcnJheSg2LCAyNCwgNTAsIDc2LCAxMDIsIDEyOCwgMTU0KSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDYsIDEyMSksIG5ldyBFQ0IoMTQsIDEyMikpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoNiwgNDcpLCBuZXcgRUNCKDM0LCA0OCkpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoNDYsIDI0KSwgbmV3IEVDQigxMCwgMjUpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDIsIDE1KSwgbmV3IEVDQig2NCwgMTYpKSksXG5cdG5ldyBWZXJzaW9uKDM3LCBuZXcgQXJyYXkoNiwgMjgsIDU0LCA4MCwgMTA2LCAxMzIsIDE1OCksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigxNywgMTIyKSwgbmV3IEVDQig0LCAxMjMpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDI5LCA0NiksIG5ldyBFQ0IoMTQsIDQ3KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQig0OSwgMjQpLCBuZXcgRUNCKDEwLCAyNSkpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMjQsIDE1KSwgbmV3IEVDQig0NiwgMTYpKSksXG5cdG5ldyBWZXJzaW9uKDM4LCBuZXcgQXJyYXkoNiwgMzIsIDU4LCA4NCwgMTEwLCAxMzYsIDE2MiksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQig0LCAxMjIpLCBuZXcgRUNCKDE4LCAxMjMpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDEzLCA0NiksIG5ldyBFQ0IoMzIsIDQ3KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQig0OCwgMjQpLCBuZXcgRUNCKDE0LCAyNSkpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoNDIsIDE1KSwgbmV3IEVDQigzMiwgMTYpKSksXG5cdG5ldyBWZXJzaW9uKDM5LCBuZXcgQXJyYXkoNiwgMjYsIDU0LCA4MiwgMTEwLCAxMzgsIDE2NiksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigyMCwgMTE3KSwgbmV3IEVDQig0LCAxMTgpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDQwLCA0NyksIG5ldyBFQ0IoNywgNDgpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDQzLCAyNCksIG5ldyBFQ0IoMjIsIDI1KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigxMCwgMTUpLCBuZXcgRUNCKDY3LCAxNikpKSxcblx0bmV3IFZlcnNpb24oNDAsIG5ldyBBcnJheSg2LCAzMCwgNTgsIDg2LCAxMTQsIDE0MiwgMTcwKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDE5LCAxMTgpLCBuZXcgRUNCKDYsIDExOSkpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMTgsIDQ3KSwgbmV3IEVDQigzMSwgNDgpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDM0LCAyNCksIG5ldyBFQ0IoMzQsIDI1KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigyMCwgMTUpLCBuZXcgRUNCKDYxLCAxNikpKSk7XG59XG5cbi8qXG4gIFBvcnRlZCB0byBKYXZhU2NyaXB0IGJ5IExhemFyIExhc3psbyAyMDExXG5cbiAgbGF6YXJzb2Z0QGdtYWlsLmNvbSwgd3d3LmxhemFyc29mdC5pbmZvXG5cbiovXG5cbi8qXG4qXG4qIENvcHlyaWdodCAyMDA3IFpYaW5nIGF1dGhvcnNcbipcbiogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbipcbiogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbipcbiogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4qIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4qIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuXG5mdW5jdGlvbiBQZXJzcGVjdGl2ZVRyYW5zZm9ybSggYTExLCAgYTIxLCAgYTMxLCAgYTEyLCAgYTIyLCAgYTMyLCAgYTEzLCAgYTIzLCAgYTMzKVxue1xuXHR0aGlzLmExMSA9IGExMTtcblx0dGhpcy5hMTIgPSBhMTI7XG5cdHRoaXMuYTEzID0gYTEzO1xuXHR0aGlzLmEyMSA9IGEyMTtcblx0dGhpcy5hMjIgPSBhMjI7XG5cdHRoaXMuYTIzID0gYTIzO1xuXHR0aGlzLmEzMSA9IGEzMTtcblx0dGhpcy5hMzIgPSBhMzI7XG5cdHRoaXMuYTMzID0gYTMzO1xuXHR0aGlzLnRyYW5zZm9ybVBvaW50czE9ZnVuY3Rpb24oIHBvaW50cylcblx0XHR7XG5cdFx0XHR2YXIgbWF4ID0gcG9pbnRzLmxlbmd0aDtcblx0XHRcdHZhciBhMTEgPSB0aGlzLmExMTtcblx0XHRcdHZhciBhMTIgPSB0aGlzLmExMjtcblx0XHRcdHZhciBhMTMgPSB0aGlzLmExMztcblx0XHRcdHZhciBhMjEgPSB0aGlzLmEyMTtcblx0XHRcdHZhciBhMjIgPSB0aGlzLmEyMjtcblx0XHRcdHZhciBhMjMgPSB0aGlzLmEyMztcblx0XHRcdHZhciBhMzEgPSB0aGlzLmEzMTtcblx0XHRcdHZhciBhMzIgPSB0aGlzLmEzMjtcblx0XHRcdHZhciBhMzMgPSB0aGlzLmEzMztcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbWF4OyBpICs9IDIpXG5cdFx0XHR7XG5cdFx0XHRcdHZhciB4ID0gcG9pbnRzW2ldO1xuXHRcdFx0XHR2YXIgeSA9IHBvaW50c1tpICsgMV07XG5cdFx0XHRcdHZhciBkZW5vbWluYXRvciA9IGExMyAqIHggKyBhMjMgKiB5ICsgYTMzO1xuXHRcdFx0XHRwb2ludHNbaV0gPSAoYTExICogeCArIGEyMSAqIHkgKyBhMzEpIC8gZGVub21pbmF0b3I7XG5cdFx0XHRcdHBvaW50c1tpICsgMV0gPSAoYTEyICogeCArIGEyMiAqIHkgKyBhMzIpIC8gZGVub21pbmF0b3I7XG5cdFx0XHR9XG5cdFx0fVxuXHR0aGlzLiB0cmFuc2Zvcm1Qb2ludHMyPWZ1bmN0aW9uKHhWYWx1ZXMsIHlWYWx1ZXMpXG5cdFx0e1xuXHRcdFx0dmFyIG4gPSB4VmFsdWVzLmxlbmd0aDtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgeCA9IHhWYWx1ZXNbaV07XG5cdFx0XHRcdHZhciB5ID0geVZhbHVlc1tpXTtcblx0XHRcdFx0dmFyIGRlbm9taW5hdG9yID0gdGhpcy5hMTMgKiB4ICsgdGhpcy5hMjMgKiB5ICsgdGhpcy5hMzM7XG5cdFx0XHRcdHhWYWx1ZXNbaV0gPSAodGhpcy5hMTEgKiB4ICsgdGhpcy5hMjEgKiB5ICsgdGhpcy5hMzEpIC8gZGVub21pbmF0b3I7XG5cdFx0XHRcdHlWYWx1ZXNbaV0gPSAodGhpcy5hMTIgKiB4ICsgdGhpcy5hMjIgKiB5ICsgdGhpcy5hMzIpIC8gZGVub21pbmF0b3I7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdHRoaXMuYnVpbGRBZGpvaW50PWZ1bmN0aW9uKClcblx0XHR7XG5cdFx0XHQvLyBBZGpvaW50IGlzIHRoZSB0cmFuc3Bvc2Ugb2YgdGhlIGNvZmFjdG9yIG1hdHJpeDpcblx0XHRcdHJldHVybiBuZXcgUGVyc3BlY3RpdmVUcmFuc2Zvcm0odGhpcy5hMjIgKiB0aGlzLmEzMyAtIHRoaXMuYTIzICogdGhpcy5hMzIsIHRoaXMuYTIzICogdGhpcy5hMzEgLSB0aGlzLmEyMSAqIHRoaXMuYTMzLCB0aGlzLmEyMSAqIHRoaXMuYTMyIC0gdGhpcy5hMjIgKiB0aGlzLmEzMSwgdGhpcy5hMTMgKiB0aGlzLmEzMiAtIHRoaXMuYTEyICogdGhpcy5hMzMsIHRoaXMuYTExICogdGhpcy5hMzMgLSB0aGlzLmExMyAqIHRoaXMuYTMxLCB0aGlzLmExMiAqIHRoaXMuYTMxIC0gdGhpcy5hMTEgKiB0aGlzLmEzMiwgdGhpcy5hMTIgKiB0aGlzLmEyMyAtIHRoaXMuYTEzICogdGhpcy5hMjIsIHRoaXMuYTEzICogdGhpcy5hMjEgLSB0aGlzLmExMSAqIHRoaXMuYTIzLCB0aGlzLmExMSAqIHRoaXMuYTIyIC0gdGhpcy5hMTIgKiB0aGlzLmEyMSk7XG5cdFx0fVxuXHR0aGlzLnRpbWVzPWZ1bmN0aW9uKCBvdGhlcilcblx0XHR7XG5cdFx0XHRyZXR1cm4gbmV3IFBlcnNwZWN0aXZlVHJhbnNmb3JtKHRoaXMuYTExICogb3RoZXIuYTExICsgdGhpcy5hMjEgKiBvdGhlci5hMTIgKyB0aGlzLmEzMSAqIG90aGVyLmExMywgdGhpcy5hMTEgKiBvdGhlci5hMjEgKyB0aGlzLmEyMSAqIG90aGVyLmEyMiArIHRoaXMuYTMxICogb3RoZXIuYTIzLCB0aGlzLmExMSAqIG90aGVyLmEzMSArIHRoaXMuYTIxICogb3RoZXIuYTMyICsgdGhpcy5hMzEgKiBvdGhlci5hMzMsIHRoaXMuYTEyICogb3RoZXIuYTExICsgdGhpcy5hMjIgKiBvdGhlci5hMTIgKyB0aGlzLmEzMiAqIG90aGVyLmExMywgdGhpcy5hMTIgKiBvdGhlci5hMjEgKyB0aGlzLmEyMiAqIG90aGVyLmEyMiArIHRoaXMuYTMyICogb3RoZXIuYTIzLCB0aGlzLmExMiAqIG90aGVyLmEzMSArIHRoaXMuYTIyICogb3RoZXIuYTMyICsgdGhpcy5hMzIgKiBvdGhlci5hMzMsIHRoaXMuYTEzICogb3RoZXIuYTExICsgdGhpcy5hMjMgKiBvdGhlci5hMTIgK3RoaXMuYTMzICogb3RoZXIuYTEzLCB0aGlzLmExMyAqIG90aGVyLmEyMSArIHRoaXMuYTIzICogb3RoZXIuYTIyICsgdGhpcy5hMzMgKiBvdGhlci5hMjMsIHRoaXMuYTEzICogb3RoZXIuYTMxICsgdGhpcy5hMjMgKiBvdGhlci5hMzIgKyB0aGlzLmEzMyAqIG90aGVyLmEzMyk7XG5cdFx0fVxuXG59XG5cblBlcnNwZWN0aXZlVHJhbnNmb3JtLnF1YWRyaWxhdGVyYWxUb1F1YWRyaWxhdGVyYWw9ZnVuY3Rpb24oIHgwLCAgeTAsICB4MSwgIHkxLCAgeDIsICB5MiwgIHgzLCAgeTMsICB4MHAsICB5MHAsICB4MXAsICB5MXAsICB4MnAsICB5MnAsICB4M3AsICB5M3ApXG57XG5cblx0dmFyIHFUb1MgPSB0aGlzLnF1YWRyaWxhdGVyYWxUb1NxdWFyZSh4MCwgeTAsIHgxLCB5MSwgeDIsIHkyLCB4MywgeTMpO1xuXHR2YXIgc1RvUSA9IHRoaXMuc3F1YXJlVG9RdWFkcmlsYXRlcmFsKHgwcCwgeTBwLCB4MXAsIHkxcCwgeDJwLCB5MnAsIHgzcCwgeTNwKTtcblx0cmV0dXJuIHNUb1EudGltZXMocVRvUyk7XG59XG5cblBlcnNwZWN0aXZlVHJhbnNmb3JtLnNxdWFyZVRvUXVhZHJpbGF0ZXJhbD1mdW5jdGlvbiggeDAsICB5MCwgIHgxLCAgeTEsICB4MiwgIHkyLCAgeDMsICB5Mylcbntcblx0IGR5MiA9IHkzIC0geTI7XG5cdCBkeTMgPSB5MCAtIHkxICsgeTIgLSB5Mztcblx0aWYgKGR5MiA9PSAwLjAgJiYgZHkzID09IDAuMClcblx0e1xuXHRcdHJldHVybiBuZXcgUGVyc3BlY3RpdmVUcmFuc2Zvcm0oeDEgLSB4MCwgeDIgLSB4MSwgeDAsIHkxIC0geTAsIHkyIC0geTEsIHkwLCAwLjAsIDAuMCwgMS4wKTtcblx0fVxuXHRlbHNlXG5cdHtcblx0XHQgZHgxID0geDEgLSB4Mjtcblx0XHQgZHgyID0geDMgLSB4Mjtcblx0XHQgZHgzID0geDAgLSB4MSArIHgyIC0geDM7XG5cdFx0IGR5MSA9IHkxIC0geTI7XG5cdFx0IGRlbm9taW5hdG9yID0gZHgxICogZHkyIC0gZHgyICogZHkxO1xuXHRcdCBhMTMgPSAoZHgzICogZHkyIC0gZHgyICogZHkzKSAvIGRlbm9taW5hdG9yO1xuXHRcdCBhMjMgPSAoZHgxICogZHkzIC0gZHgzICogZHkxKSAvIGRlbm9taW5hdG9yO1xuXHRcdHJldHVybiBuZXcgUGVyc3BlY3RpdmVUcmFuc2Zvcm0oeDEgLSB4MCArIGExMyAqIHgxLCB4MyAtIHgwICsgYTIzICogeDMsIHgwLCB5MSAtIHkwICsgYTEzICogeTEsIHkzIC0geTAgKyBhMjMgKiB5MywgeTAsIGExMywgYTIzLCAxLjApO1xuXHR9XG59XG5cblBlcnNwZWN0aXZlVHJhbnNmb3JtLnF1YWRyaWxhdGVyYWxUb1NxdWFyZT1mdW5jdGlvbiggeDAsICB5MCwgIHgxLCAgeTEsICB4MiwgIHkyLCAgeDMsICB5Mylcbntcblx0Ly8gSGVyZSwgdGhlIGFkam9pbnQgc2VydmVzIGFzIHRoZSBpbnZlcnNlOlxuXHRyZXR1cm4gdGhpcy5zcXVhcmVUb1F1YWRyaWxhdGVyYWwoeDAsIHkwLCB4MSwgeTEsIHgyLCB5MiwgeDMsIHkzKS5idWlsZEFkam9pbnQoKTtcbn1cblxuZnVuY3Rpb24gRGV0ZWN0b3JSZXN1bHQoYml0cywgIHBvaW50cylcbntcblx0dGhpcy5iaXRzID0gYml0cztcblx0dGhpcy5wb2ludHMgPSBwb2ludHM7XG59XG5cblxuZnVuY3Rpb24gRGV0ZWN0b3IoaW1hZ2UpXG57XG5cdHRoaXMuaW1hZ2U9aW1hZ2U7XG5cdHRoaXMucmVzdWx0UG9pbnRDYWxsYmFjayA9IG51bGw7XG5cblx0dGhpcy5zaXplT2ZCbGFja1doaXRlQmxhY2tSdW49ZnVuY3Rpb24oIGZyb21YLCAgZnJvbVksICB0b1gsICB0b1kpXG5cdFx0e1xuXHRcdFx0Ly8gTWlsZCB2YXJpYW50IG9mIEJyZXNlbmhhbSdzIGFsZ29yaXRobTtcblx0XHRcdC8vIHNlZSBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0JyZXNlbmhhbSdzX2xpbmVfYWxnb3JpdGhtXG5cdFx0XHR2YXIgc3RlZXAgPSBNYXRoLmFicyh0b1kgLSBmcm9tWSkgPiBNYXRoLmFicyh0b1ggLSBmcm9tWCk7XG5cdFx0XHRpZiAoc3RlZXApXG5cdFx0XHR7XG5cdFx0XHRcdHZhciB0ZW1wID0gZnJvbVg7XG5cdFx0XHRcdGZyb21YID0gZnJvbVk7XG5cdFx0XHRcdGZyb21ZID0gdGVtcDtcblx0XHRcdFx0dGVtcCA9IHRvWDtcblx0XHRcdFx0dG9YID0gdG9ZO1xuXHRcdFx0XHR0b1kgPSB0ZW1wO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgZHggPSBNYXRoLmFicyh0b1ggLSBmcm9tWCk7XG5cdFx0XHR2YXIgZHkgPSBNYXRoLmFicyh0b1kgLSBmcm9tWSk7XG5cdFx0XHR2YXIgZXJyb3IgPSAtIGR4ID4+IDE7XG5cdFx0XHR2YXIgeXN0ZXAgPSBmcm9tWSA8IHRvWT8xOi0gMTtcblx0XHRcdHZhciB4c3RlcCA9IGZyb21YIDwgdG9YPzE6LSAxO1xuXHRcdFx0dmFyIHN0YXRlID0gMDsgLy8gSW4gYmxhY2sgcGl4ZWxzLCBsb29raW5nIGZvciB3aGl0ZSwgZmlyc3Qgb3Igc2Vjb25kIHRpbWVcblx0XHRcdGZvciAodmFyIHggPSBmcm9tWCwgeSA9IGZyb21ZOyB4ICE9IHRvWDsgeCArPSB4c3RlcClcblx0XHRcdHtcblxuXHRcdFx0XHR2YXIgcmVhbFggPSBzdGVlcD95Ong7XG5cdFx0XHRcdHZhciByZWFsWSA9IHN0ZWVwP3g6eTtcblx0XHRcdFx0aWYgKHN0YXRlID09IDEpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBJbiB3aGl0ZSBwaXhlbHMsIGxvb2tpbmcgZm9yIGJsYWNrXG5cdFx0XHRcdFx0aWYgKHRoaXMuaW1hZ2UuZGF0YVtyZWFsWCArIHJlYWxZKmltYWdlLndpZHRoXSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRzdGF0ZSsrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoIXRoaXMuaW1hZ2UuZGF0YVtyZWFsWCArIHJlYWxZKmltYWdlLndpZHRoXSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRzdGF0ZSsrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChzdGF0ZSA9PSAzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gRm91bmQgYmxhY2ssIHdoaXRlLCBibGFjaywgYW5kIHN0dW1ibGVkIGJhY2sgb250byB3aGl0ZTsgZG9uZVxuXHRcdFx0XHRcdHZhciBkaWZmWCA9IHggLSBmcm9tWDtcblx0XHRcdFx0XHR2YXIgZGlmZlkgPSB5IC0gZnJvbVk7XG5cdFx0XHRcdFx0cmV0dXJuICBNYXRoLnNxcnQoIChkaWZmWCAqIGRpZmZYICsgZGlmZlkgKiBkaWZmWSkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVycm9yICs9IGR5O1xuXHRcdFx0XHRpZiAoZXJyb3IgPiAwKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKHkgPT0gdG9ZKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR5ICs9IHlzdGVwO1xuXHRcdFx0XHRcdGVycm9yIC09IGR4O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR2YXIgZGlmZlgyID0gdG9YIC0gZnJvbVg7XG5cdFx0XHR2YXIgZGlmZlkyID0gdG9ZIC0gZnJvbVk7XG5cdFx0XHRyZXR1cm4gIE1hdGguc3FydCggKGRpZmZYMiAqIGRpZmZYMiArIGRpZmZZMiAqIGRpZmZZMikpO1xuXHRcdH1cblxuXG5cdHRoaXMuc2l6ZU9mQmxhY2tXaGl0ZUJsYWNrUnVuQm90aFdheXM9ZnVuY3Rpb24oIGZyb21YLCAgZnJvbVksICB0b1gsICB0b1kpXG5cdFx0e1xuXG5cdFx0XHR2YXIgcmVzdWx0ID0gdGhpcy5zaXplT2ZCbGFja1doaXRlQmxhY2tSdW4oZnJvbVgsIGZyb21ZLCB0b1gsIHRvWSk7XG5cblx0XHRcdC8vIE5vdyBjb3VudCBvdGhlciB3YXkgLS0gZG9uJ3QgcnVuIG9mZiBpbWFnZSB0aG91Z2ggb2YgY291cnNlXG5cdFx0XHR2YXIgc2NhbGUgPSAxLjA7XG5cdFx0XHR2YXIgb3RoZXJUb1ggPSBmcm9tWCAtICh0b1ggLSBmcm9tWCk7XG5cdFx0XHRpZiAob3RoZXJUb1ggPCAwKVxuXHRcdFx0e1xuXHRcdFx0XHRzY2FsZSA9ICBmcm9tWCAvICAoZnJvbVggLSBvdGhlclRvWCk7XG5cdFx0XHRcdG90aGVyVG9YID0gMDtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKG90aGVyVG9YID49IGltYWdlLndpZHRoKVxuXHRcdFx0e1xuXHRcdFx0XHRzY2FsZSA9ICAoaW1hZ2Uud2lkdGggLSAxIC0gZnJvbVgpIC8gIChvdGhlclRvWCAtIGZyb21YKTtcblx0XHRcdFx0b3RoZXJUb1ggPSBpbWFnZS53aWR0aCAtIDE7XG5cdFx0XHR9XG5cdFx0XHR2YXIgb3RoZXJUb1kgPSBNYXRoLmZsb29yIChmcm9tWSAtICh0b1kgLSBmcm9tWSkgKiBzY2FsZSk7XG5cblx0XHRcdHNjYWxlID0gMS4wO1xuXHRcdFx0aWYgKG90aGVyVG9ZIDwgMClcblx0XHRcdHtcblx0XHRcdFx0c2NhbGUgPSAgZnJvbVkgLyAgKGZyb21ZIC0gb3RoZXJUb1kpO1xuXHRcdFx0XHRvdGhlclRvWSA9IDA7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChvdGhlclRvWSA+PSBpbWFnZS5oZWlnaHQpXG5cdFx0XHR7XG5cdFx0XHRcdHNjYWxlID0gIChpbWFnZS5oZWlnaHQgLSAxIC0gZnJvbVkpIC8gIChvdGhlclRvWSAtIGZyb21ZKTtcblx0XHRcdFx0b3RoZXJUb1kgPSBpbWFnZS5oZWlnaHQgLSAxO1xuXHRcdFx0fVxuXHRcdFx0b3RoZXJUb1ggPSBNYXRoLmZsb29yIChmcm9tWCArIChvdGhlclRvWCAtIGZyb21YKSAqIHNjYWxlKTtcblxuXHRcdFx0cmVzdWx0ICs9IHRoaXMuc2l6ZU9mQmxhY2tXaGl0ZUJsYWNrUnVuKGZyb21YLCBmcm9tWSwgb3RoZXJUb1gsIG90aGVyVG9ZKTtcblx0XHRcdHJldHVybiByZXN1bHQgLSAxLjA7IC8vIC0xIGJlY2F1c2Ugd2UgY291bnRlZCB0aGUgbWlkZGxlIHBpeGVsIHR3aWNlXG5cdFx0fVxuXG5cblxuXHR0aGlzLmNhbGN1bGF0ZU1vZHVsZVNpemVPbmVXYXk9ZnVuY3Rpb24oIHBhdHRlcm4sICBvdGhlclBhdHRlcm4pXG5cdFx0e1xuXHRcdFx0dmFyIG1vZHVsZVNpemVFc3QxID0gdGhpcy5zaXplT2ZCbGFja1doaXRlQmxhY2tSdW5Cb3RoV2F5cyhNYXRoLmZsb29yKCBwYXR0ZXJuLlgpLCBNYXRoLmZsb29yKCBwYXR0ZXJuLlkpLCBNYXRoLmZsb29yKCBvdGhlclBhdHRlcm4uWCksIE1hdGguZmxvb3Iob3RoZXJQYXR0ZXJuLlkpKTtcblx0XHRcdHZhciBtb2R1bGVTaXplRXN0MiA9IHRoaXMuc2l6ZU9mQmxhY2tXaGl0ZUJsYWNrUnVuQm90aFdheXMoTWF0aC5mbG9vcihvdGhlclBhdHRlcm4uWCksIE1hdGguZmxvb3Iob3RoZXJQYXR0ZXJuLlkpLCBNYXRoLmZsb29yKCBwYXR0ZXJuLlgpLCBNYXRoLmZsb29yKHBhdHRlcm4uWSkpO1xuXHRcdFx0aWYgKGlzTmFOKG1vZHVsZVNpemVFc3QxKSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIG1vZHVsZVNpemVFc3QyIC8gNy4wO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGlzTmFOKG1vZHVsZVNpemVFc3QyKSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIG1vZHVsZVNpemVFc3QxIC8gNy4wO1xuXHRcdFx0fVxuXHRcdFx0Ly8gQXZlcmFnZSB0aGVtLCBhbmQgZGl2aWRlIGJ5IDcgc2luY2Ugd2UndmUgY291bnRlZCB0aGUgd2lkdGggb2YgMyBibGFjayBtb2R1bGVzLFxuXHRcdFx0Ly8gYW5kIDEgd2hpdGUgYW5kIDEgYmxhY2sgbW9kdWxlIG9uIGVpdGhlciBzaWRlLiBFcmdvLCBkaXZpZGUgc3VtIGJ5IDE0LlxuXHRcdFx0cmV0dXJuIChtb2R1bGVTaXplRXN0MSArIG1vZHVsZVNpemVFc3QyKSAvIDE0LjA7XG5cdFx0fVxuXG5cblx0dGhpcy5jYWxjdWxhdGVNb2R1bGVTaXplPWZ1bmN0aW9uKCB0b3BMZWZ0LCAgdG9wUmlnaHQsICBib3R0b21MZWZ0KVxuXHRcdHtcblx0XHRcdC8vIFRha2UgdGhlIGF2ZXJhZ2Vcblx0XHRcdHJldHVybiAodGhpcy5jYWxjdWxhdGVNb2R1bGVTaXplT25lV2F5KHRvcExlZnQsIHRvcFJpZ2h0KSArIHRoaXMuY2FsY3VsYXRlTW9kdWxlU2l6ZU9uZVdheSh0b3BMZWZ0LCBib3R0b21MZWZ0KSkgLyAyLjA7XG5cdFx0fVxuXG5cdHRoaXMuZGlzdGFuY2U9ZnVuY3Rpb24oIHBhdHRlcm4xLCAgcGF0dGVybjIpXG5cdHtcblx0XHR4RGlmZiA9IHBhdHRlcm4xLlggLSBwYXR0ZXJuMi5YO1xuXHRcdHlEaWZmID0gcGF0dGVybjEuWSAtIHBhdHRlcm4yLlk7XG5cdFx0cmV0dXJuICBNYXRoLnNxcnQoICh4RGlmZiAqIHhEaWZmICsgeURpZmYgKiB5RGlmZikpO1xuXHR9XG5cdHRoaXMuY29tcHV0ZURpbWVuc2lvbj1mdW5jdGlvbiggdG9wTGVmdCwgIHRvcFJpZ2h0LCAgYm90dG9tTGVmdCwgIG1vZHVsZVNpemUpXG5cdFx0e1xuXG5cdFx0XHR2YXIgdGx0ckNlbnRlcnNEaW1lbnNpb24gPSBNYXRoLnJvdW5kKHRoaXMuZGlzdGFuY2UodG9wTGVmdCwgdG9wUmlnaHQpIC8gbW9kdWxlU2l6ZSk7XG5cdFx0XHR2YXIgdGxibENlbnRlcnNEaW1lbnNpb24gPSBNYXRoLnJvdW5kKHRoaXMuZGlzdGFuY2UodG9wTGVmdCwgYm90dG9tTGVmdCkgLyBtb2R1bGVTaXplKTtcblx0XHRcdHZhciBkaW1lbnNpb24gPSAoKHRsdHJDZW50ZXJzRGltZW5zaW9uICsgdGxibENlbnRlcnNEaW1lbnNpb24pID4+IDEpICsgNztcblx0XHRcdHN3aXRjaCAoZGltZW5zaW9uICYgMHgwMylcblx0XHRcdHtcblxuXHRcdFx0XHQvLyBtb2QgNFxuXHRcdFx0XHRjYXNlIDA6XG5cdFx0XHRcdFx0ZGltZW5zaW9uKys7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Ly8gMT8gZG8gbm90aGluZ1xuXG5cdFx0XHRcdGNhc2UgMjpcblx0XHRcdFx0XHRkaW1lbnNpb24tLTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIDM6XG5cdFx0XHRcdFx0dGhyb3cgXCJFcnJvclwiO1xuXHRcdFx0XHR9XG5cdFx0XHRyZXR1cm4gZGltZW5zaW9uO1xuXHRcdH1cblxuXHR0aGlzLmZpbmRBbGlnbm1lbnRJblJlZ2lvbj1mdW5jdGlvbiggb3ZlcmFsbEVzdE1vZHVsZVNpemUsICBlc3RBbGlnbm1lbnRYLCAgZXN0QWxpZ25tZW50WSwgIGFsbG93YW5jZUZhY3Rvcilcblx0XHR7XG5cdFx0XHQvLyBMb29rIGZvciBhbiBhbGlnbm1lbnQgcGF0dGVybiAoMyBtb2R1bGVzIGluIHNpemUpIGFyb3VuZCB3aGVyZSBpdFxuXHRcdFx0Ly8gc2hvdWxkIGJlXG5cdFx0XHR2YXIgYWxsb3dhbmNlID0gTWF0aC5mbG9vciAoYWxsb3dhbmNlRmFjdG9yICogb3ZlcmFsbEVzdE1vZHVsZVNpemUpO1xuXHRcdFx0dmFyIGFsaWdubWVudEFyZWFMZWZ0WCA9IE1hdGgubWF4KDAsIGVzdEFsaWdubWVudFggLSBhbGxvd2FuY2UpO1xuXHRcdFx0dmFyIGFsaWdubWVudEFyZWFSaWdodFggPSBNYXRoLm1pbihpbWFnZS53aWR0aCAtIDEsIGVzdEFsaWdubWVudFggKyBhbGxvd2FuY2UpO1xuXHRcdFx0aWYgKGFsaWdubWVudEFyZWFSaWdodFggLSBhbGlnbm1lbnRBcmVhTGVmdFggPCBvdmVyYWxsRXN0TW9kdWxlU2l6ZSAqIDMpXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IFwiRXJyb3JcIjtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGFsaWdubWVudEFyZWFUb3BZID0gTWF0aC5tYXgoMCwgZXN0QWxpZ25tZW50WSAtIGFsbG93YW5jZSk7XG5cdFx0XHR2YXIgYWxpZ25tZW50QXJlYUJvdHRvbVkgPSBNYXRoLm1pbihpbWFnZS5oZWlnaHQgLSAxLCBlc3RBbGlnbm1lbnRZICsgYWxsb3dhbmNlKTtcblxuXHRcdFx0dmFyIGFsaWdubWVudEZpbmRlciA9IG5ldyBBbGlnbm1lbnRQYXR0ZXJuRmluZGVyKHRoaXMuaW1hZ2UsIGFsaWdubWVudEFyZWFMZWZ0WCwgYWxpZ25tZW50QXJlYVRvcFksIGFsaWdubWVudEFyZWFSaWdodFggLSBhbGlnbm1lbnRBcmVhTGVmdFgsIGFsaWdubWVudEFyZWFCb3R0b21ZIC0gYWxpZ25tZW50QXJlYVRvcFksIG92ZXJhbGxFc3RNb2R1bGVTaXplLCB0aGlzLnJlc3VsdFBvaW50Q2FsbGJhY2spO1xuXHRcdFx0cmV0dXJuIGFsaWdubWVudEZpbmRlci5maW5kKCk7XG5cdFx0fVxuXG5cdHRoaXMuY3JlYXRlVHJhbnNmb3JtPWZ1bmN0aW9uKCB0b3BMZWZ0LCAgdG9wUmlnaHQsICBib3R0b21MZWZ0LCBhbGlnbm1lbnRQYXR0ZXJuLCBkaW1lbnNpb24pXG5cdFx0e1xuXHRcdFx0dmFyIGRpbU1pbnVzVGhyZWUgPSAgZGltZW5zaW9uIC0gMy41O1xuXHRcdFx0dmFyIGJvdHRvbVJpZ2h0WDtcblx0XHRcdHZhciBib3R0b21SaWdodFk7XG5cdFx0XHR2YXIgc291cmNlQm90dG9tUmlnaHRYO1xuXHRcdFx0dmFyIHNvdXJjZUJvdHRvbVJpZ2h0WTtcblx0XHRcdGlmIChhbGlnbm1lbnRQYXR0ZXJuICE9IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdGJvdHRvbVJpZ2h0WCA9IGFsaWdubWVudFBhdHRlcm4uWDtcblx0XHRcdFx0Ym90dG9tUmlnaHRZID0gYWxpZ25tZW50UGF0dGVybi5ZO1xuXHRcdFx0XHRzb3VyY2VCb3R0b21SaWdodFggPSBzb3VyY2VCb3R0b21SaWdodFkgPSBkaW1NaW51c1RocmVlIC0gMy4wO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBEb24ndCBoYXZlIGFuIGFsaWdubWVudCBwYXR0ZXJuLCBqdXN0IG1ha2UgdXAgdGhlIGJvdHRvbS1yaWdodCBwb2ludFxuXHRcdFx0XHRib3R0b21SaWdodFggPSAodG9wUmlnaHQuWCAtIHRvcExlZnQuWCkgKyBib3R0b21MZWZ0Llg7XG5cdFx0XHRcdGJvdHRvbVJpZ2h0WSA9ICh0b3BSaWdodC5ZIC0gdG9wTGVmdC5ZKSArIGJvdHRvbUxlZnQuWTtcblx0XHRcdFx0c291cmNlQm90dG9tUmlnaHRYID0gc291cmNlQm90dG9tUmlnaHRZID0gZGltTWludXNUaHJlZTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHRyYW5zZm9ybSA9IFBlcnNwZWN0aXZlVHJhbnNmb3JtLnF1YWRyaWxhdGVyYWxUb1F1YWRyaWxhdGVyYWwoMy41LCAzLjUsIGRpbU1pbnVzVGhyZWUsIDMuNSwgc291cmNlQm90dG9tUmlnaHRYLCBzb3VyY2VCb3R0b21SaWdodFksIDMuNSwgZGltTWludXNUaHJlZSwgdG9wTGVmdC5YLCB0b3BMZWZ0LlksIHRvcFJpZ2h0LlgsIHRvcFJpZ2h0LlksIGJvdHRvbVJpZ2h0WCwgYm90dG9tUmlnaHRZLCBib3R0b21MZWZ0LlgsIGJvdHRvbUxlZnQuWSk7XG5cblx0XHRcdHJldHVybiB0cmFuc2Zvcm07XG5cdFx0fVxuXG5cdHRoaXMuc2FtcGxlR3JpZD1mdW5jdGlvbiggaW1hZ2UsICB0cmFuc2Zvcm0sICBkaW1lbnNpb24pXG5cdFx0e1xuXG5cdFx0XHR2YXIgc2FtcGxlciA9IEdyaWRTYW1wbGVyO1xuXHRcdFx0cmV0dXJuIHNhbXBsZXIuc2FtcGxlR3JpZDMoaW1hZ2UsIGRpbWVuc2lvbiwgdHJhbnNmb3JtKTtcblx0XHR9XG5cblx0dGhpcy5wcm9jZXNzRmluZGVyUGF0dGVybkluZm8gPSBmdW5jdGlvbiggaW5mbylcblx0XHR7XG5cblx0XHRcdHZhciB0b3BMZWZ0ID0gaW5mby5Ub3BMZWZ0O1xuXHRcdFx0dmFyIHRvcFJpZ2h0ID0gaW5mby5Ub3BSaWdodDtcblx0XHRcdHZhciBib3R0b21MZWZ0ID0gaW5mby5Cb3R0b21MZWZ0O1xuXG5cdFx0XHR2YXIgbW9kdWxlU2l6ZSA9IHRoaXMuY2FsY3VsYXRlTW9kdWxlU2l6ZSh0b3BMZWZ0LCB0b3BSaWdodCwgYm90dG9tTGVmdCk7XG5cdFx0XHRpZiAobW9kdWxlU2l6ZSA8IDEuMClcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgXCJFcnJvclwiO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGRpbWVuc2lvbiA9IHRoaXMuY29tcHV0ZURpbWVuc2lvbih0b3BMZWZ0LCB0b3BSaWdodCwgYm90dG9tTGVmdCwgbW9kdWxlU2l6ZSk7XG5cdFx0XHR2YXIgcHJvdmlzaW9uYWxWZXJzaW9uID0gVmVyc2lvbi5nZXRQcm92aXNpb25hbFZlcnNpb25Gb3JEaW1lbnNpb24oZGltZW5zaW9uKTtcblx0XHRcdHZhciBtb2R1bGVzQmV0d2VlbkZQQ2VudGVycyA9IHByb3Zpc2lvbmFsVmVyc2lvbi5EaW1lbnNpb25Gb3JWZXJzaW9uIC0gNztcblxuXHRcdFx0dmFyIGFsaWdubWVudFBhdHRlcm4gPSBudWxsO1xuXHRcdFx0Ly8gQW55dGhpbmcgYWJvdmUgdmVyc2lvbiAxIGhhcyBhbiBhbGlnbm1lbnQgcGF0dGVyblxuXHRcdFx0aWYgKHByb3Zpc2lvbmFsVmVyc2lvbi5BbGlnbm1lbnRQYXR0ZXJuQ2VudGVycy5sZW5ndGggPiAwKVxuXHRcdFx0e1xuXG5cdFx0XHRcdC8vIEd1ZXNzIHdoZXJlIGEgXCJib3R0b20gcmlnaHRcIiBmaW5kZXIgcGF0dGVybiB3b3VsZCBoYXZlIGJlZW5cblx0XHRcdFx0dmFyIGJvdHRvbVJpZ2h0WCA9IHRvcFJpZ2h0LlggLSB0b3BMZWZ0LlggKyBib3R0b21MZWZ0Llg7XG5cdFx0XHRcdHZhciBib3R0b21SaWdodFkgPSB0b3BSaWdodC5ZIC0gdG9wTGVmdC5ZICsgYm90dG9tTGVmdC5ZO1xuXG5cdFx0XHRcdC8vIEVzdGltYXRlIHRoYXQgYWxpZ25tZW50IHBhdHRlcm4gaXMgY2xvc2VyIGJ5IDMgbW9kdWxlc1xuXHRcdFx0XHQvLyBmcm9tIFwiYm90dG9tIHJpZ2h0XCIgdG8ga25vd24gdG9wIGxlZnQgbG9jYXRpb25cblx0XHRcdFx0dmFyIGNvcnJlY3Rpb25Ub1RvcExlZnQgPSAxLjAgLSAzLjAgLyAgbW9kdWxlc0JldHdlZW5GUENlbnRlcnM7XG5cdFx0XHRcdHZhciBlc3RBbGlnbm1lbnRYID0gTWF0aC5mbG9vciAodG9wTGVmdC5YICsgY29ycmVjdGlvblRvVG9wTGVmdCAqIChib3R0b21SaWdodFggLSB0b3BMZWZ0LlgpKTtcblx0XHRcdFx0dmFyIGVzdEFsaWdubWVudFkgPSBNYXRoLmZsb29yICh0b3BMZWZ0LlkgKyBjb3JyZWN0aW9uVG9Ub3BMZWZ0ICogKGJvdHRvbVJpZ2h0WSAtIHRvcExlZnQuWSkpO1xuXG5cdFx0XHRcdC8vIEtpbmQgb2YgYXJiaXRyYXJ5IC0tIGV4cGFuZCBzZWFyY2ggcmFkaXVzIGJlZm9yZSBnaXZpbmcgdXBcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDQ7IGkgPD0gMTY7IGkgPDw9IDEpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvL3RyeVxuXHRcdFx0XHRcdC8ve1xuXHRcdFx0XHRcdFx0YWxpZ25tZW50UGF0dGVybiA9IHRoaXMuZmluZEFsaWdubWVudEluUmVnaW9uKG1vZHVsZVNpemUsIGVzdEFsaWdubWVudFgsIGVzdEFsaWdubWVudFksICBpKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdC8vfVxuXHRcdFx0XHRcdC8vY2F0Y2ggKHJlKVxuXHRcdFx0XHRcdC8ve1xuXHRcdFx0XHRcdFx0Ly8gdHJ5IG5leHQgcm91bmRcblx0XHRcdFx0XHQvL31cblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBJZiB3ZSBkaWRuJ3QgZmluZCBhbGlnbm1lbnQgcGF0dGVybi4uLiB3ZWxsIHRyeSBhbnl3YXkgd2l0aG91dCBpdFxuXHRcdFx0fVxuXG5cdFx0XHR2YXIgdHJhbnNmb3JtID0gdGhpcy5jcmVhdGVUcmFuc2Zvcm0odG9wTGVmdCwgdG9wUmlnaHQsIGJvdHRvbUxlZnQsIGFsaWdubWVudFBhdHRlcm4sIGRpbWVuc2lvbik7XG5cblx0XHRcdHZhciBiaXRzID0gdGhpcy5zYW1wbGVHcmlkKHRoaXMuaW1hZ2UsIHRyYW5zZm9ybSwgZGltZW5zaW9uKTtcblxuXHRcdFx0dmFyIHBvaW50cztcblx0XHRcdGlmIChhbGlnbm1lbnRQYXR0ZXJuID09IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdHBvaW50cyA9IG5ldyBBcnJheShib3R0b21MZWZ0LCB0b3BMZWZ0LCB0b3BSaWdodCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdHBvaW50cyA9IG5ldyBBcnJheShib3R0b21MZWZ0LCB0b3BMZWZ0LCB0b3BSaWdodCwgYWxpZ25tZW50UGF0dGVybik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbmV3IERldGVjdG9yUmVzdWx0KGJpdHMsIHBvaW50cyk7XG5cdFx0fVxuXG5cblxuXHR0aGlzLmRldGVjdD1mdW5jdGlvbigpXG5cdHtcblx0XHR2YXIgaW5mbyA9ICBuZXcgRmluZGVyUGF0dGVybkZpbmRlcigpLmZpbmRGaW5kZXJQYXR0ZXJuKHRoaXMuaW1hZ2UpO1xuXG5cdFx0cmV0dXJuIHRoaXMucHJvY2Vzc0ZpbmRlclBhdHRlcm5JbmZvKGluZm8pO1xuXHR9XG59XG5cbi8qXG4gIFBvcnRlZCB0byBKYXZhU2NyaXB0IGJ5IExhemFyIExhc3psbyAyMDExXG5cbiAgbGF6YXJzb2Z0QGdtYWlsLmNvbSwgd3d3LmxhemFyc29mdC5pbmZvXG5cbiovXG5cbi8qXG4qXG4qIENvcHlyaWdodCAyMDA3IFpYaW5nIGF1dGhvcnNcbipcbiogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbipcbiogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbipcbiogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4qIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4qIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuXG52YXIgRk9STUFUX0lORk9fTUFTS19RUiA9IDB4NTQxMjtcbnZhciBGT1JNQVRfSU5GT19ERUNPREVfTE9PS1VQID0gbmV3IEFycmF5KG5ldyBBcnJheSgweDU0MTIsIDB4MDApLCBuZXcgQXJyYXkoMHg1MTI1LCAweDAxKSwgbmV3IEFycmF5KDB4NUU3QywgMHgwMiksIG5ldyBBcnJheSgweDVCNEIsIDB4MDMpLCBuZXcgQXJyYXkoMHg0NUY5LCAweDA0KSwgbmV3IEFycmF5KDB4NDBDRSwgMHgwNSksIG5ldyBBcnJheSgweDRGOTcsIDB4MDYpLCBuZXcgQXJyYXkoMHg0QUEwLCAweDA3KSwgbmV3IEFycmF5KDB4NzdDNCwgMHgwOCksIG5ldyBBcnJheSgweDcyRjMsIDB4MDkpLCBuZXcgQXJyYXkoMHg3REFBLCAweDBBKSwgbmV3IEFycmF5KDB4Nzg5RCwgMHgwQiksIG5ldyBBcnJheSgweDY2MkYsIDB4MEMpLCBuZXcgQXJyYXkoMHg2MzE4LCAweDBEKSwgbmV3IEFycmF5KDB4NkM0MSwgMHgwRSksIG5ldyBBcnJheSgweDY5NzYsIDB4MEYpLCBuZXcgQXJyYXkoMHgxNjg5LCAweDEwKSwgbmV3IEFycmF5KDB4MTNCRSwgMHgxMSksIG5ldyBBcnJheSgweDFDRTcsIDB4MTIpLCBuZXcgQXJyYXkoMHgxOUQwLCAweDEzKSwgbmV3IEFycmF5KDB4MDc2MiwgMHgxNCksIG5ldyBBcnJheSgweDAyNTUsIDB4MTUpLCBuZXcgQXJyYXkoMHgwRDBDLCAweDE2KSwgbmV3IEFycmF5KDB4MDgzQiwgMHgxNyksIG5ldyBBcnJheSgweDM1NUYsIDB4MTgpLCBuZXcgQXJyYXkoMHgzMDY4LCAweDE5KSwgbmV3IEFycmF5KDB4M0YzMSwgMHgxQSksIG5ldyBBcnJheSgweDNBMDYsIDB4MUIpLCBuZXcgQXJyYXkoMHgyNEI0LCAweDFDKSwgbmV3IEFycmF5KDB4MjE4MywgMHgxRCksIG5ldyBBcnJheSgweDJFREEsIDB4MUUpLCBuZXcgQXJyYXkoMHgyQkVELCAweDFGKSk7XG52YXIgQklUU19TRVRfSU5fSEFMRl9CWVRFID0gbmV3IEFycmF5KDAsIDEsIDEsIDIsIDEsIDIsIDIsIDMsIDEsIDIsIDIsIDMsIDIsIDMsIDMsIDQpO1xuXG5cbmZ1bmN0aW9uIEZvcm1hdEluZm9ybWF0aW9uKGZvcm1hdEluZm8pXG57XG5cdHRoaXMuZXJyb3JDb3JyZWN0aW9uTGV2ZWwgPSBFcnJvckNvcnJlY3Rpb25MZXZlbC5mb3JCaXRzKChmb3JtYXRJbmZvID4+IDMpICYgMHgwMyk7XG5cdHRoaXMuZGF0YU1hc2sgPSAgKGZvcm1hdEluZm8gJiAweDA3KTtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIkVycm9yQ29ycmVjdGlvbkxldmVsXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5lcnJvckNvcnJlY3Rpb25MZXZlbDtcblx0fX0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIkRhdGFNYXNrXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5kYXRhTWFzaztcblx0fX0pO1xuXHR0aGlzLkdldEhhc2hDb2RlPWZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiAodGhpcy5lcnJvckNvcnJlY3Rpb25MZXZlbC5vcmRpbmFsKCkgPDwgMykgfCAgZGF0YU1hc2s7XG5cdH1cblx0dGhpcy5FcXVhbHM9ZnVuY3Rpb24oIG8pXG5cdHtcblx0XHR2YXIgb3RoZXIgPSAgbztcblx0XHRyZXR1cm4gdGhpcy5lcnJvckNvcnJlY3Rpb25MZXZlbCA9PSBvdGhlci5lcnJvckNvcnJlY3Rpb25MZXZlbCAmJiB0aGlzLmRhdGFNYXNrID09IG90aGVyLmRhdGFNYXNrO1xuXHR9XG59XG5cbkZvcm1hdEluZm9ybWF0aW9uLm51bUJpdHNEaWZmZXJpbmc9ZnVuY3Rpb24oIGEsICBiKVxue1xuXHRhIF49IGI7IC8vIGEgbm93IGhhcyBhIDEgYml0IGV4YWN0bHkgd2hlcmUgaXRzIGJpdCBkaWZmZXJzIHdpdGggYidzXG5cdC8vIENvdW50IGJpdHMgc2V0IHF1aWNrbHkgd2l0aCBhIHNlcmllcyBvZiBsb29rdXBzOlxuXHRyZXR1cm4gQklUU19TRVRfSU5fSEFMRl9CWVRFW2EgJiAweDBGXSArIEJJVFNfU0VUX0lOX0hBTEZfQllURVsoVVJTaGlmdChhLCA0KSAmIDB4MEYpXSArIEJJVFNfU0VUX0lOX0hBTEZfQllURVsoVVJTaGlmdChhLCA4KSAmIDB4MEYpXSArIEJJVFNfU0VUX0lOX0hBTEZfQllURVsoVVJTaGlmdChhLCAxMikgJiAweDBGKV0gKyBCSVRTX1NFVF9JTl9IQUxGX0JZVEVbKFVSU2hpZnQoYSwgMTYpICYgMHgwRildICsgQklUU19TRVRfSU5fSEFMRl9CWVRFWyhVUlNoaWZ0KGEsIDIwKSAmIDB4MEYpXSArIEJJVFNfU0VUX0lOX0hBTEZfQllURVsoVVJTaGlmdChhLCAyNCkgJiAweDBGKV0gKyBCSVRTX1NFVF9JTl9IQUxGX0JZVEVbKFVSU2hpZnQoYSwgMjgpICYgMHgwRildO1xufVxuXG5Gb3JtYXRJbmZvcm1hdGlvbi5kZWNvZGVGb3JtYXRJbmZvcm1hdGlvbj1mdW5jdGlvbiggbWFza2VkRm9ybWF0SW5mbylcbntcblx0dmFyIGZvcm1hdEluZm8gPSBGb3JtYXRJbmZvcm1hdGlvbi5kb0RlY29kZUZvcm1hdEluZm9ybWF0aW9uKG1hc2tlZEZvcm1hdEluZm8pO1xuXHRpZiAoZm9ybWF0SW5mbyAhPSBudWxsKVxuXHR7XG5cdFx0cmV0dXJuIGZvcm1hdEluZm87XG5cdH1cblx0Ly8gU2hvdWxkIHJldHVybiBudWxsLCBidXQsIHNvbWUgUVIgY29kZXMgYXBwYXJlbnRseVxuXHQvLyBkbyBub3QgbWFzayB0aGlzIGluZm8uIFRyeSBhZ2FpbiBieSBhY3R1YWxseSBtYXNraW5nIHRoZSBwYXR0ZXJuXG5cdC8vIGZpcnN0XG5cdHJldHVybiBGb3JtYXRJbmZvcm1hdGlvbi5kb0RlY29kZUZvcm1hdEluZm9ybWF0aW9uKG1hc2tlZEZvcm1hdEluZm8gXiBGT1JNQVRfSU5GT19NQVNLX1FSKTtcbn1cbkZvcm1hdEluZm9ybWF0aW9uLmRvRGVjb2RlRm9ybWF0SW5mb3JtYXRpb249ZnVuY3Rpb24oIG1hc2tlZEZvcm1hdEluZm8pXG57XG5cdC8vIEZpbmQgdGhlIGludCBpbiBGT1JNQVRfSU5GT19ERUNPREVfTE9PS1VQIHdpdGggZmV3ZXN0IGJpdHMgZGlmZmVyaW5nXG5cdHZhciBiZXN0RGlmZmVyZW5jZSA9IDB4ZmZmZmZmZmY7XG5cdHZhciBiZXN0Rm9ybWF0SW5mbyA9IDA7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgRk9STUFUX0lORk9fREVDT0RFX0xPT0tVUC5sZW5ndGg7IGkrKylcblx0e1xuXHRcdHZhciBkZWNvZGVJbmZvID0gRk9STUFUX0lORk9fREVDT0RFX0xPT0tVUFtpXTtcblx0XHR2YXIgdGFyZ2V0SW5mbyA9IGRlY29kZUluZm9bMF07XG5cdFx0aWYgKHRhcmdldEluZm8gPT0gbWFza2VkRm9ybWF0SW5mbylcblx0XHR7XG5cdFx0XHQvLyBGb3VuZCBhbiBleGFjdCBtYXRjaFxuXHRcdFx0cmV0dXJuIG5ldyBGb3JtYXRJbmZvcm1hdGlvbihkZWNvZGVJbmZvWzFdKTtcblx0XHR9XG5cdFx0dmFyIGJpdHNEaWZmZXJlbmNlID0gdGhpcy5udW1CaXRzRGlmZmVyaW5nKG1hc2tlZEZvcm1hdEluZm8sIHRhcmdldEluZm8pO1xuXHRcdGlmIChiaXRzRGlmZmVyZW5jZSA8IGJlc3REaWZmZXJlbmNlKVxuXHRcdHtcblx0XHRcdGJlc3RGb3JtYXRJbmZvID0gZGVjb2RlSW5mb1sxXTtcblx0XHRcdGJlc3REaWZmZXJlbmNlID0gYml0c0RpZmZlcmVuY2U7XG5cdFx0fVxuXHR9XG5cdC8vIEhhbW1pbmcgZGlzdGFuY2Ugb2YgdGhlIDMyIG1hc2tlZCBjb2RlcyBpcyA3LCBieSBjb25zdHJ1Y3Rpb24sIHNvIDw9IDMgYml0c1xuXHQvLyBkaWZmZXJpbmcgbWVhbnMgd2UgZm91bmQgYSBtYXRjaFxuXHRpZiAoYmVzdERpZmZlcmVuY2UgPD0gMylcblx0e1xuXHRcdHJldHVybiBuZXcgRm9ybWF0SW5mb3JtYXRpb24oYmVzdEZvcm1hdEluZm8pO1xuXHR9XG5cdHJldHVybiBudWxsO1xufVxuXG5cblxuLypcbiAgUG9ydGVkIHRvIEphdmFTY3JpcHQgYnkgTGF6YXIgTGFzemxvIDIwMTFcblxuICBsYXphcnNvZnRAZ21haWwuY29tLCB3d3cubGF6YXJzb2Z0LmluZm9cblxuKi9cblxuLypcbipcbiogQ29weXJpZ2h0IDIwMDcgWlhpbmcgYXV0aG9yc1xuKlxuKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4qIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuKlxuKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuKlxuKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4qIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4qIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5cbmZ1bmN0aW9uIEVycm9yQ29ycmVjdGlvbkxldmVsKG9yZGluYWwsICBiaXRzLCBuYW1lKVxue1xuXHR0aGlzLm9yZGluYWxfUmVuYW1lZF9GaWVsZCA9IG9yZGluYWw7XG5cdHRoaXMuYml0cyA9IGJpdHM7XG5cdHRoaXMubmFtZSA9IG5hbWU7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiQml0c1wiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuYml0cztcblx0fX0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIk5hbWVcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiB0aGlzLm5hbWU7XG5cdH19KTtcblx0dGhpcy5vcmRpbmFsPWZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiB0aGlzLm9yZGluYWxfUmVuYW1lZF9GaWVsZDtcblx0fVxufVxuXG5FcnJvckNvcnJlY3Rpb25MZXZlbC5mb3JCaXRzPWZ1bmN0aW9uKCBiaXRzKVxue1xuXHRpZiAoYml0cyA8IDAgfHwgYml0cyA+PSBGT1JfQklUUy5sZW5ndGgpXG5cdHtcblx0XHR0aHJvdyBcIkFyZ3VtZW50RXhjZXB0aW9uXCI7XG5cdH1cblx0cmV0dXJuIEZPUl9CSVRTW2JpdHNdO1xufVxuXG52YXIgRk9SX0JJVFMgPSBuZXcgQXJyYXkoXG5cdG5ldyBFcnJvckNvcnJlY3Rpb25MZXZlbCgxLCAweDAwLCBcIk1cIiksXG5cdG5ldyBFcnJvckNvcnJlY3Rpb25MZXZlbCgwLCAweDAxLCBcIkxcIiksXG5cdG5ldyBFcnJvckNvcnJlY3Rpb25MZXZlbCgzLCAweDAyLCBcIkhcIiksXG5cdG5ldyBFcnJvckNvcnJlY3Rpb25MZXZlbCgyLCAweDAzLCBcIlFcIilcbik7XG5cbi8qXG4gIFBvcnRlZCB0byBKYXZhU2NyaXB0IGJ5IExhemFyIExhc3psbyAyMDExXG5cbiAgbGF6YXJzb2Z0QGdtYWlsLmNvbSwgd3d3LmxhemFyc29mdC5pbmZvXG5cbiovXG5cbi8qXG4qXG4qIENvcHlyaWdodCAyMDA3IFpYaW5nIGF1dGhvcnNcbipcbiogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbipcbiogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbipcbiogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4qIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4qIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuXG5mdW5jdGlvbiBCaXRNYXRyaXgoIHdpZHRoLCAgaGVpZ2h0KVxue1xuXHRpZighaGVpZ2h0KVxuXHRcdGhlaWdodD13aWR0aDtcblx0aWYgKHdpZHRoIDwgMSB8fCBoZWlnaHQgPCAxKVxuXHR7XG5cdFx0dGhyb3cgXCJCb3RoIGRpbWVuc2lvbnMgbXVzdCBiZSBncmVhdGVyIHRoYW4gMFwiO1xuXHR9XG5cdHRoaXMud2lkdGggPSB3aWR0aDtcblx0dGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG5cdHZhciByb3dTaXplID0gd2lkdGggPj4gNTtcblx0aWYgKCh3aWR0aCAmIDB4MWYpICE9IDApXG5cdHtcblx0XHRyb3dTaXplKys7XG5cdH1cblx0dGhpcy5yb3dTaXplID0gcm93U2l6ZTtcblx0dGhpcy5iaXRzID0gbmV3IEFycmF5KHJvd1NpemUgKiBoZWlnaHQpO1xuXHRmb3IodmFyIGk9MDtpPHRoaXMuYml0cy5sZW5ndGg7aSsrKVxuXHRcdHRoaXMuYml0c1tpXT0wO1xuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiV2lkdGhcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiB0aGlzLndpZHRoO1xuXHR9fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiSGVpZ2h0XCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5oZWlnaHQ7XG5cdH19KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJEaW1lbnNpb25cIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdGlmICh0aGlzLndpZHRoICE9IHRoaXMuaGVpZ2h0KVxuXHRcdHtcblx0XHRcdHRocm93IFwiQ2FuJ3QgY2FsbCBnZXREaW1lbnNpb24oKSBvbiBhIG5vbi1zcXVhcmUgbWF0cml4XCI7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLndpZHRoO1xuXHR9fSk7XG5cblx0dGhpcy5nZXRfUmVuYW1lZD1mdW5jdGlvbiggeCwgIHkpXG5cdFx0e1xuXHRcdFx0dmFyIG9mZnNldCA9IHkgKiB0aGlzLnJvd1NpemUgKyAoeCA+PiA1KTtcblx0XHRcdHJldHVybiAoKFVSU2hpZnQodGhpcy5iaXRzW29mZnNldF0sICh4ICYgMHgxZikpKSAmIDEpICE9IDA7XG5cdFx0fVxuXHR0aGlzLnNldF9SZW5hbWVkPWZ1bmN0aW9uKCB4LCAgeSlcblx0XHR7XG5cdFx0XHR2YXIgb2Zmc2V0ID0geSAqIHRoaXMucm93U2l6ZSArICh4ID4+IDUpO1xuXHRcdFx0dGhpcy5iaXRzW29mZnNldF0gfD0gMSA8PCAoeCAmIDB4MWYpO1xuXHRcdH1cblx0dGhpcy5mbGlwPWZ1bmN0aW9uKCB4LCAgeSlcblx0XHR7XG5cdFx0XHR2YXIgb2Zmc2V0ID0geSAqIHRoaXMucm93U2l6ZSArICh4ID4+IDUpO1xuXHRcdFx0dGhpcy5iaXRzW29mZnNldF0gXj0gMSA8PCAoeCAmIDB4MWYpO1xuXHRcdH1cblx0dGhpcy5jbGVhcj1mdW5jdGlvbigpXG5cdFx0e1xuXHRcdFx0dmFyIG1heCA9IHRoaXMuYml0cy5sZW5ndGg7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1heDsgaSsrKVxuXHRcdFx0e1xuXHRcdFx0XHR0aGlzLmJpdHNbaV0gPSAwO1xuXHRcdFx0fVxuXHRcdH1cblx0dGhpcy5zZXRSZWdpb249ZnVuY3Rpb24oIGxlZnQsICB0b3AsICB3aWR0aCwgIGhlaWdodClcblx0XHR7XG5cdFx0XHRpZiAodG9wIDwgMCB8fCBsZWZ0IDwgMClcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgXCJMZWZ0IGFuZCB0b3AgbXVzdCBiZSBub25uZWdhdGl2ZVwiO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGhlaWdodCA8IDEgfHwgd2lkdGggPCAxKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBcIkhlaWdodCBhbmQgd2lkdGggbXVzdCBiZSBhdCBsZWFzdCAxXCI7XG5cdFx0XHR9XG5cdFx0XHR2YXIgcmlnaHQgPSBsZWZ0ICsgd2lkdGg7XG5cdFx0XHR2YXIgYm90dG9tID0gdG9wICsgaGVpZ2h0O1xuXHRcdFx0aWYgKGJvdHRvbSA+IHRoaXMuaGVpZ2h0IHx8IHJpZ2h0ID4gdGhpcy53aWR0aClcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgXCJUaGUgcmVnaW9uIG11c3QgZml0IGluc2lkZSB0aGUgbWF0cml4XCI7XG5cdFx0XHR9XG5cdFx0XHRmb3IgKHZhciB5ID0gdG9wOyB5IDwgYm90dG9tOyB5KyspXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBvZmZzZXQgPSB5ICogdGhpcy5yb3dTaXplO1xuXHRcdFx0XHRmb3IgKHZhciB4ID0gbGVmdDsgeCA8IHJpZ2h0OyB4KyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0aGlzLmJpdHNbb2Zmc2V0ICsgKHggPj4gNSldIHw9IDEgPDwgKHggJiAweDFmKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cbn1cblxuLypcbiAgUG9ydGVkIHRvIEphdmFTY3JpcHQgYnkgTGF6YXIgTGFzemxvIDIwMTFcblxuICBsYXphcnNvZnRAZ21haWwuY29tLCB3d3cubGF6YXJzb2Z0LmluZm9cblxuKi9cblxuLypcbipcbiogQ29weXJpZ2h0IDIwMDcgWlhpbmcgYXV0aG9yc1xuKlxuKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4qIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuKlxuKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuKlxuKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4qIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4qIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5cbmZ1bmN0aW9uIERhdGFCbG9jayhudW1EYXRhQ29kZXdvcmRzLCAgY29kZXdvcmRzKVxue1xuXHR0aGlzLm51bURhdGFDb2Rld29yZHMgPSBudW1EYXRhQ29kZXdvcmRzO1xuXHR0aGlzLmNvZGV3b3JkcyA9IGNvZGV3b3JkcztcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIk51bURhdGFDb2Rld29yZHNcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiB0aGlzLm51bURhdGFDb2Rld29yZHM7XG5cdH19KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJDb2Rld29yZHNcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiB0aGlzLmNvZGV3b3Jkcztcblx0fX0pO1xufVxuXG5EYXRhQmxvY2suZ2V0RGF0YUJsb2Nrcz1mdW5jdGlvbihyYXdDb2Rld29yZHMsICB2ZXJzaW9uLCAgZWNMZXZlbClcbntcblxuXHRpZiAocmF3Q29kZXdvcmRzLmxlbmd0aCAhPSB2ZXJzaW9uLlRvdGFsQ29kZXdvcmRzKVxuXHR7XG5cdFx0dGhyb3cgXCJBcmd1bWVudEV4Y2VwdGlvblwiO1xuXHR9XG5cblx0Ly8gRmlndXJlIG91dCB0aGUgbnVtYmVyIGFuZCBzaXplIG9mIGRhdGEgYmxvY2tzIHVzZWQgYnkgdGhpcyB2ZXJzaW9uIGFuZFxuXHQvLyBlcnJvciBjb3JyZWN0aW9uIGxldmVsXG5cdHZhciBlY0Jsb2NrcyA9IHZlcnNpb24uZ2V0RUNCbG9ja3NGb3JMZXZlbChlY0xldmVsKTtcblxuXHQvLyBGaXJzdCBjb3VudCB0aGUgdG90YWwgbnVtYmVyIG9mIGRhdGEgYmxvY2tzXG5cdHZhciB0b3RhbEJsb2NrcyA9IDA7XG5cdHZhciBlY0Jsb2NrQXJyYXkgPSBlY0Jsb2Nrcy5nZXRFQ0Jsb2NrcygpO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGVjQmxvY2tBcnJheS5sZW5ndGg7IGkrKylcblx0e1xuXHRcdHRvdGFsQmxvY2tzICs9IGVjQmxvY2tBcnJheVtpXS5Db3VudDtcblx0fVxuXG5cdC8vIE5vdyBlc3RhYmxpc2ggRGF0YUJsb2NrcyBvZiB0aGUgYXBwcm9wcmlhdGUgc2l6ZSBhbmQgbnVtYmVyIG9mIGRhdGEgY29kZXdvcmRzXG5cdHZhciByZXN1bHQgPSBuZXcgQXJyYXkodG90YWxCbG9ja3MpO1xuXHR2YXIgbnVtUmVzdWx0QmxvY2tzID0gMDtcblx0Zm9yICh2YXIgaiA9IDA7IGogPCBlY0Jsb2NrQXJyYXkubGVuZ3RoOyBqKyspXG5cdHtcblx0XHR2YXIgZWNCbG9jayA9IGVjQmxvY2tBcnJheVtqXTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGVjQmxvY2suQ291bnQ7IGkrKylcblx0XHR7XG5cdFx0XHR2YXIgbnVtRGF0YUNvZGV3b3JkcyA9IGVjQmxvY2suRGF0YUNvZGV3b3Jkcztcblx0XHRcdHZhciBudW1CbG9ja0NvZGV3b3JkcyA9IGVjQmxvY2tzLkVDQ29kZXdvcmRzUGVyQmxvY2sgKyBudW1EYXRhQ29kZXdvcmRzO1xuXHRcdFx0cmVzdWx0W251bVJlc3VsdEJsb2NrcysrXSA9IG5ldyBEYXRhQmxvY2sobnVtRGF0YUNvZGV3b3JkcywgbmV3IEFycmF5KG51bUJsb2NrQ29kZXdvcmRzKSk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gQWxsIGJsb2NrcyBoYXZlIHRoZSBzYW1lIGFtb3VudCBvZiBkYXRhLCBleGNlcHQgdGhhdCB0aGUgbGFzdCBuXG5cdC8vICh3aGVyZSBuIG1heSBiZSAwKSBoYXZlIDEgbW9yZSBieXRlLiBGaWd1cmUgb3V0IHdoZXJlIHRoZXNlIHN0YXJ0LlxuXHR2YXIgc2hvcnRlckJsb2Nrc1RvdGFsQ29kZXdvcmRzID0gcmVzdWx0WzBdLmNvZGV3b3Jkcy5sZW5ndGg7XG5cdHZhciBsb25nZXJCbG9ja3NTdGFydEF0ID0gcmVzdWx0Lmxlbmd0aCAtIDE7XG5cdHdoaWxlIChsb25nZXJCbG9ja3NTdGFydEF0ID49IDApXG5cdHtcblx0XHR2YXIgbnVtQ29kZXdvcmRzID0gcmVzdWx0W2xvbmdlckJsb2Nrc1N0YXJ0QXRdLmNvZGV3b3Jkcy5sZW5ndGg7XG5cdFx0aWYgKG51bUNvZGV3b3JkcyA9PSBzaG9ydGVyQmxvY2tzVG90YWxDb2Rld29yZHMpXG5cdFx0e1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdGxvbmdlckJsb2Nrc1N0YXJ0QXQtLTtcblx0fVxuXHRsb25nZXJCbG9ja3NTdGFydEF0Kys7XG5cblx0dmFyIHNob3J0ZXJCbG9ja3NOdW1EYXRhQ29kZXdvcmRzID0gc2hvcnRlckJsb2Nrc1RvdGFsQ29kZXdvcmRzIC0gZWNCbG9ja3MuRUNDb2Rld29yZHNQZXJCbG9jaztcblx0Ly8gVGhlIGxhc3QgZWxlbWVudHMgb2YgcmVzdWx0IG1heSBiZSAxIGVsZW1lbnQgbG9uZ2VyO1xuXHQvLyBmaXJzdCBmaWxsIG91dCBhcyBtYW55IGVsZW1lbnRzIGFzIGFsbCBvZiB0aGVtIGhhdmVcblx0dmFyIHJhd0NvZGV3b3Jkc09mZnNldCA9IDA7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc2hvcnRlckJsb2Nrc051bURhdGFDb2Rld29yZHM7IGkrKylcblx0e1xuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgbnVtUmVzdWx0QmxvY2tzOyBqKyspXG5cdFx0e1xuXHRcdFx0cmVzdWx0W2pdLmNvZGV3b3Jkc1tpXSA9IHJhd0NvZGV3b3Jkc1tyYXdDb2Rld29yZHNPZmZzZXQrK107XG5cdFx0fVxuXHR9XG5cdC8vIEZpbGwgb3V0IHRoZSBsYXN0IGRhdGEgYmxvY2sgaW4gdGhlIGxvbmdlciBvbmVzXG5cdGZvciAodmFyIGogPSBsb25nZXJCbG9ja3NTdGFydEF0OyBqIDwgbnVtUmVzdWx0QmxvY2tzOyBqKyspXG5cdHtcblx0XHRyZXN1bHRbal0uY29kZXdvcmRzW3Nob3J0ZXJCbG9ja3NOdW1EYXRhQ29kZXdvcmRzXSA9IHJhd0NvZGV3b3Jkc1tyYXdDb2Rld29yZHNPZmZzZXQrK107XG5cdH1cblx0Ly8gTm93IGFkZCBpbiBlcnJvciBjb3JyZWN0aW9uIGJsb2Nrc1xuXHR2YXIgbWF4ID0gcmVzdWx0WzBdLmNvZGV3b3Jkcy5sZW5ndGg7XG5cdGZvciAodmFyIGkgPSBzaG9ydGVyQmxvY2tzTnVtRGF0YUNvZGV3b3JkczsgaSA8IG1heDsgaSsrKVxuXHR7XG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBudW1SZXN1bHRCbG9ja3M7IGorKylcblx0XHR7XG5cdFx0XHR2YXIgaU9mZnNldCA9IGogPCBsb25nZXJCbG9ja3NTdGFydEF0P2k6aSArIDE7XG5cdFx0XHRyZXN1bHRbal0uY29kZXdvcmRzW2lPZmZzZXRdID0gcmF3Q29kZXdvcmRzW3Jhd0NvZGV3b3Jkc09mZnNldCsrXTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuLypcbiAgUG9ydGVkIHRvIEphdmFTY3JpcHQgYnkgTGF6YXIgTGFzemxvIDIwMTFcblxuICBsYXphcnNvZnRAZ21haWwuY29tLCB3d3cubGF6YXJzb2Z0LmluZm9cblxuKi9cblxuLypcbipcbiogQ29weXJpZ2h0IDIwMDcgWlhpbmcgYXV0aG9yc1xuKlxuKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4qIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuKlxuKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuKlxuKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4qIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4qIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5cbmZ1bmN0aW9uIEJpdE1hdHJpeFBhcnNlcihiaXRNYXRyaXgpXG57XG5cdHZhciBkaW1lbnNpb24gPSBiaXRNYXRyaXguRGltZW5zaW9uO1xuXHRpZiAoZGltZW5zaW9uIDwgMjEgfHwgKGRpbWVuc2lvbiAmIDB4MDMpICE9IDEpXG5cdHtcblx0XHR0aHJvdyBcIkVycm9yIEJpdE1hdHJpeFBhcnNlclwiO1xuXHR9XG5cdHRoaXMuYml0TWF0cml4ID0gYml0TWF0cml4O1xuXHR0aGlzLnBhcnNlZFZlcnNpb24gPSBudWxsO1xuXHR0aGlzLnBhcnNlZEZvcm1hdEluZm8gPSBudWxsO1xuXG5cdHRoaXMuY29weUJpdD1mdW5jdGlvbiggaSwgIGosICB2ZXJzaW9uQml0cylcblx0e1xuXHRcdHJldHVybiB0aGlzLmJpdE1hdHJpeC5nZXRfUmVuYW1lZChpLCBqKT8odmVyc2lvbkJpdHMgPDwgMSkgfCAweDE6dmVyc2lvbkJpdHMgPDwgMTtcblx0fVxuXG5cdHRoaXMucmVhZEZvcm1hdEluZm9ybWF0aW9uPWZ1bmN0aW9uKClcblx0e1xuXHRcdFx0aWYgKHRoaXMucGFyc2VkRm9ybWF0SW5mbyAhPSBudWxsKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5wYXJzZWRGb3JtYXRJbmZvO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBSZWFkIHRvcC1sZWZ0IGZvcm1hdCBpbmZvIGJpdHNcblx0XHRcdHZhciBmb3JtYXRJbmZvQml0cyA9IDA7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IDY7IGkrKylcblx0XHRcdHtcblx0XHRcdFx0Zm9ybWF0SW5mb0JpdHMgPSB0aGlzLmNvcHlCaXQoaSwgOCwgZm9ybWF0SW5mb0JpdHMpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gLi4gYW5kIHNraXAgYSBiaXQgaW4gdGhlIHRpbWluZyBwYXR0ZXJuIC4uLlxuXHRcdFx0Zm9ybWF0SW5mb0JpdHMgPSB0aGlzLmNvcHlCaXQoNywgOCwgZm9ybWF0SW5mb0JpdHMpO1xuXHRcdFx0Zm9ybWF0SW5mb0JpdHMgPSB0aGlzLmNvcHlCaXQoOCwgOCwgZm9ybWF0SW5mb0JpdHMpO1xuXHRcdFx0Zm9ybWF0SW5mb0JpdHMgPSB0aGlzLmNvcHlCaXQoOCwgNywgZm9ybWF0SW5mb0JpdHMpO1xuXHRcdFx0Ly8gLi4gYW5kIHNraXAgYSBiaXQgaW4gdGhlIHRpbWluZyBwYXR0ZXJuIC4uLlxuXHRcdFx0Zm9yICh2YXIgaiA9IDU7IGogPj0gMDsgai0tKVxuXHRcdFx0e1xuXHRcdFx0XHRmb3JtYXRJbmZvQml0cyA9IHRoaXMuY29weUJpdCg4LCBqLCBmb3JtYXRJbmZvQml0cyk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMucGFyc2VkRm9ybWF0SW5mbyA9IEZvcm1hdEluZm9ybWF0aW9uLmRlY29kZUZvcm1hdEluZm9ybWF0aW9uKGZvcm1hdEluZm9CaXRzKTtcblx0XHRcdGlmICh0aGlzLnBhcnNlZEZvcm1hdEluZm8gIT0gbnVsbClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHRoaXMucGFyc2VkRm9ybWF0SW5mbztcblx0XHRcdH1cblxuXHRcdFx0Ly8gSG1tLCBmYWlsZWQuIFRyeSB0aGUgdG9wLXJpZ2h0L2JvdHRvbS1sZWZ0IHBhdHRlcm5cblx0XHRcdHZhciBkaW1lbnNpb24gPSB0aGlzLmJpdE1hdHJpeC5EaW1lbnNpb247XG5cdFx0XHRmb3JtYXRJbmZvQml0cyA9IDA7XG5cdFx0XHR2YXIgaU1pbiA9IGRpbWVuc2lvbiAtIDg7XG5cdFx0XHRmb3IgKHZhciBpID0gZGltZW5zaW9uIC0gMTsgaSA+PSBpTWluOyBpLS0pXG5cdFx0XHR7XG5cdFx0XHRcdGZvcm1hdEluZm9CaXRzID0gdGhpcy5jb3B5Qml0KGksIDgsIGZvcm1hdEluZm9CaXRzKTtcblx0XHRcdH1cblx0XHRcdGZvciAodmFyIGogPSBkaW1lbnNpb24gLSA3OyBqIDwgZGltZW5zaW9uOyBqKyspXG5cdFx0XHR7XG5cdFx0XHRcdGZvcm1hdEluZm9CaXRzID0gdGhpcy5jb3B5Qml0KDgsIGosIGZvcm1hdEluZm9CaXRzKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5wYXJzZWRGb3JtYXRJbmZvID0gRm9ybWF0SW5mb3JtYXRpb24uZGVjb2RlRm9ybWF0SW5mb3JtYXRpb24oZm9ybWF0SW5mb0JpdHMpO1xuXHRcdFx0aWYgKHRoaXMucGFyc2VkRm9ybWF0SW5mbyAhPSBudWxsKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5wYXJzZWRGb3JtYXRJbmZvO1xuXHRcdFx0fVxuXHRcdFx0dGhyb3cgXCJFcnJvciByZWFkRm9ybWF0SW5mb3JtYXRpb25cIjtcblx0fVxuXHR0aGlzLnJlYWRWZXJzaW9uPWZ1bmN0aW9uKClcblx0XHR7XG5cblx0XHRcdGlmICh0aGlzLnBhcnNlZFZlcnNpb24gIT0gbnVsbClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHRoaXMucGFyc2VkVmVyc2lvbjtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGRpbWVuc2lvbiA9IHRoaXMuYml0TWF0cml4LkRpbWVuc2lvbjtcblxuXHRcdFx0dmFyIHByb3Zpc2lvbmFsVmVyc2lvbiA9IChkaW1lbnNpb24gLSAxNykgPj4gMjtcblx0XHRcdGlmIChwcm92aXNpb25hbFZlcnNpb24gPD0gNilcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIFZlcnNpb24uZ2V0VmVyc2lvbkZvck51bWJlcihwcm92aXNpb25hbFZlcnNpb24pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBSZWFkIHRvcC1yaWdodCB2ZXJzaW9uIGluZm86IDMgd2lkZSBieSA2IHRhbGxcblx0XHRcdHZhciB2ZXJzaW9uQml0cyA9IDA7XG5cdFx0XHR2YXIgaWpNaW4gPSBkaW1lbnNpb24gLSAxMTtcblx0XHRcdGZvciAodmFyIGogPSA1OyBqID49IDA7IGotLSlcblx0XHRcdHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IGRpbWVuc2lvbiAtIDk7IGkgPj0gaWpNaW47IGktLSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZlcnNpb25CaXRzID0gdGhpcy5jb3B5Qml0KGksIGosIHZlcnNpb25CaXRzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnBhcnNlZFZlcnNpb24gPSBWZXJzaW9uLmRlY29kZVZlcnNpb25JbmZvcm1hdGlvbih2ZXJzaW9uQml0cyk7XG5cdFx0XHRpZiAodGhpcy5wYXJzZWRWZXJzaW9uICE9IG51bGwgJiYgdGhpcy5wYXJzZWRWZXJzaW9uLkRpbWVuc2lvbkZvclZlcnNpb24gPT0gZGltZW5zaW9uKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5wYXJzZWRWZXJzaW9uO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBIbW0sIGZhaWxlZC4gVHJ5IGJvdHRvbSBsZWZ0OiA2IHdpZGUgYnkgMyB0YWxsXG5cdFx0XHR2ZXJzaW9uQml0cyA9IDA7XG5cdFx0XHRmb3IgKHZhciBpID0gNTsgaSA+PSAwOyBpLS0pXG5cdFx0XHR7XG5cdFx0XHRcdGZvciAodmFyIGogPSBkaW1lbnNpb24gLSA5OyBqID49IGlqTWluOyBqLS0pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2ZXJzaW9uQml0cyA9IHRoaXMuY29weUJpdChpLCBqLCB2ZXJzaW9uQml0cyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0dGhpcy5wYXJzZWRWZXJzaW9uID0gVmVyc2lvbi5kZWNvZGVWZXJzaW9uSW5mb3JtYXRpb24odmVyc2lvbkJpdHMpO1xuXHRcdFx0aWYgKHRoaXMucGFyc2VkVmVyc2lvbiAhPSBudWxsICYmIHRoaXMucGFyc2VkVmVyc2lvbi5EaW1lbnNpb25Gb3JWZXJzaW9uID09IGRpbWVuc2lvbilcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHRoaXMucGFyc2VkVmVyc2lvbjtcblx0XHRcdH1cblx0XHRcdHRocm93IFwiRXJyb3IgcmVhZFZlcnNpb25cIjtcblx0XHR9XG5cdHRoaXMucmVhZENvZGV3b3Jkcz1mdW5jdGlvbigpXG5cdFx0e1xuXG5cdFx0XHR2YXIgZm9ybWF0SW5mbyA9IHRoaXMucmVhZEZvcm1hdEluZm9ybWF0aW9uKCk7XG5cdFx0XHR2YXIgdmVyc2lvbiA9IHRoaXMucmVhZFZlcnNpb24oKTtcblxuXHRcdFx0Ly8gR2V0IHRoZSBkYXRhIG1hc2sgZm9yIHRoZSBmb3JtYXQgdXNlZCBpbiB0aGlzIFFSIENvZGUuIFRoaXMgd2lsbCBleGNsdWRlXG5cdFx0XHQvLyBzb21lIGJpdHMgZnJvbSByZWFkaW5nIGFzIHdlIHdpbmQgdGhyb3VnaCB0aGUgYml0IG1hdHJpeC5cblx0XHRcdHZhciBkYXRhTWFzayA9IERhdGFNYXNrLmZvclJlZmVyZW5jZSggZm9ybWF0SW5mby5EYXRhTWFzayk7XG5cdFx0XHR2YXIgZGltZW5zaW9uID0gdGhpcy5iaXRNYXRyaXguRGltZW5zaW9uO1xuXHRcdFx0ZGF0YU1hc2sudW5tYXNrQml0TWF0cml4KHRoaXMuYml0TWF0cml4LCBkaW1lbnNpb24pO1xuXG5cdFx0XHR2YXIgZnVuY3Rpb25QYXR0ZXJuID0gdmVyc2lvbi5idWlsZEZ1bmN0aW9uUGF0dGVybigpO1xuXG5cdFx0XHR2YXIgcmVhZGluZ1VwID0gdHJ1ZTtcblx0XHRcdHZhciByZXN1bHQgPSBuZXcgQXJyYXkodmVyc2lvbi5Ub3RhbENvZGV3b3Jkcyk7XG5cdFx0XHR2YXIgcmVzdWx0T2Zmc2V0ID0gMDtcblx0XHRcdHZhciBjdXJyZW50Qnl0ZSA9IDA7XG5cdFx0XHR2YXIgYml0c1JlYWQgPSAwO1xuXHRcdFx0Ly8gUmVhZCBjb2x1bW5zIGluIHBhaXJzLCBmcm9tIHJpZ2h0IHRvIGxlZnRcblx0XHRcdGZvciAodmFyIGogPSBkaW1lbnNpb24gLSAxOyBqID4gMDsgaiAtPSAyKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoaiA9PSA2KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gU2tpcCB3aG9sZSBjb2x1bW4gd2l0aCB2ZXJ0aWNhbCBhbGlnbm1lbnQgcGF0dGVybjtcblx0XHRcdFx0XHQvLyBzYXZlcyB0aW1lIGFuZCBtYWtlcyB0aGUgb3RoZXIgY29kZSBwcm9jZWVkIG1vcmUgY2xlYW5seVxuXHRcdFx0XHRcdGotLTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBSZWFkIGFsdGVybmF0aW5nbHkgZnJvbSBib3R0b20gdG8gdG9wIHRoZW4gdG9wIHRvIGJvdHRvbVxuXHRcdFx0XHRmb3IgKHZhciBjb3VudCA9IDA7IGNvdW50IDwgZGltZW5zaW9uOyBjb3VudCsrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dmFyIGkgPSByZWFkaW5nVXA/ZGltZW5zaW9uIC0gMSAtIGNvdW50OmNvdW50O1xuXHRcdFx0XHRcdGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IDI7IGNvbCsrKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIElnbm9yZSBiaXRzIGNvdmVyZWQgYnkgdGhlIGZ1bmN0aW9uIHBhdHRlcm5cblx0XHRcdFx0XHRcdGlmICghZnVuY3Rpb25QYXR0ZXJuLmdldF9SZW5hbWVkKGogLSBjb2wsIGkpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHQvLyBSZWFkIGEgYml0XG5cdFx0XHRcdFx0XHRcdGJpdHNSZWFkKys7XG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRCeXRlIDw8PSAxO1xuXHRcdFx0XHRcdFx0XHRpZiAodGhpcy5iaXRNYXRyaXguZ2V0X1JlbmFtZWQoaiAtIGNvbCwgaSkpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRjdXJyZW50Qnl0ZSB8PSAxO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdC8vIElmIHdlJ3ZlIG1hZGUgYSB3aG9sZSBieXRlLCBzYXZlIGl0IG9mZlxuXHRcdFx0XHRcdFx0XHRpZiAoYml0c1JlYWQgPT0gOClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHJlc3VsdFtyZXN1bHRPZmZzZXQrK10gPSAgY3VycmVudEJ5dGU7XG5cdFx0XHRcdFx0XHRcdFx0Yml0c1JlYWQgPSAwO1xuXHRcdFx0XHRcdFx0XHRcdGN1cnJlbnRCeXRlID0gMDtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZWFkaW5nVXAgXj0gdHJ1ZTsgLy8gcmVhZGluZ1VwID0gIXJlYWRpbmdVcDsgLy8gc3dpdGNoIGRpcmVjdGlvbnNcblx0XHRcdH1cblx0XHRcdGlmIChyZXN1bHRPZmZzZXQgIT0gdmVyc2lvbi5Ub3RhbENvZGV3b3Jkcylcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgXCJFcnJvciByZWFkQ29kZXdvcmRzXCI7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cbn1cblxuLypcbiAgUG9ydGVkIHRvIEphdmFTY3JpcHQgYnkgTGF6YXIgTGFzemxvIDIwMTFcblxuICBsYXphcnNvZnRAZ21haWwuY29tLCB3d3cubGF6YXJzb2Z0LmluZm9cblxuKi9cblxuLypcbipcbiogQ29weXJpZ2h0IDIwMDcgWlhpbmcgYXV0aG9yc1xuKlxuKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4qIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuKlxuKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuKlxuKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4qIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4qIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5cbnZhciBEYXRhTWFzayA9IHt9O1xuXG5EYXRhTWFzay5mb3JSZWZlcmVuY2UgPSBmdW5jdGlvbihyZWZlcmVuY2UpXG57XG5cdGlmIChyZWZlcmVuY2UgPCAwIHx8IHJlZmVyZW5jZSA+IDcpXG5cdHtcblx0XHR0aHJvdyBcIlN5c3RlbS5Bcmd1bWVudEV4Y2VwdGlvblwiO1xuXHR9XG5cdHJldHVybiBEYXRhTWFzay5EQVRBX01BU0tTW3JlZmVyZW5jZV07XG59XG5cbmZ1bmN0aW9uIERhdGFNYXNrMDAwKClcbntcblx0dGhpcy51bm1hc2tCaXRNYXRyaXg9ZnVuY3Rpb24oYml0cywgIGRpbWVuc2lvbilcblx0e1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGltZW5zaW9uOyBpKyspXG5cdFx0e1xuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBkaW1lbnNpb247IGorKylcblx0XHRcdHtcblx0XHRcdFx0aWYgKHRoaXMuaXNNYXNrZWQoaSwgaikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRiaXRzLmZsaXAoaiwgaSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0dGhpcy5pc01hc2tlZD1mdW5jdGlvbiggaSwgIGopXG5cdHtcblx0XHRyZXR1cm4gKChpICsgaikgJiAweDAxKSA9PSAwO1xuXHR9XG59XG5cbmZ1bmN0aW9uIERhdGFNYXNrMDAxKClcbntcblx0dGhpcy51bm1hc2tCaXRNYXRyaXg9ZnVuY3Rpb24oYml0cywgIGRpbWVuc2lvbilcblx0e1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGltZW5zaW9uOyBpKyspXG5cdFx0e1xuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBkaW1lbnNpb247IGorKylcblx0XHRcdHtcblx0XHRcdFx0aWYgKHRoaXMuaXNNYXNrZWQoaSwgaikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRiaXRzLmZsaXAoaiwgaSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0dGhpcy5pc01hc2tlZD1mdW5jdGlvbiggaSwgIGopXG5cdHtcblx0XHRyZXR1cm4gKGkgJiAweDAxKSA9PSAwO1xuXHR9XG59XG5cbmZ1bmN0aW9uIERhdGFNYXNrMDEwKClcbntcblx0dGhpcy51bm1hc2tCaXRNYXRyaXg9ZnVuY3Rpb24oYml0cywgIGRpbWVuc2lvbilcblx0e1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGltZW5zaW9uOyBpKyspXG5cdFx0e1xuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBkaW1lbnNpb247IGorKylcblx0XHRcdHtcblx0XHRcdFx0aWYgKHRoaXMuaXNNYXNrZWQoaSwgaikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRiaXRzLmZsaXAoaiwgaSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0dGhpcy5pc01hc2tlZD1mdW5jdGlvbiggaSwgIGopXG5cdHtcblx0XHRyZXR1cm4gaiAlIDMgPT0gMDtcblx0fVxufVxuXG5mdW5jdGlvbiBEYXRhTWFzazAxMSgpXG57XG5cdHRoaXMudW5tYXNrQml0TWF0cml4PWZ1bmN0aW9uKGJpdHMsICBkaW1lbnNpb24pXG5cdHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGRpbWVuc2lvbjsgaSsrKVxuXHRcdHtcblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgZGltZW5zaW9uOyBqKyspXG5cdFx0XHR7XG5cdFx0XHRcdGlmICh0aGlzLmlzTWFza2VkKGksIGopKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Yml0cy5mbGlwKGosIGkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHRoaXMuaXNNYXNrZWQ9ZnVuY3Rpb24oIGksICBqKVxuXHR7XG5cdFx0cmV0dXJuIChpICsgaikgJSAzID09IDA7XG5cdH1cbn1cblxuZnVuY3Rpb24gRGF0YU1hc2sxMDAoKVxue1xuXHR0aGlzLnVubWFza0JpdE1hdHJpeD1mdW5jdGlvbihiaXRzLCAgZGltZW5zaW9uKVxuXHR7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkaW1lbnNpb247IGkrKylcblx0XHR7XG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGRpbWVuc2lvbjsgaisrKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAodGhpcy5pc01hc2tlZChpLCBqKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGJpdHMuZmxpcChqLCBpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHR0aGlzLmlzTWFza2VkPWZ1bmN0aW9uKCBpLCAgailcblx0e1xuXHRcdHJldHVybiAoKChVUlNoaWZ0KGksIDEpKSArIChqIC8gMykpICYgMHgwMSkgPT0gMDtcblx0fVxufVxuXG5mdW5jdGlvbiBEYXRhTWFzazEwMSgpXG57XG5cdHRoaXMudW5tYXNrQml0TWF0cml4PWZ1bmN0aW9uKGJpdHMsICBkaW1lbnNpb24pXG5cdHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGRpbWVuc2lvbjsgaSsrKVxuXHRcdHtcblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgZGltZW5zaW9uOyBqKyspXG5cdFx0XHR7XG5cdFx0XHRcdGlmICh0aGlzLmlzTWFza2VkKGksIGopKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Yml0cy5mbGlwKGosIGkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHRoaXMuaXNNYXNrZWQ9ZnVuY3Rpb24oIGksICBqKVxuXHR7XG5cdFx0dmFyIHRlbXAgPSBpICogajtcblx0XHRyZXR1cm4gKHRlbXAgJiAweDAxKSArICh0ZW1wICUgMykgPT0gMDtcblx0fVxufVxuXG5mdW5jdGlvbiBEYXRhTWFzazExMCgpXG57XG5cdHRoaXMudW5tYXNrQml0TWF0cml4PWZ1bmN0aW9uKGJpdHMsICBkaW1lbnNpb24pXG5cdHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGRpbWVuc2lvbjsgaSsrKVxuXHRcdHtcblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgZGltZW5zaW9uOyBqKyspXG5cdFx0XHR7XG5cdFx0XHRcdGlmICh0aGlzLmlzTWFza2VkKGksIGopKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Yml0cy5mbGlwKGosIGkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHRoaXMuaXNNYXNrZWQ9ZnVuY3Rpb24oIGksICBqKVxuXHR7XG5cdFx0dmFyIHRlbXAgPSBpICogajtcblx0XHRyZXR1cm4gKCgodGVtcCAmIDB4MDEpICsgKHRlbXAgJSAzKSkgJiAweDAxKSA9PSAwO1xuXHR9XG59XG5mdW5jdGlvbiBEYXRhTWFzazExMSgpXG57XG5cdHRoaXMudW5tYXNrQml0TWF0cml4PWZ1bmN0aW9uKGJpdHMsICBkaW1lbnNpb24pXG5cdHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGRpbWVuc2lvbjsgaSsrKVxuXHRcdHtcblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgZGltZW5zaW9uOyBqKyspXG5cdFx0XHR7XG5cdFx0XHRcdGlmICh0aGlzLmlzTWFza2VkKGksIGopKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Yml0cy5mbGlwKGosIGkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHRoaXMuaXNNYXNrZWQ9ZnVuY3Rpb24oIGksICBqKVxuXHR7XG5cdFx0cmV0dXJuICgoKChpICsgaikgJiAweDAxKSArICgoaSAqIGopICUgMykpICYgMHgwMSkgPT0gMDtcblx0fVxufVxuXG5EYXRhTWFzay5EQVRBX01BU0tTID0gbmV3IEFycmF5KG5ldyBEYXRhTWFzazAwMCgpLCBuZXcgRGF0YU1hc2swMDEoKSwgbmV3IERhdGFNYXNrMDEwKCksIG5ldyBEYXRhTWFzazAxMSgpLCBuZXcgRGF0YU1hc2sxMDAoKSwgbmV3IERhdGFNYXNrMTAxKCksIG5ldyBEYXRhTWFzazExMCgpLCBuZXcgRGF0YU1hc2sxMTEoKSk7XG5cblxuLypcbiAgUG9ydGVkIHRvIEphdmFTY3JpcHQgYnkgTGF6YXIgTGFzemxvIDIwMTFcblxuICBsYXphcnNvZnRAZ21haWwuY29tLCB3d3cubGF6YXJzb2Z0LmluZm9cblxuKi9cblxuLypcbipcbiogQ29weXJpZ2h0IDIwMDcgWlhpbmcgYXV0aG9yc1xuKlxuKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4qIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuKlxuKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuKlxuKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4qIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4qIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5cbmZ1bmN0aW9uIFJlZWRTb2xvbW9uRGVjb2RlcihmaWVsZClcbntcblx0dGhpcy5maWVsZCA9IGZpZWxkO1xuXHR0aGlzLmRlY29kZT1mdW5jdGlvbihyZWNlaXZlZCwgIHR3b1MpXG5cdHtcblx0XHRcdHZhciBwb2x5ID0gbmV3IEdGMjU2UG9seSh0aGlzLmZpZWxkLCByZWNlaXZlZCk7XG5cdFx0XHR2YXIgc3luZHJvbWVDb2VmZmljaWVudHMgPSBuZXcgQXJyYXkodHdvUyk7XG5cdFx0XHRmb3IodmFyIGk9MDtpPHN5bmRyb21lQ29lZmZpY2llbnRzLmxlbmd0aDtpKyspc3luZHJvbWVDb2VmZmljaWVudHNbaV09MDtcblx0XHRcdHZhciBkYXRhTWF0cml4ID0gZmFsc2U7Ly90aGlzLmZpZWxkLkVxdWFscyhHRjI1Ni5EQVRBX01BVFJJWF9GSUVMRCk7XG5cdFx0XHR2YXIgbm9FcnJvciA9IHRydWU7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHR3b1M7IGkrKylcblx0XHRcdHtcblx0XHRcdFx0Ly8gVGhhbmtzIHRvIHNhbmZvcmRzcXVpcmVzIGZvciB0aGlzIGZpeDpcblx0XHRcdFx0dmFyIGV2YWwgPSBwb2x5LmV2YWx1YXRlQXQodGhpcy5maWVsZC5leHAoZGF0YU1hdHJpeD9pICsgMTppKSk7XG5cdFx0XHRcdHN5bmRyb21lQ29lZmZpY2llbnRzW3N5bmRyb21lQ29lZmZpY2llbnRzLmxlbmd0aCAtIDEgLSBpXSA9IGV2YWw7XG5cdFx0XHRcdGlmIChldmFsICE9IDApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRub0Vycm9yID0gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChub0Vycm9yKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHN5bmRyb21lID0gbmV3IEdGMjU2UG9seSh0aGlzLmZpZWxkLCBzeW5kcm9tZUNvZWZmaWNpZW50cyk7XG5cdFx0XHR2YXIgc2lnbWFPbWVnYSA9IHRoaXMucnVuRXVjbGlkZWFuQWxnb3JpdGhtKHRoaXMuZmllbGQuYnVpbGRNb25vbWlhbCh0d29TLCAxKSwgc3luZHJvbWUsIHR3b1MpO1xuXHRcdFx0dmFyIHNpZ21hID0gc2lnbWFPbWVnYVswXTtcblx0XHRcdHZhciBvbWVnYSA9IHNpZ21hT21lZ2FbMV07XG5cdFx0XHR2YXIgZXJyb3JMb2NhdGlvbnMgPSB0aGlzLmZpbmRFcnJvckxvY2F0aW9ucyhzaWdtYSk7XG5cdFx0XHR2YXIgZXJyb3JNYWduaXR1ZGVzID0gdGhpcy5maW5kRXJyb3JNYWduaXR1ZGVzKG9tZWdhLCBlcnJvckxvY2F0aW9ucywgZGF0YU1hdHJpeCk7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGVycm9yTG9jYXRpb25zLmxlbmd0aDsgaSsrKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgcG9zaXRpb24gPSByZWNlaXZlZC5sZW5ndGggLSAxIC0gdGhpcy5maWVsZC5sb2coZXJyb3JMb2NhdGlvbnNbaV0pO1xuXHRcdFx0XHRpZiAocG9zaXRpb24gPCAwKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dGhyb3cgXCJSZWVkU29sb21vbkV4Y2VwdGlvbiBCYWQgZXJyb3IgbG9jYXRpb25cIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZWNlaXZlZFtwb3NpdGlvbl0gPSBHRjI1Ni5hZGRPclN1YnRyYWN0KHJlY2VpdmVkW3Bvc2l0aW9uXSwgZXJyb3JNYWduaXR1ZGVzW2ldKTtcblx0XHRcdH1cblx0fVxuXG5cdHRoaXMucnVuRXVjbGlkZWFuQWxnb3JpdGhtPWZ1bmN0aW9uKCBhLCAgYiwgIFIpXG5cdFx0e1xuXHRcdFx0Ly8gQXNzdW1lIGEncyBkZWdyZWUgaXMgPj0gYidzXG5cdFx0XHRpZiAoYS5EZWdyZWUgPCBiLkRlZ3JlZSlcblx0XHRcdHtcblx0XHRcdFx0dmFyIHRlbXAgPSBhO1xuXHRcdFx0XHRhID0gYjtcblx0XHRcdFx0YiA9IHRlbXA7XG5cdFx0XHR9XG5cblx0XHRcdHZhciByTGFzdCA9IGE7XG5cdFx0XHR2YXIgciA9IGI7XG5cdFx0XHR2YXIgc0xhc3QgPSB0aGlzLmZpZWxkLk9uZTtcblx0XHRcdHZhciBzID0gdGhpcy5maWVsZC5aZXJvO1xuXHRcdFx0dmFyIHRMYXN0ID0gdGhpcy5maWVsZC5aZXJvO1xuXHRcdFx0dmFyIHQgPSB0aGlzLmZpZWxkLk9uZTtcblxuXHRcdFx0Ly8gUnVuIEV1Y2xpZGVhbiBhbGdvcml0aG0gdW50aWwgcidzIGRlZ3JlZSBpcyBsZXNzIHRoYW4gUi8yXG5cdFx0XHR3aGlsZSAoci5EZWdyZWUgPj0gTWF0aC5mbG9vcihSIC8gMikpXG5cdFx0XHR7XG5cdFx0XHRcdHZhciByTGFzdExhc3QgPSByTGFzdDtcblx0XHRcdFx0dmFyIHNMYXN0TGFzdCA9IHNMYXN0O1xuXHRcdFx0XHR2YXIgdExhc3RMYXN0ID0gdExhc3Q7XG5cdFx0XHRcdHJMYXN0ID0gcjtcblx0XHRcdFx0c0xhc3QgPSBzO1xuXHRcdFx0XHR0TGFzdCA9IHQ7XG5cblx0XHRcdFx0Ly8gRGl2aWRlIHJMYXN0TGFzdCBieSByTGFzdCwgd2l0aCBxdW90aWVudCBpbiBxIGFuZCByZW1haW5kZXIgaW4gclxuXHRcdFx0XHRpZiAockxhc3QuWmVybylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIE9vcHMsIEV1Y2xpZGVhbiBhbGdvcml0aG0gYWxyZWFkeSB0ZXJtaW5hdGVkP1xuXHRcdFx0XHRcdHRocm93IFwicl97aS0xfSB3YXMgemVyb1wiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHIgPSByTGFzdExhc3Q7XG5cdFx0XHRcdHZhciBxID0gdGhpcy5maWVsZC5aZXJvO1xuXHRcdFx0XHR2YXIgZGVub21pbmF0b3JMZWFkaW5nVGVybSA9IHJMYXN0LmdldENvZWZmaWNpZW50KHJMYXN0LkRlZ3JlZSk7XG5cdFx0XHRcdHZhciBkbHRJbnZlcnNlID0gdGhpcy5maWVsZC5pbnZlcnNlKGRlbm9taW5hdG9yTGVhZGluZ1Rlcm0pO1xuXHRcdFx0XHR3aGlsZSAoci5EZWdyZWUgPj0gckxhc3QuRGVncmVlICYmICFyLlplcm8pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2YXIgZGVncmVlRGlmZiA9IHIuRGVncmVlIC0gckxhc3QuRGVncmVlO1xuXHRcdFx0XHRcdHZhciBzY2FsZSA9IHRoaXMuZmllbGQubXVsdGlwbHkoci5nZXRDb2VmZmljaWVudChyLkRlZ3JlZSksIGRsdEludmVyc2UpO1xuXHRcdFx0XHRcdHEgPSBxLmFkZE9yU3VidHJhY3QodGhpcy5maWVsZC5idWlsZE1vbm9taWFsKGRlZ3JlZURpZmYsIHNjYWxlKSk7XG5cdFx0XHRcdFx0ciA9IHIuYWRkT3JTdWJ0cmFjdChyTGFzdC5tdWx0aXBseUJ5TW9ub21pYWwoZGVncmVlRGlmZiwgc2NhbGUpKTtcblx0XHRcdFx0XHQvL3IuRVhFKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRzID0gcS5tdWx0aXBseTEoc0xhc3QpLmFkZE9yU3VidHJhY3Qoc0xhc3RMYXN0KTtcblx0XHRcdFx0dCA9IHEubXVsdGlwbHkxKHRMYXN0KS5hZGRPclN1YnRyYWN0KHRMYXN0TGFzdCk7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBzaWdtYVRpbGRlQXRaZXJvID0gdC5nZXRDb2VmZmljaWVudCgwKTtcblx0XHRcdGlmIChzaWdtYVRpbGRlQXRaZXJvID09IDApXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IFwiUmVlZFNvbG9tb25FeGNlcHRpb24gc2lnbWFUaWxkZSgwKSB3YXMgemVyb1wiO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgaW52ZXJzZSA9IHRoaXMuZmllbGQuaW52ZXJzZShzaWdtYVRpbGRlQXRaZXJvKTtcblx0XHRcdHZhciBzaWdtYSA9IHQubXVsdGlwbHkyKGludmVyc2UpO1xuXHRcdFx0dmFyIG9tZWdhID0gci5tdWx0aXBseTIoaW52ZXJzZSk7XG5cdFx0XHRyZXR1cm4gbmV3IEFycmF5KHNpZ21hLCBvbWVnYSk7XG5cdFx0fVxuXHR0aGlzLmZpbmRFcnJvckxvY2F0aW9ucz1mdW5jdGlvbiggZXJyb3JMb2NhdG9yKVxuXHRcdHtcblx0XHRcdC8vIFRoaXMgaXMgYSBkaXJlY3QgYXBwbGljYXRpb24gb2YgQ2hpZW4ncyBzZWFyY2hcblx0XHRcdHZhciBudW1FcnJvcnMgPSBlcnJvckxvY2F0b3IuRGVncmVlO1xuXHRcdFx0aWYgKG51bUVycm9ycyA9PSAxKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBzaG9ydGN1dFxuXHRcdFx0XHRyZXR1cm4gbmV3IEFycmF5KGVycm9yTG9jYXRvci5nZXRDb2VmZmljaWVudCgxKSk7XG5cdFx0XHR9XG5cdFx0XHR2YXIgcmVzdWx0ID0gbmV3IEFycmF5KG51bUVycm9ycyk7XG5cdFx0XHR2YXIgZSA9IDA7XG5cdFx0XHRmb3IgKHZhciBpID0gMTsgaSA8IDI1NiAmJiBlIDwgbnVtRXJyb3JzOyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChlcnJvckxvY2F0b3IuZXZhbHVhdGVBdChpKSA9PSAwKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmVzdWx0W2VdID0gdGhpcy5maWVsZC5pbnZlcnNlKGkpO1xuXHRcdFx0XHRcdGUrKztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKGUgIT0gbnVtRXJyb3JzKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBcIkVycm9yIGxvY2F0b3IgZGVncmVlIGRvZXMgbm90IG1hdGNoIG51bWJlciBvZiByb290c1wiO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cdHRoaXMuZmluZEVycm9yTWFnbml0dWRlcz1mdW5jdGlvbiggZXJyb3JFdmFsdWF0b3IsICBlcnJvckxvY2F0aW9ucywgIGRhdGFNYXRyaXgpXG5cdFx0e1xuXHRcdFx0Ly8gVGhpcyBpcyBkaXJlY3RseSBhcHBseWluZyBGb3JuZXkncyBGb3JtdWxhXG5cdFx0XHR2YXIgcyA9IGVycm9yTG9jYXRpb25zLmxlbmd0aDtcblx0XHRcdHZhciByZXN1bHQgPSBuZXcgQXJyYXkocyk7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHM7IGkrKylcblx0XHRcdHtcblx0XHRcdFx0dmFyIHhpSW52ZXJzZSA9IHRoaXMuZmllbGQuaW52ZXJzZShlcnJvckxvY2F0aW9uc1tpXSk7XG5cdFx0XHRcdHZhciBkZW5vbWluYXRvciA9IDE7XG5cdFx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgczsgaisrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKGkgIT0gailcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRkZW5vbWluYXRvciA9IHRoaXMuZmllbGQubXVsdGlwbHkoZGVub21pbmF0b3IsIEdGMjU2LmFkZE9yU3VidHJhY3QoMSwgdGhpcy5maWVsZC5tdWx0aXBseShlcnJvckxvY2F0aW9uc1tqXSwgeGlJbnZlcnNlKSkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXN1bHRbaV0gPSB0aGlzLmZpZWxkLm11bHRpcGx5KGVycm9yRXZhbHVhdG9yLmV2YWx1YXRlQXQoeGlJbnZlcnNlKSwgdGhpcy5maWVsZC5pbnZlcnNlKGRlbm9taW5hdG9yKSk7XG5cdFx0XHRcdC8vIFRoYW5rcyB0byBzYW5mb3Jkc3F1aXJlcyBmb3IgdGhpcyBmaXg6XG5cdFx0XHRcdGlmIChkYXRhTWF0cml4KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmVzdWx0W2ldID0gdGhpcy5maWVsZC5tdWx0aXBseShyZXN1bHRbaV0sIHhpSW52ZXJzZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxufVxuXG4vKlxuICBQb3J0ZWQgdG8gSmF2YVNjcmlwdCBieSBMYXphciBMYXN6bG8gMjAxMVxuXG4gIGxhemFyc29mdEBnbWFpbC5jb20sIHd3dy5sYXphcnNvZnQuaW5mb1xuXG4qL1xuXG4vKlxuKlxuKiBDb3B5cmlnaHQgMjAwNyBaWGluZyBhdXRob3JzXG4qXG4qIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4qIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4qXG4qICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4qXG4qIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cblxuZnVuY3Rpb24gR0YyNTZQb2x5KGZpZWxkLCAgY29lZmZpY2llbnRzKVxue1xuXHRpZiAoY29lZmZpY2llbnRzID09IG51bGwgfHwgY29lZmZpY2llbnRzLmxlbmd0aCA9PSAwKVxuXHR7XG5cdFx0dGhyb3cgXCJTeXN0ZW0uQXJndW1lbnRFeGNlcHRpb25cIjtcblx0fVxuXHR0aGlzLmZpZWxkID0gZmllbGQ7XG5cdHZhciBjb2VmZmljaWVudHNMZW5ndGggPSBjb2VmZmljaWVudHMubGVuZ3RoO1xuXHRpZiAoY29lZmZpY2llbnRzTGVuZ3RoID4gMSAmJiBjb2VmZmljaWVudHNbMF0gPT0gMClcblx0e1xuXHRcdC8vIExlYWRpbmcgdGVybSBtdXN0IGJlIG5vbi16ZXJvIGZvciBhbnl0aGluZyBleGNlcHQgdGhlIGNvbnN0YW50IHBvbHlub21pYWwgXCIwXCJcblx0XHR2YXIgZmlyc3ROb25aZXJvID0gMTtcblx0XHR3aGlsZSAoZmlyc3ROb25aZXJvIDwgY29lZmZpY2llbnRzTGVuZ3RoICYmIGNvZWZmaWNpZW50c1tmaXJzdE5vblplcm9dID09IDApXG5cdFx0e1xuXHRcdFx0Zmlyc3ROb25aZXJvKys7XG5cdFx0fVxuXHRcdGlmIChmaXJzdE5vblplcm8gPT0gY29lZmZpY2llbnRzTGVuZ3RoKVxuXHRcdHtcblx0XHRcdHRoaXMuY29lZmZpY2llbnRzID0gZmllbGQuWmVyby5jb2VmZmljaWVudHM7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHR0aGlzLmNvZWZmaWNpZW50cyA9IG5ldyBBcnJheShjb2VmZmljaWVudHNMZW5ndGggLSBmaXJzdE5vblplcm8pO1xuXHRcdFx0Zm9yKHZhciBpPTA7aTx0aGlzLmNvZWZmaWNpZW50cy5sZW5ndGg7aSsrKXRoaXMuY29lZmZpY2llbnRzW2ldPTA7XG5cdFx0XHQvL0FycmF5LkNvcHkoY29lZmZpY2llbnRzLCBmaXJzdE5vblplcm8sIHRoaXMuY29lZmZpY2llbnRzLCAwLCB0aGlzLmNvZWZmaWNpZW50cy5sZW5ndGgpO1xuXHRcdFx0Zm9yKHZhciBjaT0wO2NpPHRoaXMuY29lZmZpY2llbnRzLmxlbmd0aDtjaSsrKXRoaXMuY29lZmZpY2llbnRzW2NpXT1jb2VmZmljaWVudHNbZmlyc3ROb25aZXJvK2NpXTtcblx0XHR9XG5cdH1cblx0ZWxzZVxuXHR7XG5cdFx0dGhpcy5jb2VmZmljaWVudHMgPSBjb2VmZmljaWVudHM7XG5cdH1cblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIlplcm9cIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiB0aGlzLmNvZWZmaWNpZW50c1swXSA9PSAwO1xuXHR9fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiRGVncmVlXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5jb2VmZmljaWVudHMubGVuZ3RoIC0gMTtcblx0fX0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIkNvZWZmaWNpZW50c1wiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuY29lZmZpY2llbnRzO1xuXHR9fSk7XG5cblx0dGhpcy5nZXRDb2VmZmljaWVudD1mdW5jdGlvbiggZGVncmVlKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuY29lZmZpY2llbnRzW3RoaXMuY29lZmZpY2llbnRzLmxlbmd0aCAtIDEgLSBkZWdyZWVdO1xuXHR9XG5cblx0dGhpcy5ldmFsdWF0ZUF0PWZ1bmN0aW9uKCBhKVxuXHR7XG5cdFx0aWYgKGEgPT0gMClcblx0XHR7XG5cdFx0XHQvLyBKdXN0IHJldHVybiB0aGUgeF4wIGNvZWZmaWNpZW50XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRDb2VmZmljaWVudCgwKTtcblx0XHR9XG5cdFx0dmFyIHNpemUgPSB0aGlzLmNvZWZmaWNpZW50cy5sZW5ndGg7XG5cdFx0aWYgKGEgPT0gMSlcblx0XHR7XG5cdFx0XHQvLyBKdXN0IHRoZSBzdW0gb2YgdGhlIGNvZWZmaWNpZW50c1xuXHRcdFx0dmFyIHJlc3VsdCA9IDA7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNpemU7IGkrKylcblx0XHRcdHtcblx0XHRcdFx0cmVzdWx0ID0gR0YyNTYuYWRkT3JTdWJ0cmFjdChyZXN1bHQsIHRoaXMuY29lZmZpY2llbnRzW2ldKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXHRcdHZhciByZXN1bHQyID0gdGhpcy5jb2VmZmljaWVudHNbMF07XG5cdFx0Zm9yICh2YXIgaSA9IDE7IGkgPCBzaXplOyBpKyspXG5cdFx0e1xuXHRcdFx0cmVzdWx0MiA9IEdGMjU2LmFkZE9yU3VidHJhY3QodGhpcy5maWVsZC5tdWx0aXBseShhLCByZXN1bHQyKSwgdGhpcy5jb2VmZmljaWVudHNbaV0pO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0Mjtcblx0fVxuXG5cdHRoaXMuYWRkT3JTdWJ0cmFjdD1mdW5jdGlvbiggb3RoZXIpXG5cdFx0e1xuXHRcdFx0aWYgKHRoaXMuZmllbGQgIT0gb3RoZXIuZmllbGQpXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IFwiR0YyNTZQb2x5cyBkbyBub3QgaGF2ZSBzYW1lIEdGMjU2IGZpZWxkXCI7XG5cdFx0XHR9XG5cdFx0XHRpZiAodGhpcy5aZXJvKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gb3RoZXI7XG5cdFx0XHR9XG5cdFx0XHRpZiAob3RoZXIuWmVybylcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBzbWFsbGVyQ29lZmZpY2llbnRzID0gdGhpcy5jb2VmZmljaWVudHM7XG5cdFx0XHR2YXIgbGFyZ2VyQ29lZmZpY2llbnRzID0gb3RoZXIuY29lZmZpY2llbnRzO1xuXHRcdFx0aWYgKHNtYWxsZXJDb2VmZmljaWVudHMubGVuZ3RoID4gbGFyZ2VyQ29lZmZpY2llbnRzLmxlbmd0aClcblx0XHRcdHtcblx0XHRcdFx0dmFyIHRlbXAgPSBzbWFsbGVyQ29lZmZpY2llbnRzO1xuXHRcdFx0XHRzbWFsbGVyQ29lZmZpY2llbnRzID0gbGFyZ2VyQ29lZmZpY2llbnRzO1xuXHRcdFx0XHRsYXJnZXJDb2VmZmljaWVudHMgPSB0ZW1wO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHN1bURpZmYgPSBuZXcgQXJyYXkobGFyZ2VyQ29lZmZpY2llbnRzLmxlbmd0aCk7XG5cdFx0XHR2YXIgbGVuZ3RoRGlmZiA9IGxhcmdlckNvZWZmaWNpZW50cy5sZW5ndGggLSBzbWFsbGVyQ29lZmZpY2llbnRzLmxlbmd0aDtcblx0XHRcdC8vIENvcHkgaGlnaC1vcmRlciB0ZXJtcyBvbmx5IGZvdW5kIGluIGhpZ2hlci1kZWdyZWUgcG9seW5vbWlhbCdzIGNvZWZmaWNpZW50c1xuXHRcdFx0Ly9BcnJheS5Db3B5KGxhcmdlckNvZWZmaWNpZW50cywgMCwgc3VtRGlmZiwgMCwgbGVuZ3RoRGlmZik7XG5cdFx0XHRmb3IodmFyIGNpPTA7Y2k8bGVuZ3RoRGlmZjtjaSsrKXN1bURpZmZbY2ldPWxhcmdlckNvZWZmaWNpZW50c1tjaV07XG5cblx0XHRcdGZvciAodmFyIGkgPSBsZW5ndGhEaWZmOyBpIDwgbGFyZ2VyQ29lZmZpY2llbnRzLmxlbmd0aDsgaSsrKVxuXHRcdFx0e1xuXHRcdFx0XHRzdW1EaWZmW2ldID0gR0YyNTYuYWRkT3JTdWJ0cmFjdChzbWFsbGVyQ29lZmZpY2llbnRzW2kgLSBsZW5ndGhEaWZmXSwgbGFyZ2VyQ29lZmZpY2llbnRzW2ldKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG5ldyBHRjI1NlBvbHkoZmllbGQsIHN1bURpZmYpO1xuXHR9XG5cdHRoaXMubXVsdGlwbHkxPWZ1bmN0aW9uKCBvdGhlcilcblx0XHR7XG5cdFx0XHRpZiAodGhpcy5maWVsZCE9b3RoZXIuZmllbGQpXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IFwiR0YyNTZQb2x5cyBkbyBub3QgaGF2ZSBzYW1lIEdGMjU2IGZpZWxkXCI7XG5cdFx0XHR9XG5cdFx0XHRpZiAodGhpcy5aZXJvIHx8IG90aGVyLlplcm8pXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB0aGlzLmZpZWxkLlplcm87XG5cdFx0XHR9XG5cdFx0XHR2YXIgYUNvZWZmaWNpZW50cyA9IHRoaXMuY29lZmZpY2llbnRzO1xuXHRcdFx0dmFyIGFMZW5ndGggPSBhQ29lZmZpY2llbnRzLmxlbmd0aDtcblx0XHRcdHZhciBiQ29lZmZpY2llbnRzID0gb3RoZXIuY29lZmZpY2llbnRzO1xuXHRcdFx0dmFyIGJMZW5ndGggPSBiQ29lZmZpY2llbnRzLmxlbmd0aDtcblx0XHRcdHZhciBwcm9kdWN0ID0gbmV3IEFycmF5KGFMZW5ndGggKyBiTGVuZ3RoIC0gMSk7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFMZW5ndGg7IGkrKylcblx0XHRcdHtcblx0XHRcdFx0dmFyIGFDb2VmZiA9IGFDb2VmZmljaWVudHNbaV07XG5cdFx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgYkxlbmd0aDsgaisrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cHJvZHVjdFtpICsgal0gPSBHRjI1Ni5hZGRPclN1YnRyYWN0KHByb2R1Y3RbaSArIGpdLCB0aGlzLmZpZWxkLm11bHRpcGx5KGFDb2VmZiwgYkNvZWZmaWNpZW50c1tqXSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbmV3IEdGMjU2UG9seSh0aGlzLmZpZWxkLCBwcm9kdWN0KTtcblx0XHR9XG5cdHRoaXMubXVsdGlwbHkyPWZ1bmN0aW9uKCBzY2FsYXIpXG5cdFx0e1xuXHRcdFx0aWYgKHNjYWxhciA9PSAwKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5maWVsZC5aZXJvO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHNjYWxhciA9PSAxKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdGhpcztcblx0XHRcdH1cblx0XHRcdHZhciBzaXplID0gdGhpcy5jb2VmZmljaWVudHMubGVuZ3RoO1xuXHRcdFx0dmFyIHByb2R1Y3QgPSBuZXcgQXJyYXkoc2l6ZSk7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNpemU7IGkrKylcblx0XHRcdHtcblx0XHRcdFx0cHJvZHVjdFtpXSA9IHRoaXMuZmllbGQubXVsdGlwbHkodGhpcy5jb2VmZmljaWVudHNbaV0sIHNjYWxhcik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbmV3IEdGMjU2UG9seSh0aGlzLmZpZWxkLCBwcm9kdWN0KTtcblx0XHR9XG5cdHRoaXMubXVsdGlwbHlCeU1vbm9taWFsPWZ1bmN0aW9uKCBkZWdyZWUsICBjb2VmZmljaWVudClcblx0XHR7XG5cdFx0XHRpZiAoZGVncmVlIDwgMClcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgXCJTeXN0ZW0uQXJndW1lbnRFeGNlcHRpb25cIjtcblx0XHRcdH1cblx0XHRcdGlmIChjb2VmZmljaWVudCA9PSAwKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5maWVsZC5aZXJvO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHNpemUgPSB0aGlzLmNvZWZmaWNpZW50cy5sZW5ndGg7XG5cdFx0XHR2YXIgcHJvZHVjdCA9IG5ldyBBcnJheShzaXplICsgZGVncmVlKTtcblx0XHRcdGZvcih2YXIgaT0wO2k8cHJvZHVjdC5sZW5ndGg7aSsrKXByb2R1Y3RbaV09MDtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2l6ZTsgaSsrKVxuXHRcdFx0e1xuXHRcdFx0XHRwcm9kdWN0W2ldID0gdGhpcy5maWVsZC5tdWx0aXBseSh0aGlzLmNvZWZmaWNpZW50c1tpXSwgY29lZmZpY2llbnQpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG5ldyBHRjI1NlBvbHkodGhpcy5maWVsZCwgcHJvZHVjdCk7XG5cdFx0fVxuXHR0aGlzLmRpdmlkZT1mdW5jdGlvbiggb3RoZXIpXG5cdFx0e1xuXHRcdFx0aWYgKHRoaXMuZmllbGQhPW90aGVyLmZpZWxkKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBcIkdGMjU2UG9seXMgZG8gbm90IGhhdmUgc2FtZSBHRjI1NiBmaWVsZFwiO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG90aGVyLlplcm8pXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IFwiRGl2aWRlIGJ5IDBcIjtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHF1b3RpZW50ID0gdGhpcy5maWVsZC5aZXJvO1xuXHRcdFx0dmFyIHJlbWFpbmRlciA9IHRoaXM7XG5cblx0XHRcdHZhciBkZW5vbWluYXRvckxlYWRpbmdUZXJtID0gb3RoZXIuZ2V0Q29lZmZpY2llbnQob3RoZXIuRGVncmVlKTtcblx0XHRcdHZhciBpbnZlcnNlRGVub21pbmF0b3JMZWFkaW5nVGVybSA9IHRoaXMuZmllbGQuaW52ZXJzZShkZW5vbWluYXRvckxlYWRpbmdUZXJtKTtcblxuXHRcdFx0d2hpbGUgKHJlbWFpbmRlci5EZWdyZWUgPj0gb3RoZXIuRGVncmVlICYmICFyZW1haW5kZXIuWmVybylcblx0XHRcdHtcblx0XHRcdFx0dmFyIGRlZ3JlZURpZmZlcmVuY2UgPSByZW1haW5kZXIuRGVncmVlIC0gb3RoZXIuRGVncmVlO1xuXHRcdFx0XHR2YXIgc2NhbGUgPSB0aGlzLmZpZWxkLm11bHRpcGx5KHJlbWFpbmRlci5nZXRDb2VmZmljaWVudChyZW1haW5kZXIuRGVncmVlKSwgaW52ZXJzZURlbm9taW5hdG9yTGVhZGluZ1Rlcm0pO1xuXHRcdFx0XHR2YXIgdGVybSA9IG90aGVyLm11bHRpcGx5QnlNb25vbWlhbChkZWdyZWVEaWZmZXJlbmNlLCBzY2FsZSk7XG5cdFx0XHRcdHZhciBpdGVyYXRpb25RdW90aWVudCA9IHRoaXMuZmllbGQuYnVpbGRNb25vbWlhbChkZWdyZWVEaWZmZXJlbmNlLCBzY2FsZSk7XG5cdFx0XHRcdHF1b3RpZW50ID0gcXVvdGllbnQuYWRkT3JTdWJ0cmFjdChpdGVyYXRpb25RdW90aWVudCk7XG5cdFx0XHRcdHJlbWFpbmRlciA9IHJlbWFpbmRlci5hZGRPclN1YnRyYWN0KHRlcm0pO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gbmV3IEFycmF5KHF1b3RpZW50LCByZW1haW5kZXIpO1xuXHRcdH1cbn1cblxuLypcbiAgUG9ydGVkIHRvIEphdmFTY3JpcHQgYnkgTGF6YXIgTGFzemxvIDIwMTFcblxuICBsYXphcnNvZnRAZ21haWwuY29tLCB3d3cubGF6YXJzb2Z0LmluZm9cblxuKi9cblxuLypcbipcbiogQ29weXJpZ2h0IDIwMDcgWlhpbmcgYXV0aG9yc1xuKlxuKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4qIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuKlxuKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuKlxuKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4qIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4qIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5cbmZ1bmN0aW9uIEdGMjU2KCBwcmltaXRpdmUpXG57XG5cdHRoaXMuZXhwVGFibGUgPSBuZXcgQXJyYXkoMjU2KTtcblx0dGhpcy5sb2dUYWJsZSA9IG5ldyBBcnJheSgyNTYpO1xuXHR2YXIgeCA9IDE7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgMjU2OyBpKyspXG5cdHtcblx0XHR0aGlzLmV4cFRhYmxlW2ldID0geDtcblx0XHR4IDw8PSAxOyAvLyB4ID0geCAqIDI7IHdlJ3JlIGFzc3VtaW5nIHRoZSBnZW5lcmF0b3IgYWxwaGEgaXMgMlxuXHRcdGlmICh4ID49IDB4MTAwKVxuXHRcdHtcblx0XHRcdHggXj0gcHJpbWl0aXZlO1xuXHRcdH1cblx0fVxuXHRmb3IgKHZhciBpID0gMDsgaSA8IDI1NTsgaSsrKVxuXHR7XG5cdFx0dGhpcy5sb2dUYWJsZVt0aGlzLmV4cFRhYmxlW2ldXSA9IGk7XG5cdH1cblx0Ly8gbG9nVGFibGVbMF0gPT0gMCBidXQgdGhpcyBzaG91bGQgbmV2ZXIgYmUgdXNlZFxuXHR2YXIgYXQwPW5ldyBBcnJheSgxKTthdDBbMF09MDtcblx0dGhpcy56ZXJvID0gbmV3IEdGMjU2UG9seSh0aGlzLCBuZXcgQXJyYXkoYXQwKSk7XG5cdHZhciBhdDE9bmV3IEFycmF5KDEpO2F0MVswXT0xO1xuXHR0aGlzLm9uZSA9IG5ldyBHRjI1NlBvbHkodGhpcywgbmV3IEFycmF5KGF0MSkpO1xuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiWmVyb1wiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuemVybztcblx0fX0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIk9uZVwiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMub25lO1xuXHR9fSk7XG5cdHRoaXMuYnVpbGRNb25vbWlhbD1mdW5jdGlvbiggZGVncmVlLCAgY29lZmZpY2llbnQpXG5cdFx0e1xuXHRcdFx0aWYgKGRlZ3JlZSA8IDApXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IFwiU3lzdGVtLkFyZ3VtZW50RXhjZXB0aW9uXCI7XG5cdFx0XHR9XG5cdFx0XHRpZiAoY29lZmZpY2llbnQgPT0gMClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHplcm87XG5cdFx0XHR9XG5cdFx0XHR2YXIgY29lZmZpY2llbnRzID0gbmV3IEFycmF5KGRlZ3JlZSArIDEpO1xuXHRcdFx0Zm9yKHZhciBpPTA7aTxjb2VmZmljaWVudHMubGVuZ3RoO2krKyljb2VmZmljaWVudHNbaV09MDtcblx0XHRcdGNvZWZmaWNpZW50c1swXSA9IGNvZWZmaWNpZW50O1xuXHRcdFx0cmV0dXJuIG5ldyBHRjI1NlBvbHkodGhpcywgY29lZmZpY2llbnRzKTtcblx0XHR9XG5cdHRoaXMuZXhwPWZ1bmN0aW9uKCBhKVxuXHRcdHtcblx0XHRcdHJldHVybiB0aGlzLmV4cFRhYmxlW2FdO1xuXHRcdH1cblx0dGhpcy5sb2c9ZnVuY3Rpb24oIGEpXG5cdFx0e1xuXHRcdFx0aWYgKGEgPT0gMClcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgXCJTeXN0ZW0uQXJndW1lbnRFeGNlcHRpb25cIjtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0aGlzLmxvZ1RhYmxlW2FdO1xuXHRcdH1cblx0dGhpcy5pbnZlcnNlPWZ1bmN0aW9uKCBhKVxuXHRcdHtcblx0XHRcdGlmIChhID09IDApXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IFwiU3lzdGVtLkFyaXRobWV0aWNFeGNlcHRpb25cIjtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0aGlzLmV4cFRhYmxlWzI1NSAtIHRoaXMubG9nVGFibGVbYV1dO1xuXHRcdH1cblx0dGhpcy5tdWx0aXBseT1mdW5jdGlvbiggYSwgIGIpXG5cdFx0e1xuXHRcdFx0aWYgKGEgPT0gMCB8fCBiID09IDApXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiAwO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGEgPT0gMSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGI7XG5cdFx0XHR9XG5cdFx0XHRpZiAoYiA9PSAxKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gYTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0aGlzLmV4cFRhYmxlWyh0aGlzLmxvZ1RhYmxlW2FdICsgdGhpcy5sb2dUYWJsZVtiXSkgJSAyNTVdO1xuXHRcdH1cbn1cblxuR0YyNTYuUVJfQ09ERV9GSUVMRCA9IG5ldyBHRjI1NigweDAxMUQpO1xuR0YyNTYuREFUQV9NQVRSSVhfRklFTEQgPSBuZXcgR0YyNTYoMHgwMTJEKTtcblxuR0YyNTYuYWRkT3JTdWJ0cmFjdD1mdW5jdGlvbiggYSwgIGIpXG57XG5cdHJldHVybiBhIF4gYjtcbn1cblxuLypcbiAgUG9ydGVkIHRvIEphdmFTY3JpcHQgYnkgTGF6YXIgTGFzemxvIDIwMTFcblxuICBsYXphcnNvZnRAZ21haWwuY29tLCB3d3cubGF6YXJzb2Z0LmluZm9cblxuKi9cblxuLypcbipcbiogQ29weXJpZ2h0IDIwMDcgWlhpbmcgYXV0aG9yc1xuKlxuKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4qIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuKlxuKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuKlxuKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4qIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4qIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5cbnZhciBEZWNvZGVyPXt9O1xuRGVjb2Rlci5yc0RlY29kZXIgPSBuZXcgUmVlZFNvbG9tb25EZWNvZGVyKEdGMjU2LlFSX0NPREVfRklFTEQpO1xuXG5EZWNvZGVyLmNvcnJlY3RFcnJvcnM9ZnVuY3Rpb24oIGNvZGV3b3JkQnl0ZXMsICBudW1EYXRhQ29kZXdvcmRzKVxue1xuXHR2YXIgbnVtQ29kZXdvcmRzID0gY29kZXdvcmRCeXRlcy5sZW5ndGg7XG5cdC8vIEZpcnN0IHJlYWQgaW50byBhbiBhcnJheSBvZiBpbnRzXG5cdHZhciBjb2Rld29yZHNJbnRzID0gbmV3IEFycmF5KG51bUNvZGV3b3Jkcyk7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbnVtQ29kZXdvcmRzOyBpKyspXG5cdHtcblx0XHRjb2Rld29yZHNJbnRzW2ldID0gY29kZXdvcmRCeXRlc1tpXSAmIDB4RkY7XG5cdH1cblx0dmFyIG51bUVDQ29kZXdvcmRzID0gY29kZXdvcmRCeXRlcy5sZW5ndGggLSBudW1EYXRhQ29kZXdvcmRzO1xuXHR0cnlcblx0e1xuXHRcdERlY29kZXIucnNEZWNvZGVyLmRlY29kZShjb2Rld29yZHNJbnRzLCBudW1FQ0NvZGV3b3Jkcyk7XG5cdFx0Ly92YXIgY29ycmVjdG9yID0gbmV3IFJlZWRTb2xvbW9uKGNvZGV3b3Jkc0ludHMsIG51bUVDQ29kZXdvcmRzKTtcblx0XHQvL2NvcnJlY3Rvci5jb3JyZWN0KCk7XG5cdH1cblx0Y2F0Y2ggKCByc2UpXG5cdHtcblx0XHR0aHJvdyByc2U7XG5cdH1cblx0Ly8gQ29weSBiYWNrIGludG8gYXJyYXkgb2YgYnl0ZXMgLS0gb25seSBuZWVkIHRvIHdvcnJ5IGFib3V0IHRoZSBieXRlcyB0aGF0IHdlcmUgZGF0YVxuXHQvLyBXZSBkb24ndCBjYXJlIGFib3V0IGVycm9ycyBpbiB0aGUgZXJyb3ItY29ycmVjdGlvbiBjb2Rld29yZHNcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBudW1EYXRhQ29kZXdvcmRzOyBpKyspXG5cdHtcblx0XHRjb2Rld29yZEJ5dGVzW2ldID0gIGNvZGV3b3Jkc0ludHNbaV07XG5cdH1cbn1cblxuRGVjb2Rlci5kZWNvZGU9ZnVuY3Rpb24oYml0cylcbntcblx0dmFyIHBhcnNlciA9IG5ldyBCaXRNYXRyaXhQYXJzZXIoYml0cyk7XG5cdHZhciB2ZXJzaW9uID0gcGFyc2VyLnJlYWRWZXJzaW9uKCk7XG5cdHZhciBlY0xldmVsID0gcGFyc2VyLnJlYWRGb3JtYXRJbmZvcm1hdGlvbigpLkVycm9yQ29ycmVjdGlvbkxldmVsO1xuXG5cdC8vIFJlYWQgY29kZXdvcmRzXG5cdHZhciBjb2Rld29yZHMgPSBwYXJzZXIucmVhZENvZGV3b3JkcygpO1xuXG5cdC8vIFNlcGFyYXRlIGludG8gZGF0YSBibG9ja3Ncblx0dmFyIGRhdGFCbG9ja3MgPSBEYXRhQmxvY2suZ2V0RGF0YUJsb2Nrcyhjb2Rld29yZHMsIHZlcnNpb24sIGVjTGV2ZWwpO1xuXG5cdC8vIENvdW50IHRvdGFsIG51bWJlciBvZiBkYXRhIGJ5dGVzXG5cdHZhciB0b3RhbEJ5dGVzID0gMDtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhQmxvY2tzLmxlbmd0aDsgaSsrKVxuXHR7XG5cdFx0dG90YWxCeXRlcyArPSBkYXRhQmxvY2tzW2ldLk51bURhdGFDb2Rld29yZHM7XG5cdH1cblx0dmFyIHJlc3VsdEJ5dGVzID0gbmV3IEFycmF5KHRvdGFsQnl0ZXMpO1xuXHR2YXIgcmVzdWx0T2Zmc2V0ID0gMDtcblxuXHQvLyBFcnJvci1jb3JyZWN0IGFuZCBjb3B5IGRhdGEgYmxvY2tzIHRvZ2V0aGVyIGludG8gYSBzdHJlYW0gb2YgYnl0ZXNcblx0Zm9yICh2YXIgaiA9IDA7IGogPCBkYXRhQmxvY2tzLmxlbmd0aDsgaisrKVxuXHR7XG5cdFx0dmFyIGRhdGFCbG9jayA9IGRhdGFCbG9ja3Nbal07XG5cdFx0dmFyIGNvZGV3b3JkQnl0ZXMgPSBkYXRhQmxvY2suQ29kZXdvcmRzO1xuXHRcdHZhciBudW1EYXRhQ29kZXdvcmRzID0gZGF0YUJsb2NrLk51bURhdGFDb2Rld29yZHM7XG5cdFx0RGVjb2Rlci5jb3JyZWN0RXJyb3JzKGNvZGV3b3JkQnl0ZXMsIG51bURhdGFDb2Rld29yZHMpO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbnVtRGF0YUNvZGV3b3JkczsgaSsrKVxuXHRcdHtcblx0XHRcdHJlc3VsdEJ5dGVzW3Jlc3VsdE9mZnNldCsrXSA9IGNvZGV3b3JkQnl0ZXNbaV07XG5cdFx0fVxuXHR9XG5cblx0Ly8gRGVjb2RlIHRoZSBjb250ZW50cyBvZiB0aGF0IHN0cmVhbSBvZiBieXRlc1xuXHR2YXIgcmVhZGVyID0gbmV3IFFSQ29kZURhdGFCbG9ja1JlYWRlcihyZXN1bHRCeXRlcywgdmVyc2lvbi5WZXJzaW9uTnVtYmVyLCBlY0xldmVsLkJpdHMpO1xuXHRyZXR1cm4gcmVhZGVyO1xuXHQvL3JldHVybiBEZWNvZGVkQml0U3RyZWFtUGFyc2VyLmRlY29kZShyZXN1bHRCeXRlcywgdmVyc2lvbiwgZWNMZXZlbCk7XG59XG5cbi8qXG4gICBDb3B5cmlnaHQgMjAxMSBMYXphciBMYXN6bG8gKGxhemFyc29mdEBnbWFpbC5jb20sIHd3dy5sYXphcnNvZnQuaW5mbylcblxuICAgTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAgIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAgIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cbiAgIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAgIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAgIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICAgU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICAgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG52YXIgcXJjb2RlID0ge307XG5xcmNvZGUuc2l6ZU9mRGF0YUxlbmd0aEluZm8gPSAgWyAgWyAxMCwgOSwgOCwgOCBdLCAgWyAxMiwgMTEsIDE2LCAxMCBdLCAgWyAxNCwgMTMsIDE2LCAxMiBdIF07XG5cblFyQ29kZSA9IGZ1bmN0aW9uICgpIHtcblxudGhpcy5pbWFnZWRhdGEgPSBudWxsO1xudGhpcy53aWR0aCA9IDA7XG50aGlzLmhlaWdodCA9IDA7XG50aGlzLnFyQ29kZVN5bWJvbCA9IG51bGw7XG50aGlzLmRlYnVnID0gZmFsc2U7XG5cbnRoaXMuY2FsbGJhY2sgPSBudWxsO1xuXG50aGlzLmRlY29kZSA9IGZ1bmN0aW9uKHNyYywgZGF0YSl7XG5cbiAgICB2YXIgZGVjb2RlID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHRyeSB7XG5cdFx0XHR0aGlzLnJlc3VsdCA9IHRoaXMucHJvY2Vzcyh0aGlzLmltYWdlZGF0YSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMucmVzdWx0ID0gXCJlcnJvciBkZWNvZGluZyBRUiBDb2RlOiBcIiArIGU7XG4gICAgICAgIH1cblxuXHRcdGlmICh0aGlzLmNhbGxiYWNrIT1udWxsKSB7XG5cbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2sodGhpcy5yZXN1bHQpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdDtcblxuICAgIH0pLmJpbmQodGhpcyk7XG5cbiAgICAvKiBkZWNvZGUgZnJvbSBjYW52YXMgI3FyLWNhbnZhcyAqL1xuXHRpZiAoc3JjID09IHVuZGVmaW5lZCkge1xuXG5cdFx0dmFyIGNhbnZhc19xciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicXItY2FudmFzXCIpO1xuXHRcdHZhciBjb250ZXh0ID0gY2FudmFzX3FyLmdldENvbnRleHQoJzJkJyk7XG5cblx0ICAgIHRoaXMud2lkdGggPSBjYW52YXNfcXIud2lkdGg7XG5cdFx0dGhpcy5oZWlnaHQgPSBjYW52YXNfcXIuaGVpZ2h0O1xuXHRcdHRoaXMuaW1hZ2VkYXRhID0gY29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuXG4gICAgICAgIGRlY29kZSgpO1xuXHR9XG5cblx0LyogZGVjb2RlIGZyb20gY2FudmFzIGNhbnZhcy5jb250ZXh0LmdldEltYWdlRGF0YSAqL1xuICAgIGVsc2UgaWYgKHNyYy53aWR0aCAhPSB1bmRlZmluZWQpIHtcblxuXHRcdHRoaXMud2lkdGg9c3JjLndpZHRoXG5cdFx0dGhpcy5oZWlnaHQ9c3JjLmhlaWdodFxuXHRcdHRoaXMuaW1hZ2VkYXRhPXsgXCJkYXRhXCI6IGRhdGEgfHwgc3JjLmRhdGEgfVxuXHRcdHRoaXMuaW1hZ2VkYXRhLndpZHRoPXNyYy53aWR0aFxuXHRcdHRoaXMuaW1hZ2VkYXRhLmhlaWdodD1zcmMuaGVpZ2h0XG5cbiAgICAgICAgZGVjb2RlKCk7XG5cdH1cblxuICAgIC8qIGRlY29kZSBmcm9tIFVSTCAqL1xuXHRlbHNlIHtcblxuXHRcdHZhciBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuXHRcdHZhciBfdGhpcyA9IHRoaXNcblxuICAgICAgICBpbWFnZS5vbmxvYWQgPSAoZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciBjYW52YXNfcXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcblx0XHRcdHZhciBjb250ZXh0ID0gY2FudmFzX3FyLmdldENvbnRleHQoJzJkJyk7XG5cdFx0XHR2YXIgY2FudmFzX291dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwib3V0LWNhbnZhc1wiKTtcblxuXHRcdFx0aWYgKGNhbnZhc19vdXQgIT0gbnVsbCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIG91dGN0eCA9IGNhbnZhc19vdXQuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgICAgICAgICBvdXRjdHguY2xlYXJSZWN0KDAsIDAsIDMyMCwgMjQwKTtcblx0XHRcdFx0b3V0Y3R4LmRyYXdJbWFnZShpbWFnZSwgMCwgMCwgMzIwLCAyNDApO1xuICAgICAgICAgICAgfVxuXG5cdFx0XHRjYW52YXNfcXIud2lkdGggPSBpbWFnZS53aWR0aDtcblx0XHRcdGNhbnZhc19xci5oZWlnaHQgPSBpbWFnZS5oZWlnaHQ7XG4gICAgICAgICAgICBjb250ZXh0LmRyYXdJbWFnZShpbWFnZSwgMCwgMCk7XG5cdFx0XHR0aGlzLndpZHRoID0gaW1hZ2Uud2lkdGg7XG5cdFx0XHR0aGlzLmhlaWdodCA9IGltYWdlLmhlaWdodDtcblxuXHRcdFx0dHJ5e1xuXHRcdFx0XHR0aGlzLmltYWdlZGF0YSA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIGltYWdlLndpZHRoLCBpbWFnZS5oZWlnaHQpO1xuXHRcdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRcdHRoaXMucmVzdWx0ID0gXCJDcm9zcyBkb21haW4gaW1hZ2UgcmVhZGluZyBub3Qgc3VwcG9ydGVkIGluIHlvdXIgYnJvd3NlciEgU2F2ZSBpdCB0byB5b3VyIGNvbXB1dGVyIHRoZW4gZHJhZyBhbmQgZHJvcCB0aGUgZmlsZSFcIjtcblx0XHRcdFx0aWYgKHRoaXMuY2FsbGJhY2shPW51bGwpIHJldHVybiB0aGlzLmNhbGxiYWNrKHRoaXMucmVzdWx0KTtcblx0XHRcdH1cblxuICAgICAgICAgICAgZGVjb2RlKCk7XG5cblx0XHR9KS5iaW5kKHRoaXMpO1xuXG5cdFx0aW1hZ2Uuc3JjID0gc3JjO1xuXHR9XG59O1xuXG50aGlzLmRlY29kZV91dGY4ID0gZnVuY3Rpb24gKCBzICkge1xuXG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudCggZXNjYXBlKCBzICkgKTtcbn1cblxudGhpcy5wcm9jZXNzID0gZnVuY3Rpb24oaW1hZ2VEYXRhKSB7XG5cblx0dmFyIHN0YXJ0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cblx0dmFyIGltYWdlID0gdGhpcy5ncmF5U2NhbGVUb0JpdG1hcCh0aGlzLmdyYXlzY2FsZShpbWFnZURhdGEpKTtcblxuXHQvL3ZhciBmaW5kZXJQYXR0ZXJuSW5mbyA9IG5ldyBGaW5kZXJQYXR0ZXJuRmluZGVyKCkuZmluZEZpbmRlclBhdHRlcm4oaW1hZ2UpO1xuXG5cdHZhciBkZXRlY3RvciA9IG5ldyBEZXRlY3RvcihpbWFnZSk7XG5cblx0dmFyIHFSQ29kZU1hdHJpeCA9IGRldGVjdG9yLmRldGVjdCgpO1xuXG5cdC8qZm9yICh2YXIgeSA9IDA7IHkgPCBxUkNvZGVNYXRyaXguYml0cy5IZWlnaHQ7IHkrKylcblx0e1xuXHRcdGZvciAodmFyIHggPSAwOyB4IDwgcVJDb2RlTWF0cml4LmJpdHMuV2lkdGg7IHgrKylcblx0XHR7XG5cdFx0XHR2YXIgcG9pbnQgPSAoeCAqIDQqMikgKyAoeSoyICogaW1hZ2VEYXRhLndpZHRoICogNCk7XG5cdFx0XHRpbWFnZURhdGEuZGF0YVtwb2ludF0gPSBxUkNvZGVNYXRyaXguYml0cy5nZXRfUmVuYW1lZCh4LHkpPzA6MDtcblx0XHRcdGltYWdlRGF0YS5kYXRhW3BvaW50KzFdID0gcVJDb2RlTWF0cml4LmJpdHMuZ2V0X1JlbmFtZWQoeCx5KT8wOjA7XG5cdFx0XHRpbWFnZURhdGEuZGF0YVtwb2ludCsyXSA9IHFSQ29kZU1hdHJpeC5iaXRzLmdldF9SZW5hbWVkKHgseSk/MjU1OjA7XG5cdFx0fVxuXHR9Ki9cblxuXHR2YXIgcmVhZGVyID0gRGVjb2Rlci5kZWNvZGUocVJDb2RlTWF0cml4LmJpdHMpO1xuXHR2YXIgZGF0YSA9IHJlYWRlci5EYXRhQnl0ZTtcblx0dmFyIHN0cj1cIlwiO1xuXHRmb3IodmFyIGk9MDtpPGRhdGEubGVuZ3RoO2krKylcblx0e1xuXHRcdGZvcih2YXIgaj0wO2o8ZGF0YVtpXS5sZW5ndGg7aisrKVxuXHRcdFx0c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGRhdGFbaV1bal0pO1xuXHR9XG5cblx0dmFyIGVuZCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXHR2YXIgdGltZSA9IGVuZCAtIHN0YXJ0O1xuXHRpZiAodGhpcy5kZWJ1Zykge1xuXHRcdGNvbnNvbGUubG9nKCdRUiBDb2RlIHByb2Nlc3NpbmcgdGltZSAobXMpOiAnICsgdGltZSk7XG5cdH1cblxuXHRyZXR1cm4gdGhpcy5kZWNvZGVfdXRmOChzdHIpO1xuXHQvL2FsZXJ0KFwiVGltZTpcIiArIHRpbWUgKyBcIiBDb2RlOiBcIitzdHIpO1xufVxuXG50aGlzLmdldFBpeGVsID0gZnVuY3Rpb24oaW1hZ2VEYXRhLCB4LHkpe1xuXHRpZiAoaW1hZ2VEYXRhLndpZHRoIDwgeCkge1xuXHRcdHRocm93IFwicG9pbnQgZXJyb3JcIjtcblx0fVxuXHRpZiAoaW1hZ2VEYXRhLmhlaWdodCA8IHkpIHtcblx0XHR0aHJvdyBcInBvaW50IGVycm9yXCI7XG5cdH1cblx0cG9pbnQgPSAoeCAqIDQpICsgKHkgKiBpbWFnZURhdGEud2lkdGggKiA0KTtcblx0cCA9IChpbWFnZURhdGEuZGF0YVtwb2ludF0qMzMgKyBpbWFnZURhdGEuZGF0YVtwb2ludCArIDFdKjM0ICsgaW1hZ2VEYXRhLmRhdGFbcG9pbnQgKyAyXSozMykvMTAwO1xuXHRyZXR1cm4gcDtcbn1cblxudGhpcy5iaW5hcml6ZSA9IGZ1bmN0aW9uKHRoKXtcblx0dmFyIHJldCA9IG5ldyBBcnJheSh0aGlzLndpZHRoKnRoaXMuaGVpZ2h0KTtcblx0Zm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKVxuXHR7XG5cdFx0Zm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspXG5cdFx0e1xuXHRcdFx0dmFyIGdyYXkgPSB0aGlzLmdldFBpeGVsKHgsIHkpO1xuXG5cdFx0XHRyZXRbeCt5KnRoaXMud2lkdGhdID0gZ3JheTw9dGg/dHJ1ZTpmYWxzZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHJldDtcbn1cblxudGhpcy5nZXRNaWRkbGVCcmlnaHRuZXNzUGVyQXJlYT1mdW5jdGlvbihpbWFnZURhdGEpXG57XG5cdHZhciBudW1TcXJ0QXJlYSA9IDQ7XG5cdC8vb2J0YWluIG1pZGRsZSBicmlnaHRuZXNzKChtaW4gKyBtYXgpIC8gMikgcGVyIGFyZWFcblx0dmFyIGFyZWFXaWR0aCA9IE1hdGguZmxvb3IoaW1hZ2VEYXRhLndpZHRoIC8gbnVtU3FydEFyZWEpO1xuXHR2YXIgYXJlYUhlaWdodCA9IE1hdGguZmxvb3IoaW1hZ2VEYXRhLmhlaWdodCAvIG51bVNxcnRBcmVhKTtcblx0dmFyIG1pbm1heCA9IG5ldyBBcnJheShudW1TcXJ0QXJlYSk7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbnVtU3FydEFyZWE7IGkrKylcblx0e1xuXHRcdG1pbm1heFtpXSA9IG5ldyBBcnJheShudW1TcXJ0QXJlYSk7XG5cdFx0Zm9yICh2YXIgaTIgPSAwOyBpMiA8IG51bVNxcnRBcmVhOyBpMisrKVxuXHRcdHtcblx0XHRcdG1pbm1heFtpXVtpMl0gPSBuZXcgQXJyYXkoMCwwKTtcblx0XHR9XG5cdH1cblx0Zm9yICh2YXIgYXkgPSAwOyBheSA8IG51bVNxcnRBcmVhOyBheSsrKVxuXHR7XG5cdFx0Zm9yICh2YXIgYXggPSAwOyBheCA8IG51bVNxcnRBcmVhOyBheCsrKVxuXHRcdHtcblx0XHRcdG1pbm1heFtheF1bYXldWzBdID0gMHhGRjtcblx0XHRcdGZvciAodmFyIGR5ID0gMDsgZHkgPCBhcmVhSGVpZ2h0OyBkeSsrKVxuXHRcdFx0e1xuXHRcdFx0XHRmb3IgKHZhciBkeCA9IDA7IGR4IDwgYXJlYVdpZHRoOyBkeCsrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dmFyIHRhcmdldCA9IGltYWdlRGF0YS5kYXRhW2FyZWFXaWR0aCAqIGF4ICsgZHgrKGFyZWFIZWlnaHQgKiBheSArIGR5KSppbWFnZURhdGEud2lkdGhdO1xuXHRcdFx0XHRcdGlmICh0YXJnZXQgPCBtaW5tYXhbYXhdW2F5XVswXSlcblx0XHRcdFx0XHRcdG1pbm1heFtheF1bYXldWzBdID0gdGFyZ2V0O1xuXHRcdFx0XHRcdGlmICh0YXJnZXQgPiBtaW5tYXhbYXhdW2F5XVsxXSlcblx0XHRcdFx0XHRcdG1pbm1heFtheF1bYXldWzFdID0gdGFyZ2V0O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvL21pbm1heFtheF1bYXldWzBdID0gKG1pbm1heFtheF1bYXldWzBdICsgbWlubWF4W2F4XVtheV1bMV0pIC8gMjtcblx0XHR9XG5cdH1cblx0dmFyIG1pZGRsZSA9IG5ldyBBcnJheShudW1TcXJ0QXJlYSk7XG5cdGZvciAodmFyIGkzID0gMDsgaTMgPCBudW1TcXJ0QXJlYTsgaTMrKylcblx0e1xuXHRcdG1pZGRsZVtpM10gPSBuZXcgQXJyYXkobnVtU3FydEFyZWEpO1xuXHR9XG5cdGZvciAodmFyIGF5ID0gMDsgYXkgPCBudW1TcXJ0QXJlYTsgYXkrKylcblx0e1xuXHRcdGZvciAodmFyIGF4ID0gMDsgYXggPCBudW1TcXJ0QXJlYTsgYXgrKylcblx0XHR7XG5cdFx0XHRtaWRkbGVbYXhdW2F5XSA9IE1hdGguZmxvb3IoKG1pbm1heFtheF1bYXldWzBdICsgbWlubWF4W2F4XVtheV1bMV0pIC8gMik7XG5cdFx0XHQvL0NvbnNvbGUub3V0LnByaW50KG1pZGRsZVtheF1bYXldICsgXCIsXCIpO1xuXHRcdH1cblx0XHQvL0NvbnNvbGUub3V0LnByaW50bG4oXCJcIik7XG5cdH1cblx0Ly9Db25zb2xlLm91dC5wcmludGxuKFwiXCIpO1xuXG5cdHJldHVybiBtaWRkbGU7XG59XG5cbnRoaXMuZ3JheVNjYWxlVG9CaXRtYXA9ZnVuY3Rpb24oZ3JheVNjYWxlSW1hZ2VEYXRhKVxue1xuXHR2YXIgbWlkZGxlID0gdGhpcy5nZXRNaWRkbGVCcmlnaHRuZXNzUGVyQXJlYShncmF5U2NhbGVJbWFnZURhdGEpO1xuXHR2YXIgc3FydE51bUFyZWEgPSBtaWRkbGUubGVuZ3RoO1xuXHR2YXIgYXJlYVdpZHRoID0gTWF0aC5mbG9vcihncmF5U2NhbGVJbWFnZURhdGEud2lkdGggLyBzcXJ0TnVtQXJlYSk7XG5cdHZhciBhcmVhSGVpZ2h0ID0gTWF0aC5mbG9vcihncmF5U2NhbGVJbWFnZURhdGEuaGVpZ2h0IC8gc3FydE51bUFyZWEpO1xuXG5cdGZvciAodmFyIGF5ID0gMDsgYXkgPCBzcXJ0TnVtQXJlYTsgYXkrKylcblx0e1xuXHRcdGZvciAodmFyIGF4ID0gMDsgYXggPCBzcXJ0TnVtQXJlYTsgYXgrKylcblx0XHR7XG5cdFx0XHRmb3IgKHZhciBkeSA9IDA7IGR5IDwgYXJlYUhlaWdodDsgZHkrKylcblx0XHRcdHtcblx0XHRcdFx0Zm9yICh2YXIgZHggPSAwOyBkeCA8IGFyZWFXaWR0aDsgZHgrKylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGdyYXlTY2FsZUltYWdlRGF0YS5kYXRhW2FyZWFXaWR0aCAqIGF4ICsgZHgrIChhcmVhSGVpZ2h0ICogYXkgKyBkeSkqZ3JheVNjYWxlSW1hZ2VEYXRhLndpZHRoXSA9IChncmF5U2NhbGVJbWFnZURhdGEuZGF0YVthcmVhV2lkdGggKiBheCArIGR4KyAoYXJlYUhlaWdodCAqIGF5ICsgZHkpKmdyYXlTY2FsZUltYWdlRGF0YS53aWR0aF0gPCBtaWRkbGVbYXhdW2F5XSk/dHJ1ZTpmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gZ3JheVNjYWxlSW1hZ2VEYXRhO1xufVxuXG50aGlzLmdyYXlzY2FsZSA9IGZ1bmN0aW9uKGltYWdlRGF0YSl7XG5cdHZhciByZXQgPSBuZXcgQXJyYXkoaW1hZ2VEYXRhLndpZHRoKmltYWdlRGF0YS5oZWlnaHQpO1xuXG5cdGZvciAodmFyIHkgPSAwOyB5IDwgaW1hZ2VEYXRhLmhlaWdodDsgeSsrKVxuXHR7XG5cdFx0Zm9yICh2YXIgeCA9IDA7IHggPCBpbWFnZURhdGEud2lkdGg7IHgrKylcblx0XHR7XG5cdFx0XHR2YXIgZ3JheSA9IHRoaXMuZ2V0UGl4ZWwoaW1hZ2VEYXRhLCB4LCB5KTtcblxuXHRcdFx0cmV0W3greSppbWFnZURhdGEud2lkdGhdID0gZ3JheTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdGhlaWdodDogaW1hZ2VEYXRhLmhlaWdodCxcblx0XHR3aWR0aDogaW1hZ2VEYXRhLndpZHRoLFxuXHRcdGRhdGE6IHJldFxuXHR9O1xufVxuXG4gIH1cblxuZnVuY3Rpb24gVVJTaGlmdCggbnVtYmVyLCAgYml0cylcbntcblx0aWYgKG51bWJlciA+PSAwKVxuXHRcdHJldHVybiBudW1iZXIgPj4gYml0cztcblx0ZWxzZVxuXHRcdHJldHVybiAobnVtYmVyID4+IGJpdHMpICsgKDIgPDwgfmJpdHMpO1xufVxuXG4vKlxuICBQb3J0ZWQgdG8gSmF2YVNjcmlwdCBieSBMYXphciBMYXN6bG8gMjAxMVxuXG4gIGxhemFyc29mdEBnbWFpbC5jb20sIHd3dy5sYXphcnNvZnQuaW5mb1xuXG4qL1xuXG4vKlxuKlxuKiBDb3B5cmlnaHQgMjAwNyBaWGluZyBhdXRob3JzXG4qXG4qIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4qIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4qXG4qICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4qXG4qIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cblxudmFyIE1JTl9TS0lQID0gMztcbnZhciBNQVhfTU9EVUxFUyA9IDU3O1xudmFyIElOVEVHRVJfTUFUSF9TSElGVCA9IDg7XG52YXIgQ0VOVEVSX1FVT1JVTSA9IDI7XG5cbnFyY29kZS5vcmRlckJlc3RQYXR0ZXJucz1mdW5jdGlvbihwYXR0ZXJucylcblx0XHR7XG5cblx0XHRcdGZ1bmN0aW9uIGRpc3RhbmNlKCBwYXR0ZXJuMSwgIHBhdHRlcm4yKVxuXHRcdFx0e1xuXHRcdFx0XHR4RGlmZiA9IHBhdHRlcm4xLlggLSBwYXR0ZXJuMi5YO1xuXHRcdFx0XHR5RGlmZiA9IHBhdHRlcm4xLlkgLSBwYXR0ZXJuMi5ZO1xuXHRcdFx0XHRyZXR1cm4gIE1hdGguc3FydCggKHhEaWZmICogeERpZmYgKyB5RGlmZiAqIHlEaWZmKSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vLyA8c3VtbWFyeT4gUmV0dXJucyB0aGUgeiBjb21wb25lbnQgb2YgdGhlIGNyb3NzIHByb2R1Y3QgYmV0d2VlbiB2ZWN0b3JzIEJDIGFuZCBCQS48L3N1bW1hcnk+XG5cdFx0XHRmdW5jdGlvbiBjcm9zc1Byb2R1Y3RaKCBwb2ludEEsICBwb2ludEIsICBwb2ludEMpXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBiWCA9IHBvaW50Qi54O1xuXHRcdFx0XHR2YXIgYlkgPSBwb2ludEIueTtcblx0XHRcdFx0cmV0dXJuICgocG9pbnRDLnggLSBiWCkgKiAocG9pbnRBLnkgLSBiWSkpIC0gKChwb2ludEMueSAtIGJZKSAqIChwb2ludEEueCAtIGJYKSk7XG5cdFx0XHR9XG5cblxuXHRcdFx0Ly8gRmluZCBkaXN0YW5jZXMgYmV0d2VlbiBwYXR0ZXJuIGNlbnRlcnNcblx0XHRcdHZhciB6ZXJvT25lRGlzdGFuY2UgPSBkaXN0YW5jZShwYXR0ZXJuc1swXSwgcGF0dGVybnNbMV0pO1xuXHRcdFx0dmFyIG9uZVR3b0Rpc3RhbmNlID0gZGlzdGFuY2UocGF0dGVybnNbMV0sIHBhdHRlcm5zWzJdKTtcblx0XHRcdHZhciB6ZXJvVHdvRGlzdGFuY2UgPSBkaXN0YW5jZShwYXR0ZXJuc1swXSwgcGF0dGVybnNbMl0pO1xuXG5cdFx0XHR2YXIgcG9pbnRBLCBwb2ludEIsIHBvaW50Qztcblx0XHRcdC8vIEFzc3VtZSBvbmUgY2xvc2VzdCB0byBvdGhlciB0d28gaXMgQjsgQSBhbmQgQyB3aWxsIGp1c3QgYmUgZ3Vlc3NlcyBhdCBmaXJzdFxuXHRcdFx0aWYgKG9uZVR3b0Rpc3RhbmNlID49IHplcm9PbmVEaXN0YW5jZSAmJiBvbmVUd29EaXN0YW5jZSA+PSB6ZXJvVHdvRGlzdGFuY2UpXG5cdFx0XHR7XG5cdFx0XHRcdHBvaW50QiA9IHBhdHRlcm5zWzBdO1xuXHRcdFx0XHRwb2ludEEgPSBwYXR0ZXJuc1sxXTtcblx0XHRcdFx0cG9pbnRDID0gcGF0dGVybnNbMl07XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh6ZXJvVHdvRGlzdGFuY2UgPj0gb25lVHdvRGlzdGFuY2UgJiYgemVyb1R3b0Rpc3RhbmNlID49IHplcm9PbmVEaXN0YW5jZSlcblx0XHRcdHtcblx0XHRcdFx0cG9pbnRCID0gcGF0dGVybnNbMV07XG5cdFx0XHRcdHBvaW50QSA9IHBhdHRlcm5zWzBdO1xuXHRcdFx0XHRwb2ludEMgPSBwYXR0ZXJuc1syXTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0cG9pbnRCID0gcGF0dGVybnNbMl07XG5cdFx0XHRcdHBvaW50QSA9IHBhdHRlcm5zWzBdO1xuXHRcdFx0XHRwb2ludEMgPSBwYXR0ZXJuc1sxXTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gVXNlIGNyb3NzIHByb2R1Y3QgdG8gZmlndXJlIG91dCB3aGV0aGVyIEEgYW5kIEMgYXJlIGNvcnJlY3Qgb3IgZmxpcHBlZC5cblx0XHRcdC8vIFRoaXMgYXNrcyB3aGV0aGVyIEJDIHggQkEgaGFzIGEgcG9zaXRpdmUgeiBjb21wb25lbnQsIHdoaWNoIGlzIHRoZSBhcnJhbmdlbWVudFxuXHRcdFx0Ly8gd2Ugd2FudCBmb3IgQSwgQiwgQy4gSWYgaXQncyBuZWdhdGl2ZSwgdGhlbiB3ZSd2ZSBnb3QgaXQgZmxpcHBlZCBhcm91bmQgYW5kXG5cdFx0XHQvLyBzaG91bGQgc3dhcCBBIGFuZCBDLlxuXHRcdFx0aWYgKGNyb3NzUHJvZHVjdFoocG9pbnRBLCBwb2ludEIsIHBvaW50QykgPCAwLjApXG5cdFx0XHR7XG5cdFx0XHRcdHZhciB0ZW1wID0gcG9pbnRBO1xuXHRcdFx0XHRwb2ludEEgPSBwb2ludEM7XG5cdFx0XHRcdHBvaW50QyA9IHRlbXA7XG5cdFx0XHR9XG5cblx0XHRcdHBhdHRlcm5zWzBdID0gcG9pbnRBO1xuXHRcdFx0cGF0dGVybnNbMV0gPSBwb2ludEI7XG5cdFx0XHRwYXR0ZXJuc1syXSA9IHBvaW50Qztcblx0XHR9XG5cblxuZnVuY3Rpb24gRmluZGVyUGF0dGVybihwb3NYLCBwb3NZLCAgZXN0aW1hdGVkTW9kdWxlU2l6ZSlcbntcblx0dGhpcy54PXBvc1g7XG5cdHRoaXMueT1wb3NZO1xuXHR0aGlzLmNvdW50ID0gMTtcblx0dGhpcy5lc3RpbWF0ZWRNb2R1bGVTaXplID0gZXN0aW1hdGVkTW9kdWxlU2l6ZTtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIkVzdGltYXRlZE1vZHVsZVNpemVcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiB0aGlzLmVzdGltYXRlZE1vZHVsZVNpemU7XG5cdH19KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJDb3VudFwiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuY291bnQ7XG5cdH19KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJYXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy54O1xuXHR9fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiWVwiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMueTtcblx0fX0pO1xuXHR0aGlzLmluY3JlbWVudENvdW50ID0gZnVuY3Rpb24oKVxuXHR7XG5cdFx0dGhpcy5jb3VudCsrO1xuXHR9XG5cdHRoaXMuYWJvdXRFcXVhbHM9ZnVuY3Rpb24oIG1vZHVsZVNpemUsICBpLCAgailcblx0XHR7XG5cdFx0XHRpZiAoTWF0aC5hYnMoaSAtIHRoaXMueSkgPD0gbW9kdWxlU2l6ZSAmJiBNYXRoLmFicyhqIC0gdGhpcy54KSA8PSBtb2R1bGVTaXplKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgbW9kdWxlU2l6ZURpZmYgPSBNYXRoLmFicyhtb2R1bGVTaXplIC0gdGhpcy5lc3RpbWF0ZWRNb2R1bGVTaXplKTtcblx0XHRcdFx0cmV0dXJuIG1vZHVsZVNpemVEaWZmIDw9IDEuMCB8fCBtb2R1bGVTaXplRGlmZiAvIHRoaXMuZXN0aW1hdGVkTW9kdWxlU2l6ZSA8PSAxLjA7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG59XG5cbmZ1bmN0aW9uIEZpbmRlclBhdHRlcm5JbmZvKHBhdHRlcm5DZW50ZXJzKVxue1xuXHR0aGlzLmJvdHRvbUxlZnQgPSBwYXR0ZXJuQ2VudGVyc1swXTtcblx0dGhpcy50b3BMZWZ0ID0gcGF0dGVybkNlbnRlcnNbMV07XG5cdHRoaXMudG9wUmlnaHQgPSBwYXR0ZXJuQ2VudGVyc1syXTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJCb3R0b21MZWZ0XCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5ib3R0b21MZWZ0O1xuXHR9fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiVG9wTGVmdFwiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMudG9wTGVmdDtcblx0fX0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIlRvcFJpZ2h0XCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy50b3BSaWdodDtcblx0fX0pO1xufVxuXG5mdW5jdGlvbiBGaW5kZXJQYXR0ZXJuRmluZGVyKClcbntcblx0dGhpcy5pbWFnZT1udWxsO1xuXHR0aGlzLnBvc3NpYmxlQ2VudGVycyA9IFtdO1xuXHR0aGlzLmhhc1NraXBwZWQgPSBmYWxzZTtcblx0dGhpcy5jcm9zc0NoZWNrU3RhdGVDb3VudCA9IG5ldyBBcnJheSgwLDAsMCwwLDApO1xuXHR0aGlzLnJlc3VsdFBvaW50Q2FsbGJhY2sgPSBudWxsO1xuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiQ3Jvc3NDaGVja1N0YXRlQ291bnRcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHRoaXMuY3Jvc3NDaGVja1N0YXRlQ291bnRbMF0gPSAwO1xuXHRcdHRoaXMuY3Jvc3NDaGVja1N0YXRlQ291bnRbMV0gPSAwO1xuXHRcdHRoaXMuY3Jvc3NDaGVja1N0YXRlQ291bnRbMl0gPSAwO1xuXHRcdHRoaXMuY3Jvc3NDaGVja1N0YXRlQ291bnRbM10gPSAwO1xuXHRcdHRoaXMuY3Jvc3NDaGVja1N0YXRlQ291bnRbNF0gPSAwO1xuXHRcdHJldHVybiB0aGlzLmNyb3NzQ2hlY2tTdGF0ZUNvdW50O1xuXHR9fSk7XG5cblx0dGhpcy5mb3VuZFBhdHRlcm5Dcm9zcz1mdW5jdGlvbiggc3RhdGVDb3VudClcblx0XHR7XG5cdFx0XHR2YXIgdG90YWxNb2R1bGVTaXplID0gMDtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgNTsgaSsrKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgY291bnQgPSBzdGF0ZUNvdW50W2ldO1xuXHRcdFx0XHRpZiAoY291bnQgPT0gMClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0b3RhbE1vZHVsZVNpemUgKz0gY291bnQ7XG5cdFx0XHR9XG5cdFx0XHRpZiAodG90YWxNb2R1bGVTaXplIDwgNylcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0dmFyIG1vZHVsZVNpemUgPSBNYXRoLmZsb29yKCh0b3RhbE1vZHVsZVNpemUgPDwgSU5URUdFUl9NQVRIX1NISUZUKSAvIDcpO1xuXHRcdFx0dmFyIG1heFZhcmlhbmNlID0gTWF0aC5mbG9vcihtb2R1bGVTaXplIC8gMik7XG5cdFx0XHQvLyBBbGxvdyBsZXNzIHRoYW4gNTAlIHZhcmlhbmNlIGZyb20gMS0xLTMtMS0xIHByb3BvcnRpb25zXG5cdFx0XHRyZXR1cm4gTWF0aC5hYnMobW9kdWxlU2l6ZSAtIChzdGF0ZUNvdW50WzBdIDw8IElOVEVHRVJfTUFUSF9TSElGVCkpIDwgbWF4VmFyaWFuY2UgJiYgTWF0aC5hYnMobW9kdWxlU2l6ZSAtIChzdGF0ZUNvdW50WzFdIDw8IElOVEVHRVJfTUFUSF9TSElGVCkpIDwgbWF4VmFyaWFuY2UgJiYgTWF0aC5hYnMoMyAqIG1vZHVsZVNpemUgLSAoc3RhdGVDb3VudFsyXSA8PCBJTlRFR0VSX01BVEhfU0hJRlQpKSA8IDMgKiBtYXhWYXJpYW5jZSAmJiBNYXRoLmFicyhtb2R1bGVTaXplIC0gKHN0YXRlQ291bnRbM10gPDwgSU5URUdFUl9NQVRIX1NISUZUKSkgPCBtYXhWYXJpYW5jZSAmJiBNYXRoLmFicyhtb2R1bGVTaXplIC0gKHN0YXRlQ291bnRbNF0gPDwgSU5URUdFUl9NQVRIX1NISUZUKSkgPCBtYXhWYXJpYW5jZTtcblx0XHR9XG5cdHRoaXMuY2VudGVyRnJvbUVuZD1mdW5jdGlvbiggc3RhdGVDb3VudCwgIGVuZClcblx0XHR7XG5cdFx0XHRyZXR1cm4gIChlbmQgLSBzdGF0ZUNvdW50WzRdIC0gc3RhdGVDb3VudFszXSkgLSBzdGF0ZUNvdW50WzJdIC8gMi4wO1xuXHRcdH1cblx0dGhpcy5jcm9zc0NoZWNrVmVydGljYWw9ZnVuY3Rpb24oIHN0YXJ0SSwgIGNlbnRlckosICBtYXhDb3VudCwgIG9yaWdpbmFsU3RhdGVDb3VudFRvdGFsKVxuXHRcdHtcblx0XHRcdHZhciBpbWFnZSA9IHRoaXMuaW1hZ2U7XG5cblx0XHRcdHZhciBtYXhJID0gaW1hZ2UuaGVpZ2h0O1xuXHRcdFx0dmFyIHN0YXRlQ291bnQgPSB0aGlzLkNyb3NzQ2hlY2tTdGF0ZUNvdW50O1xuXG5cdFx0XHQvLyBTdGFydCBjb3VudGluZyB1cCBmcm9tIGNlbnRlclxuXHRcdFx0dmFyIGkgPSBzdGFydEk7XG5cdFx0XHR3aGlsZSAoaSA+PSAwICYmIGltYWdlLmRhdGFbY2VudGVySiArIGkqaW1hZ2Uud2lkdGhdKVxuXHRcdFx0e1xuXHRcdFx0XHRzdGF0ZUNvdW50WzJdKys7XG5cdFx0XHRcdGktLTtcblx0XHRcdH1cblx0XHRcdGlmIChpIDwgMClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIE5hTjtcblx0XHRcdH1cblx0XHRcdHdoaWxlIChpID49IDAgJiYgIWltYWdlLmRhdGFbY2VudGVySiAraSppbWFnZS53aWR0aF0gJiYgc3RhdGVDb3VudFsxXSA8PSBtYXhDb3VudClcblx0XHRcdHtcblx0XHRcdFx0c3RhdGVDb3VudFsxXSsrO1xuXHRcdFx0XHRpLS07XG5cdFx0XHR9XG5cdFx0XHQvLyBJZiBhbHJlYWR5IHRvbyBtYW55IG1vZHVsZXMgaW4gdGhpcyBzdGF0ZSBvciByYW4gb2ZmIHRoZSBlZGdlOlxuXHRcdFx0aWYgKGkgPCAwIHx8IHN0YXRlQ291bnRbMV0gPiBtYXhDb3VudClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIE5hTjtcblx0XHRcdH1cblx0XHRcdHdoaWxlIChpID49IDAgJiYgaW1hZ2UuZGF0YVtjZW50ZXJKICsgaSppbWFnZS53aWR0aF0gJiYgc3RhdGVDb3VudFswXSA8PSBtYXhDb3VudClcblx0XHRcdHtcblx0XHRcdFx0c3RhdGVDb3VudFswXSsrO1xuXHRcdFx0XHRpLS07XG5cdFx0XHR9XG5cdFx0XHRpZiAoc3RhdGVDb3VudFswXSA+IG1heENvdW50KVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gTmFOO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBOb3cgYWxzbyBjb3VudCBkb3duIGZyb20gY2VudGVyXG5cdFx0XHRpID0gc3RhcnRJICsgMTtcblx0XHRcdHdoaWxlIChpIDwgbWF4SSAmJiBpbWFnZS5kYXRhW2NlbnRlckogK2kqaW1hZ2Uud2lkdGhdKVxuXHRcdFx0e1xuXHRcdFx0XHRzdGF0ZUNvdW50WzJdKys7XG5cdFx0XHRcdGkrKztcblx0XHRcdH1cblx0XHRcdGlmIChpID09IG1heEkpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBOYU47XG5cdFx0XHR9XG5cdFx0XHR3aGlsZSAoaSA8IG1heEkgJiYgIWltYWdlLmRhdGFbY2VudGVySiArIGkqaW1hZ2Uud2lkdGhdICYmIHN0YXRlQ291bnRbM10gPCBtYXhDb3VudClcblx0XHRcdHtcblx0XHRcdFx0c3RhdGVDb3VudFszXSsrO1xuXHRcdFx0XHRpKys7XG5cdFx0XHR9XG5cdFx0XHRpZiAoaSA9PSBtYXhJIHx8IHN0YXRlQ291bnRbM10gPj0gbWF4Q291bnQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBOYU47XG5cdFx0XHR9XG5cdFx0XHR3aGlsZSAoaSA8IG1heEkgJiYgaW1hZ2UuZGF0YVtjZW50ZXJKICsgaSppbWFnZS53aWR0aF0gJiYgc3RhdGVDb3VudFs0XSA8IG1heENvdW50KVxuXHRcdFx0e1xuXHRcdFx0XHRzdGF0ZUNvdW50WzRdKys7XG5cdFx0XHRcdGkrKztcblx0XHRcdH1cblx0XHRcdGlmIChzdGF0ZUNvdW50WzRdID49IG1heENvdW50KVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gTmFOO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBJZiB3ZSBmb3VuZCBhIGZpbmRlci1wYXR0ZXJuLWxpa2Ugc2VjdGlvbiwgYnV0IGl0cyBzaXplIGlzIG1vcmUgdGhhbiA0MCUgZGlmZmVyZW50IHRoYW5cblx0XHRcdC8vIHRoZSBvcmlnaW5hbCwgYXNzdW1lIGl0J3MgYSBmYWxzZSBwb3NpdGl2ZVxuXHRcdFx0dmFyIHN0YXRlQ291bnRUb3RhbCA9IHN0YXRlQ291bnRbMF0gKyBzdGF0ZUNvdW50WzFdICsgc3RhdGVDb3VudFsyXSArIHN0YXRlQ291bnRbM10gKyBzdGF0ZUNvdW50WzRdO1xuXHRcdFx0aWYgKDUgKiBNYXRoLmFicyhzdGF0ZUNvdW50VG90YWwgLSBvcmlnaW5hbFN0YXRlQ291bnRUb3RhbCkgPj0gMiAqIG9yaWdpbmFsU3RhdGVDb3VudFRvdGFsKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gTmFOO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGhpcy5mb3VuZFBhdHRlcm5Dcm9zcyhzdGF0ZUNvdW50KT90aGlzLmNlbnRlckZyb21FbmQoc3RhdGVDb3VudCwgaSk6TmFOO1xuXHRcdH1cblx0dGhpcy5jcm9zc0NoZWNrSG9yaXpvbnRhbD1mdW5jdGlvbiggc3RhcnRKLCAgY2VudGVySSwgIG1heENvdW50LCBvcmlnaW5hbFN0YXRlQ291bnRUb3RhbClcblx0XHR7XG5cdFx0XHR2YXIgaW1hZ2UgPSB0aGlzLmltYWdlO1xuXG5cdFx0XHR2YXIgbWF4SiA9IGltYWdlLndpZHRoO1xuXHRcdFx0dmFyIHN0YXRlQ291bnQgPSB0aGlzLkNyb3NzQ2hlY2tTdGF0ZUNvdW50O1xuXG5cdFx0XHR2YXIgaiA9IHN0YXJ0Sjtcblx0XHRcdHdoaWxlIChqID49IDAgJiYgaW1hZ2UuZGF0YVtqKyBjZW50ZXJJKmltYWdlLndpZHRoXSlcblx0XHRcdHtcblx0XHRcdFx0c3RhdGVDb3VudFsyXSsrO1xuXHRcdFx0XHRqLS07XG5cdFx0XHR9XG5cdFx0XHRpZiAoaiA8IDApXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBOYU47XG5cdFx0XHR9XG5cdFx0XHR3aGlsZSAoaiA+PSAwICYmICFpbWFnZS5kYXRhW2orIGNlbnRlckkqaW1hZ2Uud2lkdGhdICYmIHN0YXRlQ291bnRbMV0gPD0gbWF4Q291bnQpXG5cdFx0XHR7XG5cdFx0XHRcdHN0YXRlQ291bnRbMV0rKztcblx0XHRcdFx0ai0tO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGogPCAwIHx8IHN0YXRlQ291bnRbMV0gPiBtYXhDb3VudClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIE5hTjtcblx0XHRcdH1cblx0XHRcdHdoaWxlIChqID49IDAgJiYgaW1hZ2UuZGF0YVtqKyBjZW50ZXJJKmltYWdlLndpZHRoXSAmJiBzdGF0ZUNvdW50WzBdIDw9IG1heENvdW50KVxuXHRcdFx0e1xuXHRcdFx0XHRzdGF0ZUNvdW50WzBdKys7XG5cdFx0XHRcdGotLTtcblx0XHRcdH1cblx0XHRcdGlmIChzdGF0ZUNvdW50WzBdID4gbWF4Q291bnQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBOYU47XG5cdFx0XHR9XG5cblx0XHRcdGogPSBzdGFydEogKyAxO1xuXHRcdFx0d2hpbGUgKGogPCBtYXhKICYmIGltYWdlLmRhdGFbaisgY2VudGVySSppbWFnZS53aWR0aF0pXG5cdFx0XHR7XG5cdFx0XHRcdHN0YXRlQ291bnRbMl0rKztcblx0XHRcdFx0aisrO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGogPT0gbWF4Silcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIE5hTjtcblx0XHRcdH1cblx0XHRcdHdoaWxlIChqIDwgbWF4SiAmJiAhaW1hZ2UuZGF0YVtqKyBjZW50ZXJJKmltYWdlLndpZHRoXSAmJiBzdGF0ZUNvdW50WzNdIDwgbWF4Q291bnQpXG5cdFx0XHR7XG5cdFx0XHRcdHN0YXRlQ291bnRbM10rKztcblx0XHRcdFx0aisrO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGogPT0gbWF4SiB8fCBzdGF0ZUNvdW50WzNdID49IG1heENvdW50KVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gTmFOO1xuXHRcdFx0fVxuXHRcdFx0d2hpbGUgKGogPCBtYXhKICYmIGltYWdlLmRhdGFbaisgY2VudGVySSppbWFnZS53aWR0aF0gJiYgc3RhdGVDb3VudFs0XSA8IG1heENvdW50KVxuXHRcdFx0e1xuXHRcdFx0XHRzdGF0ZUNvdW50WzRdKys7XG5cdFx0XHRcdGorKztcblx0XHRcdH1cblx0XHRcdGlmIChzdGF0ZUNvdW50WzRdID49IG1heENvdW50KVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gTmFOO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBJZiB3ZSBmb3VuZCBhIGZpbmRlci1wYXR0ZXJuLWxpa2Ugc2VjdGlvbiwgYnV0IGl0cyBzaXplIGlzIHNpZ25pZmljYW50bHkgZGlmZmVyZW50IHRoYW5cblx0XHRcdC8vIHRoZSBvcmlnaW5hbCwgYXNzdW1lIGl0J3MgYSBmYWxzZSBwb3NpdGl2ZVxuXHRcdFx0dmFyIHN0YXRlQ291bnRUb3RhbCA9IHN0YXRlQ291bnRbMF0gKyBzdGF0ZUNvdW50WzFdICsgc3RhdGVDb3VudFsyXSArIHN0YXRlQ291bnRbM10gKyBzdGF0ZUNvdW50WzRdO1xuXHRcdFx0aWYgKDUgKiBNYXRoLmFicyhzdGF0ZUNvdW50VG90YWwgLSBvcmlnaW5hbFN0YXRlQ291bnRUb3RhbCkgPj0gb3JpZ2luYWxTdGF0ZUNvdW50VG90YWwpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBOYU47XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzLmZvdW5kUGF0dGVybkNyb3NzKHN0YXRlQ291bnQpP3RoaXMuY2VudGVyRnJvbUVuZChzdGF0ZUNvdW50LCBqKTpOYU47XG5cdFx0fVxuXHR0aGlzLmhhbmRsZVBvc3NpYmxlQ2VudGVyPWZ1bmN0aW9uKCBzdGF0ZUNvdW50LCAgaSwgIGopXG5cdFx0e1xuXHRcdFx0dmFyIHN0YXRlQ291bnRUb3RhbCA9IHN0YXRlQ291bnRbMF0gKyBzdGF0ZUNvdW50WzFdICsgc3RhdGVDb3VudFsyXSArIHN0YXRlQ291bnRbM10gKyBzdGF0ZUNvdW50WzRdO1xuXHRcdFx0dmFyIGNlbnRlckogPSB0aGlzLmNlbnRlckZyb21FbmQoc3RhdGVDb3VudCwgaik7IC8vZmxvYXRcblx0XHRcdHZhciBjZW50ZXJJID0gdGhpcy5jcm9zc0NoZWNrVmVydGljYWwoaSwgTWF0aC5mbG9vciggY2VudGVySiksIHN0YXRlQ291bnRbMl0sIHN0YXRlQ291bnRUb3RhbCk7IC8vZmxvYXRcblx0XHRcdGlmICghaXNOYU4oY2VudGVySSkpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIFJlLWNyb3NzIGNoZWNrXG5cdFx0XHRcdGNlbnRlckogPSB0aGlzLmNyb3NzQ2hlY2tIb3Jpem9udGFsKE1hdGguZmxvb3IoIGNlbnRlckopLCBNYXRoLmZsb29yKCBjZW50ZXJJKSwgc3RhdGVDb3VudFsyXSwgc3RhdGVDb3VudFRvdGFsKTtcblx0XHRcdFx0aWYgKCFpc05hTihjZW50ZXJKKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZhciBlc3RpbWF0ZWRNb2R1bGVTaXplID0gICBzdGF0ZUNvdW50VG90YWwgLyA3LjA7XG5cdFx0XHRcdFx0dmFyIGZvdW5kID0gZmFsc2U7XG5cdFx0XHRcdFx0dmFyIG1heCA9IHRoaXMucG9zc2libGVDZW50ZXJzLmxlbmd0aDtcblx0XHRcdFx0XHRmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbWF4OyBpbmRleCsrKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHZhciBjZW50ZXIgPSB0aGlzLnBvc3NpYmxlQ2VudGVyc1tpbmRleF07XG5cdFx0XHRcdFx0XHQvLyBMb29rIGZvciBhYm91dCB0aGUgc2FtZSBjZW50ZXIgYW5kIG1vZHVsZSBzaXplOlxuXHRcdFx0XHRcdFx0aWYgKGNlbnRlci5hYm91dEVxdWFscyhlc3RpbWF0ZWRNb2R1bGVTaXplLCBjZW50ZXJJLCBjZW50ZXJKKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Y2VudGVyLmluY3JlbWVudENvdW50KCk7XG5cdFx0XHRcdFx0XHRcdGZvdW5kID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmICghZm91bmQpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dmFyIHBvaW50ID0gbmV3IEZpbmRlclBhdHRlcm4oY2VudGVySiwgY2VudGVySSwgZXN0aW1hdGVkTW9kdWxlU2l6ZSk7XG5cdFx0XHRcdFx0XHR0aGlzLnBvc3NpYmxlQ2VudGVycy5wdXNoKHBvaW50KTtcblx0XHRcdFx0XHRcdGlmICh0aGlzLnJlc3VsdFBvaW50Q2FsbGJhY2sgIT0gbnVsbClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0dGhpcy5yZXN1bHRQb2ludENhbGxiYWNrLmZvdW5kUG9zc2libGVSZXN1bHRQb2ludChwb2ludCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdHRoaXMuc2VsZWN0QmVzdFBhdHRlcm5zPWZ1bmN0aW9uKClcblx0XHR7XG5cblx0XHRcdHZhciBzdGFydFNpemUgPSB0aGlzLnBvc3NpYmxlQ2VudGVycy5sZW5ndGg7XG5cdFx0XHRpZiAoc3RhcnRTaXplIDwgMylcblx0XHRcdHtcblx0XHRcdFx0Ly8gQ291bGRuJ3QgZmluZCBlbm91Z2ggZmluZGVyIHBhdHRlcm5zXG5cdFx0XHRcdHRocm93IFwiQ291bGRuJ3QgZmluZCBlbm91Z2ggZmluZGVyIHBhdHRlcm5zOlwiK3N0YXJ0U2l6ZStcIiBwYXR0ZXJucyBmb3VuZFwiO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBGaWx0ZXIgb3V0bGllciBwb3NzaWJpbGl0aWVzIHdob3NlIG1vZHVsZSBzaXplIGlzIHRvbyBkaWZmZXJlbnRcblx0XHRcdGlmIChzdGFydFNpemUgPiAzKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBCdXQgd2UgY2FuIG9ubHkgYWZmb3JkIHRvIGRvIHNvIGlmIHdlIGhhdmUgYXQgbGVhc3QgNCBwb3NzaWJpbGl0aWVzIHRvIGNob29zZSBmcm9tXG5cdFx0XHRcdHZhciB0b3RhbE1vZHVsZVNpemUgPSAwLjA7XG4gICAgICAgICAgICAgICAgdmFyIHNxdWFyZSA9IDAuMDtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzdGFydFNpemU7IGkrKylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vdG90YWxNb2R1bGVTaXplICs9ICB0aGlzLnBvc3NpYmxlQ2VudGVyc1tpXS5Fc3RpbWF0ZWRNb2R1bGVTaXplO1xuICAgICAgICAgICAgICAgICAgICB2YXJcdGNlbnRlclZhbHVlPXRoaXMucG9zc2libGVDZW50ZXJzW2ldLkVzdGltYXRlZE1vZHVsZVNpemU7XG5cdFx0XHRcdFx0dG90YWxNb2R1bGVTaXplICs9IGNlbnRlclZhbHVlO1xuXHRcdFx0XHRcdHNxdWFyZSArPSAoY2VudGVyVmFsdWUgKiBjZW50ZXJWYWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFyIGF2ZXJhZ2UgPSB0b3RhbE1vZHVsZVNpemUgLyAgc3RhcnRTaXplO1xuICAgICAgICAgICAgICAgIHRoaXMucG9zc2libGVDZW50ZXJzLnNvcnQoZnVuY3Rpb24oY2VudGVyMSxjZW50ZXIyKSB7XG5cdFx0XHRcdCAgICAgIHZhciBkQT1NYXRoLmFicyhjZW50ZXIyLkVzdGltYXRlZE1vZHVsZVNpemUgLSBhdmVyYWdlKTtcblx0XHRcdFx0ICAgICAgdmFyIGRCPU1hdGguYWJzKGNlbnRlcjEuRXN0aW1hdGVkTW9kdWxlU2l6ZSAtIGF2ZXJhZ2UpO1xuXHRcdFx0XHQgICAgICBpZiAoZEEgPCBkQikge1xuXHRcdFx0XHRcdFx0cmV0dXJuICgtMSk7XG5cdFx0XHRcdCAgICAgIH0gZWxzZSBpZiAoZEEgPT0gZEIpIHtcblx0XHRcdFx0XHRcdHJldHVybiAwO1xuXHRcdFx0XHQgICAgICB9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cmV0dXJuIDE7XG5cdFx0XHRcdCAgICAgIH1cblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHR2YXIgc3RkRGV2ID0gTWF0aC5zcXJ0KHNxdWFyZSAvIHN0YXJ0U2l6ZSAtIGF2ZXJhZ2UgKiBhdmVyYWdlKTtcblx0XHRcdFx0dmFyIGxpbWl0ID0gTWF0aC5tYXgoMC4yICogYXZlcmFnZSwgc3RkRGV2KTtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBvc3NpYmxlQ2VudGVycy5sZW5ndGggJiYgdGhpcy5wb3NzaWJsZUNlbnRlcnMubGVuZ3RoID4gMzsgaSsrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dmFyIHBhdHRlcm4gPSAgdGhpcy5wb3NzaWJsZUNlbnRlcnNbaV07XG5cdFx0XHRcdFx0Ly9pZiAoTWF0aC5hYnMocGF0dGVybi5Fc3RpbWF0ZWRNb2R1bGVTaXplIC0gYXZlcmFnZSkgPiAwLjIgKiBhdmVyYWdlKVxuICAgICAgICAgICAgICAgICAgICBpZiAoTWF0aC5hYnMocGF0dGVybi5Fc3RpbWF0ZWRNb2R1bGVTaXplIC0gYXZlcmFnZSkgPiBsaW1pdClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR0aGlzLnBvc3NpYmxlQ2VudGVycy5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdFx0XHRpLS07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLnBvc3NpYmxlQ2VudGVycy5sZW5ndGggPiAzKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBUaHJvdyBhd2F5IGFsbCBidXQgdGhvc2UgZmlyc3Qgc2l6ZSBjYW5kaWRhdGUgcG9pbnRzIHdlIGZvdW5kLlxuXHRcdFx0XHR0aGlzLnBvc3NpYmxlQ2VudGVycy5zb3J0KGZ1bmN0aW9uKGEsIGIpe1xuXHRcdFx0XHQgICAgICAgICAgaWYgKGEuY291bnQgPiBiLmNvdW50KXtyZXR1cm4gLTE7fVxuXHRcdFx0XHQgICAgICAgICAgaWYgKGEuY291bnQgPCBiLmNvdW50KXtyZXR1cm4gMTt9XG5cdFx0XHRcdCAgICAgICAgICByZXR1cm4gMDtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBuZXcgQXJyYXkoIHRoaXMucG9zc2libGVDZW50ZXJzWzBdLCAgdGhpcy5wb3NzaWJsZUNlbnRlcnNbMV0sICB0aGlzLnBvc3NpYmxlQ2VudGVyc1syXSk7XG5cdFx0fVxuXG5cdHRoaXMuZmluZFJvd1NraXA9ZnVuY3Rpb24oKVxuXHRcdHtcblx0XHRcdHZhciBtYXggPSB0aGlzLnBvc3NpYmxlQ2VudGVycy5sZW5ndGg7XG5cdFx0XHRpZiAobWF4IDw9IDEpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiAwO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGZpcnN0Q29uZmlybWVkQ2VudGVyID0gbnVsbDtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbWF4OyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBjZW50ZXIgPSAgdGhpcy5wb3NzaWJsZUNlbnRlcnNbaV07XG5cdFx0XHRcdGlmIChjZW50ZXIuQ291bnQgPj0gQ0VOVEVSX1FVT1JVTSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChmaXJzdENvbmZpcm1lZENlbnRlciA9PSBudWxsKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGZpcnN0Q29uZmlybWVkQ2VudGVyID0gY2VudGVyO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly8gV2UgaGF2ZSB0d28gY29uZmlybWVkIGNlbnRlcnNcblx0XHRcdFx0XHRcdC8vIEhvdyBmYXIgZG93biBjYW4gd2Ugc2tpcCBiZWZvcmUgcmVzdW1pbmcgbG9va2luZyBmb3IgdGhlIG5leHRcblx0XHRcdFx0XHRcdC8vIHBhdHRlcm4/IEluIHRoZSB3b3JzdCBjYXNlLCBvbmx5IHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gdGhlXG5cdFx0XHRcdFx0XHQvLyBkaWZmZXJlbmNlIGluIHRoZSB4IC8geSBjb29yZGluYXRlcyBvZiB0aGUgdHdvIGNlbnRlcnMuXG5cdFx0XHRcdFx0XHQvLyBUaGlzIGlzIHRoZSBjYXNlIHdoZXJlIHlvdSBmaW5kIHRvcCBsZWZ0IGxhc3QuXG5cdFx0XHRcdFx0XHR0aGlzLmhhc1NraXBwZWQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0cmV0dXJuIE1hdGguZmxvb3IgKChNYXRoLmFicyhmaXJzdENvbmZpcm1lZENlbnRlci5YIC0gY2VudGVyLlgpIC0gTWF0aC5hYnMoZmlyc3RDb25maXJtZWRDZW50ZXIuWSAtIGNlbnRlci5ZKSkgLyAyKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiAwO1xuXHRcdH1cblxuXHR0aGlzLmhhdmVNdWx0aXBseUNvbmZpcm1lZENlbnRlcnM9ZnVuY3Rpb24oKVxuXHRcdHtcblx0XHRcdHZhciBjb25maXJtZWRDb3VudCA9IDA7XG5cdFx0XHR2YXIgdG90YWxNb2R1bGVTaXplID0gMC4wO1xuXHRcdFx0dmFyIG1heCA9IHRoaXMucG9zc2libGVDZW50ZXJzLmxlbmd0aDtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbWF4OyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBwYXR0ZXJuID0gIHRoaXMucG9zc2libGVDZW50ZXJzW2ldO1xuXHRcdFx0XHRpZiAocGF0dGVybi5Db3VudCA+PSBDRU5URVJfUVVPUlVNKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uZmlybWVkQ291bnQrKztcblx0XHRcdFx0XHR0b3RhbE1vZHVsZVNpemUgKz0gcGF0dGVybi5Fc3RpbWF0ZWRNb2R1bGVTaXplO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoY29uZmlybWVkQ291bnQgPCAzKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHQvLyBPSywgd2UgaGF2ZSBhdCBsZWFzdCAzIGNvbmZpcm1lZCBjZW50ZXJzLCBidXQsIGl0J3MgcG9zc2libGUgdGhhdCBvbmUgaXMgYSBcImZhbHNlIHBvc2l0aXZlXCJcblx0XHRcdC8vIGFuZCB0aGF0IHdlIG5lZWQgdG8ga2VlcCBsb29raW5nLiBXZSBkZXRlY3QgdGhpcyBieSBhc2tpbmcgaWYgdGhlIGVzdGltYXRlZCBtb2R1bGUgc2l6ZXNcblx0XHRcdC8vIHZhcnkgdG9vIG11Y2guIFdlIGFyYml0cmFyaWx5IHNheSB0aGF0IHdoZW4gdGhlIHRvdGFsIGRldmlhdGlvbiBmcm9tIGF2ZXJhZ2UgZXhjZWVkc1xuXHRcdFx0Ly8gNSUgb2YgdGhlIHRvdGFsIG1vZHVsZSBzaXplIGVzdGltYXRlcywgaXQncyB0b28gbXVjaC5cblx0XHRcdHZhciBhdmVyYWdlID0gdG90YWxNb2R1bGVTaXplIC8gbWF4O1xuXHRcdFx0dmFyIHRvdGFsRGV2aWF0aW9uID0gMC4wO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXg7IGkrKylcblx0XHRcdHtcblx0XHRcdFx0cGF0dGVybiA9IHRoaXMucG9zc2libGVDZW50ZXJzW2ldO1xuXHRcdFx0XHR0b3RhbERldmlhdGlvbiArPSBNYXRoLmFicyhwYXR0ZXJuLkVzdGltYXRlZE1vZHVsZVNpemUgLSBhdmVyYWdlKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0b3RhbERldmlhdGlvbiA8PSAwLjA1ICogdG90YWxNb2R1bGVTaXplO1xuXHRcdH1cblxuXHR0aGlzLmZpbmRGaW5kZXJQYXR0ZXJuID0gZnVuY3Rpb24oaW1hZ2Upe1xuXHRcdHZhciB0cnlIYXJkZXIgPSBmYWxzZTtcblx0XHR0aGlzLmltYWdlPWltYWdlO1xuXHRcdHZhciBtYXhJID0gaW1hZ2UuaGVpZ2h0O1xuXHRcdHZhciBtYXhKID0gaW1hZ2Uud2lkdGg7XG5cdFx0dmFyIGlTa2lwID0gTWF0aC5mbG9vcigoMyAqIG1heEkpIC8gKDQgKiBNQVhfTU9EVUxFUykpO1xuXHRcdGlmIChpU2tpcCA8IE1JTl9TS0lQIHx8IHRyeUhhcmRlcilcblx0XHR7XG5cdFx0XHRcdGlTa2lwID0gTUlOX1NLSVA7XG5cdFx0fVxuXG5cdFx0dmFyIGRvbmUgPSBmYWxzZTtcblx0XHR2YXIgc3RhdGVDb3VudCA9IG5ldyBBcnJheSg1KTtcblx0XHRmb3IgKHZhciBpID0gaVNraXAgLSAxOyBpIDwgbWF4SSAmJiAhZG9uZTsgaSArPSBpU2tpcClcblx0XHR7XG5cdFx0XHQvLyBHZXQgYSByb3cgb2YgYmxhY2svd2hpdGUgdmFsdWVzXG5cdFx0XHRzdGF0ZUNvdW50WzBdID0gMDtcblx0XHRcdHN0YXRlQ291bnRbMV0gPSAwO1xuXHRcdFx0c3RhdGVDb3VudFsyXSA9IDA7XG5cdFx0XHRzdGF0ZUNvdW50WzNdID0gMDtcblx0XHRcdHN0YXRlQ291bnRbNF0gPSAwO1xuXHRcdFx0dmFyIGN1cnJlbnRTdGF0ZSA9IDA7XG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IG1heEo7IGorKylcblx0XHRcdHtcblx0XHRcdFx0aWYgKGltYWdlLmRhdGFbaitpKmltYWdlLndpZHRoXSApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBCbGFjayBwaXhlbFxuXHRcdFx0XHRcdGlmICgoY3VycmVudFN0YXRlICYgMSkgPT0gMSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyBDb3VudGluZyB3aGl0ZSBwaXhlbHNcblx0XHRcdFx0XHRcdGN1cnJlbnRTdGF0ZSsrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRzdGF0ZUNvdW50W2N1cnJlbnRTdGF0ZV0rKztcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBXaGl0ZSBwaXhlbFxuXHRcdFx0XHRcdGlmICgoY3VycmVudFN0YXRlICYgMSkgPT0gMClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyBDb3VudGluZyBibGFjayBwaXhlbHNcblx0XHRcdFx0XHRcdGlmIChjdXJyZW50U3RhdGUgPT0gNClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly8gQSB3aW5uZXI/XG5cdFx0XHRcdFx0XHRcdGlmICh0aGlzLmZvdW5kUGF0dGVybkNyb3NzKHN0YXRlQ291bnQpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gWWVzXG5cdFx0XHRcdFx0XHRcdFx0dmFyIGNvbmZpcm1lZCA9IHRoaXMuaGFuZGxlUG9zc2libGVDZW50ZXIoc3RhdGVDb3VudCwgaSwgaik7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKGNvbmZpcm1lZClcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBTdGFydCBleGFtaW5pbmcgZXZlcnkgb3RoZXIgbGluZS4gQ2hlY2tpbmcgZWFjaCBsaW5lIHR1cm5lZCBvdXQgdG8gYmUgdG9vXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBleHBlbnNpdmUgYW5kIGRpZG4ndCBpbXByb3ZlIHBlcmZvcm1hbmNlLlxuXHRcdFx0XHRcdFx0XHRcdFx0aVNraXAgPSAyO1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHRoaXMuaGFzU2tpcHBlZClcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZG9uZSA9IHRoaXMuaGF2ZU11bHRpcGx5Q29uZmlybWVkQ2VudGVycygpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR2YXIgcm93U2tpcCA9IHRoaXMuZmluZFJvd1NraXAoKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKHJvd1NraXAgPiBzdGF0ZUNvdW50WzJdKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gU2tpcCByb3dzIGJldHdlZW4gcm93IG9mIGxvd2VyIGNvbmZpcm1lZCBjZW50ZXJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBhbmQgdG9wIG9mIHByZXN1bWVkIHRoaXJkIGNvbmZpcm1lZCBjZW50ZXJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBidXQgYmFjayB1cCBhIGJpdCB0byBnZXQgYSBmdWxsIGNoYW5jZSBvZiBkZXRlY3Rpbmdcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBpdCwgZW50aXJlIHdpZHRoIG9mIGNlbnRlciBvZiBmaW5kZXIgcGF0dGVyblxuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gU2tpcCBieSByb3dTa2lwLCBidXQgYmFjayBvZmYgYnkgc3RhdGVDb3VudFsyXSAoc2l6ZSBvZiBsYXN0IGNlbnRlclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vIG9mIHBhdHRlcm4gd2Ugc2F3KSB0byBiZSBjb25zZXJ2YXRpdmUsIGFuZCBhbHNvIGJhY2sgb2ZmIGJ5IGlTa2lwIHdoaWNoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gaXMgYWJvdXQgdG8gYmUgcmUtYWRkZWRcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpICs9IHJvd1NraXAgLSBzdGF0ZUNvdW50WzJdIC0gaVNraXA7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aiA9IG1heEogLSAxO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBBZHZhbmNlIHRvIG5leHQgYmxhY2sgcGl4ZWxcblx0XHRcdFx0XHRcdFx0XHRcdGRvXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGorKztcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdHdoaWxlIChqIDwgbWF4SiAmJiAhaW1hZ2UuZGF0YVtqICsgaSppbWFnZS53aWR0aF0pO1xuXHRcdFx0XHRcdFx0XHRcdFx0ai0tOyAvLyBiYWNrIHVwIHRvIHRoYXQgbGFzdCB3aGl0ZSBwaXhlbFxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHQvLyBDbGVhciBzdGF0ZSB0byBzdGFydCBsb29raW5nIGFnYWluXG5cdFx0XHRcdFx0XHRcdFx0Y3VycmVudFN0YXRlID0gMDtcblx0XHRcdFx0XHRcdFx0XHRzdGF0ZUNvdW50WzBdID0gMDtcblx0XHRcdFx0XHRcdFx0XHRzdGF0ZUNvdW50WzFdID0gMDtcblx0XHRcdFx0XHRcdFx0XHRzdGF0ZUNvdW50WzJdID0gMDtcblx0XHRcdFx0XHRcdFx0XHRzdGF0ZUNvdW50WzNdID0gMDtcblx0XHRcdFx0XHRcdFx0XHRzdGF0ZUNvdW50WzRdID0gMDtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHQvLyBObywgc2hpZnQgY291bnRzIGJhY2sgYnkgdHdvXG5cdFx0XHRcdFx0XHRcdFx0c3RhdGVDb3VudFswXSA9IHN0YXRlQ291bnRbMl07XG5cdFx0XHRcdFx0XHRcdFx0c3RhdGVDb3VudFsxXSA9IHN0YXRlQ291bnRbM107XG5cdFx0XHRcdFx0XHRcdFx0c3RhdGVDb3VudFsyXSA9IHN0YXRlQ291bnRbNF07XG5cdFx0XHRcdFx0XHRcdFx0c3RhdGVDb3VudFszXSA9IDE7XG5cdFx0XHRcdFx0XHRcdFx0c3RhdGVDb3VudFs0XSA9IDA7XG5cdFx0XHRcdFx0XHRcdFx0Y3VycmVudFN0YXRlID0gMztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRzdGF0ZUNvdW50WysrY3VycmVudFN0YXRlXSsrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly8gQ291bnRpbmcgd2hpdGUgcGl4ZWxzXG5cdFx0XHRcdFx0XHRzdGF0ZUNvdW50W2N1cnJlbnRTdGF0ZV0rKztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLmZvdW5kUGF0dGVybkNyb3NzKHN0YXRlQ291bnQpKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgY29uZmlybWVkID0gdGhpcy5oYW5kbGVQb3NzaWJsZUNlbnRlcihzdGF0ZUNvdW50LCBpLCBtYXhKKTtcblx0XHRcdFx0aWYgKGNvbmZpcm1lZClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlTa2lwID0gc3RhdGVDb3VudFswXTtcblx0XHRcdFx0XHRpZiAodGhpcy5oYXNTa2lwcGVkKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIEZvdW5kIGEgdGhpcmQgb25lXG5cdFx0XHRcdFx0XHRkb25lID0gaGF2ZU11bHRpcGx5Q29uZmlybWVkQ2VudGVycygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHZhciBwYXR0ZXJuSW5mbyA9IHRoaXMuc2VsZWN0QmVzdFBhdHRlcm5zKCk7XG5cdFx0cXJjb2RlLm9yZGVyQmVzdFBhdHRlcm5zKHBhdHRlcm5JbmZvKTtcblxuXHRcdHJldHVybiBuZXcgRmluZGVyUGF0dGVybkluZm8ocGF0dGVybkluZm8pO1xuXHR9O1xufVxuXG4vKlxuICBQb3J0ZWQgdG8gSmF2YVNjcmlwdCBieSBMYXphciBMYXN6bG8gMjAxMVxuXG4gIGxhemFyc29mdEBnbWFpbC5jb20sIHd3dy5sYXphcnNvZnQuaW5mb1xuXG4qL1xuXG4vKlxuKlxuKiBDb3B5cmlnaHQgMjAwNyBaWGluZyBhdXRob3JzXG4qXG4qIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4qIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4qXG4qICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4qXG4qIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cblxuZnVuY3Rpb24gQWxpZ25tZW50UGF0dGVybihwb3NYLCBwb3NZLCAgZXN0aW1hdGVkTW9kdWxlU2l6ZSlcbntcblx0dGhpcy54PXBvc1g7XG5cdHRoaXMueT1wb3NZO1xuXHR0aGlzLmNvdW50ID0gMTtcblx0dGhpcy5lc3RpbWF0ZWRNb2R1bGVTaXplID0gZXN0aW1hdGVkTW9kdWxlU2l6ZTtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIkVzdGltYXRlZE1vZHVsZVNpemVcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiB0aGlzLmVzdGltYXRlZE1vZHVsZVNpemU7XG5cdH19KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJDb3VudFwiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuY291bnQ7XG5cdH19KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJYXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gTWF0aC5mbG9vcih0aGlzLngpO1xuXHR9fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiWVwiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIE1hdGguZmxvb3IodGhpcy55KTtcblx0fX0pO1xuXHR0aGlzLmluY3JlbWVudENvdW50ID0gZnVuY3Rpb24oKVxuXHR7XG5cdFx0dGhpcy5jb3VudCsrO1xuXHR9XG5cdHRoaXMuYWJvdXRFcXVhbHM9ZnVuY3Rpb24oIG1vZHVsZVNpemUsICBpLCAgailcblx0XHR7XG5cdFx0XHRpZiAoTWF0aC5hYnMoaSAtIHRoaXMueSkgPD0gbW9kdWxlU2l6ZSAmJiBNYXRoLmFicyhqIC0gdGhpcy54KSA8PSBtb2R1bGVTaXplKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgbW9kdWxlU2l6ZURpZmYgPSBNYXRoLmFicyhtb2R1bGVTaXplIC0gdGhpcy5lc3RpbWF0ZWRNb2R1bGVTaXplKTtcblx0XHRcdFx0cmV0dXJuIG1vZHVsZVNpemVEaWZmIDw9IDEuMCB8fCBtb2R1bGVTaXplRGlmZiAvIHRoaXMuZXN0aW1hdGVkTW9kdWxlU2l6ZSA8PSAxLjA7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG59XG5cbmZ1bmN0aW9uIEFsaWdubWVudFBhdHRlcm5GaW5kZXIoIGltYWdlLCAgc3RhcnRYLCAgc3RhcnRZLCAgd2lkdGgsICBoZWlnaHQsICBtb2R1bGVTaXplLCAgcmVzdWx0UG9pbnRDYWxsYmFjaylcbntcblx0dGhpcy5pbWFnZSA9IGltYWdlO1xuXHR0aGlzLnBvc3NpYmxlQ2VudGVycyA9IG5ldyBBcnJheSgpO1xuXHR0aGlzLnN0YXJ0WCA9IHN0YXJ0WDtcblx0dGhpcy5zdGFydFkgPSBzdGFydFk7XG5cdHRoaXMud2lkdGggPSB3aWR0aDtcblx0dGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG5cdHRoaXMubW9kdWxlU2l6ZSA9IG1vZHVsZVNpemU7XG5cdHRoaXMuY3Jvc3NDaGVja1N0YXRlQ291bnQgPSBuZXcgQXJyYXkoMCwwLDApO1xuXHR0aGlzLnJlc3VsdFBvaW50Q2FsbGJhY2sgPSByZXN1bHRQb2ludENhbGxiYWNrO1xuXG5cdHRoaXMuY2VudGVyRnJvbUVuZD1mdW5jdGlvbihzdGF0ZUNvdW50LCAgZW5kKVxuXHRcdHtcblx0XHRcdHJldHVybiAgKGVuZCAtIHN0YXRlQ291bnRbMl0pIC0gc3RhdGVDb3VudFsxXSAvIDIuMDtcblx0XHR9XG5cdHRoaXMuZm91bmRQYXR0ZXJuQ3Jvc3MgPSBmdW5jdGlvbihzdGF0ZUNvdW50KVxuXHRcdHtcblx0XHRcdHZhciBtb2R1bGVTaXplID0gdGhpcy5tb2R1bGVTaXplO1xuXHRcdFx0dmFyIG1heFZhcmlhbmNlID0gbW9kdWxlU2l6ZSAvIDIuMDtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoTWF0aC5hYnMobW9kdWxlU2l6ZSAtIHN0YXRlQ291bnRbaV0pID49IG1heFZhcmlhbmNlKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0dGhpcy5jcm9zc0NoZWNrVmVydGljYWw9ZnVuY3Rpb24oIHN0YXJ0SSwgIGNlbnRlckosICBtYXhDb3VudCwgIG9yaWdpbmFsU3RhdGVDb3VudFRvdGFsKVxuXHRcdHtcblx0XHRcdHZhciBpbWFnZSA9IHRoaXMuaW1hZ2U7XG5cblx0XHRcdHZhciBtYXhJID0gaW1hZ2UuaGVpZ2h0O1xuXHRcdFx0dmFyIHN0YXRlQ291bnQgPSB0aGlzLmNyb3NzQ2hlY2tTdGF0ZUNvdW50O1xuXHRcdFx0c3RhdGVDb3VudFswXSA9IDA7XG5cdFx0XHRzdGF0ZUNvdW50WzFdID0gMDtcblx0XHRcdHN0YXRlQ291bnRbMl0gPSAwO1xuXG5cdFx0XHQvLyBTdGFydCBjb3VudGluZyB1cCBmcm9tIGNlbnRlclxuXHRcdFx0dmFyIGkgPSBzdGFydEk7XG5cdFx0XHR3aGlsZSAoaSA+PSAwICYmIGltYWdlLmRhdGFbY2VudGVySiArIGkqaW1hZ2Uud2lkdGhdICYmIHN0YXRlQ291bnRbMV0gPD0gbWF4Q291bnQpXG5cdFx0XHR7XG5cdFx0XHRcdHN0YXRlQ291bnRbMV0rKztcblx0XHRcdFx0aS0tO1xuXHRcdFx0fVxuXHRcdFx0Ly8gSWYgYWxyZWFkeSB0b28gbWFueSBtb2R1bGVzIGluIHRoaXMgc3RhdGUgb3IgcmFuIG9mZiB0aGUgZWRnZTpcblx0XHRcdGlmIChpIDwgMCB8fCBzdGF0ZUNvdW50WzFdID4gbWF4Q291bnQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBOYU47XG5cdFx0XHR9XG5cdFx0XHR3aGlsZSAoaSA+PSAwICYmICFpbWFnZS5kYXRhW2NlbnRlckogKyBpKmltYWdlLndpZHRoXSAmJiBzdGF0ZUNvdW50WzBdIDw9IG1heENvdW50KVxuXHRcdFx0e1xuXHRcdFx0XHRzdGF0ZUNvdW50WzBdKys7XG5cdFx0XHRcdGktLTtcblx0XHRcdH1cblx0XHRcdGlmIChzdGF0ZUNvdW50WzBdID4gbWF4Q291bnQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBOYU47XG5cdFx0XHR9XG5cblx0XHRcdC8vIE5vdyBhbHNvIGNvdW50IGRvd24gZnJvbSBjZW50ZXJcblx0XHRcdGkgPSBzdGFydEkgKyAxO1xuXHRcdFx0d2hpbGUgKGkgPCBtYXhJICYmIGltYWdlLmRhdGFbY2VudGVySiArIGkqaW1hZ2Uud2lkdGhdICYmIHN0YXRlQ291bnRbMV0gPD0gbWF4Q291bnQpXG5cdFx0XHR7XG5cdFx0XHRcdHN0YXRlQ291bnRbMV0rKztcblx0XHRcdFx0aSsrO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGkgPT0gbWF4SSB8fCBzdGF0ZUNvdW50WzFdID4gbWF4Q291bnQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBOYU47XG5cdFx0XHR9XG5cdFx0XHR3aGlsZSAoaSA8IG1heEkgJiYgIWltYWdlLmRhdGFbY2VudGVySiArIGkqaW1hZ2Uud2lkdGhdICYmIHN0YXRlQ291bnRbMl0gPD0gbWF4Q291bnQpXG5cdFx0XHR7XG5cdFx0XHRcdHN0YXRlQ291bnRbMl0rKztcblx0XHRcdFx0aSsrO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHN0YXRlQ291bnRbMl0gPiBtYXhDb3VudClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIE5hTjtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHN0YXRlQ291bnRUb3RhbCA9IHN0YXRlQ291bnRbMF0gKyBzdGF0ZUNvdW50WzFdICsgc3RhdGVDb3VudFsyXTtcblx0XHRcdGlmICg1ICogTWF0aC5hYnMoc3RhdGVDb3VudFRvdGFsIC0gb3JpZ2luYWxTdGF0ZUNvdW50VG90YWwpID49IDIgKiBvcmlnaW5hbFN0YXRlQ291bnRUb3RhbClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIE5hTjtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRoaXMuZm91bmRQYXR0ZXJuQ3Jvc3Moc3RhdGVDb3VudCk/dGhpcy5jZW50ZXJGcm9tRW5kKHN0YXRlQ291bnQsIGkpOk5hTjtcblx0XHR9XG5cblx0dGhpcy5oYW5kbGVQb3NzaWJsZUNlbnRlcj1mdW5jdGlvbiggc3RhdGVDb3VudCwgIGksICBqKVxuXHRcdHtcblx0XHRcdHZhciBzdGF0ZUNvdW50VG90YWwgPSBzdGF0ZUNvdW50WzBdICsgc3RhdGVDb3VudFsxXSArIHN0YXRlQ291bnRbMl07XG5cdFx0XHR2YXIgY2VudGVySiA9IHRoaXMuY2VudGVyRnJvbUVuZChzdGF0ZUNvdW50LCBqKTtcblx0XHRcdHZhciBjZW50ZXJJID0gdGhpcy5jcm9zc0NoZWNrVmVydGljYWwoaSwgTWF0aC5mbG9vciAoY2VudGVySiksIDIgKiBzdGF0ZUNvdW50WzFdLCBzdGF0ZUNvdW50VG90YWwpO1xuXHRcdFx0aWYgKCFpc05hTihjZW50ZXJJKSlcblx0XHRcdHtcblx0XHRcdFx0dmFyIGVzdGltYXRlZE1vZHVsZVNpemUgPSAoc3RhdGVDb3VudFswXSArIHN0YXRlQ291bnRbMV0gKyBzdGF0ZUNvdW50WzJdKSAvIDMuMDtcblx0XHRcdFx0dmFyIG1heCA9IHRoaXMucG9zc2libGVDZW50ZXJzLmxlbmd0aDtcblx0XHRcdFx0Zm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IG1heDsgaW5kZXgrKylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZhciBjZW50ZXIgPSAgdGhpcy5wb3NzaWJsZUNlbnRlcnNbaW5kZXhdO1xuXHRcdFx0XHRcdC8vIExvb2sgZm9yIGFib3V0IHRoZSBzYW1lIGNlbnRlciBhbmQgbW9kdWxlIHNpemU6XG5cdFx0XHRcdFx0aWYgKGNlbnRlci5hYm91dEVxdWFscyhlc3RpbWF0ZWRNb2R1bGVTaXplLCBjZW50ZXJJLCBjZW50ZXJKKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXR1cm4gbmV3IEFsaWdubWVudFBhdHRlcm4oY2VudGVySiwgY2VudGVySSwgZXN0aW1hdGVkTW9kdWxlU2l6ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIEhhZG4ndCBmb3VuZCB0aGlzIGJlZm9yZTsgc2F2ZSBpdFxuXHRcdFx0XHR2YXIgcG9pbnQgPSBuZXcgQWxpZ25tZW50UGF0dGVybihjZW50ZXJKLCBjZW50ZXJJLCBlc3RpbWF0ZWRNb2R1bGVTaXplKTtcblx0XHRcdFx0dGhpcy5wb3NzaWJsZUNlbnRlcnMucHVzaChwb2ludCk7XG5cdFx0XHRcdGlmICh0aGlzLnJlc3VsdFBvaW50Q2FsbGJhY2sgIT0gbnVsbClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRoaXMucmVzdWx0UG9pbnRDYWxsYmFjay5mb3VuZFBvc3NpYmxlUmVzdWx0UG9pbnQocG9pbnQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0dGhpcy5maW5kID0gZnVuY3Rpb24oKVxuXHR7XG5cdFx0XHR2YXIgc3RhcnRYID0gdGhpcy5zdGFydFg7XG5cdFx0XHR2YXIgaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG5cdFx0XHR2YXIgbWF4SiA9IHN0YXJ0WCArIHdpZHRoO1xuXHRcdFx0dmFyIG1pZGRsZUkgPSBzdGFydFkgKyAoaGVpZ2h0ID4+IDEpO1xuXHRcdFx0Ly8gV2UgYXJlIGxvb2tpbmcgZm9yIGJsYWNrL3doaXRlL2JsYWNrIG1vZHVsZXMgaW4gMToxOjEgcmF0aW87XG5cdFx0XHQvLyB0aGlzIHRyYWNrcyB0aGUgbnVtYmVyIG9mIGJsYWNrL3doaXRlL2JsYWNrIG1vZHVsZXMgc2VlbiBzbyBmYXJcblx0XHRcdHZhciBzdGF0ZUNvdW50ID0gbmV3IEFycmF5KDAsMCwwKTtcblx0XHRcdGZvciAodmFyIGlHZW4gPSAwOyBpR2VuIDwgaGVpZ2h0OyBpR2VuKyspXG5cdFx0XHR7XG5cdFx0XHRcdC8vIFNlYXJjaCBmcm9tIG1pZGRsZSBvdXR3YXJkc1xuXHRcdFx0XHR2YXIgaSA9IG1pZGRsZUkgKyAoKGlHZW4gJiAweDAxKSA9PSAwPygoaUdlbiArIDEpID4+IDEpOi0gKChpR2VuICsgMSkgPj4gMSkpO1xuXHRcdFx0XHRzdGF0ZUNvdW50WzBdID0gMDtcblx0XHRcdFx0c3RhdGVDb3VudFsxXSA9IDA7XG5cdFx0XHRcdHN0YXRlQ291bnRbMl0gPSAwO1xuXHRcdFx0XHR2YXIgaiA9IHN0YXJ0WDtcblx0XHRcdFx0Ly8gQnVybiBvZmYgbGVhZGluZyB3aGl0ZSBwaXhlbHMgYmVmb3JlIGFueXRoaW5nIGVsc2U7IGlmIHdlIHN0YXJ0IGluIHRoZSBtaWRkbGUgb2Zcblx0XHRcdFx0Ly8gYSB3aGl0ZSBydW4sIGl0IGRvZXNuJ3QgbWFrZSBzZW5zZSB0byBjb3VudCBpdHMgbGVuZ3RoLCBzaW5jZSB3ZSBkb24ndCBrbm93IGlmIHRoZVxuXHRcdFx0XHQvLyB3aGl0ZSBydW4gY29udGludWVkIHRvIHRoZSBsZWZ0IG9mIHRoZSBzdGFydCBwb2ludFxuXHRcdFx0XHR3aGlsZSAoaiA8IG1heEogJiYgIWltYWdlLmRhdGFbaiArIGltYWdlLndpZHRoKiBpXSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGorKztcblx0XHRcdFx0fVxuXHRcdFx0XHR2YXIgY3VycmVudFN0YXRlID0gMDtcblx0XHRcdFx0d2hpbGUgKGogPCBtYXhKKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKGltYWdlLmRhdGFbaiArIGkqaW1hZ2Uud2lkdGhdKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIEJsYWNrIHBpeGVsXG5cdFx0XHRcdFx0XHRpZiAoY3VycmVudFN0YXRlID09IDEpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdC8vIENvdW50aW5nIGJsYWNrIHBpeGVsc1xuXHRcdFx0XHRcdFx0XHRzdGF0ZUNvdW50W2N1cnJlbnRTdGF0ZV0rKztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly8gQ291bnRpbmcgd2hpdGUgcGl4ZWxzXG5cdFx0XHRcdFx0XHRcdGlmIChjdXJyZW50U3RhdGUgPT0gMilcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdC8vIEEgd2lubmVyP1xuXHRcdFx0XHRcdFx0XHRcdGlmICh0aGlzLmZvdW5kUGF0dGVybkNyb3NzKHN0YXRlQ291bnQpKVxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIFllc1xuXHRcdFx0XHRcdFx0XHRcdFx0dmFyIGNvbmZpcm1lZCA9IHRoaXMuaGFuZGxlUG9zc2libGVDZW50ZXIoc3RhdGVDb3VudCwgaSwgaik7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoY29uZmlybWVkICE9IG51bGwpXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBjb25maXJtZWQ7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdHN0YXRlQ291bnRbMF0gPSBzdGF0ZUNvdW50WzJdO1xuXHRcdFx0XHRcdFx0XHRcdHN0YXRlQ291bnRbMV0gPSAxO1xuXHRcdFx0XHRcdFx0XHRcdHN0YXRlQ291bnRbMl0gPSAwO1xuXHRcdFx0XHRcdFx0XHRcdGN1cnJlbnRTdGF0ZSA9IDE7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0c3RhdGVDb3VudFsrK2N1cnJlbnRTdGF0ZV0rKztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly8gV2hpdGUgcGl4ZWxcblx0XHRcdFx0XHRcdGlmIChjdXJyZW50U3RhdGUgPT0gMSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly8gQ291bnRpbmcgYmxhY2sgcGl4ZWxzXG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRTdGF0ZSsrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0c3RhdGVDb3VudFtjdXJyZW50U3RhdGVdKys7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGorKztcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAodGhpcy5mb3VuZFBhdHRlcm5Dcm9zcyhzdGF0ZUNvdW50KSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZhciBjb25maXJtZWQgPSB0aGlzLmhhbmRsZVBvc3NpYmxlQ2VudGVyKHN0YXRlQ291bnQsIGksIG1heEopO1xuXHRcdFx0XHRcdGlmIChjb25maXJtZWQgIT0gbnVsbClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXR1cm4gY29uZmlybWVkO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBIbW0sIG5vdGhpbmcgd2Ugc2F3IHdhcyBvYnNlcnZlZCBhbmQgY29uZmlybWVkIHR3aWNlLiBJZiB3ZSBoYWRcblx0XHRcdC8vIGFueSBndWVzcyBhdCBhbGwsIHJldHVybiBpdC5cblx0XHRcdGlmICghKHRoaXMucG9zc2libGVDZW50ZXJzLmxlbmd0aCA9PSAwKSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuICB0aGlzLnBvc3NpYmxlQ2VudGVyc1swXTtcblx0XHRcdH1cblxuXHRcdFx0dGhyb3cgXCJDb3VsZG4ndCBmaW5kIGVub3VnaCBhbGlnbm1lbnQgcGF0dGVybnNcIjtcblx0XHR9XG5cbn1cblxuLypcbiAgUG9ydGVkIHRvIEphdmFTY3JpcHQgYnkgTGF6YXIgTGFzemxvIDIwMTFcblxuICBsYXphcnNvZnRAZ21haWwuY29tLCB3d3cubGF6YXJzb2Z0LmluZm9cblxuKi9cblxuLypcbipcbiogQ29weXJpZ2h0IDIwMDcgWlhpbmcgYXV0aG9yc1xuKlxuKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4qIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuKlxuKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuKlxuKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4qIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4qIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5cbmZ1bmN0aW9uIFFSQ29kZURhdGFCbG9ja1JlYWRlcihibG9ja3MsICB2ZXJzaW9uLCAgbnVtRXJyb3JDb3JyZWN0aW9uQ29kZSlcbntcblx0dGhpcy5ibG9ja1BvaW50ZXIgPSAwO1xuXHR0aGlzLmJpdFBvaW50ZXIgPSA3O1xuXHR0aGlzLmRhdGFMZW5ndGggPSAwO1xuXHR0aGlzLmJsb2NrcyA9IGJsb2Nrcztcblx0dGhpcy5udW1FcnJvckNvcnJlY3Rpb25Db2RlID0gbnVtRXJyb3JDb3JyZWN0aW9uQ29kZTtcblx0aWYgKHZlcnNpb24gPD0gOSlcblx0XHR0aGlzLmRhdGFMZW5ndGhNb2RlID0gMDtcblx0ZWxzZSBpZiAodmVyc2lvbiA+PSAxMCAmJiB2ZXJzaW9uIDw9IDI2KVxuXHRcdHRoaXMuZGF0YUxlbmd0aE1vZGUgPSAxO1xuXHRlbHNlIGlmICh2ZXJzaW9uID49IDI3ICYmIHZlcnNpb24gPD0gNDApXG5cdFx0dGhpcy5kYXRhTGVuZ3RoTW9kZSA9IDI7XG5cblx0dGhpcy5nZXROZXh0Qml0cyA9IGZ1bmN0aW9uKCBudW1CaXRzKVxuXHRcdHtcblx0XHRcdHZhciBiaXRzID0gMDtcblx0XHRcdGlmIChudW1CaXRzIDwgdGhpcy5iaXRQb2ludGVyICsgMSlcblx0XHRcdHtcblx0XHRcdFx0Ly8gbmV4dCB3b3JkIGZpdHMgaW50byBjdXJyZW50IGRhdGEgYmxvY2tcblx0XHRcdFx0dmFyIG1hc2sgPSAwO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG51bUJpdHM7IGkrKylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG1hc2sgKz0gKDEgPDwgaSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0bWFzayA8PD0gKHRoaXMuYml0UG9pbnRlciAtIG51bUJpdHMgKyAxKTtcblxuXHRcdFx0XHRiaXRzID0gKHRoaXMuYmxvY2tzW3RoaXMuYmxvY2tQb2ludGVyXSAmIG1hc2spID4+ICh0aGlzLmJpdFBvaW50ZXIgLSBudW1CaXRzICsgMSk7XG5cdFx0XHRcdHRoaXMuYml0UG9pbnRlciAtPSBudW1CaXRzO1xuXHRcdFx0XHRyZXR1cm4gYml0cztcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKG51bUJpdHMgPCB0aGlzLmJpdFBvaW50ZXIgKyAxICsgOClcblx0XHRcdHtcblx0XHRcdFx0Ly8gbmV4dCB3b3JkIGNyb3NzZXMgMiBkYXRhIGJsb2Nrc1xuXHRcdFx0XHR2YXIgbWFzazEgPSAwO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYml0UG9pbnRlciArIDE7IGkrKylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG1hc2sxICs9ICgxIDw8IGkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJpdHMgPSAodGhpcy5ibG9ja3NbdGhpcy5ibG9ja1BvaW50ZXJdICYgbWFzazEpIDw8IChudW1CaXRzIC0gKHRoaXMuYml0UG9pbnRlciArIDEpKTtcbiAgICAgICAgICAgICAgICB0aGlzLmJsb2NrUG9pbnRlcisrO1xuXHRcdFx0XHRiaXRzICs9ICgodGhpcy5ibG9ja3NbdGhpcy5ibG9ja1BvaW50ZXJdKSA+PiAoOCAtIChudW1CaXRzIC0gKHRoaXMuYml0UG9pbnRlciArIDEpKSkpO1xuXG5cdFx0XHRcdHRoaXMuYml0UG9pbnRlciA9IHRoaXMuYml0UG9pbnRlciAtIG51bUJpdHMgJSA4O1xuXHRcdFx0XHRpZiAodGhpcy5iaXRQb2ludGVyIDwgMClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRoaXMuYml0UG9pbnRlciA9IDggKyB0aGlzLmJpdFBvaW50ZXI7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGJpdHM7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChudW1CaXRzIDwgdGhpcy5iaXRQb2ludGVyICsgMSArIDE2KVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBuZXh0IHdvcmQgY3Jvc3NlcyAzIGRhdGEgYmxvY2tzXG5cdFx0XHRcdHZhciBtYXNrMSA9IDA7IC8vIG1hc2sgb2YgZmlyc3QgYmxvY2tcblx0XHRcdFx0dmFyIG1hc2szID0gMDsgLy8gbWFzayBvZiAzcmQgYmxvY2tcblx0XHRcdFx0Ly9iaXRQb2ludGVyICsgMSA6IG51bWJlciBvZiBiaXRzIG9mIHRoZSAxc3QgYmxvY2tcblx0XHRcdFx0Ly84IDogbnVtYmVyIG9mIHRoZSAybmQgYmxvY2sgKG5vdGUgdGhhdCB1c2UgYWxyZWFkeSA4Yml0cyBiZWNhdXNlIG5leHQgd29yZCB1c2VzIDMgZGF0YSBibG9ja3MpXG5cdFx0XHRcdC8vbnVtQml0cyAtIChiaXRQb2ludGVyICsgMSArIDgpIDogbnVtYmVyIG9mIGJpdHMgb2YgdGhlIDNyZCBibG9ja1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYml0UG9pbnRlciArIDE7IGkrKylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG1hc2sxICs9ICgxIDw8IGkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZhciBiaXRzRmlyc3RCbG9jayA9ICh0aGlzLmJsb2Nrc1t0aGlzLmJsb2NrUG9pbnRlcl0gJiBtYXNrMSkgPDwgKG51bUJpdHMgLSAodGhpcy5iaXRQb2ludGVyICsgMSkpO1xuXHRcdFx0XHR0aGlzLmJsb2NrUG9pbnRlcisrO1xuXG5cdFx0XHRcdHZhciBiaXRzU2Vjb25kQmxvY2sgPSB0aGlzLmJsb2Nrc1t0aGlzLmJsb2NrUG9pbnRlcl0gPDwgKG51bUJpdHMgLSAodGhpcy5iaXRQb2ludGVyICsgMSArIDgpKTtcblx0XHRcdFx0dGhpcy5ibG9ja1BvaW50ZXIrKztcblxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG51bUJpdHMgLSAodGhpcy5iaXRQb2ludGVyICsgMSArIDgpOyBpKyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRtYXNrMyArPSAoMSA8PCBpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRtYXNrMyA8PD0gOCAtIChudW1CaXRzIC0gKHRoaXMuYml0UG9pbnRlciArIDEgKyA4KSk7XG5cdFx0XHRcdHZhciBiaXRzVGhpcmRCbG9jayA9ICh0aGlzLmJsb2Nrc1t0aGlzLmJsb2NrUG9pbnRlcl0gJiBtYXNrMykgPj4gKDggLSAobnVtQml0cyAtICh0aGlzLmJpdFBvaW50ZXIgKyAxICsgOCkpKTtcblxuXHRcdFx0XHRiaXRzID0gYml0c0ZpcnN0QmxvY2sgKyBiaXRzU2Vjb25kQmxvY2sgKyBiaXRzVGhpcmRCbG9jaztcblx0XHRcdFx0dGhpcy5iaXRQb2ludGVyID0gdGhpcy5iaXRQb2ludGVyIC0gKG51bUJpdHMgLSA4KSAlIDg7XG5cdFx0XHRcdGlmICh0aGlzLmJpdFBvaW50ZXIgPCAwKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dGhpcy5iaXRQb2ludGVyID0gOCArIHRoaXMuYml0UG9pbnRlcjtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gYml0cztcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIDA7XG5cdFx0XHR9XG5cdFx0fVxuXHR0aGlzLk5leHRNb2RlPWZ1bmN0aW9uKClcblx0e1xuXHRcdGlmICgodGhpcy5ibG9ja1BvaW50ZXIgPiB0aGlzLmJsb2Nrcy5sZW5ndGggLSB0aGlzLm51bUVycm9yQ29ycmVjdGlvbkNvZGUgLSAyKSlcblx0XHRcdHJldHVybiAwO1xuXHRcdGVsc2Vcblx0XHRcdHJldHVybiB0aGlzLmdldE5leHRCaXRzKDQpO1xuXHR9XG5cdHRoaXMuZ2V0RGF0YUxlbmd0aD1mdW5jdGlvbiggbW9kZUluZGljYXRvcilcblx0XHR7XG5cdFx0XHR2YXIgaW5kZXggPSAwO1xuXHRcdFx0d2hpbGUgKHRydWUpXG5cdFx0XHR7XG5cdFx0XHRcdGlmICgobW9kZUluZGljYXRvciA+PiBpbmRleCkgPT0gMSlcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0aW5kZXgrKztcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0TmV4dEJpdHMocXJjb2RlLnNpemVPZkRhdGFMZW5ndGhJbmZvW3RoaXMuZGF0YUxlbmd0aE1vZGVdW2luZGV4XSk7XG5cdFx0fVxuXHR0aGlzLmdldFJvbWFuQW5kRmlndXJlU3RyaW5nPWZ1bmN0aW9uKCBkYXRhTGVuZ3RoKVxuXHRcdHtcblx0XHRcdHZhciBsZW5ndGggPSBkYXRhTGVuZ3RoO1xuXHRcdFx0dmFyIGludERhdGEgPSAwO1xuXHRcdFx0dmFyIHN0ckRhdGEgPSBcIlwiO1xuXHRcdFx0dmFyIHRhYmxlUm9tYW5BbmRGaWd1cmUgPSBuZXcgQXJyYXkoJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknLCAnQScsICdCJywgJ0MnLCAnRCcsICdFJywgJ0YnLCAnRycsICdIJywgJ0knLCAnSicsICdLJywgJ0wnLCAnTScsICdOJywgJ08nLCAnUCcsICdRJywgJ1InLCAnUycsICdUJywgJ1UnLCAnVicsICdXJywgJ1gnLCAnWScsICdaJywgJyAnLCAnJCcsICclJywgJyonLCAnKycsICctJywgJy4nLCAnLycsICc6Jyk7XG5cdFx0XHRkb1xuXHRcdFx0e1xuXHRcdFx0XHRpZiAobGVuZ3RoID4gMSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGludERhdGEgPSB0aGlzLmdldE5leHRCaXRzKDExKTtcblx0XHRcdFx0XHR2YXIgZmlyc3RMZXR0ZXIgPSBNYXRoLmZsb29yKGludERhdGEgLyA0NSk7XG5cdFx0XHRcdFx0dmFyIHNlY29uZExldHRlciA9IGludERhdGEgJSA0NTtcblx0XHRcdFx0XHRzdHJEYXRhICs9IHRhYmxlUm9tYW5BbmRGaWd1cmVbZmlyc3RMZXR0ZXJdO1xuXHRcdFx0XHRcdHN0ckRhdGEgKz0gdGFibGVSb21hbkFuZEZpZ3VyZVtzZWNvbmRMZXR0ZXJdO1xuXHRcdFx0XHRcdGxlbmd0aCAtPSAyO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKGxlbmd0aCA9PSAxKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aW50RGF0YSA9IHRoaXMuZ2V0TmV4dEJpdHMoNik7XG5cdFx0XHRcdFx0c3RyRGF0YSArPSB0YWJsZVJvbWFuQW5kRmlndXJlW2ludERhdGFdO1xuXHRcdFx0XHRcdGxlbmd0aCAtPSAxO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR3aGlsZSAobGVuZ3RoID4gMCk7XG5cblx0XHRcdHJldHVybiBzdHJEYXRhO1xuXHRcdH1cblx0dGhpcy5nZXRGaWd1cmVTdHJpbmc9ZnVuY3Rpb24oIGRhdGFMZW5ndGgpXG5cdFx0e1xuXHRcdFx0dmFyIGxlbmd0aCA9IGRhdGFMZW5ndGg7XG5cdFx0XHR2YXIgaW50RGF0YSA9IDA7XG5cdFx0XHR2YXIgc3RyRGF0YSA9IFwiXCI7XG5cdFx0XHRkb1xuXHRcdFx0e1xuXHRcdFx0XHRpZiAobGVuZ3RoID49IDMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpbnREYXRhID0gdGhpcy5nZXROZXh0Qml0cygxMCk7XG5cdFx0XHRcdFx0aWYgKGludERhdGEgPCAxMDApXG5cdFx0XHRcdFx0XHRzdHJEYXRhICs9IFwiMFwiO1xuXHRcdFx0XHRcdGlmIChpbnREYXRhIDwgMTApXG5cdFx0XHRcdFx0XHRzdHJEYXRhICs9IFwiMFwiO1xuXHRcdFx0XHRcdGxlbmd0aCAtPSAzO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKGxlbmd0aCA9PSAyKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aW50RGF0YSA9IHRoaXMuZ2V0TmV4dEJpdHMoNyk7XG5cdFx0XHRcdFx0aWYgKGludERhdGEgPCAxMClcblx0XHRcdFx0XHRcdHN0ckRhdGEgKz0gXCIwXCI7XG5cdFx0XHRcdFx0bGVuZ3RoIC09IDI7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiAobGVuZ3RoID09IDEpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpbnREYXRhID0gdGhpcy5nZXROZXh0Qml0cyg0KTtcblx0XHRcdFx0XHRsZW5ndGggLT0gMTtcblx0XHRcdFx0fVxuXHRcdFx0XHRzdHJEYXRhICs9IGludERhdGE7XG5cdFx0XHR9XG5cdFx0XHR3aGlsZSAobGVuZ3RoID4gMCk7XG5cblx0XHRcdHJldHVybiBzdHJEYXRhO1xuXHRcdH1cblx0dGhpcy5nZXQ4Yml0Qnl0ZUFycmF5PWZ1bmN0aW9uKCBkYXRhTGVuZ3RoKVxuXHRcdHtcblx0XHRcdHZhciBsZW5ndGggPSBkYXRhTGVuZ3RoO1xuXHRcdFx0dmFyIGludERhdGEgPSAwO1xuXHRcdFx0dmFyIG91dHB1dCA9IG5ldyBBcnJheSgpO1xuXG5cdFx0XHRkb1xuXHRcdFx0e1xuXHRcdFx0XHRpbnREYXRhID0gdGhpcy5nZXROZXh0Qml0cyg4KTtcblx0XHRcdFx0b3V0cHV0LnB1c2goIGludERhdGEpO1xuXHRcdFx0XHRsZW5ndGgtLTtcblx0XHRcdH1cblx0XHRcdHdoaWxlIChsZW5ndGggPiAwKTtcblx0XHRcdHJldHVybiBvdXRwdXQ7XG5cdFx0fVxuICAgIHRoaXMuZ2V0S2FuamlTdHJpbmc9ZnVuY3Rpb24oIGRhdGFMZW5ndGgpXG5cdFx0e1xuXHRcdFx0dmFyIGxlbmd0aCA9IGRhdGFMZW5ndGg7XG5cdFx0XHR2YXIgaW50RGF0YSA9IDA7XG5cdFx0XHR2YXIgdW5pY29kZVN0cmluZyA9IFwiXCI7XG5cdFx0XHRkb1xuXHRcdFx0e1xuXHRcdFx0XHRpbnREYXRhID0gZ2V0TmV4dEJpdHMoMTMpO1xuXHRcdFx0XHR2YXIgbG93ZXJCeXRlID0gaW50RGF0YSAlIDB4QzA7XG5cdFx0XHRcdHZhciBoaWdoZXJCeXRlID0gaW50RGF0YSAvIDB4QzA7XG5cblx0XHRcdFx0dmFyIHRlbXBXb3JkID0gKGhpZ2hlckJ5dGUgPDwgOCkgKyBsb3dlckJ5dGU7XG5cdFx0XHRcdHZhciBzaGlmdGppc1dvcmQgPSAwO1xuXHRcdFx0XHRpZiAodGVtcFdvcmQgKyAweDgxNDAgPD0gMHg5RkZDKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gYmV0d2VlbiA4MTQwIC0gOUZGQyBvbiBTaGlmdF9KSVMgY2hhcmFjdGVyIHNldFxuXHRcdFx0XHRcdHNoaWZ0amlzV29yZCA9IHRlbXBXb3JkICsgMHg4MTQwO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIGJldHdlZW4gRTA0MCAtIEVCQkYgb24gU2hpZnRfSklTIGNoYXJhY3RlciBzZXRcblx0XHRcdFx0XHRzaGlmdGppc1dvcmQgPSB0ZW1wV29yZCArIDB4QzE0MDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vdmFyIHRlbXBCeXRlID0gbmV3IEFycmF5KDAsMCk7XG5cdFx0XHRcdC8vdGVtcEJ5dGVbMF0gPSAoc2J5dGUpIChzaGlmdGppc1dvcmQgPj4gOCk7XG5cdFx0XHRcdC8vdGVtcEJ5dGVbMV0gPSAoc2J5dGUpIChzaGlmdGppc1dvcmQgJiAweEZGKTtcblx0XHRcdFx0Ly91bmljb2RlU3RyaW5nICs9IG5ldyBTdHJpbmcoU3lzdGVtVXRpbHMuVG9DaGFyQXJyYXkoU3lzdGVtVXRpbHMuVG9CeXRlQXJyYXkodGVtcEJ5dGUpKSk7XG4gICAgICAgICAgICAgICAgdW5pY29kZVN0cmluZyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHNoaWZ0amlzV29yZCk7XG5cdFx0XHRcdGxlbmd0aC0tO1xuXHRcdFx0fVxuXHRcdFx0d2hpbGUgKGxlbmd0aCA+IDApO1xuXG5cblx0XHRcdHJldHVybiB1bmljb2RlU3RyaW5nO1xuXHRcdH1cblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIkRhdGFCeXRlXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHR2YXIgb3V0cHV0ID0gbmV3IEFycmF5KCk7XG5cdFx0dmFyIE1PREVfTlVNQkVSID0gMTtcblx0ICAgIHZhciBNT0RFX1JPTUFOX0FORF9OVU1CRVIgPSAyO1xuXHQgICAgdmFyIE1PREVfOEJJVF9CWVRFID0gNDtcblx0ICAgIHZhciBNT0RFX0tBTkpJID0gODtcblx0XHRkb1xuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHZhciBtb2RlID0gdGhpcy5OZXh0TW9kZSgpO1xuXHRcdFx0XHRcdFx0Ly9jYW52YXMucHJpbnRsbihcIm1vZGU6IFwiICsgbW9kZSk7XG5cdFx0XHRcdFx0XHRpZiAobW9kZSA9PSAwKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAob3V0cHV0Lmxlbmd0aCA+IDApXG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0XHR0aHJvdyBcIkVtcHR5IGRhdGEgYmxvY2tcIjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdC8vaWYgKG1vZGUgIT0gMSAmJiBtb2RlICE9IDIgJiYgbW9kZSAhPSA0ICYmIG1vZGUgIT0gOClcblx0XHRcdFx0XHRcdC8vXHRicmVhaztcblx0XHRcdFx0XHRcdC8vfVxuXHRcdFx0XHRcdFx0aWYgKG1vZGUgIT0gTU9ERV9OVU1CRVIgJiYgbW9kZSAhPSBNT0RFX1JPTUFOX0FORF9OVU1CRVIgJiYgbW9kZSAhPSBNT0RFXzhCSVRfQllURSAmJiBtb2RlICE9IE1PREVfS0FOSkkpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdC8qXHRcdFx0XHRcdGNhbnZhcy5wcmludGxuKFwiSW52YWxpZCBtb2RlOiBcIiArIG1vZGUpO1xuXHRcdFx0XHRcdFx0XHRtb2RlID0gZ3Vlc3NNb2RlKG1vZGUpO1xuXHRcdFx0XHRcdFx0XHRjYW52YXMucHJpbnRsbihcIkd1ZXNzZWQgbW9kZTogXCIgKyBtb2RlKTsgKi9cblx0XHRcdFx0XHRcdFx0dGhyb3cgXCJJbnZhbGlkIG1vZGU6IFwiICsgbW9kZSArIFwiIGluIChibG9jazpcIiArIHRoaXMuYmxvY2tQb2ludGVyICsgXCIgYml0OlwiICsgdGhpcy5iaXRQb2ludGVyICsgXCIpXCI7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRkYXRhTGVuZ3RoID0gdGhpcy5nZXREYXRhTGVuZ3RoKG1vZGUpO1xuXHRcdFx0XHRcdFx0aWYgKGRhdGFMZW5ndGggPCAxKVxuXHRcdFx0XHRcdFx0XHR0aHJvdyBcIkludmFsaWQgZGF0YSBsZW5ndGg6IFwiICsgZGF0YUxlbmd0aDtcblx0XHRcdFx0XHRcdC8vY2FudmFzLnByaW50bG4oXCJsZW5ndGg6IFwiICsgZGF0YUxlbmd0aCk7XG5cdFx0XHRcdFx0XHRzd2l0Y2ggKG1vZGUpXG5cdFx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHRcdFx0Y2FzZSBNT0RFX05VTUJFUjpcblx0XHRcdFx0XHRcdFx0XHQvL2NhbnZhcy5wcmludGxuKFwiTW9kZTogRmlndXJlXCIpO1xuXHRcdFx0XHRcdFx0XHRcdHZhciB0ZW1wX3N0ciA9IHRoaXMuZ2V0RmlndXJlU3RyaW5nKGRhdGFMZW5ndGgpO1xuXHRcdFx0XHRcdFx0XHRcdHZhciB0YSA9IG5ldyBBcnJheSh0ZW1wX3N0ci5sZW5ndGgpO1xuXHRcdFx0XHRcdFx0XHRcdGZvcih2YXIgaj0wO2o8dGVtcF9zdHIubGVuZ3RoO2orKylcblx0XHRcdFx0XHRcdFx0XHRcdHRhW2pdPXRlbXBfc3RyLmNoYXJDb2RlQXQoaik7XG5cdFx0XHRcdFx0XHRcdFx0b3V0cHV0LnB1c2godGEpO1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0XHRcdGNhc2UgTU9ERV9ST01BTl9BTkRfTlVNQkVSOlxuXHRcdFx0XHRcdFx0XHRcdC8vY2FudmFzLnByaW50bG4oXCJNb2RlOiBSb21hbiZGaWd1cmVcIik7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIHRlbXBfc3RyID0gdGhpcy5nZXRSb21hbkFuZEZpZ3VyZVN0cmluZyhkYXRhTGVuZ3RoKTtcblx0XHRcdFx0XHRcdFx0XHR2YXIgdGEgPSBuZXcgQXJyYXkodGVtcF9zdHIubGVuZ3RoKTtcblx0XHRcdFx0XHRcdFx0XHRmb3IodmFyIGo9MDtqPHRlbXBfc3RyLmxlbmd0aDtqKyspXG5cdFx0XHRcdFx0XHRcdFx0XHR0YVtqXT10ZW1wX3N0ci5jaGFyQ29kZUF0KGopO1xuXHRcdFx0XHRcdFx0XHRcdG91dHB1dC5wdXNoKHRhICk7XG5cdFx0XHRcdFx0XHRcdFx0Ly9vdXRwdXQuV3JpdGUoU3lzdGVtVXRpbHMuVG9CeXRlQXJyYXkodGVtcF9zYnl0ZUFycmF5MiksIDAsIHRlbXBfc2J5dGVBcnJheTIubGVuZ3RoKTtcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdFx0XHRjYXNlIE1PREVfOEJJVF9CWVRFOlxuXHRcdFx0XHRcdFx0XHRcdC8vY2FudmFzLnByaW50bG4oXCJNb2RlOiA4Yml0IEJ5dGVcIik7XG5cdFx0XHRcdFx0XHRcdFx0Ly9zYnl0ZVtdIHRlbXBfc2J5dGVBcnJheTM7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIHRlbXBfc2J5dGVBcnJheTMgPSB0aGlzLmdldDhiaXRCeXRlQXJyYXkoZGF0YUxlbmd0aCk7XG5cdFx0XHRcdFx0XHRcdFx0b3V0cHV0LnB1c2godGVtcF9zYnl0ZUFycmF5Myk7XG5cdFx0XHRcdFx0XHRcdFx0Ly9vdXRwdXQuV3JpdGUoU3lzdGVtVXRpbHMuVG9CeXRlQXJyYXkodGVtcF9zYnl0ZUFycmF5MyksIDAsIHRlbXBfc2J5dGVBcnJheTMubGVuZ3RoKTtcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdFx0XHRjYXNlIE1PREVfS0FOSkk6XG5cdFx0XHRcdFx0XHRcdFx0Ly9jYW52YXMucHJpbnRsbihcIk1vZGU6IEthbmppXCIpO1xuXHRcdFx0XHRcdFx0XHRcdC8vc2J5dGVbXSB0ZW1wX3NieXRlQXJyYXk0O1xuXHRcdFx0XHRcdFx0XHRcdC8vdGVtcF9zYnl0ZUFycmF5NCA9IFN5c3RlbVV0aWxzLlRvU0J5dGVBcnJheShTeXN0ZW1VdGlscy5Ub0J5dGVBcnJheShnZXRLYW5qaVN0cmluZyhkYXRhTGVuZ3RoKSkpO1xuXHRcdFx0XHRcdFx0XHRcdC8vb3V0cHV0LldyaXRlKFN5c3RlbVV0aWxzLlRvQnl0ZUFycmF5KHRlbXBfc2J5dGVBcnJheTQpLCAwLCB0ZW1wX3NieXRlQXJyYXk0Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0ZW1wX3N0ciA9IHRoaXMuZ2V0S2FuamlTdHJpbmcoZGF0YUxlbmd0aCk7XG5cdFx0XHRcdFx0XHRcdFx0b3V0cHV0LnB1c2godGVtcF9zdHIpO1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQvL1xuXHRcdFx0XHRcdFx0Ly9jYW52YXMucHJpbnRsbihcIkRhdGFMZW5ndGg6IFwiICsgZGF0YUxlbmd0aCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHdoaWxlICh0cnVlKTtcblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9fSk7XG59XG5cbm1vZHVsZS5leHBvcnRzPVFyQ29kZTtcbiIsInZhciBRUkNvZGVSZWFkZXIgPSByZXF1aXJlKCdxcmNvZGUtcmVhZGVyJyk7XG5cbnZhciB2aWRlbyAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FtZXJhJyk7XG52YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3FyLWNhbnZhcycpO1xudmFyIGN0eCAgICA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4vLyBUZW1wb3JhcnkgaGFjaywgc2V0IHRvIHJvb21iYSBjb21wdXRlci5cbi8vIFJvYm90IGRvZXMgbm90IGhhdmUgcm9zc3NlcnZlci5cbnZhciByb3MgPSBuZXcgUk9TTElCLlJvcyh7XG4gICAgdXJsIDogJ3dzczovL3Jvb21iYS5jcy53YXNoaW5ndG9uLmVkdTo5MDkwJ1xufSk7XG5cbnJvcy5vbignZXJyb3InLCBmdW5jdGlvbihlcnIpIHtcbiAgICBjb25zb2xlLmxvZyhlcnIpO1xufSk7XG5cbnJvcy5vbignY29ubmVjdGlvbicsIGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCdDb25uZWN0ZWQgdG8gd2Vic29ja2V0IHNlcnZlci4nKTtcbn0pO1xuXG52YXIgcXJfY29kZV90b3BpYyA9IG5ldyBST1NMSUIuVG9waWMoe1xuICAgIHJvcyA6IHJvcyxcbiAgICBuYW1lIDogJy9qZWV2ZXNfcXJfY29kZScsXG4gICAgbWVzc2FnZVR5cGUgOiAnamVldmVzL09yZGVyJ1xufSk7XG5cbm5hdmlnYXRvci5nZXRVc2VyTWVkaWEgPSBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3IubXNHZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLm9HZXRVc2VyTWVkaWE7XG5cbmlmIChuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhKSB7XG4gICAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSh7dmlkZW86IHRydWV9LCBoYW5kbGVWaWRlbywgdmlkZW9FcnJvcik7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVZpZGVvKHN0cmVhbSkge1xuICAgIHZpZGVvLnNyYyA9IHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKHN0cmVhbSk7XG59XG5cbmZ1bmN0aW9uIHZpZGVvRXJyb3IoZSkge1xuICAgIGNvbnNvbGUubG9nKGUpO1xufVxuXG52YXIgcmVhZGVyID0gbmV3IFFSQ29kZVJlYWRlcigpO1xucmVhZGVyLmNhbGxiYWNrID0gZnVuY3Rpb24gKHJlcykge1xuICBpZiAoIXJlcy5zdGFydHNXaXRoKCdlcnJvcicpKSB7XG4gICAgY29uc29sZS5sb2cocmVzKTtcbiAgICB2YXIgZGF0YSA9IHJlcy5zcGxpdCgnLCcpO1xuICAgIGlmIChkYXRhLmxlbmd0aCA9PSA0KSB7XG4gICAgICAgIHZhciBuYW1lID0gZGF0YVswXTtcbiAgICAgICAgdmFyIHBob25lID0gZGF0YVsxXTtcbiAgICAgICAgdmFyIGxvY2F0aW9uID0gZGF0YVsyXTtcbiAgICAgICAgdmFyIGZvb2RUeXBlID0gZGF0YVszXTtcbiAgICAgICAgY29uc29sZS5sb2cocmVzKTtcbiAgICAgICAgY29uc29sZS5sb2cobmFtZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGxvY2F0aW9uKTtcbiAgICAgICAgY29uc29sZS5sb2coZm9vZFR5cGUpO1xuICAgICAgICB2YXIgb3JkZXIgPSBuZXcgUk9TTElCLk1lc3NhZ2Uoe1xuICAgICAgICAgICAgbmFtZSA6IG5hbWUsXG4gICAgICAgICAgICBwaG9uZV9udW1iZXI6IHBob25lLFxuICAgICAgICAgICAgbG9jYXRpb246IGxvY2F0aW9uLFxuICAgICAgICAgICAgZm9vZF90eXBlOiBmb29kVHlwZVxuICAgICAgICB9KTtcbiAgICAgICAgcXJfY29kZV90b3BpYy5wdWJsaXNoKG9yZGVyKTtcbiAgICAgIH1cbiAgfVxuICBlbHNlIHtcbiAgICBjb25zb2xlLmxvZyhyZXMpO1xuICB9XG59O1xuXG52aWRlby5hZGRFdmVudExpc3RlbmVyKCdwbGF5JywgZnVuY3Rpb24gKCkge1xuICAgIHZhciAkdGhpcyA9IHRoaXM7IC8vY2FjaGVcbiAgICB3aWR0aCA9IHZpZGVvLmNsaWVudFdpZHRoO1xuICAgIGhlaWdodCA9IHZpZGVvLmNsaWVudEhlaWdodDtcbiAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIChmdW5jdGlvbiBsb29wKCkge1xuICAgICAgICBpZiAoISR0aGlzLnBhdXNlZCAmJiAhJHRoaXMuZW5kZWQpIHtcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoJHRoaXMsIDAsIDApO1xuICAgICAgICAgICAgc2V0VGltZW91dChsb29wLCAxMDAwIC8gMzApOyAvLyBkcmF3aW5nIGF0IDMwZnBzXG4gICAgICAgICAgICByZWFkZXIuZGVjb2RlKCk7XG4gICAgICAgIH1cbiAgICB9KSgpO1xufSwgMCk7XG5cbmZ1bmN0aW9uIHFyX2NhbGxiYWNrKHJlcykge1xufVxuIl19
