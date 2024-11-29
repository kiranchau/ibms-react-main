/* eslint-disable jsx-a11y/alt-text */
import React, { useState } from "react";

function UploadFile() {
	const [file, setFile] = useState();
	function handleChange(e) {
		setFile(URL.createObjectURL(e.target.files[0]));
	}

	return (
	<>
  	<div className="">
			<input type="file" onChange={handleChange} />
		
		</div>
    	<img src={file} />
  </>
	);
}

export default UploadFile;
