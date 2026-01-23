import React, { use } from 'react';
import { useLocation } from 'react-router-dom';
import DisplayResult from '../components/DisplayResult';
import { useEffect, useState } from 'react';

export default function IntermediateResultPage() {
    const location = useLocation();
    const latexData = location.state?.latex || "";
    const [preprocessingResult, setResult] = useState("null");

    useEffect(() => {
        const callAPI = async () => {
            try{
                const res = await fetch("http://127.0.0.1:5000/preprocess",{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ latex: latexData }),
                });
            const data = await res.json();
            console.log("preprocessing result:", data);
            setResult(data['steps']);
            }
            
            catch (error) {
            console.error("Error fetching preprocessing result:", error);
        }}

        callAPI();  
    }, []);

    return (
        <div>
            <DisplayResult data={preprocessingResult} title={"Preprocessing Module Output"} />
        </div>
    );
}

