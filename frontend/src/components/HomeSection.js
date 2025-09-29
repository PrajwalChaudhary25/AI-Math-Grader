import React from 'react';
import { useNavigate } from 'react-router-dom';

function HomeSection(){
    const navigate = useNavigate();
    return (
        <div className="flex flex-col justify-center items-center gap-2 pb-10">

            <div className="flex justify-center items-center mt-3">
                <img src="/images/Hero.png" alt="Hero" width="600px" height="300px"></img>
            </div>

            <div className="text-[28px] text-[#16610E] text-center"> 
                <p>Stepwise Grading and Feedback</p>
                <p>System</p>
            </div>

            <button 
            className="px-10 py-2 bg-[#FFA500] text-black text-[20px] rounded-3xl hover:bg-[#6b4703] hover:text-white active:scale-110 transition duration-300"
            onClick={() => navigate('/result')}>
                Get Started
            </button>
            
        </div>
    );
}
 
export default HomeSection;