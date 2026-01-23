import React from "react";

function DisplayResult(props) {
    
    return (
        <div>
        <h1>{props.title}</h1>
        {props.data}
        </div>
    );
}

export default DisplayResult;