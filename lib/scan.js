"use strict";

const fs = require("fs");


module.exports = function(files){
	const done     = this.async();
	const scans    = [];
	
	const {length} = files;
	for(let i = 0; i < length; ++i){
		
		scans.push(new Promise(resolve => {
			const [path, maxScanSize] = files[i];
			const fd     = fs.openSync(path, "r");
			const buffer = Buffer.alloc(maxScanSize);
			
			fs.read(fd, buffer, 0, maxScanSize, null, (error, bytesRead, data) => {
				let hasFullData = false;
				let isBinary = null;
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
				resolve();
			});
		}).catch(error => {
			const [path] = files[i];
			emit("scan-error", path, error);
		}));
	}
	
	return Promise.all(scans).then(_=> done());
};
