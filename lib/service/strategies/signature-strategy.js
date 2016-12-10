"use strict";

const HeaderStrategy = require("./header-strategy.js");
const IconTables = require("../icon-tables.js");
const Options = require("../../options.js");


class SignatureStrategy extends HeaderStrategy {
	
	constructor(){
		super({
			name:         "signature",
			priority:     0,
			ignoreBinary: false,
			noSetting:    true
		});
	}
	
	
	/**
	 * Avoid scanning if header-recognition is disabled.
	 *
	 * @param {Resource} file
	 * @return {Boolean}
	 */
	needToScan(file){
		return (Options.hashbangs || Options.modelines)
			? super.needToScan(file)
			: false;
	}
	
	
	matchIcon(resource){
		const {data} = resource;
		if(!data) return null;
		
		const signatures = [
			[".3gp",  /^.{4}ftyp3g/],
			[".7z",   /^7z\xBC\xAF\x27\x1C/],
			[".avi",  /^MLVI/],
			[".bgp",  /^BPG\xFB/],
			[".bin",  /^\xCA\xFE(\xBA\xBE|\xD0\x0D)/],
			[".cin",  /^\x80\x2A\x5F\xD7/],
			[".crx",  /^Cr24/],
			[".djvu", /^AT&TFORM/],
			[".dll",  /^PMOCCMOC/],
			[".dmg",  /^\x78\x01\x73\x0D\x62\x62\x60/],
			[".dpx",  /^(SDPX|XPDS)/],
			[".elf",  /^\x7FELF/],
			[".exr",  /^v\/1\x01/],
			[".flac", /^fLaC/],
			[".flif", /^FLIF/],
			[".gif",  /^GIF8[97]a/],
			[".gz",   /^\x1F\x8B/],
			[".ico",  /^\0{2}\x01\0/],
			[".iso",  /^\x45\x52\x02\0{3}|^\x8B\x45\x52\x02/],
			[".jpg",  /^\xFF\xD8\xFF[\xDB\xE0\xE1]|(JFIF|Exif)\0|^\xCF\x84\x01|^\xFF\xD8.+\xFF\xD9$/],
			[".lz",   /^LZIP/],
			[".mid",  /^MThd/],
			[".mp3",  /^\xFF\xFB|^ID3/],
			[".ogg",  /^OggS/],
			[".pdf",  /^%PDF/],
			[".png",  /^\x89PNG\r\n\x1A\n/],
			[".ps",   /^%!PS/],
			[".psd",  /^8BPS/],
			[".rar",  /^Rar!\x1A\x07\x01?\0/],
			[".tif",  /^II\x2A\0|^MM\0\x2A/],
			[".txt",  /^\xEF\xBB\xBF|^\xFF\xFE/],
			[".wasm", /^\0asm/],
			[".wav",  /^RIFF/],
			[".webm", /^\x1A\x45\xDF\xA3/],
			[".wma",  /^\x30\x26\xB2\x75\x8E\x66\xCF\x11\xA6\xD9\x00\xAA\x00\x62\xCE\x6C/],
			[".woff", /^wOFF/],
			[".woff2",/^wOF2/],
			[".xar",  /^xar!/],
			[".xml",  /^<\?xml /],
			[".zip",  /^(\x50\x4B(\x03\x04|\x05\x06|\x07|\x08)|\x1F[\x9D\xA0]|BZh|RNC[\x01\x02]|\xD0\xCF\x11\xE0)/],
			["z.a",   /\0/]
		];
		
		for(const [type, header] of signatures)
			if(header.test(data))
				return IconTables.matchName(type);
		return null;
	}
}


module.exports = new SignatureStrategy();
