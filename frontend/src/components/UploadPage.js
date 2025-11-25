import React from 'react';
import SingleImageUpload from './Drag&DropUpload';


function UploadPage(){

    const handleUpload = (file) => {
    console.log("Image selected:", file);
    // Further processing can be done here

    };

    return (
        <div>
            <SingleImageUpload onUpload={handleUpload} headerText={"dssdsds"} /> 
        </div>
    )
}

export default UploadPage;