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
    // do something
}

var reader = new QRCodeReader();
reader.callback = function (res) {
  console.log(res);
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

},{"qrcode-reader":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcXJjb2RlLXJlYWRlci9kaXN0L2luZGV4LmpzIiwiL1VzZXJzL21rbWF0aHVyL0RvY3VtZW50cy9Db2RlL2plZXZlcy1yb2JvdC5naXRodWIuaW8vc2NyaXB0cy9RUmNhcHR1cmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcnRIQSxJQUFJLFlBQVksR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7O0FBRTVDLElBQUksS0FBSyxJQUFJLFFBQVEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDL0MsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNsRCxJQUFJLEdBQUcsTUFBTSxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVyQywwQ0FBMEM7QUFDMUMsa0NBQWtDO0FBQ2xDLElBQUksR0FBRyxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUNyQixHQUFHLEdBQUcscUNBQXFDO0FBQy9DLENBQUMsQ0FBQyxDQUFDOztBQUVILEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFNBQVMsR0FBRyxFQUFFO0lBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDckIsQ0FBQyxDQUFDLENBQUM7O0FBRUgsR0FBRyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsV0FBVztJQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7QUFDbEQsQ0FBQyxDQUFDLENBQUM7O0FBRUgsSUFBSSxhQUFhLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2pDLEdBQUcsR0FBRyxHQUFHO0lBQ1QsSUFBSSxHQUFHLGlCQUFpQjtJQUN4QixXQUFXLEdBQUcsY0FBYztBQUNoQyxDQUFDLENBQUMsQ0FBQzs7QUFFSCxTQUFTLENBQUMsWUFBWSxHQUFHLFNBQVMsQ0FBQyxZQUFZLElBQUksU0FBUyxDQUFDLGtCQUFrQixJQUFJLFNBQVMsQ0FBQyxlQUFlLElBQUksU0FBUyxDQUFDLGNBQWMsSUFBSSxTQUFTLENBQUMsYUFBYSxDQUFDOztBQUVwSyxJQUFJLFNBQVMsQ0FBQyxZQUFZLEVBQUU7SUFDeEIsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDbkUsQ0FBQzs7QUFFRCxTQUFTLFdBQVcsQ0FBQyxNQUFNLEVBQUU7SUFDekIsS0FBSyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNuRCxDQUFDOztBQUVELFNBQVMsVUFBVSxDQUFDLENBQUMsRUFBRTtBQUN2QixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRW5CLENBQUM7O0FBRUQsSUFBSSxNQUFNLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztBQUNoQyxNQUFNLENBQUMsUUFBUSxHQUFHLFVBQVUsR0FBRyxFQUFFO0VBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkIsQ0FBQyxDQUFDOztBQUVGLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsWUFBWTtJQUN2QyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDakIsS0FBSyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7SUFDMUIsTUFBTSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUM7SUFDNUIsTUFBTSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDckIsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDdkIsQ0FBQyxTQUFTLElBQUksR0FBRztRQUNiLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRTtZQUMvQixHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0IsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDNUIsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ25CO0tBQ0osR0FBRyxDQUFDO0FBQ1QsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUVOLFNBQVMsV0FBVyxDQUFDLEdBQUcsRUFBRTtNQUNwQixJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO01BQzFCLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7VUFDbEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1VBQ25CLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztVQUNwQixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7VUFDdkIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1VBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7VUFDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztVQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1VBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7VUFDdEIsSUFBSSxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDO2NBQzNCLElBQUksR0FBRyxJQUFJO2NBQ1gsWUFBWSxFQUFFLEtBQUs7Y0FDbkIsUUFBUSxFQUFFLFFBQVE7Y0FDbEIsU0FBUyxFQUFFLFFBQVE7V0FDdEIsQ0FBQyxDQUFDO1VBQ0gsYUFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUNoQztDQUNOIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXG4gIFBvcnRlZCB0byBKYXZhU2NyaXB0IGJ5IExhemFyIExhc3psbyAyMDExXG5cbiAgbGF6YXJzb2Z0QGdtYWlsLmNvbSwgd3d3LmxhemFyc29mdC5pbmZvXG5cbiovXG5cbi8qXG4qXG4qIENvcHlyaWdodCAyMDA3IFpYaW5nIGF1dGhvcnNcbipcbiogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbipcbiogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbipcbiogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4qIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4qIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuXG52YXIgR3JpZFNhbXBsZXIgPSB7fTtcblxuR3JpZFNhbXBsZXIuY2hlY2tBbmROdWRnZVBvaW50cz1mdW5jdGlvbiggaW1hZ2UsICBwb2ludHMpXG5cdFx0e1xuXHRcdFx0dmFyIHdpZHRoID0gaW1hZ2Uud2lkdGg7XG5cdFx0XHR2YXIgaGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0O1xuXHRcdFx0Ly8gQ2hlY2sgYW5kIG51ZGdlIHBvaW50cyBmcm9tIHN0YXJ0IHVudGlsIHdlIHNlZSBzb21lIHRoYXQgYXJlIE9LOlxuXHRcdFx0dmFyIG51ZGdlZCA9IHRydWU7XG5cdFx0XHRmb3IgKHZhciBvZmZzZXQgPSAwOyBvZmZzZXQgPCBwb2ludHMubGVuZ3RoICYmIG51ZGdlZDsgb2Zmc2V0ICs9IDIpXG5cdFx0XHR7XG5cdFx0XHRcdHZhciB4ID0gTWF0aC5mbG9vciAocG9pbnRzW29mZnNldF0pO1xuXHRcdFx0XHR2YXIgeSA9IE1hdGguZmxvb3IoIHBvaW50c1tvZmZzZXQgKyAxXSk7XG5cdFx0XHRcdGlmICh4IDwgLSAxIHx8IHggPiB3aWR0aCB8fCB5IDwgLSAxIHx8IHkgPiBoZWlnaHQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0aHJvdyBcIkVycm9yLmNoZWNrQW5kTnVkZ2VQb2ludHMgXCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0bnVkZ2VkID0gZmFsc2U7XG5cdFx0XHRcdGlmICh4ID09IC0gMSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHBvaW50c1tvZmZzZXRdID0gMC4wO1xuXHRcdFx0XHRcdG51ZGdlZCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiAoeCA9PSB3aWR0aClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHBvaW50c1tvZmZzZXRdID0gd2lkdGggLSAxO1xuXHRcdFx0XHRcdG51ZGdlZCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHkgPT0gLSAxKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cG9pbnRzW29mZnNldCArIDFdID0gMC4wO1xuXHRcdFx0XHRcdG51ZGdlZCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiAoeSA9PSBoZWlnaHQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRwb2ludHNbb2Zmc2V0ICsgMV0gPSBoZWlnaHQgLSAxO1xuXHRcdFx0XHRcdG51ZGdlZCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vIENoZWNrIGFuZCBudWRnZSBwb2ludHMgZnJvbSBlbmQ6XG5cdFx0XHRudWRnZWQgPSB0cnVlO1xuXHRcdFx0Zm9yICh2YXIgb2Zmc2V0ID0gcG9pbnRzLmxlbmd0aCAtIDI7IG9mZnNldCA+PSAwICYmIG51ZGdlZDsgb2Zmc2V0IC09IDIpXG5cdFx0XHR7XG5cdFx0XHRcdHZhciB4ID0gTWF0aC5mbG9vciggcG9pbnRzW29mZnNldF0pO1xuXHRcdFx0XHR2YXIgeSA9IE1hdGguZmxvb3IoIHBvaW50c1tvZmZzZXQgKyAxXSk7XG5cdFx0XHRcdGlmICh4IDwgLSAxIHx8IHggPiB3aWR0aCB8fCB5IDwgLSAxIHx8IHkgPiBoZWlnaHQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0aHJvdyBcIkVycm9yLmNoZWNrQW5kTnVkZ2VQb2ludHMgXCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0bnVkZ2VkID0gZmFsc2U7XG5cdFx0XHRcdGlmICh4ID09IC0gMSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHBvaW50c1tvZmZzZXRdID0gMC4wO1xuXHRcdFx0XHRcdG51ZGdlZCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiAoeCA9PSB3aWR0aClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHBvaW50c1tvZmZzZXRdID0gd2lkdGggLSAxO1xuXHRcdFx0XHRcdG51ZGdlZCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHkgPT0gLSAxKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cG9pbnRzW29mZnNldCArIDFdID0gMC4wO1xuXHRcdFx0XHRcdG51ZGdlZCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiAoeSA9PSBoZWlnaHQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRwb2ludHNbb2Zmc2V0ICsgMV0gPSBoZWlnaHQgLSAxO1xuXHRcdFx0XHRcdG51ZGdlZCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblxuXG5HcmlkU2FtcGxlci5zYW1wbGVHcmlkMz1mdW5jdGlvbiggaW1hZ2UsICBkaW1lbnNpb24sICB0cmFuc2Zvcm0pXG5cdFx0e1xuXHRcdFx0dmFyIGJpdHMgPSBuZXcgQml0TWF0cml4KGRpbWVuc2lvbik7XG5cdFx0XHR2YXIgcG9pbnRzID0gbmV3IEFycmF5KGRpbWVuc2lvbiA8PCAxKTtcblx0XHRcdGZvciAodmFyIHkgPSAwOyB5IDwgZGltZW5zaW9uOyB5KyspXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBtYXggPSBwb2ludHMubGVuZ3RoO1xuXHRcdFx0XHR2YXIgaVZhbHVlID0gIHkgKyAwLjU7XG5cdFx0XHRcdGZvciAodmFyIHggPSAwOyB4IDwgbWF4OyB4ICs9IDIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRwb2ludHNbeF0gPSAgKHggPj4gMSkgKyAwLjU7XG5cdFx0XHRcdFx0cG9pbnRzW3ggKyAxXSA9IGlWYWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0cmFuc2Zvcm0udHJhbnNmb3JtUG9pbnRzMShwb2ludHMpO1xuXHRcdFx0XHQvLyBRdWljayBjaGVjayB0byBzZWUgaWYgcG9pbnRzIHRyYW5zZm9ybWVkIHRvIHNvbWV0aGluZyBpbnNpZGUgdGhlIGltYWdlO1xuXHRcdFx0XHQvLyBzdWZmaWNpZW50IHRvIGNoZWNrIHRoZSBlbmRwb2ludHNcblx0XHRcdFx0R3JpZFNhbXBsZXIuY2hlY2tBbmROdWRnZVBvaW50cyhpbWFnZSwgcG9pbnRzKTtcblx0XHRcdFx0dHJ5XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRmb3IgKHZhciB4ID0gMDsgeCA8IG1heDsgeCArPSAyKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHZhciB4cG9pbnQgPSAoTWF0aC5mbG9vciggcG9pbnRzW3hdKSAqIDQpICsgKE1hdGguZmxvb3IoIHBvaW50c1t4ICsgMV0pICogaW1hZ2Uud2lkdGggKiA0KTtcblx0XHRcdFx0XHRcdHZhciBiaXQgPSBpbWFnZS5kYXRhW01hdGguZmxvb3IoIHBvaW50c1t4XSkrIGltYWdlLndpZHRoKiBNYXRoLmZsb29yKCBwb2ludHNbeCArIDFdKV07XG5cdFx0XHRcdFx0XHQvL2JpdHNbeCA+PiAxXVsgeV09Yml0O1xuXHRcdFx0XHRcdFx0aWYoYml0KVxuXHRcdFx0XHRcdFx0XHRiaXRzLnNldF9SZW5hbWVkKHggPj4gMSwgeSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGNhdGNoICggYWlvb2JlKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gVGhpcyBmZWVscyB3cm9uZywgYnV0LCBzb21ldGltZXMgaWYgdGhlIGZpbmRlciBwYXR0ZXJucyBhcmUgbWlzaWRlbnRpZmllZCwgdGhlIHJlc3VsdGluZ1xuXHRcdFx0XHRcdC8vIHRyYW5zZm9ybSBnZXRzIFwidHdpc3RlZFwiIHN1Y2ggdGhhdCBpdCBtYXBzIGEgc3RyYWlnaHQgbGluZSBvZiBwb2ludHMgdG8gYSBzZXQgb2YgcG9pbnRzXG5cdFx0XHRcdFx0Ly8gd2hvc2UgZW5kcG9pbnRzIGFyZSBpbiBib3VuZHMsIGJ1dCBvdGhlcnMgYXJlIG5vdC4gVGhlcmUgaXMgcHJvYmFibHkgc29tZSBtYXRoZW1hdGljYWxcblx0XHRcdFx0XHQvLyB3YXkgdG8gZGV0ZWN0IHRoaXMgYWJvdXQgdGhlIHRyYW5zZm9ybWF0aW9uIHRoYXQgSSBkb24ndCBrbm93IHlldC5cblx0XHRcdFx0XHQvLyBUaGlzIHJlc3VsdHMgaW4gYW4gdWdseSBydW50aW1lIGV4Y2VwdGlvbiBkZXNwaXRlIG91ciBjbGV2ZXIgY2hlY2tzIGFib3ZlIC0tIGNhbid0IGhhdmVcblx0XHRcdFx0XHQvLyB0aGF0LiBXZSBjb3VsZCBjaGVjayBlYWNoIHBvaW50J3MgY29vcmRpbmF0ZXMgYnV0IHRoYXQgZmVlbHMgZHVwbGljYXRpdmUuIFdlIHNldHRsZSBmb3Jcblx0XHRcdFx0XHQvLyBjYXRjaGluZyBhbmQgd3JhcHBpbmcgQXJyYXlJbmRleE91dE9mQm91bmRzRXhjZXB0aW9uLlxuXHRcdFx0XHRcdHRocm93IFwiRXJyb3IuY2hlY2tBbmROdWRnZVBvaW50c1wiO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gYml0cztcblx0XHR9XG5cbi8qXG4gIFBvcnRlZCB0byBKYXZhU2NyaXB0IGJ5IExhemFyIExhc3psbyAyMDExXG5cbiAgbGF6YXJzb2Z0QGdtYWlsLmNvbSwgd3d3LmxhemFyc29mdC5pbmZvXG5cbiovXG5cbi8qXG4qXG4qIENvcHlyaWdodCAyMDA3IFpYaW5nIGF1dGhvcnNcbipcbiogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbipcbiogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbipcbiogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4qIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4qIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuXG5cbmZ1bmN0aW9uIEVDQihjb3VudCwgIGRhdGFDb2Rld29yZHMpXG57XG5cdHRoaXMuY291bnQgPSBjb3VudDtcblx0dGhpcy5kYXRhQ29kZXdvcmRzID0gZGF0YUNvZGV3b3JkcztcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIkNvdW50XCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5jb3VudDtcblx0fX0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIkRhdGFDb2Rld29yZHNcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiB0aGlzLmRhdGFDb2Rld29yZHM7XG5cdH19KTtcbn1cblxuZnVuY3Rpb24gRUNCbG9ja3MoIGVjQ29kZXdvcmRzUGVyQmxvY2ssICBlY0Jsb2NrczEsICBlY0Jsb2NrczIpXG57XG5cdHRoaXMuZWNDb2Rld29yZHNQZXJCbG9jayA9IGVjQ29kZXdvcmRzUGVyQmxvY2s7XG5cdGlmKGVjQmxvY2tzMilcblx0XHR0aGlzLmVjQmxvY2tzID0gbmV3IEFycmF5KGVjQmxvY2tzMSwgZWNCbG9ja3MyKTtcblx0ZWxzZVxuXHRcdHRoaXMuZWNCbG9ja3MgPSBuZXcgQXJyYXkoZWNCbG9ja3MxKTtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIkVDQ29kZXdvcmRzUGVyQmxvY2tcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiB0aGlzLmVjQ29kZXdvcmRzUGVyQmxvY2s7XG5cdH19KTtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIlRvdGFsRUNDb2Rld29yZHNcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiAgdGhpcy5lY0NvZGV3b3Jkc1BlckJsb2NrICogdGhpcy5OdW1CbG9ja3M7XG5cdH19KTtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIk51bUJsb2Nrc1wiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0dmFyIHRvdGFsID0gMDtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWNCbG9ja3MubGVuZ3RoOyBpKyspXG5cdFx0e1xuXHRcdFx0dG90YWwgKz0gdGhpcy5lY0Jsb2Nrc1tpXS5sZW5ndGg7XG5cdFx0fVxuXHRcdHJldHVybiB0b3RhbDtcblx0fX0pO1xuXG5cdHRoaXMuZ2V0RUNCbG9ja3M9ZnVuY3Rpb24oKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5lY0Jsb2Nrcztcblx0XHRcdH1cbn1cblxuZnVuY3Rpb24gVmVyc2lvbiggdmVyc2lvbk51bWJlciwgIGFsaWdubWVudFBhdHRlcm5DZW50ZXJzLCAgZWNCbG9ja3MxLCAgZWNCbG9ja3MyLCAgZWNCbG9ja3MzLCAgZWNCbG9ja3M0KVxue1xuXHR0aGlzLnZlcnNpb25OdW1iZXIgPSB2ZXJzaW9uTnVtYmVyO1xuXHR0aGlzLmFsaWdubWVudFBhdHRlcm5DZW50ZXJzID0gYWxpZ25tZW50UGF0dGVybkNlbnRlcnM7XG5cdHRoaXMuZWNCbG9ja3MgPSBuZXcgQXJyYXkoZWNCbG9ja3MxLCBlY0Jsb2NrczIsIGVjQmxvY2tzMywgZWNCbG9ja3M0KTtcblxuXHR2YXIgdG90YWwgPSAwO1xuXHR2YXIgZWNDb2Rld29yZHMgPSBlY0Jsb2NrczEuRUNDb2Rld29yZHNQZXJCbG9jaztcblx0dmFyIGVjYkFycmF5ID0gZWNCbG9ja3MxLmdldEVDQmxvY2tzKCk7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZWNiQXJyYXkubGVuZ3RoOyBpKyspXG5cdHtcblx0XHR2YXIgZWNCbG9jayA9IGVjYkFycmF5W2ldO1xuXHRcdHRvdGFsICs9IGVjQmxvY2suQ291bnQgKiAoZWNCbG9jay5EYXRhQ29kZXdvcmRzICsgZWNDb2Rld29yZHMpO1xuXHR9XG5cdHRoaXMudG90YWxDb2Rld29yZHMgPSB0b3RhbDtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIlZlcnNpb25OdW1iZXJcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiAgdGhpcy52ZXJzaW9uTnVtYmVyO1xuXHR9fSk7XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJBbGlnbm1lbnRQYXR0ZXJuQ2VudGVyc1wiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuICB0aGlzLmFsaWdubWVudFBhdHRlcm5DZW50ZXJzO1xuXHR9fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiVG90YWxDb2Rld29yZHNcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiAgdGhpcy50b3RhbENvZGV3b3Jkcztcblx0fX0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIkRpbWVuc2lvbkZvclZlcnNpb25cIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiAgMTcgKyA0ICogdGhpcy52ZXJzaW9uTnVtYmVyO1xuXHR9fSk7XG5cblx0dGhpcy5idWlsZEZ1bmN0aW9uUGF0dGVybj1mdW5jdGlvbigpXG5cdFx0e1xuXHRcdFx0dmFyIGRpbWVuc2lvbiA9IHRoaXMuRGltZW5zaW9uRm9yVmVyc2lvbjtcblx0XHRcdHZhciBiaXRNYXRyaXggPSBuZXcgQml0TWF0cml4KGRpbWVuc2lvbik7XG5cblx0XHRcdC8vIFRvcCBsZWZ0IGZpbmRlciBwYXR0ZXJuICsgc2VwYXJhdG9yICsgZm9ybWF0XG5cdFx0XHRiaXRNYXRyaXguc2V0UmVnaW9uKDAsIDAsIDksIDkpO1xuXHRcdFx0Ly8gVG9wIHJpZ2h0IGZpbmRlciBwYXR0ZXJuICsgc2VwYXJhdG9yICsgZm9ybWF0XG5cdFx0XHRiaXRNYXRyaXguc2V0UmVnaW9uKGRpbWVuc2lvbiAtIDgsIDAsIDgsIDkpO1xuXHRcdFx0Ly8gQm90dG9tIGxlZnQgZmluZGVyIHBhdHRlcm4gKyBzZXBhcmF0b3IgKyBmb3JtYXRcblx0XHRcdGJpdE1hdHJpeC5zZXRSZWdpb24oMCwgZGltZW5zaW9uIC0gOCwgOSwgOCk7XG5cblx0XHRcdC8vIEFsaWdubWVudCBwYXR0ZXJuc1xuXHRcdFx0dmFyIG1heCA9IHRoaXMuYWxpZ25tZW50UGF0dGVybkNlbnRlcnMubGVuZ3RoO1xuXHRcdFx0Zm9yICh2YXIgeCA9IDA7IHggPCBtYXg7IHgrKylcblx0XHRcdHtcblx0XHRcdFx0dmFyIGkgPSB0aGlzLmFsaWdubWVudFBhdHRlcm5DZW50ZXJzW3hdIC0gMjtcblx0XHRcdFx0Zm9yICh2YXIgeSA9IDA7IHkgPCBtYXg7IHkrKylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmICgoeCA9PSAwICYmICh5ID09IDAgfHwgeSA9PSBtYXggLSAxKSkgfHwgKHggPT0gbWF4IC0gMSAmJiB5ID09IDApKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIE5vIGFsaWdubWVudCBwYXR0ZXJucyBuZWFyIHRoZSB0aHJlZSBmaW5kZXIgcGF0ZXJuc1xuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJpdE1hdHJpeC5zZXRSZWdpb24odGhpcy5hbGlnbm1lbnRQYXR0ZXJuQ2VudGVyc1t5XSAtIDIsIGksIDUsIDUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIFZlcnRpY2FsIHRpbWluZyBwYXR0ZXJuXG5cdFx0XHRiaXRNYXRyaXguc2V0UmVnaW9uKDYsIDksIDEsIGRpbWVuc2lvbiAtIDE3KTtcblx0XHRcdC8vIEhvcml6b250YWwgdGltaW5nIHBhdHRlcm5cblx0XHRcdGJpdE1hdHJpeC5zZXRSZWdpb24oOSwgNiwgZGltZW5zaW9uIC0gMTcsIDEpO1xuXG5cdFx0XHRpZiAodGhpcy52ZXJzaW9uTnVtYmVyID4gNilcblx0XHRcdHtcblx0XHRcdFx0Ly8gVmVyc2lvbiBpbmZvLCB0b3AgcmlnaHRcblx0XHRcdFx0Yml0TWF0cml4LnNldFJlZ2lvbihkaW1lbnNpb24gLSAxMSwgMCwgMywgNik7XG5cdFx0XHRcdC8vIFZlcnNpb24gaW5mbywgYm90dG9tIGxlZnRcblx0XHRcdFx0Yml0TWF0cml4LnNldFJlZ2lvbigwLCBkaW1lbnNpb24gLSAxMSwgNiwgMyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBiaXRNYXRyaXg7XG5cdFx0fVxuXHR0aGlzLmdldEVDQmxvY2tzRm9yTGV2ZWw9ZnVuY3Rpb24oIGVjTGV2ZWwpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5lY0Jsb2Nrc1tlY0xldmVsLm9yZGluYWwoKV07XG5cdH1cbn1cblxuVmVyc2lvbi5WRVJTSU9OX0RFQ09ERV9JTkZPID0gbmV3IEFycmF5KDB4MDdDOTQsIDB4MDg1QkMsIDB4MDlBOTksIDB4MEE0RDMsIDB4MEJCRjYsIDB4MEM3NjIsIDB4MEQ4NDcsIDB4MEU2MEQsIDB4MEY5MjgsIDB4MTBCNzgsIDB4MTE0NUQsIDB4MTJBMTcsIDB4MTM1MzIsIDB4MTQ5QTYsIDB4MTU2ODMsIDB4MTY4QzksIDB4MTc3RUMsIDB4MThFQzQsIDB4MTkxRTEsIDB4MUFGQUIsIDB4MUIwOEUsIDB4MUNDMUEsIDB4MUQzM0YsIDB4MUVENzUsIDB4MUYyNTAsIDB4MjA5RDUsIDB4MjE2RjAsIDB4MjI4QkEsIDB4MjM3OUYsIDB4MjRCMEIsIDB4MjU0MkUsIDB4MjZBNjQsIDB4Mjc1NDEsIDB4MjhDNjkpO1xuXG5WZXJzaW9uLlZFUlNJT05TID0gYnVpbGRWZXJzaW9ucygpO1xuXG5WZXJzaW9uLmdldFZlcnNpb25Gb3JOdW1iZXI9ZnVuY3Rpb24oIHZlcnNpb25OdW1iZXIpXG57XG5cdGlmICh2ZXJzaW9uTnVtYmVyIDwgMSB8fCB2ZXJzaW9uTnVtYmVyID4gNDApXG5cdHtcblx0XHR0aHJvdyBcIkFyZ3VtZW50RXhjZXB0aW9uXCI7XG5cdH1cblx0cmV0dXJuIFZlcnNpb24uVkVSU0lPTlNbdmVyc2lvbk51bWJlciAtIDFdO1xufVxuXG5WZXJzaW9uLmdldFByb3Zpc2lvbmFsVmVyc2lvbkZvckRpbWVuc2lvbj1mdW5jdGlvbihkaW1lbnNpb24pXG57XG5cdGlmIChkaW1lbnNpb24gJSA0ICE9IDEpXG5cdHtcblx0XHR0aHJvdyBcIkVycm9yIGdldFByb3Zpc2lvbmFsVmVyc2lvbkZvckRpbWVuc2lvblwiO1xuXHR9XG5cdHRyeVxuXHR7XG5cdFx0cmV0dXJuIFZlcnNpb24uZ2V0VmVyc2lvbkZvck51bWJlcigoZGltZW5zaW9uIC0gMTcpID4+IDIpO1xuXHR9XG5cdGNhdGNoICggaWFlKVxuXHR7XG5cdFx0dGhyb3cgXCJFcnJvciBnZXRWZXJzaW9uRm9yTnVtYmVyXCI7XG5cdH1cbn1cblxuVmVyc2lvbi5kZWNvZGVWZXJzaW9uSW5mb3JtYXRpb249ZnVuY3Rpb24oIHZlcnNpb25CaXRzKVxue1xuXHR2YXIgYmVzdERpZmZlcmVuY2UgPSAweGZmZmZmZmZmO1xuXHR2YXIgYmVzdFZlcnNpb24gPSAwO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IFZlcnNpb24uVkVSU0lPTl9ERUNPREVfSU5GTy5sZW5ndGg7IGkrKylcblx0e1xuXHRcdHZhciB0YXJnZXRWZXJzaW9uID0gVmVyc2lvbi5WRVJTSU9OX0RFQ09ERV9JTkZPW2ldO1xuXHRcdC8vIERvIHRoZSB2ZXJzaW9uIGluZm8gYml0cyBtYXRjaCBleGFjdGx5PyBkb25lLlxuXHRcdGlmICh0YXJnZXRWZXJzaW9uID09IHZlcnNpb25CaXRzKVxuXHRcdHtcblx0XHRcdHJldHVybiB0aGlzLmdldFZlcnNpb25Gb3JOdW1iZXIoaSArIDcpO1xuXHRcdH1cblx0XHQvLyBPdGhlcndpc2Ugc2VlIGlmIHRoaXMgaXMgdGhlIGNsb3Nlc3QgdG8gYSByZWFsIHZlcnNpb24gaW5mbyBiaXQgc3RyaW5nXG5cdFx0Ly8gd2UgaGF2ZSBzZWVuIHNvIGZhclxuXHRcdHZhciBiaXRzRGlmZmVyZW5jZSA9IEZvcm1hdEluZm9ybWF0aW9uLm51bUJpdHNEaWZmZXJpbmcodmVyc2lvbkJpdHMsIHRhcmdldFZlcnNpb24pO1xuXHRcdGlmIChiaXRzRGlmZmVyZW5jZSA8IGJlc3REaWZmZXJlbmNlKVxuXHRcdHtcblx0XHRcdGJlc3RWZXJzaW9uID0gaSArIDc7XG5cdFx0XHRiZXN0RGlmZmVyZW5jZSA9IGJpdHNEaWZmZXJlbmNlO1xuXHRcdH1cblx0fVxuXHQvLyBXZSBjYW4gdG9sZXJhdGUgdXAgdG8gMyBiaXRzIG9mIGVycm9yIHNpbmNlIG5vIHR3byB2ZXJzaW9uIGluZm8gY29kZXdvcmRzIHdpbGxcblx0Ly8gZGlmZmVyIGluIGxlc3MgdGhhbiA0IGJpdHMuXG5cdGlmIChiZXN0RGlmZmVyZW5jZSA8PSAzKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0VmVyc2lvbkZvck51bWJlcihiZXN0VmVyc2lvbik7XG5cdH1cblx0Ly8gSWYgd2UgZGlkbid0IGZpbmQgYSBjbG9zZSBlbm91Z2ggbWF0Y2gsIGZhaWxcblx0cmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkVmVyc2lvbnMoKVxue1xuXHRyZXR1cm4gbmV3IEFycmF5KG5ldyBWZXJzaW9uKDEsIG5ldyBBcnJheSgpLCBuZXcgRUNCbG9ja3MoNywgbmV3IEVDQigxLCAxOSkpLCBuZXcgRUNCbG9ja3MoMTAsIG5ldyBFQ0IoMSwgMTYpKSwgbmV3IEVDQmxvY2tzKDEzLCBuZXcgRUNCKDEsIDEzKSksIG5ldyBFQ0Jsb2NrcygxNywgbmV3IEVDQigxLCA5KSkpLFxuXHRuZXcgVmVyc2lvbigyLCBuZXcgQXJyYXkoNiwgMTgpLCBuZXcgRUNCbG9ja3MoMTAsIG5ldyBFQ0IoMSwgMzQpKSwgbmV3IEVDQmxvY2tzKDE2LCBuZXcgRUNCKDEsIDI4KSksIG5ldyBFQ0Jsb2NrcygyMiwgbmV3IEVDQigxLCAyMikpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMSwgMTYpKSksXG5cdG5ldyBWZXJzaW9uKDMsIG5ldyBBcnJheSg2LCAyMiksIG5ldyBFQ0Jsb2NrcygxNSwgbmV3IEVDQigxLCA1NSkpLCBuZXcgRUNCbG9ja3MoMjYsIG5ldyBFQ0IoMSwgNDQpKSwgbmV3IEVDQmxvY2tzKDE4LCBuZXcgRUNCKDIsIDE3KSksIG5ldyBFQ0Jsb2NrcygyMiwgbmV3IEVDQigyLCAxMykpKSxcblx0bmV3IFZlcnNpb24oNCwgbmV3IEFycmF5KDYsIDI2KSwgbmV3IEVDQmxvY2tzKDIwLCBuZXcgRUNCKDEsIDgwKSksIG5ldyBFQ0Jsb2NrcygxOCwgbmV3IEVDQigyLCAzMikpLCBuZXcgRUNCbG9ja3MoMjYsIG5ldyBFQ0IoMiwgMjQpKSwgbmV3IEVDQmxvY2tzKDE2LCBuZXcgRUNCKDQsIDkpKSksXG5cdG5ldyBWZXJzaW9uKDUsIG5ldyBBcnJheSg2LCAzMCksIG5ldyBFQ0Jsb2NrcygyNiwgbmV3IEVDQigxLCAxMDgpKSwgbmV3IEVDQmxvY2tzKDI0LCBuZXcgRUNCKDIsIDQzKSksIG5ldyBFQ0Jsb2NrcygxOCwgbmV3IEVDQigyLCAxNSksIG5ldyBFQ0IoMiwgMTYpKSwgbmV3IEVDQmxvY2tzKDIyLCBuZXcgRUNCKDIsIDExKSwgbmV3IEVDQigyLCAxMikpKSxcblx0bmV3IFZlcnNpb24oNiwgbmV3IEFycmF5KDYsIDM0KSwgbmV3IEVDQmxvY2tzKDE4LCBuZXcgRUNCKDIsIDY4KSksIG5ldyBFQ0Jsb2NrcygxNiwgbmV3IEVDQig0LCAyNykpLCBuZXcgRUNCbG9ja3MoMjQsIG5ldyBFQ0IoNCwgMTkpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDQsIDE1KSkpLFxuXHRuZXcgVmVyc2lvbig3LCBuZXcgQXJyYXkoNiwgMjIsIDM4KSwgbmV3IEVDQmxvY2tzKDIwLCBuZXcgRUNCKDIsIDc4KSksIG5ldyBFQ0Jsb2NrcygxOCwgbmV3IEVDQig0LCAzMSkpLCBuZXcgRUNCbG9ja3MoMTgsIG5ldyBFQ0IoMiwgMTQpLCBuZXcgRUNCKDQsIDE1KSksIG5ldyBFQ0Jsb2NrcygyNiwgbmV3IEVDQig0LCAxMyksIG5ldyBFQ0IoMSwgMTQpKSksXG5cdG5ldyBWZXJzaW9uKDgsIG5ldyBBcnJheSg2LCAyNCwgNDIpLCBuZXcgRUNCbG9ja3MoMjQsIG5ldyBFQ0IoMiwgOTcpKSwgbmV3IEVDQmxvY2tzKDIyLCBuZXcgRUNCKDIsIDM4KSwgbmV3IEVDQigyLCAzOSkpLCBuZXcgRUNCbG9ja3MoMjIsIG5ldyBFQ0IoNCwgMTgpLCBuZXcgRUNCKDIsIDE5KSksIG5ldyBFQ0Jsb2NrcygyNiwgbmV3IEVDQig0LCAxNCksIG5ldyBFQ0IoMiwgMTUpKSksXG5cdG5ldyBWZXJzaW9uKDksIG5ldyBBcnJheSg2LCAyNiwgNDYpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMiwgMTE2KSksIG5ldyBFQ0Jsb2NrcygyMiwgbmV3IEVDQigzLCAzNiksIG5ldyBFQ0IoMiwgMzcpKSwgbmV3IEVDQmxvY2tzKDIwLCBuZXcgRUNCKDQsIDE2KSwgbmV3IEVDQig0LCAxNykpLCBuZXcgRUNCbG9ja3MoMjQsIG5ldyBFQ0IoNCwgMTIpLCBuZXcgRUNCKDQsIDEzKSkpLFxuXHRuZXcgVmVyc2lvbigxMCwgbmV3IEFycmF5KDYsIDI4LCA1MCksIG5ldyBFQ0Jsb2NrcygxOCwgbmV3IEVDQigyLCA2OCksIG5ldyBFQ0IoMiwgNjkpKSwgbmV3IEVDQmxvY2tzKDI2LCBuZXcgRUNCKDQsIDQzKSwgbmV3IEVDQigxLCA0NCkpLCBuZXcgRUNCbG9ja3MoMjQsIG5ldyBFQ0IoNiwgMTkpLCBuZXcgRUNCKDIsIDIwKSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQig2LCAxNSksIG5ldyBFQ0IoMiwgMTYpKSksXG5cdG5ldyBWZXJzaW9uKDExLCBuZXcgQXJyYXkoNiwgMzAsIDU0KSwgbmV3IEVDQmxvY2tzKDIwLCBuZXcgRUNCKDQsIDgxKSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigxLCA1MCksIG5ldyBFQ0IoNCwgNTEpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDQsIDIyKSwgbmV3IEVDQig0LCAyMykpLCBuZXcgRUNCbG9ja3MoMjQsIG5ldyBFQ0IoMywgMTIpLCBuZXcgRUNCKDgsIDEzKSkpLFxuXHRuZXcgVmVyc2lvbigxMiwgbmV3IEFycmF5KDYsIDMyLCA1OCksIG5ldyBFQ0Jsb2NrcygyNCwgbmV3IEVDQigyLCA5MiksIG5ldyBFQ0IoMiwgOTMpKSwgbmV3IEVDQmxvY2tzKDIyLCBuZXcgRUNCKDYsIDM2KSwgbmV3IEVDQigyLCAzNykpLCBuZXcgRUNCbG9ja3MoMjYsIG5ldyBFQ0IoNCwgMjApLCBuZXcgRUNCKDYsIDIxKSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQig3LCAxNCksIG5ldyBFQ0IoNCwgMTUpKSksXG5cdG5ldyBWZXJzaW9uKDEzLCBuZXcgQXJyYXkoNiwgMzQsIDYyKSwgbmV3IEVDQmxvY2tzKDI2LCBuZXcgRUNCKDQsIDEwNykpLCBuZXcgRUNCbG9ja3MoMjIsIG5ldyBFQ0IoOCwgMzcpLCBuZXcgRUNCKDEsIDM4KSksIG5ldyBFQ0Jsb2NrcygyNCwgbmV3IEVDQig4LCAyMCksIG5ldyBFQ0IoNCwgMjEpKSwgbmV3IEVDQmxvY2tzKDIyLCBuZXcgRUNCKDEyLCAxMSksIG5ldyBFQ0IoNCwgMTIpKSksXG5cdG5ldyBWZXJzaW9uKDE0LCBuZXcgQXJyYXkoNiwgMjYsIDQ2LCA2NiksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigzLCAxMTUpLCBuZXcgRUNCKDEsIDExNikpLCBuZXcgRUNCbG9ja3MoMjQsIG5ldyBFQ0IoNCwgNDApLCBuZXcgRUNCKDUsIDQxKSksIG5ldyBFQ0Jsb2NrcygyMCwgbmV3IEVDQigxMSwgMTYpLCBuZXcgRUNCKDUsIDE3KSksIG5ldyBFQ0Jsb2NrcygyNCwgbmV3IEVDQigxMSwgMTIpLCBuZXcgRUNCKDUsIDEzKSkpLFxuXHRuZXcgVmVyc2lvbigxNSwgbmV3IEFycmF5KDYsIDI2LCA0OCwgNzApLCBuZXcgRUNCbG9ja3MoMjIsIG5ldyBFQ0IoNSwgODcpLCBuZXcgRUNCKDEsIDg4KSksIG5ldyBFQ0Jsb2NrcygyNCwgbmV3IEVDQig1LCA0MSksIG5ldyBFQ0IoNSwgNDIpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDUsIDI0KSwgbmV3IEVDQig3LCAyNSkpLCBuZXcgRUNCbG9ja3MoMjQsIG5ldyBFQ0IoMTEsIDEyKSwgbmV3IEVDQig3LCAxMykpKSxcblx0bmV3IFZlcnNpb24oMTYsIG5ldyBBcnJheSg2LCAyNiwgNTAsIDc0KSwgbmV3IEVDQmxvY2tzKDI0LCBuZXcgRUNCKDUsIDk4KSwgbmV3IEVDQigxLCA5OSkpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoNywgNDUpLCBuZXcgRUNCKDMsIDQ2KSksIG5ldyBFQ0Jsb2NrcygyNCwgbmV3IEVDQigxNSwgMTkpLCBuZXcgRUNCKDIsIDIwKSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigzLCAxNSksIG5ldyBFQ0IoMTMsIDE2KSkpLFxuXHRuZXcgVmVyc2lvbigxNywgbmV3IEFycmF5KDYsIDMwLCA1NCwgNzgpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMSwgMTA3KSwgbmV3IEVDQig1LCAxMDgpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDEwLCA0NiksIG5ldyBFQ0IoMSwgNDcpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDEsIDIyKSwgbmV3IEVDQigxNSwgMjMpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDIsIDE0KSwgbmV3IEVDQigxNywgMTUpKSksXG5cdG5ldyBWZXJzaW9uKDE4LCBuZXcgQXJyYXkoNiwgMzAsIDU2LCA4MiksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQig1LCAxMjApLCBuZXcgRUNCKDEsIDEyMSkpLCBuZXcgRUNCbG9ja3MoMjYsIG5ldyBFQ0IoOSwgNDMpLCBuZXcgRUNCKDQsIDQ0KSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigxNywgMjIpLCBuZXcgRUNCKDEsIDIzKSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigyLCAxNCksIG5ldyBFQ0IoMTksIDE1KSkpLFxuXHRuZXcgVmVyc2lvbigxOSwgbmV3IEFycmF5KDYsIDMwLCA1OCwgODYpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMywgMTEzKSwgbmV3IEVDQig0LCAxMTQpKSwgbmV3IEVDQmxvY2tzKDI2LCBuZXcgRUNCKDMsIDQ0KSwgbmV3IEVDQigxMSwgNDUpKSwgbmV3IEVDQmxvY2tzKDI2LCBuZXcgRUNCKDE3LCAyMSksIG5ldyBFQ0IoNCwgMjIpKSwgbmV3IEVDQmxvY2tzKDI2LCBuZXcgRUNCKDksIDEzKSwgbmV3IEVDQigxNiwgMTQpKSksXG5cdG5ldyBWZXJzaW9uKDIwLCBuZXcgQXJyYXkoNiwgMzQsIDYyLCA5MCksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigzLCAxMDcpLCBuZXcgRUNCKDUsIDEwOCkpLCBuZXcgRUNCbG9ja3MoMjYsIG5ldyBFQ0IoMywgNDEpLCBuZXcgRUNCKDEzLCA0MikpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMTUsIDI0KSwgbmV3IEVDQig1LCAyNSkpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMTUsIDE1KSwgbmV3IEVDQigxMCwgMTYpKSksXG5cdG5ldyBWZXJzaW9uKDIxLCBuZXcgQXJyYXkoNiwgMjgsIDUwLCA3MiwgOTQpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoNCwgMTE2KSwgbmV3IEVDQig0LCAxMTcpKSwgbmV3IEVDQmxvY2tzKDI2LCBuZXcgRUNCKDE3LCA0MikpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMTcsIDIyKSwgbmV3IEVDQig2LCAyMykpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMTksIDE2KSwgbmV3IEVDQig2LCAxNykpKSxcblx0bmV3IFZlcnNpb24oMjIsIG5ldyBBcnJheSg2LCAyNiwgNTAsIDc0LCA5OCksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigyLCAxMTEpLCBuZXcgRUNCKDcsIDExMikpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMTcsIDQ2KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQig3LCAyNCksIG5ldyBFQ0IoMTYsIDI1KSksIG5ldyBFQ0Jsb2NrcygyNCwgbmV3IEVDQigzNCwgMTMpKSksXG5cdG5ldyBWZXJzaW9uKDIzLCBuZXcgQXJyYXkoNiwgMzAsIDU0LCA3NCwgMTAyKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDQsIDEyMSksIG5ldyBFQ0IoNSwgMTIyKSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQig0LCA0NyksIG5ldyBFQ0IoMTQsIDQ4KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigxMSwgMjQpLCBuZXcgRUNCKDE0LCAyNSkpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMTYsIDE1KSwgbmV3IEVDQigxNCwgMTYpKSksXG5cdG5ldyBWZXJzaW9uKDI0LCBuZXcgQXJyYXkoNiwgMjgsIDU0LCA4MCwgMTA2KSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDYsIDExNyksIG5ldyBFQ0IoNCwgMTE4KSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQig2LCA0NSksIG5ldyBFQ0IoMTQsIDQ2KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigxMSwgMjQpLCBuZXcgRUNCKDE2LCAyNSkpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMzAsIDE2KSwgbmV3IEVDQigyLCAxNykpKSxcblx0bmV3IFZlcnNpb24oMjUsIG5ldyBBcnJheSg2LCAzMiwgNTgsIDg0LCAxMTApLCBuZXcgRUNCbG9ja3MoMjYsIG5ldyBFQ0IoOCwgMTA2KSwgbmV3IEVDQig0LCAxMDcpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDgsIDQ3KSwgbmV3IEVDQigxMywgNDgpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDcsIDI0KSwgbmV3IEVDQigyMiwgMjUpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDIyLCAxNSksIG5ldyBFQ0IoMTMsIDE2KSkpLFxuXHRuZXcgVmVyc2lvbigyNiwgbmV3IEFycmF5KDYsIDMwLCA1OCwgODYsIDExNCksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigxMCwgMTE0KSwgbmV3IEVDQigyLCAxMTUpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDE5LCA0NiksIG5ldyBFQ0IoNCwgNDcpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDI4LCAyMiksIG5ldyBFQ0IoNiwgMjMpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDMzLCAxNiksIG5ldyBFQ0IoNCwgMTcpKSksXG5cdG5ldyBWZXJzaW9uKDI3LCBuZXcgQXJyYXkoNiwgMzQsIDYyLCA5MCwgMTE4KSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDgsIDEyMiksIG5ldyBFQ0IoNCwgMTIzKSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigyMiwgNDUpLCBuZXcgRUNCKDMsIDQ2KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQig4LCAyMyksIG5ldyBFQ0IoMjYsIDI0KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigxMiwgMTUpLCBcdFx0bmV3IEVDQigyOCwgMTYpKSksXG5cdG5ldyBWZXJzaW9uKDI4LCBuZXcgQXJyYXkoNiwgMjYsIDUwLCA3NCwgOTgsIDEyMiksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigzLCAxMTcpLCBuZXcgRUNCKDEwLCAxMTgpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDMsIDQ1KSwgbmV3IEVDQigyMywgNDYpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDQsIDI0KSwgbmV3IEVDQigzMSwgMjUpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDExLCAxNSksIG5ldyBFQ0IoMzEsIDE2KSkpLFxuXHRuZXcgVmVyc2lvbigyOSwgbmV3IEFycmF5KDYsIDMwLCA1NCwgNzgsIDEwMiwgMTI2KSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDcsIDExNiksIG5ldyBFQ0IoNywgMTE3KSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigyMSwgNDUpLCBuZXcgRUNCKDcsIDQ2KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigxLCAyMyksIG5ldyBFQ0IoMzcsIDI0KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigxOSwgMTUpLCBuZXcgRUNCKDI2LCAxNikpKSxcblx0bmV3IFZlcnNpb24oMzAsIG5ldyBBcnJheSg2LCAyNiwgNTIsIDc4LCAxMDQsIDEzMCksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQig1LCAxMTUpLCBuZXcgRUNCKDEwLCAxMTYpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDE5LCA0NyksIG5ldyBFQ0IoMTAsIDQ4KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigxNSwgMjQpLCBuZXcgRUNCKDI1LCAyNSkpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMjMsIDE1KSwgbmV3IEVDQigyNSwgMTYpKSksXG5cdG5ldyBWZXJzaW9uKDMxLCBuZXcgQXJyYXkoNiwgMzAsIDU2LCA4MiwgMTA4LCAxMzQpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMTMsIDExNSksIG5ldyBFQ0IoMywgMTE2KSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigyLCA0NiksIG5ldyBFQ0IoMjksIDQ3KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQig0MiwgMjQpLCBuZXcgRUNCKDEsIDI1KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigyMywgMTUpLCBuZXcgRUNCKDI4LCAxNikpKSxcblx0bmV3IFZlcnNpb24oMzIsIG5ldyBBcnJheSg2LCAzNCwgNjAsIDg2LCAxMTIsIDEzOCksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigxNywgMTE1KSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigxMCwgNDYpLCBuZXcgRUNCKDIzLCA0NykpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMTAsIDI0KSwgbmV3IEVDQigzNSwgMjUpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDE5LCAxNSksIG5ldyBFQ0IoMzUsIDE2KSkpLFxuXHRuZXcgVmVyc2lvbigzMywgbmV3IEFycmF5KDYsIDMwLCA1OCwgODYsIDExNCwgMTQyKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDE3LCAxMTUpLCBuZXcgRUNCKDEsIDExNikpLCBuZXcgRUNCbG9ja3MoMjgsIG5ldyBFQ0IoMTQsIDQ2KSwgbmV3IEVDQigyMSwgNDcpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDI5LCAyNCksIG5ldyBFQ0IoMTksIDI1KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigxMSwgMTUpLCBuZXcgRUNCKDQ2LCAxNikpKSxcblx0bmV3IFZlcnNpb24oMzQsIG5ldyBBcnJheSg2LCAzNCwgNjIsIDkwLCAxMTgsIDE0NiksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigxMywgMTE1KSwgbmV3IEVDQig2LCAxMTYpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDE0LCA0NiksIG5ldyBFQ0IoMjMsIDQ3KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQig0NCwgMjQpLCBuZXcgRUNCKDcsIDI1KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQig1OSwgMTYpLCBuZXcgRUNCKDEsIDE3KSkpLFxuXHRuZXcgVmVyc2lvbigzNSwgbmV3IEFycmF5KDYsIDMwLCA1NCwgNzgsIDEwMiwgMTI2LCAxNTApLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMTIsIDEyMSksIG5ldyBFQ0IoNywgMTIyKSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigxMiwgNDcpLCBuZXcgRUNCKDI2LCA0OCkpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMzksIDI0KSwgbmV3IEVDQigxNCwgMjUpKSxuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMjIsIDE1KSwgbmV3IEVDQig0MSwgMTYpKSksXG5cdG5ldyBWZXJzaW9uKDM2LCBuZXcgQXJyYXkoNiwgMjQsIDUwLCA3NiwgMTAyLCAxMjgsIDE1NCksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQig2LCAxMjEpLCBuZXcgRUNCKDE0LCAxMjIpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDYsIDQ3KSwgbmV3IEVDQigzNCwgNDgpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDQ2LCAyNCksIG5ldyBFQ0IoMTAsIDI1KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigyLCAxNSksIG5ldyBFQ0IoNjQsIDE2KSkpLFxuXHRuZXcgVmVyc2lvbigzNywgbmV3IEFycmF5KDYsIDI4LCA1NCwgODAsIDEwNiwgMTMyLCAxNTgpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMTcsIDEyMiksIG5ldyBFQ0IoNCwgMTIzKSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigyOSwgNDYpLCBuZXcgRUNCKDE0LCA0NykpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoNDksIDI0KSwgbmV3IEVDQigxMCwgMjUpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDI0LCAxNSksIG5ldyBFQ0IoNDYsIDE2KSkpLFxuXHRuZXcgVmVyc2lvbigzOCwgbmV3IEFycmF5KDYsIDMyLCA1OCwgODQsIDExMCwgMTM2LCAxNjIpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoNCwgMTIyKSwgbmV3IEVDQigxOCwgMTIzKSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQigxMywgNDYpLCBuZXcgRUNCKDMyLCA0NykpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoNDgsIDI0KSwgbmV3IEVDQigxNCwgMjUpKSwgbmV3IEVDQmxvY2tzKDMwLCBuZXcgRUNCKDQyLCAxNSksIG5ldyBFQ0IoMzIsIDE2KSkpLFxuXHRuZXcgVmVyc2lvbigzOSwgbmV3IEFycmF5KDYsIDI2LCA1NCwgODIsIDExMCwgMTM4LCAxNjYpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMjAsIDExNyksIG5ldyBFQ0IoNCwgMTE4KSksIG5ldyBFQ0Jsb2NrcygyOCwgbmV3IEVDQig0MCwgNDcpLCBuZXcgRUNCKDcsIDQ4KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQig0MywgMjQpLCBuZXcgRUNCKDIyLCAyNSkpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMTAsIDE1KSwgbmV3IEVDQig2NywgMTYpKSksXG5cdG5ldyBWZXJzaW9uKDQwLCBuZXcgQXJyYXkoNiwgMzAsIDU4LCA4NiwgMTE0LCAxNDIsIDE3MCksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigxOSwgMTE4KSwgbmV3IEVDQig2LCAxMTkpKSwgbmV3IEVDQmxvY2tzKDI4LCBuZXcgRUNCKDE4LCA0NyksIG5ldyBFQ0IoMzEsIDQ4KSksIG5ldyBFQ0Jsb2NrcygzMCwgbmV3IEVDQigzNCwgMjQpLCBuZXcgRUNCKDM0LCAyNSkpLCBuZXcgRUNCbG9ja3MoMzAsIG5ldyBFQ0IoMjAsIDE1KSwgbmV3IEVDQig2MSwgMTYpKSkpO1xufVxuXG4vKlxuICBQb3J0ZWQgdG8gSmF2YVNjcmlwdCBieSBMYXphciBMYXN6bG8gMjAxMVxuXG4gIGxhemFyc29mdEBnbWFpbC5jb20sIHd3dy5sYXphcnNvZnQuaW5mb1xuXG4qL1xuXG4vKlxuKlxuKiBDb3B5cmlnaHQgMjAwNyBaWGluZyBhdXRob3JzXG4qXG4qIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4qIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4qXG4qICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4qXG4qIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cblxuZnVuY3Rpb24gUGVyc3BlY3RpdmVUcmFuc2Zvcm0oIGExMSwgIGEyMSwgIGEzMSwgIGExMiwgIGEyMiwgIGEzMiwgIGExMywgIGEyMywgIGEzMylcbntcblx0dGhpcy5hMTEgPSBhMTE7XG5cdHRoaXMuYTEyID0gYTEyO1xuXHR0aGlzLmExMyA9IGExMztcblx0dGhpcy5hMjEgPSBhMjE7XG5cdHRoaXMuYTIyID0gYTIyO1xuXHR0aGlzLmEyMyA9IGEyMztcblx0dGhpcy5hMzEgPSBhMzE7XG5cdHRoaXMuYTMyID0gYTMyO1xuXHR0aGlzLmEzMyA9IGEzMztcblx0dGhpcy50cmFuc2Zvcm1Qb2ludHMxPWZ1bmN0aW9uKCBwb2ludHMpXG5cdFx0e1xuXHRcdFx0dmFyIG1heCA9IHBvaW50cy5sZW5ndGg7XG5cdFx0XHR2YXIgYTExID0gdGhpcy5hMTE7XG5cdFx0XHR2YXIgYTEyID0gdGhpcy5hMTI7XG5cdFx0XHR2YXIgYTEzID0gdGhpcy5hMTM7XG5cdFx0XHR2YXIgYTIxID0gdGhpcy5hMjE7XG5cdFx0XHR2YXIgYTIyID0gdGhpcy5hMjI7XG5cdFx0XHR2YXIgYTIzID0gdGhpcy5hMjM7XG5cdFx0XHR2YXIgYTMxID0gdGhpcy5hMzE7XG5cdFx0XHR2YXIgYTMyID0gdGhpcy5hMzI7XG5cdFx0XHR2YXIgYTMzID0gdGhpcy5hMzM7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1heDsgaSArPSAyKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgeCA9IHBvaW50c1tpXTtcblx0XHRcdFx0dmFyIHkgPSBwb2ludHNbaSArIDFdO1xuXHRcdFx0XHR2YXIgZGVub21pbmF0b3IgPSBhMTMgKiB4ICsgYTIzICogeSArIGEzMztcblx0XHRcdFx0cG9pbnRzW2ldID0gKGExMSAqIHggKyBhMjEgKiB5ICsgYTMxKSAvIGRlbm9taW5hdG9yO1xuXHRcdFx0XHRwb2ludHNbaSArIDFdID0gKGExMiAqIHggKyBhMjIgKiB5ICsgYTMyKSAvIGRlbm9taW5hdG9yO1xuXHRcdFx0fVxuXHRcdH1cblx0dGhpcy4gdHJhbnNmb3JtUG9pbnRzMj1mdW5jdGlvbih4VmFsdWVzLCB5VmFsdWVzKVxuXHRcdHtcblx0XHRcdHZhciBuID0geFZhbHVlcy5sZW5ndGg7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG47IGkrKylcblx0XHRcdHtcblx0XHRcdFx0dmFyIHggPSB4VmFsdWVzW2ldO1xuXHRcdFx0XHR2YXIgeSA9IHlWYWx1ZXNbaV07XG5cdFx0XHRcdHZhciBkZW5vbWluYXRvciA9IHRoaXMuYTEzICogeCArIHRoaXMuYTIzICogeSArIHRoaXMuYTMzO1xuXHRcdFx0XHR4VmFsdWVzW2ldID0gKHRoaXMuYTExICogeCArIHRoaXMuYTIxICogeSArIHRoaXMuYTMxKSAvIGRlbm9taW5hdG9yO1xuXHRcdFx0XHR5VmFsdWVzW2ldID0gKHRoaXMuYTEyICogeCArIHRoaXMuYTIyICogeSArIHRoaXMuYTMyKSAvIGRlbm9taW5hdG9yO1xuXHRcdFx0fVxuXHRcdH1cblxuXHR0aGlzLmJ1aWxkQWRqb2ludD1mdW5jdGlvbigpXG5cdFx0e1xuXHRcdFx0Ly8gQWRqb2ludCBpcyB0aGUgdHJhbnNwb3NlIG9mIHRoZSBjb2ZhY3RvciBtYXRyaXg6XG5cdFx0XHRyZXR1cm4gbmV3IFBlcnNwZWN0aXZlVHJhbnNmb3JtKHRoaXMuYTIyICogdGhpcy5hMzMgLSB0aGlzLmEyMyAqIHRoaXMuYTMyLCB0aGlzLmEyMyAqIHRoaXMuYTMxIC0gdGhpcy5hMjEgKiB0aGlzLmEzMywgdGhpcy5hMjEgKiB0aGlzLmEzMiAtIHRoaXMuYTIyICogdGhpcy5hMzEsIHRoaXMuYTEzICogdGhpcy5hMzIgLSB0aGlzLmExMiAqIHRoaXMuYTMzLCB0aGlzLmExMSAqIHRoaXMuYTMzIC0gdGhpcy5hMTMgKiB0aGlzLmEzMSwgdGhpcy5hMTIgKiB0aGlzLmEzMSAtIHRoaXMuYTExICogdGhpcy5hMzIsIHRoaXMuYTEyICogdGhpcy5hMjMgLSB0aGlzLmExMyAqIHRoaXMuYTIyLCB0aGlzLmExMyAqIHRoaXMuYTIxIC0gdGhpcy5hMTEgKiB0aGlzLmEyMywgdGhpcy5hMTEgKiB0aGlzLmEyMiAtIHRoaXMuYTEyICogdGhpcy5hMjEpO1xuXHRcdH1cblx0dGhpcy50aW1lcz1mdW5jdGlvbiggb3RoZXIpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIG5ldyBQZXJzcGVjdGl2ZVRyYW5zZm9ybSh0aGlzLmExMSAqIG90aGVyLmExMSArIHRoaXMuYTIxICogb3RoZXIuYTEyICsgdGhpcy5hMzEgKiBvdGhlci5hMTMsIHRoaXMuYTExICogb3RoZXIuYTIxICsgdGhpcy5hMjEgKiBvdGhlci5hMjIgKyB0aGlzLmEzMSAqIG90aGVyLmEyMywgdGhpcy5hMTEgKiBvdGhlci5hMzEgKyB0aGlzLmEyMSAqIG90aGVyLmEzMiArIHRoaXMuYTMxICogb3RoZXIuYTMzLCB0aGlzLmExMiAqIG90aGVyLmExMSArIHRoaXMuYTIyICogb3RoZXIuYTEyICsgdGhpcy5hMzIgKiBvdGhlci5hMTMsIHRoaXMuYTEyICogb3RoZXIuYTIxICsgdGhpcy5hMjIgKiBvdGhlci5hMjIgKyB0aGlzLmEzMiAqIG90aGVyLmEyMywgdGhpcy5hMTIgKiBvdGhlci5hMzEgKyB0aGlzLmEyMiAqIG90aGVyLmEzMiArIHRoaXMuYTMyICogb3RoZXIuYTMzLCB0aGlzLmExMyAqIG90aGVyLmExMSArIHRoaXMuYTIzICogb3RoZXIuYTEyICt0aGlzLmEzMyAqIG90aGVyLmExMywgdGhpcy5hMTMgKiBvdGhlci5hMjEgKyB0aGlzLmEyMyAqIG90aGVyLmEyMiArIHRoaXMuYTMzICogb3RoZXIuYTIzLCB0aGlzLmExMyAqIG90aGVyLmEzMSArIHRoaXMuYTIzICogb3RoZXIuYTMyICsgdGhpcy5hMzMgKiBvdGhlci5hMzMpO1xuXHRcdH1cblxufVxuXG5QZXJzcGVjdGl2ZVRyYW5zZm9ybS5xdWFkcmlsYXRlcmFsVG9RdWFkcmlsYXRlcmFsPWZ1bmN0aW9uKCB4MCwgIHkwLCAgeDEsICB5MSwgIHgyLCAgeTIsICB4MywgIHkzLCAgeDBwLCAgeTBwLCAgeDFwLCAgeTFwLCAgeDJwLCAgeTJwLCAgeDNwLCAgeTNwKVxue1xuXG5cdHZhciBxVG9TID0gdGhpcy5xdWFkcmlsYXRlcmFsVG9TcXVhcmUoeDAsIHkwLCB4MSwgeTEsIHgyLCB5MiwgeDMsIHkzKTtcblx0dmFyIHNUb1EgPSB0aGlzLnNxdWFyZVRvUXVhZHJpbGF0ZXJhbCh4MHAsIHkwcCwgeDFwLCB5MXAsIHgycCwgeTJwLCB4M3AsIHkzcCk7XG5cdHJldHVybiBzVG9RLnRpbWVzKHFUb1MpO1xufVxuXG5QZXJzcGVjdGl2ZVRyYW5zZm9ybS5zcXVhcmVUb1F1YWRyaWxhdGVyYWw9ZnVuY3Rpb24oIHgwLCAgeTAsICB4MSwgIHkxLCAgeDIsICB5MiwgIHgzLCAgeTMpXG57XG5cdCBkeTIgPSB5MyAtIHkyO1xuXHQgZHkzID0geTAgLSB5MSArIHkyIC0geTM7XG5cdGlmIChkeTIgPT0gMC4wICYmIGR5MyA9PSAwLjApXG5cdHtcblx0XHRyZXR1cm4gbmV3IFBlcnNwZWN0aXZlVHJhbnNmb3JtKHgxIC0geDAsIHgyIC0geDEsIHgwLCB5MSAtIHkwLCB5MiAtIHkxLCB5MCwgMC4wLCAwLjAsIDEuMCk7XG5cdH1cblx0ZWxzZVxuXHR7XG5cdFx0IGR4MSA9IHgxIC0geDI7XG5cdFx0IGR4MiA9IHgzIC0geDI7XG5cdFx0IGR4MyA9IHgwIC0geDEgKyB4MiAtIHgzO1xuXHRcdCBkeTEgPSB5MSAtIHkyO1xuXHRcdCBkZW5vbWluYXRvciA9IGR4MSAqIGR5MiAtIGR4MiAqIGR5MTtcblx0XHQgYTEzID0gKGR4MyAqIGR5MiAtIGR4MiAqIGR5MykgLyBkZW5vbWluYXRvcjtcblx0XHQgYTIzID0gKGR4MSAqIGR5MyAtIGR4MyAqIGR5MSkgLyBkZW5vbWluYXRvcjtcblx0XHRyZXR1cm4gbmV3IFBlcnNwZWN0aXZlVHJhbnNmb3JtKHgxIC0geDAgKyBhMTMgKiB4MSwgeDMgLSB4MCArIGEyMyAqIHgzLCB4MCwgeTEgLSB5MCArIGExMyAqIHkxLCB5MyAtIHkwICsgYTIzICogeTMsIHkwLCBhMTMsIGEyMywgMS4wKTtcblx0fVxufVxuXG5QZXJzcGVjdGl2ZVRyYW5zZm9ybS5xdWFkcmlsYXRlcmFsVG9TcXVhcmU9ZnVuY3Rpb24oIHgwLCAgeTAsICB4MSwgIHkxLCAgeDIsICB5MiwgIHgzLCAgeTMpXG57XG5cdC8vIEhlcmUsIHRoZSBhZGpvaW50IHNlcnZlcyBhcyB0aGUgaW52ZXJzZTpcblx0cmV0dXJuIHRoaXMuc3F1YXJlVG9RdWFkcmlsYXRlcmFsKHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIsIHgzLCB5MykuYnVpbGRBZGpvaW50KCk7XG59XG5cbmZ1bmN0aW9uIERldGVjdG9yUmVzdWx0KGJpdHMsICBwb2ludHMpXG57XG5cdHRoaXMuYml0cyA9IGJpdHM7XG5cdHRoaXMucG9pbnRzID0gcG9pbnRzO1xufVxuXG5cbmZ1bmN0aW9uIERldGVjdG9yKGltYWdlKVxue1xuXHR0aGlzLmltYWdlPWltYWdlO1xuXHR0aGlzLnJlc3VsdFBvaW50Q2FsbGJhY2sgPSBudWxsO1xuXG5cdHRoaXMuc2l6ZU9mQmxhY2tXaGl0ZUJsYWNrUnVuPWZ1bmN0aW9uKCBmcm9tWCwgIGZyb21ZLCAgdG9YLCAgdG9ZKVxuXHRcdHtcblx0XHRcdC8vIE1pbGQgdmFyaWFudCBvZiBCcmVzZW5oYW0ncyBhbGdvcml0aG07XG5cdFx0XHQvLyBzZWUgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9CcmVzZW5oYW0nc19saW5lX2FsZ29yaXRobVxuXHRcdFx0dmFyIHN0ZWVwID0gTWF0aC5hYnModG9ZIC0gZnJvbVkpID4gTWF0aC5hYnModG9YIC0gZnJvbVgpO1xuXHRcdFx0aWYgKHN0ZWVwKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgdGVtcCA9IGZyb21YO1xuXHRcdFx0XHRmcm9tWCA9IGZyb21ZO1xuXHRcdFx0XHRmcm9tWSA9IHRlbXA7XG5cdFx0XHRcdHRlbXAgPSB0b1g7XG5cdFx0XHRcdHRvWCA9IHRvWTtcblx0XHRcdFx0dG9ZID0gdGVtcDtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGR4ID0gTWF0aC5hYnModG9YIC0gZnJvbVgpO1xuXHRcdFx0dmFyIGR5ID0gTWF0aC5hYnModG9ZIC0gZnJvbVkpO1xuXHRcdFx0dmFyIGVycm9yID0gLSBkeCA+PiAxO1xuXHRcdFx0dmFyIHlzdGVwID0gZnJvbVkgPCB0b1k/MTotIDE7XG5cdFx0XHR2YXIgeHN0ZXAgPSBmcm9tWCA8IHRvWD8xOi0gMTtcblx0XHRcdHZhciBzdGF0ZSA9IDA7IC8vIEluIGJsYWNrIHBpeGVscywgbG9va2luZyBmb3Igd2hpdGUsIGZpcnN0IG9yIHNlY29uZCB0aW1lXG5cdFx0XHRmb3IgKHZhciB4ID0gZnJvbVgsIHkgPSBmcm9tWTsgeCAhPSB0b1g7IHggKz0geHN0ZXApXG5cdFx0XHR7XG5cblx0XHRcdFx0dmFyIHJlYWxYID0gc3RlZXA/eTp4O1xuXHRcdFx0XHR2YXIgcmVhbFkgPSBzdGVlcD94Onk7XG5cdFx0XHRcdGlmIChzdGF0ZSA9PSAxKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gSW4gd2hpdGUgcGl4ZWxzLCBsb29raW5nIGZvciBibGFja1xuXHRcdFx0XHRcdGlmICh0aGlzLmltYWdlLmRhdGFbcmVhbFggKyByZWFsWSppbWFnZS53aWR0aF0pXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0c3RhdGUrKztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKCF0aGlzLmltYWdlLmRhdGFbcmVhbFggKyByZWFsWSppbWFnZS53aWR0aF0pXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0c3RhdGUrKztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoc3RhdGUgPT0gMylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIEZvdW5kIGJsYWNrLCB3aGl0ZSwgYmxhY2ssIGFuZCBzdHVtYmxlZCBiYWNrIG9udG8gd2hpdGU7IGRvbmVcblx0XHRcdFx0XHR2YXIgZGlmZlggPSB4IC0gZnJvbVg7XG5cdFx0XHRcdFx0dmFyIGRpZmZZID0geSAtIGZyb21ZO1xuXHRcdFx0XHRcdHJldHVybiAgTWF0aC5zcXJ0KCAoZGlmZlggKiBkaWZmWCArIGRpZmZZICogZGlmZlkpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlcnJvciArPSBkeTtcblx0XHRcdFx0aWYgKGVycm9yID4gMClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmICh5ID09IHRvWSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0eSArPSB5c3RlcDtcblx0XHRcdFx0XHRlcnJvciAtPSBkeDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dmFyIGRpZmZYMiA9IHRvWCAtIGZyb21YO1xuXHRcdFx0dmFyIGRpZmZZMiA9IHRvWSAtIGZyb21ZO1xuXHRcdFx0cmV0dXJuICBNYXRoLnNxcnQoIChkaWZmWDIgKiBkaWZmWDIgKyBkaWZmWTIgKiBkaWZmWTIpKTtcblx0XHR9XG5cblxuXHR0aGlzLnNpemVPZkJsYWNrV2hpdGVCbGFja1J1bkJvdGhXYXlzPWZ1bmN0aW9uKCBmcm9tWCwgIGZyb21ZLCAgdG9YLCAgdG9ZKVxuXHRcdHtcblxuXHRcdFx0dmFyIHJlc3VsdCA9IHRoaXMuc2l6ZU9mQmxhY2tXaGl0ZUJsYWNrUnVuKGZyb21YLCBmcm9tWSwgdG9YLCB0b1kpO1xuXG5cdFx0XHQvLyBOb3cgY291bnQgb3RoZXIgd2F5IC0tIGRvbid0IHJ1biBvZmYgaW1hZ2UgdGhvdWdoIG9mIGNvdXJzZVxuXHRcdFx0dmFyIHNjYWxlID0gMS4wO1xuXHRcdFx0dmFyIG90aGVyVG9YID0gZnJvbVggLSAodG9YIC0gZnJvbVgpO1xuXHRcdFx0aWYgKG90aGVyVG9YIDwgMClcblx0XHRcdHtcblx0XHRcdFx0c2NhbGUgPSAgZnJvbVggLyAgKGZyb21YIC0gb3RoZXJUb1gpO1xuXHRcdFx0XHRvdGhlclRvWCA9IDA7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChvdGhlclRvWCA+PSBpbWFnZS53aWR0aClcblx0XHRcdHtcblx0XHRcdFx0c2NhbGUgPSAgKGltYWdlLndpZHRoIC0gMSAtIGZyb21YKSAvICAob3RoZXJUb1ggLSBmcm9tWCk7XG5cdFx0XHRcdG90aGVyVG9YID0gaW1hZ2Uud2lkdGggLSAxO1xuXHRcdFx0fVxuXHRcdFx0dmFyIG90aGVyVG9ZID0gTWF0aC5mbG9vciAoZnJvbVkgLSAodG9ZIC0gZnJvbVkpICogc2NhbGUpO1xuXG5cdFx0XHRzY2FsZSA9IDEuMDtcblx0XHRcdGlmIChvdGhlclRvWSA8IDApXG5cdFx0XHR7XG5cdFx0XHRcdHNjYWxlID0gIGZyb21ZIC8gIChmcm9tWSAtIG90aGVyVG9ZKTtcblx0XHRcdFx0b3RoZXJUb1kgPSAwO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAob3RoZXJUb1kgPj0gaW1hZ2UuaGVpZ2h0KVxuXHRcdFx0e1xuXHRcdFx0XHRzY2FsZSA9ICAoaW1hZ2UuaGVpZ2h0IC0gMSAtIGZyb21ZKSAvICAob3RoZXJUb1kgLSBmcm9tWSk7XG5cdFx0XHRcdG90aGVyVG9ZID0gaW1hZ2UuaGVpZ2h0IC0gMTtcblx0XHRcdH1cblx0XHRcdG90aGVyVG9YID0gTWF0aC5mbG9vciAoZnJvbVggKyAob3RoZXJUb1ggLSBmcm9tWCkgKiBzY2FsZSk7XG5cblx0XHRcdHJlc3VsdCArPSB0aGlzLnNpemVPZkJsYWNrV2hpdGVCbGFja1J1bihmcm9tWCwgZnJvbVksIG90aGVyVG9YLCBvdGhlclRvWSk7XG5cdFx0XHRyZXR1cm4gcmVzdWx0IC0gMS4wOyAvLyAtMSBiZWNhdXNlIHdlIGNvdW50ZWQgdGhlIG1pZGRsZSBwaXhlbCB0d2ljZVxuXHRcdH1cblxuXG5cblx0dGhpcy5jYWxjdWxhdGVNb2R1bGVTaXplT25lV2F5PWZ1bmN0aW9uKCBwYXR0ZXJuLCAgb3RoZXJQYXR0ZXJuKVxuXHRcdHtcblx0XHRcdHZhciBtb2R1bGVTaXplRXN0MSA9IHRoaXMuc2l6ZU9mQmxhY2tXaGl0ZUJsYWNrUnVuQm90aFdheXMoTWF0aC5mbG9vciggcGF0dGVybi5YKSwgTWF0aC5mbG9vciggcGF0dGVybi5ZKSwgTWF0aC5mbG9vciggb3RoZXJQYXR0ZXJuLlgpLCBNYXRoLmZsb29yKG90aGVyUGF0dGVybi5ZKSk7XG5cdFx0XHR2YXIgbW9kdWxlU2l6ZUVzdDIgPSB0aGlzLnNpemVPZkJsYWNrV2hpdGVCbGFja1J1bkJvdGhXYXlzKE1hdGguZmxvb3Iob3RoZXJQYXR0ZXJuLlgpLCBNYXRoLmZsb29yKG90aGVyUGF0dGVybi5ZKSwgTWF0aC5mbG9vciggcGF0dGVybi5YKSwgTWF0aC5mbG9vcihwYXR0ZXJuLlkpKTtcblx0XHRcdGlmIChpc05hTihtb2R1bGVTaXplRXN0MSkpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBtb2R1bGVTaXplRXN0MiAvIDcuMDtcblx0XHRcdH1cblx0XHRcdGlmIChpc05hTihtb2R1bGVTaXplRXN0MikpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBtb2R1bGVTaXplRXN0MSAvIDcuMDtcblx0XHRcdH1cblx0XHRcdC8vIEF2ZXJhZ2UgdGhlbSwgYW5kIGRpdmlkZSBieSA3IHNpbmNlIHdlJ3ZlIGNvdW50ZWQgdGhlIHdpZHRoIG9mIDMgYmxhY2sgbW9kdWxlcyxcblx0XHRcdC8vIGFuZCAxIHdoaXRlIGFuZCAxIGJsYWNrIG1vZHVsZSBvbiBlaXRoZXIgc2lkZS4gRXJnbywgZGl2aWRlIHN1bSBieSAxNC5cblx0XHRcdHJldHVybiAobW9kdWxlU2l6ZUVzdDEgKyBtb2R1bGVTaXplRXN0MikgLyAxNC4wO1xuXHRcdH1cblxuXG5cdHRoaXMuY2FsY3VsYXRlTW9kdWxlU2l6ZT1mdW5jdGlvbiggdG9wTGVmdCwgIHRvcFJpZ2h0LCAgYm90dG9tTGVmdClcblx0XHR7XG5cdFx0XHQvLyBUYWtlIHRoZSBhdmVyYWdlXG5cdFx0XHRyZXR1cm4gKHRoaXMuY2FsY3VsYXRlTW9kdWxlU2l6ZU9uZVdheSh0b3BMZWZ0LCB0b3BSaWdodCkgKyB0aGlzLmNhbGN1bGF0ZU1vZHVsZVNpemVPbmVXYXkodG9wTGVmdCwgYm90dG9tTGVmdCkpIC8gMi4wO1xuXHRcdH1cblxuXHR0aGlzLmRpc3RhbmNlPWZ1bmN0aW9uKCBwYXR0ZXJuMSwgIHBhdHRlcm4yKVxuXHR7XG5cdFx0eERpZmYgPSBwYXR0ZXJuMS5YIC0gcGF0dGVybjIuWDtcblx0XHR5RGlmZiA9IHBhdHRlcm4xLlkgLSBwYXR0ZXJuMi5ZO1xuXHRcdHJldHVybiAgTWF0aC5zcXJ0KCAoeERpZmYgKiB4RGlmZiArIHlEaWZmICogeURpZmYpKTtcblx0fVxuXHR0aGlzLmNvbXB1dGVEaW1lbnNpb249ZnVuY3Rpb24oIHRvcExlZnQsICB0b3BSaWdodCwgIGJvdHRvbUxlZnQsICBtb2R1bGVTaXplKVxuXHRcdHtcblxuXHRcdFx0dmFyIHRsdHJDZW50ZXJzRGltZW5zaW9uID0gTWF0aC5yb3VuZCh0aGlzLmRpc3RhbmNlKHRvcExlZnQsIHRvcFJpZ2h0KSAvIG1vZHVsZVNpemUpO1xuXHRcdFx0dmFyIHRsYmxDZW50ZXJzRGltZW5zaW9uID0gTWF0aC5yb3VuZCh0aGlzLmRpc3RhbmNlKHRvcExlZnQsIGJvdHRvbUxlZnQpIC8gbW9kdWxlU2l6ZSk7XG5cdFx0XHR2YXIgZGltZW5zaW9uID0gKCh0bHRyQ2VudGVyc0RpbWVuc2lvbiArIHRsYmxDZW50ZXJzRGltZW5zaW9uKSA+PiAxKSArIDc7XG5cdFx0XHRzd2l0Y2ggKGRpbWVuc2lvbiAmIDB4MDMpXG5cdFx0XHR7XG5cblx0XHRcdFx0Ly8gbW9kIDRcblx0XHRcdFx0Y2FzZSAwOlxuXHRcdFx0XHRcdGRpbWVuc2lvbisrO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdC8vIDE/IGRvIG5vdGhpbmdcblxuXHRcdFx0XHRjYXNlIDI6XG5cdFx0XHRcdFx0ZGltZW5zaW9uLS07XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSAzOlxuXHRcdFx0XHRcdHRocm93IFwiRXJyb3JcIjtcblx0XHRcdFx0fVxuXHRcdFx0cmV0dXJuIGRpbWVuc2lvbjtcblx0XHR9XG5cblx0dGhpcy5maW5kQWxpZ25tZW50SW5SZWdpb249ZnVuY3Rpb24oIG92ZXJhbGxFc3RNb2R1bGVTaXplLCAgZXN0QWxpZ25tZW50WCwgIGVzdEFsaWdubWVudFksICBhbGxvd2FuY2VGYWN0b3IpXG5cdFx0e1xuXHRcdFx0Ly8gTG9vayBmb3IgYW4gYWxpZ25tZW50IHBhdHRlcm4gKDMgbW9kdWxlcyBpbiBzaXplKSBhcm91bmQgd2hlcmUgaXRcblx0XHRcdC8vIHNob3VsZCBiZVxuXHRcdFx0dmFyIGFsbG93YW5jZSA9IE1hdGguZmxvb3IgKGFsbG93YW5jZUZhY3RvciAqIG92ZXJhbGxFc3RNb2R1bGVTaXplKTtcblx0XHRcdHZhciBhbGlnbm1lbnRBcmVhTGVmdFggPSBNYXRoLm1heCgwLCBlc3RBbGlnbm1lbnRYIC0gYWxsb3dhbmNlKTtcblx0XHRcdHZhciBhbGlnbm1lbnRBcmVhUmlnaHRYID0gTWF0aC5taW4oaW1hZ2Uud2lkdGggLSAxLCBlc3RBbGlnbm1lbnRYICsgYWxsb3dhbmNlKTtcblx0XHRcdGlmIChhbGlnbm1lbnRBcmVhUmlnaHRYIC0gYWxpZ25tZW50QXJlYUxlZnRYIDwgb3ZlcmFsbEVzdE1vZHVsZVNpemUgKiAzKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBcIkVycm9yXCI7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBhbGlnbm1lbnRBcmVhVG9wWSA9IE1hdGgubWF4KDAsIGVzdEFsaWdubWVudFkgLSBhbGxvd2FuY2UpO1xuXHRcdFx0dmFyIGFsaWdubWVudEFyZWFCb3R0b21ZID0gTWF0aC5taW4oaW1hZ2UuaGVpZ2h0IC0gMSwgZXN0QWxpZ25tZW50WSArIGFsbG93YW5jZSk7XG5cblx0XHRcdHZhciBhbGlnbm1lbnRGaW5kZXIgPSBuZXcgQWxpZ25tZW50UGF0dGVybkZpbmRlcih0aGlzLmltYWdlLCBhbGlnbm1lbnRBcmVhTGVmdFgsIGFsaWdubWVudEFyZWFUb3BZLCBhbGlnbm1lbnRBcmVhUmlnaHRYIC0gYWxpZ25tZW50QXJlYUxlZnRYLCBhbGlnbm1lbnRBcmVhQm90dG9tWSAtIGFsaWdubWVudEFyZWFUb3BZLCBvdmVyYWxsRXN0TW9kdWxlU2l6ZSwgdGhpcy5yZXN1bHRQb2ludENhbGxiYWNrKTtcblx0XHRcdHJldHVybiBhbGlnbm1lbnRGaW5kZXIuZmluZCgpO1xuXHRcdH1cblxuXHR0aGlzLmNyZWF0ZVRyYW5zZm9ybT1mdW5jdGlvbiggdG9wTGVmdCwgIHRvcFJpZ2h0LCAgYm90dG9tTGVmdCwgYWxpZ25tZW50UGF0dGVybiwgZGltZW5zaW9uKVxuXHRcdHtcblx0XHRcdHZhciBkaW1NaW51c1RocmVlID0gIGRpbWVuc2lvbiAtIDMuNTtcblx0XHRcdHZhciBib3R0b21SaWdodFg7XG5cdFx0XHR2YXIgYm90dG9tUmlnaHRZO1xuXHRcdFx0dmFyIHNvdXJjZUJvdHRvbVJpZ2h0WDtcblx0XHRcdHZhciBzb3VyY2VCb3R0b21SaWdodFk7XG5cdFx0XHRpZiAoYWxpZ25tZW50UGF0dGVybiAhPSBudWxsKVxuXHRcdFx0e1xuXHRcdFx0XHRib3R0b21SaWdodFggPSBhbGlnbm1lbnRQYXR0ZXJuLlg7XG5cdFx0XHRcdGJvdHRvbVJpZ2h0WSA9IGFsaWdubWVudFBhdHRlcm4uWTtcblx0XHRcdFx0c291cmNlQm90dG9tUmlnaHRYID0gc291cmNlQm90dG9tUmlnaHRZID0gZGltTWludXNUaHJlZSAtIDMuMDtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0Ly8gRG9uJ3QgaGF2ZSBhbiBhbGlnbm1lbnQgcGF0dGVybiwganVzdCBtYWtlIHVwIHRoZSBib3R0b20tcmlnaHQgcG9pbnRcblx0XHRcdFx0Ym90dG9tUmlnaHRYID0gKHRvcFJpZ2h0LlggLSB0b3BMZWZ0LlgpICsgYm90dG9tTGVmdC5YO1xuXHRcdFx0XHRib3R0b21SaWdodFkgPSAodG9wUmlnaHQuWSAtIHRvcExlZnQuWSkgKyBib3R0b21MZWZ0Llk7XG5cdFx0XHRcdHNvdXJjZUJvdHRvbVJpZ2h0WCA9IHNvdXJjZUJvdHRvbVJpZ2h0WSA9IGRpbU1pbnVzVGhyZWU7XG5cdFx0XHR9XG5cblx0XHRcdHZhciB0cmFuc2Zvcm0gPSBQZXJzcGVjdGl2ZVRyYW5zZm9ybS5xdWFkcmlsYXRlcmFsVG9RdWFkcmlsYXRlcmFsKDMuNSwgMy41LCBkaW1NaW51c1RocmVlLCAzLjUsIHNvdXJjZUJvdHRvbVJpZ2h0WCwgc291cmNlQm90dG9tUmlnaHRZLCAzLjUsIGRpbU1pbnVzVGhyZWUsIHRvcExlZnQuWCwgdG9wTGVmdC5ZLCB0b3BSaWdodC5YLCB0b3BSaWdodC5ZLCBib3R0b21SaWdodFgsIGJvdHRvbVJpZ2h0WSwgYm90dG9tTGVmdC5YLCBib3R0b21MZWZ0LlkpO1xuXG5cdFx0XHRyZXR1cm4gdHJhbnNmb3JtO1xuXHRcdH1cblxuXHR0aGlzLnNhbXBsZUdyaWQ9ZnVuY3Rpb24oIGltYWdlLCAgdHJhbnNmb3JtLCAgZGltZW5zaW9uKVxuXHRcdHtcblxuXHRcdFx0dmFyIHNhbXBsZXIgPSBHcmlkU2FtcGxlcjtcblx0XHRcdHJldHVybiBzYW1wbGVyLnNhbXBsZUdyaWQzKGltYWdlLCBkaW1lbnNpb24sIHRyYW5zZm9ybSk7XG5cdFx0fVxuXG5cdHRoaXMucHJvY2Vzc0ZpbmRlclBhdHRlcm5JbmZvID0gZnVuY3Rpb24oIGluZm8pXG5cdFx0e1xuXG5cdFx0XHR2YXIgdG9wTGVmdCA9IGluZm8uVG9wTGVmdDtcblx0XHRcdHZhciB0b3BSaWdodCA9IGluZm8uVG9wUmlnaHQ7XG5cdFx0XHR2YXIgYm90dG9tTGVmdCA9IGluZm8uQm90dG9tTGVmdDtcblxuXHRcdFx0dmFyIG1vZHVsZVNpemUgPSB0aGlzLmNhbGN1bGF0ZU1vZHVsZVNpemUodG9wTGVmdCwgdG9wUmlnaHQsIGJvdHRvbUxlZnQpO1xuXHRcdFx0aWYgKG1vZHVsZVNpemUgPCAxLjApXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IFwiRXJyb3JcIjtcblx0XHRcdH1cblx0XHRcdHZhciBkaW1lbnNpb24gPSB0aGlzLmNvbXB1dGVEaW1lbnNpb24odG9wTGVmdCwgdG9wUmlnaHQsIGJvdHRvbUxlZnQsIG1vZHVsZVNpemUpO1xuXHRcdFx0dmFyIHByb3Zpc2lvbmFsVmVyc2lvbiA9IFZlcnNpb24uZ2V0UHJvdmlzaW9uYWxWZXJzaW9uRm9yRGltZW5zaW9uKGRpbWVuc2lvbik7XG5cdFx0XHR2YXIgbW9kdWxlc0JldHdlZW5GUENlbnRlcnMgPSBwcm92aXNpb25hbFZlcnNpb24uRGltZW5zaW9uRm9yVmVyc2lvbiAtIDc7XG5cblx0XHRcdHZhciBhbGlnbm1lbnRQYXR0ZXJuID0gbnVsbDtcblx0XHRcdC8vIEFueXRoaW5nIGFib3ZlIHZlcnNpb24gMSBoYXMgYW4gYWxpZ25tZW50IHBhdHRlcm5cblx0XHRcdGlmIChwcm92aXNpb25hbFZlcnNpb24uQWxpZ25tZW50UGF0dGVybkNlbnRlcnMubGVuZ3RoID4gMClcblx0XHRcdHtcblxuXHRcdFx0XHQvLyBHdWVzcyB3aGVyZSBhIFwiYm90dG9tIHJpZ2h0XCIgZmluZGVyIHBhdHRlcm4gd291bGQgaGF2ZSBiZWVuXG5cdFx0XHRcdHZhciBib3R0b21SaWdodFggPSB0b3BSaWdodC5YIC0gdG9wTGVmdC5YICsgYm90dG9tTGVmdC5YO1xuXHRcdFx0XHR2YXIgYm90dG9tUmlnaHRZID0gdG9wUmlnaHQuWSAtIHRvcExlZnQuWSArIGJvdHRvbUxlZnQuWTtcblxuXHRcdFx0XHQvLyBFc3RpbWF0ZSB0aGF0IGFsaWdubWVudCBwYXR0ZXJuIGlzIGNsb3NlciBieSAzIG1vZHVsZXNcblx0XHRcdFx0Ly8gZnJvbSBcImJvdHRvbSByaWdodFwiIHRvIGtub3duIHRvcCBsZWZ0IGxvY2F0aW9uXG5cdFx0XHRcdHZhciBjb3JyZWN0aW9uVG9Ub3BMZWZ0ID0gMS4wIC0gMy4wIC8gIG1vZHVsZXNCZXR3ZWVuRlBDZW50ZXJzO1xuXHRcdFx0XHR2YXIgZXN0QWxpZ25tZW50WCA9IE1hdGguZmxvb3IgKHRvcExlZnQuWCArIGNvcnJlY3Rpb25Ub1RvcExlZnQgKiAoYm90dG9tUmlnaHRYIC0gdG9wTGVmdC5YKSk7XG5cdFx0XHRcdHZhciBlc3RBbGlnbm1lbnRZID0gTWF0aC5mbG9vciAodG9wTGVmdC5ZICsgY29ycmVjdGlvblRvVG9wTGVmdCAqIChib3R0b21SaWdodFkgLSB0b3BMZWZ0LlkpKTtcblxuXHRcdFx0XHQvLyBLaW5kIG9mIGFyYml0cmFyeSAtLSBleHBhbmQgc2VhcmNoIHJhZGl1cyBiZWZvcmUgZ2l2aW5nIHVwXG5cdFx0XHRcdGZvciAodmFyIGkgPSA0OyBpIDw9IDE2OyBpIDw8PSAxKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly90cnlcblx0XHRcdFx0XHQvL3tcblx0XHRcdFx0XHRcdGFsaWdubWVudFBhdHRlcm4gPSB0aGlzLmZpbmRBbGlnbm1lbnRJblJlZ2lvbihtb2R1bGVTaXplLCBlc3RBbGlnbm1lbnRYLCBlc3RBbGlnbm1lbnRZLCAgaSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHQvL31cblx0XHRcdFx0XHQvL2NhdGNoIChyZSlcblx0XHRcdFx0XHQvL3tcblx0XHRcdFx0XHRcdC8vIHRyeSBuZXh0IHJvdW5kXG5cdFx0XHRcdFx0Ly99XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gSWYgd2UgZGlkbid0IGZpbmQgYWxpZ25tZW50IHBhdHRlcm4uLi4gd2VsbCB0cnkgYW55d2F5IHdpdGhvdXQgaXRcblx0XHRcdH1cblxuXHRcdFx0dmFyIHRyYW5zZm9ybSA9IHRoaXMuY3JlYXRlVHJhbnNmb3JtKHRvcExlZnQsIHRvcFJpZ2h0LCBib3R0b21MZWZ0LCBhbGlnbm1lbnRQYXR0ZXJuLCBkaW1lbnNpb24pO1xuXG5cdFx0XHR2YXIgYml0cyA9IHRoaXMuc2FtcGxlR3JpZCh0aGlzLmltYWdlLCB0cmFuc2Zvcm0sIGRpbWVuc2lvbik7XG5cblx0XHRcdHZhciBwb2ludHM7XG5cdFx0XHRpZiAoYWxpZ25tZW50UGF0dGVybiA9PSBudWxsKVxuXHRcdFx0e1xuXHRcdFx0XHRwb2ludHMgPSBuZXcgQXJyYXkoYm90dG9tTGVmdCwgdG9wTGVmdCwgdG9wUmlnaHQpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRwb2ludHMgPSBuZXcgQXJyYXkoYm90dG9tTGVmdCwgdG9wTGVmdCwgdG9wUmlnaHQsIGFsaWdubWVudFBhdHRlcm4pO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG5ldyBEZXRlY3RvclJlc3VsdChiaXRzLCBwb2ludHMpO1xuXHRcdH1cblxuXG5cblx0dGhpcy5kZXRlY3Q9ZnVuY3Rpb24oKVxuXHR7XG5cdFx0dmFyIGluZm8gPSAgbmV3IEZpbmRlclBhdHRlcm5GaW5kZXIoKS5maW5kRmluZGVyUGF0dGVybih0aGlzLmltYWdlKTtcblxuXHRcdHJldHVybiB0aGlzLnByb2Nlc3NGaW5kZXJQYXR0ZXJuSW5mbyhpbmZvKTtcblx0fVxufVxuXG4vKlxuICBQb3J0ZWQgdG8gSmF2YVNjcmlwdCBieSBMYXphciBMYXN6bG8gMjAxMVxuXG4gIGxhemFyc29mdEBnbWFpbC5jb20sIHd3dy5sYXphcnNvZnQuaW5mb1xuXG4qL1xuXG4vKlxuKlxuKiBDb3B5cmlnaHQgMjAwNyBaWGluZyBhdXRob3JzXG4qXG4qIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4qIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4qXG4qICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4qXG4qIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cblxudmFyIEZPUk1BVF9JTkZPX01BU0tfUVIgPSAweDU0MTI7XG52YXIgRk9STUFUX0lORk9fREVDT0RFX0xPT0tVUCA9IG5ldyBBcnJheShuZXcgQXJyYXkoMHg1NDEyLCAweDAwKSwgbmV3IEFycmF5KDB4NTEyNSwgMHgwMSksIG5ldyBBcnJheSgweDVFN0MsIDB4MDIpLCBuZXcgQXJyYXkoMHg1QjRCLCAweDAzKSwgbmV3IEFycmF5KDB4NDVGOSwgMHgwNCksIG5ldyBBcnJheSgweDQwQ0UsIDB4MDUpLCBuZXcgQXJyYXkoMHg0Rjk3LCAweDA2KSwgbmV3IEFycmF5KDB4NEFBMCwgMHgwNyksIG5ldyBBcnJheSgweDc3QzQsIDB4MDgpLCBuZXcgQXJyYXkoMHg3MkYzLCAweDA5KSwgbmV3IEFycmF5KDB4N0RBQSwgMHgwQSksIG5ldyBBcnJheSgweDc4OUQsIDB4MEIpLCBuZXcgQXJyYXkoMHg2NjJGLCAweDBDKSwgbmV3IEFycmF5KDB4NjMxOCwgMHgwRCksIG5ldyBBcnJheSgweDZDNDEsIDB4MEUpLCBuZXcgQXJyYXkoMHg2OTc2LCAweDBGKSwgbmV3IEFycmF5KDB4MTY4OSwgMHgxMCksIG5ldyBBcnJheSgweDEzQkUsIDB4MTEpLCBuZXcgQXJyYXkoMHgxQ0U3LCAweDEyKSwgbmV3IEFycmF5KDB4MTlEMCwgMHgxMyksIG5ldyBBcnJheSgweDA3NjIsIDB4MTQpLCBuZXcgQXJyYXkoMHgwMjU1LCAweDE1KSwgbmV3IEFycmF5KDB4MEQwQywgMHgxNiksIG5ldyBBcnJheSgweDA4M0IsIDB4MTcpLCBuZXcgQXJyYXkoMHgzNTVGLCAweDE4KSwgbmV3IEFycmF5KDB4MzA2OCwgMHgxOSksIG5ldyBBcnJheSgweDNGMzEsIDB4MUEpLCBuZXcgQXJyYXkoMHgzQTA2LCAweDFCKSwgbmV3IEFycmF5KDB4MjRCNCwgMHgxQyksIG5ldyBBcnJheSgweDIxODMsIDB4MUQpLCBuZXcgQXJyYXkoMHgyRURBLCAweDFFKSwgbmV3IEFycmF5KDB4MkJFRCwgMHgxRikpO1xudmFyIEJJVFNfU0VUX0lOX0hBTEZfQllURSA9IG5ldyBBcnJheSgwLCAxLCAxLCAyLCAxLCAyLCAyLCAzLCAxLCAyLCAyLCAzLCAyLCAzLCAzLCA0KTtcblxuXG5mdW5jdGlvbiBGb3JtYXRJbmZvcm1hdGlvbihmb3JtYXRJbmZvKVxue1xuXHR0aGlzLmVycm9yQ29ycmVjdGlvbkxldmVsID0gRXJyb3JDb3JyZWN0aW9uTGV2ZWwuZm9yQml0cygoZm9ybWF0SW5mbyA+PiAzKSAmIDB4MDMpO1xuXHR0aGlzLmRhdGFNYXNrID0gIChmb3JtYXRJbmZvICYgMHgwNyk7XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJFcnJvckNvcnJlY3Rpb25MZXZlbFwiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuZXJyb3JDb3JyZWN0aW9uTGV2ZWw7XG5cdH19KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJEYXRhTWFza1wiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuZGF0YU1hc2s7XG5cdH19KTtcblx0dGhpcy5HZXRIYXNoQ29kZT1mdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gKHRoaXMuZXJyb3JDb3JyZWN0aW9uTGV2ZWwub3JkaW5hbCgpIDw8IDMpIHwgIGRhdGFNYXNrO1xuXHR9XG5cdHRoaXMuRXF1YWxzPWZ1bmN0aW9uKCBvKVxuXHR7XG5cdFx0dmFyIG90aGVyID0gIG87XG5cdFx0cmV0dXJuIHRoaXMuZXJyb3JDb3JyZWN0aW9uTGV2ZWwgPT0gb3RoZXIuZXJyb3JDb3JyZWN0aW9uTGV2ZWwgJiYgdGhpcy5kYXRhTWFzayA9PSBvdGhlci5kYXRhTWFzaztcblx0fVxufVxuXG5Gb3JtYXRJbmZvcm1hdGlvbi5udW1CaXRzRGlmZmVyaW5nPWZ1bmN0aW9uKCBhLCAgYilcbntcblx0YSBePSBiOyAvLyBhIG5vdyBoYXMgYSAxIGJpdCBleGFjdGx5IHdoZXJlIGl0cyBiaXQgZGlmZmVycyB3aXRoIGInc1xuXHQvLyBDb3VudCBiaXRzIHNldCBxdWlja2x5IHdpdGggYSBzZXJpZXMgb2YgbG9va3Vwczpcblx0cmV0dXJuIEJJVFNfU0VUX0lOX0hBTEZfQllURVthICYgMHgwRl0gKyBCSVRTX1NFVF9JTl9IQUxGX0JZVEVbKFVSU2hpZnQoYSwgNCkgJiAweDBGKV0gKyBCSVRTX1NFVF9JTl9IQUxGX0JZVEVbKFVSU2hpZnQoYSwgOCkgJiAweDBGKV0gKyBCSVRTX1NFVF9JTl9IQUxGX0JZVEVbKFVSU2hpZnQoYSwgMTIpICYgMHgwRildICsgQklUU19TRVRfSU5fSEFMRl9CWVRFWyhVUlNoaWZ0KGEsIDE2KSAmIDB4MEYpXSArIEJJVFNfU0VUX0lOX0hBTEZfQllURVsoVVJTaGlmdChhLCAyMCkgJiAweDBGKV0gKyBCSVRTX1NFVF9JTl9IQUxGX0JZVEVbKFVSU2hpZnQoYSwgMjQpICYgMHgwRildICsgQklUU19TRVRfSU5fSEFMRl9CWVRFWyhVUlNoaWZ0KGEsIDI4KSAmIDB4MEYpXTtcbn1cblxuRm9ybWF0SW5mb3JtYXRpb24uZGVjb2RlRm9ybWF0SW5mb3JtYXRpb249ZnVuY3Rpb24oIG1hc2tlZEZvcm1hdEluZm8pXG57XG5cdHZhciBmb3JtYXRJbmZvID0gRm9ybWF0SW5mb3JtYXRpb24uZG9EZWNvZGVGb3JtYXRJbmZvcm1hdGlvbihtYXNrZWRGb3JtYXRJbmZvKTtcblx0aWYgKGZvcm1hdEluZm8gIT0gbnVsbClcblx0e1xuXHRcdHJldHVybiBmb3JtYXRJbmZvO1xuXHR9XG5cdC8vIFNob3VsZCByZXR1cm4gbnVsbCwgYnV0LCBzb21lIFFSIGNvZGVzIGFwcGFyZW50bHlcblx0Ly8gZG8gbm90IG1hc2sgdGhpcyBpbmZvLiBUcnkgYWdhaW4gYnkgYWN0dWFsbHkgbWFza2luZyB0aGUgcGF0dGVyblxuXHQvLyBmaXJzdFxuXHRyZXR1cm4gRm9ybWF0SW5mb3JtYXRpb24uZG9EZWNvZGVGb3JtYXRJbmZvcm1hdGlvbihtYXNrZWRGb3JtYXRJbmZvIF4gRk9STUFUX0lORk9fTUFTS19RUik7XG59XG5Gb3JtYXRJbmZvcm1hdGlvbi5kb0RlY29kZUZvcm1hdEluZm9ybWF0aW9uPWZ1bmN0aW9uKCBtYXNrZWRGb3JtYXRJbmZvKVxue1xuXHQvLyBGaW5kIHRoZSBpbnQgaW4gRk9STUFUX0lORk9fREVDT0RFX0xPT0tVUCB3aXRoIGZld2VzdCBiaXRzIGRpZmZlcmluZ1xuXHR2YXIgYmVzdERpZmZlcmVuY2UgPSAweGZmZmZmZmZmO1xuXHR2YXIgYmVzdEZvcm1hdEluZm8gPSAwO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IEZPUk1BVF9JTkZPX0RFQ09ERV9MT09LVVAubGVuZ3RoOyBpKyspXG5cdHtcblx0XHR2YXIgZGVjb2RlSW5mbyA9IEZPUk1BVF9JTkZPX0RFQ09ERV9MT09LVVBbaV07XG5cdFx0dmFyIHRhcmdldEluZm8gPSBkZWNvZGVJbmZvWzBdO1xuXHRcdGlmICh0YXJnZXRJbmZvID09IG1hc2tlZEZvcm1hdEluZm8pXG5cdFx0e1xuXHRcdFx0Ly8gRm91bmQgYW4gZXhhY3QgbWF0Y2hcblx0XHRcdHJldHVybiBuZXcgRm9ybWF0SW5mb3JtYXRpb24oZGVjb2RlSW5mb1sxXSk7XG5cdFx0fVxuXHRcdHZhciBiaXRzRGlmZmVyZW5jZSA9IHRoaXMubnVtQml0c0RpZmZlcmluZyhtYXNrZWRGb3JtYXRJbmZvLCB0YXJnZXRJbmZvKTtcblx0XHRpZiAoYml0c0RpZmZlcmVuY2UgPCBiZXN0RGlmZmVyZW5jZSlcblx0XHR7XG5cdFx0XHRiZXN0Rm9ybWF0SW5mbyA9IGRlY29kZUluZm9bMV07XG5cdFx0XHRiZXN0RGlmZmVyZW5jZSA9IGJpdHNEaWZmZXJlbmNlO1xuXHRcdH1cblx0fVxuXHQvLyBIYW1taW5nIGRpc3RhbmNlIG9mIHRoZSAzMiBtYXNrZWQgY29kZXMgaXMgNywgYnkgY29uc3RydWN0aW9uLCBzbyA8PSAzIGJpdHNcblx0Ly8gZGlmZmVyaW5nIG1lYW5zIHdlIGZvdW5kIGEgbWF0Y2hcblx0aWYgKGJlc3REaWZmZXJlbmNlIDw9IDMpXG5cdHtcblx0XHRyZXR1cm4gbmV3IEZvcm1hdEluZm9ybWF0aW9uKGJlc3RGb3JtYXRJbmZvKTtcblx0fVxuXHRyZXR1cm4gbnVsbDtcbn1cblxuXG5cbi8qXG4gIFBvcnRlZCB0byBKYXZhU2NyaXB0IGJ5IExhemFyIExhc3psbyAyMDExXG5cbiAgbGF6YXJzb2Z0QGdtYWlsLmNvbSwgd3d3LmxhemFyc29mdC5pbmZvXG5cbiovXG5cbi8qXG4qXG4qIENvcHlyaWdodCAyMDA3IFpYaW5nIGF1dGhvcnNcbipcbiogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbipcbiogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbipcbiogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4qIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4qIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuXG5mdW5jdGlvbiBFcnJvckNvcnJlY3Rpb25MZXZlbChvcmRpbmFsLCAgYml0cywgbmFtZSlcbntcblx0dGhpcy5vcmRpbmFsX1JlbmFtZWRfRmllbGQgPSBvcmRpbmFsO1xuXHR0aGlzLmJpdHMgPSBiaXRzO1xuXHR0aGlzLm5hbWUgPSBuYW1lO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIkJpdHNcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiB0aGlzLmJpdHM7XG5cdH19KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJOYW1lXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5uYW1lO1xuXHR9fSk7XG5cdHRoaXMub3JkaW5hbD1mdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5vcmRpbmFsX1JlbmFtZWRfRmllbGQ7XG5cdH1cbn1cblxuRXJyb3JDb3JyZWN0aW9uTGV2ZWwuZm9yQml0cz1mdW5jdGlvbiggYml0cylcbntcblx0aWYgKGJpdHMgPCAwIHx8IGJpdHMgPj0gRk9SX0JJVFMubGVuZ3RoKVxuXHR7XG5cdFx0dGhyb3cgXCJBcmd1bWVudEV4Y2VwdGlvblwiO1xuXHR9XG5cdHJldHVybiBGT1JfQklUU1tiaXRzXTtcbn1cblxudmFyIEZPUl9CSVRTID0gbmV3IEFycmF5KFxuXHRuZXcgRXJyb3JDb3JyZWN0aW9uTGV2ZWwoMSwgMHgwMCwgXCJNXCIpLFxuXHRuZXcgRXJyb3JDb3JyZWN0aW9uTGV2ZWwoMCwgMHgwMSwgXCJMXCIpLFxuXHRuZXcgRXJyb3JDb3JyZWN0aW9uTGV2ZWwoMywgMHgwMiwgXCJIXCIpLFxuXHRuZXcgRXJyb3JDb3JyZWN0aW9uTGV2ZWwoMiwgMHgwMywgXCJRXCIpXG4pO1xuXG4vKlxuICBQb3J0ZWQgdG8gSmF2YVNjcmlwdCBieSBMYXphciBMYXN6bG8gMjAxMVxuXG4gIGxhemFyc29mdEBnbWFpbC5jb20sIHd3dy5sYXphcnNvZnQuaW5mb1xuXG4qL1xuXG4vKlxuKlxuKiBDb3B5cmlnaHQgMjAwNyBaWGluZyBhdXRob3JzXG4qXG4qIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4qIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4qXG4qICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4qXG4qIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cblxuZnVuY3Rpb24gQml0TWF0cml4KCB3aWR0aCwgIGhlaWdodClcbntcblx0aWYoIWhlaWdodClcblx0XHRoZWlnaHQ9d2lkdGg7XG5cdGlmICh3aWR0aCA8IDEgfHwgaGVpZ2h0IDwgMSlcblx0e1xuXHRcdHRocm93IFwiQm90aCBkaW1lbnNpb25zIG11c3QgYmUgZ3JlYXRlciB0aGFuIDBcIjtcblx0fVxuXHR0aGlzLndpZHRoID0gd2lkdGg7XG5cdHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXHR2YXIgcm93U2l6ZSA9IHdpZHRoID4+IDU7XG5cdGlmICgod2lkdGggJiAweDFmKSAhPSAwKVxuXHR7XG5cdFx0cm93U2l6ZSsrO1xuXHR9XG5cdHRoaXMucm93U2l6ZSA9IHJvd1NpemU7XG5cdHRoaXMuYml0cyA9IG5ldyBBcnJheShyb3dTaXplICogaGVpZ2h0KTtcblx0Zm9yKHZhciBpPTA7aTx0aGlzLmJpdHMubGVuZ3RoO2krKylcblx0XHR0aGlzLmJpdHNbaV09MDtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIldpZHRoXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy53aWR0aDtcblx0fX0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIkhlaWdodFwiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuaGVpZ2h0O1xuXHR9fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiRGltZW5zaW9uXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRpZiAodGhpcy53aWR0aCAhPSB0aGlzLmhlaWdodClcblx0XHR7XG5cdFx0XHR0aHJvdyBcIkNhbid0IGNhbGwgZ2V0RGltZW5zaW9uKCkgb24gYSBub24tc3F1YXJlIG1hdHJpeFwiO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy53aWR0aDtcblx0fX0pO1xuXG5cdHRoaXMuZ2V0X1JlbmFtZWQ9ZnVuY3Rpb24oIHgsICB5KVxuXHRcdHtcblx0XHRcdHZhciBvZmZzZXQgPSB5ICogdGhpcy5yb3dTaXplICsgKHggPj4gNSk7XG5cdFx0XHRyZXR1cm4gKChVUlNoaWZ0KHRoaXMuYml0c1tvZmZzZXRdLCAoeCAmIDB4MWYpKSkgJiAxKSAhPSAwO1xuXHRcdH1cblx0dGhpcy5zZXRfUmVuYW1lZD1mdW5jdGlvbiggeCwgIHkpXG5cdFx0e1xuXHRcdFx0dmFyIG9mZnNldCA9IHkgKiB0aGlzLnJvd1NpemUgKyAoeCA+PiA1KTtcblx0XHRcdHRoaXMuYml0c1tvZmZzZXRdIHw9IDEgPDwgKHggJiAweDFmKTtcblx0XHR9XG5cdHRoaXMuZmxpcD1mdW5jdGlvbiggeCwgIHkpXG5cdFx0e1xuXHRcdFx0dmFyIG9mZnNldCA9IHkgKiB0aGlzLnJvd1NpemUgKyAoeCA+PiA1KTtcblx0XHRcdHRoaXMuYml0c1tvZmZzZXRdIF49IDEgPDwgKHggJiAweDFmKTtcblx0XHR9XG5cdHRoaXMuY2xlYXI9ZnVuY3Rpb24oKVxuXHRcdHtcblx0XHRcdHZhciBtYXggPSB0aGlzLmJpdHMubGVuZ3RoO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXg7IGkrKylcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5iaXRzW2ldID0gMDtcblx0XHRcdH1cblx0XHR9XG5cdHRoaXMuc2V0UmVnaW9uPWZ1bmN0aW9uKCBsZWZ0LCAgdG9wLCAgd2lkdGgsICBoZWlnaHQpXG5cdFx0e1xuXHRcdFx0aWYgKHRvcCA8IDAgfHwgbGVmdCA8IDApXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IFwiTGVmdCBhbmQgdG9wIG11c3QgYmUgbm9ubmVnYXRpdmVcIjtcblx0XHRcdH1cblx0XHRcdGlmIChoZWlnaHQgPCAxIHx8IHdpZHRoIDwgMSlcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgXCJIZWlnaHQgYW5kIHdpZHRoIG11c3QgYmUgYXQgbGVhc3QgMVwiO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHJpZ2h0ID0gbGVmdCArIHdpZHRoO1xuXHRcdFx0dmFyIGJvdHRvbSA9IHRvcCArIGhlaWdodDtcblx0XHRcdGlmIChib3R0b20gPiB0aGlzLmhlaWdodCB8fCByaWdodCA+IHRoaXMud2lkdGgpXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IFwiVGhlIHJlZ2lvbiBtdXN0IGZpdCBpbnNpZGUgdGhlIG1hdHJpeFwiO1xuXHRcdFx0fVxuXHRcdFx0Zm9yICh2YXIgeSA9IHRvcDsgeSA8IGJvdHRvbTsgeSsrKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgb2Zmc2V0ID0geSAqIHRoaXMucm93U2l6ZTtcblx0XHRcdFx0Zm9yICh2YXIgeCA9IGxlZnQ7IHggPCByaWdodDsgeCsrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dGhpcy5iaXRzW29mZnNldCArICh4ID4+IDUpXSB8PSAxIDw8ICh4ICYgMHgxZik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG59XG5cbi8qXG4gIFBvcnRlZCB0byBKYXZhU2NyaXB0IGJ5IExhemFyIExhc3psbyAyMDExXG5cbiAgbGF6YXJzb2Z0QGdtYWlsLmNvbSwgd3d3LmxhemFyc29mdC5pbmZvXG5cbiovXG5cbi8qXG4qXG4qIENvcHlyaWdodCAyMDA3IFpYaW5nIGF1dGhvcnNcbipcbiogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbipcbiogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbipcbiogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4qIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4qIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuXG5mdW5jdGlvbiBEYXRhQmxvY2sobnVtRGF0YUNvZGV3b3JkcywgIGNvZGV3b3Jkcylcbntcblx0dGhpcy5udW1EYXRhQ29kZXdvcmRzID0gbnVtRGF0YUNvZGV3b3Jkcztcblx0dGhpcy5jb2Rld29yZHMgPSBjb2Rld29yZHM7XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJOdW1EYXRhQ29kZXdvcmRzXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5udW1EYXRhQ29kZXdvcmRzO1xuXHR9fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiQ29kZXdvcmRzXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5jb2Rld29yZHM7XG5cdH19KTtcbn1cblxuRGF0YUJsb2NrLmdldERhdGFCbG9ja3M9ZnVuY3Rpb24ocmF3Q29kZXdvcmRzLCAgdmVyc2lvbiwgIGVjTGV2ZWwpXG57XG5cblx0aWYgKHJhd0NvZGV3b3Jkcy5sZW5ndGggIT0gdmVyc2lvbi5Ub3RhbENvZGV3b3Jkcylcblx0e1xuXHRcdHRocm93IFwiQXJndW1lbnRFeGNlcHRpb25cIjtcblx0fVxuXG5cdC8vIEZpZ3VyZSBvdXQgdGhlIG51bWJlciBhbmQgc2l6ZSBvZiBkYXRhIGJsb2NrcyB1c2VkIGJ5IHRoaXMgdmVyc2lvbiBhbmRcblx0Ly8gZXJyb3IgY29ycmVjdGlvbiBsZXZlbFxuXHR2YXIgZWNCbG9ja3MgPSB2ZXJzaW9uLmdldEVDQmxvY2tzRm9yTGV2ZWwoZWNMZXZlbCk7XG5cblx0Ly8gRmlyc3QgY291bnQgdGhlIHRvdGFsIG51bWJlciBvZiBkYXRhIGJsb2Nrc1xuXHR2YXIgdG90YWxCbG9ja3MgPSAwO1xuXHR2YXIgZWNCbG9ja0FycmF5ID0gZWNCbG9ja3MuZ2V0RUNCbG9ja3MoKTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBlY0Jsb2NrQXJyYXkubGVuZ3RoOyBpKyspXG5cdHtcblx0XHR0b3RhbEJsb2NrcyArPSBlY0Jsb2NrQXJyYXlbaV0uQ291bnQ7XG5cdH1cblxuXHQvLyBOb3cgZXN0YWJsaXNoIERhdGFCbG9ja3Mgb2YgdGhlIGFwcHJvcHJpYXRlIHNpemUgYW5kIG51bWJlciBvZiBkYXRhIGNvZGV3b3Jkc1xuXHR2YXIgcmVzdWx0ID0gbmV3IEFycmF5KHRvdGFsQmxvY2tzKTtcblx0dmFyIG51bVJlc3VsdEJsb2NrcyA9IDA7XG5cdGZvciAodmFyIGogPSAwOyBqIDwgZWNCbG9ja0FycmF5Lmxlbmd0aDsgaisrKVxuXHR7XG5cdFx0dmFyIGVjQmxvY2sgPSBlY0Jsb2NrQXJyYXlbal07XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBlY0Jsb2NrLkNvdW50OyBpKyspXG5cdFx0e1xuXHRcdFx0dmFyIG51bURhdGFDb2Rld29yZHMgPSBlY0Jsb2NrLkRhdGFDb2Rld29yZHM7XG5cdFx0XHR2YXIgbnVtQmxvY2tDb2Rld29yZHMgPSBlY0Jsb2Nrcy5FQ0NvZGV3b3Jkc1BlckJsb2NrICsgbnVtRGF0YUNvZGV3b3Jkcztcblx0XHRcdHJlc3VsdFtudW1SZXN1bHRCbG9ja3MrK10gPSBuZXcgRGF0YUJsb2NrKG51bURhdGFDb2Rld29yZHMsIG5ldyBBcnJheShudW1CbG9ja0NvZGV3b3JkcykpO1xuXHRcdH1cblx0fVxuXG5cdC8vIEFsbCBibG9ja3MgaGF2ZSB0aGUgc2FtZSBhbW91bnQgb2YgZGF0YSwgZXhjZXB0IHRoYXQgdGhlIGxhc3QgblxuXHQvLyAod2hlcmUgbiBtYXkgYmUgMCkgaGF2ZSAxIG1vcmUgYnl0ZS4gRmlndXJlIG91dCB3aGVyZSB0aGVzZSBzdGFydC5cblx0dmFyIHNob3J0ZXJCbG9ja3NUb3RhbENvZGV3b3JkcyA9IHJlc3VsdFswXS5jb2Rld29yZHMubGVuZ3RoO1xuXHR2YXIgbG9uZ2VyQmxvY2tzU3RhcnRBdCA9IHJlc3VsdC5sZW5ndGggLSAxO1xuXHR3aGlsZSAobG9uZ2VyQmxvY2tzU3RhcnRBdCA+PSAwKVxuXHR7XG5cdFx0dmFyIG51bUNvZGV3b3JkcyA9IHJlc3VsdFtsb25nZXJCbG9ja3NTdGFydEF0XS5jb2Rld29yZHMubGVuZ3RoO1xuXHRcdGlmIChudW1Db2Rld29yZHMgPT0gc2hvcnRlckJsb2Nrc1RvdGFsQ29kZXdvcmRzKVxuXHRcdHtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRsb25nZXJCbG9ja3NTdGFydEF0LS07XG5cdH1cblx0bG9uZ2VyQmxvY2tzU3RhcnRBdCsrO1xuXG5cdHZhciBzaG9ydGVyQmxvY2tzTnVtRGF0YUNvZGV3b3JkcyA9IHNob3J0ZXJCbG9ja3NUb3RhbENvZGV3b3JkcyAtIGVjQmxvY2tzLkVDQ29kZXdvcmRzUGVyQmxvY2s7XG5cdC8vIFRoZSBsYXN0IGVsZW1lbnRzIG9mIHJlc3VsdCBtYXkgYmUgMSBlbGVtZW50IGxvbmdlcjtcblx0Ly8gZmlyc3QgZmlsbCBvdXQgYXMgbWFueSBlbGVtZW50cyBhcyBhbGwgb2YgdGhlbSBoYXZlXG5cdHZhciByYXdDb2Rld29yZHNPZmZzZXQgPSAwO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHNob3J0ZXJCbG9ja3NOdW1EYXRhQ29kZXdvcmRzOyBpKyspXG5cdHtcblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IG51bVJlc3VsdEJsb2NrczsgaisrKVxuXHRcdHtcblx0XHRcdHJlc3VsdFtqXS5jb2Rld29yZHNbaV0gPSByYXdDb2Rld29yZHNbcmF3Q29kZXdvcmRzT2Zmc2V0KytdO1xuXHRcdH1cblx0fVxuXHQvLyBGaWxsIG91dCB0aGUgbGFzdCBkYXRhIGJsb2NrIGluIHRoZSBsb25nZXIgb25lc1xuXHRmb3IgKHZhciBqID0gbG9uZ2VyQmxvY2tzU3RhcnRBdDsgaiA8IG51bVJlc3VsdEJsb2NrczsgaisrKVxuXHR7XG5cdFx0cmVzdWx0W2pdLmNvZGV3b3Jkc1tzaG9ydGVyQmxvY2tzTnVtRGF0YUNvZGV3b3Jkc10gPSByYXdDb2Rld29yZHNbcmF3Q29kZXdvcmRzT2Zmc2V0KytdO1xuXHR9XG5cdC8vIE5vdyBhZGQgaW4gZXJyb3IgY29ycmVjdGlvbiBibG9ja3Ncblx0dmFyIG1heCA9IHJlc3VsdFswXS5jb2Rld29yZHMubGVuZ3RoO1xuXHRmb3IgKHZhciBpID0gc2hvcnRlckJsb2Nrc051bURhdGFDb2Rld29yZHM7IGkgPCBtYXg7IGkrKylcblx0e1xuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgbnVtUmVzdWx0QmxvY2tzOyBqKyspXG5cdFx0e1xuXHRcdFx0dmFyIGlPZmZzZXQgPSBqIDwgbG9uZ2VyQmxvY2tzU3RhcnRBdD9pOmkgKyAxO1xuXHRcdFx0cmVzdWx0W2pdLmNvZGV3b3Jkc1tpT2Zmc2V0XSA9IHJhd0NvZGV3b3Jkc1tyYXdDb2Rld29yZHNPZmZzZXQrK107XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59XG5cbi8qXG4gIFBvcnRlZCB0byBKYXZhU2NyaXB0IGJ5IExhemFyIExhc3psbyAyMDExXG5cbiAgbGF6YXJzb2Z0QGdtYWlsLmNvbSwgd3d3LmxhemFyc29mdC5pbmZvXG5cbiovXG5cbi8qXG4qXG4qIENvcHlyaWdodCAyMDA3IFpYaW5nIGF1dGhvcnNcbipcbiogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbipcbiogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbipcbiogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4qIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4qIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuXG5mdW5jdGlvbiBCaXRNYXRyaXhQYXJzZXIoYml0TWF0cml4KVxue1xuXHR2YXIgZGltZW5zaW9uID0gYml0TWF0cml4LkRpbWVuc2lvbjtcblx0aWYgKGRpbWVuc2lvbiA8IDIxIHx8IChkaW1lbnNpb24gJiAweDAzKSAhPSAxKVxuXHR7XG5cdFx0dGhyb3cgXCJFcnJvciBCaXRNYXRyaXhQYXJzZXJcIjtcblx0fVxuXHR0aGlzLmJpdE1hdHJpeCA9IGJpdE1hdHJpeDtcblx0dGhpcy5wYXJzZWRWZXJzaW9uID0gbnVsbDtcblx0dGhpcy5wYXJzZWRGb3JtYXRJbmZvID0gbnVsbDtcblxuXHR0aGlzLmNvcHlCaXQ9ZnVuY3Rpb24oIGksICBqLCAgdmVyc2lvbkJpdHMpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5iaXRNYXRyaXguZ2V0X1JlbmFtZWQoaSwgaik/KHZlcnNpb25CaXRzIDw8IDEpIHwgMHgxOnZlcnNpb25CaXRzIDw8IDE7XG5cdH1cblxuXHR0aGlzLnJlYWRGb3JtYXRJbmZvcm1hdGlvbj1mdW5jdGlvbigpXG5cdHtcblx0XHRcdGlmICh0aGlzLnBhcnNlZEZvcm1hdEluZm8gIT0gbnVsbClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHRoaXMucGFyc2VkRm9ybWF0SW5mbztcblx0XHRcdH1cblxuXHRcdFx0Ly8gUmVhZCB0b3AtbGVmdCBmb3JtYXQgaW5mbyBiaXRzXG5cdFx0XHR2YXIgZm9ybWF0SW5mb0JpdHMgPSAwO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCA2OyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdGZvcm1hdEluZm9CaXRzID0gdGhpcy5jb3B5Qml0KGksIDgsIGZvcm1hdEluZm9CaXRzKTtcblx0XHRcdH1cblx0XHRcdC8vIC4uIGFuZCBza2lwIGEgYml0IGluIHRoZSB0aW1pbmcgcGF0dGVybiAuLi5cblx0XHRcdGZvcm1hdEluZm9CaXRzID0gdGhpcy5jb3B5Qml0KDcsIDgsIGZvcm1hdEluZm9CaXRzKTtcblx0XHRcdGZvcm1hdEluZm9CaXRzID0gdGhpcy5jb3B5Qml0KDgsIDgsIGZvcm1hdEluZm9CaXRzKTtcblx0XHRcdGZvcm1hdEluZm9CaXRzID0gdGhpcy5jb3B5Qml0KDgsIDcsIGZvcm1hdEluZm9CaXRzKTtcblx0XHRcdC8vIC4uIGFuZCBza2lwIGEgYml0IGluIHRoZSB0aW1pbmcgcGF0dGVybiAuLi5cblx0XHRcdGZvciAodmFyIGogPSA1OyBqID49IDA7IGotLSlcblx0XHRcdHtcblx0XHRcdFx0Zm9ybWF0SW5mb0JpdHMgPSB0aGlzLmNvcHlCaXQoOCwgaiwgZm9ybWF0SW5mb0JpdHMpO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnBhcnNlZEZvcm1hdEluZm8gPSBGb3JtYXRJbmZvcm1hdGlvbi5kZWNvZGVGb3JtYXRJbmZvcm1hdGlvbihmb3JtYXRJbmZvQml0cyk7XG5cdFx0XHRpZiAodGhpcy5wYXJzZWRGb3JtYXRJbmZvICE9IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB0aGlzLnBhcnNlZEZvcm1hdEluZm87XG5cdFx0XHR9XG5cblx0XHRcdC8vIEhtbSwgZmFpbGVkLiBUcnkgdGhlIHRvcC1yaWdodC9ib3R0b20tbGVmdCBwYXR0ZXJuXG5cdFx0XHR2YXIgZGltZW5zaW9uID0gdGhpcy5iaXRNYXRyaXguRGltZW5zaW9uO1xuXHRcdFx0Zm9ybWF0SW5mb0JpdHMgPSAwO1xuXHRcdFx0dmFyIGlNaW4gPSBkaW1lbnNpb24gLSA4O1xuXHRcdFx0Zm9yICh2YXIgaSA9IGRpbWVuc2lvbiAtIDE7IGkgPj0gaU1pbjsgaS0tKVxuXHRcdFx0e1xuXHRcdFx0XHRmb3JtYXRJbmZvQml0cyA9IHRoaXMuY29weUJpdChpLCA4LCBmb3JtYXRJbmZvQml0cyk7XG5cdFx0XHR9XG5cdFx0XHRmb3IgKHZhciBqID0gZGltZW5zaW9uIC0gNzsgaiA8IGRpbWVuc2lvbjsgaisrKVxuXHRcdFx0e1xuXHRcdFx0XHRmb3JtYXRJbmZvQml0cyA9IHRoaXMuY29weUJpdCg4LCBqLCBmb3JtYXRJbmZvQml0cyk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMucGFyc2VkRm9ybWF0SW5mbyA9IEZvcm1hdEluZm9ybWF0aW9uLmRlY29kZUZvcm1hdEluZm9ybWF0aW9uKGZvcm1hdEluZm9CaXRzKTtcblx0XHRcdGlmICh0aGlzLnBhcnNlZEZvcm1hdEluZm8gIT0gbnVsbClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHRoaXMucGFyc2VkRm9ybWF0SW5mbztcblx0XHRcdH1cblx0XHRcdHRocm93IFwiRXJyb3IgcmVhZEZvcm1hdEluZm9ybWF0aW9uXCI7XG5cdH1cblx0dGhpcy5yZWFkVmVyc2lvbj1mdW5jdGlvbigpXG5cdFx0e1xuXG5cdFx0XHRpZiAodGhpcy5wYXJzZWRWZXJzaW9uICE9IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB0aGlzLnBhcnNlZFZlcnNpb247XG5cdFx0XHR9XG5cblx0XHRcdHZhciBkaW1lbnNpb24gPSB0aGlzLmJpdE1hdHJpeC5EaW1lbnNpb247XG5cblx0XHRcdHZhciBwcm92aXNpb25hbFZlcnNpb24gPSAoZGltZW5zaW9uIC0gMTcpID4+IDI7XG5cdFx0XHRpZiAocHJvdmlzaW9uYWxWZXJzaW9uIDw9IDYpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBWZXJzaW9uLmdldFZlcnNpb25Gb3JOdW1iZXIocHJvdmlzaW9uYWxWZXJzaW9uKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gUmVhZCB0b3AtcmlnaHQgdmVyc2lvbiBpbmZvOiAzIHdpZGUgYnkgNiB0YWxsXG5cdFx0XHR2YXIgdmVyc2lvbkJpdHMgPSAwO1xuXHRcdFx0dmFyIGlqTWluID0gZGltZW5zaW9uIC0gMTE7XG5cdFx0XHRmb3IgKHZhciBqID0gNTsgaiA+PSAwOyBqLS0pXG5cdFx0XHR7XG5cdFx0XHRcdGZvciAodmFyIGkgPSBkaW1lbnNpb24gLSA5OyBpID49IGlqTWluOyBpLS0pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2ZXJzaW9uQml0cyA9IHRoaXMuY29weUJpdChpLCBqLCB2ZXJzaW9uQml0cyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0dGhpcy5wYXJzZWRWZXJzaW9uID0gVmVyc2lvbi5kZWNvZGVWZXJzaW9uSW5mb3JtYXRpb24odmVyc2lvbkJpdHMpO1xuXHRcdFx0aWYgKHRoaXMucGFyc2VkVmVyc2lvbiAhPSBudWxsICYmIHRoaXMucGFyc2VkVmVyc2lvbi5EaW1lbnNpb25Gb3JWZXJzaW9uID09IGRpbWVuc2lvbilcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHRoaXMucGFyc2VkVmVyc2lvbjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gSG1tLCBmYWlsZWQuIFRyeSBib3R0b20gbGVmdDogNiB3aWRlIGJ5IDMgdGFsbFxuXHRcdFx0dmVyc2lvbkJpdHMgPSAwO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDU7IGkgPj0gMDsgaS0tKVxuXHRcdFx0e1xuXHRcdFx0XHRmb3IgKHZhciBqID0gZGltZW5zaW9uIC0gOTsgaiA+PSBpak1pbjsgai0tKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dmVyc2lvbkJpdHMgPSB0aGlzLmNvcHlCaXQoaSwgaiwgdmVyc2lvbkJpdHMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMucGFyc2VkVmVyc2lvbiA9IFZlcnNpb24uZGVjb2RlVmVyc2lvbkluZm9ybWF0aW9uKHZlcnNpb25CaXRzKTtcblx0XHRcdGlmICh0aGlzLnBhcnNlZFZlcnNpb24gIT0gbnVsbCAmJiB0aGlzLnBhcnNlZFZlcnNpb24uRGltZW5zaW9uRm9yVmVyc2lvbiA9PSBkaW1lbnNpb24pXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB0aGlzLnBhcnNlZFZlcnNpb247XG5cdFx0XHR9XG5cdFx0XHR0aHJvdyBcIkVycm9yIHJlYWRWZXJzaW9uXCI7XG5cdFx0fVxuXHR0aGlzLnJlYWRDb2Rld29yZHM9ZnVuY3Rpb24oKVxuXHRcdHtcblxuXHRcdFx0dmFyIGZvcm1hdEluZm8gPSB0aGlzLnJlYWRGb3JtYXRJbmZvcm1hdGlvbigpO1xuXHRcdFx0dmFyIHZlcnNpb24gPSB0aGlzLnJlYWRWZXJzaW9uKCk7XG5cblx0XHRcdC8vIEdldCB0aGUgZGF0YSBtYXNrIGZvciB0aGUgZm9ybWF0IHVzZWQgaW4gdGhpcyBRUiBDb2RlLiBUaGlzIHdpbGwgZXhjbHVkZVxuXHRcdFx0Ly8gc29tZSBiaXRzIGZyb20gcmVhZGluZyBhcyB3ZSB3aW5kIHRocm91Z2ggdGhlIGJpdCBtYXRyaXguXG5cdFx0XHR2YXIgZGF0YU1hc2sgPSBEYXRhTWFzay5mb3JSZWZlcmVuY2UoIGZvcm1hdEluZm8uRGF0YU1hc2spO1xuXHRcdFx0dmFyIGRpbWVuc2lvbiA9IHRoaXMuYml0TWF0cml4LkRpbWVuc2lvbjtcblx0XHRcdGRhdGFNYXNrLnVubWFza0JpdE1hdHJpeCh0aGlzLmJpdE1hdHJpeCwgZGltZW5zaW9uKTtcblxuXHRcdFx0dmFyIGZ1bmN0aW9uUGF0dGVybiA9IHZlcnNpb24uYnVpbGRGdW5jdGlvblBhdHRlcm4oKTtcblxuXHRcdFx0dmFyIHJlYWRpbmdVcCA9IHRydWU7XG5cdFx0XHR2YXIgcmVzdWx0ID0gbmV3IEFycmF5KHZlcnNpb24uVG90YWxDb2Rld29yZHMpO1xuXHRcdFx0dmFyIHJlc3VsdE9mZnNldCA9IDA7XG5cdFx0XHR2YXIgY3VycmVudEJ5dGUgPSAwO1xuXHRcdFx0dmFyIGJpdHNSZWFkID0gMDtcblx0XHRcdC8vIFJlYWQgY29sdW1ucyBpbiBwYWlycywgZnJvbSByaWdodCB0byBsZWZ0XG5cdFx0XHRmb3IgKHZhciBqID0gZGltZW5zaW9uIC0gMTsgaiA+IDA7IGogLT0gMilcblx0XHRcdHtcblx0XHRcdFx0aWYgKGogPT0gNilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIFNraXAgd2hvbGUgY29sdW1uIHdpdGggdmVydGljYWwgYWxpZ25tZW50IHBhdHRlcm47XG5cdFx0XHRcdFx0Ly8gc2F2ZXMgdGltZSBhbmQgbWFrZXMgdGhlIG90aGVyIGNvZGUgcHJvY2VlZCBtb3JlIGNsZWFubHlcblx0XHRcdFx0XHRqLS07XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gUmVhZCBhbHRlcm5hdGluZ2x5IGZyb20gYm90dG9tIHRvIHRvcCB0aGVuIHRvcCB0byBib3R0b21cblx0XHRcdFx0Zm9yICh2YXIgY291bnQgPSAwOyBjb3VudCA8IGRpbWVuc2lvbjsgY291bnQrKylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZhciBpID0gcmVhZGluZ1VwP2RpbWVuc2lvbiAtIDEgLSBjb3VudDpjb3VudDtcblx0XHRcdFx0XHRmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCAyOyBjb2wrKylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyBJZ25vcmUgYml0cyBjb3ZlcmVkIGJ5IHRoZSBmdW5jdGlvbiBwYXR0ZXJuXG5cdFx0XHRcdFx0XHRpZiAoIWZ1bmN0aW9uUGF0dGVybi5nZXRfUmVuYW1lZChqIC0gY29sLCBpKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly8gUmVhZCBhIGJpdFxuXHRcdFx0XHRcdFx0XHRiaXRzUmVhZCsrO1xuXHRcdFx0XHRcdFx0XHRjdXJyZW50Qnl0ZSA8PD0gMTtcblx0XHRcdFx0XHRcdFx0aWYgKHRoaXMuYml0TWF0cml4LmdldF9SZW5hbWVkKGogLSBjb2wsIGkpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Y3VycmVudEJ5dGUgfD0gMTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHQvLyBJZiB3ZSd2ZSBtYWRlIGEgd2hvbGUgYnl0ZSwgc2F2ZSBpdCBvZmZcblx0XHRcdFx0XHRcdFx0aWYgKGJpdHNSZWFkID09IDgpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRyZXN1bHRbcmVzdWx0T2Zmc2V0KytdID0gIGN1cnJlbnRCeXRlO1xuXHRcdFx0XHRcdFx0XHRcdGJpdHNSZWFkID0gMDtcblx0XHRcdFx0XHRcdFx0XHRjdXJyZW50Qnl0ZSA9IDA7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmVhZGluZ1VwIF49IHRydWU7IC8vIHJlYWRpbmdVcCA9ICFyZWFkaW5nVXA7IC8vIHN3aXRjaCBkaXJlY3Rpb25zXG5cdFx0XHR9XG5cdFx0XHRpZiAocmVzdWx0T2Zmc2V0ICE9IHZlcnNpb24uVG90YWxDb2Rld29yZHMpXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IFwiRXJyb3IgcmVhZENvZGV3b3Jkc1wiO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG59XG5cbi8qXG4gIFBvcnRlZCB0byBKYXZhU2NyaXB0IGJ5IExhemFyIExhc3psbyAyMDExXG5cbiAgbGF6YXJzb2Z0QGdtYWlsLmNvbSwgd3d3LmxhemFyc29mdC5pbmZvXG5cbiovXG5cbi8qXG4qXG4qIENvcHlyaWdodCAyMDA3IFpYaW5nIGF1dGhvcnNcbipcbiogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbipcbiogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbipcbiogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4qIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4qIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuXG52YXIgRGF0YU1hc2sgPSB7fTtcblxuRGF0YU1hc2suZm9yUmVmZXJlbmNlID0gZnVuY3Rpb24ocmVmZXJlbmNlKVxue1xuXHRpZiAocmVmZXJlbmNlIDwgMCB8fCByZWZlcmVuY2UgPiA3KVxuXHR7XG5cdFx0dGhyb3cgXCJTeXN0ZW0uQXJndW1lbnRFeGNlcHRpb25cIjtcblx0fVxuXHRyZXR1cm4gRGF0YU1hc2suREFUQV9NQVNLU1tyZWZlcmVuY2VdO1xufVxuXG5mdW5jdGlvbiBEYXRhTWFzazAwMCgpXG57XG5cdHRoaXMudW5tYXNrQml0TWF0cml4PWZ1bmN0aW9uKGJpdHMsICBkaW1lbnNpb24pXG5cdHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGRpbWVuc2lvbjsgaSsrKVxuXHRcdHtcblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgZGltZW5zaW9uOyBqKyspXG5cdFx0XHR7XG5cdFx0XHRcdGlmICh0aGlzLmlzTWFza2VkKGksIGopKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Yml0cy5mbGlwKGosIGkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHRoaXMuaXNNYXNrZWQ9ZnVuY3Rpb24oIGksICBqKVxuXHR7XG5cdFx0cmV0dXJuICgoaSArIGopICYgMHgwMSkgPT0gMDtcblx0fVxufVxuXG5mdW5jdGlvbiBEYXRhTWFzazAwMSgpXG57XG5cdHRoaXMudW5tYXNrQml0TWF0cml4PWZ1bmN0aW9uKGJpdHMsICBkaW1lbnNpb24pXG5cdHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGRpbWVuc2lvbjsgaSsrKVxuXHRcdHtcblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgZGltZW5zaW9uOyBqKyspXG5cdFx0XHR7XG5cdFx0XHRcdGlmICh0aGlzLmlzTWFza2VkKGksIGopKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Yml0cy5mbGlwKGosIGkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHRoaXMuaXNNYXNrZWQ9ZnVuY3Rpb24oIGksICBqKVxuXHR7XG5cdFx0cmV0dXJuIChpICYgMHgwMSkgPT0gMDtcblx0fVxufVxuXG5mdW5jdGlvbiBEYXRhTWFzazAxMCgpXG57XG5cdHRoaXMudW5tYXNrQml0TWF0cml4PWZ1bmN0aW9uKGJpdHMsICBkaW1lbnNpb24pXG5cdHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGRpbWVuc2lvbjsgaSsrKVxuXHRcdHtcblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgZGltZW5zaW9uOyBqKyspXG5cdFx0XHR7XG5cdFx0XHRcdGlmICh0aGlzLmlzTWFza2VkKGksIGopKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Yml0cy5mbGlwKGosIGkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHRoaXMuaXNNYXNrZWQ9ZnVuY3Rpb24oIGksICBqKVxuXHR7XG5cdFx0cmV0dXJuIGogJSAzID09IDA7XG5cdH1cbn1cblxuZnVuY3Rpb24gRGF0YU1hc2swMTEoKVxue1xuXHR0aGlzLnVubWFza0JpdE1hdHJpeD1mdW5jdGlvbihiaXRzLCAgZGltZW5zaW9uKVxuXHR7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkaW1lbnNpb247IGkrKylcblx0XHR7XG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGRpbWVuc2lvbjsgaisrKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAodGhpcy5pc01hc2tlZChpLCBqKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGJpdHMuZmxpcChqLCBpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHR0aGlzLmlzTWFza2VkPWZ1bmN0aW9uKCBpLCAgailcblx0e1xuXHRcdHJldHVybiAoaSArIGopICUgMyA9PSAwO1xuXHR9XG59XG5cbmZ1bmN0aW9uIERhdGFNYXNrMTAwKClcbntcblx0dGhpcy51bm1hc2tCaXRNYXRyaXg9ZnVuY3Rpb24oYml0cywgIGRpbWVuc2lvbilcblx0e1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGltZW5zaW9uOyBpKyspXG5cdFx0e1xuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBkaW1lbnNpb247IGorKylcblx0XHRcdHtcblx0XHRcdFx0aWYgKHRoaXMuaXNNYXNrZWQoaSwgaikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRiaXRzLmZsaXAoaiwgaSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0dGhpcy5pc01hc2tlZD1mdW5jdGlvbiggaSwgIGopXG5cdHtcblx0XHRyZXR1cm4gKCgoVVJTaGlmdChpLCAxKSkgKyAoaiAvIDMpKSAmIDB4MDEpID09IDA7XG5cdH1cbn1cblxuZnVuY3Rpb24gRGF0YU1hc2sxMDEoKVxue1xuXHR0aGlzLnVubWFza0JpdE1hdHJpeD1mdW5jdGlvbihiaXRzLCAgZGltZW5zaW9uKVxuXHR7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkaW1lbnNpb247IGkrKylcblx0XHR7XG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGRpbWVuc2lvbjsgaisrKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAodGhpcy5pc01hc2tlZChpLCBqKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGJpdHMuZmxpcChqLCBpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHR0aGlzLmlzTWFza2VkPWZ1bmN0aW9uKCBpLCAgailcblx0e1xuXHRcdHZhciB0ZW1wID0gaSAqIGo7XG5cdFx0cmV0dXJuICh0ZW1wICYgMHgwMSkgKyAodGVtcCAlIDMpID09IDA7XG5cdH1cbn1cblxuZnVuY3Rpb24gRGF0YU1hc2sxMTAoKVxue1xuXHR0aGlzLnVubWFza0JpdE1hdHJpeD1mdW5jdGlvbihiaXRzLCAgZGltZW5zaW9uKVxuXHR7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkaW1lbnNpb247IGkrKylcblx0XHR7XG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGRpbWVuc2lvbjsgaisrKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAodGhpcy5pc01hc2tlZChpLCBqKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGJpdHMuZmxpcChqLCBpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHR0aGlzLmlzTWFza2VkPWZ1bmN0aW9uKCBpLCAgailcblx0e1xuXHRcdHZhciB0ZW1wID0gaSAqIGo7XG5cdFx0cmV0dXJuICgoKHRlbXAgJiAweDAxKSArICh0ZW1wICUgMykpICYgMHgwMSkgPT0gMDtcblx0fVxufVxuZnVuY3Rpb24gRGF0YU1hc2sxMTEoKVxue1xuXHR0aGlzLnVubWFza0JpdE1hdHJpeD1mdW5jdGlvbihiaXRzLCAgZGltZW5zaW9uKVxuXHR7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkaW1lbnNpb247IGkrKylcblx0XHR7XG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGRpbWVuc2lvbjsgaisrKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAodGhpcy5pc01hc2tlZChpLCBqKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGJpdHMuZmxpcChqLCBpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHR0aGlzLmlzTWFza2VkPWZ1bmN0aW9uKCBpLCAgailcblx0e1xuXHRcdHJldHVybiAoKCgoaSArIGopICYgMHgwMSkgKyAoKGkgKiBqKSAlIDMpKSAmIDB4MDEpID09IDA7XG5cdH1cbn1cblxuRGF0YU1hc2suREFUQV9NQVNLUyA9IG5ldyBBcnJheShuZXcgRGF0YU1hc2swMDAoKSwgbmV3IERhdGFNYXNrMDAxKCksIG5ldyBEYXRhTWFzazAxMCgpLCBuZXcgRGF0YU1hc2swMTEoKSwgbmV3IERhdGFNYXNrMTAwKCksIG5ldyBEYXRhTWFzazEwMSgpLCBuZXcgRGF0YU1hc2sxMTAoKSwgbmV3IERhdGFNYXNrMTExKCkpO1xuXG5cbi8qXG4gIFBvcnRlZCB0byBKYXZhU2NyaXB0IGJ5IExhemFyIExhc3psbyAyMDExXG5cbiAgbGF6YXJzb2Z0QGdtYWlsLmNvbSwgd3d3LmxhemFyc29mdC5pbmZvXG5cbiovXG5cbi8qXG4qXG4qIENvcHlyaWdodCAyMDA3IFpYaW5nIGF1dGhvcnNcbipcbiogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbipcbiogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbipcbiogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4qIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4qIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuXG5mdW5jdGlvbiBSZWVkU29sb21vbkRlY29kZXIoZmllbGQpXG57XG5cdHRoaXMuZmllbGQgPSBmaWVsZDtcblx0dGhpcy5kZWNvZGU9ZnVuY3Rpb24ocmVjZWl2ZWQsICB0d29TKVxuXHR7XG5cdFx0XHR2YXIgcG9seSA9IG5ldyBHRjI1NlBvbHkodGhpcy5maWVsZCwgcmVjZWl2ZWQpO1xuXHRcdFx0dmFyIHN5bmRyb21lQ29lZmZpY2llbnRzID0gbmV3IEFycmF5KHR3b1MpO1xuXHRcdFx0Zm9yKHZhciBpPTA7aTxzeW5kcm9tZUNvZWZmaWNpZW50cy5sZW5ndGg7aSsrKXN5bmRyb21lQ29lZmZpY2llbnRzW2ldPTA7XG5cdFx0XHR2YXIgZGF0YU1hdHJpeCA9IGZhbHNlOy8vdGhpcy5maWVsZC5FcXVhbHMoR0YyNTYuREFUQV9NQVRSSVhfRklFTEQpO1xuXHRcdFx0dmFyIG5vRXJyb3IgPSB0cnVlO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0d29TOyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdC8vIFRoYW5rcyB0byBzYW5mb3Jkc3F1aXJlcyBmb3IgdGhpcyBmaXg6XG5cdFx0XHRcdHZhciBldmFsID0gcG9seS5ldmFsdWF0ZUF0KHRoaXMuZmllbGQuZXhwKGRhdGFNYXRyaXg/aSArIDE6aSkpO1xuXHRcdFx0XHRzeW5kcm9tZUNvZWZmaWNpZW50c1tzeW5kcm9tZUNvZWZmaWNpZW50cy5sZW5ndGggLSAxIC0gaV0gPSBldmFsO1xuXHRcdFx0XHRpZiAoZXZhbCAhPSAwKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bm9FcnJvciA9IGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAobm9FcnJvcilcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIDtcblx0XHRcdH1cblx0XHRcdHZhciBzeW5kcm9tZSA9IG5ldyBHRjI1NlBvbHkodGhpcy5maWVsZCwgc3luZHJvbWVDb2VmZmljaWVudHMpO1xuXHRcdFx0dmFyIHNpZ21hT21lZ2EgPSB0aGlzLnJ1bkV1Y2xpZGVhbkFsZ29yaXRobSh0aGlzLmZpZWxkLmJ1aWxkTW9ub21pYWwodHdvUywgMSksIHN5bmRyb21lLCB0d29TKTtcblx0XHRcdHZhciBzaWdtYSA9IHNpZ21hT21lZ2FbMF07XG5cdFx0XHR2YXIgb21lZ2EgPSBzaWdtYU9tZWdhWzFdO1xuXHRcdFx0dmFyIGVycm9yTG9jYXRpb25zID0gdGhpcy5maW5kRXJyb3JMb2NhdGlvbnMoc2lnbWEpO1xuXHRcdFx0dmFyIGVycm9yTWFnbml0dWRlcyA9IHRoaXMuZmluZEVycm9yTWFnbml0dWRlcyhvbWVnYSwgZXJyb3JMb2NhdGlvbnMsIGRhdGFNYXRyaXgpO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBlcnJvckxvY2F0aW9ucy5sZW5ndGg7IGkrKylcblx0XHRcdHtcblx0XHRcdFx0dmFyIHBvc2l0aW9uID0gcmVjZWl2ZWQubGVuZ3RoIC0gMSAtIHRoaXMuZmllbGQubG9nKGVycm9yTG9jYXRpb25zW2ldKTtcblx0XHRcdFx0aWYgKHBvc2l0aW9uIDwgMClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRocm93IFwiUmVlZFNvbG9tb25FeGNlcHRpb24gQmFkIGVycm9yIGxvY2F0aW9uXCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmVjZWl2ZWRbcG9zaXRpb25dID0gR0YyNTYuYWRkT3JTdWJ0cmFjdChyZWNlaXZlZFtwb3NpdGlvbl0sIGVycm9yTWFnbml0dWRlc1tpXSk7XG5cdFx0XHR9XG5cdH1cblxuXHR0aGlzLnJ1bkV1Y2xpZGVhbkFsZ29yaXRobT1mdW5jdGlvbiggYSwgIGIsICBSKVxuXHRcdHtcblx0XHRcdC8vIEFzc3VtZSBhJ3MgZGVncmVlIGlzID49IGInc1xuXHRcdFx0aWYgKGEuRGVncmVlIDwgYi5EZWdyZWUpXG5cdFx0XHR7XG5cdFx0XHRcdHZhciB0ZW1wID0gYTtcblx0XHRcdFx0YSA9IGI7XG5cdFx0XHRcdGIgPSB0ZW1wO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgckxhc3QgPSBhO1xuXHRcdFx0dmFyIHIgPSBiO1xuXHRcdFx0dmFyIHNMYXN0ID0gdGhpcy5maWVsZC5PbmU7XG5cdFx0XHR2YXIgcyA9IHRoaXMuZmllbGQuWmVybztcblx0XHRcdHZhciB0TGFzdCA9IHRoaXMuZmllbGQuWmVybztcblx0XHRcdHZhciB0ID0gdGhpcy5maWVsZC5PbmU7XG5cblx0XHRcdC8vIFJ1biBFdWNsaWRlYW4gYWxnb3JpdGhtIHVudGlsIHIncyBkZWdyZWUgaXMgbGVzcyB0aGFuIFIvMlxuXHRcdFx0d2hpbGUgKHIuRGVncmVlID49IE1hdGguZmxvb3IoUiAvIDIpKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgckxhc3RMYXN0ID0gckxhc3Q7XG5cdFx0XHRcdHZhciBzTGFzdExhc3QgPSBzTGFzdDtcblx0XHRcdFx0dmFyIHRMYXN0TGFzdCA9IHRMYXN0O1xuXHRcdFx0XHRyTGFzdCA9IHI7XG5cdFx0XHRcdHNMYXN0ID0gcztcblx0XHRcdFx0dExhc3QgPSB0O1xuXG5cdFx0XHRcdC8vIERpdmlkZSByTGFzdExhc3QgYnkgckxhc3QsIHdpdGggcXVvdGllbnQgaW4gcSBhbmQgcmVtYWluZGVyIGluIHJcblx0XHRcdFx0aWYgKHJMYXN0Llplcm8pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBPb3BzLCBFdWNsaWRlYW4gYWxnb3JpdGhtIGFscmVhZHkgdGVybWluYXRlZD9cblx0XHRcdFx0XHR0aHJvdyBcInJfe2ktMX0gd2FzIHplcm9cIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRyID0gckxhc3RMYXN0O1xuXHRcdFx0XHR2YXIgcSA9IHRoaXMuZmllbGQuWmVybztcblx0XHRcdFx0dmFyIGRlbm9taW5hdG9yTGVhZGluZ1Rlcm0gPSByTGFzdC5nZXRDb2VmZmljaWVudChyTGFzdC5EZWdyZWUpO1xuXHRcdFx0XHR2YXIgZGx0SW52ZXJzZSA9IHRoaXMuZmllbGQuaW52ZXJzZShkZW5vbWluYXRvckxlYWRpbmdUZXJtKTtcblx0XHRcdFx0d2hpbGUgKHIuRGVncmVlID49IHJMYXN0LkRlZ3JlZSAmJiAhci5aZXJvKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dmFyIGRlZ3JlZURpZmYgPSByLkRlZ3JlZSAtIHJMYXN0LkRlZ3JlZTtcblx0XHRcdFx0XHR2YXIgc2NhbGUgPSB0aGlzLmZpZWxkLm11bHRpcGx5KHIuZ2V0Q29lZmZpY2llbnQoci5EZWdyZWUpLCBkbHRJbnZlcnNlKTtcblx0XHRcdFx0XHRxID0gcS5hZGRPclN1YnRyYWN0KHRoaXMuZmllbGQuYnVpbGRNb25vbWlhbChkZWdyZWVEaWZmLCBzY2FsZSkpO1xuXHRcdFx0XHRcdHIgPSByLmFkZE9yU3VidHJhY3Qockxhc3QubXVsdGlwbHlCeU1vbm9taWFsKGRlZ3JlZURpZmYsIHNjYWxlKSk7XG5cdFx0XHRcdFx0Ly9yLkVYRSgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cyA9IHEubXVsdGlwbHkxKHNMYXN0KS5hZGRPclN1YnRyYWN0KHNMYXN0TGFzdCk7XG5cdFx0XHRcdHQgPSBxLm11bHRpcGx5MSh0TGFzdCkuYWRkT3JTdWJ0cmFjdCh0TGFzdExhc3QpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgc2lnbWFUaWxkZUF0WmVybyA9IHQuZ2V0Q29lZmZpY2llbnQoMCk7XG5cdFx0XHRpZiAoc2lnbWFUaWxkZUF0WmVybyA9PSAwKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBcIlJlZWRTb2xvbW9uRXhjZXB0aW9uIHNpZ21hVGlsZGUoMCkgd2FzIHplcm9cIjtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGludmVyc2UgPSB0aGlzLmZpZWxkLmludmVyc2Uoc2lnbWFUaWxkZUF0WmVybyk7XG5cdFx0XHR2YXIgc2lnbWEgPSB0Lm11bHRpcGx5MihpbnZlcnNlKTtcblx0XHRcdHZhciBvbWVnYSA9IHIubXVsdGlwbHkyKGludmVyc2UpO1xuXHRcdFx0cmV0dXJuIG5ldyBBcnJheShzaWdtYSwgb21lZ2EpO1xuXHRcdH1cblx0dGhpcy5maW5kRXJyb3JMb2NhdGlvbnM9ZnVuY3Rpb24oIGVycm9yTG9jYXRvcilcblx0XHR7XG5cdFx0XHQvLyBUaGlzIGlzIGEgZGlyZWN0IGFwcGxpY2F0aW9uIG9mIENoaWVuJ3Mgc2VhcmNoXG5cdFx0XHR2YXIgbnVtRXJyb3JzID0gZXJyb3JMb2NhdG9yLkRlZ3JlZTtcblx0XHRcdGlmIChudW1FcnJvcnMgPT0gMSlcblx0XHRcdHtcblx0XHRcdFx0Ly8gc2hvcnRjdXRcblx0XHRcdFx0cmV0dXJuIG5ldyBBcnJheShlcnJvckxvY2F0b3IuZ2V0Q29lZmZpY2llbnQoMSkpO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHJlc3VsdCA9IG5ldyBBcnJheShudW1FcnJvcnMpO1xuXHRcdFx0dmFyIGUgPSAwO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDE7IGkgPCAyNTYgJiYgZSA8IG51bUVycm9yczsgaSsrKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoZXJyb3JMb2NhdG9yLmV2YWx1YXRlQXQoaSkgPT0gMClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJlc3VsdFtlXSA9IHRoaXMuZmllbGQuaW52ZXJzZShpKTtcblx0XHRcdFx0XHRlKys7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChlICE9IG51bUVycm9ycylcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgXCJFcnJvciBsb2NhdG9yIGRlZ3JlZSBkb2VzIG5vdCBtYXRjaCBudW1iZXIgb2Ygcm9vdHNcIjtcblx0XHRcdH1cblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXHR0aGlzLmZpbmRFcnJvck1hZ25pdHVkZXM9ZnVuY3Rpb24oIGVycm9yRXZhbHVhdG9yLCAgZXJyb3JMb2NhdGlvbnMsICBkYXRhTWF0cml4KVxuXHRcdHtcblx0XHRcdC8vIFRoaXMgaXMgZGlyZWN0bHkgYXBwbHlpbmcgRm9ybmV5J3MgRm9ybXVsYVxuXHRcdFx0dmFyIHMgPSBlcnJvckxvY2F0aW9ucy5sZW5ndGg7XG5cdFx0XHR2YXIgcmVzdWx0ID0gbmV3IEFycmF5KHMpO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzOyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdHZhciB4aUludmVyc2UgPSB0aGlzLmZpZWxkLmludmVyc2UoZXJyb3JMb2NhdGlvbnNbaV0pO1xuXHRcdFx0XHR2YXIgZGVub21pbmF0b3IgPSAxO1xuXHRcdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHM7IGorKylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChpICE9IGopXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0ZGVub21pbmF0b3IgPSB0aGlzLmZpZWxkLm11bHRpcGx5KGRlbm9taW5hdG9yLCBHRjI1Ni5hZGRPclN1YnRyYWN0KDEsIHRoaXMuZmllbGQubXVsdGlwbHkoZXJyb3JMb2NhdGlvbnNbal0sIHhpSW52ZXJzZSkpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmVzdWx0W2ldID0gdGhpcy5maWVsZC5tdWx0aXBseShlcnJvckV2YWx1YXRvci5ldmFsdWF0ZUF0KHhpSW52ZXJzZSksIHRoaXMuZmllbGQuaW52ZXJzZShkZW5vbWluYXRvcikpO1xuXHRcdFx0XHQvLyBUaGFua3MgdG8gc2FuZm9yZHNxdWlyZXMgZm9yIHRoaXMgZml4OlxuXHRcdFx0XHRpZiAoZGF0YU1hdHJpeClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJlc3VsdFtpXSA9IHRoaXMuZmllbGQubXVsdGlwbHkocmVzdWx0W2ldLCB4aUludmVyc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cbn1cblxuLypcbiAgUG9ydGVkIHRvIEphdmFTY3JpcHQgYnkgTGF6YXIgTGFzemxvIDIwMTFcblxuICBsYXphcnNvZnRAZ21haWwuY29tLCB3d3cubGF6YXJzb2Z0LmluZm9cblxuKi9cblxuLypcbipcbiogQ29weXJpZ2h0IDIwMDcgWlhpbmcgYXV0aG9yc1xuKlxuKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4qIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuKlxuKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuKlxuKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4qIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4qIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5cbmZ1bmN0aW9uIEdGMjU2UG9seShmaWVsZCwgIGNvZWZmaWNpZW50cylcbntcblx0aWYgKGNvZWZmaWNpZW50cyA9PSBudWxsIHx8IGNvZWZmaWNpZW50cy5sZW5ndGggPT0gMClcblx0e1xuXHRcdHRocm93IFwiU3lzdGVtLkFyZ3VtZW50RXhjZXB0aW9uXCI7XG5cdH1cblx0dGhpcy5maWVsZCA9IGZpZWxkO1xuXHR2YXIgY29lZmZpY2llbnRzTGVuZ3RoID0gY29lZmZpY2llbnRzLmxlbmd0aDtcblx0aWYgKGNvZWZmaWNpZW50c0xlbmd0aCA+IDEgJiYgY29lZmZpY2llbnRzWzBdID09IDApXG5cdHtcblx0XHQvLyBMZWFkaW5nIHRlcm0gbXVzdCBiZSBub24temVybyBmb3IgYW55dGhpbmcgZXhjZXB0IHRoZSBjb25zdGFudCBwb2x5bm9taWFsIFwiMFwiXG5cdFx0dmFyIGZpcnN0Tm9uWmVybyA9IDE7XG5cdFx0d2hpbGUgKGZpcnN0Tm9uWmVybyA8IGNvZWZmaWNpZW50c0xlbmd0aCAmJiBjb2VmZmljaWVudHNbZmlyc3ROb25aZXJvXSA9PSAwKVxuXHRcdHtcblx0XHRcdGZpcnN0Tm9uWmVybysrO1xuXHRcdH1cblx0XHRpZiAoZmlyc3ROb25aZXJvID09IGNvZWZmaWNpZW50c0xlbmd0aClcblx0XHR7XG5cdFx0XHR0aGlzLmNvZWZmaWNpZW50cyA9IGZpZWxkLlplcm8uY29lZmZpY2llbnRzO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0dGhpcy5jb2VmZmljaWVudHMgPSBuZXcgQXJyYXkoY29lZmZpY2llbnRzTGVuZ3RoIC0gZmlyc3ROb25aZXJvKTtcblx0XHRcdGZvcih2YXIgaT0wO2k8dGhpcy5jb2VmZmljaWVudHMubGVuZ3RoO2krKyl0aGlzLmNvZWZmaWNpZW50c1tpXT0wO1xuXHRcdFx0Ly9BcnJheS5Db3B5KGNvZWZmaWNpZW50cywgZmlyc3ROb25aZXJvLCB0aGlzLmNvZWZmaWNpZW50cywgMCwgdGhpcy5jb2VmZmljaWVudHMubGVuZ3RoKTtcblx0XHRcdGZvcih2YXIgY2k9MDtjaTx0aGlzLmNvZWZmaWNpZW50cy5sZW5ndGg7Y2krKyl0aGlzLmNvZWZmaWNpZW50c1tjaV09Y29lZmZpY2llbnRzW2ZpcnN0Tm9uWmVybytjaV07XG5cdFx0fVxuXHR9XG5cdGVsc2Vcblx0e1xuXHRcdHRoaXMuY29lZmZpY2llbnRzID0gY29lZmZpY2llbnRzO1xuXHR9XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJaZXJvXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5jb2VmZmljaWVudHNbMF0gPT0gMDtcblx0fX0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIkRlZ3JlZVwiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuY29lZmZpY2llbnRzLmxlbmd0aCAtIDE7XG5cdH19KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJDb2VmZmljaWVudHNcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiB0aGlzLmNvZWZmaWNpZW50cztcblx0fX0pO1xuXG5cdHRoaXMuZ2V0Q29lZmZpY2llbnQ9ZnVuY3Rpb24oIGRlZ3JlZSlcblx0e1xuXHRcdHJldHVybiB0aGlzLmNvZWZmaWNpZW50c1t0aGlzLmNvZWZmaWNpZW50cy5sZW5ndGggLSAxIC0gZGVncmVlXTtcblx0fVxuXG5cdHRoaXMuZXZhbHVhdGVBdD1mdW5jdGlvbiggYSlcblx0e1xuXHRcdGlmIChhID09IDApXG5cdFx0e1xuXHRcdFx0Ly8gSnVzdCByZXR1cm4gdGhlIHheMCBjb2VmZmljaWVudFxuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0Q29lZmZpY2llbnQoMCk7XG5cdFx0fVxuXHRcdHZhciBzaXplID0gdGhpcy5jb2VmZmljaWVudHMubGVuZ3RoO1xuXHRcdGlmIChhID09IDEpXG5cdFx0e1xuXHRcdFx0Ly8gSnVzdCB0aGUgc3VtIG9mIHRoZSBjb2VmZmljaWVudHNcblx0XHRcdHZhciByZXN1bHQgPSAwO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzaXplOyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdHJlc3VsdCA9IEdGMjU2LmFkZE9yU3VidHJhY3QocmVzdWx0LCB0aGlzLmNvZWZmaWNpZW50c1tpXSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblx0XHR2YXIgcmVzdWx0MiA9IHRoaXMuY29lZmZpY2llbnRzWzBdO1xuXHRcdGZvciAodmFyIGkgPSAxOyBpIDwgc2l6ZTsgaSsrKVxuXHRcdHtcblx0XHRcdHJlc3VsdDIgPSBHRjI1Ni5hZGRPclN1YnRyYWN0KHRoaXMuZmllbGQubXVsdGlwbHkoYSwgcmVzdWx0MiksIHRoaXMuY29lZmZpY2llbnRzW2ldKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDI7XG5cdH1cblxuXHR0aGlzLmFkZE9yU3VidHJhY3Q9ZnVuY3Rpb24oIG90aGVyKVxuXHRcdHtcblx0XHRcdGlmICh0aGlzLmZpZWxkICE9IG90aGVyLmZpZWxkKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBcIkdGMjU2UG9seXMgZG8gbm90IGhhdmUgc2FtZSBHRjI1NiBmaWVsZFwiO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXMuWmVybylcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIG90aGVyO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG90aGVyLlplcm8pXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB0aGlzO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgc21hbGxlckNvZWZmaWNpZW50cyA9IHRoaXMuY29lZmZpY2llbnRzO1xuXHRcdFx0dmFyIGxhcmdlckNvZWZmaWNpZW50cyA9IG90aGVyLmNvZWZmaWNpZW50cztcblx0XHRcdGlmIChzbWFsbGVyQ29lZmZpY2llbnRzLmxlbmd0aCA+IGxhcmdlckNvZWZmaWNpZW50cy5sZW5ndGgpXG5cdFx0XHR7XG5cdFx0XHRcdHZhciB0ZW1wID0gc21hbGxlckNvZWZmaWNpZW50cztcblx0XHRcdFx0c21hbGxlckNvZWZmaWNpZW50cyA9IGxhcmdlckNvZWZmaWNpZW50cztcblx0XHRcdFx0bGFyZ2VyQ29lZmZpY2llbnRzID0gdGVtcDtcblx0XHRcdH1cblx0XHRcdHZhciBzdW1EaWZmID0gbmV3IEFycmF5KGxhcmdlckNvZWZmaWNpZW50cy5sZW5ndGgpO1xuXHRcdFx0dmFyIGxlbmd0aERpZmYgPSBsYXJnZXJDb2VmZmljaWVudHMubGVuZ3RoIC0gc21hbGxlckNvZWZmaWNpZW50cy5sZW5ndGg7XG5cdFx0XHQvLyBDb3B5IGhpZ2gtb3JkZXIgdGVybXMgb25seSBmb3VuZCBpbiBoaWdoZXItZGVncmVlIHBvbHlub21pYWwncyBjb2VmZmljaWVudHNcblx0XHRcdC8vQXJyYXkuQ29weShsYXJnZXJDb2VmZmljaWVudHMsIDAsIHN1bURpZmYsIDAsIGxlbmd0aERpZmYpO1xuXHRcdFx0Zm9yKHZhciBjaT0wO2NpPGxlbmd0aERpZmY7Y2krKylzdW1EaWZmW2NpXT1sYXJnZXJDb2VmZmljaWVudHNbY2ldO1xuXG5cdFx0XHRmb3IgKHZhciBpID0gbGVuZ3RoRGlmZjsgaSA8IGxhcmdlckNvZWZmaWNpZW50cy5sZW5ndGg7IGkrKylcblx0XHRcdHtcblx0XHRcdFx0c3VtRGlmZltpXSA9IEdGMjU2LmFkZE9yU3VidHJhY3Qoc21hbGxlckNvZWZmaWNpZW50c1tpIC0gbGVuZ3RoRGlmZl0sIGxhcmdlckNvZWZmaWNpZW50c1tpXSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBuZXcgR0YyNTZQb2x5KGZpZWxkLCBzdW1EaWZmKTtcblx0fVxuXHR0aGlzLm11bHRpcGx5MT1mdW5jdGlvbiggb3RoZXIpXG5cdFx0e1xuXHRcdFx0aWYgKHRoaXMuZmllbGQhPW90aGVyLmZpZWxkKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBcIkdGMjU2UG9seXMgZG8gbm90IGhhdmUgc2FtZSBHRjI1NiBmaWVsZFwiO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXMuWmVybyB8fCBvdGhlci5aZXJvKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5maWVsZC5aZXJvO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGFDb2VmZmljaWVudHMgPSB0aGlzLmNvZWZmaWNpZW50cztcblx0XHRcdHZhciBhTGVuZ3RoID0gYUNvZWZmaWNpZW50cy5sZW5ndGg7XG5cdFx0XHR2YXIgYkNvZWZmaWNpZW50cyA9IG90aGVyLmNvZWZmaWNpZW50cztcblx0XHRcdHZhciBiTGVuZ3RoID0gYkNvZWZmaWNpZW50cy5sZW5ndGg7XG5cdFx0XHR2YXIgcHJvZHVjdCA9IG5ldyBBcnJheShhTGVuZ3RoICsgYkxlbmd0aCAtIDEpO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhTGVuZ3RoOyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBhQ29lZmYgPSBhQ29lZmZpY2llbnRzW2ldO1xuXHRcdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGJMZW5ndGg7IGorKylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHByb2R1Y3RbaSArIGpdID0gR0YyNTYuYWRkT3JTdWJ0cmFjdChwcm9kdWN0W2kgKyBqXSwgdGhpcy5maWVsZC5tdWx0aXBseShhQ29lZmYsIGJDb2VmZmljaWVudHNbal0pKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG5ldyBHRjI1NlBvbHkodGhpcy5maWVsZCwgcHJvZHVjdCk7XG5cdFx0fVxuXHR0aGlzLm11bHRpcGx5Mj1mdW5jdGlvbiggc2NhbGFyKVxuXHRcdHtcblx0XHRcdGlmIChzY2FsYXIgPT0gMClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuZmllbGQuWmVybztcblx0XHRcdH1cblx0XHRcdGlmIChzY2FsYXIgPT0gMSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0XHR9XG5cdFx0XHR2YXIgc2l6ZSA9IHRoaXMuY29lZmZpY2llbnRzLmxlbmd0aDtcblx0XHRcdHZhciBwcm9kdWN0ID0gbmV3IEFycmF5KHNpemUpO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzaXplOyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdHByb2R1Y3RbaV0gPSB0aGlzLmZpZWxkLm11bHRpcGx5KHRoaXMuY29lZmZpY2llbnRzW2ldLCBzY2FsYXIpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG5ldyBHRjI1NlBvbHkodGhpcy5maWVsZCwgcHJvZHVjdCk7XG5cdFx0fVxuXHR0aGlzLm11bHRpcGx5QnlNb25vbWlhbD1mdW5jdGlvbiggZGVncmVlLCAgY29lZmZpY2llbnQpXG5cdFx0e1xuXHRcdFx0aWYgKGRlZ3JlZSA8IDApXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IFwiU3lzdGVtLkFyZ3VtZW50RXhjZXB0aW9uXCI7XG5cdFx0XHR9XG5cdFx0XHRpZiAoY29lZmZpY2llbnQgPT0gMClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuZmllbGQuWmVybztcblx0XHRcdH1cblx0XHRcdHZhciBzaXplID0gdGhpcy5jb2VmZmljaWVudHMubGVuZ3RoO1xuXHRcdFx0dmFyIHByb2R1Y3QgPSBuZXcgQXJyYXkoc2l6ZSArIGRlZ3JlZSk7XG5cdFx0XHRmb3IodmFyIGk9MDtpPHByb2R1Y3QubGVuZ3RoO2krKylwcm9kdWN0W2ldPTA7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNpemU7IGkrKylcblx0XHRcdHtcblx0XHRcdFx0cHJvZHVjdFtpXSA9IHRoaXMuZmllbGQubXVsdGlwbHkodGhpcy5jb2VmZmljaWVudHNbaV0sIGNvZWZmaWNpZW50KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBuZXcgR0YyNTZQb2x5KHRoaXMuZmllbGQsIHByb2R1Y3QpO1xuXHRcdH1cblx0dGhpcy5kaXZpZGU9ZnVuY3Rpb24oIG90aGVyKVxuXHRcdHtcblx0XHRcdGlmICh0aGlzLmZpZWxkIT1vdGhlci5maWVsZClcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgXCJHRjI1NlBvbHlzIGRvIG5vdCBoYXZlIHNhbWUgR0YyNTYgZmllbGRcIjtcblx0XHRcdH1cblx0XHRcdGlmIChvdGhlci5aZXJvKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBcIkRpdmlkZSBieSAwXCI7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBxdW90aWVudCA9IHRoaXMuZmllbGQuWmVybztcblx0XHRcdHZhciByZW1haW5kZXIgPSB0aGlzO1xuXG5cdFx0XHR2YXIgZGVub21pbmF0b3JMZWFkaW5nVGVybSA9IG90aGVyLmdldENvZWZmaWNpZW50KG90aGVyLkRlZ3JlZSk7XG5cdFx0XHR2YXIgaW52ZXJzZURlbm9taW5hdG9yTGVhZGluZ1Rlcm0gPSB0aGlzLmZpZWxkLmludmVyc2UoZGVub21pbmF0b3JMZWFkaW5nVGVybSk7XG5cblx0XHRcdHdoaWxlIChyZW1haW5kZXIuRGVncmVlID49IG90aGVyLkRlZ3JlZSAmJiAhcmVtYWluZGVyLlplcm8pXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBkZWdyZWVEaWZmZXJlbmNlID0gcmVtYWluZGVyLkRlZ3JlZSAtIG90aGVyLkRlZ3JlZTtcblx0XHRcdFx0dmFyIHNjYWxlID0gdGhpcy5maWVsZC5tdWx0aXBseShyZW1haW5kZXIuZ2V0Q29lZmZpY2llbnQocmVtYWluZGVyLkRlZ3JlZSksIGludmVyc2VEZW5vbWluYXRvckxlYWRpbmdUZXJtKTtcblx0XHRcdFx0dmFyIHRlcm0gPSBvdGhlci5tdWx0aXBseUJ5TW9ub21pYWwoZGVncmVlRGlmZmVyZW5jZSwgc2NhbGUpO1xuXHRcdFx0XHR2YXIgaXRlcmF0aW9uUXVvdGllbnQgPSB0aGlzLmZpZWxkLmJ1aWxkTW9ub21pYWwoZGVncmVlRGlmZmVyZW5jZSwgc2NhbGUpO1xuXHRcdFx0XHRxdW90aWVudCA9IHF1b3RpZW50LmFkZE9yU3VidHJhY3QoaXRlcmF0aW9uUXVvdGllbnQpO1xuXHRcdFx0XHRyZW1haW5kZXIgPSByZW1haW5kZXIuYWRkT3JTdWJ0cmFjdCh0ZXJtKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG5ldyBBcnJheShxdW90aWVudCwgcmVtYWluZGVyKTtcblx0XHR9XG59XG5cbi8qXG4gIFBvcnRlZCB0byBKYXZhU2NyaXB0IGJ5IExhemFyIExhc3psbyAyMDExXG5cbiAgbGF6YXJzb2Z0QGdtYWlsLmNvbSwgd3d3LmxhemFyc29mdC5pbmZvXG5cbiovXG5cbi8qXG4qXG4qIENvcHlyaWdodCAyMDA3IFpYaW5nIGF1dGhvcnNcbipcbiogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbipcbiogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbipcbiogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4qIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4qIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuXG5mdW5jdGlvbiBHRjI1NiggcHJpbWl0aXZlKVxue1xuXHR0aGlzLmV4cFRhYmxlID0gbmV3IEFycmF5KDI1Nik7XG5cdHRoaXMubG9nVGFibGUgPSBuZXcgQXJyYXkoMjU2KTtcblx0dmFyIHggPSAxO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IDI1NjsgaSsrKVxuXHR7XG5cdFx0dGhpcy5leHBUYWJsZVtpXSA9IHg7XG5cdFx0eCA8PD0gMTsgLy8geCA9IHggKiAyOyB3ZSdyZSBhc3N1bWluZyB0aGUgZ2VuZXJhdG9yIGFscGhhIGlzIDJcblx0XHRpZiAoeCA+PSAweDEwMClcblx0XHR7XG5cdFx0XHR4IF49IHByaW1pdGl2ZTtcblx0XHR9XG5cdH1cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCAyNTU7IGkrKylcblx0e1xuXHRcdHRoaXMubG9nVGFibGVbdGhpcy5leHBUYWJsZVtpXV0gPSBpO1xuXHR9XG5cdC8vIGxvZ1RhYmxlWzBdID09IDAgYnV0IHRoaXMgc2hvdWxkIG5ldmVyIGJlIHVzZWRcblx0dmFyIGF0MD1uZXcgQXJyYXkoMSk7YXQwWzBdPTA7XG5cdHRoaXMuemVybyA9IG5ldyBHRjI1NlBvbHkodGhpcywgbmV3IEFycmF5KGF0MCkpO1xuXHR2YXIgYXQxPW5ldyBBcnJheSgxKTthdDFbMF09MTtcblx0dGhpcy5vbmUgPSBuZXcgR0YyNTZQb2x5KHRoaXMsIG5ldyBBcnJheShhdDEpKTtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIlplcm9cIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiB0aGlzLnplcm87XG5cdH19KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJPbmVcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiB0aGlzLm9uZTtcblx0fX0pO1xuXHR0aGlzLmJ1aWxkTW9ub21pYWw9ZnVuY3Rpb24oIGRlZ3JlZSwgIGNvZWZmaWNpZW50KVxuXHRcdHtcblx0XHRcdGlmIChkZWdyZWUgPCAwKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBcIlN5c3RlbS5Bcmd1bWVudEV4Y2VwdGlvblwiO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGNvZWZmaWNpZW50ID09IDApXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB6ZXJvO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGNvZWZmaWNpZW50cyA9IG5ldyBBcnJheShkZWdyZWUgKyAxKTtcblx0XHRcdGZvcih2YXIgaT0wO2k8Y29lZmZpY2llbnRzLmxlbmd0aDtpKyspY29lZmZpY2llbnRzW2ldPTA7XG5cdFx0XHRjb2VmZmljaWVudHNbMF0gPSBjb2VmZmljaWVudDtcblx0XHRcdHJldHVybiBuZXcgR0YyNTZQb2x5KHRoaXMsIGNvZWZmaWNpZW50cyk7XG5cdFx0fVxuXHR0aGlzLmV4cD1mdW5jdGlvbiggYSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gdGhpcy5leHBUYWJsZVthXTtcblx0XHR9XG5cdHRoaXMubG9nPWZ1bmN0aW9uKCBhKVxuXHRcdHtcblx0XHRcdGlmIChhID09IDApXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IFwiU3lzdGVtLkFyZ3VtZW50RXhjZXB0aW9uXCI7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGhpcy5sb2dUYWJsZVthXTtcblx0XHR9XG5cdHRoaXMuaW52ZXJzZT1mdW5jdGlvbiggYSlcblx0XHR7XG5cdFx0XHRpZiAoYSA9PSAwKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBcIlN5c3RlbS5Bcml0aG1ldGljRXhjZXB0aW9uXCI7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGhpcy5leHBUYWJsZVsyNTUgLSB0aGlzLmxvZ1RhYmxlW2FdXTtcblx0XHR9XG5cdHRoaXMubXVsdGlwbHk9ZnVuY3Rpb24oIGEsICBiKVxuXHRcdHtcblx0XHRcdGlmIChhID09IDAgfHwgYiA9PSAwKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gMDtcblx0XHRcdH1cblx0XHRcdGlmIChhID09IDEpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBiO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGIgPT0gMSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGE7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGhpcy5leHBUYWJsZVsodGhpcy5sb2dUYWJsZVthXSArIHRoaXMubG9nVGFibGVbYl0pICUgMjU1XTtcblx0XHR9XG59XG5cbkdGMjU2LlFSX0NPREVfRklFTEQgPSBuZXcgR0YyNTYoMHgwMTFEKTtcbkdGMjU2LkRBVEFfTUFUUklYX0ZJRUxEID0gbmV3IEdGMjU2KDB4MDEyRCk7XG5cbkdGMjU2LmFkZE9yU3VidHJhY3Q9ZnVuY3Rpb24oIGEsICBiKVxue1xuXHRyZXR1cm4gYSBeIGI7XG59XG5cbi8qXG4gIFBvcnRlZCB0byBKYXZhU2NyaXB0IGJ5IExhemFyIExhc3psbyAyMDExXG5cbiAgbGF6YXJzb2Z0QGdtYWlsLmNvbSwgd3d3LmxhemFyc29mdC5pbmZvXG5cbiovXG5cbi8qXG4qXG4qIENvcHlyaWdodCAyMDA3IFpYaW5nIGF1dGhvcnNcbipcbiogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbipcbiogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbipcbiogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4qIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4qIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuXG52YXIgRGVjb2Rlcj17fTtcbkRlY29kZXIucnNEZWNvZGVyID0gbmV3IFJlZWRTb2xvbW9uRGVjb2RlcihHRjI1Ni5RUl9DT0RFX0ZJRUxEKTtcblxuRGVjb2Rlci5jb3JyZWN0RXJyb3JzPWZ1bmN0aW9uKCBjb2Rld29yZEJ5dGVzLCAgbnVtRGF0YUNvZGV3b3Jkcylcbntcblx0dmFyIG51bUNvZGV3b3JkcyA9IGNvZGV3b3JkQnl0ZXMubGVuZ3RoO1xuXHQvLyBGaXJzdCByZWFkIGludG8gYW4gYXJyYXkgb2YgaW50c1xuXHR2YXIgY29kZXdvcmRzSW50cyA9IG5ldyBBcnJheShudW1Db2Rld29yZHMpO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IG51bUNvZGV3b3JkczsgaSsrKVxuXHR7XG5cdFx0Y29kZXdvcmRzSW50c1tpXSA9IGNvZGV3b3JkQnl0ZXNbaV0gJiAweEZGO1xuXHR9XG5cdHZhciBudW1FQ0NvZGV3b3JkcyA9IGNvZGV3b3JkQnl0ZXMubGVuZ3RoIC0gbnVtRGF0YUNvZGV3b3Jkcztcblx0dHJ5XG5cdHtcblx0XHREZWNvZGVyLnJzRGVjb2Rlci5kZWNvZGUoY29kZXdvcmRzSW50cywgbnVtRUNDb2Rld29yZHMpO1xuXHRcdC8vdmFyIGNvcnJlY3RvciA9IG5ldyBSZWVkU29sb21vbihjb2Rld29yZHNJbnRzLCBudW1FQ0NvZGV3b3Jkcyk7XG5cdFx0Ly9jb3JyZWN0b3IuY29ycmVjdCgpO1xuXHR9XG5cdGNhdGNoICggcnNlKVxuXHR7XG5cdFx0dGhyb3cgcnNlO1xuXHR9XG5cdC8vIENvcHkgYmFjayBpbnRvIGFycmF5IG9mIGJ5dGVzIC0tIG9ubHkgbmVlZCB0byB3b3JyeSBhYm91dCB0aGUgYnl0ZXMgdGhhdCB3ZXJlIGRhdGFcblx0Ly8gV2UgZG9uJ3QgY2FyZSBhYm91dCBlcnJvcnMgaW4gdGhlIGVycm9yLWNvcnJlY3Rpb24gY29kZXdvcmRzXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbnVtRGF0YUNvZGV3b3JkczsgaSsrKVxuXHR7XG5cdFx0Y29kZXdvcmRCeXRlc1tpXSA9ICBjb2Rld29yZHNJbnRzW2ldO1xuXHR9XG59XG5cbkRlY29kZXIuZGVjb2RlPWZ1bmN0aW9uKGJpdHMpXG57XG5cdHZhciBwYXJzZXIgPSBuZXcgQml0TWF0cml4UGFyc2VyKGJpdHMpO1xuXHR2YXIgdmVyc2lvbiA9IHBhcnNlci5yZWFkVmVyc2lvbigpO1xuXHR2YXIgZWNMZXZlbCA9IHBhcnNlci5yZWFkRm9ybWF0SW5mb3JtYXRpb24oKS5FcnJvckNvcnJlY3Rpb25MZXZlbDtcblxuXHQvLyBSZWFkIGNvZGV3b3Jkc1xuXHR2YXIgY29kZXdvcmRzID0gcGFyc2VyLnJlYWRDb2Rld29yZHMoKTtcblxuXHQvLyBTZXBhcmF0ZSBpbnRvIGRhdGEgYmxvY2tzXG5cdHZhciBkYXRhQmxvY2tzID0gRGF0YUJsb2NrLmdldERhdGFCbG9ja3MoY29kZXdvcmRzLCB2ZXJzaW9uLCBlY0xldmVsKTtcblxuXHQvLyBDb3VudCB0b3RhbCBudW1iZXIgb2YgZGF0YSBieXRlc1xuXHR2YXIgdG90YWxCeXRlcyA9IDA7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YUJsb2Nrcy5sZW5ndGg7IGkrKylcblx0e1xuXHRcdHRvdGFsQnl0ZXMgKz0gZGF0YUJsb2Nrc1tpXS5OdW1EYXRhQ29kZXdvcmRzO1xuXHR9XG5cdHZhciByZXN1bHRCeXRlcyA9IG5ldyBBcnJheSh0b3RhbEJ5dGVzKTtcblx0dmFyIHJlc3VsdE9mZnNldCA9IDA7XG5cblx0Ly8gRXJyb3ItY29ycmVjdCBhbmQgY29weSBkYXRhIGJsb2NrcyB0b2dldGhlciBpbnRvIGEgc3RyZWFtIG9mIGJ5dGVzXG5cdGZvciAodmFyIGogPSAwOyBqIDwgZGF0YUJsb2Nrcy5sZW5ndGg7IGorKylcblx0e1xuXHRcdHZhciBkYXRhQmxvY2sgPSBkYXRhQmxvY2tzW2pdO1xuXHRcdHZhciBjb2Rld29yZEJ5dGVzID0gZGF0YUJsb2NrLkNvZGV3b3Jkcztcblx0XHR2YXIgbnVtRGF0YUNvZGV3b3JkcyA9IGRhdGFCbG9jay5OdW1EYXRhQ29kZXdvcmRzO1xuXHRcdERlY29kZXIuY29ycmVjdEVycm9ycyhjb2Rld29yZEJ5dGVzLCBudW1EYXRhQ29kZXdvcmRzKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG51bURhdGFDb2Rld29yZHM7IGkrKylcblx0XHR7XG5cdFx0XHRyZXN1bHRCeXRlc1tyZXN1bHRPZmZzZXQrK10gPSBjb2Rld29yZEJ5dGVzW2ldO1xuXHRcdH1cblx0fVxuXG5cdC8vIERlY29kZSB0aGUgY29udGVudHMgb2YgdGhhdCBzdHJlYW0gb2YgYnl0ZXNcblx0dmFyIHJlYWRlciA9IG5ldyBRUkNvZGVEYXRhQmxvY2tSZWFkZXIocmVzdWx0Qnl0ZXMsIHZlcnNpb24uVmVyc2lvbk51bWJlciwgZWNMZXZlbC5CaXRzKTtcblx0cmV0dXJuIHJlYWRlcjtcblx0Ly9yZXR1cm4gRGVjb2RlZEJpdFN0cmVhbVBhcnNlci5kZWNvZGUocmVzdWx0Qnl0ZXMsIHZlcnNpb24sIGVjTGV2ZWwpO1xufVxuXG4vKlxuICAgQ29weXJpZ2h0IDIwMTEgTGF6YXIgTGFzemxvIChsYXphcnNvZnRAZ21haWwuY29tLCB3d3cubGF6YXJzb2Z0LmluZm8pXG5cbiAgIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gICB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG4gICBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gICBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gICBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAgIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAgIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxudmFyIHFyY29kZSA9IHt9O1xucXJjb2RlLnNpemVPZkRhdGFMZW5ndGhJbmZvID0gIFsgIFsgMTAsIDksIDgsIDggXSwgIFsgMTIsIDExLCAxNiwgMTAgXSwgIFsgMTQsIDEzLCAxNiwgMTIgXSBdO1xuXG5RckNvZGUgPSBmdW5jdGlvbiAoKSB7XG5cbnRoaXMuaW1hZ2VkYXRhID0gbnVsbDtcbnRoaXMud2lkdGggPSAwO1xudGhpcy5oZWlnaHQgPSAwO1xudGhpcy5xckNvZGVTeW1ib2wgPSBudWxsO1xudGhpcy5kZWJ1ZyA9IGZhbHNlO1xuXG50aGlzLmNhbGxiYWNrID0gbnVsbDtcblxudGhpcy5kZWNvZGUgPSBmdW5jdGlvbihzcmMsIGRhdGEpe1xuXG4gICAgdmFyIGRlY29kZSA9IChmdW5jdGlvbigpIHtcblxuICAgICAgICB0cnkge1xuXHRcdFx0dGhpcy5yZXN1bHQgPSB0aGlzLnByb2Nlc3ModGhpcy5pbWFnZWRhdGEpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLnJlc3VsdCA9IFwiZXJyb3IgZGVjb2RpbmcgUVIgQ29kZTogXCIgKyBlO1xuICAgICAgICB9XG5cblx0XHRpZiAodGhpcy5jYWxsYmFjayE9bnVsbCkge1xuXG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrKHRoaXMucmVzdWx0KTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gdGhpcy5yZXN1bHQ7XG5cbiAgICB9KS5iaW5kKHRoaXMpO1xuXG4gICAgLyogZGVjb2RlIGZyb20gY2FudmFzICNxci1jYW52YXMgKi9cblx0aWYgKHNyYyA9PSB1bmRlZmluZWQpIHtcblxuXHRcdHZhciBjYW52YXNfcXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInFyLWNhbnZhc1wiKTtcblx0XHR2YXIgY29udGV4dCA9IGNhbnZhc19xci5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdCAgICB0aGlzLndpZHRoID0gY2FudmFzX3FyLndpZHRoO1xuXHRcdHRoaXMuaGVpZ2h0ID0gY2FudmFzX3FyLmhlaWdodDtcblx0XHR0aGlzLmltYWdlZGF0YSA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcblxuICAgICAgICBkZWNvZGUoKTtcblx0fVxuXG5cdC8qIGRlY29kZSBmcm9tIGNhbnZhcyBjYW52YXMuY29udGV4dC5nZXRJbWFnZURhdGEgKi9cbiAgICBlbHNlIGlmIChzcmMud2lkdGggIT0gdW5kZWZpbmVkKSB7XG5cblx0XHR0aGlzLndpZHRoPXNyYy53aWR0aFxuXHRcdHRoaXMuaGVpZ2h0PXNyYy5oZWlnaHRcblx0XHR0aGlzLmltYWdlZGF0YT17IFwiZGF0YVwiOiBkYXRhIHx8IHNyYy5kYXRhIH1cblx0XHR0aGlzLmltYWdlZGF0YS53aWR0aD1zcmMud2lkdGhcblx0XHR0aGlzLmltYWdlZGF0YS5oZWlnaHQ9c3JjLmhlaWdodFxuXG4gICAgICAgIGRlY29kZSgpO1xuXHR9XG5cbiAgICAvKiBkZWNvZGUgZnJvbSBVUkwgKi9cblx0ZWxzZSB7XG5cblx0XHR2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcblx0XHR2YXIgX3RoaXMgPSB0aGlzXG5cbiAgICAgICAgaW1hZ2Uub25sb2FkID0gKGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR2YXIgY2FudmFzX3FyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cdFx0XHR2YXIgY29udGV4dCA9IGNhbnZhc19xci5nZXRDb250ZXh0KCcyZCcpO1xuXHRcdFx0dmFyIGNhbnZhc19vdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm91dC1jYW52YXNcIik7XG5cblx0XHRcdGlmIChjYW52YXNfb3V0ICE9IG51bGwpIHtcblxuICAgICAgICAgICAgICAgIHZhciBvdXRjdHggPSBjYW52YXNfb3V0LmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgICAgICAgICAgb3V0Y3R4LmNsZWFyUmVjdCgwLCAwLCAzMjAsIDI0MCk7XG5cdFx0XHRcdG91dGN0eC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDAsIDMyMCwgMjQwKTtcbiAgICAgICAgICAgIH1cblxuXHRcdFx0Y2FudmFzX3FyLndpZHRoID0gaW1hZ2Uud2lkdGg7XG5cdFx0XHRjYW52YXNfcXIuaGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0O1xuICAgICAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDApO1xuXHRcdFx0dGhpcy53aWR0aCA9IGltYWdlLndpZHRoO1xuXHRcdFx0dGhpcy5oZWlnaHQgPSBpbWFnZS5oZWlnaHQ7XG5cblx0XHRcdHRyeXtcblx0XHRcdFx0dGhpcy5pbWFnZWRhdGEgPSBjb250ZXh0LmdldEltYWdlRGF0YSgwLCAwLCBpbWFnZS53aWR0aCwgaW1hZ2UuaGVpZ2h0KTtcblx0XHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0XHR0aGlzLnJlc3VsdCA9IFwiQ3Jvc3MgZG9tYWluIGltYWdlIHJlYWRpbmcgbm90IHN1cHBvcnRlZCBpbiB5b3VyIGJyb3dzZXIhIFNhdmUgaXQgdG8geW91ciBjb21wdXRlciB0aGVuIGRyYWcgYW5kIGRyb3AgdGhlIGZpbGUhXCI7XG5cdFx0XHRcdGlmICh0aGlzLmNhbGxiYWNrIT1udWxsKSByZXR1cm4gdGhpcy5jYWxsYmFjayh0aGlzLnJlc3VsdCk7XG5cdFx0XHR9XG5cbiAgICAgICAgICAgIGRlY29kZSgpO1xuXG5cdFx0fSkuYmluZCh0aGlzKTtcblxuXHRcdGltYWdlLnNyYyA9IHNyYztcblx0fVxufTtcblxudGhpcy5kZWNvZGVfdXRmOCA9IGZ1bmN0aW9uICggcyApIHtcblxuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoIGVzY2FwZSggcyApICk7XG59XG5cbnRoaXMucHJvY2VzcyA9IGZ1bmN0aW9uKGltYWdlRGF0YSkge1xuXG5cdHZhciBzdGFydCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG5cdHZhciBpbWFnZSA9IHRoaXMuZ3JheVNjYWxlVG9CaXRtYXAodGhpcy5ncmF5c2NhbGUoaW1hZ2VEYXRhKSk7XG5cblx0Ly92YXIgZmluZGVyUGF0dGVybkluZm8gPSBuZXcgRmluZGVyUGF0dGVybkZpbmRlcigpLmZpbmRGaW5kZXJQYXR0ZXJuKGltYWdlKTtcblxuXHR2YXIgZGV0ZWN0b3IgPSBuZXcgRGV0ZWN0b3IoaW1hZ2UpO1xuXG5cdHZhciBxUkNvZGVNYXRyaXggPSBkZXRlY3Rvci5kZXRlY3QoKTtcblxuXHQvKmZvciAodmFyIHkgPSAwOyB5IDwgcVJDb2RlTWF0cml4LmJpdHMuSGVpZ2h0OyB5KyspXG5cdHtcblx0XHRmb3IgKHZhciB4ID0gMDsgeCA8IHFSQ29kZU1hdHJpeC5iaXRzLldpZHRoOyB4KyspXG5cdFx0e1xuXHRcdFx0dmFyIHBvaW50ID0gKHggKiA0KjIpICsgKHkqMiAqIGltYWdlRGF0YS53aWR0aCAqIDQpO1xuXHRcdFx0aW1hZ2VEYXRhLmRhdGFbcG9pbnRdID0gcVJDb2RlTWF0cml4LmJpdHMuZ2V0X1JlbmFtZWQoeCx5KT8wOjA7XG5cdFx0XHRpbWFnZURhdGEuZGF0YVtwb2ludCsxXSA9IHFSQ29kZU1hdHJpeC5iaXRzLmdldF9SZW5hbWVkKHgseSk/MDowO1xuXHRcdFx0aW1hZ2VEYXRhLmRhdGFbcG9pbnQrMl0gPSBxUkNvZGVNYXRyaXguYml0cy5nZXRfUmVuYW1lZCh4LHkpPzI1NTowO1xuXHRcdH1cblx0fSovXG5cblx0dmFyIHJlYWRlciA9IERlY29kZXIuZGVjb2RlKHFSQ29kZU1hdHJpeC5iaXRzKTtcblx0dmFyIGRhdGEgPSByZWFkZXIuRGF0YUJ5dGU7XG5cdHZhciBzdHI9XCJcIjtcblx0Zm9yKHZhciBpPTA7aTxkYXRhLmxlbmd0aDtpKyspXG5cdHtcblx0XHRmb3IodmFyIGo9MDtqPGRhdGFbaV0ubGVuZ3RoO2orKylcblx0XHRcdHN0cis9U3RyaW5nLmZyb21DaGFyQ29kZShkYXRhW2ldW2pdKTtcblx0fVxuXG5cdHZhciBlbmQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblx0dmFyIHRpbWUgPSBlbmQgLSBzdGFydDtcblx0aWYgKHRoaXMuZGVidWcpIHtcblx0XHRjb25zb2xlLmxvZygnUVIgQ29kZSBwcm9jZXNzaW5nIHRpbWUgKG1zKTogJyArIHRpbWUpO1xuXHR9XG5cblx0cmV0dXJuIHRoaXMuZGVjb2RlX3V0Zjgoc3RyKTtcblx0Ly9hbGVydChcIlRpbWU6XCIgKyB0aW1lICsgXCIgQ29kZTogXCIrc3RyKTtcbn1cblxudGhpcy5nZXRQaXhlbCA9IGZ1bmN0aW9uKGltYWdlRGF0YSwgeCx5KXtcblx0aWYgKGltYWdlRGF0YS53aWR0aCA8IHgpIHtcblx0XHR0aHJvdyBcInBvaW50IGVycm9yXCI7XG5cdH1cblx0aWYgKGltYWdlRGF0YS5oZWlnaHQgPCB5KSB7XG5cdFx0dGhyb3cgXCJwb2ludCBlcnJvclwiO1xuXHR9XG5cdHBvaW50ID0gKHggKiA0KSArICh5ICogaW1hZ2VEYXRhLndpZHRoICogNCk7XG5cdHAgPSAoaW1hZ2VEYXRhLmRhdGFbcG9pbnRdKjMzICsgaW1hZ2VEYXRhLmRhdGFbcG9pbnQgKyAxXSozNCArIGltYWdlRGF0YS5kYXRhW3BvaW50ICsgMl0qMzMpLzEwMDtcblx0cmV0dXJuIHA7XG59XG5cbnRoaXMuYmluYXJpemUgPSBmdW5jdGlvbih0aCl7XG5cdHZhciByZXQgPSBuZXcgQXJyYXkodGhpcy53aWR0aCp0aGlzLmhlaWdodCk7XG5cdGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKylcblx0e1xuXHRcdGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKVxuXHRcdHtcblx0XHRcdHZhciBncmF5ID0gdGhpcy5nZXRQaXhlbCh4LCB5KTtcblxuXHRcdFx0cmV0W3greSp0aGlzLndpZHRoXSA9IGdyYXk8PXRoP3RydWU6ZmFsc2U7XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZXQ7XG59XG5cbnRoaXMuZ2V0TWlkZGxlQnJpZ2h0bmVzc1BlckFyZWE9ZnVuY3Rpb24oaW1hZ2VEYXRhKVxue1xuXHR2YXIgbnVtU3FydEFyZWEgPSA0O1xuXHQvL29idGFpbiBtaWRkbGUgYnJpZ2h0bmVzcygobWluICsgbWF4KSAvIDIpIHBlciBhcmVhXG5cdHZhciBhcmVhV2lkdGggPSBNYXRoLmZsb29yKGltYWdlRGF0YS53aWR0aCAvIG51bVNxcnRBcmVhKTtcblx0dmFyIGFyZWFIZWlnaHQgPSBNYXRoLmZsb29yKGltYWdlRGF0YS5oZWlnaHQgLyBudW1TcXJ0QXJlYSk7XG5cdHZhciBtaW5tYXggPSBuZXcgQXJyYXkobnVtU3FydEFyZWEpO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IG51bVNxcnRBcmVhOyBpKyspXG5cdHtcblx0XHRtaW5tYXhbaV0gPSBuZXcgQXJyYXkobnVtU3FydEFyZWEpO1xuXHRcdGZvciAodmFyIGkyID0gMDsgaTIgPCBudW1TcXJ0QXJlYTsgaTIrKylcblx0XHR7XG5cdFx0XHRtaW5tYXhbaV1baTJdID0gbmV3IEFycmF5KDAsMCk7XG5cdFx0fVxuXHR9XG5cdGZvciAodmFyIGF5ID0gMDsgYXkgPCBudW1TcXJ0QXJlYTsgYXkrKylcblx0e1xuXHRcdGZvciAodmFyIGF4ID0gMDsgYXggPCBudW1TcXJ0QXJlYTsgYXgrKylcblx0XHR7XG5cdFx0XHRtaW5tYXhbYXhdW2F5XVswXSA9IDB4RkY7XG5cdFx0XHRmb3IgKHZhciBkeSA9IDA7IGR5IDwgYXJlYUhlaWdodDsgZHkrKylcblx0XHRcdHtcblx0XHRcdFx0Zm9yICh2YXIgZHggPSAwOyBkeCA8IGFyZWFXaWR0aDsgZHgrKylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZhciB0YXJnZXQgPSBpbWFnZURhdGEuZGF0YVthcmVhV2lkdGggKiBheCArIGR4KyhhcmVhSGVpZ2h0ICogYXkgKyBkeSkqaW1hZ2VEYXRhLndpZHRoXTtcblx0XHRcdFx0XHRpZiAodGFyZ2V0IDwgbWlubWF4W2F4XVtheV1bMF0pXG5cdFx0XHRcdFx0XHRtaW5tYXhbYXhdW2F5XVswXSA9IHRhcmdldDtcblx0XHRcdFx0XHRpZiAodGFyZ2V0ID4gbWlubWF4W2F4XVtheV1bMV0pXG5cdFx0XHRcdFx0XHRtaW5tYXhbYXhdW2F5XVsxXSA9IHRhcmdldDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly9taW5tYXhbYXhdW2F5XVswXSA9IChtaW5tYXhbYXhdW2F5XVswXSArIG1pbm1heFtheF1bYXldWzFdKSAvIDI7XG5cdFx0fVxuXHR9XG5cdHZhciBtaWRkbGUgPSBuZXcgQXJyYXkobnVtU3FydEFyZWEpO1xuXHRmb3IgKHZhciBpMyA9IDA7IGkzIDwgbnVtU3FydEFyZWE7IGkzKyspXG5cdHtcblx0XHRtaWRkbGVbaTNdID0gbmV3IEFycmF5KG51bVNxcnRBcmVhKTtcblx0fVxuXHRmb3IgKHZhciBheSA9IDA7IGF5IDwgbnVtU3FydEFyZWE7IGF5KyspXG5cdHtcblx0XHRmb3IgKHZhciBheCA9IDA7IGF4IDwgbnVtU3FydEFyZWE7IGF4KyspXG5cdFx0e1xuXHRcdFx0bWlkZGxlW2F4XVtheV0gPSBNYXRoLmZsb29yKChtaW5tYXhbYXhdW2F5XVswXSArIG1pbm1heFtheF1bYXldWzFdKSAvIDIpO1xuXHRcdFx0Ly9Db25zb2xlLm91dC5wcmludChtaWRkbGVbYXhdW2F5XSArIFwiLFwiKTtcblx0XHR9XG5cdFx0Ly9Db25zb2xlLm91dC5wcmludGxuKFwiXCIpO1xuXHR9XG5cdC8vQ29uc29sZS5vdXQucHJpbnRsbihcIlwiKTtcblxuXHRyZXR1cm4gbWlkZGxlO1xufVxuXG50aGlzLmdyYXlTY2FsZVRvQml0bWFwPWZ1bmN0aW9uKGdyYXlTY2FsZUltYWdlRGF0YSlcbntcblx0dmFyIG1pZGRsZSA9IHRoaXMuZ2V0TWlkZGxlQnJpZ2h0bmVzc1BlckFyZWEoZ3JheVNjYWxlSW1hZ2VEYXRhKTtcblx0dmFyIHNxcnROdW1BcmVhID0gbWlkZGxlLmxlbmd0aDtcblx0dmFyIGFyZWFXaWR0aCA9IE1hdGguZmxvb3IoZ3JheVNjYWxlSW1hZ2VEYXRhLndpZHRoIC8gc3FydE51bUFyZWEpO1xuXHR2YXIgYXJlYUhlaWdodCA9IE1hdGguZmxvb3IoZ3JheVNjYWxlSW1hZ2VEYXRhLmhlaWdodCAvIHNxcnROdW1BcmVhKTtcblxuXHRmb3IgKHZhciBheSA9IDA7IGF5IDwgc3FydE51bUFyZWE7IGF5KyspXG5cdHtcblx0XHRmb3IgKHZhciBheCA9IDA7IGF4IDwgc3FydE51bUFyZWE7IGF4KyspXG5cdFx0e1xuXHRcdFx0Zm9yICh2YXIgZHkgPSAwOyBkeSA8IGFyZWFIZWlnaHQ7IGR5KyspXG5cdFx0XHR7XG5cdFx0XHRcdGZvciAodmFyIGR4ID0gMDsgZHggPCBhcmVhV2lkdGg7IGR4KyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRncmF5U2NhbGVJbWFnZURhdGEuZGF0YVthcmVhV2lkdGggKiBheCArIGR4KyAoYXJlYUhlaWdodCAqIGF5ICsgZHkpKmdyYXlTY2FsZUltYWdlRGF0YS53aWR0aF0gPSAoZ3JheVNjYWxlSW1hZ2VEYXRhLmRhdGFbYXJlYVdpZHRoICogYXggKyBkeCsgKGFyZWFIZWlnaHQgKiBheSArIGR5KSpncmF5U2NhbGVJbWFnZURhdGEud2lkdGhdIDwgbWlkZGxlW2F4XVtheV0pP3RydWU6ZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIGdyYXlTY2FsZUltYWdlRGF0YTtcbn1cblxudGhpcy5ncmF5c2NhbGUgPSBmdW5jdGlvbihpbWFnZURhdGEpe1xuXHR2YXIgcmV0ID0gbmV3IEFycmF5KGltYWdlRGF0YS53aWR0aCppbWFnZURhdGEuaGVpZ2h0KTtcblxuXHRmb3IgKHZhciB5ID0gMDsgeSA8IGltYWdlRGF0YS5oZWlnaHQ7IHkrKylcblx0e1xuXHRcdGZvciAodmFyIHggPSAwOyB4IDwgaW1hZ2VEYXRhLndpZHRoOyB4KyspXG5cdFx0e1xuXHRcdFx0dmFyIGdyYXkgPSB0aGlzLmdldFBpeGVsKGltYWdlRGF0YSwgeCwgeSk7XG5cblx0XHRcdHJldFt4K3kqaW1hZ2VEYXRhLndpZHRoXSA9IGdyYXk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRoZWlnaHQ6IGltYWdlRGF0YS5oZWlnaHQsXG5cdFx0d2lkdGg6IGltYWdlRGF0YS53aWR0aCxcblx0XHRkYXRhOiByZXRcblx0fTtcbn1cblxuICB9XG5cbmZ1bmN0aW9uIFVSU2hpZnQoIG51bWJlciwgIGJpdHMpXG57XG5cdGlmIChudW1iZXIgPj0gMClcblx0XHRyZXR1cm4gbnVtYmVyID4+IGJpdHM7XG5cdGVsc2Vcblx0XHRyZXR1cm4gKG51bWJlciA+PiBiaXRzKSArICgyIDw8IH5iaXRzKTtcbn1cblxuLypcbiAgUG9ydGVkIHRvIEphdmFTY3JpcHQgYnkgTGF6YXIgTGFzemxvIDIwMTFcblxuICBsYXphcnNvZnRAZ21haWwuY29tLCB3d3cubGF6YXJzb2Z0LmluZm9cblxuKi9cblxuLypcbipcbiogQ29weXJpZ2h0IDIwMDcgWlhpbmcgYXV0aG9yc1xuKlxuKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4qIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuKlxuKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuKlxuKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4qIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4qIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5cbnZhciBNSU5fU0tJUCA9IDM7XG52YXIgTUFYX01PRFVMRVMgPSA1NztcbnZhciBJTlRFR0VSX01BVEhfU0hJRlQgPSA4O1xudmFyIENFTlRFUl9RVU9SVU0gPSAyO1xuXG5xcmNvZGUub3JkZXJCZXN0UGF0dGVybnM9ZnVuY3Rpb24ocGF0dGVybnMpXG5cdFx0e1xuXG5cdFx0XHRmdW5jdGlvbiBkaXN0YW5jZSggcGF0dGVybjEsICBwYXR0ZXJuMilcblx0XHRcdHtcblx0XHRcdFx0eERpZmYgPSBwYXR0ZXJuMS5YIC0gcGF0dGVybjIuWDtcblx0XHRcdFx0eURpZmYgPSBwYXR0ZXJuMS5ZIC0gcGF0dGVybjIuWTtcblx0XHRcdFx0cmV0dXJuICBNYXRoLnNxcnQoICh4RGlmZiAqIHhEaWZmICsgeURpZmYgKiB5RGlmZikpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLy8gPHN1bW1hcnk+IFJldHVybnMgdGhlIHogY29tcG9uZW50IG9mIHRoZSBjcm9zcyBwcm9kdWN0IGJldHdlZW4gdmVjdG9ycyBCQyBhbmQgQkEuPC9zdW1tYXJ5PlxuXHRcdFx0ZnVuY3Rpb24gY3Jvc3NQcm9kdWN0WiggcG9pbnRBLCAgcG9pbnRCLCAgcG9pbnRDKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgYlggPSBwb2ludEIueDtcblx0XHRcdFx0dmFyIGJZID0gcG9pbnRCLnk7XG5cdFx0XHRcdHJldHVybiAoKHBvaW50Qy54IC0gYlgpICogKHBvaW50QS55IC0gYlkpKSAtICgocG9pbnRDLnkgLSBiWSkgKiAocG9pbnRBLnggLSBiWCkpO1xuXHRcdFx0fVxuXG5cblx0XHRcdC8vIEZpbmQgZGlzdGFuY2VzIGJldHdlZW4gcGF0dGVybiBjZW50ZXJzXG5cdFx0XHR2YXIgemVyb09uZURpc3RhbmNlID0gZGlzdGFuY2UocGF0dGVybnNbMF0sIHBhdHRlcm5zWzFdKTtcblx0XHRcdHZhciBvbmVUd29EaXN0YW5jZSA9IGRpc3RhbmNlKHBhdHRlcm5zWzFdLCBwYXR0ZXJuc1syXSk7XG5cdFx0XHR2YXIgemVyb1R3b0Rpc3RhbmNlID0gZGlzdGFuY2UocGF0dGVybnNbMF0sIHBhdHRlcm5zWzJdKTtcblxuXHRcdFx0dmFyIHBvaW50QSwgcG9pbnRCLCBwb2ludEM7XG5cdFx0XHQvLyBBc3N1bWUgb25lIGNsb3Nlc3QgdG8gb3RoZXIgdHdvIGlzIEI7IEEgYW5kIEMgd2lsbCBqdXN0IGJlIGd1ZXNzZXMgYXQgZmlyc3Rcblx0XHRcdGlmIChvbmVUd29EaXN0YW5jZSA+PSB6ZXJvT25lRGlzdGFuY2UgJiYgb25lVHdvRGlzdGFuY2UgPj0gemVyb1R3b0Rpc3RhbmNlKVxuXHRcdFx0e1xuXHRcdFx0XHRwb2ludEIgPSBwYXR0ZXJuc1swXTtcblx0XHRcdFx0cG9pbnRBID0gcGF0dGVybnNbMV07XG5cdFx0XHRcdHBvaW50QyA9IHBhdHRlcm5zWzJdO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoemVyb1R3b0Rpc3RhbmNlID49IG9uZVR3b0Rpc3RhbmNlICYmIHplcm9Ud29EaXN0YW5jZSA+PSB6ZXJvT25lRGlzdGFuY2UpXG5cdFx0XHR7XG5cdFx0XHRcdHBvaW50QiA9IHBhdHRlcm5zWzFdO1xuXHRcdFx0XHRwb2ludEEgPSBwYXR0ZXJuc1swXTtcblx0XHRcdFx0cG9pbnRDID0gcGF0dGVybnNbMl07XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdHBvaW50QiA9IHBhdHRlcm5zWzJdO1xuXHRcdFx0XHRwb2ludEEgPSBwYXR0ZXJuc1swXTtcblx0XHRcdFx0cG9pbnRDID0gcGF0dGVybnNbMV07XG5cdFx0XHR9XG5cblx0XHRcdC8vIFVzZSBjcm9zcyBwcm9kdWN0IHRvIGZpZ3VyZSBvdXQgd2hldGhlciBBIGFuZCBDIGFyZSBjb3JyZWN0IG9yIGZsaXBwZWQuXG5cdFx0XHQvLyBUaGlzIGFza3Mgd2hldGhlciBCQyB4IEJBIGhhcyBhIHBvc2l0aXZlIHogY29tcG9uZW50LCB3aGljaCBpcyB0aGUgYXJyYW5nZW1lbnRcblx0XHRcdC8vIHdlIHdhbnQgZm9yIEEsIEIsIEMuIElmIGl0J3MgbmVnYXRpdmUsIHRoZW4gd2UndmUgZ290IGl0IGZsaXBwZWQgYXJvdW5kIGFuZFxuXHRcdFx0Ly8gc2hvdWxkIHN3YXAgQSBhbmQgQy5cblx0XHRcdGlmIChjcm9zc1Byb2R1Y3RaKHBvaW50QSwgcG9pbnRCLCBwb2ludEMpIDwgMC4wKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgdGVtcCA9IHBvaW50QTtcblx0XHRcdFx0cG9pbnRBID0gcG9pbnRDO1xuXHRcdFx0XHRwb2ludEMgPSB0ZW1wO1xuXHRcdFx0fVxuXG5cdFx0XHRwYXR0ZXJuc1swXSA9IHBvaW50QTtcblx0XHRcdHBhdHRlcm5zWzFdID0gcG9pbnRCO1xuXHRcdFx0cGF0dGVybnNbMl0gPSBwb2ludEM7XG5cdFx0fVxuXG5cbmZ1bmN0aW9uIEZpbmRlclBhdHRlcm4ocG9zWCwgcG9zWSwgIGVzdGltYXRlZE1vZHVsZVNpemUpXG57XG5cdHRoaXMueD1wb3NYO1xuXHR0aGlzLnk9cG9zWTtcblx0dGhpcy5jb3VudCA9IDE7XG5cdHRoaXMuZXN0aW1hdGVkTW9kdWxlU2l6ZSA9IGVzdGltYXRlZE1vZHVsZVNpemU7XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJFc3RpbWF0ZWRNb2R1bGVTaXplXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5lc3RpbWF0ZWRNb2R1bGVTaXplO1xuXHR9fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiQ291bnRcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiB0aGlzLmNvdW50O1xuXHR9fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiWFwiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMueDtcblx0fX0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIllcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiB0aGlzLnk7XG5cdH19KTtcblx0dGhpcy5pbmNyZW1lbnRDb3VudCA9IGZ1bmN0aW9uKClcblx0e1xuXHRcdHRoaXMuY291bnQrKztcblx0fVxuXHR0aGlzLmFib3V0RXF1YWxzPWZ1bmN0aW9uKCBtb2R1bGVTaXplLCAgaSwgIGopXG5cdFx0e1xuXHRcdFx0aWYgKE1hdGguYWJzKGkgLSB0aGlzLnkpIDw9IG1vZHVsZVNpemUgJiYgTWF0aC5hYnMoaiAtIHRoaXMueCkgPD0gbW9kdWxlU2l6ZSlcblx0XHRcdHtcblx0XHRcdFx0dmFyIG1vZHVsZVNpemVEaWZmID0gTWF0aC5hYnMobW9kdWxlU2l6ZSAtIHRoaXMuZXN0aW1hdGVkTW9kdWxlU2l6ZSk7XG5cdFx0XHRcdHJldHVybiBtb2R1bGVTaXplRGlmZiA8PSAxLjAgfHwgbW9kdWxlU2l6ZURpZmYgLyB0aGlzLmVzdGltYXRlZE1vZHVsZVNpemUgPD0gMS4wO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxufVxuXG5mdW5jdGlvbiBGaW5kZXJQYXR0ZXJuSW5mbyhwYXR0ZXJuQ2VudGVycylcbntcblx0dGhpcy5ib3R0b21MZWZ0ID0gcGF0dGVybkNlbnRlcnNbMF07XG5cdHRoaXMudG9wTGVmdCA9IHBhdHRlcm5DZW50ZXJzWzFdO1xuXHR0aGlzLnRvcFJpZ2h0ID0gcGF0dGVybkNlbnRlcnNbMl07XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiQm90dG9tTGVmdFwiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuYm90dG9tTGVmdDtcblx0fX0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIlRvcExlZnRcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiB0aGlzLnRvcExlZnQ7XG5cdH19KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJUb3BSaWdodFwiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMudG9wUmlnaHQ7XG5cdH19KTtcbn1cblxuZnVuY3Rpb24gRmluZGVyUGF0dGVybkZpbmRlcigpXG57XG5cdHRoaXMuaW1hZ2U9bnVsbDtcblx0dGhpcy5wb3NzaWJsZUNlbnRlcnMgPSBbXTtcblx0dGhpcy5oYXNTa2lwcGVkID0gZmFsc2U7XG5cdHRoaXMuY3Jvc3NDaGVja1N0YXRlQ291bnQgPSBuZXcgQXJyYXkoMCwwLDAsMCwwKTtcblx0dGhpcy5yZXN1bHRQb2ludENhbGxiYWNrID0gbnVsbDtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIkNyb3NzQ2hlY2tTdGF0ZUNvdW50XCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHR0aGlzLmNyb3NzQ2hlY2tTdGF0ZUNvdW50WzBdID0gMDtcblx0XHR0aGlzLmNyb3NzQ2hlY2tTdGF0ZUNvdW50WzFdID0gMDtcblx0XHR0aGlzLmNyb3NzQ2hlY2tTdGF0ZUNvdW50WzJdID0gMDtcblx0XHR0aGlzLmNyb3NzQ2hlY2tTdGF0ZUNvdW50WzNdID0gMDtcblx0XHR0aGlzLmNyb3NzQ2hlY2tTdGF0ZUNvdW50WzRdID0gMDtcblx0XHRyZXR1cm4gdGhpcy5jcm9zc0NoZWNrU3RhdGVDb3VudDtcblx0fX0pO1xuXG5cdHRoaXMuZm91bmRQYXR0ZXJuQ3Jvc3M9ZnVuY3Rpb24oIHN0YXRlQ291bnQpXG5cdFx0e1xuXHRcdFx0dmFyIHRvdGFsTW9kdWxlU2l6ZSA9IDA7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IDU7IGkrKylcblx0XHRcdHtcblx0XHRcdFx0dmFyIGNvdW50ID0gc3RhdGVDb3VudFtpXTtcblx0XHRcdFx0aWYgKGNvdW50ID09IDApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdFx0dG90YWxNb2R1bGVTaXplICs9IGNvdW50O1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRvdGFsTW9kdWxlU2l6ZSA8IDcpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdHZhciBtb2R1bGVTaXplID0gTWF0aC5mbG9vcigodG90YWxNb2R1bGVTaXplIDw8IElOVEVHRVJfTUFUSF9TSElGVCkgLyA3KTtcblx0XHRcdHZhciBtYXhWYXJpYW5jZSA9IE1hdGguZmxvb3IobW9kdWxlU2l6ZSAvIDIpO1xuXHRcdFx0Ly8gQWxsb3cgbGVzcyB0aGFuIDUwJSB2YXJpYW5jZSBmcm9tIDEtMS0zLTEtMSBwcm9wb3J0aW9uc1xuXHRcdFx0cmV0dXJuIE1hdGguYWJzKG1vZHVsZVNpemUgLSAoc3RhdGVDb3VudFswXSA8PCBJTlRFR0VSX01BVEhfU0hJRlQpKSA8IG1heFZhcmlhbmNlICYmIE1hdGguYWJzKG1vZHVsZVNpemUgLSAoc3RhdGVDb3VudFsxXSA8PCBJTlRFR0VSX01BVEhfU0hJRlQpKSA8IG1heFZhcmlhbmNlICYmIE1hdGguYWJzKDMgKiBtb2R1bGVTaXplIC0gKHN0YXRlQ291bnRbMl0gPDwgSU5URUdFUl9NQVRIX1NISUZUKSkgPCAzICogbWF4VmFyaWFuY2UgJiYgTWF0aC5hYnMobW9kdWxlU2l6ZSAtIChzdGF0ZUNvdW50WzNdIDw8IElOVEVHRVJfTUFUSF9TSElGVCkpIDwgbWF4VmFyaWFuY2UgJiYgTWF0aC5hYnMobW9kdWxlU2l6ZSAtIChzdGF0ZUNvdW50WzRdIDw8IElOVEVHRVJfTUFUSF9TSElGVCkpIDwgbWF4VmFyaWFuY2U7XG5cdFx0fVxuXHR0aGlzLmNlbnRlckZyb21FbmQ9ZnVuY3Rpb24oIHN0YXRlQ291bnQsICBlbmQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICAoZW5kIC0gc3RhdGVDb3VudFs0XSAtIHN0YXRlQ291bnRbM10pIC0gc3RhdGVDb3VudFsyXSAvIDIuMDtcblx0XHR9XG5cdHRoaXMuY3Jvc3NDaGVja1ZlcnRpY2FsPWZ1bmN0aW9uKCBzdGFydEksICBjZW50ZXJKLCAgbWF4Q291bnQsICBvcmlnaW5hbFN0YXRlQ291bnRUb3RhbClcblx0XHR7XG5cdFx0XHR2YXIgaW1hZ2UgPSB0aGlzLmltYWdlO1xuXG5cdFx0XHR2YXIgbWF4SSA9IGltYWdlLmhlaWdodDtcblx0XHRcdHZhciBzdGF0ZUNvdW50ID0gdGhpcy5Dcm9zc0NoZWNrU3RhdGVDb3VudDtcblxuXHRcdFx0Ly8gU3RhcnQgY291bnRpbmcgdXAgZnJvbSBjZW50ZXJcblx0XHRcdHZhciBpID0gc3RhcnRJO1xuXHRcdFx0d2hpbGUgKGkgPj0gMCAmJiBpbWFnZS5kYXRhW2NlbnRlckogKyBpKmltYWdlLndpZHRoXSlcblx0XHRcdHtcblx0XHRcdFx0c3RhdGVDb3VudFsyXSsrO1xuXHRcdFx0XHRpLS07XG5cdFx0XHR9XG5cdFx0XHRpZiAoaSA8IDApXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBOYU47XG5cdFx0XHR9XG5cdFx0XHR3aGlsZSAoaSA+PSAwICYmICFpbWFnZS5kYXRhW2NlbnRlckogK2kqaW1hZ2Uud2lkdGhdICYmIHN0YXRlQ291bnRbMV0gPD0gbWF4Q291bnQpXG5cdFx0XHR7XG5cdFx0XHRcdHN0YXRlQ291bnRbMV0rKztcblx0XHRcdFx0aS0tO1xuXHRcdFx0fVxuXHRcdFx0Ly8gSWYgYWxyZWFkeSB0b28gbWFueSBtb2R1bGVzIGluIHRoaXMgc3RhdGUgb3IgcmFuIG9mZiB0aGUgZWRnZTpcblx0XHRcdGlmIChpIDwgMCB8fCBzdGF0ZUNvdW50WzFdID4gbWF4Q291bnQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBOYU47XG5cdFx0XHR9XG5cdFx0XHR3aGlsZSAoaSA+PSAwICYmIGltYWdlLmRhdGFbY2VudGVySiArIGkqaW1hZ2Uud2lkdGhdICYmIHN0YXRlQ291bnRbMF0gPD0gbWF4Q291bnQpXG5cdFx0XHR7XG5cdFx0XHRcdHN0YXRlQ291bnRbMF0rKztcblx0XHRcdFx0aS0tO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHN0YXRlQ291bnRbMF0gPiBtYXhDb3VudClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIE5hTjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gTm93IGFsc28gY291bnQgZG93biBmcm9tIGNlbnRlclxuXHRcdFx0aSA9IHN0YXJ0SSArIDE7XG5cdFx0XHR3aGlsZSAoaSA8IG1heEkgJiYgaW1hZ2UuZGF0YVtjZW50ZXJKICtpKmltYWdlLndpZHRoXSlcblx0XHRcdHtcblx0XHRcdFx0c3RhdGVDb3VudFsyXSsrO1xuXHRcdFx0XHRpKys7XG5cdFx0XHR9XG5cdFx0XHRpZiAoaSA9PSBtYXhJKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gTmFOO1xuXHRcdFx0fVxuXHRcdFx0d2hpbGUgKGkgPCBtYXhJICYmICFpbWFnZS5kYXRhW2NlbnRlckogKyBpKmltYWdlLndpZHRoXSAmJiBzdGF0ZUNvdW50WzNdIDwgbWF4Q291bnQpXG5cdFx0XHR7XG5cdFx0XHRcdHN0YXRlQ291bnRbM10rKztcblx0XHRcdFx0aSsrO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGkgPT0gbWF4SSB8fCBzdGF0ZUNvdW50WzNdID49IG1heENvdW50KVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gTmFOO1xuXHRcdFx0fVxuXHRcdFx0d2hpbGUgKGkgPCBtYXhJICYmIGltYWdlLmRhdGFbY2VudGVySiArIGkqaW1hZ2Uud2lkdGhdICYmIHN0YXRlQ291bnRbNF0gPCBtYXhDb3VudClcblx0XHRcdHtcblx0XHRcdFx0c3RhdGVDb3VudFs0XSsrO1xuXHRcdFx0XHRpKys7XG5cdFx0XHR9XG5cdFx0XHRpZiAoc3RhdGVDb3VudFs0XSA+PSBtYXhDb3VudClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIE5hTjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gSWYgd2UgZm91bmQgYSBmaW5kZXItcGF0dGVybi1saWtlIHNlY3Rpb24sIGJ1dCBpdHMgc2l6ZSBpcyBtb3JlIHRoYW4gNDAlIGRpZmZlcmVudCB0aGFuXG5cdFx0XHQvLyB0aGUgb3JpZ2luYWwsIGFzc3VtZSBpdCdzIGEgZmFsc2UgcG9zaXRpdmVcblx0XHRcdHZhciBzdGF0ZUNvdW50VG90YWwgPSBzdGF0ZUNvdW50WzBdICsgc3RhdGVDb3VudFsxXSArIHN0YXRlQ291bnRbMl0gKyBzdGF0ZUNvdW50WzNdICsgc3RhdGVDb3VudFs0XTtcblx0XHRcdGlmICg1ICogTWF0aC5hYnMoc3RhdGVDb3VudFRvdGFsIC0gb3JpZ2luYWxTdGF0ZUNvdW50VG90YWwpID49IDIgKiBvcmlnaW5hbFN0YXRlQ291bnRUb3RhbClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIE5hTjtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRoaXMuZm91bmRQYXR0ZXJuQ3Jvc3Moc3RhdGVDb3VudCk/dGhpcy5jZW50ZXJGcm9tRW5kKHN0YXRlQ291bnQsIGkpOk5hTjtcblx0XHR9XG5cdHRoaXMuY3Jvc3NDaGVja0hvcml6b250YWw9ZnVuY3Rpb24oIHN0YXJ0SiwgIGNlbnRlckksICBtYXhDb3VudCwgb3JpZ2luYWxTdGF0ZUNvdW50VG90YWwpXG5cdFx0e1xuXHRcdFx0dmFyIGltYWdlID0gdGhpcy5pbWFnZTtcblxuXHRcdFx0dmFyIG1heEogPSBpbWFnZS53aWR0aDtcblx0XHRcdHZhciBzdGF0ZUNvdW50ID0gdGhpcy5Dcm9zc0NoZWNrU3RhdGVDb3VudDtcblxuXHRcdFx0dmFyIGogPSBzdGFydEo7XG5cdFx0XHR3aGlsZSAoaiA+PSAwICYmIGltYWdlLmRhdGFbaisgY2VudGVySSppbWFnZS53aWR0aF0pXG5cdFx0XHR7XG5cdFx0XHRcdHN0YXRlQ291bnRbMl0rKztcblx0XHRcdFx0ai0tO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGogPCAwKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gTmFOO1xuXHRcdFx0fVxuXHRcdFx0d2hpbGUgKGogPj0gMCAmJiAhaW1hZ2UuZGF0YVtqKyBjZW50ZXJJKmltYWdlLndpZHRoXSAmJiBzdGF0ZUNvdW50WzFdIDw9IG1heENvdW50KVxuXHRcdFx0e1xuXHRcdFx0XHRzdGF0ZUNvdW50WzFdKys7XG5cdFx0XHRcdGotLTtcblx0XHRcdH1cblx0XHRcdGlmIChqIDwgMCB8fCBzdGF0ZUNvdW50WzFdID4gbWF4Q291bnQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBOYU47XG5cdFx0XHR9XG5cdFx0XHR3aGlsZSAoaiA+PSAwICYmIGltYWdlLmRhdGFbaisgY2VudGVySSppbWFnZS53aWR0aF0gJiYgc3RhdGVDb3VudFswXSA8PSBtYXhDb3VudClcblx0XHRcdHtcblx0XHRcdFx0c3RhdGVDb3VudFswXSsrO1xuXHRcdFx0XHRqLS07XG5cdFx0XHR9XG5cdFx0XHRpZiAoc3RhdGVDb3VudFswXSA+IG1heENvdW50KVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gTmFOO1xuXHRcdFx0fVxuXG5cdFx0XHRqID0gc3RhcnRKICsgMTtcblx0XHRcdHdoaWxlIChqIDwgbWF4SiAmJiBpbWFnZS5kYXRhW2orIGNlbnRlckkqaW1hZ2Uud2lkdGhdKVxuXHRcdFx0e1xuXHRcdFx0XHRzdGF0ZUNvdW50WzJdKys7XG5cdFx0XHRcdGorKztcblx0XHRcdH1cblx0XHRcdGlmIChqID09IG1heEopXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBOYU47XG5cdFx0XHR9XG5cdFx0XHR3aGlsZSAoaiA8IG1heEogJiYgIWltYWdlLmRhdGFbaisgY2VudGVySSppbWFnZS53aWR0aF0gJiYgc3RhdGVDb3VudFszXSA8IG1heENvdW50KVxuXHRcdFx0e1xuXHRcdFx0XHRzdGF0ZUNvdW50WzNdKys7XG5cdFx0XHRcdGorKztcblx0XHRcdH1cblx0XHRcdGlmIChqID09IG1heEogfHwgc3RhdGVDb3VudFszXSA+PSBtYXhDb3VudClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIE5hTjtcblx0XHRcdH1cblx0XHRcdHdoaWxlIChqIDwgbWF4SiAmJiBpbWFnZS5kYXRhW2orIGNlbnRlckkqaW1hZ2Uud2lkdGhdICYmIHN0YXRlQ291bnRbNF0gPCBtYXhDb3VudClcblx0XHRcdHtcblx0XHRcdFx0c3RhdGVDb3VudFs0XSsrO1xuXHRcdFx0XHRqKys7XG5cdFx0XHR9XG5cdFx0XHRpZiAoc3RhdGVDb3VudFs0XSA+PSBtYXhDb3VudClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIE5hTjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gSWYgd2UgZm91bmQgYSBmaW5kZXItcGF0dGVybi1saWtlIHNlY3Rpb24sIGJ1dCBpdHMgc2l6ZSBpcyBzaWduaWZpY2FudGx5IGRpZmZlcmVudCB0aGFuXG5cdFx0XHQvLyB0aGUgb3JpZ2luYWwsIGFzc3VtZSBpdCdzIGEgZmFsc2UgcG9zaXRpdmVcblx0XHRcdHZhciBzdGF0ZUNvdW50VG90YWwgPSBzdGF0ZUNvdW50WzBdICsgc3RhdGVDb3VudFsxXSArIHN0YXRlQ291bnRbMl0gKyBzdGF0ZUNvdW50WzNdICsgc3RhdGVDb3VudFs0XTtcblx0XHRcdGlmICg1ICogTWF0aC5hYnMoc3RhdGVDb3VudFRvdGFsIC0gb3JpZ2luYWxTdGF0ZUNvdW50VG90YWwpID49IG9yaWdpbmFsU3RhdGVDb3VudFRvdGFsKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gTmFOO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGhpcy5mb3VuZFBhdHRlcm5Dcm9zcyhzdGF0ZUNvdW50KT90aGlzLmNlbnRlckZyb21FbmQoc3RhdGVDb3VudCwgaik6TmFOO1xuXHRcdH1cblx0dGhpcy5oYW5kbGVQb3NzaWJsZUNlbnRlcj1mdW5jdGlvbiggc3RhdGVDb3VudCwgIGksICBqKVxuXHRcdHtcblx0XHRcdHZhciBzdGF0ZUNvdW50VG90YWwgPSBzdGF0ZUNvdW50WzBdICsgc3RhdGVDb3VudFsxXSArIHN0YXRlQ291bnRbMl0gKyBzdGF0ZUNvdW50WzNdICsgc3RhdGVDb3VudFs0XTtcblx0XHRcdHZhciBjZW50ZXJKID0gdGhpcy5jZW50ZXJGcm9tRW5kKHN0YXRlQ291bnQsIGopOyAvL2Zsb2F0XG5cdFx0XHR2YXIgY2VudGVySSA9IHRoaXMuY3Jvc3NDaGVja1ZlcnRpY2FsKGksIE1hdGguZmxvb3IoIGNlbnRlckopLCBzdGF0ZUNvdW50WzJdLCBzdGF0ZUNvdW50VG90YWwpOyAvL2Zsb2F0XG5cdFx0XHRpZiAoIWlzTmFOKGNlbnRlckkpKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBSZS1jcm9zcyBjaGVja1xuXHRcdFx0XHRjZW50ZXJKID0gdGhpcy5jcm9zc0NoZWNrSG9yaXpvbnRhbChNYXRoLmZsb29yKCBjZW50ZXJKKSwgTWF0aC5mbG9vciggY2VudGVySSksIHN0YXRlQ291bnRbMl0sIHN0YXRlQ291bnRUb3RhbCk7XG5cdFx0XHRcdGlmICghaXNOYU4oY2VudGVySikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2YXIgZXN0aW1hdGVkTW9kdWxlU2l6ZSA9ICAgc3RhdGVDb3VudFRvdGFsIC8gNy4wO1xuXHRcdFx0XHRcdHZhciBmb3VuZCA9IGZhbHNlO1xuXHRcdFx0XHRcdHZhciBtYXggPSB0aGlzLnBvc3NpYmxlQ2VudGVycy5sZW5ndGg7XG5cdFx0XHRcdFx0Zm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IG1heDsgaW5kZXgrKylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR2YXIgY2VudGVyID0gdGhpcy5wb3NzaWJsZUNlbnRlcnNbaW5kZXhdO1xuXHRcdFx0XHRcdFx0Ly8gTG9vayBmb3IgYWJvdXQgdGhlIHNhbWUgY2VudGVyIGFuZCBtb2R1bGUgc2l6ZTpcblx0XHRcdFx0XHRcdGlmIChjZW50ZXIuYWJvdXRFcXVhbHMoZXN0aW1hdGVkTW9kdWxlU2l6ZSwgY2VudGVySSwgY2VudGVySikpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGNlbnRlci5pbmNyZW1lbnRDb3VudCgpO1xuXHRcdFx0XHRcdFx0XHRmb3VuZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoIWZvdW5kKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHZhciBwb2ludCA9IG5ldyBGaW5kZXJQYXR0ZXJuKGNlbnRlckosIGNlbnRlckksIGVzdGltYXRlZE1vZHVsZVNpemUpO1xuXHRcdFx0XHRcdFx0dGhpcy5wb3NzaWJsZUNlbnRlcnMucHVzaChwb2ludCk7XG5cdFx0XHRcdFx0XHRpZiAodGhpcy5yZXN1bHRQb2ludENhbGxiYWNrICE9IG51bGwpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHRoaXMucmVzdWx0UG9pbnRDYWxsYmFjay5mb3VuZFBvc3NpYmxlUmVzdWx0UG9pbnQocG9pbnQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHR0aGlzLnNlbGVjdEJlc3RQYXR0ZXJucz1mdW5jdGlvbigpXG5cdFx0e1xuXG5cdFx0XHR2YXIgc3RhcnRTaXplID0gdGhpcy5wb3NzaWJsZUNlbnRlcnMubGVuZ3RoO1xuXHRcdFx0aWYgKHN0YXJ0U2l6ZSA8IDMpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIENvdWxkbid0IGZpbmQgZW5vdWdoIGZpbmRlciBwYXR0ZXJuc1xuXHRcdFx0XHR0aHJvdyBcIkNvdWxkbid0IGZpbmQgZW5vdWdoIGZpbmRlciBwYXR0ZXJuczpcIitzdGFydFNpemUrXCIgcGF0dGVybnMgZm91bmRcIjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gRmlsdGVyIG91dGxpZXIgcG9zc2liaWxpdGllcyB3aG9zZSBtb2R1bGUgc2l6ZSBpcyB0b28gZGlmZmVyZW50XG5cdFx0XHRpZiAoc3RhcnRTaXplID4gMylcblx0XHRcdHtcblx0XHRcdFx0Ly8gQnV0IHdlIGNhbiBvbmx5IGFmZm9yZCB0byBkbyBzbyBpZiB3ZSBoYXZlIGF0IGxlYXN0IDQgcG9zc2liaWxpdGllcyB0byBjaG9vc2UgZnJvbVxuXHRcdFx0XHR2YXIgdG90YWxNb2R1bGVTaXplID0gMC4wO1xuICAgICAgICAgICAgICAgIHZhciBzcXVhcmUgPSAwLjA7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc3RhcnRTaXplOyBpKyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvL3RvdGFsTW9kdWxlU2l6ZSArPSAgdGhpcy5wb3NzaWJsZUNlbnRlcnNbaV0uRXN0aW1hdGVkTW9kdWxlU2l6ZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyXHRjZW50ZXJWYWx1ZT10aGlzLnBvc3NpYmxlQ2VudGVyc1tpXS5Fc3RpbWF0ZWRNb2R1bGVTaXplO1xuXHRcdFx0XHRcdHRvdGFsTW9kdWxlU2l6ZSArPSBjZW50ZXJWYWx1ZTtcblx0XHRcdFx0XHRzcXVhcmUgKz0gKGNlbnRlclZhbHVlICogY2VudGVyVmFsdWUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZhciBhdmVyYWdlID0gdG90YWxNb2R1bGVTaXplIC8gIHN0YXJ0U2l6ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnBvc3NpYmxlQ2VudGVycy5zb3J0KGZ1bmN0aW9uKGNlbnRlcjEsY2VudGVyMikge1xuXHRcdFx0XHQgICAgICB2YXIgZEE9TWF0aC5hYnMoY2VudGVyMi5Fc3RpbWF0ZWRNb2R1bGVTaXplIC0gYXZlcmFnZSk7XG5cdFx0XHRcdCAgICAgIHZhciBkQj1NYXRoLmFicyhjZW50ZXIxLkVzdGltYXRlZE1vZHVsZVNpemUgLSBhdmVyYWdlKTtcblx0XHRcdFx0ICAgICAgaWYgKGRBIDwgZEIpIHtcblx0XHRcdFx0XHRcdHJldHVybiAoLTEpO1xuXHRcdFx0XHQgICAgICB9IGVsc2UgaWYgKGRBID09IGRCKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gMDtcblx0XHRcdFx0ICAgICAgfSBlbHNlIHtcblx0XHRcdFx0XHRcdHJldHVybiAxO1xuXHRcdFx0XHQgICAgICB9XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dmFyIHN0ZERldiA9IE1hdGguc3FydChzcXVhcmUgLyBzdGFydFNpemUgLSBhdmVyYWdlICogYXZlcmFnZSk7XG5cdFx0XHRcdHZhciBsaW1pdCA9IE1hdGgubWF4KDAuMiAqIGF2ZXJhZ2UsIHN0ZERldik7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wb3NzaWJsZUNlbnRlcnMubGVuZ3RoICYmIHRoaXMucG9zc2libGVDZW50ZXJzLmxlbmd0aCA+IDM7IGkrKylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZhciBwYXR0ZXJuID0gIHRoaXMucG9zc2libGVDZW50ZXJzW2ldO1xuXHRcdFx0XHRcdC8vaWYgKE1hdGguYWJzKHBhdHRlcm4uRXN0aW1hdGVkTW9kdWxlU2l6ZSAtIGF2ZXJhZ2UpID4gMC4yICogYXZlcmFnZSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKHBhdHRlcm4uRXN0aW1hdGVkTW9kdWxlU2l6ZSAtIGF2ZXJhZ2UpID4gbGltaXQpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dGhpcy5wb3NzaWJsZUNlbnRlcnMuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHRcdFx0aS0tO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5wb3NzaWJsZUNlbnRlcnMubGVuZ3RoID4gMylcblx0XHRcdHtcblx0XHRcdFx0Ly8gVGhyb3cgYXdheSBhbGwgYnV0IHRob3NlIGZpcnN0IHNpemUgY2FuZGlkYXRlIHBvaW50cyB3ZSBmb3VuZC5cblx0XHRcdFx0dGhpcy5wb3NzaWJsZUNlbnRlcnMuc29ydChmdW5jdGlvbihhLCBiKXtcblx0XHRcdFx0ICAgICAgICAgIGlmIChhLmNvdW50ID4gYi5jb3VudCl7cmV0dXJuIC0xO31cblx0XHRcdFx0ICAgICAgICAgIGlmIChhLmNvdW50IDwgYi5jb3VudCl7cmV0dXJuIDE7fVxuXHRcdFx0XHQgICAgICAgICAgcmV0dXJuIDA7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gbmV3IEFycmF5KCB0aGlzLnBvc3NpYmxlQ2VudGVyc1swXSwgIHRoaXMucG9zc2libGVDZW50ZXJzWzFdLCAgdGhpcy5wb3NzaWJsZUNlbnRlcnNbMl0pO1xuXHRcdH1cblxuXHR0aGlzLmZpbmRSb3dTa2lwPWZ1bmN0aW9uKClcblx0XHR7XG5cdFx0XHR2YXIgbWF4ID0gdGhpcy5wb3NzaWJsZUNlbnRlcnMubGVuZ3RoO1xuXHRcdFx0aWYgKG1heCA8PSAxKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gMDtcblx0XHRcdH1cblx0XHRcdHZhciBmaXJzdENvbmZpcm1lZENlbnRlciA9IG51bGw7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1heDsgaSsrKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgY2VudGVyID0gIHRoaXMucG9zc2libGVDZW50ZXJzW2ldO1xuXHRcdFx0XHRpZiAoY2VudGVyLkNvdW50ID49IENFTlRFUl9RVU9SVU0pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoZmlyc3RDb25maXJtZWRDZW50ZXIgPT0gbnVsbClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRmaXJzdENvbmZpcm1lZENlbnRlciA9IGNlbnRlcjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIFdlIGhhdmUgdHdvIGNvbmZpcm1lZCBjZW50ZXJzXG5cdFx0XHRcdFx0XHQvLyBIb3cgZmFyIGRvd24gY2FuIHdlIHNraXAgYmVmb3JlIHJlc3VtaW5nIGxvb2tpbmcgZm9yIHRoZSBuZXh0XG5cdFx0XHRcdFx0XHQvLyBwYXR0ZXJuPyBJbiB0aGUgd29yc3QgY2FzZSwgb25seSB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZVxuXHRcdFx0XHRcdFx0Ly8gZGlmZmVyZW5jZSBpbiB0aGUgeCAvIHkgY29vcmRpbmF0ZXMgb2YgdGhlIHR3byBjZW50ZXJzLlxuXHRcdFx0XHRcdFx0Ly8gVGhpcyBpcyB0aGUgY2FzZSB3aGVyZSB5b3UgZmluZCB0b3AgbGVmdCBsYXN0LlxuXHRcdFx0XHRcdFx0dGhpcy5oYXNTa2lwcGVkID0gdHJ1ZTtcblx0XHRcdFx0XHRcdHJldHVybiBNYXRoLmZsb29yICgoTWF0aC5hYnMoZmlyc3RDb25maXJtZWRDZW50ZXIuWCAtIGNlbnRlci5YKSAtIE1hdGguYWJzKGZpcnN0Q29uZmlybWVkQ2VudGVyLlkgLSBjZW50ZXIuWSkpIC8gMik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gMDtcblx0XHR9XG5cblx0dGhpcy5oYXZlTXVsdGlwbHlDb25maXJtZWRDZW50ZXJzPWZ1bmN0aW9uKClcblx0XHR7XG5cdFx0XHR2YXIgY29uZmlybWVkQ291bnQgPSAwO1xuXHRcdFx0dmFyIHRvdGFsTW9kdWxlU2l6ZSA9IDAuMDtcblx0XHRcdHZhciBtYXggPSB0aGlzLnBvc3NpYmxlQ2VudGVycy5sZW5ndGg7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1heDsgaSsrKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgcGF0dGVybiA9ICB0aGlzLnBvc3NpYmxlQ2VudGVyc1tpXTtcblx0XHRcdFx0aWYgKHBhdHRlcm4uQ291bnQgPj0gQ0VOVEVSX1FVT1JVTSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbmZpcm1lZENvdW50Kys7XG5cdFx0XHRcdFx0dG90YWxNb2R1bGVTaXplICs9IHBhdHRlcm4uRXN0aW1hdGVkTW9kdWxlU2l6ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKGNvbmZpcm1lZENvdW50IDwgMylcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0Ly8gT0ssIHdlIGhhdmUgYXQgbGVhc3QgMyBjb25maXJtZWQgY2VudGVycywgYnV0LCBpdCdzIHBvc3NpYmxlIHRoYXQgb25lIGlzIGEgXCJmYWxzZSBwb3NpdGl2ZVwiXG5cdFx0XHQvLyBhbmQgdGhhdCB3ZSBuZWVkIHRvIGtlZXAgbG9va2luZy4gV2UgZGV0ZWN0IHRoaXMgYnkgYXNraW5nIGlmIHRoZSBlc3RpbWF0ZWQgbW9kdWxlIHNpemVzXG5cdFx0XHQvLyB2YXJ5IHRvbyBtdWNoLiBXZSBhcmJpdHJhcmlseSBzYXkgdGhhdCB3aGVuIHRoZSB0b3RhbCBkZXZpYXRpb24gZnJvbSBhdmVyYWdlIGV4Y2VlZHNcblx0XHRcdC8vIDUlIG9mIHRoZSB0b3RhbCBtb2R1bGUgc2l6ZSBlc3RpbWF0ZXMsIGl0J3MgdG9vIG11Y2guXG5cdFx0XHR2YXIgYXZlcmFnZSA9IHRvdGFsTW9kdWxlU2l6ZSAvIG1heDtcblx0XHRcdHZhciB0b3RhbERldmlhdGlvbiA9IDAuMDtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbWF4OyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdHBhdHRlcm4gPSB0aGlzLnBvc3NpYmxlQ2VudGVyc1tpXTtcblx0XHRcdFx0dG90YWxEZXZpYXRpb24gKz0gTWF0aC5hYnMocGF0dGVybi5Fc3RpbWF0ZWRNb2R1bGVTaXplIC0gYXZlcmFnZSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdG90YWxEZXZpYXRpb24gPD0gMC4wNSAqIHRvdGFsTW9kdWxlU2l6ZTtcblx0XHR9XG5cblx0dGhpcy5maW5kRmluZGVyUGF0dGVybiA9IGZ1bmN0aW9uKGltYWdlKXtcblx0XHR2YXIgdHJ5SGFyZGVyID0gZmFsc2U7XG5cdFx0dGhpcy5pbWFnZT1pbWFnZTtcblx0XHR2YXIgbWF4SSA9IGltYWdlLmhlaWdodDtcblx0XHR2YXIgbWF4SiA9IGltYWdlLndpZHRoO1xuXHRcdHZhciBpU2tpcCA9IE1hdGguZmxvb3IoKDMgKiBtYXhJKSAvICg0ICogTUFYX01PRFVMRVMpKTtcblx0XHRpZiAoaVNraXAgPCBNSU5fU0tJUCB8fCB0cnlIYXJkZXIpXG5cdFx0e1xuXHRcdFx0XHRpU2tpcCA9IE1JTl9TS0lQO1xuXHRcdH1cblxuXHRcdHZhciBkb25lID0gZmFsc2U7XG5cdFx0dmFyIHN0YXRlQ291bnQgPSBuZXcgQXJyYXkoNSk7XG5cdFx0Zm9yICh2YXIgaSA9IGlTa2lwIC0gMTsgaSA8IG1heEkgJiYgIWRvbmU7IGkgKz0gaVNraXApXG5cdFx0e1xuXHRcdFx0Ly8gR2V0IGEgcm93IG9mIGJsYWNrL3doaXRlIHZhbHVlc1xuXHRcdFx0c3RhdGVDb3VudFswXSA9IDA7XG5cdFx0XHRzdGF0ZUNvdW50WzFdID0gMDtcblx0XHRcdHN0YXRlQ291bnRbMl0gPSAwO1xuXHRcdFx0c3RhdGVDb3VudFszXSA9IDA7XG5cdFx0XHRzdGF0ZUNvdW50WzRdID0gMDtcblx0XHRcdHZhciBjdXJyZW50U3RhdGUgPSAwO1xuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBtYXhKOyBqKyspXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChpbWFnZS5kYXRhW2oraSppbWFnZS53aWR0aF0gKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gQmxhY2sgcGl4ZWxcblx0XHRcdFx0XHRpZiAoKGN1cnJlbnRTdGF0ZSAmIDEpID09IDEpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly8gQ291bnRpbmcgd2hpdGUgcGl4ZWxzXG5cdFx0XHRcdFx0XHRjdXJyZW50U3RhdGUrKztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0c3RhdGVDb3VudFtjdXJyZW50U3RhdGVdKys7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gV2hpdGUgcGl4ZWxcblx0XHRcdFx0XHRpZiAoKGN1cnJlbnRTdGF0ZSAmIDEpID09IDApXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly8gQ291bnRpbmcgYmxhY2sgcGl4ZWxzXG5cdFx0XHRcdFx0XHRpZiAoY3VycmVudFN0YXRlID09IDQpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdC8vIEEgd2lubmVyP1xuXHRcdFx0XHRcdFx0XHRpZiAodGhpcy5mb3VuZFBhdHRlcm5Dcm9zcyhzdGF0ZUNvdW50KSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdC8vIFllc1xuXHRcdFx0XHRcdFx0XHRcdHZhciBjb25maXJtZWQgPSB0aGlzLmhhbmRsZVBvc3NpYmxlQ2VudGVyKHN0YXRlQ291bnQsIGksIGopO1xuXHRcdFx0XHRcdFx0XHRcdGlmIChjb25maXJtZWQpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gU3RhcnQgZXhhbWluaW5nIGV2ZXJ5IG90aGVyIGxpbmUuIENoZWNraW5nIGVhY2ggbGluZSB0dXJuZWQgb3V0IHRvIGJlIHRvb1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gZXhwZW5zaXZlIGFuZCBkaWRuJ3QgaW1wcm92ZSBwZXJmb3JtYW5jZS5cblx0XHRcdFx0XHRcdFx0XHRcdGlTa2lwID0gMjtcblx0XHRcdFx0XHRcdFx0XHRcdGlmICh0aGlzLmhhc1NraXBwZWQpXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGRvbmUgPSB0aGlzLmhhdmVNdWx0aXBseUNvbmZpcm1lZENlbnRlcnMoKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0dmFyIHJvd1NraXAgPSB0aGlzLmZpbmRSb3dTa2lwKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChyb3dTa2lwID4gc3RhdGVDb3VudFsyXSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vIFNraXAgcm93cyBiZXR3ZWVuIHJvdyBvZiBsb3dlciBjb25maXJtZWQgY2VudGVyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gYW5kIHRvcCBvZiBwcmVzdW1lZCB0aGlyZCBjb25maXJtZWQgY2VudGVyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gYnV0IGJhY2sgdXAgYSBiaXQgdG8gZ2V0IGEgZnVsbCBjaGFuY2Ugb2YgZGV0ZWN0aW5nXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gaXQsIGVudGlyZSB3aWR0aCBvZiBjZW50ZXIgb2YgZmluZGVyIHBhdHRlcm5cblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vIFNraXAgYnkgcm93U2tpcCwgYnV0IGJhY2sgb2ZmIGJ5IHN0YXRlQ291bnRbMl0gKHNpemUgb2YgbGFzdCBjZW50ZXJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBvZiBwYXR0ZXJuIHdlIHNhdykgdG8gYmUgY29uc2VydmF0aXZlLCBhbmQgYWxzbyBiYWNrIG9mZiBieSBpU2tpcCB3aGljaFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vIGlzIGFib3V0IHRvIGJlIHJlLWFkZGVkXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aSArPSByb3dTa2lwIC0gc3RhdGVDb3VudFsyXSAtIGlTa2lwO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGogPSBtYXhKIC0gMTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gQWR2YW5jZSB0byBuZXh0IGJsYWNrIHBpeGVsXG5cdFx0XHRcdFx0XHRcdFx0XHRkb1xuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRqKys7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR3aGlsZSAoaiA8IG1heEogJiYgIWltYWdlLmRhdGFbaiArIGkqaW1hZ2Uud2lkdGhdKTtcblx0XHRcdFx0XHRcdFx0XHRcdGotLTsgLy8gYmFjayB1cCB0byB0aGF0IGxhc3Qgd2hpdGUgcGl4ZWxcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0Ly8gQ2xlYXIgc3RhdGUgdG8gc3RhcnQgbG9va2luZyBhZ2FpblxuXHRcdFx0XHRcdFx0XHRcdGN1cnJlbnRTdGF0ZSA9IDA7XG5cdFx0XHRcdFx0XHRcdFx0c3RhdGVDb3VudFswXSA9IDA7XG5cdFx0XHRcdFx0XHRcdFx0c3RhdGVDb3VudFsxXSA9IDA7XG5cdFx0XHRcdFx0XHRcdFx0c3RhdGVDb3VudFsyXSA9IDA7XG5cdFx0XHRcdFx0XHRcdFx0c3RhdGVDb3VudFszXSA9IDA7XG5cdFx0XHRcdFx0XHRcdFx0c3RhdGVDb3VudFs0XSA9IDA7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gTm8sIHNoaWZ0IGNvdW50cyBiYWNrIGJ5IHR3b1xuXHRcdFx0XHRcdFx0XHRcdHN0YXRlQ291bnRbMF0gPSBzdGF0ZUNvdW50WzJdO1xuXHRcdFx0XHRcdFx0XHRcdHN0YXRlQ291bnRbMV0gPSBzdGF0ZUNvdW50WzNdO1xuXHRcdFx0XHRcdFx0XHRcdHN0YXRlQ291bnRbMl0gPSBzdGF0ZUNvdW50WzRdO1xuXHRcdFx0XHRcdFx0XHRcdHN0YXRlQ291bnRbM10gPSAxO1xuXHRcdFx0XHRcdFx0XHRcdHN0YXRlQ291bnRbNF0gPSAwO1xuXHRcdFx0XHRcdFx0XHRcdGN1cnJlbnRTdGF0ZSA9IDM7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0c3RhdGVDb3VudFsrK2N1cnJlbnRTdGF0ZV0rKztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIENvdW50aW5nIHdoaXRlIHBpeGVsc1xuXHRcdFx0XHRcdFx0c3RhdGVDb3VudFtjdXJyZW50U3RhdGVdKys7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAodGhpcy5mb3VuZFBhdHRlcm5Dcm9zcyhzdGF0ZUNvdW50KSlcblx0XHRcdHtcblx0XHRcdFx0dmFyIGNvbmZpcm1lZCA9IHRoaXMuaGFuZGxlUG9zc2libGVDZW50ZXIoc3RhdGVDb3VudCwgaSwgbWF4Sik7XG5cdFx0XHRcdGlmIChjb25maXJtZWQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpU2tpcCA9IHN0YXRlQ291bnRbMF07XG5cdFx0XHRcdFx0aWYgKHRoaXMuaGFzU2tpcHBlZClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyBGb3VuZCBhIHRoaXJkIG9uZVxuXHRcdFx0XHRcdFx0ZG9uZSA9IGhhdmVNdWx0aXBseUNvbmZpcm1lZENlbnRlcnMoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHR2YXIgcGF0dGVybkluZm8gPSB0aGlzLnNlbGVjdEJlc3RQYXR0ZXJucygpO1xuXHRcdHFyY29kZS5vcmRlckJlc3RQYXR0ZXJucyhwYXR0ZXJuSW5mbyk7XG5cblx0XHRyZXR1cm4gbmV3IEZpbmRlclBhdHRlcm5JbmZvKHBhdHRlcm5JbmZvKTtcblx0fTtcbn1cblxuLypcbiAgUG9ydGVkIHRvIEphdmFTY3JpcHQgYnkgTGF6YXIgTGFzemxvIDIwMTFcblxuICBsYXphcnNvZnRAZ21haWwuY29tLCB3d3cubGF6YXJzb2Z0LmluZm9cblxuKi9cblxuLypcbipcbiogQ29weXJpZ2h0IDIwMDcgWlhpbmcgYXV0aG9yc1xuKlxuKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4qIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuKlxuKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuKlxuKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4qIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4qIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5cbmZ1bmN0aW9uIEFsaWdubWVudFBhdHRlcm4ocG9zWCwgcG9zWSwgIGVzdGltYXRlZE1vZHVsZVNpemUpXG57XG5cdHRoaXMueD1wb3NYO1xuXHR0aGlzLnk9cG9zWTtcblx0dGhpcy5jb3VudCA9IDE7XG5cdHRoaXMuZXN0aW1hdGVkTW9kdWxlU2l6ZSA9IGVzdGltYXRlZE1vZHVsZVNpemU7XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJFc3RpbWF0ZWRNb2R1bGVTaXplXCIsIHsgZ2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5lc3RpbWF0ZWRNb2R1bGVTaXplO1xuXHR9fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiQ291bnRcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiB0aGlzLmNvdW50O1xuXHR9fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiWFwiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIE1hdGguZmxvb3IodGhpcy54KTtcblx0fX0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxcIllcIiwgeyBnZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHJldHVybiBNYXRoLmZsb29yKHRoaXMueSk7XG5cdH19KTtcblx0dGhpcy5pbmNyZW1lbnRDb3VudCA9IGZ1bmN0aW9uKClcblx0e1xuXHRcdHRoaXMuY291bnQrKztcblx0fVxuXHR0aGlzLmFib3V0RXF1YWxzPWZ1bmN0aW9uKCBtb2R1bGVTaXplLCAgaSwgIGopXG5cdFx0e1xuXHRcdFx0aWYgKE1hdGguYWJzKGkgLSB0aGlzLnkpIDw9IG1vZHVsZVNpemUgJiYgTWF0aC5hYnMoaiAtIHRoaXMueCkgPD0gbW9kdWxlU2l6ZSlcblx0XHRcdHtcblx0XHRcdFx0dmFyIG1vZHVsZVNpemVEaWZmID0gTWF0aC5hYnMobW9kdWxlU2l6ZSAtIHRoaXMuZXN0aW1hdGVkTW9kdWxlU2l6ZSk7XG5cdFx0XHRcdHJldHVybiBtb2R1bGVTaXplRGlmZiA8PSAxLjAgfHwgbW9kdWxlU2l6ZURpZmYgLyB0aGlzLmVzdGltYXRlZE1vZHVsZVNpemUgPD0gMS4wO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxufVxuXG5mdW5jdGlvbiBBbGlnbm1lbnRQYXR0ZXJuRmluZGVyKCBpbWFnZSwgIHN0YXJ0WCwgIHN0YXJ0WSwgIHdpZHRoLCAgaGVpZ2h0LCAgbW9kdWxlU2l6ZSwgIHJlc3VsdFBvaW50Q2FsbGJhY2spXG57XG5cdHRoaXMuaW1hZ2UgPSBpbWFnZTtcblx0dGhpcy5wb3NzaWJsZUNlbnRlcnMgPSBuZXcgQXJyYXkoKTtcblx0dGhpcy5zdGFydFggPSBzdGFydFg7XG5cdHRoaXMuc3RhcnRZID0gc3RhcnRZO1xuXHR0aGlzLndpZHRoID0gd2lkdGg7XG5cdHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXHR0aGlzLm1vZHVsZVNpemUgPSBtb2R1bGVTaXplO1xuXHR0aGlzLmNyb3NzQ2hlY2tTdGF0ZUNvdW50ID0gbmV3IEFycmF5KDAsMCwwKTtcblx0dGhpcy5yZXN1bHRQb2ludENhbGxiYWNrID0gcmVzdWx0UG9pbnRDYWxsYmFjaztcblxuXHR0aGlzLmNlbnRlckZyb21FbmQ9ZnVuY3Rpb24oc3RhdGVDb3VudCwgIGVuZClcblx0XHR7XG5cdFx0XHRyZXR1cm4gIChlbmQgLSBzdGF0ZUNvdW50WzJdKSAtIHN0YXRlQ291bnRbMV0gLyAyLjA7XG5cdFx0fVxuXHR0aGlzLmZvdW5kUGF0dGVybkNyb3NzID0gZnVuY3Rpb24oc3RhdGVDb3VudClcblx0XHR7XG5cdFx0XHR2YXIgbW9kdWxlU2l6ZSA9IHRoaXMubW9kdWxlU2l6ZTtcblx0XHRcdHZhciBtYXhWYXJpYW5jZSA9IG1vZHVsZVNpemUgLyAyLjA7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKylcblx0XHRcdHtcblx0XHRcdFx0aWYgKE1hdGguYWJzKG1vZHVsZVNpemUgLSBzdGF0ZUNvdW50W2ldKSA+PSBtYXhWYXJpYW5jZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdHRoaXMuY3Jvc3NDaGVja1ZlcnRpY2FsPWZ1bmN0aW9uKCBzdGFydEksICBjZW50ZXJKLCAgbWF4Q291bnQsICBvcmlnaW5hbFN0YXRlQ291bnRUb3RhbClcblx0XHR7XG5cdFx0XHR2YXIgaW1hZ2UgPSB0aGlzLmltYWdlO1xuXG5cdFx0XHR2YXIgbWF4SSA9IGltYWdlLmhlaWdodDtcblx0XHRcdHZhciBzdGF0ZUNvdW50ID0gdGhpcy5jcm9zc0NoZWNrU3RhdGVDb3VudDtcblx0XHRcdHN0YXRlQ291bnRbMF0gPSAwO1xuXHRcdFx0c3RhdGVDb3VudFsxXSA9IDA7XG5cdFx0XHRzdGF0ZUNvdW50WzJdID0gMDtcblxuXHRcdFx0Ly8gU3RhcnQgY291bnRpbmcgdXAgZnJvbSBjZW50ZXJcblx0XHRcdHZhciBpID0gc3RhcnRJO1xuXHRcdFx0d2hpbGUgKGkgPj0gMCAmJiBpbWFnZS5kYXRhW2NlbnRlckogKyBpKmltYWdlLndpZHRoXSAmJiBzdGF0ZUNvdW50WzFdIDw9IG1heENvdW50KVxuXHRcdFx0e1xuXHRcdFx0XHRzdGF0ZUNvdW50WzFdKys7XG5cdFx0XHRcdGktLTtcblx0XHRcdH1cblx0XHRcdC8vIElmIGFscmVhZHkgdG9vIG1hbnkgbW9kdWxlcyBpbiB0aGlzIHN0YXRlIG9yIHJhbiBvZmYgdGhlIGVkZ2U6XG5cdFx0XHRpZiAoaSA8IDAgfHwgc3RhdGVDb3VudFsxXSA+IG1heENvdW50KVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gTmFOO1xuXHRcdFx0fVxuXHRcdFx0d2hpbGUgKGkgPj0gMCAmJiAhaW1hZ2UuZGF0YVtjZW50ZXJKICsgaSppbWFnZS53aWR0aF0gJiYgc3RhdGVDb3VudFswXSA8PSBtYXhDb3VudClcblx0XHRcdHtcblx0XHRcdFx0c3RhdGVDb3VudFswXSsrO1xuXHRcdFx0XHRpLS07XG5cdFx0XHR9XG5cdFx0XHRpZiAoc3RhdGVDb3VudFswXSA+IG1heENvdW50KVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gTmFOO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBOb3cgYWxzbyBjb3VudCBkb3duIGZyb20gY2VudGVyXG5cdFx0XHRpID0gc3RhcnRJICsgMTtcblx0XHRcdHdoaWxlIChpIDwgbWF4SSAmJiBpbWFnZS5kYXRhW2NlbnRlckogKyBpKmltYWdlLndpZHRoXSAmJiBzdGF0ZUNvdW50WzFdIDw9IG1heENvdW50KVxuXHRcdFx0e1xuXHRcdFx0XHRzdGF0ZUNvdW50WzFdKys7XG5cdFx0XHRcdGkrKztcblx0XHRcdH1cblx0XHRcdGlmIChpID09IG1heEkgfHwgc3RhdGVDb3VudFsxXSA+IG1heENvdW50KVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gTmFOO1xuXHRcdFx0fVxuXHRcdFx0d2hpbGUgKGkgPCBtYXhJICYmICFpbWFnZS5kYXRhW2NlbnRlckogKyBpKmltYWdlLndpZHRoXSAmJiBzdGF0ZUNvdW50WzJdIDw9IG1heENvdW50KVxuXHRcdFx0e1xuXHRcdFx0XHRzdGF0ZUNvdW50WzJdKys7XG5cdFx0XHRcdGkrKztcblx0XHRcdH1cblx0XHRcdGlmIChzdGF0ZUNvdW50WzJdID4gbWF4Q291bnQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBOYU47XG5cdFx0XHR9XG5cblx0XHRcdHZhciBzdGF0ZUNvdW50VG90YWwgPSBzdGF0ZUNvdW50WzBdICsgc3RhdGVDb3VudFsxXSArIHN0YXRlQ291bnRbMl07XG5cdFx0XHRpZiAoNSAqIE1hdGguYWJzKHN0YXRlQ291bnRUb3RhbCAtIG9yaWdpbmFsU3RhdGVDb3VudFRvdGFsKSA+PSAyICogb3JpZ2luYWxTdGF0ZUNvdW50VG90YWwpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBOYU47XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzLmZvdW5kUGF0dGVybkNyb3NzKHN0YXRlQ291bnQpP3RoaXMuY2VudGVyRnJvbUVuZChzdGF0ZUNvdW50LCBpKTpOYU47XG5cdFx0fVxuXG5cdHRoaXMuaGFuZGxlUG9zc2libGVDZW50ZXI9ZnVuY3Rpb24oIHN0YXRlQ291bnQsICBpLCAgailcblx0XHR7XG5cdFx0XHR2YXIgc3RhdGVDb3VudFRvdGFsID0gc3RhdGVDb3VudFswXSArIHN0YXRlQ291bnRbMV0gKyBzdGF0ZUNvdW50WzJdO1xuXHRcdFx0dmFyIGNlbnRlckogPSB0aGlzLmNlbnRlckZyb21FbmQoc3RhdGVDb3VudCwgaik7XG5cdFx0XHR2YXIgY2VudGVySSA9IHRoaXMuY3Jvc3NDaGVja1ZlcnRpY2FsKGksIE1hdGguZmxvb3IgKGNlbnRlckopLCAyICogc3RhdGVDb3VudFsxXSwgc3RhdGVDb3VudFRvdGFsKTtcblx0XHRcdGlmICghaXNOYU4oY2VudGVySSkpXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBlc3RpbWF0ZWRNb2R1bGVTaXplID0gKHN0YXRlQ291bnRbMF0gKyBzdGF0ZUNvdW50WzFdICsgc3RhdGVDb3VudFsyXSkgLyAzLjA7XG5cdFx0XHRcdHZhciBtYXggPSB0aGlzLnBvc3NpYmxlQ2VudGVycy5sZW5ndGg7XG5cdFx0XHRcdGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBtYXg7IGluZGV4KyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2YXIgY2VudGVyID0gIHRoaXMucG9zc2libGVDZW50ZXJzW2luZGV4XTtcblx0XHRcdFx0XHQvLyBMb29rIGZvciBhYm91dCB0aGUgc2FtZSBjZW50ZXIgYW5kIG1vZHVsZSBzaXplOlxuXHRcdFx0XHRcdGlmIChjZW50ZXIuYWJvdXRFcXVhbHMoZXN0aW1hdGVkTW9kdWxlU2l6ZSwgY2VudGVySSwgY2VudGVySikpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBBbGlnbm1lbnRQYXR0ZXJuKGNlbnRlckosIGNlbnRlckksIGVzdGltYXRlZE1vZHVsZVNpemUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBIYWRuJ3QgZm91bmQgdGhpcyBiZWZvcmU7IHNhdmUgaXRcblx0XHRcdFx0dmFyIHBvaW50ID0gbmV3IEFsaWdubWVudFBhdHRlcm4oY2VudGVySiwgY2VudGVySSwgZXN0aW1hdGVkTW9kdWxlU2l6ZSk7XG5cdFx0XHRcdHRoaXMucG9zc2libGVDZW50ZXJzLnB1c2gocG9pbnQpO1xuXHRcdFx0XHRpZiAodGhpcy5yZXN1bHRQb2ludENhbGxiYWNrICE9IG51bGwpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0aGlzLnJlc3VsdFBvaW50Q2FsbGJhY2suZm91bmRQb3NzaWJsZVJlc3VsdFBvaW50KHBvaW50KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdHRoaXMuZmluZCA9IGZ1bmN0aW9uKClcblx0e1xuXHRcdFx0dmFyIHN0YXJ0WCA9IHRoaXMuc3RhcnRYO1xuXHRcdFx0dmFyIGhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuXHRcdFx0dmFyIG1heEogPSBzdGFydFggKyB3aWR0aDtcblx0XHRcdHZhciBtaWRkbGVJID0gc3RhcnRZICsgKGhlaWdodCA+PiAxKTtcblx0XHRcdC8vIFdlIGFyZSBsb29raW5nIGZvciBibGFjay93aGl0ZS9ibGFjayBtb2R1bGVzIGluIDE6MToxIHJhdGlvO1xuXHRcdFx0Ly8gdGhpcyB0cmFja3MgdGhlIG51bWJlciBvZiBibGFjay93aGl0ZS9ibGFjayBtb2R1bGVzIHNlZW4gc28gZmFyXG5cdFx0XHR2YXIgc3RhdGVDb3VudCA9IG5ldyBBcnJheSgwLDAsMCk7XG5cdFx0XHRmb3IgKHZhciBpR2VuID0gMDsgaUdlbiA8IGhlaWdodDsgaUdlbisrKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBTZWFyY2ggZnJvbSBtaWRkbGUgb3V0d2FyZHNcblx0XHRcdFx0dmFyIGkgPSBtaWRkbGVJICsgKChpR2VuICYgMHgwMSkgPT0gMD8oKGlHZW4gKyAxKSA+PiAxKTotICgoaUdlbiArIDEpID4+IDEpKTtcblx0XHRcdFx0c3RhdGVDb3VudFswXSA9IDA7XG5cdFx0XHRcdHN0YXRlQ291bnRbMV0gPSAwO1xuXHRcdFx0XHRzdGF0ZUNvdW50WzJdID0gMDtcblx0XHRcdFx0dmFyIGogPSBzdGFydFg7XG5cdFx0XHRcdC8vIEJ1cm4gb2ZmIGxlYWRpbmcgd2hpdGUgcGl4ZWxzIGJlZm9yZSBhbnl0aGluZyBlbHNlOyBpZiB3ZSBzdGFydCBpbiB0aGUgbWlkZGxlIG9mXG5cdFx0XHRcdC8vIGEgd2hpdGUgcnVuLCBpdCBkb2Vzbid0IG1ha2Ugc2Vuc2UgdG8gY291bnQgaXRzIGxlbmd0aCwgc2luY2Ugd2UgZG9uJ3Qga25vdyBpZiB0aGVcblx0XHRcdFx0Ly8gd2hpdGUgcnVuIGNvbnRpbnVlZCB0byB0aGUgbGVmdCBvZiB0aGUgc3RhcnQgcG9pbnRcblx0XHRcdFx0d2hpbGUgKGogPCBtYXhKICYmICFpbWFnZS5kYXRhW2ogKyBpbWFnZS53aWR0aCogaV0pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRqKys7XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFyIGN1cnJlbnRTdGF0ZSA9IDA7XG5cdFx0XHRcdHdoaWxlIChqIDwgbWF4Silcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChpbWFnZS5kYXRhW2ogKyBpKmltYWdlLndpZHRoXSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyBCbGFjayBwaXhlbFxuXHRcdFx0XHRcdFx0aWYgKGN1cnJlbnRTdGF0ZSA9PSAxKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHQvLyBDb3VudGluZyBibGFjayBwaXhlbHNcblx0XHRcdFx0XHRcdFx0c3RhdGVDb3VudFtjdXJyZW50U3RhdGVdKys7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdC8vIENvdW50aW5nIHdoaXRlIHBpeGVsc1xuXHRcdFx0XHRcdFx0XHRpZiAoY3VycmVudFN0YXRlID09IDIpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHQvLyBBIHdpbm5lcj9cblx0XHRcdFx0XHRcdFx0XHRpZiAodGhpcy5mb3VuZFBhdHRlcm5Dcm9zcyhzdGF0ZUNvdW50KSlcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBZZXNcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBjb25maXJtZWQgPSB0aGlzLmhhbmRsZVBvc3NpYmxlQ2VudGVyKHN0YXRlQ291bnQsIGksIGopO1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKGNvbmZpcm1lZCAhPSBudWxsKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gY29uZmlybWVkO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRzdGF0ZUNvdW50WzBdID0gc3RhdGVDb3VudFsyXTtcblx0XHRcdFx0XHRcdFx0XHRzdGF0ZUNvdW50WzFdID0gMTtcblx0XHRcdFx0XHRcdFx0XHRzdGF0ZUNvdW50WzJdID0gMDtcblx0XHRcdFx0XHRcdFx0XHRjdXJyZW50U3RhdGUgPSAxO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHN0YXRlQ291bnRbKytjdXJyZW50U3RhdGVdKys7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIFdoaXRlIHBpeGVsXG5cdFx0XHRcdFx0XHRpZiAoY3VycmVudFN0YXRlID09IDEpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdC8vIENvdW50aW5nIGJsYWNrIHBpeGVsc1xuXHRcdFx0XHRcdFx0XHRjdXJyZW50U3RhdGUrKztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHN0YXRlQ291bnRbY3VycmVudFN0YXRlXSsrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRqKys7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHRoaXMuZm91bmRQYXR0ZXJuQ3Jvc3Moc3RhdGVDb3VudCkpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2YXIgY29uZmlybWVkID0gdGhpcy5oYW5kbGVQb3NzaWJsZUNlbnRlcihzdGF0ZUNvdW50LCBpLCBtYXhKKTtcblx0XHRcdFx0XHRpZiAoY29uZmlybWVkICE9IG51bGwpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuIGNvbmZpcm1lZDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gSG1tLCBub3RoaW5nIHdlIHNhdyB3YXMgb2JzZXJ2ZWQgYW5kIGNvbmZpcm1lZCB0d2ljZS4gSWYgd2UgaGFkXG5cdFx0XHQvLyBhbnkgZ3Vlc3MgYXQgYWxsLCByZXR1cm4gaXQuXG5cdFx0XHRpZiAoISh0aGlzLnBvc3NpYmxlQ2VudGVycy5sZW5ndGggPT0gMCkpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiAgdGhpcy5wb3NzaWJsZUNlbnRlcnNbMF07XG5cdFx0XHR9XG5cblx0XHRcdHRocm93IFwiQ291bGRuJ3QgZmluZCBlbm91Z2ggYWxpZ25tZW50IHBhdHRlcm5zXCI7XG5cdFx0fVxuXG59XG5cbi8qXG4gIFBvcnRlZCB0byBKYXZhU2NyaXB0IGJ5IExhemFyIExhc3psbyAyMDExXG5cbiAgbGF6YXJzb2Z0QGdtYWlsLmNvbSwgd3d3LmxhemFyc29mdC5pbmZvXG5cbiovXG5cbi8qXG4qXG4qIENvcHlyaWdodCAyMDA3IFpYaW5nIGF1dGhvcnNcbipcbiogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbipcbiogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbipcbiogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4qIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4qIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuXG5mdW5jdGlvbiBRUkNvZGVEYXRhQmxvY2tSZWFkZXIoYmxvY2tzLCAgdmVyc2lvbiwgIG51bUVycm9yQ29ycmVjdGlvbkNvZGUpXG57XG5cdHRoaXMuYmxvY2tQb2ludGVyID0gMDtcblx0dGhpcy5iaXRQb2ludGVyID0gNztcblx0dGhpcy5kYXRhTGVuZ3RoID0gMDtcblx0dGhpcy5ibG9ja3MgPSBibG9ja3M7XG5cdHRoaXMubnVtRXJyb3JDb3JyZWN0aW9uQ29kZSA9IG51bUVycm9yQ29ycmVjdGlvbkNvZGU7XG5cdGlmICh2ZXJzaW9uIDw9IDkpXG5cdFx0dGhpcy5kYXRhTGVuZ3RoTW9kZSA9IDA7XG5cdGVsc2UgaWYgKHZlcnNpb24gPj0gMTAgJiYgdmVyc2lvbiA8PSAyNilcblx0XHR0aGlzLmRhdGFMZW5ndGhNb2RlID0gMTtcblx0ZWxzZSBpZiAodmVyc2lvbiA+PSAyNyAmJiB2ZXJzaW9uIDw9IDQwKVxuXHRcdHRoaXMuZGF0YUxlbmd0aE1vZGUgPSAyO1xuXG5cdHRoaXMuZ2V0TmV4dEJpdHMgPSBmdW5jdGlvbiggbnVtQml0cylcblx0XHR7XG5cdFx0XHR2YXIgYml0cyA9IDA7XG5cdFx0XHRpZiAobnVtQml0cyA8IHRoaXMuYml0UG9pbnRlciArIDEpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIG5leHQgd29yZCBmaXRzIGludG8gY3VycmVudCBkYXRhIGJsb2NrXG5cdFx0XHRcdHZhciBtYXNrID0gMDtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBudW1CaXRzOyBpKyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRtYXNrICs9ICgxIDw8IGkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG1hc2sgPDw9ICh0aGlzLmJpdFBvaW50ZXIgLSBudW1CaXRzICsgMSk7XG5cblx0XHRcdFx0Yml0cyA9ICh0aGlzLmJsb2Nrc1t0aGlzLmJsb2NrUG9pbnRlcl0gJiBtYXNrKSA+PiAodGhpcy5iaXRQb2ludGVyIC0gbnVtQml0cyArIDEpO1xuXHRcdFx0XHR0aGlzLmJpdFBvaW50ZXIgLT0gbnVtQml0cztcblx0XHRcdFx0cmV0dXJuIGJpdHM7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChudW1CaXRzIDwgdGhpcy5iaXRQb2ludGVyICsgMSArIDgpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIG5leHQgd29yZCBjcm9zc2VzIDIgZGF0YSBibG9ja3Ncblx0XHRcdFx0dmFyIG1hc2sxID0gMDtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmJpdFBvaW50ZXIgKyAxOyBpKyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRtYXNrMSArPSAoMSA8PCBpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRiaXRzID0gKHRoaXMuYmxvY2tzW3RoaXMuYmxvY2tQb2ludGVyXSAmIG1hc2sxKSA8PCAobnVtQml0cyAtICh0aGlzLmJpdFBvaW50ZXIgKyAxKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5ibG9ja1BvaW50ZXIrKztcblx0XHRcdFx0Yml0cyArPSAoKHRoaXMuYmxvY2tzW3RoaXMuYmxvY2tQb2ludGVyXSkgPj4gKDggLSAobnVtQml0cyAtICh0aGlzLmJpdFBvaW50ZXIgKyAxKSkpKTtcblxuXHRcdFx0XHR0aGlzLmJpdFBvaW50ZXIgPSB0aGlzLmJpdFBvaW50ZXIgLSBudW1CaXRzICUgODtcblx0XHRcdFx0aWYgKHRoaXMuYml0UG9pbnRlciA8IDApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0aGlzLmJpdFBvaW50ZXIgPSA4ICsgdGhpcy5iaXRQb2ludGVyO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBiaXRzO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAobnVtQml0cyA8IHRoaXMuYml0UG9pbnRlciArIDEgKyAxNilcblx0XHRcdHtcblx0XHRcdFx0Ly8gbmV4dCB3b3JkIGNyb3NzZXMgMyBkYXRhIGJsb2Nrc1xuXHRcdFx0XHR2YXIgbWFzazEgPSAwOyAvLyBtYXNrIG9mIGZpcnN0IGJsb2NrXG5cdFx0XHRcdHZhciBtYXNrMyA9IDA7IC8vIG1hc2sgb2YgM3JkIGJsb2NrXG5cdFx0XHRcdC8vYml0UG9pbnRlciArIDEgOiBudW1iZXIgb2YgYml0cyBvZiB0aGUgMXN0IGJsb2NrXG5cdFx0XHRcdC8vOCA6IG51bWJlciBvZiB0aGUgMm5kIGJsb2NrIChub3RlIHRoYXQgdXNlIGFscmVhZHkgOGJpdHMgYmVjYXVzZSBuZXh0IHdvcmQgdXNlcyAzIGRhdGEgYmxvY2tzKVxuXHRcdFx0XHQvL251bUJpdHMgLSAoYml0UG9pbnRlciArIDEgKyA4KSA6IG51bWJlciBvZiBiaXRzIG9mIHRoZSAzcmQgYmxvY2tcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmJpdFBvaW50ZXIgKyAxOyBpKyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRtYXNrMSArPSAoMSA8PCBpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR2YXIgYml0c0ZpcnN0QmxvY2sgPSAodGhpcy5ibG9ja3NbdGhpcy5ibG9ja1BvaW50ZXJdICYgbWFzazEpIDw8IChudW1CaXRzIC0gKHRoaXMuYml0UG9pbnRlciArIDEpKTtcblx0XHRcdFx0dGhpcy5ibG9ja1BvaW50ZXIrKztcblxuXHRcdFx0XHR2YXIgYml0c1NlY29uZEJsb2NrID0gdGhpcy5ibG9ja3NbdGhpcy5ibG9ja1BvaW50ZXJdIDw8IChudW1CaXRzIC0gKHRoaXMuYml0UG9pbnRlciArIDEgKyA4KSk7XG5cdFx0XHRcdHRoaXMuYmxvY2tQb2ludGVyKys7XG5cblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBudW1CaXRzIC0gKHRoaXMuYml0UG9pbnRlciArIDEgKyA4KTsgaSsrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bWFzazMgKz0gKDEgPDwgaSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0bWFzazMgPDw9IDggLSAobnVtQml0cyAtICh0aGlzLmJpdFBvaW50ZXIgKyAxICsgOCkpO1xuXHRcdFx0XHR2YXIgYml0c1RoaXJkQmxvY2sgPSAodGhpcy5ibG9ja3NbdGhpcy5ibG9ja1BvaW50ZXJdICYgbWFzazMpID4+ICg4IC0gKG51bUJpdHMgLSAodGhpcy5iaXRQb2ludGVyICsgMSArIDgpKSk7XG5cblx0XHRcdFx0Yml0cyA9IGJpdHNGaXJzdEJsb2NrICsgYml0c1NlY29uZEJsb2NrICsgYml0c1RoaXJkQmxvY2s7XG5cdFx0XHRcdHRoaXMuYml0UG9pbnRlciA9IHRoaXMuYml0UG9pbnRlciAtIChudW1CaXRzIC0gOCkgJSA4O1xuXHRcdFx0XHRpZiAodGhpcy5iaXRQb2ludGVyIDwgMClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRoaXMuYml0UG9pbnRlciA9IDggKyB0aGlzLmJpdFBvaW50ZXI7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGJpdHM7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiAwO1xuXHRcdFx0fVxuXHRcdH1cblx0dGhpcy5OZXh0TW9kZT1mdW5jdGlvbigpXG5cdHtcblx0XHRpZiAoKHRoaXMuYmxvY2tQb2ludGVyID4gdGhpcy5ibG9ja3MubGVuZ3RoIC0gdGhpcy5udW1FcnJvckNvcnJlY3Rpb25Db2RlIC0gMikpXG5cdFx0XHRyZXR1cm4gMDtcblx0XHRlbHNlXG5cdFx0XHRyZXR1cm4gdGhpcy5nZXROZXh0Qml0cyg0KTtcblx0fVxuXHR0aGlzLmdldERhdGFMZW5ndGg9ZnVuY3Rpb24oIG1vZGVJbmRpY2F0b3IpXG5cdFx0e1xuXHRcdFx0dmFyIGluZGV4ID0gMDtcblx0XHRcdHdoaWxlICh0cnVlKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoKG1vZGVJbmRpY2F0b3IgPj4gaW5kZXgpID09IDEpXG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGluZGV4Kys7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzLmdldE5leHRCaXRzKHFyY29kZS5zaXplT2ZEYXRhTGVuZ3RoSW5mb1t0aGlzLmRhdGFMZW5ndGhNb2RlXVtpbmRleF0pO1xuXHRcdH1cblx0dGhpcy5nZXRSb21hbkFuZEZpZ3VyZVN0cmluZz1mdW5jdGlvbiggZGF0YUxlbmd0aClcblx0XHR7XG5cdFx0XHR2YXIgbGVuZ3RoID0gZGF0YUxlbmd0aDtcblx0XHRcdHZhciBpbnREYXRhID0gMDtcblx0XHRcdHZhciBzdHJEYXRhID0gXCJcIjtcblx0XHRcdHZhciB0YWJsZVJvbWFuQW5kRmlndXJlID0gbmV3IEFycmF5KCcwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5JywgJ0EnLCAnQicsICdDJywgJ0QnLCAnRScsICdGJywgJ0cnLCAnSCcsICdJJywgJ0onLCAnSycsICdMJywgJ00nLCAnTicsICdPJywgJ1AnLCAnUScsICdSJywgJ1MnLCAnVCcsICdVJywgJ1YnLCAnVycsICdYJywgJ1knLCAnWicsICcgJywgJyQnLCAnJScsICcqJywgJysnLCAnLScsICcuJywgJy8nLCAnOicpO1xuXHRcdFx0ZG9cblx0XHRcdHtcblx0XHRcdFx0aWYgKGxlbmd0aCA+IDEpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpbnREYXRhID0gdGhpcy5nZXROZXh0Qml0cygxMSk7XG5cdFx0XHRcdFx0dmFyIGZpcnN0TGV0dGVyID0gTWF0aC5mbG9vcihpbnREYXRhIC8gNDUpO1xuXHRcdFx0XHRcdHZhciBzZWNvbmRMZXR0ZXIgPSBpbnREYXRhICUgNDU7XG5cdFx0XHRcdFx0c3RyRGF0YSArPSB0YWJsZVJvbWFuQW5kRmlndXJlW2ZpcnN0TGV0dGVyXTtcblx0XHRcdFx0XHRzdHJEYXRhICs9IHRhYmxlUm9tYW5BbmRGaWd1cmVbc2Vjb25kTGV0dGVyXTtcblx0XHRcdFx0XHRsZW5ndGggLT0gMjtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChsZW5ndGggPT0gMSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGludERhdGEgPSB0aGlzLmdldE5leHRCaXRzKDYpO1xuXHRcdFx0XHRcdHN0ckRhdGEgKz0gdGFibGVSb21hbkFuZEZpZ3VyZVtpbnREYXRhXTtcblx0XHRcdFx0XHRsZW5ndGggLT0gMTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0d2hpbGUgKGxlbmd0aCA+IDApO1xuXG5cdFx0XHRyZXR1cm4gc3RyRGF0YTtcblx0XHR9XG5cdHRoaXMuZ2V0RmlndXJlU3RyaW5nPWZ1bmN0aW9uKCBkYXRhTGVuZ3RoKVxuXHRcdHtcblx0XHRcdHZhciBsZW5ndGggPSBkYXRhTGVuZ3RoO1xuXHRcdFx0dmFyIGludERhdGEgPSAwO1xuXHRcdFx0dmFyIHN0ckRhdGEgPSBcIlwiO1xuXHRcdFx0ZG9cblx0XHRcdHtcblx0XHRcdFx0aWYgKGxlbmd0aCA+PSAzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aW50RGF0YSA9IHRoaXMuZ2V0TmV4dEJpdHMoMTApO1xuXHRcdFx0XHRcdGlmIChpbnREYXRhIDwgMTAwKVxuXHRcdFx0XHRcdFx0c3RyRGF0YSArPSBcIjBcIjtcblx0XHRcdFx0XHRpZiAoaW50RGF0YSA8IDEwKVxuXHRcdFx0XHRcdFx0c3RyRGF0YSArPSBcIjBcIjtcblx0XHRcdFx0XHRsZW5ndGggLT0gMztcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChsZW5ndGggPT0gMilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGludERhdGEgPSB0aGlzLmdldE5leHRCaXRzKDcpO1xuXHRcdFx0XHRcdGlmIChpbnREYXRhIDwgMTApXG5cdFx0XHRcdFx0XHRzdHJEYXRhICs9IFwiMFwiO1xuXHRcdFx0XHRcdGxlbmd0aCAtPSAyO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKGxlbmd0aCA9PSAxKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aW50RGF0YSA9IHRoaXMuZ2V0TmV4dEJpdHMoNCk7XG5cdFx0XHRcdFx0bGVuZ3RoIC09IDE7XG5cdFx0XHRcdH1cblx0XHRcdFx0c3RyRGF0YSArPSBpbnREYXRhO1xuXHRcdFx0fVxuXHRcdFx0d2hpbGUgKGxlbmd0aCA+IDApO1xuXG5cdFx0XHRyZXR1cm4gc3RyRGF0YTtcblx0XHR9XG5cdHRoaXMuZ2V0OGJpdEJ5dGVBcnJheT1mdW5jdGlvbiggZGF0YUxlbmd0aClcblx0XHR7XG5cdFx0XHR2YXIgbGVuZ3RoID0gZGF0YUxlbmd0aDtcblx0XHRcdHZhciBpbnREYXRhID0gMDtcblx0XHRcdHZhciBvdXRwdXQgPSBuZXcgQXJyYXkoKTtcblxuXHRcdFx0ZG9cblx0XHRcdHtcblx0XHRcdFx0aW50RGF0YSA9IHRoaXMuZ2V0TmV4dEJpdHMoOCk7XG5cdFx0XHRcdG91dHB1dC5wdXNoKCBpbnREYXRhKTtcblx0XHRcdFx0bGVuZ3RoLS07XG5cdFx0XHR9XG5cdFx0XHR3aGlsZSAobGVuZ3RoID4gMCk7XG5cdFx0XHRyZXR1cm4gb3V0cHV0O1xuXHRcdH1cbiAgICB0aGlzLmdldEthbmppU3RyaW5nPWZ1bmN0aW9uKCBkYXRhTGVuZ3RoKVxuXHRcdHtcblx0XHRcdHZhciBsZW5ndGggPSBkYXRhTGVuZ3RoO1xuXHRcdFx0dmFyIGludERhdGEgPSAwO1xuXHRcdFx0dmFyIHVuaWNvZGVTdHJpbmcgPSBcIlwiO1xuXHRcdFx0ZG9cblx0XHRcdHtcblx0XHRcdFx0aW50RGF0YSA9IGdldE5leHRCaXRzKDEzKTtcblx0XHRcdFx0dmFyIGxvd2VyQnl0ZSA9IGludERhdGEgJSAweEMwO1xuXHRcdFx0XHR2YXIgaGlnaGVyQnl0ZSA9IGludERhdGEgLyAweEMwO1xuXG5cdFx0XHRcdHZhciB0ZW1wV29yZCA9IChoaWdoZXJCeXRlIDw8IDgpICsgbG93ZXJCeXRlO1xuXHRcdFx0XHR2YXIgc2hpZnRqaXNXb3JkID0gMDtcblx0XHRcdFx0aWYgKHRlbXBXb3JkICsgMHg4MTQwIDw9IDB4OUZGQylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIGJldHdlZW4gODE0MCAtIDlGRkMgb24gU2hpZnRfSklTIGNoYXJhY3RlciBzZXRcblx0XHRcdFx0XHRzaGlmdGppc1dvcmQgPSB0ZW1wV29yZCArIDB4ODE0MDtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBiZXR3ZWVuIEUwNDAgLSBFQkJGIG9uIFNoaWZ0X0pJUyBjaGFyYWN0ZXIgc2V0XG5cdFx0XHRcdFx0c2hpZnRqaXNXb3JkID0gdGVtcFdvcmQgKyAweEMxNDA7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL3ZhciB0ZW1wQnl0ZSA9IG5ldyBBcnJheSgwLDApO1xuXHRcdFx0XHQvL3RlbXBCeXRlWzBdID0gKHNieXRlKSAoc2hpZnRqaXNXb3JkID4+IDgpO1xuXHRcdFx0XHQvL3RlbXBCeXRlWzFdID0gKHNieXRlKSAoc2hpZnRqaXNXb3JkICYgMHhGRik7XG5cdFx0XHRcdC8vdW5pY29kZVN0cmluZyArPSBuZXcgU3RyaW5nKFN5c3RlbVV0aWxzLlRvQ2hhckFycmF5KFN5c3RlbVV0aWxzLlRvQnl0ZUFycmF5KHRlbXBCeXRlKSkpO1xuICAgICAgICAgICAgICAgIHVuaWNvZGVTdHJpbmcgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShzaGlmdGppc1dvcmQpO1xuXHRcdFx0XHRsZW5ndGgtLTtcblx0XHRcdH1cblx0XHRcdHdoaWxlIChsZW5ndGggPiAwKTtcblxuXG5cdFx0XHRyZXR1cm4gdW5pY29kZVN0cmluZztcblx0XHR9XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsXCJEYXRhQnl0ZVwiLCB7IGdldDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0dmFyIG91dHB1dCA9IG5ldyBBcnJheSgpO1xuXHRcdHZhciBNT0RFX05VTUJFUiA9IDE7XG5cdCAgICB2YXIgTU9ERV9ST01BTl9BTkRfTlVNQkVSID0gMjtcblx0ICAgIHZhciBNT0RFXzhCSVRfQllURSA9IDQ7XG5cdCAgICB2YXIgTU9ERV9LQU5KSSA9IDg7XG5cdFx0ZG9cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR2YXIgbW9kZSA9IHRoaXMuTmV4dE1vZGUoKTtcblx0XHRcdFx0XHRcdC8vY2FudmFzLnByaW50bG4oXCJtb2RlOiBcIiArIG1vZGUpO1xuXHRcdFx0XHRcdFx0aWYgKG1vZGUgPT0gMClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aWYgKG91dHB1dC5sZW5ndGggPiAwKVxuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdFx0dGhyb3cgXCJFbXB0eSBkYXRhIGJsb2NrXCI7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQvL2lmIChtb2RlICE9IDEgJiYgbW9kZSAhPSAyICYmIG1vZGUgIT0gNCAmJiBtb2RlICE9IDgpXG5cdFx0XHRcdFx0XHQvL1x0YnJlYWs7XG5cdFx0XHRcdFx0XHQvL31cblx0XHRcdFx0XHRcdGlmIChtb2RlICE9IE1PREVfTlVNQkVSICYmIG1vZGUgIT0gTU9ERV9ST01BTl9BTkRfTlVNQkVSICYmIG1vZGUgIT0gTU9ERV84QklUX0JZVEUgJiYgbW9kZSAhPSBNT0RFX0tBTkpJKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHQvKlx0XHRcdFx0XHRjYW52YXMucHJpbnRsbihcIkludmFsaWQgbW9kZTogXCIgKyBtb2RlKTtcblx0XHRcdFx0XHRcdFx0bW9kZSA9IGd1ZXNzTW9kZShtb2RlKTtcblx0XHRcdFx0XHRcdFx0Y2FudmFzLnByaW50bG4oXCJHdWVzc2VkIG1vZGU6IFwiICsgbW9kZSk7ICovXG5cdFx0XHRcdFx0XHRcdHRocm93IFwiSW52YWxpZCBtb2RlOiBcIiArIG1vZGUgKyBcIiBpbiAoYmxvY2s6XCIgKyB0aGlzLmJsb2NrUG9pbnRlciArIFwiIGJpdDpcIiArIHRoaXMuYml0UG9pbnRlciArIFwiKVwiO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZGF0YUxlbmd0aCA9IHRoaXMuZ2V0RGF0YUxlbmd0aChtb2RlKTtcblx0XHRcdFx0XHRcdGlmIChkYXRhTGVuZ3RoIDwgMSlcblx0XHRcdFx0XHRcdFx0dGhyb3cgXCJJbnZhbGlkIGRhdGEgbGVuZ3RoOiBcIiArIGRhdGFMZW5ndGg7XG5cdFx0XHRcdFx0XHQvL2NhbnZhcy5wcmludGxuKFwibGVuZ3RoOiBcIiArIGRhdGFMZW5ndGgpO1xuXHRcdFx0XHRcdFx0c3dpdGNoIChtb2RlKVxuXHRcdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRcdGNhc2UgTU9ERV9OVU1CRVI6XG5cdFx0XHRcdFx0XHRcdFx0Ly9jYW52YXMucHJpbnRsbihcIk1vZGU6IEZpZ3VyZVwiKTtcblx0XHRcdFx0XHRcdFx0XHR2YXIgdGVtcF9zdHIgPSB0aGlzLmdldEZpZ3VyZVN0cmluZyhkYXRhTGVuZ3RoKTtcblx0XHRcdFx0XHRcdFx0XHR2YXIgdGEgPSBuZXcgQXJyYXkodGVtcF9zdHIubGVuZ3RoKTtcblx0XHRcdFx0XHRcdFx0XHRmb3IodmFyIGo9MDtqPHRlbXBfc3RyLmxlbmd0aDtqKyspXG5cdFx0XHRcdFx0XHRcdFx0XHR0YVtqXT10ZW1wX3N0ci5jaGFyQ29kZUF0KGopO1xuXHRcdFx0XHRcdFx0XHRcdG91dHB1dC5wdXNoKHRhKTtcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdFx0XHRjYXNlIE1PREVfUk9NQU5fQU5EX05VTUJFUjpcblx0XHRcdFx0XHRcdFx0XHQvL2NhbnZhcy5wcmludGxuKFwiTW9kZTogUm9tYW4mRmlndXJlXCIpO1xuXHRcdFx0XHRcdFx0XHRcdHZhciB0ZW1wX3N0ciA9IHRoaXMuZ2V0Um9tYW5BbmRGaWd1cmVTdHJpbmcoZGF0YUxlbmd0aCk7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIHRhID0gbmV3IEFycmF5KHRlbXBfc3RyLmxlbmd0aCk7XG5cdFx0XHRcdFx0XHRcdFx0Zm9yKHZhciBqPTA7ajx0ZW1wX3N0ci5sZW5ndGg7aisrKVxuXHRcdFx0XHRcdFx0XHRcdFx0dGFbal09dGVtcF9zdHIuY2hhckNvZGVBdChqKTtcblx0XHRcdFx0XHRcdFx0XHRvdXRwdXQucHVzaCh0YSApO1xuXHRcdFx0XHRcdFx0XHRcdC8vb3V0cHV0LldyaXRlKFN5c3RlbVV0aWxzLlRvQnl0ZUFycmF5KHRlbXBfc2J5dGVBcnJheTIpLCAwLCB0ZW1wX3NieXRlQXJyYXkyLmxlbmd0aCk7XG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRcdFx0Y2FzZSBNT0RFXzhCSVRfQllURTpcblx0XHRcdFx0XHRcdFx0XHQvL2NhbnZhcy5wcmludGxuKFwiTW9kZTogOGJpdCBCeXRlXCIpO1xuXHRcdFx0XHRcdFx0XHRcdC8vc2J5dGVbXSB0ZW1wX3NieXRlQXJyYXkzO1xuXHRcdFx0XHRcdFx0XHRcdHZhciB0ZW1wX3NieXRlQXJyYXkzID0gdGhpcy5nZXQ4Yml0Qnl0ZUFycmF5KGRhdGFMZW5ndGgpO1xuXHRcdFx0XHRcdFx0XHRcdG91dHB1dC5wdXNoKHRlbXBfc2J5dGVBcnJheTMpO1xuXHRcdFx0XHRcdFx0XHRcdC8vb3V0cHV0LldyaXRlKFN5c3RlbVV0aWxzLlRvQnl0ZUFycmF5KHRlbXBfc2J5dGVBcnJheTMpLCAwLCB0ZW1wX3NieXRlQXJyYXkzLmxlbmd0aCk7XG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRcdFx0Y2FzZSBNT0RFX0tBTkpJOlxuXHRcdFx0XHRcdFx0XHRcdC8vY2FudmFzLnByaW50bG4oXCJNb2RlOiBLYW5qaVwiKTtcblx0XHRcdFx0XHRcdFx0XHQvL3NieXRlW10gdGVtcF9zYnl0ZUFycmF5NDtcblx0XHRcdFx0XHRcdFx0XHQvL3RlbXBfc2J5dGVBcnJheTQgPSBTeXN0ZW1VdGlscy5Ub1NCeXRlQXJyYXkoU3lzdGVtVXRpbHMuVG9CeXRlQXJyYXkoZ2V0S2FuamlTdHJpbmcoZGF0YUxlbmd0aCkpKTtcblx0XHRcdFx0XHRcdFx0XHQvL291dHB1dC5Xcml0ZShTeXN0ZW1VdGlscy5Ub0J5dGVBcnJheSh0ZW1wX3NieXRlQXJyYXk0KSwgMCwgdGVtcF9zYnl0ZUFycmF5NC5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGVtcF9zdHIgPSB0aGlzLmdldEthbmppU3RyaW5nKGRhdGFMZW5ndGgpO1xuXHRcdFx0XHRcdFx0XHRcdG91dHB1dC5wdXNoKHRlbXBfc3RyKTtcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Ly9cblx0XHRcdFx0XHRcdC8vY2FudmFzLnByaW50bG4oXCJEYXRhTGVuZ3RoOiBcIiArIGRhdGFMZW5ndGgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR3aGlsZSAodHJ1ZSk7XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fX0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cz1RckNvZGU7XG4iLCJ2YXIgUVJDb2RlUmVhZGVyID0gcmVxdWlyZSgncXJjb2RlLXJlYWRlcicpO1xuXG52YXIgdmlkZW8gID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbWVyYScpO1xudmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdxci1jYW52YXMnKTtcbnZhciBjdHggICAgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuLy8gVGVtcG9yYXJ5IGhhY2ssIHNldCB0byByb29tYmEgY29tcHV0ZXIuXG4vLyBSb2JvdCBkb2VzIG5vdCBoYXZlIHJvc3NzZXJ2ZXIuXG52YXIgcm9zID0gbmV3IFJPU0xJQi5Sb3Moe1xuICAgIHVybCA6ICd3c3M6Ly9yb29tYmEuY3Mud2FzaGluZ3Rvbi5lZHU6OTA5MCdcbn0pO1xuXG5yb3Mub24oJ2Vycm9yJywgZnVuY3Rpb24oZXJyKSB7XG4gICAgY29uc29sZS5sb2coZXJyKTtcbn0pO1xuXG5yb3Mub24oJ2Nvbm5lY3Rpb24nLCBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZygnQ29ubmVjdGVkIHRvIHdlYnNvY2tldCBzZXJ2ZXIuJyk7XG59KTtcblxudmFyIHFyX2NvZGVfdG9waWMgPSBuZXcgUk9TTElCLlRvcGljKHtcbiAgICByb3MgOiByb3MsXG4gICAgbmFtZSA6ICcvamVldmVzX3FyX2NvZGUnLFxuICAgIG1lc3NhZ2VUeXBlIDogJ2plZXZlcy9PcmRlcidcbn0pO1xuXG5uYXZpZ2F0b3IuZ2V0VXNlck1lZGlhID0gbmF2aWdhdG9yLmdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3Iud2Via2l0R2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci5tb3pHZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLm1zR2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci5vR2V0VXNlck1lZGlhO1xuXG5pZiAobmF2aWdhdG9yLmdldFVzZXJNZWRpYSkge1xuICAgIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEoe3ZpZGVvOiB0cnVlfSwgaGFuZGxlVmlkZW8sIHZpZGVvRXJyb3IpO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVWaWRlbyhzdHJlYW0pIHtcbiAgICB2aWRlby5zcmMgPSB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChzdHJlYW0pO1xufVxuXG5mdW5jdGlvbiB2aWRlb0Vycm9yKGUpIHtcbiAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAvLyBkbyBzb21ldGhpbmdcbn1cblxudmFyIHJlYWRlciA9IG5ldyBRUkNvZGVSZWFkZXIoKTtcbnJlYWRlci5jYWxsYmFjayA9IGZ1bmN0aW9uIChyZXMpIHtcbiAgY29uc29sZS5sb2cocmVzKTtcbn07XG5cbnZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ3BsYXknLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyICR0aGlzID0gdGhpczsgLy9jYWNoZVxuICAgIHdpZHRoID0gdmlkZW8uY2xpZW50V2lkdGg7XG4gICAgaGVpZ2h0ID0gdmlkZW8uY2xpZW50SGVpZ2h0O1xuICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgKGZ1bmN0aW9uIGxvb3AoKSB7XG4gICAgICAgIGlmICghJHRoaXMucGF1c2VkICYmICEkdGhpcy5lbmRlZCkge1xuICAgICAgICAgICAgY3R4LmRyYXdJbWFnZSgkdGhpcywgMCwgMCk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGxvb3AsIDEwMDAgLyAzMCk7IC8vIGRyYXdpbmcgYXQgMzBmcHNcbiAgICAgICAgICAgIHJlYWRlci5kZWNvZGUoKTtcbiAgICAgICAgfVxuICAgIH0pKCk7XG59LCAwKTtcblxuZnVuY3Rpb24gcXJfY2FsbGJhY2socmVzKSB7XG4gICAgICB2YXIgZGF0YSA9IHJlcy5zcGxpdCgnLCcpO1xuICAgICAgaWYgKGRhdGEubGVuZ3RoID09IDQpIHtcbiAgICAgICAgICB2YXIgbmFtZSA9IGRhdGFbMF07XG4gICAgICAgICAgdmFyIHBob25lID0gZGF0YVsxXTtcbiAgICAgICAgICB2YXIgbG9jYXRpb24gPSBkYXRhWzJdO1xuICAgICAgICAgIHZhciBmb29kVHlwZSA9IGRhdGFbM107XG4gICAgICAgICAgY29uc29sZS5sb2cocmVzKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhuYW1lKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhsb2NhdGlvbik7XG4gICAgICAgICAgY29uc29sZS5sb2coZm9vZFR5cGUpO1xuICAgICAgICAgIHZhciBvcmRlciA9IG5ldyBST1NMSUIuTWVzc2FnZSh7XG4gICAgICAgICAgICAgIG5hbWUgOiBuYW1lLFxuICAgICAgICAgICAgICBwaG9uZV9udW1iZXI6IHBob25lLFxuICAgICAgICAgICAgICBsb2NhdGlvbjogbG9jYXRpb24sXG4gICAgICAgICAgICAgIGZvb2RfdHlwZTogZm9vZFR5cGVcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBxcl9jb2RlX3RvcGljLnB1Ymxpc2gob3JkZXIpO1xuICAgICAgfVxufVxuIl19
