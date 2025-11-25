import React from 'react';
import { useNavigate } from 'react-router-dom';

function SelectInputType(){
    const navigate = useNavigate();

    const handleClick = (option)=> {
        if(option === "Q+A") 
        {
        navigate(`/upload/${"Q+A"}`);
        } 
        else 
        {
            navigate(`/upload/${"Q A"}`);
        }
        console.log("Selected option: ", option);
    }

    return (
        <div className="flex flex-col justify-center items-center gap-y-10 p-10 h-[500px] mt-8">

            <h1 className="sm:text-[28px] text-[22px] text-[#16610E] text-center">
                What type of Input do you have?
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <button className="px-10 h-[130px] w-[280px] sm:h-[220px] sm:w-[250px] py-2 bg-[#FFA500] text-black text-[20px] rounded-3xl hover:bg-[#6b4703] hover:text-white active:scale-110 transition duration-300" onClick={() => handleClick("Q+A")}>
                Handwritten Question and Solution on same page
                </button>

                <button className="px-10 h-[130px] w-[280px] sm:h-[220px] sm:w-[250px] py-2 bg-[#FFA500] text-black text-[20px] rounded-3xl hover:bg-[#6b4703] hover:text-white active:scale-110 transition duration-300" onClick={() => handleClick("Q A")}>
                    Printed Question and Handwritten Solution on different page
                </button>
                       
            </div>        
            
        </div>
    )
}

export default SelectInputType;