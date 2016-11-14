"use strict";

const fs = require("fs");


module.exports = function(files){
	const {length} = files;
	
	for(let i = 0; i < length; ++i){
		const [path, maxScanSize] = files[i];
		
		try{
			let isBinary = null;
			let hasFullData = false;
			let data = Buffer.alloc(maxScanSize);

			const fd = fs.openSync(path, "r");
			const bytesRead = fs.readSync(fd, data, 0, maxScanSize);
			data = data.toString();
			
			// Strip null-bytes padding short file-chunks
			if(bytesRead < data.length){
				data = data.replace(/\x00+$/, "");
				hasFullData = true;
			}
			
			// Contains null-bytes; probably a binary file.
			if(/\x00/.test(data))
				isBinary = true;
			
			emit("scan-success", path, {hasFullData, isBinary, data});
			fs.closeSync(fd);
		}
		
		catch(error){
			emit("scan-error", path, error);
		}
	}
};
