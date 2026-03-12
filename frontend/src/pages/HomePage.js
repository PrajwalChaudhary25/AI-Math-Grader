import React from "react";
import { useNavigate } from "react-router-dom";

function HomeSection() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col justify-center items-center gap-6 sm:gap-2">
      <div className="flex flex-col justify-center items-center gap-6">
        <div className="flex justify-center items-center mt-5 sm:mt-3">
          <img
            src="/images/Hero.png"
            alt="Hero"
            className="h-[260px] w-[300px] sm:w-[600px] sm:h-[403px]"
          ></img>
        </div>

        <div className="sm:text-[28px] text-[22px] text-[#16610E] text-center">
          <p>Stepwise Grading and Feedback</p>
          <p>System</p>
        </div>

        <button
          className="px-10 py-2 bg-[#FFA500] text-black text-[20px] rounded-3xl hover:bg-[#6b4703] hover:text-white active:scale-110 transition duration-300"
          onClick={() => navigate("/select-input-options")}
        >
          Get Started
        </button>
      </div>

      {/* Scope of the Project Section */}
      <div className="flex flex-col justify-center items-center gap-6 mt-4 sm:mt-36 mx-3 bg-slate-300 w-full rounded-lg py-10 rounded-t-3xl">
        <h2 className="sm:text-[28px] text-[22px] text-black text-center">
          Scope of the Project
        </h2>
        <div className="mt-[-20px] mb-5 min-w-28 h-[5px] bg-[#16610E] rounded-xl"></div>
        <div className="flex flex-col flex-wrap sm:flex-row justify-center items-center gap-16" >
          {/* Cards for the scope of the project*/}
          <div className="bg-[#FFA500] p-3 rounded-lg hover:scale-105 transition duration-900">
            <p className="text-[20px] text-black text-center mb-2">
              Equation
            </p>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/e/e8/Equation_vs_Expression.png"
              alt="Equation"
              className="h-[150px] w-[200px] sm:w-[300px] sm:h-[250px] bg-slate-200"
            ></img>
          </div>

          <div className="bg-[#FFA500] p-3 rounded-lg hover:scale-105 transition duration-900">
            <p className="text-[20px] text-black text-center mb-2">
              Logarithm
            </p>
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJCKdgcT4_Y2cZ35JLhvR45BASBi7A4_dffw&s"
              alt="Logarithm"
              className="h-[150px] w-[200px] sm:w-[300px] sm:h-[250px] bg-slate-200"
            ></img>
          </div>

          <div className="bg-[#FFA500] p-3 rounded-lg hover:scale-105 transition duration-900">
            <p className="text-[20px] text-black text-center mb-2">
              Simplify
            </p>
            <img
              src="https://i.pinimg.com/736x/59/d9/eb/59d9eb852c6c24638320e972a3a61179.jpg"
              alt="Simplify"
              className="h-[150px] w-[200px] sm:w-[300px] sm:h-[250px] bg-slate-200"
            ></img>
          </div>
        </div>
      </div>

      <footer className="flex flex-col justify-center items-center bg-black w-full py-5 mt-[-8px]">
        <p className="text-[16px] sm:text-[20px] text-white mt-10 mb-5">
          &copy; 2026 Stepwise Grading and Feedback System. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default HomeSection;
